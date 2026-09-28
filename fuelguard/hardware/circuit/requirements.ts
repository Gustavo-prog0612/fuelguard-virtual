/**
 * FuelGuard Hardware Design — Requisitos Elétricos e Mecatrônicos Formais
 * Define limites operacionais, critérios de conformidade e testes obrigatórios.
 */

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
    id: 'REQ-ELEC-01',
    category: 'ELECTRICAL_SAFETY',
    title: 'Proteção de Sobretensão no Pino de Eco (IO6)',
    description: 'O pino GPIO6 do ESP32-S3 não é tolerante a 5V (tensão máxima absoluta: 3.6V). O sinal de 5V retornado pelo sensor JSN-SR04T deve passar obrigatoriamente pelo divisor de tensão passivo 10k/15k.',
    condition: 'V_ECHO_ATTENUATED <= 3.40V',
    nominalValue: '3.00',
    minTolerance: 2.85,
    maxTolerance: 3.30,
    unit: 'V',
    status: 'PROVED_SAFE',
  },
  {
    id: 'REQ-ELEC-02',
    category: 'SIGNAL_INTEGRITY',
    title: 'Disparo de Nível Lógico TTL no Pino TRIG',
    description: 'O sensor ultrassônico estanque JSN-SR04T exige pulso de disparo com nível alto de pelo menos 4.5V (TTL alto) com duração mínima de 10µs. A saída de 3.3V do ESP32 é elevada por buffer SN74AHCT125N.',
    condition: 'V_TRIG_HIGH >= 4.50V',
    nominalValue: '5.00',
    minTolerance: 4.50,
    maxTolerance: 5.25,
    unit: 'V',
    status: 'PROVED_SAFE',
  },
  {
    id: 'REQ-ELEC-03',
    category: 'ELECTRICAL_SAFETY',
    title: 'Equipotencialidade e Terra Unificado',
    description: 'Todas as referências de GND dos módulos periféricos (PN532, JSN-SR04T, divisor, reed switch, buzzer, LED) devem convergir para o mesmo plano de terra sem loops indutivos.',
    condition: 'V_GND_OFFSET <= 0.05V',
    nominalValue: '0.00',
    minTolerance: 0.00,
    maxTolerance: 0.05,
    unit: 'V',
    status: 'PROVED_SAFE',
  },
  {
    id: 'REQ-MECH-01',
    category: 'MECHANICAL',
    title: 'Alinhamento dos Terminais na Matriz da Protoboard',
    description: 'Os pin headers de 2x22 do ESP32-S3 DevKitC-1 devem se encaixar nos furos da protoboard BB-830 transpassando a canaleta central de 0.3" (7.62mm) sem curtos entre trilhas adjacentes.',
    condition: 'PITCH == 2.54mm && SPAN == 22.86mm',
    nominalValue: '2.54',
    minTolerance: 2.50,
    maxTolerance: 2.58,
    unit: 'mm',
    status: 'PROVED_SAFE',
  },
  {
    id: 'REQ-ACOU-01',
    category: 'ACOUSTIC',
    title: 'Zona Cega e Alinhamento do Transdutor Ultrassônico',
    description: 'O transdutor piezoelétrico M20 possui zona cega acústica de 20 cm. O sensor na tampa deve apontar rigorosamente a 90° em relação à superfície da água, respeitando a distância mínima de 200 mm.',
    condition: 'DIST_SENSOR_MIN >= 200mm && ANG_INCIDENCE <= 5deg',
    nominalValue: '220',
    minTolerance: 200,
    maxTolerance: 1500,
    unit: 'mm',
    status: 'PROVED_SAFE',
  },
];
