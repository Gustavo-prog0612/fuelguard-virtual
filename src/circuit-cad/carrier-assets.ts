import {
  CadAssetDimensionsMm,
  CadAssetSourceType,
  CadAssetStatus,
  CadAssetTransform,
  CadComponentMetadata,
  FUELGUARD_CAD_LIBRARY,
} from './component-library';

export type CarrierAssetClass = 'A' | 'B' | 'C' | 'D';

export interface CarrierCadAssetManifestEntry {
  designator: string;
  componentId: keyof typeof FUELGUARD_CAD_LIBRARY;
  partNumber: string;
  revision: string;
  confidenceLevel: CarrierAssetClass;
  assetStatus: CadAssetStatus;
  assetSourceType: CadAssetSourceType;
  assetPath?: string;
  /** GLB local de referência para inspeção visual; nunca equivale a verificação física. */
  referenceAssetPath?: string;
  referenceAssetChecksum?: string;
  referenceAssetDimensionsMm?: CadAssetDimensionsMm;
  sourceUrl: string;
  sourceReference: string;
  license: string;
  originalFile?: string;
  sourceRevision?: string;
  sourceUnits: 'mm';
  assetChecksum?: string;
  assetDimensionsMm?: CadAssetDimensionsMm;
  assetTransform: CadAssetTransform;
  toleranceMm: number;
  verificationDate: string;
  limitations: string[];
  pendingReason?: string;
}

const identityTransform: CadAssetTransform = {
  scale: { x: 1, y: 1, z: 1 },
  rotationDeg: { x: 0, y: 0, z: 0 },
  translationMm: { x: 0, y: 0, z: 0 },
};

const kicadSourceUrl = 'https://gitlab.com/kicad/libraries/kicad-packages3D';

/**
 * Ordem operacional fixada pelo plano. O manifesto é Carrier-only: não deve
 * receber IDs ou assets do RP2040 Motor Controller.
 */
export const CARRIER_ASSET_ORDER = [
  'U1',
  'U2',
  'R_DIV',
  'BB1',
  'D1',
  'BZ1',
  'SEN1',
  'RFID1',
  'SW1',
  'CBL_USB',
  'TK1',
] as const;

