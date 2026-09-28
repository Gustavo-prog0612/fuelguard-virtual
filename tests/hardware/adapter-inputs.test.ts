import designInputs from '@/../hardware/pcb/fuelguard-adapter/design-inputs.json';
import measurementRegister from '@/../hardware/measurements/measurement-register.json';
import { describe, expect, it } from 'vitest';

describe('Gate de entrada da PCB adaptadora', () => {
  it('mantém a placa bloqueada enquanto as medidas físicas estiverem pendentes', () => {
    expect(designInputs.readiness).toBe('not-designed');
    expect(measurementRegister.status).toBe('PENDING_PHYSICAL_EVIDENCE');
    expect(measurementRegister.records.some((record) => record.status === 'PENDING_PHYSICAL_EVIDENCE')).toBe(true);
  });

  it('exige evidência para cada componente que altera conector, montagem ou tampa', () => {
    const requiredComponents = ['U1', 'RFID1', 'SEN1', 'SEN1_PROBE', 'TK1', 'LID1', 'HW1', 'HARNESS'];
    const recordedComponents = measurementRegister.records.map((record) => record.componentRef);

    requiredComponents.forEach((component) => expect(recordedComponents).toContain(component));
    measurementRegister.records.forEach((record) => {
      expect(record.requiredFor.length).toBeGreaterThan(0);
      expect(record.source.length).toBeGreaterThan(0);
    });
  });

  it('não permite que um conector seja tratado como selecionado sem uma medição correspondente', () => {
    designInputs.connectorDecisions.forEach((connector) => {
      expect(connector.selection).toBeNull();
      expect(connector.status).toMatch(/^PENDING_/);
      expect(connector.mustConfirm.length).toBeGreaterThan(0);
    });
  });
});
