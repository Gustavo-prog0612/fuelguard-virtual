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

  it('deve manter a UART do SEN0311 dentro do domínio seguro do ESP32', () => {
    const levelPin = ESP32_S3_PINMAP.find((p) => p.gpioNumber === 16);
    expect(levelPin).toBeDefined();
    expect(levelPin?.netName).toBe('LEVEL_UART_RX');
    const safeNet = FUELGUARD_HARDWARE_NETS.LEVEL_UART_RX;
    expect(safeNet.nominalVoltageV).toBe(3.3);
    expect(safeNet.maxAllowableVoltageV).toBeLessThanOrEqual(3.6);
    expect(safeNet.sourcePin).toBe('SEN1.TX');
  });

  it('deve fixar o modo processado do SEN0311 em nível alto', () => {
    const modeNet = FUELGUARD_HARDWARE_NETS.LEVEL_MODE_PROCESSED;
    expect(modeNet.nominalVoltageV).toBe(3.3);
    expect(modeNet.sourcePin).toBe('+3.3V');
    expect(modeNet.sinkPins).toContain('SEN1.RX_MODE');
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
