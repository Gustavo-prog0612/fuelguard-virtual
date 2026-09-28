import { describe, it, expect } from 'vitest';
import { AssemblyAuditor } from '@/circuit-cad/assembly-auditor';
import { FUELGUARD_CAD_LIBRARY } from '@/circuit-cad/component-library';
import { PHYSICAL_WIRING_REGISTRY, PhysicalCable } from '@/circuit-cad/wiring-registry';

describe('Auditoria de Montagem Mecatrônica & Elétrica (Assembly Auditor)', () => {
  it('deve manter a montagem não conforme enquanto houver gates físicos pendentes', () => {
    const report = AssemblyAuditor.runAudit();

    expect(report.isCompliant).toBe(false);
    expect(report.failCount).toBe(0);
    expect(report.pendingCount).toBeGreaterThan(0);
    expect(report.totalChecks).toBeGreaterThan(10);
  });

  it('deve validar apoio de todos os componentes sobre a bancada, protoboard ou suporte', () => {
    const report = AssemblyAuditor.runAudit();
    const supportChecks = report.items.filter((i) => i.category === 'support_mounting');

    expect(supportChecks.length).toBeGreaterThanOrEqual(4);
    expect(supportChecks.some((c) => c.severity === 'PENDING')).toBe(true);

    // Protoboard, ESP32 e sensor de nível devem ter apoios verificados
    expect(supportChecks.some((c) => c.componentId === 'breadboard_830')).toBe(true);
    expect(supportChecks.some((c) => c.componentId === 'esp32_s3_devkit')).toBe(true);
    expect(supportChecks.some((c) => c.componentId === 'a02yyuw_sen0311')).toBe(true);
  });

  it('deve validar alinhamento de espaçadores M3 e fixação da sonda na tampa', () => {
    const report = AssemblyAuditor.runAudit();
    const fastenerChecks = report.items.filter((i) => i.category === 'fasteners_alignment');

    expect(fastenerChecks.length).toBeGreaterThanOrEqual(2);
    expect(fastenerChecks.some((c) => c.severity === 'PENDING')).toBe(true);
  });

  it('deve garantir que todos os cabos físicos possuam conectores e pinos válidos', () => {
    const report = AssemblyAuditor.runAudit();
    const wiringCheck = report.items.find((i) => i.id === 'AUD-WIR-OK');

    expect(wiringCheck).toBeDefined();
    expect(wiringCheck?.severity).toBe('PASS');
    expect(wiringCheck?.message).toContain('Todos os');
  });

  it('deve falhar a auditoria e emitir erro se um cabo for desconectado ou apontar para componente inválido', () => {
    const faultyCables: PhysicalCable[] = [
      ...PHYSICAL_WIRING_REGISTRY,
      {
        id: 'W_GHOST_DANGLING',
        netName: 'DANGLING_NET',
        label: 'Cabo Fantasma Sem Destino',
        group: 'power',
        signalType: 'power_5v',
        colorHex: '#ff0000',
        awgGauge: 'AWG24',
        diameterMm: 1.1,
        fromComponent: 'esp32_s3_devkit',
        fromPin: 'Pin 2',
        toComponent: 'componente_inexistente_fantasma',
        toPin: 'Pin Invalido',
        fromCoord: [0, 0, 0],
        toCoord: [100, 100, 100],
        waypoints: [[0, 0, 0], [50, 50, 50], [100, 100, 100]],
        estimatedLengthMm: 120,
        nominalVoltageV: 5.0,
        description: 'Cabo desconectado injetado para teste',
      },
    ];

    const report = AssemblyAuditor.runAudit(FUELGUARD_CAD_LIBRARY, faultyCables);

    expect(report.isCompliant).toBe(false);
    expect(report.failCount).toBeGreaterThan(0);
    const failItem = report.items.find((i) => i.id === 'AUD-WIR-ERR-W_GHOST_DANGLING');
    expect(failItem).toBeDefined();
    expect(failItem?.severity).toBe('FAIL');
    expect(failItem?.message).toContain('inexistente');
  });

  it('deve emitir avisos (WARNING) visíveis para modelos de Classe C e Classe D com medidas pendentes', () => {
    const report = AssemblyAuditor.runAudit();
    const warnings = report.items.filter((i) => i.severity === 'WARNING' || i.severity === 'PENDING');

    expect(warnings.length).toBeGreaterThanOrEqual(2);

    // Deve alertar sobre a zona cega documentada de 3cm do SEN0311
    const blindZoneWarn = warnings.find((w) => w.id === 'AUD-SNS-01');
    expect(blindZoneWarn).toBeDefined();
    expect(blindZoneWarn?.technicalDetails).toContain('confirmado');

    // Deve alertar sobre a classe D do recipiente
    const tankWarn = warnings.find((w) => w.id === 'AUD-LIC-WARN-tank_cylinder');
    expect(tankWarn).toBeDefined();
  });

  it('deve validar apoio e conexão de sinalizadores LED e Buzzer na protoboard', () => {
    const report = AssemblyAuditor.runAudit();
    const buzzerCheck = report.items.find((i) => i.id === 'AUD-SUP-06');

    expect(buzzerCheck).toBeDefined();
    expect(buzzerCheck?.severity).toBe('PENDING');
    expect(buzzerCheck?.componentId).toBe('buzzer_active');
    expect(buzzerCheck?.technicalDetails).toContain('CMI-1295IC-0385T');

    // Valida cabos do LED e Buzzer no wiring registry
    const ledCable = PHYSICAL_WIRING_REGISTRY.find((c) => c.id === 'W_LED_STATUS');
    const bzCtrlCable = PHYSICAL_WIRING_REGISTRY.find((c) => c.id === 'W_BUZZER_CTRL');
    const bzGndCable = PHYSICAL_WIRING_REGISTRY.find((c) => c.id === 'W_BUZZER_GND');

    expect(ledCable).toBeDefined();
    expect(bzCtrlCable).toBeDefined();
    expect(bzGndCable).toBeDefined();
    expect(ledCable?.fromComponent).toBe('esp32_s3_devkit');
    expect(bzCtrlCable?.toComponent).toBe('buzzer_active');
  });

  it('deve validar confinamento hidrostático e caminho acústico desobstruído do sensor', () => {
    const report = AssemblyAuditor.runAudit();

    const acousticCheck = report.items.find((i) => i.id === 'AUD-SNS-03');
    expect(acousticCheck).toBeDefined();
    expect(acousticCheck?.severity).toBe('PENDING');
    expect(acousticCheck?.message).toContain('aguardando');

    const clearanceCheck = report.items.find((i) => i.id === 'AUD-CLR-02');
    expect(clearanceCheck).toBeDefined();
    expect(clearanceCheck?.severity).toBe('PENDING');
    expect(clearanceCheck?.message).toContain('pendente');
  });
});
