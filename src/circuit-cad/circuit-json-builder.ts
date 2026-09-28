/** Construtor Circuit JSON da topologia elétrica real de bancada FuelGuard. */
import { AnyCircuitElement } from 'circuit-json';
import { FUELGUARD_CAD_LIBRARY, CadComponentMetadata } from './component-library';
import { FUELGUARD_BOARD_STATUS, HardwareScope, PcbReadiness } from '@/../hardware/board-status';

export interface BenchConnection { fromNode: string; fromPin: string; toNode: string; toPin: string; wireColor?: string; netName?: string; }
export interface CircuitJsonPackage { schema_version: number; cad_engine: string; circuit_json_version: string; timestamp: string; title: string; scope: HardwareScope; pcbReadiness: PcbReadiness; sourceOfTruth: string[]; evidence: string[]; circuit_elements: AnyCircuitElement[]; }
interface ComponentPlacement { instanceId: string; libraryId: string; designator: string; pcb: { x: number; y: number }; sch: { x: number; y: number }; }

export class CircuitJsonBuilder {
  private elements: AnyCircuitElement[] = [];
  private netCounter = 1;
  private traceCounter = 1;
  private placements: Record<string, ComponentPlacement> = {};
  private emitPcb = false;

  public reset(): void { this.elements = []; this.netCounter = 1; this.traceCounter = 1; this.placements = {}; this.emitPcb = false; }
  public constructor() { this.reset(); }
  public addBoard(widthMm = 180, heightMm = 120): void { this.elements.push({ type: 'pcb_board', pcb_board_id: 'fuelguard_carrier_board', center: { x: 0, y: 0 }, width: widthMm, height: heightMm, thickness: 1.6, num_layers: 2 }); }

  public addComponent(instanceId: string, libraryComponentId: string, designator: string, pcbPosition: { x: number; y: number }, schematicPosition: { x: number; y: number }, options: { emitPcb?: boolean } = {}): void {
    const meta: CadComponentMetadata | undefined = FUELGUARD_CAD_LIBRARY[libraryComponentId];
    if (!meta) return;
    this.placements[instanceId] = { instanceId, libraryId: libraryComponentId, designator, pcb: pcbPosition, sch: schematicPosition };
    const sourceCompId = `src_comp_${instanceId}`;
    this.elements.push({ type: 'source_component', source_component_id: sourceCompId, name: designator, ftype: 'simple_chip', supplier_part_numbers: { official: [meta.partNumber] } });
    const shouldEmitPcb = options.emitPcb ?? this.emitPcb;
    const pcbCompId = `pcb_comp_${instanceId}`;
    if (shouldEmitPcb) this.elements.push({ type: 'pcb_component', pcb_component_id: pcbCompId, source_component_id: sourceCompId, center: pcbPosition, width: meta.dimensionsMm.width, height: meta.dimensionsMm.height, layer: 'top', rotation: 0 });
    this.elements.push({ type: 'schematic_component', schematic_component_id: `sch_comp_${instanceId}`, source_component_id: sourceCompId, center: schematicPosition, size: { width: Math.max(20, meta.pins.length * 3), height: Math.max(16, meta.pins.length * 2.5) }, rotation: 0 });
    meta.pins.forEach((pin, index) => {
      const portId = `port_${instanceId}_${pin.id}`;
      this.elements.push({ type: 'source_port', source_port_id: portId, source_component_id: sourceCompId, name: pin.label, pin_number: pin.pinNumber });
      if (shouldEmitPcb) this.elements.push({ type: 'pcb_plated_hole', pcb_plated_hole_id: `pcb_hole_${instanceId}_${pin.id}`, pcb_component_id: pcbCompId, x: pcbPosition.x + pin.relativeX, y: pcbPosition.y + pin.relativeY, outer_diameter: 1.7, hole_diameter: 0.9, layers: ['top', 'bottom'] });
      const isLeft = index % 2 === 0;
      this.elements.push({ type: 'schematic_port', schematic_port_id: `sch_port_${instanceId}_${pin.id}`, source_port_id: portId, center: { x: schematicPosition.x + (isLeft ? -15 : 15), y: schematicPosition.y + (Math.floor(index / 2) * 5 - 10) }, facing_direction: isLeft ? 'left' : 'right' });
    });
  }

