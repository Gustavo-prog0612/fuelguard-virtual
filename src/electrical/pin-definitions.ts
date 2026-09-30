/** Definições de pinos da configuração real de bancada FuelGuard. */
export type SignalLevel = '5V' | '3V3' | 'GND' | 'ANALOG' | 'PASSIVE';
export interface PinDefinition { id: string; name: string; label: string; level: SignalLevel; type: 'input' | 'output' | 'power' | 'bidirectional'; description: string; }
export interface ComponentHardwareSpec { id: string; name: string; nominalVoltage: SignalLevel; pins: PinDefinition[]; }

export const ESP32_S3_SPEC: ComponentHardwareSpec = {
  id: 'esp32_s3', name: 'ESP32-S3 DevKitC-1 N8R8 v1.1', nominalVoltage: '3V3', pins: [
    { id: 'esp_3v3', name: '3V3', label: '3V3', level: '3V3', type: 'power', description: 'Saída regulada de 3,3 V do DevKit.' },
    { id: 'esp_5v', name: '5V', label: '5V / VBUS', level: '5V', type: 'power', description: 'VBUS proveniente da fonte USB-C.' },
    { id: 'esp_gnd', name: 'GND', label: 'GND', level: 'GND', type: 'power', description: 'Referência comum.' },
    { id: 'esp_gpio4', name: 'GPIO4', label: 'GPIO4 (LED)', level: '3V3', type: 'output', description: 'LED verde por R3 de 220 Ω.' },
    { id: 'esp_gpio7', name: 'GPIO7', label: 'GPIO7 (TAMPA)', level: '3V3', type: 'input', description: 'MC-38 com pull-up interno.' },
    { id: 'esp_gpio10', name: 'GPIO10', label: 'GPIO10 (CS)', level: '3V3', type: 'output', description: 'SPI CS do PN532.' },
    { id: 'esp_gpio11', name: 'GPIO11', label: 'GPIO11 (MOSI)', level: '3V3', type: 'output', description: 'SPI MOSI do PN532.' },
    { id: 'esp_gpio12', name: 'GPIO12', label: 'GPIO12 (SCK)', level: '3V3', type: 'output', description: 'SPI SCK do PN532.' },
    { id: 'esp_gpio13', name: 'GPIO13', label: 'GPIO13 (MISO)', level: '3V3', type: 'input', description: 'SPI MISO do PN532.' },
    { id: 'esp_gpio14', name: 'GPIO14', label: 'GPIO14 (BUZZER)', level: '3V3', type: 'output', description: 'Comando do buzzer ativo; corrente deve ser confirmada.' },
    { id: 'esp_gpio16', name: 'GPIO16', label: 'GPIO16 (UART1 RX)', level: '3V3', type: 'input', description: 'Recebe TX do SEN0311 a 9600 8N1.' },
    { id: 'esp_gpio17', name: 'GPIO17', label: 'GPIO17 (UART1 TX)', level: '3V3', type: 'output', description: 'Reservado para RX/configuração do SEN0311.' },
  ],
};

export const A02YYUW_SPEC: ComponentHardwareSpec = {
  id: 'a02yyuw_sen0311', name: 'DFRobot A02YYUW / SEN0311', nominalVoltage: '3V3', pins: [
    { id: 'level_vcc', name: 'VCC', label: 'VCC (3V3)', level: '3V3', type: 'power', description: 'Sensor opera em 3,3–5 V; baseline usa 3,3 V.' },
    { id: 'level_gnd', name: 'GND', label: 'GND', level: 'GND', type: 'power', description: 'Terra comum.' },
    { id: 'level_rx_mode', name: 'RX', label: 'RX (MODE)', level: '3V3', type: 'input', description: 'High/flutuante seleciona valor processado; baseline amarra em 3,3 V.' },
    { id: 'level_tx', name: 'TX', label: 'TX (UART)', level: '3V3', type: 'output', description: 'Frame 0xFF + DATA_H + DATA_L + checksum, 9600 8N1.' },
  ],
};

export const PN532_SPEC: ComponentHardwareSpec = {
  id: 'pn532', name: 'Adafruit PN532 Breakout v1.6 (SPI)', nominalVoltage: '3V3', pins: [
    { id: 'nfc_vcc', name: 'VCC', label: 'VCC (3V3)', level: '3V3', type: 'power', description: 'Alimentação 3,3 V.' },
    { id: 'nfc_gnd', name: 'GND', label: 'GND', level: 'GND', type: 'power', description: 'Terra comum.' },
    { id: 'nfc_cs', name: 'SS/CS', label: 'SS (GPIO10)', level: '3V3', type: 'input', description: 'SPI CS.' },
    { id: 'nfc_mosi', name: 'MOSI', label: 'MOSI (GPIO11)', level: '3V3', type: 'input', description: 'SPI MOSI.' },
    { id: 'nfc_sck', name: 'SCK', label: 'SCK (GPIO12)', level: '3V3', type: 'input', description: 'SPI clock.' },
    { id: 'nfc_miso', name: 'MISO', label: 'MISO (GPIO13)', level: '3V3', type: 'output', description: 'SPI MISO.' },
  ],
};

export const REED_SWITCH_SPEC: ComponentHardwareSpec = { id: 'reed_switch', name: 'MC-38 da Tampa', nominalVoltage: '3V3', pins: [
  { id: 'reed_pin1', name: 'PIN1', label: 'Sinal (GPIO7)', level: '3V3', type: 'bidirectional', description: 'Polaridade NO/NC da variante comprada deve ser confirmada.' },
  { id: 'reed_pin2', name: 'PIN2', label: 'GND', level: 'GND', type: 'power', description: 'Retorno ao terra comum.' },
] };

export const LED_SPEC: ComponentHardwareSpec = { id: 'led_green', name: 'LED Verde + R3 220 Ω', nominalVoltage: '3V3', pins: [
  { id: 'led_anode', name: 'ANODE', label: 'Anodo via R3 220 Ω', level: '3V3', type: 'input', description: 'Corrente limitada pelo resistor de 220 Ω.' },
  { id: 'led_cathode', name: 'CATHODE', label: 'Catodo (GND)', level: 'GND', type: 'power', description: 'Ligado ao terra comum.' },
] };

export const BUZZER_SPEC: ComponentHardwareSpec = { id: 'buzzer_active', name: 'Same Sky CMI-1295IC-0385T', nominalVoltage: '3V3', pins: [
  { id: 'buzzer_ctrl', name: 'CTRL', label: 'CTRL (GPIO14)', level: '3V3', type: 'input', description: 'Indicador internamente acionado; medir corrente/polaridade.' },
  { id: 'buzzer_gnd', name: 'GND', label: 'GND', level: 'GND', type: 'power', description: 'Retorno do buzzer.' },
] };

export const WIRE_COLORS: Record<string, string> = {
  gnd: '#1f2937', vcc5v: '#dc2626', vcc3v3: '#d97706', uart: '#0ea5e9', spi: '#059669', reed: '#b45309', led: '#166534', buzzer: '#f59e0b', fault: '#b91c1c'
};
