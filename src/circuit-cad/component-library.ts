/** Catálogo CAD da configuração real da bancada FuelGuard. */

export type CadModelValidation = 'exact_verified' | 'documented_reference' | 'vendor_lot_specific' | 'site_specific' | 'didactic_approximate' | 'passive_parametric';
export type CadConfidenceLevel = 'A' | 'B' | 'C' | 'D';
export type CadAssetStatus = 'verified' | 'approximate' | 'pending' | 'unavailable';
export type CadAssetSourceType = 'manufacturer' | 'kicad' | 'community' | 'derived' | 'procedural';

export interface CadAssetDimensionsMm {
  width: number;
  height: number;
  depth: number;
}

export interface CadAssetTransform {
  scale: { x: number; y: number; z: number };
  rotationDeg: { x: number; y: number; z: number };
  translationMm: { x: number; y: number; z: number };
}

export interface ComponentPinDefinition {
  id: string; pinNumber: number; label: string;
  signalType: 'power' | 'ground' | 'digital_in' | 'digital_out' | 'passive' | 'spi_clock' | 'spi_data';
  nominalVoltageV: number; description: string; relativeX: number; relativeY: number;
}

export interface CadComponentMetadata {
  id: string; designatorPrefix: string; name: string; manufacturer: string; partNumber: string; revision: string; description: string;
  nominalDimensionsMm: { width: number; height: number; depth: number };
  dimensionsMm: { width: number; height: number; depth: number };
  footprintType: string; confidenceLevel: CadConfidenceLevel; confidenceRationale: string; validationStatus: CadModelValidation;
  license: string; sourceReference: string; sourceUrl: string; format: 'STEP' | 'GLB' | 'Procedural Parametric' | 'KiCad 3D';
  verificationDate: string; inferredDimensions: string[]; replacementInstructions: string; connectedNets: string[]; disclaimerNote?: string; pins: ComponentPinDefinition[];
  assetPath?: string;
  assetStatus?: CadAssetStatus;
  assetSourceType?: CadAssetSourceType;
  assetChecksum?: string;
  assetDimensionsMm?: CadAssetDimensionsMm;
  assetTransform?: CadAssetTransform;
  assetLimitations?: string[];
}

const pin = (id: string, pinNumber: number, label: string, signalType: ComponentPinDefinition['signalType'], nominalVoltageV: number, description: string, relativeX = 0, relativeY = 0): ComponentPinDefinition => ({ id, pinNumber, label, signalType, nominalVoltageV, description, relativeX, relativeY });

const make = (data: Partial<CadComponentMetadata> & Pick<CadComponentMetadata, 'id' | 'designatorPrefix' | 'name' | 'partNumber' | 'dimensionsMm'>): CadComponentMetadata => ({
  manufacturer: 'A definir', revision: 'baseline 2026-09-28', description: data.name,
  nominalDimensionsMm: data.dimensionsMm, footprintType: 'PENDING_PHYSICAL_RELEASE', confidenceLevel: 'C',
  confidenceRationale: 'Referência de engenharia; confirmar a unidade física antes de liberar montagem ou fabricação.',
  validationStatus: 'documented_reference', license: 'manufacturer-reference', sourceReference: 'FuelGuard engineering catalog', sourceUrl: 'https://github.com/Gustavo-prog0612/fuelguard-virtual',
  format: 'Procedural Parametric', verificationDate: '2026-09-28', inferredDimensions: [], replacementInstructions: 'Medir a unidade comprada e atualizar o registro de evidência.', connectedNets: [], pins: [], ...data,
});

