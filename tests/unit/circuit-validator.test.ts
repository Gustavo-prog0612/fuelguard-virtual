import { describe, it, expect } from 'vitest';
import { 
  CircuitValidator, 
  SAFE_CANONICAL_WIRING, 
  FAULT_5V_DIRECT_WIRING 
} from '@/electrical/circuit-validator';

describe('Marco M3: Validador Elétrico Topológico em Tempo Real', () => {
  it('aprova todas as 6 regras elétricas na fiação canônica de referência', () => {
    const report = CircuitValidator.evaluate(SAFE_CANONICAL_WIRING);

    expect(report.overallStatus).toBe('NOMINAL');
    expect(report.criticalViolationsCount).toBe(0);
    expect(report.warningsCount).toBe(0);
    expect(report.passedCount).toBe(6);

    // Verifica que todas as regras individuais passaram
    report.rules.forEach((rule) => {
      expect(rule.status).toBe('PASS');
    });
  });

  it('detecta violação fatal de sobretensão RULE-01 com 5V direto no GPIO6', () => {
    const report = CircuitValidator.evaluate(FAULT_5V_DIRECT_WIRING);

    expect(report.overallStatus).toBe('CRITICAL_ERROR');
    expect(report.criticalViolationsCount).toBeGreaterThanOrEqual(1);

    const rule01 = report.rules.find((r) => r.ruleId === 'RULE-01');
    expect(rule01).toBeDefined();
    expect(rule01?.status).toBe('FAIL');
    expect(rule01?.voltageObserved).toContain('5,00 V');
    expect(rule01?.message).toContain('SOBRETENSÃO CRÍTICA');
  });

  it('emite advertência de sinal em RULE-02 se TRIG do JSN for ligado direto em 3.3V sem buffer', () => {
    const unbufferedWiring = SAFE_CANONICAL_WIRING
      .filter((w) => w.id !== 'w_trig_to_buffer' && w.id !== 'w_buffer_to_jsn')
      .concat([{ id: 'w_trig_direct', sourcePinId: 'esp_gpio5', targetPinId: 'jsn_trig', wireType: 'trig' }]);

    const report = CircuitValidator.evaluate(unbufferedWiring);

    const rule02 = report.rules.find((r) => r.ruleId === 'RULE-02');
    expect(rule02).toBeDefined();
    expect(rule02?.status).toBe('WARN');
    expect(rule02?.voltageObserved).toContain('3,30 V');
    expect(rule02?.message).toContain('Disparo Direto em 3,3V');
  });

  it('detecta terra flutuante em RULE-03 se GND de um módulo estiver desconectado', () => {
    const floatingGndWiring = SAFE_CANONICAL_WIRING.filter((w) => w.id !== 'w_gnd_jsn');

    const report = CircuitValidator.evaluate(floatingGndWiring);

    const rule03 = report.rules.find((r) => r.ruleId === 'RULE-03');
    expect(rule03).toBeDefined();
    expect(rule03?.status).toBe('WARN');
    expect(rule03?.message).toContain('Terra Flutuante');
  });

  it('emite advertência para circuito completamente desconectado', () => {
    const report = CircuitValidator.evaluate([]);

    expect(report.overallStatus).toBe('WARNING');
    expect(report.passedCount).toBe(0);
    expect(report.warningsCount).toBe(6);
  });
});