export const CARRIER_CAD_ASSET_MANIFEST: readonly CarrierCadAssetManifestEntry[] = [
  {
    designator: 'U1',
    componentId: 'esp32_s3_devkit',
    partNumber: 'ESP32-S3-DevKitC-1-N8R8',
    revision: 'v1.1',
    confidenceLevel: 'A',
    assetStatus: 'pending',
    assetSourceType: 'derived',
    referenceAssetPath: '/assets/cad/carrier/U1/reference.glb',
    referenceAssetChecksum: '93293ca95b2135c13fd4b2cff9d19b342f537941b4fd3772639728dede74fef0',
    referenceAssetDimensionsMm: { width: 25.5, height: 10.82, depth: 71.25 },
    sourceUrl: 'https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-devkitc-1/user_guide_v1.1.html',
    sourceReference: 'Espressif ESP32-S3-DevKitC-1 v1.1 hardware guide + official reference files; KiCad library inspected separately',
    license: 'CC-BY-SA-4.0',
    sourceUnits: 'mm',
    assetTransform: identityTransform,
    toleranceMm: 0.25,
    verificationDate: '2026-09-26',
    limitations: [
      'O GLB local é derivado do guia, DXF/desenho de placa e componentes documentados; não é exportação CAD oficial da Espressif.',
      'As dimensões medidas incluem os dois conectores Micro-USB salientes (25,5 × 10,82 × 71,25 mm no envelope GLB). Confirmar a unidade N8R8 recebida antes de fabricar suportes.',
    ],
    pendingReason: 'A fonte oficial não fornece um CAD 3D liberado da placa completa; a variante física N8R8, altura dos headers, conectores e keepouts ainda precisam ser conferidos no exemplar comprado.',
  },
  {
    designator: 'U2',
    componentId: 'sn74ahct125n',
    partNumber: 'SN74AHCT125N',
    revision: 'DIP-14 W7.62 mm / JEDEC MS-001 BA',
    confidenceLevel: 'B',
    assetStatus: 'verified',
    assetSourceType: 'kicad',
    assetPath: '/assets/cad/carrier/U2/model.glb',
    sourceUrl: kicadSourceUrl,
    sourceReference: 'KiCad Packages3D / Package_DIP.3dshapes/DIP-14_W7.62mm.step',
    license: 'KiCad library license / CC-BY-SA-4.0',
    originalFile: 'Package_DIP.3dshapes/DIP-14_W7.62mm.step',
    sourceRevision: '9e55be14ea704091c1b1ae1fe44e8d57d88ba24e',
    sourceUnits: 'mm',
    assetChecksum: '20bfc306d3cbc3b22657b74df431439c081b8ebe6c2eb3268bba5ec2b2b6a3ff',
    assetDimensionsMm: { width: 7.874, height: 6.98, depth: 19.05 },
    assetTransform: { ...identityTransform, rotationDeg: { x: -90, y: 0, z: 0 } },
    toleranceMm: 0.15,
    verificationDate: '2026-09-26',
    limitations: ['O GLB confirma o encapsulamento DIP-14; não representa marcações comerciais específicas do lote do CI.'],
  },
  {
    designator: 'R_DIV',
    componentId: 'voltage_divider',
    partNumber: 'DIV-10K-15K-1%',
    revision: 'Axial DIN0207 P10.16 mm',
    confidenceLevel: 'B',
    assetStatus: 'verified',
    assetSourceType: 'kicad',
    assetPath: '/assets/cad/carrier/R_DIV/model.glb',
    sourceUrl: kicadSourceUrl,
    sourceReference: 'KiCad Packages3D / Resistor_THT.3dshapes',
    license: 'KiCad library license / CC-BY-SA-4.0',
    originalFile: 'Resistor_THT.3dshapes/R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal.step',
    sourceRevision: 'master @ 2026-09-26',
    sourceUnits: 'mm',
    assetChecksum: '1b55294a45b9fe810f8728044e18d9b83f03f82dd59134b432ceb2709bbb9d22',
    assetDimensionsMm: { width: 10.76, height: 5.5, depth: 2.5 },
    assetTransform: { ...identityTransform, rotationDeg: { x: -90, y: 0, z: 0 } },
    toleranceMm: 0.15,
    verificationDate: '2026-09-26',
    limitations: [
      'O GLB é a geometria axial reutilizável para R1 e R2; os valores 10 kΩ e 15 kΩ continuam sendo metadados elétricos separados.',
      'A posição final dos terminais depende do passo e da dobra na protoboard.',
    ],
  },
  {
    designator: 'BB1',
    componentId: 'breadboard_830',
    partNumber: 'BB-830-STANDARD',
    revision: 'Pendente de fabricante/lote',
    confidenceLevel: 'B',
    assetStatus: 'pending',
    assetSourceType: 'community',
    referenceAssetPath: '/assets/cad/carrier/BB1/reference.glb',
    referenceAssetChecksum: 'da7e4407c4b8ce6e1f0224d2d7f230c692fb6edd32208dff5c4be6743310d43b',
    sourceUrl: 'https://github.com/FreeCAD/FreeCAD-library',
    sourceReference: 'FreeCAD community library / BB-830 candidate',
    license: 'A confirmar no asset escolhido',
    sourceUnits: 'mm',
    assetTransform: identityTransform,
    toleranceMm: 0.5,
    verificationDate: '2026-09-26',
    limitations: ['As dimensões externas, canaleta e barramentos variam entre fabricantes de protoboard 830 pontos.'],
    pendingReason: 'Nenhum modelo comunitário foi aceito sem validação dimensional contra a protoboard física.',
  },
  {
    designator: 'D1',
    componentId: 'led_indicator',
    partNumber: 'LED THT verde 5 mm',
    revision: 'LED_D5.0mm_Green',
    confidenceLevel: 'B',
    assetStatus: 'verified',
    assetSourceType: 'kicad',
    assetPath: '/assets/cad/carrier/D1/model.glb',
    sourceUrl: kicadSourceUrl,
    sourceReference: 'KiCad Packages3D / LED_THT.3dshapes/LED_D5.0mm_Green.step',
    license: 'KiCad library license / CC-BY-SA-4.0',
    originalFile: 'LED_THT.3dshapes/LED_D5.0mm_Green.step',
    sourceRevision: 'master @ 2026-09-26',
    sourceUnits: 'mm',
    assetChecksum: '93ed2b6d8a12ffe14275a919025b3d5d29c1fb608de84d29e43c1588acdafee8',
    assetDimensionsMm: { width: 5.396, height: 14.1, depth: 5.798 },
    assetTransform: { ...identityTransform, rotationDeg: { x: -90, y: 0, z: 0 } },
    toleranceMm: 0.2,
    verificationDate: '2026-09-26',
    limitations: ['O resistor limitador de 1 kΩ permanece um componente distinto do LED e não é incorporado ao GLB.'],
  },
  {
    designator: 'BZ1',
    componentId: 'buzzer_active',
    partNumber: 'Buzzer_12x9.5RM7.6',
    revision: 'KiCad standard radial buzzer',
    confidenceLevel: 'B',
    assetStatus: 'verified',
    assetSourceType: 'kicad',
    assetPath: '/assets/cad/carrier/BZ1/model.glb',
    sourceUrl: kicadSourceUrl,
    sourceReference: 'KiCad Packages3D / Buzzer_Beeper.3dshapes/Buzzer_12x9.5RM7.6.step',
    license: 'KiCad library license / CC-BY-SA-4.0',
    originalFile: 'Buzzer_Beeper.3dshapes/Buzzer_12x9.5RM7.6.step',
    sourceRevision: 'master @ 2026-09-26',
    sourceUnits: 'mm',
    assetChecksum: '4138446d524ea4ee3755271df07ba1c60879d0ae f1da9e1bccaf9857bdfc1b32'.replace(' ', ''),
    assetDimensionsMm: { width: 12, height: 12.53, depth: 12 },
    assetTransform: { ...identityTransform, rotationDeg: { x: -90, y: 0, z: 0 } },
    toleranceMm: 0.25,
    verificationDate: '2026-09-26',
    limitations: ['O modelo confirma o encapsulamento radial e o passo nominal; não confirma um fabricante CUI específico.'],
  },
  {
    designator: 'SEN1',
    componentId: 'a02yyuw_sen0311',
    partNumber: 'SEN0311',
    revision: 'A02YYUW atual · alvo JSN-SR04T v2.0 não confirmado',
    confidenceLevel: 'C',
    assetStatus: 'pending',
    assetSourceType: 'community',
    referenceAssetPath: '/assets/cad/carrier/SEN1/reference.glb',
    referenceAssetChecksum: '983ea5d71e95312a4880d2b4f55ca3bfaa04863760c16b35c2c58d64bcc7010b',
    sourceUrl: 'https://github.com/FreeCAD/FreeCAD-library',
    sourceReference: 'Catálogo atual DFRobot SEN0311; candidato JSN-SR04T v2.0 ainda não aceito',
    license: 'A confirmar no CAD compatível',
    sourceUnits: 'mm',
    assetTransform: identityTransform,
    toleranceMm: 1.0,
    verificationDate: '2026-09-26',
    limitations: ['A revisão v2.0 exige placa, header 1x4, coaxial, transdutor M20 e furos na mesma geometria.'],
    pendingReason: 'O link comunitário não comprova a variante JSN-SR04T v2.0; o módulo atual SEN0311 permanece como aproximação de bancada.',
  },
  {
    designator: 'RFID1',
    componentId: 'pn532_breakout',
    partNumber: 'Adafruit PN532 Breakout v1.6',
    revision: 'v1.6',
    confidenceLevel: 'C',
    assetStatus: 'pending',
    assetSourceType: 'derived',
    referenceAssetPath: '/assets/cad/carrier/RFID1/reference-derived.glb',
    referenceAssetChecksum: '8f0101701a41ffe69a7258037efd2c63293983a621d9854b49694b4006e81895',
    referenceAssetDimensionsMm: { width: 120, height: 5.3, depth: 50 },
    sourceUrl: 'https://github.com/adafruit/Adafruit-PN532-RFID-NFC-Breakout',
    sourceReference: 'Adafruit PN532 Breakout Eagle .brd/.sch v1.6 + GLB derivado local da geometria de placa, headers, furos, jumpers e antena',
    license: 'CC-BY-SA-3.0 / geometria derivada FuelGuard',
    originalFile: 'Adafruit PN532 RFID NFC Breakout v1.6 Eagle board/schematic files',
    sourceRevision: 'Adafruit PN532_Breakout_v1.6.brd',
    sourceUnits: 'mm',
    assetTransform: identityTransform,
    toleranceMm: 0.5,
    verificationDate: '2026-09-26',
    limitations: ['O GLB derivado preserva o envelope oficial de 120 × 50 mm, quatro furos, JP4 1×8, JP3 1×12, CN1 1×6, SEL0/SEL1 e uma representação da antena; não substitui a conversão industrial completa de cobre/serigrafia.'],
    pendingReason: 'A geometria foi derivada do Eagle oficial v1.6, mas ainda requer validação física e revisão visual contra a placa recebida antes de ser promovida a CAD verificado.',
  },
  {
    designator: 'SW1',
    componentId: 'reed_switch',
    partNumber: 'REED-MAG-14MM',
    revision: 'N.A. — paramétrico',
    confidenceLevel: 'C',
    assetStatus: 'approximate',
    assetSourceType: 'kicad',
    referenceAssetPath: '/assets/cad/carrier/SW1/reference.glb',
    referenceAssetChecksum: 'ae4f32f9a5a3f34d4562909e2fce7ae31147e1cde1f1d998637c9a26a598b1f6',
    sourceUrl: kicadSourceUrl,
    sourceReference: 'KiCad Switch_Magnetic / equivalente paramétrico',
    license: 'KiCad library license / part number não confirmado',
    sourceUnits: 'mm',
    assetTransform: identityTransform,
    toleranceMm: 0.5,
    verificationDate: '2026-09-26',
    limitations: ['Não declarar o modelo como oficial; a ampola e o ímã devem ser conferidos contra o fornecedor escolhido.'],
  },
  {
    designator: 'CBL_USB',
    componentId: 'usb_cable_assembly',
    partNumber: 'USB-C macho para Micro-USB, dados, 1 m',
    revision: 'Cabo genérico — aproximação',
    confidenceLevel: 'C',
    assetStatus: 'approximate',
    assetSourceType: 'procedural',
    sourceUrl: 'https://www.filipeflop.com/produto/cabo-usb-c-micro-usb/',
    sourceReference: 'Referência comercial USB-C → Micro-USB de dados; não é um CAD de cabo específico',
    license: 'A confirmar para o cabo físico',
    sourceUnits: 'mm',
    assetTransform: identityTransform,
    toleranceMm: 2.0,
    verificationDate: '2026-09-26',
    limitations: ['O cabo procedural permanece didático até existir modelo com fabricante, comprimento e licença rastreáveis.'],
  },
  {
    designator: 'TK1',
    componentId: 'tank_cylinder',
    partNumber: 'TK-WATER-5L-CYL',
    revision: 'Aguardando recipiente físico',
    confidenceLevel: 'D',
    assetStatus: 'pending',
    assetSourceType: 'procedural',
    sourceUrl: 'https://github.com/easyw/kicadStepUpMod',
    sourceReference: 'Placeholder didático FuelGuard',
    license: 'Design didático FuelGuard',
    sourceUnits: 'mm',
    assetTransform: identityTransform,
    toleranceMm: 2.0,
    verificationDate: '2026-09-26',
    limitations: ['Não apto para fabricação, corte ou gabarito. Requer fabricante, dimensões, tampa, parede e posição do sensor.'],
    pendingReason: 'O recipiente físico de 5 L ainda não foi especificado.',
  },
] as const;

