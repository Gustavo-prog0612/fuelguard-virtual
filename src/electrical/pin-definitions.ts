/**
 * FuelGuard Virtual Test Bench — Definições de Pinagens e Componentes Elétricos
 * Especificação formal de nós, pinos, tensões nominais e barramentos.
 */

export type SignalLevel = '5V' | '3V3' | 'GND' | 'ANALOG' | 'PASSIVE';

export interface PinDefinition {
  id: string;
  name: string;
  label: string;
  level: SignalLevel;
  type: 'input' | 'output' | 'power' | 'bidirectional';
  description: string;
}

export interface ComponentHardwareSpec {
  id: string;
  name: string;
  nominalVoltage: SignalLevel;
  pins: PinDefinition[];
}

// 1. ESP32-S3 DevKitC-1
export const ESP32_S3_SPEC: ComponentHardwareSpec = {
  id: 'esp32_s3',
  name: 'ESP32-S3 DevKitC-1',
  nominalVoltage: '3V3',
  pins: [
    { id: 'esp_3v3', name: '3V3', label: '3V3', level: '3V3', type: 'power', description: 'Saída 3,3V do LDO onboard (máx 500mA)' },
    { id: 'esp_5v', name: '5V', label: '5V / VBUS', level: '5V', type: 'power', description: 'Entrada/Saída 5V do conector USB-C' },
    { id: 'esp_gnd', name: 'GND', label: 'GND', level: 'GND', type: 'power', description: 'Referencial Terra Comum' },
    { id: 'esp_gpio4', name: 'GPIO4', label: 'GPIO4 (LED)', level: '3V3', type: 'output', description: 'Acionamento do LED indicador verde' },
    { id: 'esp_gpio5', name: 'GPIO5', label: 'GPIO5 (TRIG)', level: '3V3', type: 'output', description: 'Disparo ultrassônico (→ buffer 74AHCT125)' },
    { id: 'esp_gpio6', name: 'GPIO6', label: 'GPIO6 (ECHO)', level: '3V3', type: 'input', description: 'Entrada de eco (MÁX 3,6V! Requer divisor)' },
    { id: 'esp_gpio7', name: 'GPIO7', label: 'GPIO7 (TAMPA)', level: '3V3', type: 'input', description: 'Sensor reed switch da tampa (pull-up 10k)' },
    { id: 'esp_gpio10', name: 'GPIO10', label: 'GPIO10 (CS)', level: '3V3', type: 'output', description: 'SPI Chip Select do PN532' },
    { id: 'esp_gpio11', name: 'GPIO11', label: 'GPIO11 (MOSI)', level: '3V3', type: 'output', description: 'SPI Master Out Slave In do PN532' },
    { id: 'esp_gpio12', name: 'GPIO12', label: 'GPIO12 (SCK)', level: '3V3', type: 'output', description: 'SPI Clock do PN532' },
    { id: 'esp_gpio13', name: 'GPIO13', label: 'GPIO13 (MISO)', level: '3V3', type: 'input', description: 'SPI Master In Slave Out do PN532' },
  ],
};

// 2. Transdutor e Placa JSN-SR04T v2.0
export const JSN_SR04T_SPEC: ComponentHardwareSpec = {
  id: 'jsn_sr04t',
  name: 'JSN-SR04T v2.0 (Acústico)',
  nominalVoltage: '5V',
  pins: [
    { id: 'jsn_vcc', name: 'VCC', label: 'VCC (5V)', level: '5V', type: 'power', description: 'Alimentação 5,0V (Requer > 4,5V)' },
    { id: 'jsn_gnd', name: 'GND', label: 'GND', level: 'GND', type: 'power', description: 'Terra comum do transdutor' },
    { id: 'jsn_trig', name: 'TRIG', label: 'TRIG (Input)', level: '5V', type: 'input', description: 'Pulso de disparo 10us (requer nível TTL 5V)' },
    { id: 'jsn_echo', name: 'ECHO', label: 'ECHO (Output)', level: '5V', type: 'output', description: 'Pulso de retorno 5,0V (PERIGO: atenuar antes de ligar no ESP32)' },
  ],
};

// 3. Buffer SN74AHCT125N (Conversor 3V3 -> 5V)
export const AHCT125_SPEC: ComponentHardwareSpec = {
  id: 'ahct125',
  name: 'Buffer SN74AHCT125N',
  nominalVoltage: '5V',
  pins: [
    { id: 'ahct_vcc', name: 'VCC', label: 'VCC (5V)', level: '5V', type: 'power', description: 'Alimentação 5V TTL/CMOS' },
    { id: 'ahct_gnd', name: 'GND', label: 'GND', level: 'GND', type: 'power', description: 'Terra comum' },
    { id: 'ahct_1oe', name: '1/OE', label: '1/OE (Enable)', level: 'GND', type: 'input', description: 'Habilitação da porta (GND = Ativo)' },
    { id: 'ahct_1a', name: '1A', label: '1A (In 3V3)', level: '3V3', type: 'input', description: 'Entrada lógica 3,3V do ESP32 GPIO5' },
    { id: 'ahct_1y', name: '1Y', label: '1Y (Out 5V)', level: '5V', type: 'output', description: 'Saída condicionada 5,0V TTL para TRIG' },
  ],
};

