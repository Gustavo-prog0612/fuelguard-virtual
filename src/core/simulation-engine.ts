/**
 * FuelGuard Virtual Test Bench — Motor de Simulação Determinístico (Núcleo M2)
 * Executa o loop físico e o firmware em passos fixos de 20 ms (50 Hz).
 * Desacoplado 100% da interface do usuário (compatível com Web Worker ou Main Thread).
 */

import { MonotonicEventBus } from './bus/event-bus';
import { AcousticModel } from './physics/acoustic';
import { TankGeometry } from './physics/tank-geometry';
import { SloshDampingModel } from './physics/slosh-damping';
import { VirtualReedSwitch } from './components/reed-switch';
import { VirtualPN532 } from './components/pn532';
import { McuStateMachine, McuTelemetrySnapshot } from './firmware-logic/mcu-state-machine';
import { BUILT_IN_SCENARIOS } from './scenarios/built-in-scenarios';

export interface SimulationConfig {
  seed: number;
  fixedDeltaMs: number; // Padrão: 20 ms (50 Hz)
  ambientTempC: number;
  noiseStdDevCm: number;
}

export interface InjectedFault {
  id: string;
  name: string;
  active: boolean;
  description: string;
}

export class SimulationEngine {
  public static readonly DEFAULT_DELTA_MS = 20;

  // Estado do Relógio Virtual
  private simTimeMs: number = 0;
  private seed: number;

  // Submódulos Físicos e Lógicos
  private eventBus: MonotonicEventBus;
  private acousticModel: AcousticModel;
  private tankGeometry: TankGeometry;
  private sloshModel: SloshDampingModel;
  private reedSwitch: VirtualReedSwitch;
  private nfcModule: VirtualPN532;
  private mcu: McuStateMachine;

  // Variáveis Físicas do Ensaio
  private currentWaterHeightCm: number = 57.7;
  private ambientTempC: number = 24.8;
  private activeScenarioId: string = 'nominal';

  // Falhas Injetadas Ativas
  private injectedFaults: Map<string, InjectedFault> = new Map();

  constructor(config?: Partial<SimulationConfig>) {
    this.seed = config?.seed ?? 42;
    this.ambientTempC = config?.ambientTempC ?? 24.8;

    this.eventBus = new MonotonicEventBus();
    this.acousticModel = new AcousticModel(this.seed);
    this.tankGeometry = new TankGeometry();
    this.sloshModel = new SloshDampingModel(2.5, 0.08);
    this.reedSwitch = new VirtualReedSwitch();
    this.nfcModule = new VirtualPN532();

    this.mcu = new McuStateMachine(
      this.eventBus,
      this.acousticModel,
      this.tankGeometry,
      this.reedSwitch,
      this.nfcModule
    );

    // Boot inicial
    this.mcu.boot(0);
  }

  /**
   * Executa um único passo de simulação discreto (DeltaT = 20 ms).
   */
  public step(deltaMs: number = SimulationEngine.DEFAULT_DELTA_MS): McuTelemetrySnapshot {
    this.simTimeMs += deltaMs;

    // 1. Calcula deslocamento de ondas de superfície se houver perturbação
    const timeSec = this.simTimeMs / 1000.0;
    const surfaceDisturbance = this.sloshModel.getDisplacement(timeSec);

    // 2. Executa o tick do firmware do microcontrolador
    const snapshot = this.mcu.tick(
      this.simTimeMs,
      this.currentWaterHeightCm,
      this.ambientTempC,
      surfaceDisturbance
    );

    // 3. Emite evento de batimento de relógio
    this.eventBus.emit('clock.tick', this.simTimeMs, 'system', {
      delta_ms: deltaMs,
      total_seconds: Math.floor(this.simTimeMs / 1000),
    });

    return snapshot;
  }

  /**
   * Carrega um cenário pré-configurado da Seção 11 do Briefing.
   */
  public loadScenario(scenarioId: string): boolean {
    const scenario = BUILT_IN_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return false;

    this.activeScenarioId = scenarioId;
    this.currentWaterHeightCm = scenario.initialWaterHeightCm;
    this.ambientTempC = scenario.temperatureC;
    this.eventBus.setTransportOnline(scenario.transportOnline);

    // Configura tampa
    this.reedSwitch.setLidState(scenario.initialLidClosed, this.simTimeMs);

    // Configura NFC
    if (scenario.initialNfcUid) {
      this.nfcModule.presentTagByUid(scenario.initialNfcUid, this.simTimeMs);
    } else {
      this.nfcModule.removeTag();
    }

    // Configura slosh
    if (scenario.initialSloshAmplitudeCm && scenario.initialSloshAmplitudeCm > 0) {
      this.sloshModel.triggerSlosh(scenario.initialSloshAmplitudeCm, this.simTimeMs / 1000.0);
    } else {
      this.sloshModel.reset();
    }

    this.eventBus.emit('uart.tx', this.simTimeMs, 'system', {
      channel: 'UART0',
      baud: 115200,
      message: `[SCENARIO] Carregado: ${scenario.name} (Seed=${this.seed})`,
      level: 'INFO',
    });

    return true;
  }

  // Estímulos em tempo real
  public setWaterHeight(heightCm: number): void {
    const prev = this.currentWaterHeightCm;
    this.currentWaterHeightCm = Math.max(0, Math.min(this.tankGeometry.getHref(), heightCm));

    // Se houve mudança brusca (> 5 cm), induz pequeno slosh proporcional
    const delta = Math.abs(this.currentWaterHeightCm - prev);
    if (delta > 5.0) {
      this.sloshModel.triggerSlosh(Math.min(6.0, delta * 0.4), this.simTimeMs / 1000.0);
    }
  }

