/**
 * FuelGuard Virtual Test Bench — Máquina de Estados do Firmware ESP32-S3
 * Orquestra as leituras de sensores a 5 Hz, debounce a 50 Hz, controle do LED e console UART.
 */

import { MedianFilter, FilterResult } from './median-filter';
import { AcousticModel, AcousticEchoResult } from '../physics/acoustic';
import { TankGeometry } from '../physics/tank-geometry';
import { VirtualReedSwitch } from '../components/reed-switch';
import { VirtualPN532 } from '../components/pn532';
import { MonotonicEventBus } from '../bus/event-bus';

export type McuState = 'BOOT' | 'IDLE' | 'MEASURING' | 'ALERT_TAMPER' | 'ALERT_SENSOR';

export interface McuTelemetrySnapshot {
  state: McuState;
  simTimeMs: number;
  rawDistanceCm: number;
  filteredDistanceCm: number;
  waterHeightCm: number;
  volumeL: number;
  percentage: number;
  isLidClosed: boolean;
  isNfcSessionActive: boolean;
  ledActive: boolean;
  inBlindZone: boolean;
  echoValid: boolean;
  temperatureC: number;
  soundSpeedMps: number;
}

export class McuStateMachine {
  private state: McuState = 'BOOT';
  private medianFilter: MedianFilter;
  private acousticModel: AcousticModel;
  private tankGeometry: TankGeometry;
  private reedSwitch: VirtualReedSwitch;
  private nfcModule: VirtualPN532;
  private eventBus: MonotonicEventBus;

  // Timers em microssegundos / milissegundos
  private lastPingTimeMs: number = 0;
  private pingIntervalMs: number = 200; // 5 Hz (amostragem a cada 200 ms)

  // Últimas leituras estáveis
  private latestSnapshot: McuTelemetrySnapshot;

  constructor(
    eventBus: MonotonicEventBus,
    acousticModel: AcousticModel,
    tankGeometry: TankGeometry,
    reedSwitch: VirtualReedSwitch,
    nfcModule: VirtualPN532
  ) {
    this.eventBus = eventBus;
    this.acousticModel = acousticModel;
    this.tankGeometry = tankGeometry;
    this.reedSwitch = reedSwitch;
    this.nfcModule = nfcModule;
    this.medianFilter = new MedianFilter(5, 15.0);

    this.latestSnapshot = {
      state: 'BOOT',
      simTimeMs: 0,
      rawDistanceCm: 42.3,
      filteredDistanceCm: 42.3,
      waterHeightCm: 57.7,
      volumeL: 577,
      percentage: 57.7,
      isLidClosed: true,
      isNfcSessionActive: false,
      ledActive: true,
      inBlindZone: false,
      echoValid: true,
      temperatureC: 24.8,
      soundSpeedMps: 346.0,
    };
  }

  public boot(currentTimeMs: number): void {
    this.state = 'IDLE';
    this.eventBus.emit('uart.tx', currentTimeMs, 'firmware', {
      channel: 'UART0',
      baud: 115200,
      message: '[SYSTEM] ESP32-S3 WROOM-1 boot complete (FreeRTOS v10.4.3). Relógio sincronizado.',
      level: 'SYSTEM',
    });
    this.eventBus.emit('uart.tx', currentTimeMs, 'firmware', {
      channel: 'UART0',
      baud: 115200,
      message: '[FW] Periféricos inicializados: SPI (PN532 @ 4MHz), GPIO5 (TRIG), GPIO6 (ECHO), GPIO7 (Reed).',
      level: 'INFO',
    });
  }

