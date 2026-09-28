/**
 * FuelGuard Hardware Design — Mapa Canônico de Pinos do MVP
 * Define a atribuição física de cada pino do microcontrolador e dos módulos periféricos
 * com níveis lógicos de tensão nominal e tolerância elétrica.
 */

export interface PinMapping {
  pinNumber: number;
  pinLabel: string;
  gpioNumber?: number;
  netName: string;
  signalType: 'power' | 'ground' | 'digital_in' | 'digital_out' | 'spi_clock' | 'spi_mosi' | 'spi_miso' | 'analog_in';
  voltageDomainV: 3.3 | 5.0 | 0.0;
  maxToleratedVoltageV: number;
  connectedTo: {
    componentId: string;
    componentPin: string | number;
    description: string;
  };
  notes?: string;
}

export const ESP32_S3_PINMAP: PinMapping[] = [
  {
    pinNumber: 1,
    pinLabel: '3V3',
    netName: '+3.3V',
    signalType: 'power',
    voltageDomainV: 3.3,
    maxToleratedVoltageV: 3.6,
    connectedTo: {
      componentId: 'RFID1',
      componentPin: 'VCC',
      description: 'Alimentação lógica 3.3V para módulo PN532 NFC',
    },
  },
  {
    pinNumber: 2,
    pinLabel: '5V (VBUS)',
    netName: '+5V_VBUS',
    signalType: 'power',
    voltageDomainV: 5.0,
    maxToleratedVoltageV: 5.5,
    connectedTo: {
      componentId: 'SEN1',
      componentPin: 'VCC',
      description: 'Alimentação 5.0V primária para o sensor ultrassônico JSN-SR04T e buffer U2',
    },
  },
  {
    pinNumber: 3,
    pinLabel: 'GND',
    netName: 'GND',
    signalType: 'ground',
    voltageDomainV: 0.0,
    maxToleratedVoltageV: 0.0,
    connectedTo: {
      componentId: 'SYS_GND',
      componentPin: 'BARRAMENTO_TERRA',
      description: 'Barramento de terra comum unificado',
    },
  },
  {
    pinNumber: 4,
    pinLabel: 'IO4',
    gpioNumber: 4,
    netName: 'STATUS_LED_CTRL',
    signalType: 'digital_out',
    voltageDomainV: 3.3,
    maxToleratedVoltageV: 3.6,
    connectedTo: {
      componentId: 'D1',
      componentPin: 'ANODO',
      description: 'Acionamento do LED verde de telemetria via resistor limitador 1kΩ',
    },
  },
  {
    pinNumber: 5,
    pinLabel: 'IO5',
    gpioNumber: 5,
    netName: 'TRIG_3V3',
    signalType: 'digital_out',
    voltageDomainV: 3.3,
    maxToleratedVoltageV: 3.6,
    connectedTo: {
      componentId: 'U2',
      componentPin: '1A (Pin 2)',
      description: 'Disparo do pulso ultrassônico 3.3V para entrada do buffer 74AHCT125',
    },
  },
  {
    pinNumber: 6,
    pinLabel: 'IO6',
    gpioNumber: 6,
    netName: 'ECHO_3V0_SAFE',
    signalType: 'digital_in',
    voltageDomainV: 3.3,
    maxToleratedVoltageV: 3.6,
    connectedTo: {
      componentId: 'R_DIV',
      componentPin: 'VOUT',
      description: 'Eco ultrassônico atenuado para 3.00V através do divisor resistivo 10k/15k',
    },
  },
  {
    pinNumber: 7,
    pinLabel: 'IO7',
    gpioNumber: 7,
    netName: 'LID_INTERLOCK',
    signalType: 'digital_in',
    voltageDomainV: 3.3,
    maxToleratedVoltageV: 3.6,
    connectedTo: {
      componentId: 'SW1',
      componentPin: 'PIN1',
      description: 'Sensor Reed Switch magnético da tampa (Pull-up interno ativado)',
    },
  },
  {
    pinNumber: 10,
    pinLabel: 'IO10',
    gpioNumber: 10,
    netName: 'SPI_CS',
    signalType: 'digital_out',
    voltageDomainV: 3.3,
    maxToleratedVoltageV: 3.6,
    connectedTo: {
      componentId: 'RFID1',
      componentPin: 'SS/CS',
      description: 'Chip Select para comunicação SPI com PN532',
    },
  },
  {
    pinNumber: 11,
    pinLabel: 'IO11',
    gpioNumber: 11,
    netName: 'SPI_MOSI',
    signalType: 'spi_mosi',
    voltageDomainV: 3.3,
    maxToleratedVoltageV: 3.6,
    connectedTo: {
      componentId: 'RFID1',
      componentPin: 'MOSI',
      description: 'Master Out Slave In do barramento SPI',
    },
  },
  {
    pinNumber: 12,
    pinLabel: 'IO12',
    gpioNumber: 12,
    netName: 'SPI_SCK',
    signalType: 'spi_clock',
    voltageDomainV: 3.3,
    maxToleratedVoltageV: 3.6,
    connectedTo: {
      componentId: 'RFID1',
      componentPin: 'SCK',
      description: 'Clock serial SPI (4 MHz nominal)',
    },
  },
  {
    pinNumber: 13,
    pinLabel: 'IO13',
    gpioNumber: 13,
    netName: 'SPI_MISO',
    signalType: 'spi_miso',
    voltageDomainV: 3.3,
    maxToleratedVoltageV: 3.6,
    connectedTo: {
      componentId: 'RFID1',
      componentPin: 'MISO',
      description: 'Master In Slave Out do barramento SPI',
    },
  },
  {
    pinNumber: 14,
    pinLabel: 'IO14',
    gpioNumber: 14,
    netName: 'BUZZER_CTRL',
    signalType: 'digital_out',
    voltageDomainV: 3.3,
    maxToleratedVoltageV: 3.6,
    connectedTo: {
      componentId: 'BZ1',
      componentPin: 'POS',
      description: 'Sinal sonoro de bip / alarme de violação da tampa',
    },
  },
];
