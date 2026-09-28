import { describe, it, expect } from 'vitest';
import { getRp2040CircuitPackage, RP2040_METADATA, RP2040_COMPONENT_LIBRARY } from '@/circuit-cad/rp2040-circuit-provider';

describe('RP2040 Motor Controller (imrishabh18) — Circuit JSON & CAD Integration', () => {
  it('carrega o pacote Circuit JSON oficial com metadados corretos', () => {
    const pkg = getRp2040CircuitPackage();
    expect(pkg.schema_version).toBe(1);
    expect(pkg.cad_engine).toBe('tscircuit');
    expect(pkg.circuit_elements.length).toBeGreaterThan(2000);
  });

  it('valida dimensões da placa de 4 camadas NEMA 17 (42.3 x 42.32 mm)', () => {
    const pkg = getRp2040CircuitPackage();
    const board = pkg.circuit_elements.find((el) => el.type === 'pcb_board') as any;
    expect(board).toBeDefined();
    expect(board.width).toBeCloseTo(42.3, 1);
    expect(board.height).toBeCloseTo(42.32, 1);
    expect(board.thickness).toBe(1.6);
  });

  it('contém trilhas físicas roteadas, pads SMT e vias de cobre', () => {
    const pkg = getRp2040CircuitPackage();
    const traces = pkg.circuit_elements.filter((el) => el.type === 'pcb_trace');
    const pads = pkg.circuit_elements.filter((el) => el.type === 'pcb_smtpad');
    const vias = pkg.circuit_elements.filter((el) => el.type === 'pcb_via');

    expect(traces.length).toBe(262);
    expect(pads.length).toBe(340);
    expect(vias.length).toBe(270);
  });

  it('possui registro completo de componentes com folhas de dados oficiais (Classe A/B)', () => {
    expect(RP2040_COMPONENT_LIBRARY.rp2040_mcu.confidenceLevel).toBe('A');
    expect(RP2040_COMPONENT_LIBRARY.drv8847_driver.confidenceLevel).toBe('A');
    expect(RP2040_COMPONENT_LIBRARY.ina241_current_sense.confidenceLevel).toBe('A');
    expect(RP2040_COMPONENT_LIBRARY.tmp102_temp_sensor.confidenceLevel).toBe('A');
    expect(RP2040_COMPONENT_LIBRARY.tcjd227_bulk_cap.confidenceLevel).toBe('A');
    expect(RP2040_COMPONENT_LIBRARY.jst_ph_motor_connector.confidenceLevel).toBe('A');
    expect(RP2040_COMPONENT_LIBRARY.usbc_dual_connectors.confidenceLevel).toBe('A');
  });

  it('verifica integridade do resumo DRC e unificação da rede de terra GND', () => {
    expect(RP2040_METADATA.drcSummary.copperShorts).toBe(0);
    expect(RP2040_METADATA.drcSummary.isolatedGroundNets).toBe(0);
    expect(RP2040_METADATA.drcSummary.routingErrors).toBe(0);
  });
});
