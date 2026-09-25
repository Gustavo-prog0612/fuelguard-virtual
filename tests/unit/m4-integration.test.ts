import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '@/core/simulation-engine';
import { createExportPackage, parseAndValidatePackage } from '@/persistence/json-exporter';
import { MedianFilter } from '@/core/firmware-logic/median-filter';

describe('Marco M4 — Integração de Telemetria, Fila Offline e Persistência', () => {
  it('filtro mediano de 5 amostras rejeita outliers e ruídos impulsivos de bancada', () => {
    const filter = new MedianFilter(5, 15.0);

    // Amostras estáveis em torno de 42 cm
    expect(filter.addSample(42.1).median).toBe(42.1);
    expect(filter.addSample(42.2).median).toBeCloseTo(42.15, 1);
    expect(filter.addSample(42.0).median).toBe(42.1);

    // Salto espúrio (ex: bolha na água ou reflexão parasita em 85 cm)
    const spike = filter.addSample(85.0);
    // A mediana das 4 amostras [42.1, 42.2, 42.0, 85.0] deve continuar em torno de ~42.1 cm!
    expect(spike.median).toBeLessThan(45.0);
    expect(spike.isOutlierRejected).toBe(true);

    // Mais uma amostra nominal
    const stable = filter.addSample(42.3);
    // Janela completa de 5: [42.1, 42.2, 42.0, 85.0, 42.3] -> mediana = 42.2
    expect(stable.median).toBe(42.2);
  });

  it('gerencia transição de rede online/offline e retenção de eventos sem perda', () => {
    const engine = new SimulationEngine({ seed: 100 });
    const bus = engine.getEventBus();

    expect(bus.isOnline()).toBe(true);
    expect(bus.getOfflineQueueCount()).toBe(0);

    // Desconecta a rede simulada
    bus.setTransportOnline(false);
    expect(bus.isOnline()).toBe(false);

    // Emite eventos enquanto offline
    bus.emit('tank.level_update', 100, 'hardware_model', {
      raw_distance_cm: 42.0,
      filtered_distance_cm: 42.0,
      water_height_cm: 58.0,
      volume_liters: 580,
      percentage: 58.0,
      in_blind_zone: false,
      echo_valid: true,
      temperature_c: 25.0,
      sound_speed_mps: 346.0,
    });

    expect(bus.getOfflineQueueCount()).toBe(1);

    // Reconecta a rede: a fila offline deve ser descarregada
    const flushed = bus.setTransportOnline(true);
    expect(flushed).toHaveLength(1);
    expect(bus.getOfflineQueueCount()).toBe(0);
  });

  it('executa ciclo completo de exportação e restauração canônica JSON (schema_version: 1)', () => {
    const engine = new SimulationEngine({ seed: 777 });
    engine.step(100);

    const events = engine.getEventBus().getRecentEvents(50);
    const pkg = createExportPackage({
      simTimeMs: engine.getSimTimeMs(),
      events,
      uartLogs: [{ time: '00:01.000', level: 'INFO', msg: 'Teste M4' }],
    });

    const jsonString = JSON.stringify(pkg);
    const restored = parseAndValidatePackage(jsonString);

    expect(restored.schema_version).toBe(1);
    expect(restored.app).toBe('FuelGuard Virtual Test Bench');
    expect(restored.events?.length).toBe(events.length);
    expect(restored.uart_logs?.[0].msg).toBe('Teste M4');
    expect(restored.summary.sim_time_ms).toBe(engine.getSimTimeMs());
  });
});
