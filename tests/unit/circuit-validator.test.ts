import { describe, it, expect } from 'vitest';
import { CircuitValidator, SAFE_CANONICAL_WIRING, FAULT_5V_DIRECT_WIRING } from '@/electrical/circuit-validator';

describe('Validador elétrico da bancada FuelGuard real', () => {
  it('aprova todas as regras na fiação canônica SEN0311/PN532/MC-38', () => {
    const report = CircuitValidator.evaluate(SAFE_CANONICAL_WIRING);
    expect(report.overallStatus).toBe('NOMINAL');
    expect(report.criticalViolationsCount).toBe(0);
    expect(report.warningsCount).toBe(0);
    expect(report.passedCount).toBe(7);
  });

  it('detecta TX de 5 V acidental no GPIO16', () => {
    const report = CircuitValidator.evaluate(FAULT_5V_DIRECT_WIRING);
    const rule01 = report.rules.find((rule) => rule.ruleId === 'RULE-01');
    expect(report.overallStatus).toBe('CRITICAL_ERROR');
    expect(rule01?.status).toBe('FAIL');
    expect(rule01?.voltageObserved).toContain('5,00 V');
  });

  it('detecta terra flutuante', () => {
    const report = CircuitValidator.evaluate(SAFE_CANONICAL_WIRING.filter((wire) => wire.id !== 'w_gnd_level'));
    const rule03 = report.rules.find((rule) => rule.ruleId === 'RULE-03');
    expect(rule03?.status).toBe('WARN');
  });

  it('emite advertências para circuito desconectado', () => {
    const report = CircuitValidator.evaluate([]);
    expect(report.overallStatus).toBe('WARNING');
    expect(report.passedCount).toBe(0);
    expect(report.warningsCount).toBe(7);
  });
});
