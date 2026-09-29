/** Cadastro físico da fiação da bancada FuelGuard real. Coordenadas são referência de montagem, não desenho de fabricação. */
export type CableSignalGroup = 'power' | 'spi' | 'sensors' | 'usb';
export type CableSignalType = 'power_5v' | 'power_3v3' | 'ground' | 'uart_level' | 'uart_mode' | 'spi_mosi' | 'spi_miso' | 'spi_sck' | 'spi_cs' | 'reed_interlock' | 'usb_data' | 'led_status' | 'buzzer_signal' | 'mechanical_route';
export interface PhysicalCable { id: string; netName: string; label: string; group: CableSignalGroup; signalType: CableSignalType; colorHex: string; awgGauge: string; diameterMm: number; fromComponent: string; fromPin: string; toComponent: string; toPin: string; fromTerminal?: string; toTerminal?: string; fromCoord: [number, number, number]; toCoord: [number, number, number]; waypoints: [number, number, number][]; estimatedLengthMm: number; nominalVoltageV: number; description: string; }

const cable = (value: PhysicalCable): PhysicalCable => value;

const RAW_PHYSICAL_WIRING_REGISTRY: PhysicalCable[] = [
  cable({ id: 'W_5V_ESP_TO_RAIL', netName: '+5V_VBUS', label: '+5V VBUS para barramento MB-102', group: 'power', signalType: 'power_5v', colorHex: '#ef4444', awgGauge: 'AWG24', diameterMm: 1.1, fromComponent: 'esp32_s3_devkit', fromPin: 'J1.21 / 5V', toComponent: 'breadboard_830', toPin: 'Trilho +5V', fromTerminal: 'J1_PIN_21', toTerminal: 'MB102_RAIL_RED_5V', fromCoord: [-110,15,9.5], toCoord: [-110,12,-2.5], waypoints: [[-110,15,9.5],[-110,24,7],[-110,23,0],[-110,12,-2.5]], estimatedLengthMm: 35, nominalVoltageV: 5, description: 'Distribuição de 5 V regulados do VBUS da DevKitC para um trilho vermelho dedicado. Não é GPIO.' }),
  cable({ id: 'W_GND_ESP_TO_RAIL', netName: 'GND', label: 'GND comum para barramento MB-102', group: 'power', signalType: 'ground', colorHex: '#0f172a', awgGauge: 'AWG24', diameterMm: 1.1, fromComponent: 'esp32_s3_devkit', fromPin: 'J1.22 / G', toComponent: 'breadboard_830', toPin: 'Trilho -', fromTerminal: 'J1_PIN_22', toTerminal: 'MB102_RAIL_BLUE_GND', fromCoord: [-107.5,15,9.5], toCoord: [-107.5,12,-5.5], waypoints: [[-107.5,15,9.5],[-107.5,23,6],[-107.5,22,-1],[-107.5,12,-5.5]], estimatedLengthMm: 32, nominalVoltageV: 0, description: 'Retorno equipotencial único para todos os módulos e indicadores.' }),
  cable({ id: 'W_3V3_ESP_TO_RAIL', netName: '+3.3V', label: '3V3 da DevKitC para barramento lógico', group: 'power', signalType: 'power_3v3', colorHex: '#f97316', awgGauge: 'AWG24', diameterMm: 1.1, fromComponent: 'esp32_s3_devkit', fromPin: 'J1.1 / 3V3', toComponent: 'breadboard_830', toPin: 'Trilho +3V3', fromTerminal: 'J1_PIN_1', toTerminal: 'MB102_RAIL_RED_3V3', fromCoord: [-110,15,9.5], toCoord: [-110,12,-2.5], waypoints: [[-110,15,9.5],[-110,24,7],[-110,23,0],[-110,12,-2.5]], estimatedLengthMm: 35, nominalVoltageV: 3.3, description: 'O trilho +3V3 é separado do trilho +5V; alimenta somente lógica de 3,3 V.' }),
  cable({ id: 'W_LEVEL_VCC', netName: '+3.3V', label: '3V3 para A02YYUW/SEN0311', group: 'sensors', signalType: 'power_3v3', colorHex: '#f97316', awgGauge: 'AWG26', diameterMm: 1, fromComponent: 'breadboard_830', fromPin: 'Trilho +3V3', toComponent: 'a02yyuw_sen0311', toPin: 'VCC', fromTerminal: 'MB102_RAIL_RED_3V3', toTerminal: 'SEN0311_PH2_1_VCC', fromCoord: [-75,12,-2.5], toCoord: [85,168,55], waypoints: [[-75,12,-2.5],[-55,35,0],[-10,85,25],[45,135,45],[85,168,55]], estimatedLengthMm: 270, nominalVoltageV: 3.3, description: 'SEN0311 é alimentado pelo trilho +3V3, mantendo o TX dentro do domínio do ESP32-S3.' }),
  cable({ id: 'W_LEVEL_GND', netName: 'GND', label: 'GND do A02YYUW/SEN0311', group: 'sensors', signalType: 'ground', colorHex: '#0f172a', awgGauge: 'AWG26', diameterMm: 1, fromComponent: 'breadboard_830', fromPin: 'Trilho -', toComponent: 'a02yyuw_sen0311', toPin: 'GND', fromTerminal: 'MB102_RAIL_BLUE_GND', toTerminal: 'SEN0311_PH2_2_GND', fromCoord: [-75,12,-2.5], toCoord: [85,168,55], waypoints: [[-75,12,-2.5],[-42,30,-5], [215,30,-92], [215,176,35], [94,175,35]], estimatedLengthMm: 0, nominalVoltageV: 0, description: 'Retorno do sensor ao mesmo barramento GND da DevKitC.' }),
  cable({ id: 'W_LEVEL_UART', netName: 'LEVEL_UART_RX', label: 'UART TX SEN0311 -> GPIO16', group: 'sensors', signalType: 'uart_level', colorHex: '#0ea5e9', awgGauge: 'AWG26', diameterMm: 1, fromComponent: 'a02yyuw_sen0311', fromPin: 'TX', toComponent: 'esp32_s3_devkit', toPin: 'J1.9 / GPIO16 / UART1_RX', fromTerminal: 'SEN0311_PH2_4_TX', toTerminal: 'J1_PIN_9', fromCoord: [85,168,58], toCoord: [-97,15,28], waypoints: [[85,168,58],[78,130,70],[40,80,50],[-20,38,32],[-97,15,28]], estimatedLengthMm: 300, nominalVoltageV: 3.3, description: 'TX do sensor para GPIO16 em 9600 8N1; não é TRIG/ECHO.' }),
  cable({ id: 'W_LEVEL_MODE', netName: 'LEVEL_MODE_PROCESSED', label: 'RX MODE SEN0311 em 3V3', group: 'sensors', signalType: 'uart_mode', colorHex: '#fb923c', awgGauge: 'AWG26', diameterMm: 1, fromComponent: 'breadboard_830', fromPin: 'Trilho +3V3', toComponent: 'a02yyuw_sen0311', toPin: 'RX / MODE', fromTerminal: 'MB102_RAIL_RED_3V3', toTerminal: 'SEN0311_PH2_3_RX_MODE', fromCoord: [-112,15,9], toCoord: [85,168,61], waypoints: [[-112,15,9],[-80,35,10],[-30,85,30],[45,135,50],[85,168,61]], estimatedLengthMm: 315, nominalVoltageV: 3.3, description: 'RX/MODE fica permanentemente em HIGH pelo trilho +3V3; não é uma saída GPIO.' }),
  cable({ id: 'W_PN532_VCC', netName: '+3.3V', label: '3V3 para PN532 V4', group: 'power', signalType: 'power_3v3', colorHex: '#f97316', awgGauge: 'AWG26', diameterMm: 1, fromComponent: 'breadboard_830', fromPin: 'Trilho +3V3', toComponent: 'pn532_breakout', toPin: 'Header Pin 5 (VCC)', fromTerminal: 'MB102_RAIL_RED_3V3', toTerminal: 'PN532_HEADER_5_VCC', fromCoord: [-75,12,-2.5], toCoord: [66,164,-11], waypoints: [[-75,12,-2.5],[-55,22,-30],[-35,24,-92],[-19,29.5,-115]], estimatedLengthMm: 0, nominalVoltageV: 3.3, description: 'Alimentação lógica de 3,3 V do PN532; não utilizar VBUS de 5 V.' }),
  cable({ id: 'W_PN532_GND', netName: 'GND', label: 'GND para PN532 V4', group: 'power', signalType: 'ground', colorHex: '#0f172a', awgGauge: 'AWG26', diameterMm: 1, fromComponent: 'breadboard_830', fromPin: 'Trilho -', toComponent: 'pn532_breakout', toPin: 'Header Pin 6 (GND)', fromTerminal: 'MB102_RAIL_BLUE_GND', toTerminal: 'PN532_HEADER_6_GND', fromCoord: [-75,12,-2.5], toCoord: [66,164,-11], waypoints: [[-75,12,-2.5],[-45,20,-27],[-35,24,-92],[-17,29.5,-115]], estimatedLengthMm: 0, nominalVoltageV: 0, description: 'Retorno do PN532 no mesmo barramento comum da bancada.' }),
  cable({ id: 'W_SPI_CS', netName: 'SPI_CS', label: 'SPI CS GPIO10 -> PN532 SS', group: 'spi', signalType: 'spi_cs', colorHex: '#a855f7', awgGauge: 'AWG26', diameterMm: 1, fromComponent: 'esp32_s3_devkit', fromPin: 'J1.16 / GPIO10', toComponent: 'pn532_breakout', toPin: 'Header Pin 4 (SS)', fromTerminal: 'J1_PIN_16', toTerminal: 'PN532_HEADER_4_SS', fromCoord: [-87,15,30], toCoord: [66,164,-11], waypoints: [[-87,15,30],[-65,45,30],[-10,90,15],[40,130,0],[66,164,-11]], estimatedLengthMm: 255, nominalVoltageV: 3.3, description: 'Chip Select do PN532 V4.' }),
  cable({ id: 'W_SPI_MOSI', netName: 'SPI_MOSI', label: 'SPI MOSI GPIO11 -> PN532', group: 'spi', signalType: 'spi_mosi', colorHex: '#c084fc', awgGauge: 'AWG26', diameterMm: 1, fromComponent: 'esp32_s3_devkit', fromPin: 'J1.17 / GPIO11', toComponent: 'pn532_breakout', toPin: 'Header Pin 3 (MOSI)', fromTerminal: 'J1_PIN_17', toTerminal: 'PN532_HEADER_3_MOSI', fromCoord: [-85,15,30], toCoord: [66,164,-8], waypoints: [[-85,15,30],[-63,47,28],[-5,92,14],[42,132,2],[66,164,-8]], estimatedLengthMm: 250, nominalVoltageV: 3.3, description: 'Dados do ESP32 para PN532.' }),
  cable({ id: 'W_SPI_SCK', netName: 'SPI_SCK', label: 'SPI SCK GPIO12 -> PN532', group: 'spi', signalType: 'spi_sck', colorHex: '#9333ea', awgGauge: 'AWG26', diameterMm: 1, fromComponent: 'esp32_s3_devkit', fromPin: 'J1.18 / GPIO12', toComponent: 'pn532_breakout', toPin: 'Header Pin 1 (SCK)', fromTerminal: 'J1_PIN_18', toTerminal: 'PN532_HEADER_1_SCK', fromCoord: [-82,15,30], toCoord: [66,164,-6], waypoints: [[-82,15,30],[-60,49,26],[0,94,13],[45,134,1],[66,164,-6]], estimatedLengthMm: 248, nominalVoltageV: 3.3, description: 'Clock SPI nominal de 4 MHz.' }),
  cable({ id: 'W_SPI_MISO', netName: 'SPI_MISO', label: 'PN532 MISO -> GPIO13', group: 'spi', signalType: 'spi_miso', colorHex: '#7e22ce', awgGauge: 'AWG26', diameterMm: 1, fromComponent: 'pn532_breakout', fromPin: 'Header Pin 2 (MISO)', toComponent: 'esp32_s3_devkit', toPin: 'J1.19 / GPIO13', fromTerminal: 'PN532_HEADER_2_MISO', toTerminal: 'J1_PIN_19', fromCoord: [66,164,-3], toCoord: [-80,15,30], waypoints: [[66,164,-3],[55,136,-1],[5,88,12],[-60,48,25],[-80,15,30]], estimatedLengthMm: 246, nominalVoltageV: 3.3, description: 'Dados recebidos do PN532.' }),
  cable({ id: 'W_REED_INTERLOCK', netName: 'LID_INTERLOCK', label: 'GPIO7 -> MC-38 SENSE', group: 'sensors', signalType: 'reed_interlock', colorHex: '#0ea5e9', awgGauge: 'AWG24', diameterMm: 1.1, fromComponent: 'esp32_s3_devkit', fromPin: 'J1.7 / GPIO7', toComponent: 'reed_switch', toPin: 'SENSE / NO', fromTerminal: 'J1_PIN_7', toTerminal: 'MC38_LEAD_SIGNAL', fromCoord: [-95,15,30], toCoord: [190,172,58], waypoints: [[-95,15,30],[35,35,30],[120,80,50],[175,135,65],[190,172,58]], estimatedLengthMm: 315, nominalVoltageV: 3.3, description: 'GPIO7 usa INPUT_PULLUP; o MC-38 fecha o contato para GND quando a tampa está fechada.' }),
  cable({ id: 'W_REED_GND', netName: 'GND', label: 'MC-38 retorno para GND', group: 'power', signalType: 'ground', colorHex: '#0f172a', awgGauge: 'AWG24', diameterMm: 1.1, fromComponent: 'reed_switch', fromPin: 'RETURN / COM', toComponent: 'breadboard_830', toPin: 'Trilho -', fromTerminal: 'MC38_LEAD_RETURN', toTerminal: 'MB102_RAIL_BLUE_GND', fromCoord: [190,172,58], toCoord: [-50,9.5,-27], waypoints: [[190,172,58],[218,178,35],[218,28,-112],[-50,24,-112],[-50,9.5,-27]], estimatedLengthMm: 0, nominalVoltageV: 0, description: 'Retorno explícito do contato reed ao GND; sem este condutor o interlock fica flutuante.' }),
  cable({ id: 'W_LED_STATUS', netName: 'STATUS_LED_CTRL', label: 'GPIO4 -> R3 220R -> LED verde', group: 'sensors', signalType: 'led_status', colorHex: '#22c55e', awgGauge: 'AWG26', diameterMm: 1, fromComponent: 'esp32_s3_devkit', fromPin: 'J1.4 / GPIO4', toComponent: 'led_indicator', toPin: 'Anodo (D1 via R3)', fromTerminal: 'J1_PIN_4', toTerminal: 'D1_ANODE_AFTER_R3', fromCoord: [-110,15,12], toCoord: [-20,14,22], waypoints: [[-110,15,12],[-90,22,16],[-50,20,20],[-20,14,22]], estimatedLengthMm: 95, nominalVoltageV: 3.3, description: 'GPIO4 aciona o ânodo por R3 de 220 Ω; o catodo retorna ao GND.' }),
  cable({ id: 'W_LED_GND', netName: 'GND', label: 'Catodo do LED para GND', group: 'power', signalType: 'ground', colorHex: '#0f172a', awgGauge: 'AWG26', diameterMm: 1, fromComponent: 'led_indicator', fromPin: 'Catodo D1', toComponent: 'breadboard_830', toPin: 'Trilho -', fromTerminal: 'D1_CATHODE', toTerminal: 'MB102_RAIL_BLUE_GND', fromCoord: [-20,14,22], toCoord: [-50,9.5,-27], waypoints: [[-20,14,22],[-12,20,5],[-50,18,-12],[-50,9.5,-27]], estimatedLengthMm: 0, nominalVoltageV: 0, description: 'Retorno do LED ao barramento GND comum.' }),
  cable({ id: 'W_BUZZER_CTRL', netName: 'BUZZER_CTRL', label: 'GPIO14 -> buzzer ativo BZ1', group: 'sensors', signalType: 'buzzer_signal', colorHex: '#f59e0b', awgGauge: 'AWG26', diameterMm: 1, fromComponent: 'esp32_s3_devkit', fromPin: 'J1.20 / GPIO14', toComponent: 'buzzer_active', toPin: 'CTRL / +', fromTerminal: 'J1_PIN_20', toTerminal: 'BZ1_PLUS', fromCoord: [-95,15,15], toCoord: [-5,15,23], waypoints: [[-95,15,15],[-70,24,18],[-30,22,22],[-5,15,23]], estimatedLengthMm: 100, nominalVoltageV: 3.3, description: 'GPIO14 aciona o buzzer ativo; confirmar corrente de pico antes do hardware.' }),
  cable({ id: 'W_BUZZER_GND', netName: 'GND', label: 'Retorno do buzzer ativo BZ1', group: 'power', signalType: 'ground', colorHex: '#0f172a', awgGauge: 'AWG26', diameterMm: 1, fromComponent: 'buzzer_active', fromPin: 'GND / -', toComponent: 'breadboard_830', toPin: 'Trilho -', fromTerminal: 'BZ1_MINUS', toTerminal: 'MB102_RAIL_BLUE_GND', fromCoord: [-5,15,20], toCoord: [-40,12,-5], waypoints: [[-5,15,20],[-10,24,15],[-25,20,5],[-40,12,-5]], estimatedLengthMm: 50, nominalVoltageV: 0, description: 'Retorno comum do buzzer ativo.' }),
  cable({ id: 'W_USBC_MAIN', netName: 'USB_5V_POWER_DATA', label: 'USB host -> Micro-USB ESP32 DevKit', group: 'usb', signalType: 'usb_data', colorHex: '#334155', awgGauge: 'AWG28/AWG24', diameterMm: 3.6, fromComponent: 'external_host', fromPin: 'Host PC/Fonte', toComponent: 'esp32_s3_devkit', toPin: 'Micro-USB UART/OTG', fromTerminal: 'USB_HOST_A_OR_POWER', toTerminal: 'U1_MICRO_USB', fromCoord: [-160,5,160], toCoord: [-110,16,54], waypoints: [[-160,5,160],[-130,12,110],[-115,15,75],[-110,16,54]], estimatedLengthMm: 140, nominalVoltageV: 5, description: 'Cabo Micro-USB real para alimentação e console serial da DevKitC; o conector fica no lado externo da placa.' }),
];

