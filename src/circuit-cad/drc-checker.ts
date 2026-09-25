/**
 * FuelGuard Virtual Test Bench — Validador de Regras de Projeto Eletrônico (DRC / ERC)
 * Analisa a integridade elétrica e física do Circuit JSON em tempo real.
 */

import { AnyCircuitElement } from 'circuit-json';

export type DrcSeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface DrcViolation {
  id: string;
  ruleCode: string;
  severity: DrcSeverity;
  title: string;
  message: string;
  remedy: string;
  relatedComponentId?: string;
  relatedNetName?: string;
}

export class DrcChecker {
  /**
   * Executa a auditoria completa de regras de design sobre um pacote Circuit JSON
   */
  public static runChecks(elements: AnyCircuitElement[]): DrcViolation[] {
    const violations: DrcViolation[] = [];

    // Mapeamentos rápidos
    const sourcePorts = new Map<string, any>();
    const sourceComponents = new Map<string, any>();
    const sourceNets = new Map<string, any>();
    const sourceTraces: any[] = [];

    elements.forEach((el) => {
      if (el.type === 'source_port') sourcePorts.set((el as any).source_port_id, el);
      else if (el.type === 'source_component') sourceComponents.set((el as any).source_component_id, el);
      else if (el.type === 'source_net') sourceNets.set((el as any).source_net_id, el);
      else if (el.type === 'source_trace') sourceTraces.push(el);
    });

    // 1. CHECAGEM DRC-01: Sobretensão no pino GPIO6 (ECHO direto em 5V sem divisor)
    sourceTraces.forEach((trace) => {
      const connectedPorts: string[] = trace.connected_source_port_ids ?? [];
      const hasGpio6 = connectedPorts.some((p) => p.includes('gpio6'));
      const hasJsnEcho = connectedPorts.some((p) => p.includes('jsn_echo'));

      if (hasGpio6 && hasJsnEcho) {
        violations.push({
          id: 'DRC-V01-FATAL',
          ruleCode: 'DRC-01',
          severity: 'ERROR',
          title: 'Sobretensão Fatal: Sinal de 5.0V Direto no ESP32-S3',
          message: 'O pino ECHO do sensor JSN-SR04T opera em 5,00V e está conectado diretamente ao GPIO6. A tensão máxima absoluta suportada pelo ESP32-S3 é 3,60V.',
          remedy: 'Intercale o divisor de tensão resistivo 10kΩ/15kΩ para atenuar o sinal para 3,00V seguros.',
          relatedComponentId: 'esp32_s3_devkit',
          relatedNetName: 'ECHO_5V_FATAL',
        });
      }
    });

    // 2. CHECAGEM DRC-02: Barramento de Terra Unificado (GND Comum)
    const gndTraceCount = sourceTraces.filter((trace) => {
      const netIds: string[] = trace.connected_source_net_ids ?? [];
      return netIds.some((id) => id.includes('gnd'));
    }).length;

    if (gndTraceCount < 4) {
      violations.push({
        id: 'DRC-GND-WARN',
        ruleCode: 'DRC-02',
        severity: 'WARNING',
        title: 'Terra Desconectado ou Flutuante',
        message: 'Nem todos os nós de alimentação compartilham a mesma referência de terra (GND).',
        remedy: 'Certifique-se de conectar os terras do ESP32-S3, do sensor JSN, do buffer e dos periféricos no mesmo barramento.',
        relatedNetName: 'GND',
      });
    }

    // 3. CHECAGEM DRC-03: Alimentação do Buffer de Nível
    const hasBufferVcc5V = sourceTraces.some((trace) => {
      const ports: string[] = trace.connected_source_port_ids ?? [];
      const netIds: string[] = trace.connected_source_net_ids ?? [];
      return ports.some((p) => p.includes('buffer_vcc')) && netIds.some((n) => n.includes('5v'));
    });

    if (!hasBufferVcc5V) {
      violations.push({
        id: 'DRC-BUF-PWR',
        ruleCode: 'DRC-03',
        severity: 'WARNING',
        title: 'Buffer SN74AHCT125N sem Alimentação de 5V',
        message: 'Para elevar o sinal TRIG de 3.3V para 5.0V TTL, o VCC do buffer deve ser alimentado com 5V.',
        remedy: 'Conecte o pino 14 (VCC) do buffer ao barramento de 5.0V da fonte USB.',
        relatedComponentId: 'sn74ahct125n',
      });
    }

    // 4. CHECAGEM DRC-04: Habilitação da Porta do Buffer (/1OE)
    const hasBufferOeGnd = sourceTraces.some((trace) => {
      const ports: string[] = trace.connected_source_port_ids ?? [];
      return ports.some((p) => p.includes('buffer_1oe') && ports.some((p2) => p2.includes('gnd')));
    });

    if (!hasBufferOeGnd) {
      violations.push({
        id: 'DRC-BUF-OE',
        ruleCode: 'DRC-04',
        severity: 'INFO',
        title: 'Pino de Habilitação /1OE deve ser Aterrado',
        message: 'O buffer de 3 estados requer nível lógico baixo (0V) no pino /1OE para manter as saídas ativas.',
        remedy: 'Ligue o pino 1 (/1OE) do SN74AHCT125N diretamente ao GND.',
        relatedComponentId: 'sn74ahct125n',
      });
    }

    // 5. CHECAGEM DRC-05: Informação de Modelo Aproximado
    violations.push({
      id: 'DRC-INFO-DIDACTIC',
      ruleCode: 'DRC-05',
      severity: 'INFO',
      title: 'Modelos Didáticos de Bancada Ativos',
      message: 'Os módulos PN532 e JSN-SR04T utilizam pegadas aproximadas de protótipo de bancada. Não aptos para confecção de gabarito final sem validação dimensional com paquímetro.',
      remedy: 'Consulte o checklist de transição física antes de fabricar placa proprietária.',
    });

    return violations;
  }
}