  /**
   * Ciclo de execução monotônico chamado a cada tick de 20 ms do simulador.
   * @param currentTimeMs Tempo virtual decorrido.
   * @param targetWaterHeightCm Altura física atual da água no recipiente.
   * @param ambientTempC Temperatura ambiente do ar.
   * @param surfaceDisturbanceCm Ondas ou perturbação superficial.
   */
  public tick(
    currentTimeMs: number,
    targetWaterHeightCm: number,
    ambientTempC: number = 24.8,
    surfaceDisturbanceCm: number = 0.0
  ): McuTelemetrySnapshot {
    // 1. Atualiza debounce do Reed Switch a 50 Hz
    const reedUpdate = this.reedSwitch.update(currentTimeMs);
    if (reedUpdate.stateChanged) {
      const isClosed = reedUpdate.currentDebounced;
      this.eventBus.emit('lid.state_change', currentTimeMs, 'hardware_model', {
        is_open: !isClosed,
        raw_pin_state: isClosed ? 0 : 1,
        debounce_active: false,
        bounces_count: this.reedSwitch.getStatus().bouncesRecorded,
      });

      this.eventBus.emit('uart.tx', currentTimeMs, 'firmware', {
        channel: 'UART0',
        baud: 115200,
        message: `[REED] Estado alterado para ${isClosed ? 'FECHADO' : 'ABERTO'} após 50ms debounce (${this.reedSwitch.getStatus().bouncesRecorded} repiques).`,
        level: isClosed ? 'INFO' : 'WARN',
      });

      // Se a tampa abriu sem sessão NFC ativa -> alerta de violação
      if (!isClosed && !this.nfcModule.isSessionActive()) {
        this.transitionTo('ALERT_TAMPER', currentTimeMs, 'Tampa aberta sem autenticação prévia de operador!');
      } else if (isClosed && this.state === 'ALERT_TAMPER') {
        this.transitionTo('MEASURING', currentTimeMs, 'Tampa restabelecida.');
      }
    }

    // 2. Disparo periódico do Sensor Ultrassônico JSN-SR04T a 5 Hz (200 ms)
    const timeSinceLastPing = currentTimeMs - this.lastPingTimeMs;
    if (timeSinceLastPing >= this.pingIntervalMs) {
      this.lastPingTimeMs = currentTimeMs;

      // Distância física real da face do transdutor à água: d = Href - h
      const trueDistCm = this.tankGeometry.waterHeightToDistance(targetWaterHeightCm);

      // Simulação do pulso de eco no modelo acústico
      const pingResult: AcousticEchoResult = this.acousticModel.simulatePing(
        trueDistCm,
        ambientTempC,
        surfaceDisturbanceCm
      );

      this.eventBus.emit('acoustic.ping_result', currentTimeMs, 'hardware_model', {
        echo_time_us: pingResult.echoTimeUs,
        measured_cm: pingResult.measuredDistanceCm,
        quality: pingResult.qualityFactor,
        attenuation_db: pingResult.attenuationDb,
      });

      // Se o transdutor entrou em zona cega (< 20 cm)
      if (pingResult.inBlindZone) {
        if (this.state !== 'ALERT_SENSOR' && this.state !== 'ALERT_TAMPER') {
          this.transitionTo('ALERT_SENSOR', currentTimeMs, 'Sensor na Zona Cega (< 20 cm). Eco saturado!');
        }
      } else if (this.state === 'ALERT_SENSOR' && !pingResult.inBlindZone) {
        this.transitionTo('MEASURING', currentTimeMs, 'Distância restabelecida acima de 20 cm.');
      }

      // Aplica o Filtro Mediano de 5 Amostras no firmware
      const filterResult: FilterResult = this.medianFilter.addSample(
        pingResult.measuredDistanceCm
      );

      // Calcula o nível da água filtrado e o volume
      const measuredDist = filterResult.median;
      const calculatedHeight = this.tankGeometry.distanceToWaterHeight(measuredDist);
      const volumeL = this.tankGeometry.calculateCalibratedVolume(calculatedHeight);
      const percentage = Number(((calculatedHeight / this.tankGeometry.getHref()) * 100).toFixed(1));

      // Emite evento oficial no barramento
      this.eventBus.emit('tank.level_update', currentTimeMs, 'firmware', {
        raw_distance_cm: pingResult.measuredDistanceCm,
        filtered_distance_cm: measuredDist,
        water_height_cm: calculatedHeight,
        volume_liters: volumeL,
        percentage,
        in_blind_zone: pingResult.inBlindZone,
        echo_valid: pingResult.echoValid,
        temperature_c: ambientTempC,
        sound_speed_mps: pingResult.soundSpeedMps,
      });

      // Emite log UART de telemetria a cada ciclo nominal
      const statusTag = pingResult.echoValid ? 'VALID' : 'INVALID';
      this.eventBus.emit('uart.tx', currentTimeMs, 'firmware', {
        channel: 'UART0',
        baud: 115200,
        message: `[FW] JSN ping: echo=${pingResult.echoTimeUs}us dist=${pingResult.measuredDistanceCm}cm quality=${statusTag} -> Median=${measuredDist}cm h=${calculatedHeight.toFixed(1)}cm vol=${volumeL}L`,
        level: pingResult.echoValid ? 'INFO' : 'WARN',
      });

      // Atualiza o snapshot do MCU
      this.latestSnapshot = {
        state: this.state,
        simTimeMs: currentTimeMs,
        rawDistanceCm: pingResult.measuredDistanceCm,
        filteredDistanceCm: measuredDist,
        waterHeightCm: calculatedHeight,
        volumeL,
        percentage,
        isLidClosed: this.reedSwitch.isLidClosed(),
        isNfcSessionActive: this.nfcModule.isSessionActive(),
        ledActive: this.state === 'MEASURING' || this.state === 'IDLE',
        inBlindZone: pingResult.inBlindZone,
        echoValid: pingResult.echoValid,
        temperatureC: ambientTempC,
        soundSpeedMps: pingResult.soundSpeedMps,
      };
    }

    return this.latestSnapshot;
  }

  private transitionTo(newState: McuState, currentTimeMs: number, reason: string): void {
    if (this.state === newState) return;
    const oldState = this.state;
    this.state = newState;

    this.eventBus.emit('firmware.state_change', currentTimeMs, 'firmware', {
      previous_state: oldState,
      new_state: newState,
      reason,
    });

    this.eventBus.emit('uart.tx', currentTimeMs, 'firmware', {
      channel: 'UART0',
      baud: 115200,
      message: `[STATE] Transição ${oldState} -> ${newState}. Motivo: ${reason}`,
      level: newState.startsWith('ALERT') ? 'WARN' : 'INFO',
    });
  }

  public getState(): McuState {
    return this.state;
  }

  public getLatestSnapshot(): McuTelemetrySnapshot {
    return this.latestSnapshot;
  }
}
