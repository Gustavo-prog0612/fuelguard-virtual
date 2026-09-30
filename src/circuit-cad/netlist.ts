/**
 * FuelGuard — Netlist Canônica Completa
 *
 * Define todas as redes (nets), seus componentes e pinos.
 * Inclui o transistor Q1 (2N2222) e resistor R_BASE (1kΩ) que estavam faltando.
 *
 * Baseado em:
 *   - firmware/fuelguard_esp32_firmware.ino (canônico)
 *   - hardware/real-hardware-catalog.json
 *   - ESP32-S3 DevKitC-1 v1.1 User Guide (Espressif)
 *   - DFRobot SEN0311 / A02YYUW Wiki
 *   - ELECHOUSE PN532 V4 datasheet
 */

export interface NetPin {
  /** ID do componente (ex: 'j_esp32_left') */
  componentId: string;
  /** ID do pad no footprint (ex: 'p4' para GPIO4) */
  padId: string;
  /** Descrição legível */
  label: string;
}

export interface CircuitNet {
  /** Identificador único da rede */
  id: string;
  /** Nome da rede (ex: 'GND', '+3V3', 'GPIO4_LED') */
  name: string;
  /** Classe de rede para DRC (afeta largura mínima de trilha) */
  netClass: 'power' | 'ground' | 'signal' | 'spi' | 'uart';
  /** Corrente máxima estimada (mA) */
  maxCurrentMa: number;
  /** Largura mínima de trilha recomendada (mm) */
  traceWidthMm: number;
  /** Lista de pinos conectados nesta rede */
  pins: NetPin[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapeamento dos pinos do ESP32-S3 DevKitC-1 v1.1
// Header J1 (esquerdo) — 22 pinos em ordem top-down
// Fonte: Espressif DevKitC-1 v1.1 User Guide Tabela de Pinos
// ─────────────────────────────────────────────────────────────────────────────
export const ESP32_J1_PINMAP: Record<number, string> = {
  1:  '3V3',
  2:  '3V3',   // segundo pino 3.3V
  3:  'RESET',
  4:  'GPIO4',
  5:  'GPIO5',
  6:  'GPIO6',
  7:  'GPIO7',
  8:  'GPIO15',
  9:  'GPIO16',
  10: 'GPIO17',
  11: 'GPIO18',
  12: 'GPIO8',
  13: 'GPIO3',
  14: 'GPIO46',
  15: 'GPIO9',
  16: 'GPIO10',
  17: 'GPIO11',
  18: 'GPIO12',
  19: 'GPIO13',
  20: 'GPIO14',
  21: '5V',
  22: 'GND',
};

// Header J2 (direito) — não usado neste projeto
export const ESP32_J2_PINMAP: Record<number, string> = {
  1:  'GND',
  2:  'GPIO43_TX0',
  3:  'GPIO44_RX0',
  4:  'GPIO1',
  5:  'GPIO2',
  6:  'GPIO42',
  7:  'GPIO41',
  8:  'GPIO40',
  9:  'GPIO39',
  10: 'GPIO38',
  11: 'GPIO37',
  12: 'GPIO36',
  13: 'GPIO35',
  14: 'GPIO0',
  15: 'GPIO45',
  16: 'GPIO48',
  17: 'GPIO47',
  18: 'GPIO21',
  19: 'GPIO20',
  20: 'GPIO19',
  21: 'GPIO34',
  22: 'GND',
};

// ─────────────────────────────────────────────────────────────────────────────
// Netlist canônica do circuito FuelGuard
// ─────────────────────────────────────────────────────────────────────────────
export const FUELGUARD_NETLIST: CircuitNet[] = [
  // ── Alimentação +3.3V ──────────────────────────────────────────────────────
  {
    id: 'net_3v3',
    name: '+3V3',
    netClass: 'power',
    maxCurrentMa: 500,
    traceWidthMm: 0.5,
    pins: [
      { componentId: 'j_esp32_left', padId: 'p1',   label: 'ESP32 3V3 (J1.1)' },
      { componentId: 'j_esp32_left', padId: 'p2',   label: 'ESP32 3V3 (J1.2)' },
      { componentId: 'j_sen1',       padId: 'vcc',  label: 'SEN0311 VCC' },
      { componentId: 'j_sen1',       padId: 'mode', label: 'SEN0311 RX/MODE (HIGH)' },
      { componentId: 'j_pn532',      padId: 'vcc',  label: 'PN532 VCC' },
      { componentId: 'bz1',          padId: 'plus', label: 'Buzzer VCC (+)' },
    ],
  },

  // ── Terra (GND) ────────────────────────────────────────────────────────────
  {
    id: 'net_gnd',
    name: 'GND',
    netClass: 'ground',
    maxCurrentMa: 600,
    traceWidthMm: 0.8,
    pins: [
      { componentId: 'j_esp32_left', padId: 'p22',       label: 'ESP32 GND (J1.22)' },
      { componentId: 'j_sen1',       padId: 'gnd',       label: 'SEN0311 GND' },
      { componentId: 'j_pn532',      padId: 'gnd',       label: 'PN532 GND' },
      { componentId: 'j_reed',       padId: 'gnd',       label: 'Reed Switch GND' },
      { componentId: 'd1',           padId: 'cathode',   label: 'LED Cátodo' },
      { componentId: 'q1',           padId: 'emitter',   label: 'Transistor Emissor' },
    ],
  },

  // ── GPIO4 → LED (via R3 220Ω) ──────────────────────────────────────────────
  {
    id: 'net_gpio4_led',
    name: 'GPIO4_LED_CTRL',
    netClass: 'signal',
    maxCurrentMa: 12,
    traceWidthMm: 0.3,
    pins: [
      { componentId: 'j_esp32_left', padId: 'p4',  label: 'ESP32 GPIO4 (J1.4)' },
      { componentId: 'r3',           padId: 'p1',  label: 'R3 220Ω entrada' },
    ],
  },

  // ── R3 saída → LED Ânodo ───────────────────────────────────────────────────
  {
    id: 'net_led_anode',
    name: 'LED_ANODE',
    netClass: 'signal',
    maxCurrentMa: 12,
    traceWidthMm: 0.3,
    pins: [
      { componentId: 'r3', padId: 'p2',      label: 'R3 220Ω saída' },
      { componentId: 'd1', padId: 'anode',   label: 'LED Ânodo' },
    ],
  },

  // ── GPIO7 → Reed Switch ────────────────────────────────────────────────────
  {
    id: 'net_gpio7_reed',
    name: 'GPIO7_REED_INTERLOCK',
    netClass: 'signal',
    maxCurrentMa: 1,
    traceWidthMm: 0.3,
    pins: [
      { componentId: 'j_esp32_left', padId: 'p7',  label: 'ESP32 GPIO7 (J1.7) — INPUT_PULLUP' },
      { componentId: 'j_reed',       padId: 'sig', label: 'Reed Switch Sinal' },
    ],
  },

  // ── GPIO10 → PN532 SPI CS ──────────────────────────────────────────────────
  {
    id: 'net_spi_cs',
    name: 'SPI_CS',
    netClass: 'spi',
    maxCurrentMa: 5,
    traceWidthMm: 0.3,
    pins: [
      { componentId: 'j_esp32_left', padId: 'p16', label: 'ESP32 GPIO10 SPI_CS (J1.16)' },
      { componentId: 'j_pn532',      padId: 'ss',  label: 'PN532 SS/CS' },
    ],
  },

  // ── GPIO11 → PN532 SPI MOSI ────────────────────────────────────────────────
  {
    id: 'net_spi_mosi',
    name: 'SPI_MOSI',
    netClass: 'spi',
    maxCurrentMa: 5,
    traceWidthMm: 0.3,
    pins: [
      { componentId: 'j_esp32_left', padId: 'p17', label: 'ESP32 GPIO11 SPI_MOSI (J1.17)' },
      { componentId: 'j_pn532',      padId: 'mosi',label: 'PN532 MOSI' },
    ],
  },

  // ── GPIO12 → PN532 SPI SCK ─────────────────────────────────────────────────
  {
    id: 'net_spi_sck',
    name: 'SPI_SCK',
    netClass: 'spi',
    maxCurrentMa: 5,
    traceWidthMm: 0.3,
    pins: [
      { componentId: 'j_esp32_left', padId: 'p18', label: 'ESP32 GPIO12 SPI_SCK (J1.18)' },
      { componentId: 'j_pn532',      padId: 'sck', label: 'PN532 SCK' },
    ],
  },

  // ── GPIO13 → PN532 SPI MISO ────────────────────────────────────────────────
  {
    id: 'net_spi_miso',
    name: 'SPI_MISO',
    netClass: 'spi',
    maxCurrentMa: 5,
    traceWidthMm: 0.3,
    pins: [
      { componentId: 'j_esp32_left', padId: 'p19', label: 'ESP32 GPIO13 SPI_MISO (J1.19)' },
      { componentId: 'j_pn532',      padId: 'miso',label: 'PN532 MISO' },
    ],
  },

  // ── GPIO14 → R_BASE → Transistor Base ─────────────────────────────────────
  {
    id: 'net_gpio14_buzzer',
    name: 'GPIO14_BUZZER_CTRL',
    netClass: 'signal',
    maxCurrentMa: 5,
    traceWidthMm: 0.3,
    pins: [
      { componentId: 'j_esp32_left', padId: 'p20', label: 'ESP32 GPIO14 (J1.20)' },
      { componentId: 'r_base',       padId: 'p1',  label: 'R_BASE 1kΩ entrada' },
    ],
  },

  // ── R_BASE saída → Transistor Base ────────────────────────────────────────
  {
    id: 'net_buzzer_base',
    name: 'BUZZER_BASE',
    netClass: 'signal',
    maxCurrentMa: 5,
    traceWidthMm: 0.3,
    pins: [
      { componentId: 'r_base', padId: 'p2',    label: 'R_BASE 1kΩ saída' },
      { componentId: 'q1',     padId: 'base',  label: 'Transistor 2N2222 Base' },
    ],
  },

  // ── Transistor Coletor → Buzzer GND (−) ───────────────────────────────────
  {
    id: 'net_buzzer_collector',
    name: 'BUZZER_COLLECTOR',
    netClass: 'signal',
    maxCurrentMa: 30,
    traceWidthMm: 0.4,
    pins: [
      { componentId: 'q1',  padId: 'collector', label: 'Transistor 2N2222 Coletor' },
      { componentId: 'bz1', padId: 'minus',     label: 'Buzzer GND (−)' },
    ],
  },

  // ── GPIO16 → SEN0311 TX (UART RX) ─────────────────────────────────────────
  {
    id: 'net_uart_rx',
    name: 'GPIO16_UART_RX',
    netClass: 'uart',
    maxCurrentMa: 5,
    traceWidthMm: 0.3,
    pins: [
      { componentId: 'j_esp32_left', padId: 'p9', label: 'ESP32 GPIO16 UART1_RX (J1.9)' },
      { componentId: 'j_sen1',       padId: 'tx', label: 'SEN0311 TX (saída do sensor)' },
    ],
  },
];

/** Retorna a net à qual um pad pertence, dado componentId e padId */
export function getNetForPad(componentId: string, padId: string): CircuitNet | undefined {
  return FUELGUARD_NETLIST.find((net) =>
    net.pins.some((p) => p.componentId === componentId && p.padId === padId)
  );
}

/** Retorna todas as nets de um componente */
export function getNetsForComponent(componentId: string): CircuitNet[] {
  return FUELGUARD_NETLIST.filter((net) =>
    net.pins.some((p) => p.componentId === componentId)
  );
}
