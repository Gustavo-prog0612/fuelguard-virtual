/**
 * FuelGuard Virtual Test Bench — Construtor Canônico de Circuit JSON
 * Converte a topologia de montagem da bancada didática em uma representação
 * Circuit JSON oficial interoperável com o ecossistema tscircuit.
 *
 * Gera esquemático, footprints físicos de PCB, ilhós THT/pads SMD,
 * e rotas de trilhas de cobre chanfradas a 45° baseadas nas coordenadas
 * reais dos pinos na Carrier Board.
 */

import { AnyCircuitElement } from 'circuit-json';
import { FUELGUARD_CAD_LIBRARY, CadComponentMetadata } from './component-library';

export interface BenchConnection {
  fromNode: string;
  fromPin: string;
  toNode: string;
  toPin: string;
  wireColor?: string;
  netName?: string;
}

export interface CircuitJsonPackage {
  schema_version: number;
  cad_engine: string;
  circuit_json_version: string;
  timestamp: string;
  title: string;
  circuit_elements: AnyCircuitElement[];
}

interface ComponentPlacement {
  instanceId: string;
  libraryId: string;
  designator: string;
  pcb: { x: number; y: number };
  sch: { x: number; y: number };
}

/**
 * Construtor e Compilador de Circuit JSON do FuelGuard
 */