// 4. Divisor Resistivo de Tensão (10k / 15k)
export const VOLTAGE_DIVIDER_SPEC: ComponentHardwareSpec = {
  id: 'voltage_divider',
  name: 'Divisor Resistivo (10k / 15k)',
  nominalVoltage: 'PASSIVE',
  pins: [
    { id: 'div_in', name: 'VIN', label: 'VIN (Echo 5V)', level: '5V', type: 'input', description: 'Entrada conectada ao pino ECHO do JSN' },
    { id: 'div_out', name: 'VOUT', label: 'VOUT (3,00V)', level: '3V3', type: 'output', description: 'Saída atenuada de 3,00V para o ESP32 GPIO6' },
    { id: 'div_gnd', name: 'GND', label: 'GND (Ref)', level: 'GND', type: 'power', description: 'Referencial ligado ao GND comum' },
  ],
};

// 5. Módulo PN532 Breakout (SPI)
export const PN532_SPEC: ComponentHardwareSpec = {
  id: 'pn532',
  name: 'PN532 Breakout (NFC SPI)',
  nominalVoltage: '3V3',
  pins: [
    { id: 'nfc_vcc', name: 'VCC', label: 'VCC (3V3)', level: '3V3', type: 'power', description: 'Alimentação 3,3V' },
    { id: 'nfc_gnd', name: 'GND', label: 'GND', level: 'GND', type: 'power', description: 'Terra comum' },
    { id: 'nfc_cs', name: 'SS/CS', label: 'SS (GPIO10)', level: '3V3', type: 'input', description: 'SPI Chip Select' },
    { id: 'nfc_mosi', name: 'MOSI', label: 'MOSI (GPIO11)', level: '3V3', type: 'input', description: 'SPI Master Out Slave In' },
    { id: 'nfc_sck', name: 'SCK', label: 'SCK (GPIO12)', level: '3V3', type: 'input', description: 'SPI Clock' },
    { id: 'nfc_miso', name: 'MISO', label: 'MISO (GPIO13)', level: '3V3', type: 'output', description: 'SPI Master In Slave Out' },
  ],
};

// 6. Reed Switch da Tampa
export const REED_SWITCH_SPEC: ComponentHardwareSpec = {
  id: 'reed_switch',
  name: 'Reed Switch da Tampa',
  nominalVoltage: '3V3',
  pins: [
    { id: 'reed_pin1', name: 'PIN1', label: 'Sinal (GPIO7)', level: '3V3', type: 'bidirectional', description: 'Ligado ao GPIO7 com pull-up 10k a 3V3' },
    { id: 'reed_pin2', name: 'PIN2', label: 'GND', level: 'GND', type: 'power', description: 'Ligado ao terra comum' },
  ],
};

// 7. LED Verde + Resistor 1 kΩ
export const LED_SPEC: ComponentHardwareSpec = {
  id: 'led_green',
  name: 'LED Verde (Resistor 1k)',
  nominalVoltage: '3V3',
  pins: [
    { id: 'led_anode', name: 'ANODE', label: 'Anodo (GPIO4)', level: '3V3', type: 'input', description: 'Entrada via resistor 1 kΩ para limitar corrente' },
    { id: 'led_cathode', name: 'CATHODE', label: 'Catodo (GND)', level: 'GND', type: 'power', description: 'Ligado ao GND comum' },
  ],
};

// Cores dos Fios Didáticos Conforme Padrão Industrial
export const WIRE_COLORS: Record<string, string> = {
  gnd: '#1f2937',      // Preto / Grafite escuro
  vcc5v: '#dc2626',    // Vermelho vivo (+5V)
  vcc3v3: '#d97706',   // Laranja (+3V3)
  trig: '#7c3aed',     // Roxo (Pulso de disparo)
  echo: '#0284c7',     // Azul (Echo 5V)
  echoSafe: '#0369a1', // Azul marinho (Echo condicionado 3V0)
  spi: '#059669',      // Verde esmeralda (Barramento SPI)
  reed: '#b45309',     // Âmbar escuro (Tampa)
  led: '#166534',      // Verde floresta (LED)
  fault: '#b91c1c',    // Vermelho piscante (Perigo)
};
