/** Validação elétrica da bancada real: UART 3,3 V, SPI, interlock e indicadores. */
export interface CircuitConnection { id: string; sourcePinId: string; targetPinId: string; wireType?: string; }
export type ValidationStatus = 'PASS' | 'WARN' | 'FAIL';
export interface RuleEvaluation { ruleId: string; title: string; category: 'SAFETY' | 'SIGNAL_INTEGRITY' | 'GROUNDING' | 'FUNCTIONAL'; status: ValidationStatus; voltageObserved: string; voltageAllowed: string; message: string; recommendation: string; }
export interface CircuitValidationReport { overallStatus: 'NOMINAL' | 'WARNING' | 'CRITICAL_ERROR'; criticalViolationsCount: number; warningsCount: number; passedCount: number; rules: RuleEvaluation[]; }

export class CircuitValidator {
  public static evaluate(connections: CircuitConnection[]): CircuitValidationReport {
    const isConnected = (a: string, b: string) => connections.some((c) => (c.sourcePinId === a && c.targetPinId === b) || (c.sourcePinId === b && c.targetPinId === a));
    const rules: RuleEvaluation[] = [];

    const uartSafe = isConnected('level_tx', 'esp_gpio16');
    const uartFatal = isConnected('level_tx_5v', 'esp_gpio16');
    rules.push(uartFatal ? {
      ruleId: 'RULE-01', title: 'Proteção da entrada UART do SEN0311', category: 'SAFETY', status: 'FAIL', voltageObserved: '5,00 V', voltageAllowed: '3,30 V (máx. 3,60 V)', message: 'TX do SEN0311 foi modelado como 5 V e conectado ao GPIO16 do ESP32.', recommendation: 'Alimente o SEN0311 em 3,3 V e confirme TX antes do bring-up.'
    } : uartSafe ? {
      ruleId: 'RULE-01', title: 'Proteção da entrada UART do SEN0311', category: 'SAFETY', status: 'PASS', voltageObserved: '3,30 V nominal', voltageAllowed: '3,30 V (máx. 3,60 V)', message: 'UART do SEN0311 está ligada ao GPIO16 com o sensor operando em 3,3 V.', recommendation: 'Validar a tensão TX com osciloscópio na unidade comprada.'
    } : {
      ruleId: 'RULE-01', title: 'Proteção da entrada UART do SEN0311', category: 'SAFETY', status: 'WARN', voltageObserved: 'Aberto', voltageAllowed: '3,30 V (máx. 3,60 V)', message: 'TX do SEN0311 não está conectado ao GPIO16.', recommendation: 'Conecte SEN1.TX -> LEVEL_UART_RX -> GPIO16 e valide o frame 9600 8N1.'
    });

    const modeHigh = isConnected('level_rx_mode', 'esp_3v3') || isConnected('level_rx_mode', 'rail_3v3');
    rules.push({ ruleId: 'RULE-02', title: 'Modo processado do SEN0311', category: 'SIGNAL_INTEGRITY', status: modeHigh ? 'PASS' : 'WARN', voltageObserved: modeHigh ? '3,30 V HIGH' : 'Flutuante', voltageAllowed: 'HIGH para valor processado', message: modeHigh ? 'RX do SEN0311 está em nível alto para saída processada.' : 'RX do SEN0311 não está definido; o modo de resposta pode variar.', recommendation: 'Amarre SEN1.RX a 3,3 V ou implemente comando de firmware conforme o protocolo DFRobot.' });

    const gndReferenceOk = isConnected('esp_gnd', 'rail_gnd');
    const gndOk = gndReferenceOk && (isConnected('rail_gnd', 'level_gnd') || isConnected('esp_gnd', 'level_gnd')) && (isConnected('rail_gnd', 'nfc_gnd') || isConnected('esp_gnd', 'nfc_gnd')) && (isConnected('rail_gnd', 'reed_pin2') || isConnected('esp_gnd', 'reed_pin2'));
    rules.push({ ruleId: 'RULE-03', title: 'Barramento de terra comum', category: 'GROUNDING', status: gndOk ? 'PASS' : 'WARN', voltageObserved: gndOk ? '0,00 V' : 'Flutuante', voltageAllowed: 'Referencial comum', message: gndOk ? 'ESP32, SEN0311, PN532 e MC-38 compartilham GND.' : 'Um ou mais periféricos estão sem retorno no GND comum.', recommendation: 'Ligue todos os retornos ao mesmo barramento de terra da protoboard.' });

    const ledOk = isConnected('esp_gpio4', 'led_anode') && (isConnected('led_cathode', 'rail_gnd') || isConnected('led_cathode', 'esp_gnd'));
    rules.push({ ruleId: 'RULE-04', title: 'Limitador do LED verde (220 Ω)', category: 'FUNCTIONAL', status: ledOk ? 'PASS' : 'WARN', voltageObserved: ledOk ? 'R3 = 220 Ω' : 'Incompleto', voltageAllowed: 'Resistor em série obrigatório', message: ledOk ? 'LED verde está limitado por R3 de 220 Ω.' : 'LED verde não está completo com resistor e retorno.', recommendation: 'Use GPIO4 -> R3 220 Ω -> ânodo D1 -> cátodo -> GND.' });

    const spiOk = isConnected('esp_gpio10', 'nfc_cs') && isConnected('esp_gpio11', 'nfc_mosi') && isConnected('esp_gpio12', 'nfc_sck') && isConnected('esp_gpio13', 'nfc_miso');
    rules.push({ ruleId: 'RULE-05', title: 'Barramento SPI do PN532 V4', category: 'SIGNAL_INTEGRITY', status: spiOk ? 'PASS' : 'WARN', voltageObserved: spiOk ? '3,30 V' : 'Parcial', voltageAllowed: '3,30 V', message: spiOk ? 'CS/MOSI/SCK/MISO estão conectados ao PN532.' : 'Uma ou mais linhas SPI do PN532 estão desconectadas.', recommendation: 'Conecte GPIO10/11/12/13 ao header SPI 1/8/3/2 documentado.' });

    const reedOk = isConnected('esp_gpio7', 'reed_pin1') && (isConnected('reed_pin2', 'rail_gnd') || isConnected('reed_pin2', 'esp_gnd'));
    rules.push({ ruleId: 'RULE-06', title: 'Interlock MC-38 da tampa', category: 'FUNCTIONAL', status: reedOk ? 'PASS' : 'WARN', voltageObserved: reedOk ? '3,30 V pull-up' : 'Aberto', voltageAllowed: '3,30 V seguro', message: reedOk ? 'MC-38 está no GPIO7 e GND.' : 'MC-38 ainda não está completamente ligado.', recommendation: 'Confirmar NO/NC na unidade e conectar sinal ao GPIO7 com pull-up.' });

    const buzzerOk = isConnected('esp_gpio14', 'buzzer_ctrl') && (isConnected('buzzer_gnd', 'rail_gnd') || isConnected('buzzer_gnd', 'esp_gnd'));
    rules.push({ ruleId: 'RULE-07', title: 'Buzzer ativo CMI-1295IC-0385T', category: 'SAFETY', status: buzzerOk ? 'PASS' : 'WARN', voltageObserved: buzzerOk ? '2–5 V / até 30 mA' : 'Incompleto', voltageAllowed: 'Conforme datasheet e medição', message: buzzerOk ? 'Indicador ativo conectado; corrente, polaridade e passo ainda exigem confirmação física.' : 'Buzzer ativo ainda não está completamente conectado.', recommendation: 'Confirmar polaridade, passo e corrente antes de ligar a carga ao GPIO14.' });

    const fails = rules.filter((r) => r.status === 'FAIL').length;
    const warns = rules.filter((r) => r.status === 'WARN').length;
    return { overallStatus: fails ? 'CRITICAL_ERROR' : warns ? 'WARNING' : 'NOMINAL', criticalViolationsCount: fails, warningsCount: warns, passedCount: rules.filter((r) => r.status === 'PASS').length, rules };
  }
}

