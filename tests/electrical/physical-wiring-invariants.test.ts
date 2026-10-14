import { describe, expect, it } from 'vitest';
import { AssemblyAuditor } from '@/circuit-cad/assembly-auditor';
import { FUELGUARD_CAD_LIBRARY } from '@/circuit-cad/component-library';
import {
  PHYSICAL_CONNECTION_BOUNDARIES,
  PHYSICAL_WIRING_REGISTRY,
  PhysicalCable,
} from '@/circuit-cad/wiring-registry';

describe('Invariantes físicas do chicote', () => {
  it('registra pinos e terminais nomeados em cada extremidade física', () => {
    for (const cable of PHYSICAL_WIRING_REGISTRY) {
      expect(cable.fromPin.trim(), `${cable.id}: pino de origem`).not.toBe('');
      expect(cable.toPin.trim(), `${cable.id}: pino de destino`).not.toBe('');
      expect(cable.fromTerminal?.trim(), `${cable.id}: terminal de origem`).not.toBe('');
      expect(cable.toTerminal?.trim(), `${cable.id}: terminal de destino`).not.toBe('');
    }
  });

  it('aceita somente componentes CAD ou fronteiras externas físicas registradas', () => {
    const physicalEndpoints = new Set([
      ...Object.keys(FUELGUARD_CAD_LIBRARY),
      ...Object.keys(PHYSICAL_CONNECTION_BOUNDARIES),
    ]);

    for (const cable of PHYSICAL_WIRING_REGISTRY) {
      expect(physicalEndpoints, `${cable.id}: origem`).toContain(cable.fromComponent);
      expect(physicalEndpoints, `${cable.id}: destino`).toContain(cable.toComponent);
    }
  });

  it('reprova terminais vazios, mesmo quando o componente e a rota existem', () => {
    const nominalCable = PHYSICAL_WIRING_REGISTRY.find((cable) => cable.id === 'W_LEVEL_UART');
    expect(nominalCable).toBeDefined();
    if (!nominalCable) return;

    const cableWithoutTerminal: PhysicalCable = {
      ...nominalCable,
      id: 'W_LEVEL_UART_WITHOUT_TERMINAL',
      toTerminal: '   ',
    };
    const report = AssemblyAuditor.runAudit(FUELGUARD_CAD_LIBRARY, [cableWithoutTerminal]);
    const failure = report.items.find((item) => item.id === 'AUD-WIR-ERR-W_LEVEL_UART_WITHOUT_TERMINAL');

    expect(failure?.severity).toBe('FAIL');
    expect(failure?.message).toContain('terminais físicos');
  });

  it('reprova uma conexão que aponta para um endpoint não físico', () => {
    const nominalCable = PHYSICAL_WIRING_REGISTRY.find((cable) => cable.id === 'W_LEVEL_UART');
    expect(nominalCable).toBeDefined();
    if (!nominalCable) return;

    const cableWithoutPhysicalTarget: PhysicalCable = {
      ...nominalCable,
      id: 'W_LEVEL_UART_VIRTUAL_TARGET',
      toComponent: 'virtual_scene_anchor',
    };
    const report = AssemblyAuditor.runAudit(FUELGUARD_CAD_LIBRARY, [cableWithoutPhysicalTarget]);
    const failure = report.items.find((item) => item.id === 'AUD-WIR-ERR-W_LEVEL_UART_VIRTUAL_TARGET');

    expect(failure?.severity).toBe('FAIL');
    expect(failure?.message).toContain('físico inexistente');
  });
});