  public setAmbientTemperature(tempC: number): void {
    this.ambientTempC = tempC;
  }

  public triggerSloshImpulse(amplitudeCm: number = 4.0): void {
    this.sloshModel.triggerSlosh(amplitudeCm, this.simTimeMs / 1000.0);
    this.eventBus.emit('uart.tx', this.simTimeMs, 'user', {
      channel: 'UART0',
      baud: 115200,
      message: `[STIMULUS] Superfície agitada: impulso inicial de ${amplitudeCm} cm`,
      level: 'INFO',
    });
  }

  public toggleLid(): boolean {
    const isCurrentlyClosed = this.reedSwitch.isLidClosed();
    const target = !isCurrentlyClosed;
    this.reedSwitch.setLidState(target, this.simTimeMs);
    return target;
  }

  public presentNfcTag(uid: string): { authorized: boolean; name: string } {
    const res = this.nfcModule.presentTagByUid(uid, this.simTimeMs);
    if (res.isAuthorized) {
      this.eventBus.emit('nfc.tag_read', this.simTimeMs, 'hardware_model', {
        uid: res.tag.uid,
        card_type: 'MIFARE Classic 1K',
        authorized: true,
        operator_name: res.tag.name,
      });
      this.eventBus.emit('uart.tx', this.simTimeMs, 'firmware', {
        channel: 'UART0',
        baud: 115200,
        message: `[PN532] Tag autorizada detectada: UID=${res.tag.uid} (${res.tag.name})`,
        level: 'INFO',
      });
    } else {
      this.eventBus.emit('nfc.denied', this.simTimeMs, 'hardware_model', {
        uid: res.tag.uid,
        card_type: 'Desconhecido',
        authorized: false,
      });
      this.eventBus.emit('uart.tx', this.simTimeMs, 'firmware', {
        channel: 'UART0',
        baud: 115200,
        message: `[PN532] AVISO: Tag não autorizada rejeitada: UID=${res.tag.uid}`,
        level: 'WARN',
      });
    }
    return { authorized: res.isAuthorized, name: res.tag.name };
  }

  public removeNfcTag(): void {
    this.nfcModule.removeTag();
    this.eventBus.emit('uart.tx', this.simTimeMs, 'hardware_model', {
      channel: 'UART0',
      baud: 115200,
      message: '[PN532] Tag removida do campo RF.',
      level: 'INFO',
    });
  }

  public toggleTransportOnline(): boolean {
    const newState = !this.eventBus.isOnline();
    const flushed = this.eventBus.setTransportOnline(newState);

    this.eventBus.emit('transport.status', this.simTimeMs, 'system', {
      is_online: newState,
      offline_buffer_count: this.eventBus.getOfflineQueueCount(),
      last_flushed_seq: flushed.length > 0 ? flushed[flushed.length - 1].seq : undefined,
    });

    this.eventBus.emit('uart.tx', this.simTimeMs, 'firmware', {
      channel: 'UART0',
      baud: 115200,
      message: `[TRANSPORT] Conexão Wi-Fi ${newState ? 'RESTABELECIDA' : 'PERDIDA'}. ${
        flushed.length > 0 ? `Descarregados ${flushed.length} eventos pendentes da fila offline.` : ''
      }`,
      level: newState ? 'INFO' : 'WARN',
    });

    return newState;
  }

  // Falhas Injetadas
  public setFault(faultId: string, active: boolean): void {
    if (active) {
      this.injectedFaults.set(faultId, {
        id: faultId,
        name: faultId,
        active: true,
        description: 'Falha simulada ativa no circuito',
      });
      this.eventBus.emit('circuit.fault_injected', this.simTimeMs, 'fault_injector', {
        fault_id: faultId,
        name: faultId,
        description: 'Falha intencional de bancada didática',
        safety_violation: faultId === 'FAULT_ECHO_5V',
        target_pin: faultId === 'FAULT_ECHO_5V' ? 'GPIO6' : 'GND',
      });
    } else {
      this.injectedFaults.delete(faultId);
      this.eventBus.emit('circuit.fault_cleared', this.simTimeMs, 'fault_injector', {
        fault_id: faultId,
      });
    }
  }

  public isFaultActive(faultId: string): boolean {
    return this.injectedFaults.has(faultId);
  }

  public setSeed(seed: number): void {
    this.seed = seed;
    this.acousticModel.setSeed(seed);
  }

  public getSeed(): number {
    return this.seed;
  }

  public getSimTimeMs(): number {
    return this.simTimeMs;
  }

  public getEventBus(): MonotonicEventBus {
    return this.eventBus;
  }

  public getTankGeometry(): TankGeometry {
    return this.tankGeometry;
  }

  public getActiveScenarioId(): string {
    return this.activeScenarioId;
  }

  public reset(currentTimeMs: number = 0): void {
    this.simTimeMs = currentTimeMs;
    this.eventBus.reset();
    this.sloshModel.reset();
    this.reedSwitch = new VirtualReedSwitch();
    this.nfcModule = new VirtualPN532();
    this.mcu = new McuStateMachine(
      this.eventBus,
      this.acousticModel,
      this.tankGeometry,
      this.reedSwitch,
      this.nfcModule
    );
    this.mcu.boot(currentTimeMs);
  }
}
