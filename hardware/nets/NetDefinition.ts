/** Redes elétricas congeladas para a bancada FuelGuard real. */
export type NetDomain = '3.3V_LOGIC' | '5.0V_POWER' | 'SWITCHED_5V_RETURN' | 'GROUND' | 'ANALOG' | 'PASSIVE';
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
  '+5V_VBUS': { name: '+5V_VBUS', domain: '5.0V_POWER', nominalVoltageV: 5, maxAllowableVoltageV: 5.5, sourcePin: 'U1.5V', sinkPins: ['BZ1.VCC', 'PS1.VOUT'], maxCurrentMa: 500, criticality: 'POWER_RAIL', description: 'Alimentação de bancada; BZ1 recebe VCC neste trilho e é comutado no lado baixo por Q1.' },
  '+3.3V': { name: '+3.3V', domain: '3.3V_LOGIC', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, sourcePin: 'U1.3V3', sinkPins: ['RFID1.VCC', 'SEN1.VCC', 'SEN1.RX_MODE'], maxCurrentMa: 300, criticality: 'POWER_RAIL', description: 'Trilho lógico regulado do DevKit; SEN0311 opera aqui para garantir TX compatível com o ESP32.' },
  GND: { name: 'GND', domain: 'GROUND', nominalVoltageV: 0, maxAllowableVoltageV: 0.2, sourcePin: 'U1.GND', sinkPins: ['SEN1.GND', 'RFID1.GND', 'SW1.PIN2', 'D1.CATHODE', 'Q1.E'], maxCurrentMa: 800, criticality: 'POWER_RAIL', description: 'Referência comum de baixa tensão; o buzzer retorna por Q1.' },
  LEVEL_UART_RX: { name: 'LEVEL_UART_RX', domain: '3.3V_LOGIC', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, sourcePin: 'SEN1.TX', sinkPins: ['U1.IO16'], maxCurrentMa: 5, criticality: 'CRITICAL_PROTECTION', description: 'UART TTL 9600 8N1 do SEN0311 para RX do ESP32; não conectar a 5 V.' },
  LEVEL_MODE_PROCESSED: { name: 'LEVEL_MODE_PROCESSED', domain: '3.3V_LOGIC', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, sourcePin: '+3.3V', sinkPins: ['SEN1.RX_MODE'], maxCurrentMa: 1, criticality: 'STANDARD_SIGNAL', description: 'RX do SEN0311 em nível alto para selecionar saída processada/estável.' },
  LEVEL_UART_TX: { name: 'LEVEL_UART_TX', domain: '3.3V_LOGIC', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, sourcePin: 'U1.IO17', sinkPins: ['SEN1.RX_CONFIG'], maxCurrentMa: 5, criticality: 'STANDARD_SIGNAL', description: 'TX reservado para configuração futura; a baseline mantém o modo processado por pull-up.' },
  LID_INTERLOCK: { name: 'LID_INTERLOCK', domain: '3.3V_LOGIC', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, sourcePin: 'U1.IO7', sinkPins: ['SW1.PIN1'], maxCurrentMa: 0.5, criticality: 'STANDARD_SIGNAL', description: 'Contato MC-38 com pull-up interno; polaridade NO/NC depende da variante comprada.' },
  SPI_CS: { name: 'SPI_CS', domain: '3.3V_LOGIC', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, sourcePin: 'U1.IO10', sinkPins: ['RFID1.SS'], maxCurrentMa: 5, criticality: 'STANDARD_SIGNAL', description: 'Chip Select do PN532 V4.' },
  SPI_MOSI: { name: 'SPI_MOSI', domain: '3.3V_LOGIC', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, sourcePin: 'U1.IO11', sinkPins: ['RFID1.MOSI'], maxCurrentMa: 5, criticality: 'STANDARD_SIGNAL', description: 'Dados ESP32 para PN532.' },
  SPI_SCK: { name: 'SPI_SCK', domain: '3.3V_LOGIC', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, sourcePin: 'U1.IO12', sinkPins: ['RFID1.SCK'], maxCurrentMa: 10, criticality: 'STANDARD_SIGNAL', description: 'Clock SPI nominal de 4 MHz.' },
  SPI_MISO: { name: 'SPI_MISO', domain: '3.3V_LOGIC', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, sourcePin: 'RFID1.MISO', sinkPins: ['U1.IO13'], maxCurrentMa: 5, criticality: 'STANDARD_SIGNAL', description: 'Dados PN532 para ESP32.' },
  STATUS_LED_CTRL: { name: 'STATUS_LED_CTRL', domain: '3.3V_LOGIC', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, sourcePin: 'U1.IO4', sinkPins: ['R3.1'], maxCurrentMa: 15, criticality: 'STANDARD_SIGNAL', description: 'GPIO4 para LED verde através de resistor de 220 Ω.' },
  BUZZER_CTRL: { name: 'BUZZER_CTRL', domain: '3.3V_LOGIC', nominalVoltageV: 3.3, maxAllowableVoltageV: 3.6, sourcePin: 'U1.IO14', sinkPins: ['R_BASE.1', 'Q1.B'], maxCurrentMa: 3, criticality: 'CRITICAL_PROTECTION', description: 'GPIO14 comanda a base de Q1 através de R_BASE de 1 kΩ; nunca é ligado diretamente ao BZ1.' },
  BUZZER_LOW_SIDE: { name: 'BUZZER_LOW_SIDE', domain: 'SWITCHED_5V_RETURN', nominalVoltageV: 5, maxAllowableVoltageV: 5.5, sourcePin: 'Q1.C', sinkPins: ['BZ1.NEG'], maxCurrentMa: 30, criticality: 'CRITICAL_PROTECTION', description: 'Coletor de Q1 comuta o retorno negativo do buzzer ativo; emissor de Q1 vai ao GND.' },
};
