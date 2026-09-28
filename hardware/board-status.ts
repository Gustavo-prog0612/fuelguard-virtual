/**
 * Contrato de verdade do hardware.
 *
 * Uma placa só pode ser liberada como PCB quando há dados de placa reais
 * (esquemático, contorno, footprints e roteamento revisável). O conjunto
 * atual é uma referência de engenharia com peças comerciais identificadas;
 * sua topologia pode ser exportada, mas isso não cria automaticamente uma
 * PCB fabricável.
 */

export type HardwareScope =
  | 'engineering-reference'
  | 'adapter-pcb'
  | 'vehicle-product';

export type PcbReadiness =
  | 'not-designed'
  | 'schematic-only'
  | 'routed-unverified'
  | 'manufacturing-ready';

export type EvidenceKind = 'datasheet' | 'measurement' | 'source-file' | 'test-run' | 'review';

export interface EngineeringEvidence {
  kind: EvidenceKind;
  reference: string;
  description: string;
  verifiedAt?: string;
}

export interface BoardStatus {
  id: string;
  name: string;
  scope: HardwareScope;
  pcbReadiness: PcbReadiness;
  sourceOfTruth: string[];
  evidence: EngineeringEvidence[];
  blockingItems: string[];
}

export const FUELGUARD_BOARD_STATUS: BoardStatus = {
  id: 'fuelguard-engineering-reference',
  name: 'FuelGuard — referência de engenharia com módulos comerciais',
  scope: 'engineering-reference',
  pcbReadiness: 'not-designed',
  sourceOfTruth: [
    'hardware/parts/PartDefinition.ts',
    'hardware/nets/NetDefinition.ts',
    'hardware/assembly/bench-layout.json',
    'hardware/assembly/cable-routes.json',
    'hardware/measurements/measurement-register.json',
    'hardware/pcb/fuelguard-adapter/design-inputs.json',
  ],
  evidence: [
    {
      kind: 'source-file',
      reference: 'fuelguard/assembly/bench-layout.json',
      description: 'Layout físico nominal da bancada com dimensões em milímetros.',
    },
    {
      kind: 'test-run',
      reference: 'tests/electrical/netlist-consistency.test.ts',
      description: 'ERC topológico, domínio UART do SEN0311 e proteção contra injeção de 5 V no GPIO16.',
    },
    {
      kind: 'source-file',
      reference: 'docs/adr/0002-adapter-pcb-input-freeze.md',
      description: 'Decisões de escopo e gates para iniciar a placa adaptadora.',
    },
  ],
  blockingItems: [
    'Conectores do PN532, envelope do probe SEN0311, variante MC-38, MB-102 e chicotes ainda precisam de evidência aprovada.',
    'A arquitetura de alimentação, proteção contra back-power e corrente do buzzer ainda deve ser revisada com as peças compradas.',
    'Ainda não existe esquemático KiCad revisado para a placa adaptadora.',
    'Contorno, furos, footprints e regras de fabricação da placa adaptadora ainda não existem.',
    'Não há roteamento cobre-a-cobre nem arquivos Gerber/BOM de fabricação para essa placa.',
  ],
};

export const RP2040_BOARD_STATUS: BoardStatus = {
  id: 'rp2040-motor-controller',
  name: 'RP2040 Dual Stepper Controller — fonte importada',
  scope: 'adapter-pcb',
  pcbReadiness: 'routed-unverified',
  sourceOfTruth: ['src/circuit-cad/rp2040-circuit-provider.ts'],
  evidence: [
    {
      kind: 'source-file',
      reference: 'src/circuit-cad/rp2040-circuit-provider.ts',
      description: 'Circuit JSON importado de uma placa roteada de referência.',
    },
  ],
  blockingItems: [
    'A placa é referência externa e não é o hardware FuelGuard.',
    'DRC de fabricação deve ser reexecutado com arquivos originais e regras do fabricante.',
  ],
};
