/** Redes elétricas congeladas para a bancada FuelGuard real. */
export type NetDomain = '3.3V_LOGIC' | '5.0V_POWER' | 'GROUND' | 'ANALOG' | 'PASSIVE';
export type NetCriticality = 'CRITICAL_PROTECTION' | 'STANDARD_SIGNAL' | 'POWER_RAIL';

export interface NetDefinition {
  name: string;
  domain: NetDomain;
  nominalVoltageV: number;
  maxAllowableVoltageV: number;
  sourcePin: string;
  sinkPins: string[];
  maxCurrentMa: number;
  criticality: NetCriticality;
  description: string;
}

export const FUELGUARD_NETS: Record<string, NetDefinition> = {
  '+5V_VBUS': { name: '+5V_VBUS', domain: '5.0V_POWER', nominalVoltageV: 5, maxAllowableVoltageV: 5.5, sourcePin: 'U1.5V', sinkPins: ['BZ1.VCC', 'PS1.VOUT'], maxCurrentMa: 500, criticality: 'POWER_RAIL', description: 'Alimentação de bancada; BZ1 pode operar neste trilho após validação de corrente.' },
  '+3.3V': { name: '+3.3V', domain: '3.3V_LOGIC', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, sourcePin: 'U1.3V3', sinkPins: ['RFID1.VCC', 'SEN1.VCC', 'SEN1.RX_MODE'], maxCurrentMa: 300, criticality: 'POWER_RAIL', description: 'Trilho lógico regulado do DevKit; SEN0311 opera aqui para garantir TX compatível com o ESP32.' },
  GND: { name: 'GND', domain: 'GROUND', nominalVoltageV: 0, maxAllowableVoltageV: 0.2, sourcePin: 'U1.GND', sinkPins: ['SEN1.GND', 'RFID1.GND', 'SW1.PIN2', 'D1.CATHODE', 'BZ1.GND'], maxCurrentMa: 800, criticality: 'POWER_RAIL', description: 'Referência comum de baixa tensão.' },
  LEVEL_UART_RX: { name: 'LEVEL_UART_RX', domain: '3.3V_LOGIC', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, sourcePin: 'SEN1.TX', sinkPins: ['U1.IO16'], maxCurrentMa: 5, criticality: 'CRITICAL_PROTECTION', description: 'UART TTL 9600 8N1 do SEN0311 para RX do ESP32; não conectar a 5 V.' },
  LEVEL_MODE_PROCESSED: { name: 'LEVEL_MODE_PROCESSED', domain: '3.3V_LOGIC', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, sourcePin: '+3.3V', sinkPins: ['SEN1.RX_MODE'], maxCurrentMa: 1, criticality: 'STANDARD_SIGNAL', description: 'RX do SEN0311 em nível alto para selecionar saída processada/estável.' },
  LEVEL_UART_TX: { name: 'LEVEL_UART_TX', domain: '3.3V_LOGIC', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, sourcePin: 'U1.IO17', sinkPins: ['SEN1.RX_CONFIG'], maxCurrentMa: 5, criticality: 'STANDARD_SIGNAL', description: 'TX reservado para configuração futura; a baseline mantém o modo processado por pull-up.' },
  LID_INTERLOCK: { name: 'LID_INTERLOCK', domain: '3.3V_LOGIC', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, sourcePin: 'U1.IO7', sinkPins: ['SW1.PIN1'], maxCurrentMa: 0.5, criticality: 'STANDARD_SIGNAL', description: 'Contato MC-38 com pull-up interno; polaridade NO/NC depende da variante comprada.' },
  SPI_CS: { name: 'SPI_CS', domain: '3.3V_LOGIC', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, sourcePin: 'U1.IO10', sinkPins: ['RFID1.SS'], maxCurrentMa: 5, criticality: 'STANDARD_SIGNAL', description: 'Chip Select do PN532 V4.' },
  SPI_MOSI: { name: 'SPI_MOSI', domain: '3.3V_LOGIC', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, sourcePin: 'U1.IO11', sinkPins: ['RFID1.MOSI'], maxCurrentMa: 5, criticality: 'STANDARD_SIGNAL', description: 'Dados ESP32 para PN532.' },
  SPI_SCK: { name: 'SPI_SCK', domain: '3.3V_LOGIC', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, sourcePin: 'U1.IO12', sinkPins: ['RFID1.SCK'], maxCurrentMa: 10, criticality: 'STANDARD_SIGNAL', description: 'Clock SPI nominal de 4 MHz.' },
  SPI_MISO: { name: 'SPI_MISO', domain: '3.3V_LOGIC', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, sourcePin: 'RFID1.MISO', sinkPins: ['U1.IO13'], maxCurrentMa: 5, criticality: 'STANDARD_SIGNAL', description: 'Dados PN532 para ESP32.' },
  STATUS_LED_CTRL: { name: 'STATUS_LED_CTRL', domain: '3.3V_LOGIC', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, sourcePin: 'U1.IO4', sinkPins: ['R3.1'], maxCurrentMa: 15, criticality: 'STANDARD_SIGNAL', description: 'GPIO4 para LED verde através de resistor de 220 Ω.' },
  BUZZER_CTRL: { name: 'BUZZER_CTRL', domain: '3.3V_LOGIC', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, sourcePin: 'U1.IO14', sinkPins: ['BZ1.CTRL'], maxCurrentMa: 30, criticality: 'CRITICAL_PROTECTION', description: 'Comando do indicador ativo CMI-1295IC-0385T; validar corrente/polaridade na unidade.' },
};