type Point = [number, number, number];

const point = (x: number, y: number, z: number): Point => [x, y, z];

const lengthOf = (points: Point[]): number => points.slice(1).reduce((total, current, index) => {
  const previous = points[index];
  return total + Math.hypot(current[0] - previous[0], current[1] - previous[1], current[2] - previous[2]);
}, 0);

/**
 * Âncoras mecânicas da revisão atual da bancada.
 *
 * Cada rota termina no envelope do conector/terminal, e não no centro do
 * componente. As coordenadas abaixo acompanham os grupos 3D reais da cena:
 * DevKitC em U1, header do PN532 em RFID1, conector PH2.0 do SEN0311,
 * contatos do LED/buzzer e terminais do MC-38. O corredor frontal z=-118 mm
 * mantém o chicote fora do tanque enquanto cruza entre baias.
 */
const U1 = {
  // U1 = [-128, 11.5, -50], J1 left header x=-11.43, pin contact y≈7.
  // J1.1..J1.22 use passo 2.54 mm ao longo do eixo Z.
  j1_1_3v3: point(-139.43, 7.0, -74.67),
  j1_4_gpio4: point(-139.43, 7.0, -67.05),
  j1_7_gpio7: point(-139.43, 7.0, -59.43),
  j1_9_gpio16: point(-139.43, 7.0, -54.35),
  j1_16_gpio10: point(-139.43, 7.0, -36.57),
  j1_17_gpio11: point(-139.43, 7.0, -34.03),
  j1_18_gpio12: point(-139.43, 7.0, -31.49),
  j1_19_gpio13: point(-139.43, 7.0, -28.95),
  j1_20_gpio14: point(-139.43, 7.0, -26.41),
  j1_21_5v: point(-139.43, 7.0, -23.87),
  j1_22_gnd: point(-139.43, 7.0, -21.33),
  microUsb: point(-128, 16, -17),
};
const BB = {
  fiveV: point(-55, 8.55, -73),
  threeV3: point(-55, 8.55, -30),
  gnd: point(-55, 8.55, -27),
};
const SEN = {
  // SEN1 root sits at the lid center [95, 163, 35]. The documented
  // PH2.0-4P contacts are at local y=36.7, z=-3.15.
  vcc: point(92.7, 199.7, 31.85),
  gnd: point(94.23, 199.7, 31.85),
  rxMode: point(95.76, 199.7, 31.85),
  tx: point(97.29, 199.7, 31.85),
};
const PN532 = {
  sck: point(-29.2, 29.5, -115),
  miso: point(-26.7, 29.5, -115),
  mosi: point(-24.2, 29.5, -115),
  ss: point(-21.7, 29.5, -115),
  vcc: point(-19.2, 29.5, -115),
  gnd: point(-16.7, 29.5, -115),
};
// SW1 group = [193, 153, 35]; leads are local x=-/+9.5.
const REED = { signal: point(183.5, 153, 35), return: point(202.5, 153, 35) };
// D1 group = [-65, 12, -65]; the reference asset marks local x=+1.27 as
// anode and local x=-1.27 as cathode.
const LED = { anode: point(-63.73, 11.5, -65), cathode: point(-66.27, 11.5, -65) };
const BUZZER = { plus: point(-45, 12.25, -41.19), minus: point(-45, 12.25, -48.81) };

