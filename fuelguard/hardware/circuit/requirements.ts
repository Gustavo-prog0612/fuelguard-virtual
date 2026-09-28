/** Requisitos elétricos e mecânicos da configuração-base real da bancada. */

export interface HardwareRequirement {
  id: string;
  category: 'ELECTRICAL_SAFETY' | 'SIGNAL_INTEGRITY' | 'MECHANICAL' | 'ACOUSTIC';
  title: string;
  description: string;
  condition: string;
  nominalValue: string;
  minTolerance: number;
  maxTolerance: number;
  unit: string;
  status: 'PROVED_SAFE' | 'ACTIVE_AUDIT' | 'FAIL_HAZARD';
}

export const HARDWARE_REQUIREMENTS: HardwareRequirement[] = [
  {
    id: 'REQ-ELEC-01', category: 'ELECTRICAL_SAFETY', title: 'UART do SEN0311 dentro do domínio do ESP32-S3',
    description: 'O A02YYUW/SEN0311 será alimentado em 3,3 V. O TX do sensor segue para GPIO16 e o RX/MODE fica em nível alto para selecionar a saída processada; não existe caminho UART de 5 V liberado.',
    condition: 'V_LEVEL_TX <= 3.60V', nominalValue: '3.30', minTolerance: 3.0, maxTolerance: 3.60, unit: 'V', status: 'ACTIVE_AUDIT',
  },
  {
    id: 'REQ-ELEC-02', category: 'SIGNAL_INTEGRITY', title: 'UART TTL do sensor de nível',
    description: 'A interface deve ser 9600 bps, 8N1, com TX do SEN0311 em GPIO16/UART1_RX. GPIO17 permanece reservado para expansão e não pode ser usado como TRIG/ECHO.',
    condition: 'UART == 9600_8N1 && TX == GPIO16', nominalValue: '9600', minTolerance: 9600, maxTolerance: 9600, unit: 'baud', status: 'PROVED_SAFE',
  },
  {
    id: 'REQ-ELEC-03', category: 'ELECTRICAL_SAFETY', title: 'Terra comum da bancada',
    description: 'ESP32-S3, PN532 V4, SEN0311, MC-38, LED e buzzer ativo devem compartilhar a referência GND; VBUS de 5 V não pode ser aplicado diretamente a GPIO.',
    condition: 'V_GND_OFFSET <= 0.05V', nominalValue: '0.00', minTolerance: 0.00, maxTolerance: 0.05, unit: 'V', status: 'ACTIVE_AUDIT',
  },
  {
    id: 'REQ-MECH-01', category: 'MECHANICAL', title: 'Tanque FG-TANK-6L-R1 paramétrico',
    description: 'A bancada usa tanque retangular de acrílico com dimensões internas de 200 x 200 x 160 mm, paredes de 3 mm, tampa de 5 mm e quatro fixações M3.',
    condition: 'INNER == 200x200x160mm', nominalValue: '6.4', minTolerance: 0.0, maxTolerance: 6.4, unit: 'L geométricos', status: 'ACTIVE_AUDIT',
  },
  {
    id: 'REQ-ACOU-01', category: 'ACOUSTIC', title: 'Faixa útil do A02YYUW/SEN0311 no tanque',
    description: 'Com sensor alinhado no teto interno, 1–5 L produz aproximadamente 35–135 mm de distância água-sensor. O ensaio deve respeitar a zona cega nominal de 30 mm e confirmar a calibração com água.',
    condition: '30mm <= DIST_SENSOR_WATER <= 4500mm && ANG <= 5deg', nominalValue: '35–135', minTolerance: 30, maxTolerance: 4500, unit: 'mm', status: 'ACTIVE_AUDIT',
  },
];
