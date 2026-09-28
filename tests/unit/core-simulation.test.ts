import { describe, it, expect, beforeEach } from 'vitest';
import { Mulberry32 } from '@/core/physics/prng';
import { AcousticModel } from '@/core/physics/acoustic';
import { TankGeometry } from '@/core/physics/tank-geometry';
import { SloshDampingModel } from '@/core/physics/slosh-damping';
import { MedianFilter } from '@/core/firmware-logic/median-filter';
import { VirtualReedSwitch } from '@/core/components/reed-switch';
import { MonotonicEventBus } from '@/core/bus/event-bus';
import { SimulationEngine } from '@/core/simulation-engine';

describe('Marco M2: Núcleo de Simulação Determinístico (Física e Firmware)', () => {
  describe('1. PRNG Mulberry32 & Reprodutibilidade', () => {
    it('gera sequências idênticas para a mesma semente (seed=42)', () => {
      const prng1 = new Mulberry32(42);
      const prng2 = new Mulberry32(42);

      const seq1 = [prng1.next(), prng1.next(), prng1.next(), prng1.next()];
      const seq2 = [prng2.next(), prng2.next(), prng2.next(), prng2.next()];

      expect(seq1).toEqual(seq2);
    });

    it('gera distribuição gaussiana centrada na média com desvio padrão', () => {
      const prng = new Mulberry32(12345);
      const samples: number[] = [];
      for (let i = 0; i < 2000; i++) {
        samples.push(prng.nextGaussian(10.0, 2.0));
      }

      const mean = samples.reduce((acc, v) => acc + v, 0) / samples.length;
      expect(mean).toBeGreaterThan(9.8);
      expect(mean).toBeLessThan(10.2);
    });
  });

  describe('2. Modelagem acústica do A02YYUW/SEN0311 & termodinâmica', () => {
    let acoustic: AcousticModel;

    beforeEach(() => {
      acoustic = new AcousticModel(42);
    });

    it('calcula velocidade do som c(T) conforme equação termodinâmica', () => {
      // A 0°C: c(0) = 331.3 m/s
      const c0 = acoustic.calculateSpeedOfSound(0);
      expect(c0).toBeCloseTo(331.3, 1);

      // A 20°C: c(20) ~ 343.2 m/s
      const c20 = acoustic.calculateSpeedOfSound(20);
      expect(c20).toBeCloseTo(343.2, 1);
    });

    it('calcula tempo de eco bidirecional corretamente', () => {
      const c = 343.2; // m/s
      const distCm = 50.0; // 0.5 m (ida e volta = 1.0 m)
      const echoTimeUs = acoustic.distanceToEchoTimeUs(distCm, c);

      // t = 1.0 / 343.2 = 0.0029137 s = 2914 us
      expect(echoTimeUs).toBeCloseTo(2914, -1);
    });

    it('identifica violação da Zona Cega do sensor (< 3 cm)', () => {
      const pingBlind = acoustic.simulatePing(2.0, 24.8, 0, 0.1);
      expect(pingBlind.inBlindZone).toBe(true);
      expect(pingBlind.echoValid).toBe(false);
    });

    it('produz eco válido quando a distância está acima de 3 cm', () => {
      const pingValid = acoustic.simulatePing(45.0, 24.8, 0, 0.1);
      expect(pingValid.inBlindZone).toBe(false);
      expect(pingValid.echoValid).toBe(true);
      expect(pingValid.measuredDistanceCm).toBeCloseTo(45.0, 0);
    });
  });

  describe('3. Geometria do Tanque & Curva Volumétrica', () => {
    it('calcula altura da água a partir da distância acústica: h = Href - d', () => {
      const tank = new TankGeometry(100.0, 0.1);
      expect(tank.distanceToWaterHeight(42.3)).toBeCloseTo(57.7, 1);
      expect(tank.waterHeightToDistance(57.7)).toBeCloseTo(42.3, 1);
    });

    it('interpola pontos da curva empírica de calibração', () => {
      const tank = new TankGeometry(100.0, 0.1, [
        { hCm: 0, volL: 0 },
        { hCm: 50, volL: 48 }, // leve não-linearidade didática
        { hCm: 100, volL: 100 },
      ]);

      expect(tank.calculateCalibratedVolume(25)).toBeCloseTo(24, 1);
      expect(tank.calculateCalibratedVolume(75)).toBeCloseTo(74, 1);
    });
  });

  describe('4. Modelo de Slosh (Oscilação Amortecida)', () => {
    it('decae a perturbação superficial exponencialmente ao longo do tempo', () => {
      const slosh = new SloshDampingModel(2.5, 0.08);
      slosh.triggerSlosh(10.0, 0);

      const d0 = Math.abs(slosh.getDisplacement(0));
      const d1 = Math.abs(slosh.getDisplacement(1.0));
      const d3 = Math.abs(slosh.getDisplacement(3.0));

      expect(d0).toBeCloseTo(10.0, 1);
      expect(d1).toBeLessThan(d0);
      expect(d3).toBeLessThan(d1);
    });
  });

  describe('5. Filtro Mediano de 5 Amostras', () => {
    it('elimina outlier espúrio no sinal acústico', () => {
      const filter = new MedianFilter(5, 15.0);

      filter.addSample(42.1);
      filter.addSample(42.3);
      filter.addSample(42.0);
      filter.addSample(42.2);

      // Injeta ruído espúrio gigantesco (ex: reflexão de parede ou falso eco)
      const resOutlier = filter.addSample(999.0);

      // Mediana da janela [42.1, 42.3, 42.0, 42.2, 999.0] -> 42.2
      expect(resOutlier.median).toBe(42.2);
      expect(resOutlier.isOutlierRejected).toBe(true);
    });
  });

  describe('6. Sensor Reed Switch & Debounce de 50 ms', () => {
    it('ignora repiques transitórios nos primeiros 15 ms e só valida após 50 ms contínuos', () => {
      const reed = new VirtualReedSwitch();
      expect(reed.isLidClosed()).toBe(true);

      // Abre a tampa no instante 100 ms
      reed.setLidState(false, 100);

      // No instante 110 ms (durante a rajada de chatter mecânico de 15 ms)
      const update1 = reed.update(110);
      expect(update1.bouncedThisTick).toBe(true);
      expect(reed.isLidClosed()).toBe(true); // Ainda não confirmou a abertura

      // No instante 130 ms (chatter acabou, mas ainda em janela de debounce < 50ms)
      const update2 = reed.update(130);
      expect(update2.stateChanged).toBe(false);
      expect(reed.isLidClosed()).toBe(true);

      // No instante 165 ms (> 50 ms após estabilização do sinal)
      const update3 = reed.update(165);
      expect(update3.stateChanged).toBe(true);
      expect(reed.isLidClosed()).toBe(false); // Agora confirma a transição estável
    });
  });

  describe('7. Barramento de Eventos Monotônico & Fila Offline', () => {
    it('atribui números de sequência estritamente crescentes', () => {
      const bus = new MonotonicEventBus();
      const e1 = bus.emit('clock.tick', 0, 'system', { delta_ms: 20, total_seconds: 0 });
      const e2 = bus.emit('clock.tick', 20, 'system', { delta_ms: 20, total_seconds: 0 });
      const e3 = bus.emit('uart.tx', 40, 'firmware', { channel: 'UART0', baud: 115200, message: 'test', level: 'INFO' });

      expect(e1.seq).toBe(1);
      expect(e2.seq).toBe(2);
      expect(e3.seq).toBe(3);
    });

    it('acumula eventos na fila offline quando a rede cai e descarrega ao reconectar', () => {
      const bus = new MonotonicEventBus();
      bus.setTransportOnline(false);

      bus.emit('uart.tx', 100, 'firmware', { channel: 'UART0', baud: 115200, message: 'Offline msg 1', level: 'INFO' });
      bus.emit('uart.tx', 200, 'firmware', { channel: 'UART0', baud: 115200, message: 'Offline msg 2', level: 'INFO' });

      expect(bus.getOfflineQueueCount()).toBe(2);

      const flushed = bus.setTransportOnline(true);
      expect(flushed.length).toBe(2);
      expect(bus.getOfflineQueueCount()).toBe(0);
    });
  });

  describe('8. Orquestrador SimulationEngine', () => {
    it('executa passos discretos de 20 ms e atualiza leituras do MCU', () => {
      const engine = new SimulationEngine({ seed: 42 });
      const snap1 = engine.step(20);

      expect(engine.getSimTimeMs()).toBe(20);
      expect(snap1.echoValid).toBe(true);
      expect(snap1.percentage).toBeGreaterThan(0);
    });

    it('carrega Cenário B (Slosh) e induz oscilações', () => {
      const engine = new SimulationEngine();
      engine.loadScenario('slosh');

      expect(engine.getActiveScenarioId()).toBe('slosh');
    });

    it('carrega Cenário C (Zona Cega) e entra em alerta ALERT_SENSOR', () => {
      const engine = new SimulationEngine();
      engine.loadScenario('blind_zone');

      // Executa alguns ticks para o ping do SEN0311 processar a distância < 3 cm
      for (let i = 0; i < 15; i++) {
        engine.step(20);
      }

      const snap = engine.step(20);
      expect(snap.inBlindZone).toBe(true);
      expect(snap.state).toBe('ALERT_SENSOR');
    });
  });
});