export const SAFE_CANONICAL_WIRING: CircuitConnection[] = [
  { id: 'w_gnd_rail', sourcePinId: 'esp_gnd', targetPinId: 'rail_gnd', wireType: 'gnd' },
  { id: 'w_gnd_level', sourcePinId: 'rail_gnd', targetPinId: 'level_gnd', wireType: 'gnd' },
  { id: 'w_gnd_nfc', sourcePinId: 'rail_gnd', targetPinId: 'nfc_gnd', wireType: 'gnd' },
  { id: 'w_gnd_reed', sourcePinId: 'rail_gnd', targetPinId: 'reed_pin2', wireType: 'gnd' },
  { id: 'w_gnd_led', sourcePinId: 'rail_gnd', targetPinId: 'led_cathode', wireType: 'gnd' },
  { id: 'w_gnd_buzzer', sourcePinId: 'rail_gnd', targetPinId: 'buzzer_gnd', wireType: 'gnd' },
  { id: 'w_5v_rail', sourcePinId: 'esp_5v', targetPinId: 'rail_5v', wireType: 'vcc5v' },
  { id: 'w_3v3_rail', sourcePinId: 'esp_3v3', targetPinId: 'rail_3v3', wireType: 'vcc3v3' },
  { id: 'w_level_vcc', sourcePinId: 'rail_3v3', targetPinId: 'level_vcc', wireType: 'vcc3v3' },
  { id: 'w_nfc_vcc', sourcePinId: 'rail_3v3', targetPinId: 'nfc_vcc', wireType: 'vcc3v3' },
  { id: 'w_level_uart', sourcePinId: 'level_tx', targetPinId: 'esp_gpio16', wireType: 'uart' },
  { id: 'w_level_mode', sourcePinId: 'rail_3v3', targetPinId: 'level_rx_mode', wireType: 'vcc3v3' },
  { id: 'w_spi_cs', sourcePinId: 'esp_gpio10', targetPinId: 'nfc_cs', wireType: 'spi' },
  { id: 'w_spi_mosi', sourcePinId: 'esp_gpio11', targetPinId: 'nfc_mosi', wireType: 'spi' },
  { id: 'w_spi_sck', sourcePinId: 'esp_gpio12', targetPinId: 'nfc_sck', wireType: 'spi' },
  { id: 'w_spi_miso', sourcePinId: 'esp_gpio13', targetPinId: 'nfc_miso', wireType: 'spi' },
  { id: 'w_led_anode', sourcePinId: 'esp_gpio4', targetPinId: 'led_anode', wireType: 'led' },
  { id: 'w_reed_signal', sourcePinId: 'esp_gpio7', targetPinId: 'reed_pin1', wireType: 'reed' },
  { id: 'w_buzzer', sourcePinId: 'esp_gpio14', targetPinId: 'buzzer_ctrl', wireType: 'buzzer' },
  { id: 'w_usb_main', sourcePinId: 'external_usb', targetPinId: 'esp_micro_usb', wireType: 'usb' },
];

export const FAULT_5V_DIRECT_WIRING: CircuitConnection[] = [
  ...SAFE_CANONICAL_WIRING.filter((w) => w.id !== 'w_level_uart'),
  { id: 'w_fault_uart_5v_direct', sourcePinId: 'level_tx_5v', targetPinId: 'esp_gpio16', wireType: 'fault' },
];
