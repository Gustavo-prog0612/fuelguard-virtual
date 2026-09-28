import { describe, expect, it } from 'vitest';
import { runEngineeringVerification } from '@/verification/run-engineering-verification';

describe('Painel de verificação com evidência', () => {
  it('não transforma pendências de fabricação em aprovação', () => {
    const results = runEngineeringVerification();
    expect(results.find((result) => result.id === 'PCB-001')?.status).toBe('PENDING');
    expect(results.find((result) => result.id === 'FLUID-001')?.status).toBe('PENDING');
    expect(results.find((result) => result.id === 'ARCH-001')?.status).toBe('PENDING');
    expect(results.find((result) => result.id === 'MEAS-001')?.status).toBe('PENDING');
    expect(results.every((result) => result.evidenceRef.length > 0)).toBe(true);
  });

  it('aprova apenas contratos verificáveis da bancada', () => {
    const results = runEngineeringVerification();
    expect(results.find((result) => result.id === 'ELEC-001')?.status).toBe('PASS');
    expect(results.find((result) => result.id === 'MECH-001')?.status).toBe('PASS');
    expect(results.find((result) => result.id === 'MECH-002')?.status).toBe('PASS');
  });
});
