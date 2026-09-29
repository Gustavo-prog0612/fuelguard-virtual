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
    expect(esp32.validationStatus).toBe('documented_reference');
    expect(esp32.license).toContain('FuelGuard reconstruction from manufacturer reference');

    const level = FUELGUARD_CAD_LIBRARY['a02yyuw_sen0311'];
    expect(level.validationStatus).toBe('documented_reference');
    expect(level.partNumber).toBe('SEN0311');
    expect(level.pins.map((pin) => pin.label)).toEqual(['VCC (3V3)', 'GND', 'RX (MODE)', 'TX (UART)']);

    const pn532 = FUELGUARD_CAD_LIBRARY['pn532_breakout'];
    expect(pn532.validationStatus).toBe('documented_reference');
    expect(pn532.partNumber).toBe('NFC-PN532_V4');
    expect(pn532.pins).toHaveLength(8);
  });

  it('deve gerar pacote Circuit JSON nominal válido com todos os componentes da bancada', () => {
    const builder = new CircuitJsonBuilder();
    const pkg = builder.buildNominalBenchCircuit();

    expect(pkg.schema_version).toBe(1);
    expect(pkg.cad_engine).toBe('tscircuit');
    expect(pkg.circuit_elements.length).toBeGreaterThan(20);

    // A referência de engenharia ainda não tem PCB liberada: não criar PCB sintética.
    expect(pkg.scope).toBe('engineering-reference');
    expect(pkg.pcbReadiness).toBe('not-designed');
    expect(pkg.circuit_elements.some((el) => el.type === 'pcb_board')).toBe(false);
    expect(pkg.circuit_elements.some((el) => el.type === 'pcb_trace')).toBe(false);

    // Deve conter source_components de todos os módulos reais da baseline.
    const sourceComps = pkg.circuit_elements.filter((el) => el.type === 'source_component');
    expect(sourceComps.length).toBe(6); // ESP32, SEN0311, PN532, MC-38, LED, buzzer

    // Deve conter pinos lógicos; furos só existirão após projeto de PCB real.
    const ports = pkg.circuit_elements.filter((el) => el.type === 'source_port');
    expect(ports.length).toBeGreaterThan(25);

    const holes = pkg.circuit_elements.filter((el) => el.type === 'pcb_plated_hole');
    expect(holes.length).toBe(0);

    // Deve conter redes (source_net) para terras e sinais
    const nets = pkg.circuit_elements.filter((el) => el.type === 'source_net');
    expect(nets.some((n: any) => n.name === 'GND')).toBe(true);
    expect(nets.some((n: any) => n.name === '+3V3')).toBe(true);
    expect(nets.some((n: any) => n.name === 'LEVEL_UART_RX')).toBe(true);
  });

  it('deve aprovar circuito nominal no validador DRC sem erros fatais', () => {
    const builder = new CircuitJsonBuilder();
    const pkg = builder.buildNominalBenchCircuit();

    const violations = DrcChecker.runChecks(pkg.circuit_elements);
    const errors = violations.filter((v) => v.severity === 'ERROR');

    expect(errors.length).toBe(0);
    expect(violations.some((v) => v.ruleCode === 'DRC-05')).toBe(true); // Aviso didático
  });

  it('deve detectar violação fatal de sobretensão 5V no pino GPIO16 em circuito falho', () => {
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
    // Classe B: reconstrução detalhada baseada em referências oficiais; o GLB não é exportação CAD do fabricante.
    const esp32 = FUELGUARD_CAD_LIBRARY['esp32_s3_devkit'];
    expect(esp32.confidenceLevel).toBe('B');
    expect(esp32.inferredDimensions.length).toBeGreaterThan(0);
    expect(esp32.sourceUrl).toContain('docs.espressif.com');

    // Classe B: buzzer ativo com MPN e datasheet do fabricante
    const buzzer = FUELGUARD_CAD_LIBRARY['buzzer_active'];
    expect(buzzer.confidenceLevel).toBe('B');
    expect(buzzer.partNumber).toBe('CMI-1295IC-0385T');

    const level = FUELGUARD_CAD_LIBRARY['a02yyuw_sen0311'];
    expect(level.confidenceLevel).toBe('B');
    expect(level.inferredDimensions.length).toBeGreaterThan(0);
    expect(level.replacementInstructions).toBeDefined();

    const pn532 = FUELGUARD_CAD_LIBRARY['pn532_breakout'];
    expect(pn532.confidenceLevel).toBe('C');
    expect(pn532.validationStatus).toBe('documented_reference');
    expect(pn532.pins.map((pin) => pin.pinNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);

    // MC-38: família comercial sem variante única
    const reed = FUELGUARD_CAD_LIBRARY['reed_switch'];
    expect(reed.confidenceLevel).toBe('C');
    expect(reed.validationStatus).toBe('documented_reference');

    // Tanque: baseline paramétrica, ainda não peça fisicamente confirmada
    const tank = FUELGUARD_CAD_LIBRARY['tank_cylinder'];
    expect(tank.confidenceLevel).toBe('C');
    expect(tank.dimensionsMm).toEqual({ width: 206, height: 168, depth: 206 });
    expect(tank.disclaimerNote).toContain('paramétrica');
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
      expect(cable.fromTerminal).toBeTruthy();
      expect(cable.toTerminal).toBeTruthy();
      expect(cable.waypoints[0]).toEqual(cable.fromCoord);
      expect(cable.waypoints[cable.waypoints.length - 1]).toEqual(cable.toCoord);
      expect(cable.waypoints.every((point: number[]) => point.every(Number.isFinite))).toBe(true);
    });

    // Barramento SPI deve conter 4 vias ligando ESP32 ao PN532
    const spiCables = PHYSICAL_WIRING_REGISTRY.filter((c: any) => c.group === 'spi');
    expect(spiCables.length).toBe(4);
  });

  it('deve manter cada cabo ancorado no próprio endpoint, sem reutilizar rota por netName', () => {
    const ids = PHYSICAL_WIRING_REGISTRY.map((cable) => cable.id);
    expect(new Set(ids).size).toBe(ids.length);

    PHYSICAL_WIRING_REGISTRY.forEach((cable) => {
      expect(cable.waypoints[0]).toEqual(cable.fromCoord);
      expect(cable.waypoints[cable.waypoints.length - 1]).toEqual(cable.toCoord);
    });

    const sameNet = PHYSICAL_WIRING_REGISTRY.filter((cable) => cable.netName === 'GND' || cable.netName === '+3.3V');
    expect(new Set(sameNet.map((cable) => cable.id)).size).toBe(sameNet.length);
    expect(new Set(sameNet.map((cable) => JSON.stringify(cable.waypoints))).size).toBe(sameNet.length);
  });

  it('deve representar todos os retornos e alimentações da mecatrônica real', () => {
    const required = [
      'W_5V_ESP_TO_RAIL', 'W_3V3_ESP_TO_RAIL', 'W_GND_ESP_TO_RAIL',
      'W_LEVEL_VCC', 'W_LEVEL_GND', 'W_LEVEL_UART', 'W_LEVEL_MODE',
      'W_PN532_VCC', 'W_PN532_GND', 'W_SPI_CS', 'W_SPI_MOSI', 'W_SPI_SCK', 'W_SPI_MISO',
      'W_REED_INTERLOCK', 'W_REED_GND', 'W_LED_STATUS', 'W_LED_GND', 'W_BUZZER_CTRL', 'W_BUZZER_GND', 'W_USBC_MAIN',
    ];
    const byId = new Map(PHYSICAL_WIRING_REGISTRY.map((cable) => [cable.id, cable]));
    expect(PHYSICAL_WIRING_REGISTRY).toHaveLength(required.length);
    required.forEach((id) => expect(byId.has(id)).toBe(true));

    expect(byId.get('W_LEVEL_GND')?.toComponent).toBe('a02yyuw_sen0311');
    expect(byId.get('W_PN532_GND')?.toComponent).toBe('pn532_breakout');
    expect(byId.get('W_REED_GND')?.netName).toBe('GND');
    expect(byId.get('W_LED_GND')?.netName).toBe('GND');
    expect(byId.get('W_LEVEL_MODE')?.fromComponent).toBe('breadboard_830');
    expect(byId.get('W_USBC_MAIN')?.toComponent).toBe('esp32_s3_devkit');
  });
});

