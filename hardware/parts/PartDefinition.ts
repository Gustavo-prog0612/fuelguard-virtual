/** Catálogo auditável das peças reais da bancada FuelGuard. */

export type PartConfidence = 'A' | 'B' | 'C' | 'D';
export type PartKind = 'commercial-module' | 'passive' | 'mechanical' | 'cable' | 'future-pcb';

export interface PartDefinition {
  id: string;
  designator: string;
  name: string;
  manufacturer: string;
  partNumber: string;
  kind: PartKind;
  confidence: PartConfidence;
  dimensionsMm: { width: number | null; height: number | null; depth: number | null };
  interfaces: string[];
  sourceUrl: string | null;
  modelStatus: 'official' | 'library' | 'parametric' | 'documented-reference' | 'site-specific' | 'placeholder';
  notes: string[];
}

export const FUELGUARD_PARTS: PartDefinition[] = [
  {
    id: 'esp32-s3-devkitc-1-n8r8', designator: 'U1', name: 'ESP32-S3-DevKitC-1-N8R8 v1.1', manufacturer: 'Espressif Systems', partNumber: 'ESP32-S3-DevKitC-1-N8R8', kind: 'commercial-module', confidence: 'A',
    dimensionsMm: { width: 25.5, height: 68, depth: null }, interfaces: ['USB-C', 'GPIO 3.3V', '5V', 'GND'],
    sourceUrl: 'https://documentation.espressif.com/api/resource/path/docs/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-devkitc-1/user_guide.html', modelStatus: 'official',
    notes: ['Usar esquemático, PCB e DXF oficiais da revisão v1.1.', 'Confirmar altura dos headers e keepouts na unidade recebida.'],
  },
  {
    id: 'pn532-v4', designator: 'RFID1', name: 'ELECHOUSE PN532 NFC/RFID V4', manufacturer: 'ELECHOUSE', partNumber: 'NFC-PN532_V4', kind: 'commercial-module', confidence: 'C',
    dimensionsMm: { width: 42.7, height: 40.4, depth: 4 }, interfaces: ['SPI 3.3V', '3.3–5V supply', 'GND', 'Header 1x8 P2.54'],
    sourceUrl: 'https://www.elechouse.com/docs/pn532-v4/', modelStatus: 'documented-reference',
    notes: ['Envelope nominal documentado; confirmar header, furos, antena e orientação.', 'Instalar em suporte frontal.'],
  },
  {
    id: 'a02yyuw-sen0311', designator: 'SEN1', name: 'DFRobot A02YYUW / SEN0311', manufacturer: 'DFRobot', partNumber: 'SEN0311', kind: 'commercial-module', confidence: 'C',
    dimensionsMm: { width: null, height: null, depth: null }, interfaces: ['UART TTL 9600 8N1', '3.3V', 'GND', 'RX mode', 'TX'],
    sourceUrl: 'https://wiki.dfrobot.com/sen0311/', modelStatus: 'documented-reference',
    notes: ['Faixa documentada 30–4500 mm, zona cega 30 mm, IP67.', 'Envelope do probe, cabo e terminal depende do lote e deve ser medido.'],
  },
  {
    id: 'mc38-vendor-lot-pending', designator: 'SW1', name: 'MC-38 com ímã da tampa', manufacturer: 'Fornecedor a selecionar', partNumber: 'MC-38-VENDOR-LOT-PENDING', kind: 'commercial-module', confidence: 'D',
    dimensionsMm: { width: null, height: null, depth: null }, interfaces: ['LID_INTERLOCK', 'GND'], sourceUrl: 'https://robu.in/wp-content/uploads/2017/04/Datasheet-MC-38-final-1.pdf', modelStatus: 'site-specific',
    notes: ['MC-38 é uma família comercial, não um MPN único.', 'Fixar vendedor, NO/NC, ímã, gap, corpo e cabo antes do suporte.'],
  },
  {
    id: 'r3-220r', designator: 'R3', name: 'Resistor limitador LED 220 Ω', manufacturer: 'Yageo ou equivalente', partNumber: '220R-1%', kind: 'passive', confidence: 'C',
    dimensionsMm: { width: null, height: null, depth: null }, interfaces: ['STATUS_LED_CTRL'], sourceUrl: 'https://www.yageo.com', modelStatus: 'library', notes: ['Valor congelado; encapsulamento THT/SMD ainda será escolhido com a PCB.'],
  },
  {
    id: 'led-5mm', designator: 'D1', name: 'LED verde radial Ø5 mm', manufacturer: 'Kingbright', partNumber: 'WP7113GD', kind: 'passive', confidence: 'A',
    dimensionsMm: { width: 5, height: 8.6, depth: 5 }, interfaces: ['STATUS_LED_CTRL', 'GND'], sourceUrl: 'https://www.kingbrightusa.com/images/catalog/SPEC/WP7113GD.pdf', modelStatus: 'documented-reference', notes: ['Indicador de status; confirmar polaridade da unidade.'],
  },
  {
    id: 'buzzer-active-cmi-1295ic-0385t', designator: 'BZ1', name: 'Buzzer ativo CMI-1295IC-0385T', manufacturer: 'Same Sky', partNumber: 'CMI-1295IC-0385T', kind: 'commercial-module', confidence: 'B',
    dimensionsMm: { width: 12, height: 9.5, depth: 12 }, interfaces: ['BUZZER_CTRL', 'GND'], sourceUrl: 'https://jp.sameskydevices.com/product/resource/cmi-1295ic-0385t.pdf', modelStatus: 'documented-reference', notes: ['Circuito interno, 2–5 V, 30 mA máx.; confirmar passo e polaridade na unidade.'],
  },
  {
    id: 'mb-102-830', designator: 'BB1', name: 'Protoboard MB-102 830 pontos', manufacturer: 'Vendor-lot-specific', partNumber: 'MB-102-830', kind: 'mechanical', confidence: 'C',
    dimensionsMm: { width: 165, height: 8.5, depth: 55 }, interfaces: ['Matriz 2.54mm', 'Barramento 5V', 'Barramento GND'], sourceUrl: 'https://handsontec.com/dataspecs/m102-830-bread-board.pdf', modelStatus: 'documented-reference', notes: ['Medir a unidade recebida antes de congelar a mecânica.'],
  },
  {
    id: 'fg-tank-6l-r1', designator: 'TK1', name: 'Tanque acrílico FG-TANK-6L-R1', manufacturer: 'FuelGuard bench design', partNumber: 'FG-TANK-6L-R1', kind: 'mechanical', confidence: 'C',
    dimensionsMm: { width: 206, height: 168, depth: 206 }, interfaces: ['SEN0311 support', 'LID_INTERLOCK', '4x M3'], sourceUrl: null, modelStatus: 'parametric', notes: ['Interno 200 x 200 x 160 mm; paredes 3 mm; tampa 5 mm; capacidade geométrica 6,4 L; operação 1–5 L.'],
  },
  {
    id: 'usb-c-5v-3a', designator: 'PS1', name: 'Fonte USB-C 5 V / 3 A certificada', manufacturer: 'A selecionar', partNumber: 'USB-C-5V-3A-CERTIFIED-PENDING', kind: 'cable', confidence: 'D',
    dimensionsMm: { width: null, height: null, depth: null }, interfaces: ['USB-C 5V'], sourceUrl: null, modelStatus: 'placeholder', notes: ['Somente baixa tensão na bancada; registrar fabricante e certificação antes do uso.'],
  },
];
