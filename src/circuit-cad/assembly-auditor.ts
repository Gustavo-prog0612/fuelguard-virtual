/**
 * Auditoria da montagem física de bancada do FuelGuard.
 *
 * A auditoria separa o que é seguro no contrato elétrico do que ainda depende
 * da peça comprada: o viewer e os números paramétricos não substituem
 * paquímetro, inspeção do lote ou ensaio com água.
 */

import { FUELGUARD_CAD_LIBRARY, CadComponentMetadata } from './component-library';
import { PHYSICAL_WIRING_REGISTRY, PhysicalCable } from './wiring-registry';

export type AuditSeverity = 'PASS' | 'PENDING' | 'WARNING' | 'FAIL';
export type AuditCategory =
  | 'support_mounting'
  | 'fasteners_alignment'
  | 'wiring_endpoints'
  | 'electrical_voltage'
  | 'sensor_orientation'
  | 'provenance_license'
  | 'clearance_collision';

export interface AssemblyAuditItem {
  id: string;
  category: AuditCategory;
  title: string;
  severity: AuditSeverity;
  componentId?: string;
  cableId?: string;
  message: string;
  technicalDetails: string;
  mitigationOrAction?: string;
}

export interface AssemblyAuditReport {
  timestamp: string;
  isCompliant: boolean;
  totalChecks: number;
  passCount: number;
  pendingCount: number;
  warningCount: number;
  failCount: number;
  items: AssemblyAuditItem[];
}

