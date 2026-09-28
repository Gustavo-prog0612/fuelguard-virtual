/** Netlist canônica da bancada FuelGuard com SEN0311 UART e MC-38. */
export interface HardwareNet {
  name: string;
  nominalVoltageV: number;
  maxAllowableVoltageV: number;
  domain: '3.3V_LOGIC' | '5.0V_POWER' | 'GROUND' | 'ANALOG' | 'PASSIVE';
  description: string;
  sourcePin: string;
  sinkPins: string[];
  maxCurrentMa: number;
  criticality: 'CRITICAL_PROTECTION' | 'STANDARD_SIGNAL' | 'POWER_RAIL';
}

export const FUELGUARD_HARDWARE_NETS: Record<string, HardwareNet> = {
  '+5V_VBUS': { name: '+5V_VBUS', nominalVoltageV: 5, maxAllowableVoltageV: 5.5, domain: '5.0V_POWER', description: 'Trilho 5 V da fonte USB-C da bancada.', sourcePin: 'U1.5V', sinkPins: ['BZ1.VCC'], maxCurrentMa: 500, criticality: 'POWER_RAIL' },
  '+3.3V': { name: '+3.3V', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, domain: '3.3V_LOGIC', description: 'Trilho regulado do DevKit; alimenta PN532 e SEN0311.', sourcePin: 'U1.3V3', sinkPins: ['RFID1.VCC', 'SEN1.VCC', 'SEN1.RX_MODE'], maxCurrentMa: 300, criticality: 'POWER_RAIL' },
  GND: { name: 'GND', nominalVoltageV: 0, maxAllowableVoltageV: 0.2, domain: 'GROUND', description: 'Terra comum da bancada.', sourcePin: 'U1.GND', sinkPins: ['SEN1.GND', 'RFID1.GND', 'SW1.PIN2', 'D1.CATHODE', 'BZ1.GND'], maxCurrentMa: 800, criticality: 'POWER_RAIL' },
  LEVEL_UART_RX: { name: 'LEVEL_UART_RX', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, domain: '3.3V_LOGIC', description: 'TX do SEN0311 para RX UART do ESP32 em GPIO16.', sourcePin: 'SEN1.TX', sinkPins: ['U1.IO16'], maxCurrentMa: 5, criticality: 'CRITICAL_PROTECTION' },
  LEVEL_MODE_PROCESSED: { name: 'LEVEL_MODE_PROCESSED', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, domain: '3.3V_LOGIC', description: 'RX do SEN0311 em nível alto seleciona valor processado.', sourcePin: '+3.3V', sinkPins: ['SEN1.RX_MODE'], maxCurrentMa: 1, criticality: 'STANDARD_SIGNAL' },
  LEVEL_UART_TX: { name: 'LEVEL_UART_TX', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, domain: '3.3V_LOGIC', description: 'TX do ESP32 em GPIO17 reservado para configuração futura.', sourcePin: 'U1.IO17', sinkPins: ['SEN1.RX_CONFIG'], maxCurrentMa: 5, criticality: 'STANDARD_SIGNAL' },
  LID_INTERLOCK: { name: 'LID_INTERLOCK', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, domain: '3.3V_LOGIC', description: 'MC-38 no GPIO7 com pull-up interno; validar NO/NC na unidade.', sourcePin: 'U1.IO7', sinkPins: ['SW1.PIN1'], maxCurrentMa: 0.5, criticality: 'STANDARD_SIGNAL' },
  SPI_CS: { name: 'SPI_CS', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, domain: '3.3V_LOGIC', description: 'Chip Select do PN532 V4.', sourcePin: 'U1.IO10', sinkPins: ['RFID1.SS'], maxCurrentMa: 5, criticality: 'STANDARD_SIGNAL' },
  SPI_MOSI: { name: 'SPI_MOSI', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, domain: '3.3V_LOGIC', description: 'MOSI do PN532.', sourcePin: 'U1.IO11', sinkPins: ['RFID1.MOSI'], maxCurrentMa: 5, criticality: 'STANDARD_SIGNAL' },
  SPI_SCK: { name: 'SPI_SCK', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, domain: '3.3V_LOGIC', description: 'Clock SPI do PN532.', sourcePin: 'U1.IO12', sinkPins: ['RFID1.SCK'], maxCurrentMa: 10, criticality: 'STANDARD_SIGNAL' },
  SPI_MISO: { name: 'SPI_MISO', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, domain: '3.3V_LOGIC', description: 'MISO do PN532.', sourcePin: 'RFID1.MISO', sinkPins: ['U1.IO13'], maxCurrentMa: 5, criticality: 'STANDARD_SIGNAL' },
  STATUS_LED_CTRL: { name: 'STATUS_LED_CTRL', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, domain: '3.3V_LOGIC', description: 'GPIO4 para LED via R3 220 Ω.', sourcePin: 'U1.IO4', sinkPins: ['R3.1'], maxCurrentMa: 15, criticality: 'STANDARD_SIGNAL' },
  BUZZER_CTRL: { name: 'BUZZER_CTRL', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, domain: '3.3V_LOGIC', description: 'GPIO14 para buzzer ativo CMI-1295IC-0385T; validar corrente/polaridade.', sourcePin: 'U1.IO14', sinkPins: ['BZ1.CTRL'], maxCurrentMa: 30, criticality: 'CRITICAL_PROTECTION' },
};
