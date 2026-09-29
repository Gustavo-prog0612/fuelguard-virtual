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

    // 1. CHECAGEM DRC-01: TX UART do SEN0311 não pode ser tratado como 5V no GPIO16
    sourceTraces.forEach((trace) => {
      const connectedPorts: string[] = trace.connected_source_port_ids ?? [];
      const hasGpio16 = connectedPorts.some((p) => p.includes('gpio16'));
      const hasLevelTx5V = connectedPorts.some((p) => p.includes('level_tx_5v'));

      if (hasGpio16 && hasLevelTx5V) {
        violations.push({
          id: 'DRC-V01-FATAL',
          ruleCode: 'DRC-01',
          severity: 'ERROR',
          title: 'Sobretensão Fatal: UART de 5.0V no ESP32-S3',
          message: 'O TX do SEN0311 foi marcado como 5,00V e conectado diretamente ao GPIO16. A tensão máxima suportada pelo ESP32-S3 é 3,60V.',
          remedy: 'Alimente o SEN0311 em 3,3V, confirme o nível TTL na unidade e mantenha a entrada UART dentro de 3,6V.',
          relatedComponentId: 'esp32_s3_devkit',
          relatedNetName: 'LEVEL_UART_5V_FATAL',
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
        remedy: 'Certifique-se de conectar os terras do ESP32-S3, do SEN0311, do PN532 e dos demais periféricos no mesmo barramento.',
        relatedNetName: 'GND',
      });
    }

    // 3. CHECAGEM DRC-03: a baseline não usa buffer/divisor no SEN0311
    violations.push({ id: 'DRC-SEN0311-INFO', ruleCode: 'DRC-03', severity: 'INFO', title: 'SEN0311 sem condicionamento legado', message: 'A baseline usa UART do SEN0311 em 3,3 V; não há buffer, TRIG/ECHO ou divisor resistivo nesta arquitetura.', remedy: 'Não adicionar condicionamento sem uma nova decisão de engenharia baseada em medição.' });

    // 4. CHECAGEM DRC-05: Informação de modelo paramétrico
    violations.push({
      id: 'DRC-INFO-DIDACTIC',
      ruleCode: 'DRC-05',
      severity: 'INFO',
      title: 'Modelos paramétricos de bancada ativos',
      message: 'PN532 V4, SEN0311, MC-38, MB-102 e FG-TANK-5L-CYL-R1 têm graus diferentes de confirmação mecânica. A topologia elétrica está congelada, mas suportes e footprints dependem das medições registradas.',
      remedy: 'Consulte o checklist de transição física antes de fabricar placa proprietária.',
    });

    return violations;
  }
}