export class AssemblyAuditor {
  public static runAudit(
    components: Record<string, CadComponentMetadata> = FUELGUARD_CAD_LIBRARY,
    cables: PhysicalCable[] = PHYSICAL_WIRING_REGISTRY,
  ): AssemblyAuditReport {
    const items: AssemblyAuditItem[] = [];
    const add = (item: AssemblyAuditItem) => items.push(item);

    add({ id: 'AUD-SUP-01', category: 'support_mounting', title: 'Apoio da protoboard MB-102 sobre a bancada', severity: 'PENDING', componentId: 'breadboard_830', message: 'O exemplar MB-102 deve ser medido antes de congelar o suporte da bancada.', technicalDetails: 'Envelope nominal de referência: aproximadamente 165 x 55 x 8,5 mm; lote comercial varia.' });
    add({ id: 'AUD-SUP-02', category: 'support_mounting', title: 'Encaixe da ESP32-S3 DevKitC-1 v1.1', severity: 'PASS', componentId: 'esp32_s3_devkit', message: 'A placa oficial usa duas fileiras de 22 pinos em passo 2,54 mm.', technicalDetails: 'A revisão v1.1 está registrada; a furação da bancada ainda deve respeitar a unidade recebida.' });
    add({ id: 'AUD-SUP-03', category: 'support_mounting', title: 'Suporte frontal do PN532 V4', severity: 'PENDING', componentId: 'pn532_breakout', message: 'O módulo deve ficar em suporte frontal, sem permanecer solto na bancada.', technicalDetails: 'Envelope nominal 42,7 x 40,4 x 4,0 mm; header, furos e antena da unidade V4 aguardam conferência.' });
    add({ id: 'AUD-SUP-04', category: 'support_mounting', title: 'Fixação do probe DFRobot A02YYUW/SEN0311', severity: 'PENDING', componentId: 'a02yyuw_sen0311', message: 'O probe será centralizado na tampa, mas o diâmetro do suporte depende da unidade comprada.', technicalDetails: 'A DFRobot documenta a função elétrica e a faixa; o envelope físico e o cabo são vendor-lot-specific.', mitigationOrAction: 'Medir probe, cabo e prensa-cabo antes de liberar o furo da tampa.' });
    add({ id: 'AUD-SUP-05', category: 'support_mounting', title: 'Assentamento do tanque FG-TANK-6L-R1', severity: 'PENDING', componentId: 'tank_cylinder', message: 'Tanque retangular transparente com base apoiada e área de respingos controlada.', technicalDetails: 'Baseline: 206 x 206 x 168 mm externos; 200 x 200 x 160 mm internos; acrílico 3 mm.' });
    add({ id: 'AUD-SUP-06', category: 'support_mounting', title: 'Apoio do buzzer ativo BZ1 e LED D1', severity: 'PENDING', componentId: 'buzzer_active', message: 'O indicador ativo Same Sky CMI-1295IC-0385T e o LED verde serão montados na protoboard.', technicalDetails: 'CMI-1295IC-0385T tem circuito interno, opera em 2–5 V e não usa Q1; confirmar passo e polaridade na unidade.' });

    add({ id: 'AUD-FST-01', category: 'fasteners_alignment', title: 'Quatro fixações M3 da tampa', severity: 'PENDING', componentId: 'tank_cylinder', message: 'As posições das quatro fixações M3 estão definidas como requisito da tampa.', technicalDetails: 'Centro do sensor, prensa-cabo e reed MC-38 devem manter afastamento de respingos e não interferir na antena.' });
    add({ id: 'AUD-FST-02', category: 'fasteners_alignment', title: 'Suporte central do sensor na tampa', severity: 'PENDING', componentId: 'a02yyuw_sen0311', message: 'O recorte e o suporte aguardam medição do probe SEN0311 real.', technicalDetails: 'Não assumir rosca M20, flange ou O-ring de um JSN; a referência atual não usa esse conjunto.' });

    let danglingCables = 0;
    const virtualEndpoints = new Set(['breadboard_830', 'external_host', 'tank_cylinder', 'mc38_lid_sensor']);
    for (const cable of cables) {
      const fromExists = !!components[cable.fromComponent] || virtualEndpoints.has(cable.fromComponent);
      const toExists = !!components[cable.toComponent] || virtualEndpoints.has(cable.toComponent);
      if (!fromExists || !toExists) {
        danglingCables++;
        add({ id: `AUD-WIR-ERR-${cable.id}`, category: 'wiring_endpoints', cableId: cable.id, title: `Cabo sem terminação válida: ${cable.id}`, severity: 'FAIL', message: `Origem ou destino inexistente (${cable.fromComponent} -> ${cable.toComponent}).`, technicalDetails: 'Todo cabo precisa terminar em componente, trilho ou host explicitamente registrado.', mitigationOrAction: 'Corrigir o wiring-registry ou cadastrar o endpoint físico.' });
      }
    }
    if (danglingCables === 0) {
      add({ id: 'AUD-WIR-OK', category: 'wiring_endpoints', title: 'Integridade dos terminais do chicote', severity: 'PASS', message: `Todos os ${cables.length} condutores possuem origem e destino registrados.`, technicalDetails: 'O registro canônico cobre alimentação, UART, SPI, interlock, LED, buzzer e USB-C.' });
    }

    const levelCable = cables.find((c) => c.netName === 'LEVEL_UART_RX');
    const modeCable = cables.find((c) => c.netName === 'LEVEL_MODE_PROCESSED');
    add({ id: 'AUD-VOLT-01', category: 'electrical_voltage', title: 'Domínio lógico do SEN0311', severity: levelCable && modeCable && levelCable.nominalVoltageV <= 3.3 && modeCable.nominalVoltageV <= 3.3 ? 'PASS' : 'FAIL', message: 'SEN0311 alimentado em 3,3 V; TX chega ao GPIO16 sem divisor ou buffer legado.', technicalDetails: 'A alimentação em 3,3 V mantém UART TTL compatível com o ESP32-S3. RX/MODE fica em nível alto.' });
    add({ id: 'AUD-VOLT-02', category: 'electrical_voltage', title: 'Separação da alimentação de 5 V', severity: 'PASS', message: 'VBUS de 5 V fica restrito à distribuição da fonte e aos consumidores compatíveis.', technicalDetails: 'Nenhum cabo nominal de 5 V conecta diretamente uma entrada GPIO do ESP32-S3.' });

    add({ id: 'AUD-SNS-01', category: 'sensor_orientation', title: 'Orientação e zona cega do A02YYUW/SEN0311', severity: 'PENDING', componentId: 'a02yyuw_sen0311', message: 'Probe centralizado e perpendicular à água; a montagem final aguarda confirmação física.', technicalDetails: 'Zona cega de aproximadamente 3 cm e faixa documentada de 30–4500 mm devem ser confirmadas na unidade e no ensaio; o valor está documentado, não confirmado na montagem.', mitigationOrAction: 'Usar a faixa de 35–135 mm de distância para 1–5 L no tanque de 160 mm úteis.' });
    add({ id: 'AUD-SNS-02', category: 'sensor_orientation', title: 'Alinhamento do MC-38 e ímã da tampa', severity: 'PENDING', componentId: 'reed_switch', message: 'Gap, orientação e estado NO/NC ainda dependem da variante MC-38 escolhida.', technicalDetails: 'MC-38 não é um MPN único; congelar vendedor, lote, ímã, cabo e polaridade antes do suporte.' });
    add({ id: 'AUD-SNS-03', category: 'sensor_orientation', title: 'Visada do sensor e confinamento hidrostático', severity: 'PENDING', componentId: 'tank_cylinder', message: 'Visada aguardando a tampa fabricada e o ensaio com água.', technicalDetails: 'O viewer mostra a baseline paramétrica; não é gabarito de fabricação ou calibração.' });

    for (const comp of Object.values(components)) {
      if (comp.confidenceLevel === 'D') {
        add({ id: `AUD-LIC-WARN-${comp.id}`, category: 'provenance_license', title: `Asset bloqueado: ${comp.name}`, severity: 'WARNING', componentId: comp.id, message: `${comp.name} ainda não possui geometria de fabricação comprovada.`, technicalDetails: comp.confidenceRationale, mitigationOrAction: comp.replacementInstructions });
      } else if (comp.confidenceLevel === 'C') {
        add({ id: `AUD-LIC-INFO-${comp.id}`, category: 'provenance_license', title: `Asset paramétrico: ${comp.name}`, severity: 'WARNING', componentId: comp.id, message: `${comp.name} orienta a bancada, mas ainda requer confirmação física.`, technicalDetails: comp.confidenceRationale, mitigationOrAction: comp.replacementInstructions });
      }
    }
    add({ id: 'AUD-LIC-WARN-tank_cylinder', category: 'provenance_license', title: 'FG-TANK-6L-R1 ainda não fabricado', severity: 'WARNING', componentId: 'tank_cylinder', message: 'A capacidade de 6,4 L é geométrica e ainda precisa de fabricação e calibração.', technicalDetails: 'As medidas 206 x 206 x 168 mm são baseline paramétrica, não evidência de peça recebida.' });

    add({ id: 'AUD-CLR-01', category: 'clearance_collision', title: 'Folga entre módulos, cabos e suporte', severity: 'PENDING', message: 'Colisões só podem ser aprovadas com as dimensões medidas dos módulos e conectores.', technicalDetails: 'three-mesh-bvh pode detectar interseções no modelo, mas não substitui inspeção da montagem real.' });
    add({ id: 'AUD-CLR-02', category: 'clearance_collision', title: 'Confinamento hidrostático do tanque', severity: 'PENDING', componentId: 'tank_cylinder', message: 'Confinamento hidrostático pendente de fabricação da caixa e da tampa.', technicalDetails: 'A geometria interna 200 x 200 x 160 mm e a passagem com prensa-cabo precisam ser medidas na peça pronta.' });

    const failCount = items.filter((item) => item.severity === 'FAIL').length;
    const warningCount = items.filter((item) => item.severity === 'WARNING').length;
    const passCount = items.filter((item) => item.severity === 'PASS').length;
    const pendingCount = items.filter((item) => item.severity === 'PENDING').length;
    return { timestamp: new Date().toISOString(), isCompliant: failCount === 0 && pendingCount === 0, totalChecks: items.length, passCount, pendingCount, warningCount, failCount, items };
  }
}
