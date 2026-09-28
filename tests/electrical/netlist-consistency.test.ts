import { describe, it, expect } from 'vitest';
import { ESP32_S3_PINMAP } from '@/../fuelguard/hardware/circuit/pinmap';
import { FUELGUARD_HARDWARE_NETS } from '@/../fuelguard/hardware/circuit/nets';
import { CircuitJsonBuilder } from '@/circuit-cad/circuit-json-builder';
import { DrcChecker } from '@/circuit-cad/drc-checker';

describe('Auditoria de Engenharia Elétrica — Consistência Esquemático, Netlist e Pinagem', () => {
  it('deve garantir que todos os pinos de saída do ESP32 operam estritamente no domínio de 3.3V', () => {
    ESP32_S3_PINMAP.forEach((pin) => {
      if (pin.signalType !== 'power' && pin.signalType !== 'ground') {
        expect(pin.voltageDomainV).toBe(3.3);
        expect(pin.maxToleratedVoltageV).toBeLessThanOrEqual(3.6);
      }
    });
  });

  it('deve validar proteção contra sobretensão no pino de leitura de eco (REQ-ELEC-01)', () => {
    const echoPin = ESP32_S3_PINMAP.find((p) => p.gpioNumber === 6);
    expect(echoPin).toBeDefined();
    expect(echoPin?.netName).toBe('ECHO_3V0_SAFE');

    // A net do eco deve vir do divisor resistivo e não diretamente do sensor 5V
    const safeNet = FUELGUARD_HARDWARE_NETS['ECHO_3V0_SAFE'];
    expect(safeNet).toBeDefined();
    expect(safeNet.nominalVoltageV).toBe(3.0);
    expect(safeNet.maxAllowableVoltageV).toBeLessThanOrEqual(3.4);
    expect(safeNet.sourcePin).toBe('R_DIV.VOUT');
  });

  it('deve garantir elevação de nível no pino TRIG para disparo TTL do sensor (REQ-ELEC-02)', () => {
    const trigEspNet = FUELGUARD_HARDWARE_NETS['TRIG_3V3'];
    expect(trigEspNet.nominalVoltageV).toBe(3.3);
    expect(trigEspNet.sinkPins).toContain('U2.1A');

    const trigSensorNet = FUELGUARD_HARDWARE_NETS['TRIG_5V'];
    expect(trigSensorNet.nominalVoltageV).toBe(5.0);
    expect(trigSensorNet.sourcePin).toBe('U2.1Y');
    expect(trigSensorNet.sinkPins).toContain('SEN1.TRIG');
  });

  it('deve verificar ausência de pinos flutuantes ou sem terminação (zero floating pins)', () => {
    Object.values(FUELGUARD_HARDWARE_NETS).forEach((net) => {
      expect(net.sourcePin).toBeDefined();
      expect(net.sourcePin.length).toBeGreaterThan(0);
      expect(net.sinkPins.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('deve aprovar o circuito nominal no validador DRC de regras físicas', () => {
    const builder = new CircuitJsonBuilder();
    const nominalPkg = builder.buildNominalBenchCircuit();
    const violations = DrcChecker.runChecks(nominalPkg.circuit_elements);
    const fatalErrors = violations.filter((v) => v.severity === 'ERROR');

    expect(fatalErrors.length).toBe(0);
  });

  it('deve reprovar imediatamente e apontar a coordenada caso 5V seja injetado no GPIO6', () => {
    const builder = new CircuitJsonBuilder();
    const faultyPkg = builder.buildFaultyBenchCircuit();
    const violations = DrcChecker.runChecks(faultyPkg.circuit_elements);
    const overvoltage = violations.find((v) => v.id === 'DRC-V01-FATAL');

    expect(overvoltage).toBeDefined();
    expect(overvoltage?.severity).toBe('ERROR');
    expect(overvoltage?.ruleCode).toBe('DRC-01');
    expect(overvoltage?.message).toContain('3,60V');
  });
});
