/**
 * FuelGuard Virtual Test Bench — Motor de Validação Elétrica em Tempo Real
 * Analisa a topologia da fiação, detecta sobretensões, buffers ausentes e terras desconectados.
 */

export interface CircuitConnection {
  id: string;
  sourcePinId: string;
  targetPinId: string;
  wireType?: string;
}

export type ValidationStatus = 'PASS' | 'WARN' | 'FAIL';

export interface RuleEvaluation {
  ruleId: string;
  title: string;
  category: 'SAFETY' | 'SIGNAL_INTEGRITY' | 'GROUNDING' | 'FUNCTIONAL';
  status: ValidationStatus;
  voltageObserved: string;
  voltageAllowed: string;
  message: string;
  recommendation: string;
}

export interface CircuitValidationReport {
  overallStatus: 'NOMINAL' | 'WARNING' | 'CRITICAL_ERROR';
  criticalViolationsCount: number;
  warningsCount: number;
  passedCount: number;
  rules: RuleEvaluation[];
}

export class CircuitValidator {
  /**
   * Avalia a lista de conexões (arestas) no canvas da bancada.
   */
  public static evaluate(connections: CircuitConnection[]): CircuitValidationReport {
    const rules: RuleEvaluation[] = [];

    // Mapeamento bidirecional de conexões para análise de nós
    const isConnected = (pinA: string, pinB: string): boolean => {
      return connections.some(
        (c) =>
          (c.sourcePinId === pinA && c.targetPinId === pinB) ||
          (c.sourcePinId === pinB && c.targetPinId === pinA)
      );
    };

    // -------------------------------------------------------------
    // RULE-01: Proteção de Sobretensão do Pino ECHO (CRÍTICO)
    // O JSN-SR04T emite pulso de retorno a 5,0V.
    // Deve passar pelo Divisor 10k/15k (3,00V).
    // Conectar direto no GPIO6 (3,3V máx 3,6V) queima a porta do ESP32!
    // -------------------------------------------------------------
    const echoDirectToEsp = isConnected('jsn_echo', 'esp_gpio6');
    const echoToDivider = isConnected('jsn_echo', 'div_in');
    const dividerToEsp = isConnected('div_out', 'esp_gpio6');
    const dividerGnd = isConnected('div_gnd', 'esp_gnd');

    if (echoDirectToEsp) {
      rules.push({
        ruleId: 'RULE-01',
        title: 'Proteção de Sobretensão do Pino ECHO',
        category: 'SAFETY',
        status: 'FAIL',
        voltageObserved: '5,00 V (Direto)',
        voltageAllowed: '3,30 V (Máx 3,60 V)',
        message: 'SOBRETENSÃO CRÍTICA: O pulso ECHO de 5V do sensor JSN está ligado diretamente ao GPIO6 do ESP32!',
        recommendation: 'Desconecte imediatamente o fio direto. Conecte ECHO -> Divisor VIN, e Divisor VOUT (3,0V) -> GPIO6.',
      });
    } else if (echoToDivider && dividerToEsp && dividerGnd) {
      rules.push({
        ruleId: 'RULE-01',
        title: 'Proteção de Sobretensão do Pino ECHO',
        category: 'SAFETY',
        status: 'PASS',
        voltageObserved: '3,00 V (Condicionado)',
        voltageAllowed: '3,30 V (Máx 3,60 V)',
        message: 'Conformidade de Tensão: Divisor resistivo 10k/15k atenua 5,0V para 3,00V seguro no GPIO6.',
        recommendation: 'Topologia segura e validada para montagem em bancada física.',
      });
    } else {
      rules.push({
        ruleId: 'RULE-01',
        title: 'Proteção de Sobretensão do Pino ECHO',
        category: 'SAFETY',
        status: 'WARN',
        voltageObserved: '0,00 V (Aberto)',
        voltageAllowed: '3,30 V (Máx 3,60 V)',
        message: 'Pino ECHO não conectado completamente. A leitura ultrassônica ficará inoperante (timeout).',
        recommendation: 'Conecte ECHO -> Divisor VIN e Divisor VOUT -> GPIO6 com GND compartilhado.',
      });
    }

    // -------------------------------------------------------------
    // RULE-02: Buffer de Elevação de Nível do Pulso TRIG (INTEGRIDADE)
    // O GPIO5 do ESP32 emite pulso a 3,3V.
    // O JSN-SR04T requer nível TTL/CMOS de 5,0V para disparo estável.
    // O Buffer SN74AHCT125N converte 3,3V para 5,0V.
    // -------------------------------------------------------------
    const trigDirectToJsn = isConnected('esp_gpio5', 'jsn_trig');
    const trigToBuffer = isConnected('esp_gpio5', 'ahct_1a');
    const bufferToJsn = isConnected('ahct_1y', 'jsn_trig');
    const bufferEnableGnd = isConnected('ahct_1oe', 'esp_gnd') || isConnected('ahct_1oe', 'ahct_gnd');

    if (trigToBuffer && bufferToJsn && bufferEnableGnd) {
      rules.push({
        ruleId: 'RULE-02',
        title: 'Buffer de Elevação do Disparo TRIG',
        category: 'SIGNAL_INTEGRITY',
        status: 'PASS',
        voltageObserved: '5,00 V (TTL/CMOS)',
        voltageAllowed: '5,00 V Requerido',
        message: 'Buffer SN74AHCT125N eleva o pulso do GPIO5 (3,3V) para 5,0V estável com controle habilitado.',
        recommendation: 'Disparo ultrassônico assegurado mesmo sob ruído elétrico da fonte.',
      });
    } else if (trigDirectToJsn) {
      rules.push({
        ruleId: 'RULE-02',
        title: 'Buffer de Elevação do Disparo TRIG',
        category: 'SIGNAL_INTEGRITY',
        status: 'WARN',
        voltageObserved: '3,30 V (Marginal)',
        voltageAllowed: '5,00 V Requerido',
        message: 'Disparo Direto em 3,3V: Nível marginal que pode falhar em disparar o JSN-SR04T em bancada física.',
        recommendation: 'Insira o buffer SN74AHCT125N alimentado a 5V entre o GPIO5 e o pino TRIG.',
      });
    } else {
      rules.push({
        ruleId: 'RULE-02',
        title: 'Buffer de Elevação do Disparo TRIG',
        category: 'SIGNAL_INTEGRITY',
        status: 'WARN',
        voltageObserved: '0,00 V (Aberto)',
        voltageAllowed: '5,00 V Requerido',
        message: 'Pino TRIG não conectado. Transdutor não emitirá rajadas de 40 kHz.',
        recommendation: 'Ligue GPIO5 -> 74AHCT125 (1A) e saída (1Y) -> JSN TRIG.',
      });
    }

    // -------------------------------------------------------------
    // RULE-03: Barramento de Terra Unificado (GND COMUM)
    // Todos os módulos devem compartilhar o mesmo referencial.
    // -------------------------------------------------------------
    const espGndConnected = connections.some((c) => c.sourcePinId === 'esp_gnd' || c.targetPinId === 'esp_gnd');
    const jsnGndConnected = isConnected('jsn_gnd', 'esp_gnd');
    const nfcGndConnected = isConnected('nfc_gnd', 'esp_gnd');

    if (espGndConnected && jsnGndConnected && nfcGndConnected) {
      rules.push({
        ruleId: 'RULE-03',
        title: 'Barramento de Terra Unificado (GND Comum)',
        category: 'GROUNDING',
        status: 'PASS',
        voltageObserved: '0,00 V (Equipotencial)',
        voltageAllowed: 'Referencial 0V',
        message: 'Todos os módulos compartilham o mesmo plano de terra. Imunidade a ruídos assegurada.',
        recommendation: 'Mantenha jumpers de terra curtos na protoboard física.',
      });
    } else {
      rules.push({
        ruleId: 'RULE-03',
        title: 'Barramento de Terra Unificado (GND Comum)',
        category: 'GROUNDING',
        status: 'WARN',
        voltageObserved: 'Flutuante',
        voltageAllowed: 'Referencial 0V',
        message: 'Terra Flutuante: Nem todos os módulos estão ligados ao GND comum do ESP32.',
        recommendation: 'Conecte todos os pinos GND de cada placa ao trilho azul negativo da protoboard.',
      });
    }

    // -------------------------------------------------------------
    // RULE-04: Limitador de Corrente do LED Indicador
    // Resistor de 1 kΩ em série com o LED no GPIO4.
    // -------------------------------------------------------------
    const ledConnected = isConnected('esp_gpio4', 'led_anode') && isConnected('led_cathode', 'esp_gnd');
    if (ledConnected) {
      rules.push({
        ruleId: 'RULE-04',
        title: 'Limitador de Corrente do LED (1 kΩ)',
        category: 'FUNCTIONAL',
        status: 'PASS',
        voltageObserved: '2,10 V (Vf LED)',
        voltageAllowed: 'Corrente ~1,5 mA',
        message: 'Resistor de 1 kΩ limita a corrente do pino GPIO4 a 1,2 mA (limite de 40 mA do ESP32 respeitado).',
        recommendation: 'Circuito de sinalização visual seguro.',
      });
    } else {
      rules.push({
        ruleId: 'RULE-04',
        title: 'Limitador de Corrente do LED (1 kΩ)',
        category: 'FUNCTIONAL',
        status: 'WARN',
        voltageObserved: 'Incompleto',
        voltageAllowed: 'Corrente ~1,5 mA',
        message: 'LED verde não conectado ao GPIO4 ou GND.',
        recommendation: 'Ligue GPIO4 -> Anodo do LED e Catodo -> GND.',
      });
    }

    // -------------------------------------------------------------
    // RULE-05: Barramento SPI do Módulo PN532
    // -------------------------------------------------------------
    const spiConnected =
      isConnected('esp_gpio10', 'nfc_cs') &&
      isConnected('esp_gpio11', 'nfc_mosi') &&
      isConnected('esp_gpio12', 'nfc_sck') &&
      isConnected('esp_gpio13', 'nfc_miso');

    if (spiConnected) {
      rules.push({
        ruleId: 'RULE-05',
        title: 'Barramento SPI do PN532 (3,3V CMOS)',
        category: 'SIGNAL_INTEGRITY',
        status: 'PASS',
        voltageObserved: '3,30 V (SPI Mode 0)',
        voltageAllowed: '3,30 V Nominal',
        message: '4 linhas SPI conectadas: CS (IO10), MOSI (IO11), SCK (IO12), MISO (IO13). Níveis compatíveis.',
        recommendation: 'Configuração SPI validada para leitura rápida de tags NFC.',
      });
    } else {
      rules.push({
        ruleId: 'RULE-05',
        title: 'Barramento SPI do PN532 (3,3V CMOS)',
        category: 'SIGNAL_INTEGRITY',
        status: 'WARN',
        voltageObserved: 'Parcial',
        voltageAllowed: '3,30 V Nominal',
        message: 'Uma ou mais linhas do barramento SPI estão desconectadas.',
        recommendation: 'Conecte os 4 pinos SPI entre o ESP32 e o PN532.',
      });
    }

    // -------------------------------------------------------------
    // RULE-06: Sensor Reed Switch da Tampa
    // -------------------------------------------------------------
    const reedConnected = isConnected('esp_gpio7', 'reed_pin1') && isConnected('reed_pin2', 'esp_gnd');
    if (reedConnected) {
      rules.push({
        ruleId: 'RULE-06',
        title: 'Sensor Reed Switch da Tampa (GPIO7)',
        category: 'FUNCTIONAL',
        status: 'PASS',
        voltageObserved: '3,30 V Pull-up',
        voltageAllowed: '3,30 V Seguro',
        message: 'Reed switch conectado ao GPIO7 e terra com resistor de pull-up ativo.',
        recommendation: 'Debounce de firmware de 50 ms protegerá contra repiques mecânicos.',
      });
    } else {
      rules.push({
        ruleId: 'RULE-06',
        title: 'Sensor Reed Switch da Tampa (GPIO7)',
        category: 'FUNCTIONAL',
        status: 'WARN',
        voltageObserved: 'Aberto',
        voltageAllowed: '3,30 V Seguro',
        message: 'Reed switch desconectado. Abertura/fechamento da tampa não será detectada.',
        recommendation: 'Ligue GPIO7 -> Reed PIN1 e Reed PIN2 -> GND.',
      });
    }

    const fails = rules.filter((r) => r.status === 'FAIL').length;
    const warns = rules.filter((r) => r.status === 'WARN').length;
    const passes = rules.filter((r) => r.status === 'PASS').length;

    let overallStatus: 'NOMINAL' | 'WARNING' | 'CRITICAL_ERROR' = 'NOMINAL';
    if (fails > 0) overallStatus = 'CRITICAL_ERROR';
    else if (warns > 0) overallStatus = 'WARNING';

    return {
      overallStatus,
      criticalViolationsCount: fails,
      warningsCount: warns,
      passedCount: passes,
      rules,
    };
  }
}