export const FUELGUARD_CAD_LIBRARY: Record<string, CadComponentMetadata> = {
  esp32_s3_devkit: make({
    id: 'esp32_s3_devkit', designatorPrefix: 'U1', name: 'ESP32-S3-DevKitC-1-N8R8 v1.1', manufacturer: 'Espressif Systems', partNumber: 'ESP32-S3-DevKitC-1-N8R8',
    dimensionsMm: { width: 25.5, height: 68, depth: 12 }, nominalDimensionsMm: { width: 25.5, height: 68, depth: 12.8 }, footprintType: '2x22 headers 2.54 mm / span 22.86 mm', confidenceLevel: 'B', validationStatus: 'documented_reference', license: 'FuelGuard reconstruction from manufacturer reference; source redistribution terms apply', sourceReference: 'Espressif official DevKitC-1 v1.1 guide, DXF and PCB drawing', sourceUrl: 'https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-devkitc-1/user_guide_v1.1.html', format: 'GLB', inferredDimensions: ['Header height, connector body and component placement reconstructed from official references; validate against received unit'], connectedNets: ['+5V_VBUS', '+3.3V', 'GND', 'LEVEL_UART_RX', 'LEVEL_MODE_PROCESSED', 'BUZZER_CTRL', 'LID_INTERLOCK', 'SPI_CS', 'SPI_MOSI', 'SPI_SCK', 'SPI_MISO'], pins: [
      pin('3v3', 1, '3V3', 'power', 3.3, 'Saída regulada 3,3 V', -11.43, 30.48), pin('5v', 2, '5V (USB)', 'power', 5, 'VBUS da alimentação Micro-USB', -11.43, 27.94), pin('gnd', 3, 'GND', 'ground', 0, 'Terra comum', -11.43, 25.4), pin('gpio4', 4, 'IO4 (LED)', 'digital_out', 3.3, 'LED via R3 220 Ω', -11.43, 22.86), pin('gpio14', 14, 'IO14 (BUZZER)', 'digital_out', 3.3, 'Buzzer ativo', -11.43, 20.32), pin('gpio16', 16, 'IO16 (UART1_RX)', 'digital_in', 3.3, 'TX do SEN0311', -11.43, 17.78), pin('gpio7', 7, 'IO7 (LID)', 'digital_in', 3.3, 'MC-38', 11.43, 30.48), pin('gpio10', 10, 'IO10 (CS)', 'digital_out', 3.3, 'PN532 SS', 11.43, 22.86), pin('gpio11', 11, 'IO11 (MOSI)', 'spi_data', 3.3, 'PN532 MOSI', 11.43, 20.32), pin('gpio12', 12, 'IO12 (SCK)', 'spi_clock', 3.3, 'PN532 SCK', 11.43, 17.78), pin('gpio13', 13, 'IO13 (MISO)', 'spi_data', 3.3, 'PN532 MISO', 11.43, 15.24),
    ], replacementInstructions: 'Usar o esquemático, PCB e DXF oficiais da revisão v1.1; confirmar headers na unidade.',
  }),
  sn74ahct125n: make({
    id: 'sn74ahct125n',
    designatorPrefix: 'U2',
    name: 'SN74AHCT125N Quad Buffer/Line Driver',
    manufacturer: 'Texas Instruments',
    partNumber: 'SN74AHCT125N',
    revision: 'DIP-14 W7.62 mm / JEDEC MS-001 BA',
    dimensionsMm: { width: 7.874, height: 6.98, depth: 19.05 },
    nominalDimensionsMm: { width: 7.874, height: 6.98, depth: 19.05 },
    footprintType: 'Package_DIP:DIP-14_W7.62mm',
    confidenceLevel: 'B',
    validationStatus: 'documented_reference',
    confidenceRationale: 'Encapsulamento DIP-14 confirmado pela biblioteca KiCad; marcação e lote do CI permanecem dependentes da compra.',
    license: 'KiCad library license / CC-BY-SA-4.0',
    sourceReference: 'KiCad Packages3D / Package_DIP.3dshapes/DIP-14_W7.62mm.step',
    sourceUrl: 'https://gitlab.com/kicad/libraries/kicad-packages3D',
    format: 'GLB',
    verificationDate: '2026-09-26',
    assetPath: '/assets/cad/carrier/U2/model.glb',
    assetStatus: 'verified',
    assetSourceType: 'kicad',
    assetChecksum: '20bfc306d3cbc3b22657b74df431439c081b8ebe6c2eb3268bba5ec2b2b6a3ff',
    assetDimensionsMm: { width: 7.874, height: 6.98, depth: 19.05 },
    assetTransform: { scale: { x: 1, y: 1, z: 1 }, rotationDeg: { x: -90, y: 0, z: 0 }, translationMm: { x: 0, y: 0, z: 0 } },
    assetLimitations: ['O GLB representa o encapsulamento DIP-14 padronizado, não uma gravação comercial específica.'],
    inferredDimensions: ['Pinagem e marcação devem ser conferidas no datasheet da variante comprada.'],
    connectedNets: ['+5V_VBUS', '+3.3V', 'LEVEL_UART_RX', 'LEVEL_MODE_PROCESSED'],
  }),
  voltage_divider: make({
    id: 'voltage_divider',
    designatorPrefix: 'R1/R2',
    name: 'Divisor resistivo THT 10 kΩ / 15 kΩ',
    manufacturer: 'Passivos THT — valores separados',
    partNumber: 'DIV-10K-15K-1%',
    revision: 'Axial DIN0207 P10.16 mm',
    dimensionsMm: { width: 10.76, height: 5.5, depth: 2.5 },
    nominalDimensionsMm: { width: 10.76, height: 5.5, depth: 2.5 },
    footprintType: 'Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal × 2',
    confidenceLevel: 'B',
    validationStatus: 'documented_reference',
    confidenceRationale: 'O encapsulamento axial é padronizado pela biblioteca KiCad; R1 = 10 kΩ e R2 = 15 kΩ continuam componentes elétricos distintos.',
    license: 'KiCad library license / CC-BY-SA-4.0',
    sourceReference: 'KiCad Packages3D / Resistor_THT.3dshapes/R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal.step',
    sourceUrl: 'https://gitlab.com/kicad/libraries/kicad-packages3D',
    format: 'GLB',
    verificationDate: '2026-09-26',
    assetPath: '/assets/cad/carrier/R_DIV/model.glb',
    assetStatus: 'verified',
    assetSourceType: 'kicad',
    assetChecksum: '1b55294a45b9fe810f8728044e18d9b83f03f82dd59134b432ceb2709bbb9d22',
    assetDimensionsMm: { width: 10.76, height: 5.5, depth: 2.5 },
    assetTransform: { scale: { x: 1, y: 1, z: 1 }, rotationDeg: { x: -90, y: 0, z: 0 }, translationMm: { x: 0, y: 0, z: 0 } },
    assetLimitations: ['O GLB é uma geometria axial reutilizável; os valores R1/R2 e a dobra dos terminais devem continuar separados na montagem.'],
    inferredDimensions: ['Passo e dobra final dependem da montagem na protoboard.'],
    connectedNets: ['LEVEL_SENSE_RAW', 'GND'],
  }),
  a02yyuw_sen0311: make({
    id: 'a02yyuw_sen0311', designatorPrefix: 'SEN1', name: 'DFRobot A02YYUW / SEN0311', manufacturer: 'DFRobot', partNumber: 'SEN0311', dimensionsMm: { width: 84.6, height: 29.6, depth: 12.5 }, footprintType: 'GLB de referência; suporte centralizado na tampa', confidenceLevel: 'B', validationStatus: 'documented_reference', license: 'FuelGuard reconstruction from DFRobot/Mouser mechanical reference', sourceReference: 'DFRobot SEN0311 wiki + A02YYUW mechanical drawing', sourceUrl: 'https://wiki.dfrobot.com/sen0311/', connectedNets: ['+3.3V', 'GND', 'LEVEL_UART_RX', 'LEVEL_MODE_PROCESSED'], inferredDimensions: ['Cabo 300 ± 10 mm; terminal PH2.0-4P; confirmar lote'], disclaimerNote: 'GLB reconstruído a partir do desenho mecânico; medir a unidade recebida antes de fabricar.', format: 'GLB', pins: [pin('vcc', 1, 'VCC (3V3)', 'power', 3.3, 'Alimentação em 3,3 V', 0, 3.81), pin('gnd', 2, 'GND', 'ground', 0, 'Retorno comum', 0, 1.27), pin('rx_mode', 3, 'RX (MODE)', 'digital_in', 3.3, 'HIGH seleciona saída processada', 0, -1.27), pin('tx', 4, 'TX (UART)', 'digital_out', 3.3, '9600 8N1 para GPIO16', 0, -3.81)],
  }),
  pn532_breakout: make({
    id: 'pn532_breakout', designatorPrefix: 'RFID1', name: 'Adafruit PN532 RFID/NFC Breakout v1.6', manufacturer: 'Adafruit', partNumber: 'PN532-BREAKOUT-V1.6', revision: 'v1.6', dimensionsMm: { width: 120, height: 5.3, depth: 50 }, nominalDimensionsMm: { width: 120, height: 1.6, depth: 50 }, footprintType: 'Adafruit Eagle v1.6 · JP4 1×08 + JP3 1×12 + CN1 1×06', confidenceLevel: 'C', validationStatus: 'documented_reference', license: 'CC-BY-SA-3.0', sourceReference: 'Adafruit PN532_Breakout_v1.6.brd/.sch; GLB derivado local para inspeção', sourceUrl: 'https://github.com/adafruit/Adafruit-PN532-RFID-NFC-Breakout', connectedNets: ['+3.3V', 'GND', 'SPI_CS', 'SPI_MOSI', 'SPI_SCK', 'SPI_MISO'], inferredDimensions: ['Outline oficial 120 × 50 mm; furos M3 em (4.944,5), (4.944,45), (114.944,5), (114.944,45) mm; JP4.1=VDD, JP4.8=GND, JP4.2=SCK, JP4.3=MISO, JP4.4=MOSI, JP4.5=NSS/CS, JP4.7=IRQ, JP4.6=RSTOUT_N'], disclaimerNote: 'O GLB é derivado do Eagle oficial e ainda requer conferência da unidade física e da altura real dos headers antes do suporte.', pins: [pin('vcc', 1, 'JP4.1 VDD', 'power', 3.3, 'Alimentação de 3,3 V'), pin('sck', 2, 'JP4.2 SCK', 'spi_clock', 3.3, 'SPI clock'), pin('miso', 3, 'JP4.3 MISO', 'spi_data', 3.3, 'PN532 para ESP32'), pin('mosi', 4, 'JP4.4 MOSI/SDA/TX', 'spi_data', 3.3, 'ESP32 para PN532'), pin('ss', 5, 'JP4.5 NSS/SCL/RX', 'digital_in', 3.3, 'Chip select em SPI'), pin('rsto', 6, 'JP4.6 RSTOUT_N', 'digital_out', 3.3, 'Auxiliar não usado'), pin('irq', 7, 'JP4.7 IRQ', 'digital_out', 3.3, 'Auxiliar não usado'), pin('gnd', 8, 'JP4.8 GND', 'ground', 0, 'Terra comum')],
  }),
  reed_switch: make({
    id: 'reed_switch', designatorPrefix: 'SW1', name: 'MC-38 Reed Switch + ímã', manufacturer: 'MC-38 family / TinyTronics reference', partNumber: 'MC-38-VENDOR-LOT-REFERENCE', dimensionsMm: { width: 27, height: 10, depth: 36 }, footprintType: 'GLB de referência; suporte externo vendor-lot-specific', confidenceLevel: 'C', validationStatus: 'documented_reference', sourceReference: 'MC-38 vendor reference dimensions', sourceUrl: 'https://www.tinytronics.nl/en/switches/magnetic-switches/door-switch-reed-relay-with-magnet', license: 'FuelGuard reconstruction from vendor reference dimensions', format: 'GLB', inferredDimensions: ['Família sem MPN único; cabo, gap e NO/NC dependem do lote'], disclaimerNote: 'Confirmar unidade comprada antes de fabricar.', connectedNets: ['LID_INTERLOCK', 'GND'], pins: [pin('pin1', 1, 'Sinal (IO7)', 'passive', 3.3, 'GPIO7 com pull-up interno', 0, 2.54), pin('pin2', 2, 'GND', 'ground', 0, 'Retorno comum', 0, -2.54)],
  }),
  breadboard_830: make({ id: 'breadboard_830', designatorPrefix: 'BB1', name: 'Protoboard MB-102 830 pontos', manufacturer: 'Vendor-lot-specific', partNumber: 'MB-102-830', dimensionsMm: { width: 165, height: 8.5, depth: 55 }, nominalDimensionsMm: { width: 165, height: 8.5, depth: 55 }, confidenceLevel: 'C', validationStatus: 'vendor_lot_specific', sourceReference: 'MB-102 reference datasheets', sourceUrl: 'https://handsontec.com/dataspecs/m102-830-bread-board.pdf', connectedNets: ['+5V_VBUS', '+3.3V', 'GND'], disclaimerNote: 'Medir o exemplar antes de congelar a bancada.' }),
  tank_cylinder: make({ id: 'tank_cylinder', designatorPrefix: 'TK1', name: 'Tanque cilíndrico acrílico FG-TANK-5L-CYL-R1', manufacturer: 'FuelGuard bench design', partNumber: 'FG-TANK-5L-CYL-R1', dimensionsMm: { width: 206, height: 168, depth: 206 }, footprintType: 'Cilindro acrílico paramétrico Ø206; tampa circular 4x M3', confidenceLevel: 'C', validationStatus: 'site_specific', sourceReference: 'Baseline paramétrica aprovada pelo projeto', sourceUrl: 'https://cadquery.github.io/', connectedNets: ['LID_INTERLOCK'], disclaimerNote: 'Baseline paramétrica: interno Ø200×160 mm; capacidade geométrica 5,0265 L; operação recomendada até aproximadamente 4,084 L; fabricar, medir e calibrar.' }),
  usb_cable_assembly: make({ id: 'usb_cable_assembly', designatorPrefix: 'CBL_USB', name: 'Cabo USB-C para Micro-USB · 1 m · dados', manufacturer: 'A selecionar', partNumber: 'CABLE-USBC-MICROUSB-1M', dimensionsMm: { width: 0, height: 0, depth: 0 }, confidenceLevel: 'C', validationStatus: 'vendor_lot_specific', sourceReference: 'Referência comercial do cabo; o conector Micro-USB atende as portas documentadas do U1', sourceUrl: 'https://www.filipeflop.com/produto/cabo-usb-c-micro-usb/', connectedNets: ['USB_5V_POWER_DATA', 'GND'], disclaimerNote: 'O cabo permanece aproximação vendor-lot-specific: confirmar dados, comprimento, diâmetro e compatibilidade com a unidade comprada.' }),
  led_indicator: make({ id: 'led_indicator', designatorPrefix: 'D1', name: 'LED verde Ø5 mm + resistor R3 220 Ω', manufacturer: 'Kingbright / equivalente', partNumber: 'WP7113GD + 220R', dimensionsMm: { width: 5, height: 8.6, depth: 5 }, nominalDimensionsMm: { width: 5, height: 8.6, depth: 5 }, footprintType: 'LED_THT:LED_D5.0mm + resistor a selecionar', confidenceLevel: 'B', validationStatus: 'documented_reference', license: 'FuelGuard reconstruction from manufacturer reference', sourceReference: 'Kingbright WP7113GD datasheet', sourceUrl: 'https://www.kingbrightusa.com/images/catalog/SPEC/WP7113GD.pdf', connectedNets: ['STATUS_LED_CTRL', 'GND'], pins: [pin('anode', 1, 'Anodo (via 220R)', 'passive', 3.3, 'GPIO4 através de R3'), pin('cathode', 2, 'Catodo', 'ground', 0, 'GND')] }),
  buzzer_active: make({ id: 'buzzer_active', designatorPrefix: 'BZ1', name: 'Buzzer ativo Same Sky CMI-1295IC-0385T', manufacturer: 'Same Sky', partNumber: 'CMI-1295IC-0385T', dimensionsMm: { width: 12, height: 9.5, depth: 12 }, nominalDimensionsMm: { width: 12, height: 9.5, depth: 12 }, footprintType: 'THT 2-pin; passo 5.0mm', confidenceLevel: 'B', validationStatus: 'documented_reference', sourceReference: 'Same Sky official datasheet', sourceUrl: 'https://jp.sameskydevices.com/product/resource/cmi-1295ic-0385t.pdf', connectedNets: ['BUZZER_VCC', 'BUZZER_COLLECTOR'], inferredDimensions: ['Passo e polaridade dos terminais'], pins: [pin('plus', 1, 'VCC (+)', 'power', 3.3, 'Alimentação +3.3V'), pin('minus', 2, 'GND (-) via Q1', 'ground', 0, 'Coletor de Q1 2N2222')] }),
  q1_driver: make({ id: 'q1_driver', designatorPrefix: 'Q1', name: 'Transistor BJT NPN 2N2222A (TO-92)', manufacturer: 'ON Semiconductor / Fairchild', partNumber: 'P2N2222AG', dimensionsMm: { width: 4.5, height: 5.0, depth: 4.5 }, nominalDimensionsMm: { width: 4.5, height: 5.0, depth: 4.5 }, footprintType: 'Package_TO_SOT_THT:TO-92_Inline', confidenceLevel: 'B', validationStatus: 'documented_reference', sourceReference: 'ON Semiconductor 2N2222A datasheet', sourceUrl: 'https://www.onsemi.com/pdf/datasheet/p2n2222a-d.pdf', connectedNets: ['BUZZER_COLLECTOR', 'BUZZER_BASE', 'GND'], pins: [pin('c', 1, 'Coletor (C)', 'passive', 3.3, 'Conectado ao BZ1 (-)'), pin('b', 2, 'Base (B)', 'digital_in', 0.7, 'Acionado por GPIO14 via R_BASE 1kΩ'), pin('e', 3, 'Emissor (E)', 'ground', 0, 'Conectado ao GND comum')] }),
  r_base: make({ id: 'r_base', designatorPrefix: 'R_BASE', name: 'Resistor de base 1 kΩ 1/4W 5%', manufacturer: 'Yageo ou equivalente', partNumber: '1K-5%-THT', dimensionsMm: { width: 6.3, height: 2.5, depth: 2.5 }, nominalDimensionsMm: { width: 6.3, height: 2.5, depth: 2.5 }, footprintType: 'Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal', confidenceLevel: 'A', validationStatus: 'documented_reference', sourceReference: 'Yageo CFR series resistor catalog', sourceUrl: 'https://www.yageo.com', connectedNets: ['GPIO14_BUZZER_CTRL', 'BUZZER_BASE'], pins: [pin('p1', 1, 'Pino 1 (GPIO14)', 'digital_in', 3.3, 'Entrada de comando GPIO14'), pin('p2', 2, 'Pino 2 (Base)', 'digital_out', 0.7, 'Saída para a Base de Q1')] }),
};