const route = (...points: Point[]): Point[] => points;

const PHYSICAL_ROUTE_GEOMETRY: Record<string, { from: Point; to: Point; waypoints: Point[] }> = {
  W_5V_ESP_TO_RAIL: {
    from: U1.j1_21_5v,
    to: BB.fiveV,
    waypoints: route(
      U1.j1_21_5v,
      point(-139.43, 16.0, -23.87),
      point(-118.0, 20.0, -45.0),
      point(-85.0, 18.0, -65.0),
      point(-55.0, 15.0, -73.0),
      BB.fiveV,
    ),
  },
  W_GND_ESP_TO_RAIL: {
    from: U1.j1_22_gnd,
    to: BB.gnd,
    waypoints: route(
      U1.j1_22_gnd,
      point(-139.43, 16.0, -21.33),
      point(-115.0, 19.0, -24.0),
      point(-85.0, 18.0, -26.0),
      point(-55.0, 15.0, -27.0),
      BB.gnd,
    ),
  },
  W_3V3_ESP_TO_RAIL: {
    from: U1.j1_1_3v3,
    to: BB.threeV3,
    waypoints: route(
      U1.j1_1_3v3,
      point(-139.43, 16.0, -74.67),
      point(-115.0, 20.0, -60.0),
      point(-85.0, 18.0, -42.0),
      point(-55.0, 15.0, -30.0),
      BB.threeV3,
    ),
  },
  W_LEVEL_VCC: {
    from: BB.threeV3,
    to: SEN.vcc,
    waypoints: route(
      BB.threeV3,
      point(-55.0, 15.0, -30.0),
      point(-50.0, 14.0, 10.0),
      point(-20.0, 14.0, 80.0),
      point(35.0, 14.0, 115.0),
      point(92.7, 14.0, 130.0),
      point(92.7, 60.0, 136.0),
      point(92.7, 120.0, 136.0),
      point(92.7, 172.0, 134.0),
      point(92.7, 206.0, 60.0),
      SEN.vcc,
    ),
  },
  W_LEVEL_GND: {
    from: BB.gnd,
    to: SEN.gnd,
    waypoints: route(
      BB.gnd,
      point(-55.0, 15.0, -27.0),
      point(-50.0, 14.0, 12.0),
      point(-20.0, 14.0, 82.0),
      point(35.0, 14.0, 117.0),
      point(94.23, 14.0, 132.0),
      point(94.23, 60.0, 136.0),
      point(94.23, 120.0, 136.0),
      point(94.23, 172.0, 134.0),
      point(94.23, 206.0, 60.0),
      SEN.gnd,
    ),
  },
  W_LEVEL_UART: {
    from: SEN.tx,
    to: U1.j1_9_gpio16,
    waypoints: route(
      SEN.tx,
      point(97.29, 206.0, 60.0),
      point(97.29, 172.0, 134.0),
      point(97.29, 120.0, 136.0),
      point(97.29, 60.0, 136.0),
      point(97.29, 14.0, 132.0),
      point(35.0, 14.0, 117.0),
      point(-20.0, 14.0, 82.0),
      point(-50.0, 14.0, 12.0),
      point(-85.0, 14.0, -35.0),
      point(-120.0, 14.0, -54.35),
      point(-139.43, 15.0, -54.35),
      U1.j1_9_gpio16,
    ),
  },
  W_LEVEL_MODE: {
    from: BB.threeV3,
    to: SEN.rxMode,
    waypoints: route(
      BB.threeV3,
      point(-55.0, 15.0, -30.0),
      point(-50.0, 14.0, 10.0),
      point(-20.0, 14.0, 80.0),
      point(35.0, 14.0, 115.0),
      point(95.76, 14.0, 130.0),
      point(95.76, 60.0, 136.0),
      point(95.76, 120.0, 136.0),
      point(95.76, 172.0, 134.0),
      point(95.76, 206.0, 60.0),
      SEN.rxMode,
    ),
  },
  W_PN532_VCC: {
    from: BB.threeV3,
    to: PN532.vcc,
    waypoints: route(
      BB.threeV3,
      point(-55.0, 15.0, -30.0),
      point(-50.0, 13.0, -65.0),
      point(-35.0, 13.0, -100.0),
      point(-25.0, 22.0, -118.0),
      point(-19.2, 32.0, -118.0),
      PN532.vcc,
    ),
  },
  W_PN532_GND: {
    from: BB.gnd,
    to: PN532.gnd,
    waypoints: route(
      BB.gnd,
      point(-55.0, 15.0, -27.0),
      point(-48.0, 13.0, -65.0),
      point(-33.0, 13.0, -100.0),
      point(-23.0, 22.0, -118.0),
      point(-16.7, 32.0, -118.0),
      PN532.gnd,
    ),
  },
  W_SPI_CS: {
    from: U1.j1_16_gpio10,
    to: PN532.ss,
    waypoints: route(
      U1.j1_16_gpio10,
      point(-139.43, 15.0, -36.57),
      point(-110.0, 14.0, -50.0),
      point(-75.0, 13.0, -85.0),
      point(-40.0, 13.0, -105.0),
      point(-28.0, 22.0, -118.0),
      point(-21.7, 32.0, -118.0),
      PN532.ss,
    ),
  },
  W_SPI_MOSI: {
    from: U1.j1_17_gpio11,
    to: PN532.mosi,
    waypoints: route(
      U1.j1_17_gpio11,
      point(-139.43, 15.0, -34.03),
      point(-108.0, 14.0, -52.0),
      point(-73.0, 13.0, -87.0),
      point(-38.0, 13.0, -107.0),
      point(-29.0, 22.0, -118.0),
      point(-24.2, 32.0, -118.0),
      PN532.mosi,
    ),
  },
  W_SPI_SCK: {
    from: U1.j1_18_gpio12,
    to: PN532.sck,
    waypoints: route(
      U1.j1_18_gpio12,
      point(-139.43, 15.0, -31.49),
      point(-106.0, 14.0, -54.0),
      point(-71.0, 13.0, -89.0),
      point(-36.0, 13.0, -109.0),
      point(-30.0, 22.0, -118.0),
      point(-29.2, 32.0, -118.0),
      PN532.sck,
    ),
  },
  W_SPI_MISO: {
    from: PN532.miso,
    to: U1.j1_19_gpio13,
    waypoints: route(
      PN532.miso,
      point(-26.7, 32.0, -118.0),
      point(-29.0, 22.0, -118.0),
      point(-37.0, 13.0, -108.0),
      point(-72.0, 13.0, -88.0),
      point(-107.0, 14.0, -53.0),
      point(-139.43, 15.0, -28.95),
      U1.j1_19_gpio13,
    ),
  },
  W_REED_INTERLOCK: {
    from: U1.j1_7_gpio7,
    to: REED.signal,
    waypoints: route(
      U1.j1_7_gpio7,
      point(-139.43, 15.0, -59.43),
      point(-110.0, 14.0, -45.0),
      point(-50.0, 14.0, 15.0),
      point(-15.0, 14.0, 85.0),
      point(40.0, 14.0, 120.0),
      point(100.0, 14.0, 135.0),
      point(155.0, 14.0, 110.0),
      point(183.5, 70.0, 80.0),
      point(183.5, 130.0, 50.0),
      REED.signal,
    ),
  },
  W_REED_GND: {
    from: REED.return,
    to: BB.gnd,
    waypoints: route(
      REED.return,
      point(202.5, 130.0, 50.0),
      point(202.5, 70.0, 80.0),
      point(160.0, 14.0, 112.0),
      point(105.0, 14.0, 137.0),
      point(42.0, 14.0, 122.0),
      point(-15.0, 14.0, 85.0),
      point(-50.0, 14.0, 15.0),
      point(-55.0, 15.0, -27.0),
      BB.gnd,
    ),
  },
  W_LED_STATUS: {
    from: U1.j1_4_gpio4,
    to: LED.anode,
    waypoints: route(
      U1.j1_4_gpio4,
      point(-139.43, 15.0, -67.05),
      point(-115.0, 18.0, -66.0),
      point(-85.0, 16.0, -65.5),
      point(-63.73, 15.0, -65.0),
      LED.anode,
    ),
  },
  W_LED_GND: {
    from: LED.cathode,
    to: BB.gnd,
    waypoints: route(
      LED.cathode,
      point(-66.27, 15.0, -65.0),
      point(-66.0, 18.0, -45.0),
      point(-55.0, 16.0, -27.0),
      BB.gnd,
    ),
  },
  W_BUZZER_CTRL: {
    from: U1.j1_20_gpio14,
    to: BUZZER.plus,
    waypoints: route(
      U1.j1_20_gpio14,
      point(-139.43, 15.0, -26.41),
      point(-110.0, 18.0, -32.0),
      point(-75.0, 16.0, -38.0),
      point(-45.0, 16.0, -41.19),
      BUZZER.plus,
    ),
  },
  W_BUZZER_GND: {
    from: BUZZER.minus,
    to: BB.gnd,
    waypoints: route(
      BUZZER.minus,
      point(-45.0, 16.0, -48.81),
      point(-48.0, 18.0, -38.0),
      point(-55.0, 16.0, -27.0),
      BB.gnd,
    ),
  },
  W_USBC_MAIN: {
    from: point(-170, 8, -5),
    to: U1.microUsb,
    waypoints: route(
      point(-170, 8, -5),
      point(-155, 12, -8),
      point(-140, 15, -12),
      U1.microUsb,
    ),
  },
};

/**
 * Registro efetivo usado pelo viewer, auditor e tabela de conexões.
 * O override por ID elimina a antiga resolução por netName, que confundia
 * cabos com a mesma rede (por exemplo GND e 3V3).
 */
export const PHYSICAL_WIRING_REGISTRY: PhysicalCable[] = RAW_PHYSICAL_WIRING_REGISTRY.map((cableItem) => {
  const geometry = PHYSICAL_ROUTE_GEOMETRY[cableItem.id];
  if (!geometry) return cableItem;
  return {
    ...cableItem,
    fromCoord: geometry.from,
    toCoord: geometry.to,
    waypoints: geometry.waypoints,
    estimatedLengthMm: Math.round(lengthOf(geometry.waypoints)),
  };
});