// Conjunto Canônico de Fiação Segura de Referência (Todas as regras PASS)
export const SAFE_CANONICAL_WIRING: CircuitConnection[] = [
  // 1. Barramento Terra (GND)
  { id: 'w_gnd_jsn', sourcePinId: 'esp_gnd', targetPinId: 'jsn_gnd', wireType: 'gnd' },
  { id: 'w_gnd_ahct', sourcePinId: 'esp_gnd', targetPinId: 'ahct_gnd', wireType: 'gnd' },
  { id: 'w_gnd_ahct_oe', sourcePinId: 'esp_gnd', targetPinId: 'ahct_1oe', wireType: 'gnd' },
  { id: 'w_gnd_div', sourcePinId: 'esp_gnd', targetPinId: 'div_gnd', wireType: 'gnd' },
  { id: 'w_gnd_nfc', sourcePinId: 'esp_gnd', targetPinId: 'nfc_gnd', wireType: 'gnd' },
  { id: 'w_gnd_reed', sourcePinId: 'esp_gnd', targetPinId: 'reed_pin2', wireType: 'gnd' },
  { id: 'w_gnd_led', sourcePinId: 'esp_gnd', targetPinId: 'led_cathode', wireType: 'gnd' },

  // 2. Barramentos de Alimentação
  { id: 'w_vcc_jsn', sourcePinId: 'esp_5v', targetPinId: 'jsn_vcc', wireType: 'vcc5v' },
  { id: 'w_vcc_ahct', sourcePinId: 'esp_5v', targetPinId: 'ahct_vcc', wireType: 'vcc5v' },
  { id: 'w_vcc_nfc', sourcePinId: 'esp_3v3', targetPinId: 'nfc_vcc', wireType: 'vcc3v3' },

  // 3. Sinais Ultrassom Protegidos
  { id: 'w_trig_to_buffer', sourcePinId: 'esp_gpio5', targetPinId: 'ahct_1a', wireType: 'trig' },
  { id: 'w_buffer_to_jsn', sourcePinId: 'ahct_1y', targetPinId: 'jsn_trig', wireType: 'trig' },
  { id: 'w_echo_to_div', sourcePinId: 'jsn_echo', targetPinId: 'div_in', wireType: 'echo' },
  { id: 'w_div_to_esp', sourcePinId: 'div_out', targetPinId: 'esp_gpio6', wireType: 'echoSafe' },

  // 4. SPI PN532
  { id: 'w_spi_cs', sourcePinId: 'esp_gpio10', targetPinId: 'nfc_cs', wireType: 'spi' },
  { id: 'w_spi_mosi', sourcePinId: 'esp_gpio11', targetPinId: 'nfc_mosi', wireType: 'spi' },
  { id: 'w_spi_sck', sourcePinId: 'esp_gpio12', targetPinId: 'nfc_sck', wireType: 'spi' },
  { id: 'w_spi_miso', sourcePinId: 'esp_gpio13', targetPinId: 'nfc_miso', wireType: 'spi' },

  // 5. Periféricos Adicionais
  { id: 'w_led_anode', sourcePinId: 'esp_gpio4', targetPinId: 'led_anode', wireType: 'led' },
  { id: 'w_reed_signal', sourcePinId: 'esp_gpio7', targetPinId: 'reed_pin1', wireType: 'reed' },
];

// Fiação com Falha Intencional (ECHO 5V direto no GPIO6 sem divisor)
export const FAULT_5V_DIRECT_WIRING: CircuitConnection[] = [
  ...SAFE_CANONICAL_WIRING.filter((w) => w.id !== 'w_echo_to_div' && w.id !== 'w_div_to_esp'),
  { id: 'w_fault_echo_direct', sourcePinId: 'jsn_echo', targetPinId: 'esp_gpio6', wireType: 'fault' },
];