export class CircuitJsonBuilder {
  private elements: AnyCircuitElement[] = [];
  private netCounter: number = 1;
  private traceCounter: number = 1;
  private placements: Record<string, ComponentPlacement> = {};

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.elements = [];
    this.netCounter = 1;
    this.traceCounter = 1;
    this.placements = {};
  }

  /**
   * Constrói a placa de circuito impresso da bancada (Carrier PCB 180x120mm)
   */
  public addBoard(widthMm: number = 180, heightMm: number = 120): void {
    const boardElement: AnyCircuitElement = {
      type: 'pcb_board',
      pcb_board_id: 'fuelguard_carrier_board',
      center: { x: 0, y: 0 },
      width: widthMm,
      height: heightMm,
      thickness: 1.6,
      num_layers: 2,
    };
    this.elements.push(boardElement);
  }

  /**
   * Adiciona um componente do catálogo com posicionamento esquemático e PCB
   */
  public addComponent(
    instanceId: string,
    libraryComponentId: string,
    designator: string,
    pcbPosition: { x: number; y: number },
    schematicPosition: { x: number; y: number }
  ): void {
    const meta: CadComponentMetadata = FUELGUARD_CAD_LIBRARY[libraryComponentId];
    if (!meta) {
      console.warn(`[CircuitJsonBuilder] Componente não encontrado na biblioteca: ${libraryComponentId}`);
      return;
    }

    this.placements[instanceId] = {
      instanceId,
      libraryId: libraryComponentId,
      designator,
      pcb: pcbPosition,
      sch: schematicPosition,
    };

    const sourceCompId = `src_comp_${instanceId}`;
    const pcbCompId = `pcb_comp_${instanceId}`;
    const schCompId = `sch_comp_${instanceId}`;

    // 1. Elemento Lógico Canônico (Source Component)
    const sourceComponent: AnyCircuitElement = {
      type: 'source_component',
      source_component_id: sourceCompId,
      name: designator,
      ftype: 'simple_chip',
      supplier_part_numbers: {
        official: [meta.partNumber],
      },
    };
    this.elements.push(sourceComponent);

    // 2. Elemento Físico de PCB (PCB Component)
    const pcbComponent: AnyCircuitElement = {
      type: 'pcb_component',
      pcb_component_id: pcbCompId,
      source_component_id: sourceCompId,
      center: pcbPosition,
      width: meta.dimensionsMm.width,
      height: meta.dimensionsMm.height,
      layer: 'top',
      rotation: 0,
    };
    this.elements.push(pcbComponent);

    // 3. Símbolo no Diagrama Esquemático (Schematic Component)
    const schematicComponent: AnyCircuitElement = {
      type: 'schematic_component',
      schematic_component_id: schCompId,
      source_component_id: sourceCompId,
      center: schematicPosition,
      size: {
        width: Math.max(20, meta.pins.length * 3),
        height: Math.max(16, meta.pins.length * 2.5),
      },
      rotation: 0,
    };
    this.elements.push(schematicComponent);

    // 4. Pinos, Ilhós e Terminais
    meta.pins.forEach((pin, index) => {
      const portId = `port_${instanceId}_${pin.id}`;
      const schPortId = `sch_port_${instanceId}_${pin.id}`;
      const pcbHoleId = `pcb_hole_${instanceId}_${pin.id}`;

      // Porta lógica
      this.elements.push({
        type: 'source_port',
        source_port_id: portId,
        source_component_id: sourceCompId,
        name: pin.label,
        pin_number: pin.pinNumber,
      });

      // Ilhó THT perfurado na PCB
      this.elements.push({
        type: 'pcb_plated_hole',
        pcb_plated_hole_id: pcbHoleId,
        pcb_component_id: pcbCompId,
        x: pcbPosition.x + pin.relativeX,
        y: pcbPosition.y + pin.relativeY,
        outer_diameter: 1.7, // ilhó de cobre padrão 1.7 mm
        hole_diameter: 0.9,  // furação mecânica 0.9 mm para pinos 2.54mm
        layers: ['top', 'bottom'],
      });

      // Terminal gráfico no esquemático
      const isLeft = index % 2 === 0;
      this.elements.push({
        type: 'schematic_port',
        schematic_port_id: schPortId,
        source_port_id: portId,
        center: {
          x: schematicPosition.x + (isLeft ? -15 : 15),
          y: schematicPosition.y + (Math.floor(index / 2) * 5 - 10),
        },
        facing_direction: isLeft ? 'left' : 'right',
      });
    });
  }

  /**
   * Conecta duas portas lógicas através de uma rede (Net) e gera trilhas PCB e esquemáticas
   * com roteamento chanfrado padrão de 45° entre as coordenadas físicas reais dos pads.
   */
  public addConnection(conn: BenchConnection): void {
    const portA = `port_${conn.fromNode}_${conn.fromPin}`;
    const portB = `port_${conn.toNode}_${conn.toPin}`;
    const netName = conn.netName ?? `NET_${this.netCounter++}`;
    const netId = `net_${netName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const traceId = `trace_${this.traceCounter++}`;

    // 1. Rede Lógica (Source Net)
    this.elements.push({
      type: 'source_net',
      source_net_id: netId,
      name: netName,
      member_source_group_ids: [],
    });

    // 2. Conexão Lógica (Source Trace)
    this.elements.push({
      type: 'source_trace',
      source_trace_id: traceId,
      connected_source_port_ids: [portA, portB],
      connected_source_net_ids: [netId],
    });

    // Calcula coordenadas reais dos pinos de origem e destino na PCB
    const fromPlacement = this.placements[conn.fromNode];
    const toPlacement = this.placements[conn.toNode];

    let p1 = { x: -20, y: 0 };
    let p2 = { x: 20, y: 0 };

    if (fromPlacement && toPlacement) {
      const fromMeta = FUELGUARD_CAD_LIBRARY[fromPlacement.libraryId];
      const toMeta = FUELGUARD_CAD_LIBRARY[toPlacement.libraryId];
      const pin1 = fromMeta?.pins.find((p) => p.id === conn.fromPin);
      const pin2 = toMeta?.pins.find((p) => p.id === conn.toPin);

      if (pin1) {
        p1 = {
          x: fromPlacement.pcb.x + pin1.relativeX,
          y: fromPlacement.pcb.y + pin1.relativeY,
        };
      }
      if (pin2) {
        p2 = {
          x: toPlacement.pcb.x + pin2.relativeX,
          y: toPlacement.pcb.y + pin2.relativeY,
        };
      }
    }

    // 3. Trilha Esquemática
    this.elements.push({
      type: 'schematic_trace',
      schematic_trace_id: `sch_${traceId}`,
      source_trace_id: traceId,
      edges: [
        {
          from: { x: p1.x * 0.8, y: p1.y * 0.8 },
          to: { x: p2.x * 0.8, y: p2.y * 0.8 },
        },
      ],
    });

    // 4. Roteamento de Trilha PCB com Chanfros a 45°
    const isPower = netName.includes('5V') || netName.includes('GND') || netName.includes('VCC') || netName.includes('3V3');
    const traceWidth = isPower ? 0.8 : 0.35;
    const layer = (netName === 'GND' || netName.includes('SPI_MISO')) ? 'bottom' : 'top';

    // Rota geométrica chanfrada com 4 pontos (origem -> dobra 45° -> alinhamento -> destino)
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const midX = p1.x + dx * 0.5;
    const cornerOffset = Math.min(Math.abs(dx * 0.3), Math.abs(dy * 0.3), 5.0) * Math.sign(dx || 1);

    const routePoints = [
      { x: Number(p1.x.toFixed(2)), y: Number(p1.y.toFixed(2)), width: traceWidth, layer },
      { x: Number((midX - cornerOffset).toFixed(2)), y: Number(p1.y.toFixed(2)), width: traceWidth, layer },
      { x: Number((midX + cornerOffset).toFixed(2)), y: Number(p2.y.toFixed(2)), width: traceWidth, layer },
      { x: Number(p2.x.toFixed(2)), y: Number(p2.y.toFixed(2)), width: traceWidth, layer },
    ];

    this.elements.push({
      type: 'pcb_trace',
      pcb_trace_id: `pcb_${traceId}`,
      source_trace_id: traceId,
      route: routePoints,
    });
  }

  /**
   * Constrói o circuito canônico padrão nominal seguro da bancada FuelGuard
   */
  public buildNominalBenchCircuit(): CircuitJsonPackage {
    this.reset();

    // 1. Cria a placa principal (180mm x 120mm)
    this.addBoard(180, 120);

    // 2. Posiciona os componentes na placa
    // ESP32-S3 DevKitC (Centro Esquerdo: X=-50, Y=0)
    this.addComponent('esp32', 'esp32_s3_devkit', 'U1', { x: -50, y: 0 }, { x: -60, y: 0 });

    // Buffer SN74AHCT125N (Centro Superior: X=0, Y=35)
    this.addComponent('buffer', 'sn74ahct125n', 'U2', { x: 0, y: 35 }, { x: 0, y: 30 });

    // Divisor Resistivo 10k/15k (Centro Inferior: X=0, Y=-35)
    this.addComponent('divider', 'voltage_divider', 'R_DIV1', { x: 0, y: -35 }, { x: 0, y: -30 });

    // Sensor JSN-SR04T (Direita Superior: X=60, Y=35)
    this.addComponent('jsn', 'jsn_sr04t', 'SEN1', { x: 60, y: 35 }, { x: 60, y: 30 });

    // Módulo PN532 (Direita Inferior: X=60, Y=-30)
    this.addComponent('pn532', 'pn532_breakout', 'RFID1', { x: 60, y: -30 }, { x: 60, y: -30 });

    // Reed Switch (Extremo Direito Centro: X=60, Y=0)
    this.addComponent('reed', 'reed_switch', 'SW1', { x: 60, y: 0 }, { x: 60, y: 0 });

    // LED Indicador (Centro: X=0, Y=0)
    this.addComponent('led', 'led_indicator', 'D1', { x: 0, y: 0 }, { x: 0, y: 0 });

    // 3. Fiação Elétrica Padrão Segura
    const nominalConnections: BenchConnection[] = [
      // Barramento de Terra Comum (RULE-03)
      { fromNode: 'esp32', fromPin: 'gnd', toNode: 'buffer', toPin: 'gnd', netName: 'GND' },
      { fromNode: 'esp32', fromPin: 'gnd', toNode: 'divider', toPin: 'gnd', netName: 'GND' },
      { fromNode: 'esp32', fromPin: 'gnd', toNode: 'jsn', toPin: 'gnd', netName: 'GND' },
      { fromNode: 'esp32', fromPin: 'gnd', toNode: 'pn532', toPin: 'gnd', netName: 'GND' },
      { fromNode: 'esp32', fromPin: 'gnd', toNode: 'reed', toPin: 'pin2', netName: 'GND' },
      { fromNode: 'esp32', fromPin: 'gnd', toNode: 'led', toPin: 'cathode', netName: 'GND' },

      // Barramento +5V USB
      { fromNode: 'esp32', fromPin: '5v', toNode: 'buffer', toPin: 'vcc', netName: '+5V' },
      { fromNode: 'esp32', fromPin: '5v', toNode: 'jsn', toPin: 'vcc', netName: '+5V' },

      // Habilitação do Buffer /1OE -> GND
      { fromNode: 'buffer', fromPin: '1oe', toNode: 'esp32', toPin: 'gnd', netName: 'GND' },

      // Barramento +3V3 LDO
      { fromNode: 'esp32', fromPin: '3v3', toNode: 'pn532', toPin: 'vcc', netName: '+3V3' },

      // Sinal de Disparo Ultrassônico (RULE-02)
      { fromNode: 'esp32', fromPin: 'gpio5', toNode: 'buffer', toPin: '1a', netName: 'TRIG_3V3' },
      { fromNode: 'buffer', fromPin: '1y', toNode: 'jsn', toPin: 'trig', netName: 'TRIG_5V0' },

      // Sinal de Eco Protegido pelo Divisor (RULE-01)
      { fromNode: 'jsn', fromPin: 'echo', toNode: 'divider', toPin: 'vin', netName: 'ECHO_5V' },
      { fromNode: 'divider', fromPin: 'vout', toNode: 'esp32', toPin: 'gpio6', netName: 'ECHO_3V0_SAFE' },

      // Reed Switch com debounce no GPIO7
      { fromNode: 'reed', fromPin: 'pin1', toNode: 'esp32', toPin: 'gpio7', netName: 'REED_LID' },

      // LED com resistor no GPIO4
      { fromNode: 'esp32', fromPin: 'gpio4', toNode: 'led', toPin: 'anode', netName: 'LED_STATUS' },

      // Barramento SPI do PN532
      { fromNode: 'esp32', fromPin: 'gpio10', toNode: 'pn532', toPin: 'ss', netName: 'SPI_CS' },
      { fromNode: 'esp32', fromPin: 'gpio11', toNode: 'pn532', toPin: 'mosi', netName: 'SPI_MOSI' },
      { fromNode: 'esp32', fromPin: 'gpio12', toNode: 'pn532', toPin: 'sck', netName: 'SPI_SCK' },
      { fromNode: 'esp32', fromPin: 'gpio13', toNode: 'pn532', toPin: 'miso', netName: 'SPI_MISO' },
    ];

    nominalConnections.forEach((c) => this.addConnection(c));

    return {
      schema_version: 1,
      cad_engine: 'tscircuit',
      circuit_json_version: '0.0.505',
      timestamp: new Date().toISOString(),
      title: 'FuelGuard Virtual Test Bench — Topologia Eletrônica Canônica',
      circuit_elements: [...this.elements],
    };
  }

  /**
   * Constrói o circuito com a falha de 5V direto no pino GPIO6 (para testes de DRC)
   */
  public buildFaultyBenchCircuit(): CircuitJsonPackage {
    const pkg = this.buildNominalBenchCircuit();
    // Substitui a conexão segura de echo por conexão direta fatal de 5V
    const filtered = pkg.circuit_elements.filter((el) => {
      if (el.type === 'source_trace') {
        const ports = (el as any).connected_source_port_ids ?? [];
        return !ports.includes('port_divider_vout');
      }
      return true;
    });

    // Injeta a trilha de 5V direto no GPIO6
    filtered.push({
      type: 'source_net',
      source_net_id: 'net_echo_5v_fatal',
      name: 'ECHO_5V_FATAL',
      member_source_group_ids: [],
    });
    filtered.push({
      type: 'source_trace',
      source_trace_id: 'trace_fault_5v',
      connected_source_port_ids: ['port_jsn_echo', 'port_esp32_gpio6'],
      connected_source_net_ids: ['net_echo_5v_fatal'],
    });

    return {
      ...pkg,
      circuit_elements: filtered,
    };
  }
}
