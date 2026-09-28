/** Mapa lógico de pinos do ESP32-S3 usado na bancada FuelGuard. */
export interface PinMapping {
  pinNumber: number;
  pinLabel: string;
  gpioNumber?: number;
  netName: string;
  signalType: 'power' | 'ground' | 'digital_in' | 'digital_out' | 'spi_clock' | 'spi_mosi' | 'spi_miso' | 'analog_in';
  voltageDomainV: 3.3 | 5.0 | 0.0;
  maxToleratedVoltageV: number;
  connectedTo: { componentId: string; componentPin: string | number; description: string };
  notes?: string;
}

export const ESP32_S3_PINMAP: PinMapping[] = [
  { pinNumber: 1, pinLabel: '3V3', netName: '+3.3V', signalType: 'power', voltageDomainV: 3.3, maxToleratedVoltageV: 3.6, connectedTo: { componentId: 'RFID1/SEN1', componentPin: 'VCC', description: 'Alimentação regulada para PN532 V4 e SEN0311 operado a 3,3 V.' } },
  { pinNumber: 2, pinLabel: '5V (VBUS)', netName: '+5V_VBUS', signalType: 'power', voltageDomainV: 5.0, maxToleratedVoltageV: 5.5, connectedTo: { componentId: 'PS1/BZ1', componentPin: 'VOUT/VCC', description: 'Fonte USB-C de bancada e alimentação opcional do buzzer ativo.' } },
  { pinNumber: 3, pinLabel: 'GND', netName: 'GND', signalType: 'ground', voltageDomainV: 0.0, maxToleratedVoltageV: 0.0, connectedTo: { componentId: 'SYS_GND', componentPin: 'BARRAMENTO', description: 'Terra comum de baixa tensão.' } },
  { pinNumber: 4, pinLabel: 'IO4', gpioNumber: 4, netName: 'STATUS_LED_CTRL', signalType: 'digital_out', voltageDomainV: 3.3, maxToleratedVoltageV: 3.6, connectedTo: { componentId: 'D1', componentPin: 'ANODE via R3 220R', description: 'LED verde de status com resistor limitador de 220 Ω.' } },
  { pinNumber: 7, pinLabel: 'IO7', gpioNumber: 7, netName: 'LID_INTERLOCK', signalType: 'digital_in', voltageDomainV: 3.3, maxToleratedVoltageV: 3.6, connectedTo: { componentId: 'SW1', componentPin: 'PIN1', description: 'MC-38 com pull-up interno; NO/NC deve ser confirmado na variante.' } },
  { pinNumber: 10, pinLabel: 'IO10', gpioNumber: 10, netName: 'SPI_CS', signalType: 'digital_out', voltageDomainV: 3.3, maxToleratedVoltageV: 3.6, connectedTo: { componentId: 'RFID1', componentPin: 'SS/CS', description: 'Chip Select do PN532 V4.' } },
  { pinNumber: 11, pinLabel: 'IO11', gpioNumber: 11, netName: 'SPI_MOSI', signalType: 'spi_mosi', voltageDomainV: 3.3, maxToleratedVoltageV: 3.6, connectedTo: { componentId: 'RFID1', componentPin: 'MOSI', description: 'Dados para PN532.' } },
  { pinNumber: 12, pinLabel: 'IO12', gpioNumber: 12, netName: 'SPI_SCK', signalType: 'spi_clock', voltageDomainV: 3.3, maxToleratedVoltageV: 3.6, connectedTo: { componentId: 'RFID1', componentPin: 'SCK', description: 'Clock SPI nominal de 4 MHz.' } },
  { pinNumber: 13, pinLabel: 'IO13', gpioNumber: 13, netName: 'SPI_MISO', signalType: 'spi_miso', voltageDomainV: 3.3, maxToleratedVoltageV: 3.6, connectedTo: { componentId: 'RFID1', componentPin: 'MISO', description: 'Dados recebidos do PN532.' } },
  { pinNumber: 16, pinLabel: 'IO16 / UART1_RX', gpioNumber: 16, netName: 'LEVEL_UART_RX', signalType: 'digital_in', voltageDomainV: 3.3, maxToleratedVoltageV: 3.6, connectedTo: { componentId: 'SEN1', componentPin: 'TX', description: 'Recebe frame UART 0xFF + DATA_H + DATA_L + checksum a 9600 8N1.' }, notes: 'Atribuição de projeto; validar disponibilidade no firmware e na revisão do DevKit.' },
  { pinNumber: 17, pinLabel: 'IO17 / UART1_TX', gpioNumber: 17, netName: 'LEVEL_UART_TX', signalType: 'digital_out', voltageDomainV: 3.3, maxToleratedVoltageV: 3.6, connectedTo: { componentId: 'SEN1', componentPin: 'RX', description: 'Reservado para configuração futura; RX do sensor permanece em nível alto para modo processado.' }, notes: 'Atribuição de projeto; não é necessário para leitura nominal.' },
  { pinNumber: 14, pinLabel: 'IO14', gpioNumber: 14, netName: 'BUZZER_CTRL', signalType: 'digital_out', voltageDomainV: 3.3, maxToleratedVoltageV: 3.6, connectedTo: { componentId: 'BZ1', componentPin: 'CTRL', description: 'Buzzer ativo internamente acionado; confirmar se o nível de 3,3 V e a corrente da unidade são compatíveis.' } },
];