const manifestByComponentId = new Map(
  CARRIER_CAD_ASSET_MANIFEST.map((entry) => [entry.componentId, entry]),
);

export function getCarrierAssetEntry(componentId: string): CarrierCadAssetManifestEntry | undefined {
  return manifestByComponentId.get(componentId);
}

export function getCarrierAssetEntryByDesignator(designator: string): CarrierCadAssetManifestEntry | undefined {
  return CARRIER_CAD_ASSET_MANIFEST.find((entry) => entry.designator === designator);
}

export function getCarrierComponentWithAsset(componentId: string): (CadComponentMetadata & CarrierCadAssetManifestEntry) | undefined {
  const component = FUELGUARD_CAD_LIBRARY[componentId];
  const asset = getCarrierAssetEntry(componentId);
  if (!component || !asset) return undefined;
  return { ...component, ...asset };
}

export function getCarrierAssetStatusLabel(status: CadAssetStatus): string {
  switch (status) {
    case 'verified':
      return 'Substituído';
    case 'approximate':
      return 'Aproximação explícita';
    case 'pending':
      return 'Pendente';
    case 'unavailable':
      return 'Indisponível';
    default:
      return 'Status não classificado';
  }
}

export function getCarrierAssetStatusClass(status: CadAssetStatus): string {
  switch (status) {
    case 'verified':
      return 'bg-emerald-950/70 text-emerald-300 border-emerald-700';
    case 'approximate':
      return 'bg-amber-950/70 text-amber-200 border-amber-700';
    case 'pending':
      return 'bg-orange-950/70 text-orange-200 border-orange-700';
    case 'unavailable':
      return 'bg-red-950/70 text-red-200 border-red-700';
    default:
      return 'bg-slate-900 text-slate-300 border-slate-700';
  }
}