  public addConnection(conn: BenchConnection): void {
    const portA = `port_${conn.fromNode}_${conn.fromPin}`;
    const portB = `port_${conn.toNode}_${conn.toPin}`;
    const netName = conn.netName ?? `NET_${this.netCounter++}`;
    const netId = `net_${netName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const traceId = `trace_${this.traceCounter++}`;
    this.elements.push({ type: 'source_net', source_net_id: netId, name: netName, member_source_group_ids: [] });
    this.elements.push({ type: 'source_trace', source_trace_id: traceId, connected_source_port_ids: [portA, portB], connected_source_net_ids: [netId] });
    const from = this.placements[conn.fromNode];
    const to = this.placements[conn.toNode];
    const p1 = from ? this.pinPosition(from, conn.fromPin) : { x: -20, y: 0 };
    const p2 = to ? this.pinPosition(to, conn.toPin) : { x: 20, y: 0 };
    this.elements.push({ type: 'schematic_trace', schematic_trace_id: `sch_${traceId}`, source_trace_id: traceId, edges: [{ from: { x: p1.x * 0.8, y: p1.y * 0.8 }, to: { x: p2.x * 0.8, y: p2.y * 0.8 } }] });
    if (this.emitPcb) this.elements.push({ type: 'pcb_trace', pcb_trace_id: `pcb_${traceId}`, source_trace_id: traceId, route: [{ x: p1.x, y: p1.y, width: 0.35, layer: 'top' }, { x: p2.x, y: p2.y, width: 0.35, layer: 'top' }] });
  }

  private pinPosition(placement: ComponentPlacement, pinId: string): { x: number; y: number } {
    const pin = FUELGUARD_CAD_LIBRARY[placement.libraryId]?.pins.find((candidate) => candidate.id === pinId);
    return pin ? { x: placement.pcb.x + pin.relativeX, y: placement.pcb.y + pin.relativeY } : placement.pcb;
  }

  public buildNominalBenchCircuit(options: { includePcb?: boolean } = {}): CircuitJsonPackage {
    this.reset();
    this.emitPcb = options.includePcb === true;
    if (this.emitPcb) this.addBoard(180, 120);
    this.addComponent('esp32', 'esp32_s3_devkit', 'U1', { x: -50, y: 0 }, { x: -60, y: 0 });
    this.addComponent('level', 'a02yyuw_sen0311', 'SEN1', { x: 20, y: 35 }, { x: 35, y: 30 });
    this.addComponent('pn532', 'pn532_breakout', 'RFID1', { x: 60, y: -25 }, { x: 60, y: -25 });
    this.addComponent('reed', 'reed_switch', 'SW1', { x: 60, y: 5 }, { x: 60, y: 5 });
    this.addComponent('led', 'led_indicator', 'D1', { x: 0, y: -25 }, { x: 0, y: -25 });
    this.addComponent('buzzer', 'buzzer_active', 'BZ1', { x: 25, y: -25 }, { x: 25, y: -25 });
    const c: BenchConnection[] = [
      { fromNode: 'esp32', fromPin: 'gnd', toNode: 'level', toPin: 'gnd', netName: 'GND' },
      { fromNode: 'esp32', fromPin: 'gnd', toNode: 'pn532', toPin: 'gnd', netName: 'GND' },
      { fromNode: 'esp32', fromPin: 'gnd', toNode: 'reed', toPin: 'pin2', netName: 'GND' },
      { fromNode: 'esp32', fromPin: 'gnd', toNode: 'led', toPin: 'cathode', netName: 'GND' },
      { fromNode: 'esp32', fromPin: 'gnd', toNode: 'buzzer', toPin: 'gnd', netName: 'GND' },
      { fromNode: 'esp32', fromPin: '3v3', toNode: 'level', toPin: 'vcc', netName: '+3V3' },
      { fromNode: 'esp32', fromPin: '3v3', toNode: 'level', toPin: 'rx_mode', netName: 'LEVEL_MODE_PROCESSED' },
      { fromNode: 'level', fromPin: 'tx', toNode: 'esp32', toPin: 'gpio16', netName: 'LEVEL_UART_RX' },
      { fromNode: 'esp32', fromPin: 'gpio7', toNode: 'reed', toPin: 'pin1', netName: 'LID_INTERLOCK' },
      { fromNode: 'esp32', fromPin: 'gpio4', toNode: 'led', toPin: 'anode', netName: 'STATUS_LED_CTRL' },
      { fromNode: 'esp32', fromPin: 'gpio14', toNode: 'buzzer', toPin: 'ctrl', netName: 'BUZZER_CTRL' },
      { fromNode: 'esp32', fromPin: '3v3', toNode: 'pn532', toPin: 'vcc', netName: '+3V3' },
      { fromNode: 'esp32', fromPin: 'gpio10', toNode: 'pn532', toPin: 'ss', netName: 'SPI_CS' },
      { fromNode: 'esp32', fromPin: 'gpio11', toNode: 'pn532', toPin: 'mosi', netName: 'SPI_MOSI' },
      { fromNode: 'esp32', fromPin: 'gpio12', toNode: 'pn532', toPin: 'sck', netName: 'SPI_SCK' },
      { fromNode: 'esp32', fromPin: 'gpio13', toNode: 'pn532', toPin: 'miso', netName: 'SPI_MISO' },
    ];
    c.forEach((connection) => this.addConnection(connection));
    return { schema_version: 1, cad_engine: 'tscircuit', circuit_json_version: '0.0.505', timestamp: new Date().toISOString(), title: 'FuelGuard — Topologia real da bancada', scope: FUELGUARD_BOARD_STATUS.scope, pcbReadiness: this.emitPcb ? 'routed-unverified' : FUELGUARD_BOARD_STATUS.pcbReadiness, sourceOfTruth: FUELGUARD_BOARD_STATUS.sourceOfTruth, evidence: FUELGUARD_BOARD_STATUS.evidence.map((item) => item.reference), circuit_elements: [...this.elements] };
  }

  public buildFaultyBenchCircuit(): CircuitJsonPackage {
    const pkg = this.buildNominalBenchCircuit();
    const filtered = pkg.circuit_elements.filter((element) => !(element.type === 'source_trace' && (element as any).connected_source_port_ids?.includes('port_level_tx')));
    filtered.push({ type: 'source_net', source_net_id: 'net_level_uart_5v_fatal', name: 'LEVEL_UART_5V_FATAL', member_source_group_ids: [] });
    filtered.push({ type: 'source_trace', source_trace_id: 'trace_fault_uart_5v', connected_source_port_ids: ['port_level_tx_5v', 'port_esp32_gpio16'], connected_source_net_ids: ['net_level_uart_5v_fatal'] });
    return { ...pkg, circuit_elements: filtered };
  }
}
