import { describe, it, expect } from 'vitest';
import { CircuitJsonBuilder } from '@/circuit-cad/circuit-json-builder';
import { DrcChecker } from '@/circuit-cad/drc-checker';
import { FUELGUARD_CAD_LIBRARY } from '@/circuit-cad/component-library';
import { PHYSICAL_WIRING_REGISTRY } from '@/circuit-cad/wiring-registry';

describe('CAD & Circuit JSON Pipeline (tscircuit Integration)', () => {
  it('deve possuir catálogo canônico de componentes com metadados e procedência', () => {
    const esp32 = FUELGUARD_CAD_LIBRARY['esp32_s3_devkit'];
    expect(esp32).toBeDefined();
    expect(esp32.partNumber).toBe('ESP32-S3-DevKitC-1-N8R8');
    expect(esp32.dimensionsMm).toEqual({ width: 25.5, height: 68.0, depth: 12.0 });
    expect(esp32.validationStatus).toBe('exact_verified');
    expect(esp32.license).toBe('CC-BY-SA-4.0');

    // Módulos aproximados didáticos
    const jsn = FUELGUARD_CAD_LIBRARY['jsn_sr04t'];
    expect(jsn.validationStatus).toBe('didactic_approximate');
    expect(jsn.disclaimerNote).toBeDefined();

    const pn532 = FUELGUARD_CAD_LIBRARY['pn532_breakout'];
    expect(pn532.validationStatus).toBe('didactic_approximate');
  });

  it('deve gerar pacote Circuit JSON nominal válido com todos os componentes da bancada', () => {
    const builder = new CircuitJsonBuilder();
    const pkg = builder.buildNominalBenchCircuit();

    expect(pkg.schema_version).toBe(1);
    expect(pkg.cad_engine).toBe('tscircuit');
    expect(pkg.circuit_elements.length).toBeGreaterThan(20);

    // Deve conter pcb_board
    const board = pkg.circuit_elements.find((el) => el.type === 'pcb_board');
    expect(board).toBeDefined();
    expect((board as any).width).toBe(180);
    expect((board as any).height).toBe(120);

    // Deve conter source_components de todos os módulos
    const sourceComps = pkg.circuit_elements.filter((el) => el.type === 'source_component');
    expect(sourceComps.length).toBe(7); // ESP32, Buffer, Divider, JSN, PN532, Reed, LED

    // Deve conter pinos (source_port) e ilhós perfurados (pcb_plated_hole)
    const ports = pkg.circuit_elements.filter((el) => el.type === 'source_port');
    expect(ports.length).toBeGreaterThan(25);

    const holes = pkg.circuit_elements.filter((el) => el.type === 'pcb_plated_hole');
    expect(holes.length).toBeGreaterThan(25);

    // Deve conter redes (source_net) para terras e sinais
    const nets = pkg.circuit_elements.filter((el) => el.type === 'source_net');
    expect(nets.some((n: any) => n.name === 'GND')).toBe(true);
    expect(nets.some((n: any) => n.name === '+5V')).toBe(true);
    expect(nets.some((n: any) => n.name === 'ECHO_3V0_SAFE')).toBe(true);
  });

  it('deve aprovar circuito nominal no validador DRC sem erros fatais', () => {
    const builder = new CircuitJsonBuilder();
    const pkg = builder.buildNominalBenchCircuit();

    const violations = DrcChecker.runChecks(pkg.circuit_elements);
    const errors = violations.filter((v) => v.severity === 'ERROR');

    expect(errors.length).toBe(0);
    expect(violations.some((v) => v.ruleCode === 'DRC-05')).toBe(true); // Aviso didático
  });

  it('deve detectar violação fatal de sobretensão 5V no pino GPIO6 em circuito falho', () => {
    const builder = new CircuitJsonBuilder();
    const faultyPkg = builder.buildFaultyBenchCircuit();

    const violations = DrcChecker.runChecks(faultyPkg.circuit_elements);
    const fatalViolation = violations.find((v) => v.id === 'DRC-V01-FATAL');

    expect(fatalViolation).toBeDefined();
    expect(fatalViolation?.severity).toBe('ERROR');
    expect(fatalViolation?.ruleCode).toBe('DRC-01');
    expect(fatalViolation?.message).toContain('3,60V');
  });

  it('deve classificar rigorosamente os componentes em Classes A, B, C e D com rastreabilidade', () => {
    // Classe A: Modelo oficial do fabricante (Espressif)
    const esp32 = FUELGUARD_CAD_LIBRARY['esp32_s3_devkit'];
    expect(esp32.confidenceLevel).toBe('A');
    expect(esp32.inferredDimensions.length).toBe(0);
    expect(esp32.sourceUrl).toContain('espressif/kicad-libraries');

    // Classe B: Modelo de biblioteca confiável (JEDEC / KiCad Packages3D)
    const buffer = FUELGUARD_CAD_LIBRARY['sn74ahct125n'];
    expect(buffer.confidenceLevel).toBe('B');
    expect(buffer.sourceUrl).toContain('kicad-packages3D');

    // Classe C: Aproximação paramétrica com dimensões inferidas a confirmar
    const jsn = FUELGUARD_CAD_LIBRARY['jsn_sr04t'];
    expect(jsn.confidenceLevel).toBe('C');
    expect(jsn.inferredDimensions.length).toBeGreaterThan(0);
    expect(jsn.replacementInstructions).toBeDefined();

    const pn532 = FUELGUARD_CAD_LIBRARY['pn532_breakout'];
    expect(pn532.confidenceLevel).toBe('C');
    expect(pn532.inferredDimensions.length).toBeGreaterThan(0);

    // Classe D: Placeholder visual representativo
    const tank = FUELGUARD_CAD_LIBRARY['tank_cylinder'];
    expect(tank.confidenceLevel).toBe('D');
    expect(tank.disclaimerNote).toContain('água');
  });

  it('deve conter cadastro físico de fiação com waypoints, bitolas AWG e coordenadas reais', () => {
    expect(PHYSICAL_WIRING_REGISTRY.length).toBeGreaterThanOrEqual(10);

    PHYSICAL_WIRING_REGISTRY.forEach((cable: any) => {
      expect(cable.id).toBeDefined();
      expect(cable.netName).toBeDefined();
      expect(cable.waypoints.length).toBeGreaterThanOrEqual(3);
      expect(cable.estimatedLengthMm).toBeGreaterThan(10);
      expect(['power', 'spi', 'sensors', 'usb']).toContain(cable.group);
      expect(cable.fromCoord.length).toBe(3);
      expect(cable.toCoord.length).toBe(3);
    });

    // Barramento SPI deve conter 4 vias ligando ESP32 ao PN532
    const spiCables = PHYSICAL_WIRING_REGISTRY.filter((c: any) => c.group === 'spi');
    expect(spiCables.length).toBe(4);
  });
});

