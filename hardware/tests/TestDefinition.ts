export type VerificationStatus = 'PASS' | 'WARN' | 'FAIL' | 'PENDING';
export type VerificationEvidence = 'unit-test' | 'source-contract' | 'measurement' | 'manual-review' | 'not-applicable';

export interface TestDefinition {
  id: string;
  requirement: string;
  title: string;
  scope: 'electrical' | 'mechanical' | 'fluid' | 'asset' | 'pcb';
  evidence: VerificationEvidence;
  blocking: boolean;
}

export interface TestResult extends TestDefinition {
  status: VerificationStatus;
  message: string;
  evidenceRef: string;
}

export const HARDWARE_TEST_DEFINITIONS: TestDefinition[] = [
  { id: 'ARCH-001', requirement: 'ADR-0002', title: 'Arquitetura da placa adaptadora está congelada', scope: 'pcb', evidence: 'manual-review', blocking: true },
  { id: 'MEAS-001', requirement: 'ADR-0002', title: 'Medições físicas de alto impacto estão aprovadas', scope: 'mechanical', evidence: 'measurement', blocking: true },
  { id: 'ELEC-001', requirement: 'REQ-ELEC-01', title: 'TX do SEN0311 permanece no domínio de 3,3 V', scope: 'electrical', evidence: 'unit-test', blocking: true },
  { id: 'ELEC-002', requirement: 'REQ-ELEC-02', title: 'UART do SEN0311 usa 9600 8N1 em GPIO16', scope: 'electrical', evidence: 'unit-test', blocking: true },
  { id: 'MECH-001', requirement: 'REQ-MECH-01', title: 'Componentes têm apoio e dimensão em mm', scope: 'mechanical', evidence: 'source-contract', blocking: true },
  { id: 'MECH-002', requirement: 'REQ-MECH-02', title: 'Rotas possuem terminais e waypoints', scope: 'mechanical', evidence: 'source-contract', blocking: true },
  { id: 'FLUID-001', requirement: 'REQ-ACOU-01', title: 'Água permanece confinada no tanque FG-TANK-5L-CYL-R1', scope: 'fluid', evidence: 'unit-test', blocking: true },
  { id: 'ASSET-001', requirement: 'REQ-ASSET-01', title: 'Assets têm fonte, licença e classe de confiança', scope: 'asset', evidence: 'source-contract', blocking: true },
  { id: 'PCB-001', requirement: 'REQ-PCB-01', title: 'Placa adaptadora tem dados de fabricação reais', scope: 'pcb', evidence: 'manual-review', blocking: true },
];
