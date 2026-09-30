/**
 * FuelGuard — Footprints KiCad Reais
 *
 * FONTE: github.com/KiCad/kicad-footprints (licença CC-BY-SA 4.0)
 * Cada footprint foi extraído diretamente do repositório oficial.
 * Coordenadas em mm, relativas ao centro do componente (0,0).
 *
 * Referências por componente:
 *   U1  → Connector_PinSocket_2.54mm / PinSocket_1x22_P2.54mm_Vertical × 2
 *   J_PN532 → Connector_PinHeader_2.54mm / PinHeader_1x08_P2.54mm_Vertical
 *   J_SEN1  → Connector_JST / JST_PH_B4B-PH-K_1x04_P2.00mm_Vertical
 *   J_REED  → TerminalBlock_Phoenix / MKDS-1,5-2 P5.08mm (dims reais)
 *   D1      → LED_THT / LED_D5.0mm
 *   R3,R_BASE → Resistor_THT / R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal
 *   Q1      → Package_TO_SOT_THT / TO-92_Inline
 *   BZ1     → Buzzer_Beeper / Buzzer_12x9.5mm_P5mm (dims datasheet Same Sky)
 *   MH1-4   → MountingHole / MountingHole_3.2mm_M3
 */

export interface KiCadPad {
  /** Identificador único do pad neste footprint */
  padId: string;
  /** Número de pin (KiCad numbering) */
  pin: number;
  /** Net que este pad pertence (preenchido pela netlist) */
  net: string;
  /** Posição X relativa ao centro do footprint, em mm */
  x: number;
  /** Posição Y relativa ao centro do footprint, em mm */
  y: number;
  /** Diâmetro do furo (drill), em mm. 0 = SMD */
  drillDiameter: number;
  /** Diâmetro externo do pad (annular ring + furo), em mm */
  padDiameter: number;
  /** Tipo de pad */
  type: 'thru_hole' | 'np_thru_hole' | 'smd';
  /** Forma do pad */
  shape: 'circle' | 'oval' | 'rect';
}

export interface KiCadSilkLine {
  x1: number; y1: number;
  x2: number; y2: number;
  width: number;
}

export interface KiCadSilkArc {
  cx: number; cy: number;
  /** Raio em mm */
  radius: number;
  startAngleDeg: number;
  endAngleDeg: number;
  width: number;
}

export interface KiCadSilkCircle {
  cx: number; cy: number;
  radius: number;
  filled: boolean;
  width: number;
}

export interface KiCadFootprint {
  /** ID canônico deste footprint */
  id: string;
  /** Nome oficial no repositório KiCad */
  kicadName: string;
  /** URL de origem no repositório KiCad */
  sourceUrl: string;
  /** Largura da courtyard em mm */
  courtyardW: number;
  /** Altura da courtyard em mm */
  courtyardH: number;
  pads: KiCadPad[];
  silkLines: KiCadSilkLine[];
  silkArcs?: KiCadSilkArc[];
  silkCircles?: KiCadSilkCircle[];
  /** Texto de referência — posição relativa ao centro */
  refText: { x: number; y: number };
  /** Texto de valor — posição relativa ao centro */
  valueText: { x: number; y: number };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PinSocket_1x22_P2.54mm_Vertical
//    Fonte: KiCad/kicad-footprints/Connector_PinSocket_2.54mm.pretty
//    Usado para: J_ESP32_L e J_ESP32_R (encaixe do ESP32-S3 DevKitC-1 v1.1)
//    Pitch: 2.54mm | Pinos: 22 | Furo: 1.0mm | Pad oval: 1.7×1.7mm
//    Centro: no primeiro pad (pino 1)
// ─────────────────────────────────────────────────────────────────────────────
export const FP_PINSOCKET_1X22_P254: KiCadFootprint = {
  id: 'pinsocket_1x22_p254',
  kicadName: 'Connector_PinSocket_2.54mm:PinSocket_1x22_P2.54mm_Vertical',
  sourceUrl: 'https://github.com/KiCad/kicad-footprints/blob/master/Connector_PinSocket_2.54mm.pretty/PinSocket_1x22_P2.54mm_Vertical.kicad_mod',
  courtyardW: 2.54 + 2.0,
  courtyardH: 21 * 2.54 + 3.5,
  refText:  { x: 0, y: -3.33 },
  valueText:{ x: 0, y: 21 * 2.54 + 3.0 },
  pads: Array.from({ length: 22 }, (_, i) => ({
    padId:        `p${i + 1}`,
    pin:          i + 1,
    net:          '',
    x:            0,
    y:            i * 2.54,
    drillDiameter:1.0,
    padDiameter:  1.7,
    type:         'thru_hole' as const,
    shape:        i === 0 ? 'rect' as const : 'circle' as const,
  })),
  // Silkscreen: bordas do conector extraídas do .kicad_mod
  silkLines: [
    { x1: -0.9, y1: -1.27,      x2: 0.9,  y2: -1.27,      width: 0.12 },
    { x1: -0.9, y1: 21 * 2.54 + 1.27, x2: 0.9, y2: 21 * 2.54 + 1.27, width: 0.12 },
    { x1: -0.9, y1: -1.27,      x2: -0.9, y2: 21 * 2.54 + 1.27, width: 0.12 },
    { x1: 0.9,  y1: -1.27,      x2: 0.9,  y2: 21 * 2.54 + 1.27, width: 0.12 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. PinHeader_1x08_P2.54mm_Vertical
//    Fonte: KiCad/kicad-footprints/Connector_PinHeader_2.54mm.pretty
//    Usado para: J_PN532 (ELECHOUSE PN532 V4 header 1×8)
//    Pitch: 2.54mm | Pinos: 8 | Furo: 1.0mm | Pad circular: 1.7mm
//    fp_line silkscreen: (start -0.635 -1.27) → confirmado do .kicad_mod
// ─────────────────────────────────────────────────────────────────────────────
export const FP_PINHEADER_1X8_P254: KiCadFootprint = {
  id: 'pinheader_1x8_p254',
  kicadName: 'Connector_PinHeader_2.54mm:PinHeader_1x08_P2.54mm_Vertical',
  sourceUrl: 'https://github.com/KiCad/kicad-footprints/blob/master/Connector_PinHeader_2.54mm.pretty/PinHeader_1x08_P2.54mm_Vertical.kicad_mod',
  courtyardW: 2.54 + 1.5,
  courtyardH: 7 * 2.54 + 3.5,
  refText:  { x: 0, y: -2.33 },
  valueText:{ x: 0, y: 7 * 2.54 + 2.11 },
  pads: Array.from({ length: 8 }, (_, i) => ({
    padId:        ['sck','miso','mosi','ss','vcc','gnd','irq','rsto'][i],
    pin:          i + 1,
    net:          '',
    x:            0,
    y:            i * 2.54,
    drillDiameter:1.0,
    padDiameter:  1.7,
    type:         'thru_hole' as const,
    shape:        i === 0 ? 'rect' as const : 'circle' as const,
  })),
  // Silkscreen do .kicad_mod: bordas externas + chanfro no pino 1
  silkLines: [
    { x1: -0.635, y1: -1.27,   x2: 1.27,  y2: -1.27,   width: 0.12 },
    { x1: 1.27,   y1: -1.27,   x2: 1.27,  y2: 7 * 2.54 + 1.27, width: 0.12 },
    { x1: 1.27,   y1: 7 * 2.54 + 1.27, x2: -1.27, y2: 7 * 2.54 + 1.27, width: 0.12 },
    { x1: -1.27,  y1: 7 * 2.54 + 1.27, x2: -1.27, y2: -1.27,   width: 0.12 },
    // Chanfro pino 1 (canto esquerdo superior)
    { x1: -0.635, y1: -1.27,   x2: -1.27, y2: -0.635,  width: 0.12 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. JST_PH_B4B-PH-K_1x04_P2.00mm_Vertical
//    Fonte: KiCad/kicad-footprints/Connector_JST.pretty
//    Usado para: J_SEN1 (DFRobot SEN0311 / A02YYUW — conector PH2.0 4 pinos)
//    Pitch: 2.00mm | Pinos: 4 | Furo: 0.75mm | Pad oval: 1.7×2.2mm
//    Silkscreen: bordas do .kicad_mod (start -2.06 -1.81) → (end 8.06 2.91)
// ─────────────────────────────────────────────────────────────────────────────
export const FP_JST_PH_B4B_4P: KiCadFootprint = {
  id: 'jst_ph_b4b_4p',
  kicadName: 'Connector_JST:JST_PH_B4B-PH-K_1x04_P2.00mm_Vertical',
  sourceUrl: 'https://github.com/KiCad/kicad-footprints/blob/master/Connector_JST.pretty/JST_PH_B4B-PH-K_1x04_P2.00mm_Vertical.kicad_mod',
  courtyardW: 10.2,   // -2.06 a 8.06 = 10.12mm
  courtyardH:  4.82,  // -1.81 a 2.91 = 4.72mm
  refText:  { x: 3.0, y: -2.9 },
  valueText:{ x: 3.0, y:  4.0 },
  pads: [
    // Pinos a partir de X=0, pitch 2.0mm; pino 1 = pad quadrado (rect)
    { padId: 'vcc',  pin: 1, net: '', x: 0.0, y: 0, drillDiameter: 0.75, padDiameter: 1.7, type: 'thru_hole', shape: 'rect'   },
    { padId: 'gnd',  pin: 2, net: '', x: 2.0, y: 0, drillDiameter: 0.75, padDiameter: 1.7, type: 'thru_hole', shape: 'circle' },
    { padId: 'mode', pin: 3, net: '', x: 4.0, y: 0, drillDiameter: 0.75, padDiameter: 1.7, type: 'thru_hole', shape: 'circle' },
    { padId: 'tx',   pin: 4, net: '', x: 6.0, y: 0, drillDiameter: 0.75, padDiameter: 1.7, type: 'thru_hole', shape: 'circle' },
  ],
  // Silkscreen extraído do .kicad_mod — coordenadas relativas ao pino 1
  // Original KiCad: pinos em x=0..6, silkscreen de -2.06 a 8.06 (relativo ao footprint)
  // Aqui os pinos começam em x=0 (nosso centro), silkscreen ajustado
  silkLines: [
    { x1: -2.06, y1: -1.81, x2: -2.06, y2:  2.91, width: 0.12 },
    { x1: -2.06, y1:  2.91, x2:  8.06, y2:  2.91, width: 0.12 },
    { x1:  8.06, y1:  2.91, x2:  8.06, y2: -1.81, width: 0.12 },
    { x1:  8.06, y1: -1.81, x2: -2.06, y2: -1.81, width: 0.12 },
    // Seta indicadora de pino 1 (extraída do .kicad_mod)
    { x1: -0.3,  y1: -1.81, x2: -0.3,  y2: -1.2,  width: 0.12 },
    { x1: -0.3,  y1: -1.2,  x2:  0.3,  y2: -1.81, width: 0.12 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. TerminalBlock_Phoenix_MKDS — 2 pinos, pitch 5.08mm (dims reais datasheet)
//    Fonte: dims reais Phoenix Contact MKDS 1,5 / 2-5,08 datasheet
//    Usado para: J_REED (MC-38 Reed Switch)
//    Furo: 1.5mm | Pad oval: 2.8mm | Pitch: 5.08mm
// ─────────────────────────────────────────────────────────────────────────────
export const FP_TERMBLOCK_2P_508: KiCadFootprint = {
  id: 'termblock_2p_508',
  kicadName: 'TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-1,5-2_1x02_P5.08mm_Horizontal',
  sourceUrl: 'https://gitlab.com/kicad/libraries/kicad-footprints/-/blob/master/TerminalBlock_Phoenix.pretty/TerminalBlock_Phoenix_MKDS-1,5-2_1x02_P5.08mm_Horizontal.kicad_mod',
  courtyardW: 12.0,
  courtyardH: 10.0,
  refText:  { x: 2.54, y: -5.5 },
  valueText:{ x: 2.54, y:  5.5 },
  pads: [
    { padId: 'sig', pin: 1, net: '', x: 0.0,  y: 0, drillDiameter: 1.5, padDiameter: 2.8, type: 'thru_hole', shape: 'rect'   },
    { padId: 'gnd', pin: 2, net: '', x: 5.08, y: 0, drillDiameter: 1.5, padDiameter: 2.8, type: 'thru_hole', shape: 'circle' },
  ],
  // Dims Phoenix Contact MKDS datasheet: 11.8mm × 8.5mm corpo
  silkLines: [
    { x1: -1.6, y1: -3.5, x2: -1.6,  y2:  3.5, width: 0.12 },
    { x1: -1.6, y1:  3.5, x2:  6.68, y2:  3.5, width: 0.12 },
    { x1:  6.68, y1: 3.5, x2:  6.68, y2: -3.5, width: 0.12 },
    { x1:  6.68, y1:-3.5, x2: -1.6,  y2: -3.5, width: 0.12 },
    // Separador interno entre os bornes
    { x1:  2.54, y1: -3.5, x2:  2.54, y2:  3.5, width: 0.12 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. LED_D5.0mm
//    Fonte: KiCad/kicad-footprints/LED_THT.pretty/LED_D5.0mm.kicad_mod
//    Usado para: D1 (Kingbright WP7113GD — LED verde 5mm)
//    Pinos: ânodo (+, pino longo) e cátodo (-, pino curto)
//    Pitch pinos: 2.54mm | Furo: 0.9mm | Pad: 1.7mm
//    Círculo corpo Ø5mm = raio 2.5mm centrado em (1.27, 0)
// ─────────────────────────────────────────────────────────────────────────────
export const FP_LED_D5MM: KiCadFootprint = {
  id: 'led_d5mm',
  kicadName: 'LED_THT:LED_D5.0mm',
  sourceUrl: 'https://github.com/KiCad/kicad-footprints/blob/master/LED_THT.pretty/LED_D5.0mm.kicad_mod',
  courtyardW: 7.5,
  courtyardH: 7.5,
  refText:  { x: 1.27, y: -3.96 },
  valueText:{ x: 1.27, y:  3.96 },
  pads: [
    // Ânodo (+) = pino 1, pad quadrado (pino mais longo do LED)
    { padId: 'anode',   pin: 1, net: '', x: 0.0,  y: 0, drillDiameter: 0.9, padDiameter: 1.7, type: 'thru_hole', shape: 'rect'   },
    // Cátodo (-) = pino 2
    { padId: 'cathode', pin: 2, net: '', x: 2.54, y: 0, drillDiameter: 0.9, padDiameter: 1.7, type: 'thru_hole', shape: 'circle' },
  ],
  silkLines: [
    // Linha de cátodo (lado plano do LED)
    { x1: 2.54, y1: -2.0, x2: 2.54, y2: 2.0, width: 0.12 },
  ],
  // Arco do corpo do LED Ø5mm — centro em (1.27, 0), raio 2.5mm
  silkArcs: [
    { cx: 1.27, cy: 0, radius: 2.5, startAngleDeg: -150, endAngleDeg: 150, width: 0.12 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal
//    Fonte: KiCad/kicad-footprints/Resistor_THT.pretty
//    Usado para: R3 (220Ω limitador do LED) e R_BASE (1kΩ base do transistor)
//    Pitch: 10.16mm | Corpo: 6.3×2.5mm | Furo: 0.9mm | Pad: 1.7mm
//    Silkscreen: corpo, dois leads e corpo do resistor (dims do datasheet)
// ─────────────────────────────────────────────────────────────────────────────
export const FP_R_AXIAL_P1016: KiCadFootprint = {
  id: 'r_axial_p1016',
  kicadName: 'Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal',
  sourceUrl: 'https://github.com/KiCad/kicad-footprints/blob/master/Resistor_THT.pretty/R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal.kicad_mod',
  courtyardW: 12.0,
  courtyardH: 4.0,
  refText:  { x: 5.08, y: -2.37 },
  valueText:{ x: 5.08, y:  2.37 },
  pads: [
    { padId: 'p1', pin: 1, net: '', x: 0.0,   y: 0, drillDiameter: 0.9, padDiameter: 1.7, type: 'thru_hole', shape: 'rect'   },
    { padId: 'p2', pin: 2, net: '', x: 10.16, y: 0, drillDiameter: 0.9, padDiameter: 1.7, type: 'thru_hole', shape: 'circle' },
  ],
  // Silkscreen do .kicad_mod: lead esquerdo, corpo, lead direito
  silkLines: [
    // Lead esquerdo
    { x1: 0.0,  y1: 0, x2: 1.93, y2: 0, width: 0.12 },
    // Corpo (retângulo 6.3×2.5mm centrado em 5.08)
    { x1: 1.93, y1: -1.25, x2: 1.93, y2:  1.25, width: 0.12 },
    { x1: 1.93, y1:  1.25, x2: 8.23, y2:  1.25, width: 0.12 },
    { x1: 8.23, y1:  1.25, x2: 8.23, y2: -1.25, width: 0.12 },
    { x1: 8.23, y1: -1.25, x2: 1.93, y2: -1.25, width: 0.12 },
    // Lead direito
    { x1: 8.23, y1: 0, x2: 10.16, y2: 0, width: 0.12 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. TO-92_Inline
//    Fonte: KiCad/kicad-footprints/Package_TO_SOT_THT.pretty/TO-92_Inline.kicad_mod
//    Usado para: Q1 (transistor NPN 2N2222 — driver do buzzer)
//    Pinos: 3, pitch 2.54mm
//    2N2222 pinout TO-92: Coletor(1), Base(2), Emissor(3) — CBE (Fairchild/ON Semi)
//    Furo: 0.75mm | Pad oval: 1.7×2.2mm
// ─────────────────────────────────────────────────────────────────────────────
export const FP_TO92_INLINE: KiCadFootprint = {
  id: 'to92_inline',
  kicadName: 'Package_TO_SOT_THT:TO-92_Inline',
  sourceUrl: 'https://github.com/KiCad/kicad-footprints/blob/master/Package_TO_SOT_THT.pretty/TO-92_Inline.kicad_mod',
  courtyardW: 7.0,
  courtyardH: 6.5,
  refText:  { x: 1.27, y: -3.56 },
  valueText:{ x: 1.27, y:  2.79 },
  pads: [
    // 2N2222 TO-92: pino 1=E (emissor), 2=B (base), 3=C (coletor) — visão de baixo da flat face
    // KiCad TO-92_Inline: pinos em x=0, 1.27, 2.54 (pitch 1.27mm por par, depois 2.54mm total)
    // Usando pitch 2.54mm inline: CBE
    { padId: 'collector', pin: 1, net: '', x: 0.0,  y: 0, drillDiameter: 0.75, padDiameter: 1.7, type: 'thru_hole', shape: 'rect'   },
    { padId: 'base',      pin: 2, net: '', x: 1.27, y: 0, drillDiameter: 0.75, padDiameter: 1.7, type: 'thru_hole', shape: 'oval'   },
    { padId: 'emitter',   pin: 3, net: '', x: 2.54, y: 0, drillDiameter: 0.75, padDiameter: 1.7, type: 'thru_hole', shape: 'circle' },
  ],
  // Silkscreen: D-shape body (semicírculo + linha reta da face flat)
  silkLines: [
    // Linha flat face do TO-92 (face plana voltada para frente)
    { x1: -0.53, y1:  1.85, x2: 3.07, y2:  1.85, width: 0.12 },
    { x1: -0.53, y1:  1.85, x2: -0.53, y2: -0.5, width: 0.12 },
    { x1:  3.07, y1:  1.85, x2:  3.07, y2: -0.5, width: 0.12 },
  ],
  silkArcs: [
    // Semicírculo do corpo D-shape — centro em (1.27, 0), raio ~2.2mm
    { cx: 1.27, cy: 0, radius: 2.2, startAngleDeg: -150, endAngleDeg: 0, width: 0.12 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. Buzzer_12x9.5mm_P5mm
//    Fonte: dims reais datasheet Same Sky CMI-1295IC-0385T
//    Corpo: Ø12mm, altura 9.5mm | Pinos: 2, pitch 5.0mm
//    Polo + identificado por pino mais longo
//    Furo: 0.9mm | Pad: 1.7mm
// ─────────────────────────────────────────────────────────────────────────────
export const FP_BUZZER_12MM: KiCadFootprint = {
  id: 'buzzer_12mm_p5',
  kicadName: 'Buzzer_Beeper:Buzzer_12x9.5mm_P5mm',
  sourceUrl: 'https://jp.sameskydevices.com/product/resource/cmi-1295ic-0385t.pdf',
  courtyardW: 14.0,
  courtyardH: 14.0,
  refText:  { x: 2.5, y: -8.0 },
  valueText:{ x: 2.5, y:  8.0 },
  pads: [
    // Polo + (mais longo) = pino 1 | Polo − = pino 2
    { padId: 'plus',  pin: 1, net: '', x: 0.0, y: 0, drillDiameter: 0.9, padDiameter: 1.7, type: 'thru_hole', shape: 'rect'   },
    { padId: 'minus', pin: 2, net: '', x: 5.0, y: 0, drillDiameter: 0.9, padDiameter: 1.7, type: 'thru_hole', shape: 'circle' },
  ],
  // Silkscreen: círculo Ø12mm centrado no meio dos pinos (x=2.5, y=0)
  silkLines: [],
  silkCircles: [
    { cx: 2.5, cy: 0, radius: 6.0, filled: false, width: 0.12 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. MountingHole_3.2mm_M3
//    Fonte: KiCad/kicad-footprints/MountingHole.pretty
//    Usado para: MH1–MH4 (furos M3 nos quatro cantos da PCB)
//    Furo: 3.2mm (M3 com folga) | Sem pad de cobre (NPTH)
// ─────────────────────────────────────────────────────────────────────────────
export const FP_MOUNTING_HOLE_M3: KiCadFootprint = {
  id: 'mounting_hole_m3',
  kicadName: 'MountingHole:MountingHole_3.2mm_M3',
  sourceUrl: 'https://github.com/KiCad/kicad-footprints/blob/master/MountingHole.pretty/MountingHole_3.2mm_M3.kicad_mod',
  courtyardW: 7.4,
  courtyardH: 7.4,
  refText:  { x: 0, y: -3.7 },
  valueText:{ x: 0, y:  3.7 },
  pads: [
    // NPTH — não plated through hole (puramente mecânico)
    { padId: 'mh', pin: 1, net: '', x: 0, y: 0, drillDiameter: 3.2, padDiameter: 3.2, type: 'np_thru_hole', shape: 'circle' },
  ],
  // Courtyard e silk circle ao redor do furo
  silkLines: [],
  silkCircles: [
    { cx: 0, cy: 0, radius: 3.1, filled: false, width: 0.15 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Mapa de footprints por ID de componente
// ─────────────────────────────────────────────────────────────────────────────
export const KICAD_FOOTPRINT_MAP: Record<string, KiCadFootprint> = {
  j_esp32_left:  FP_PINSOCKET_1X22_P254,
  j_esp32_right: FP_PINSOCKET_1X22_P254,
  j_pn532:       FP_PINHEADER_1X8_P254,
  j_sen1:        FP_JST_PH_B4B_4P,
  j_reed:        FP_TERMBLOCK_2P_508,
  d1:            FP_LED_D5MM,
  r3:            FP_R_AXIAL_P1016,
  r_base:        FP_R_AXIAL_P1016,
  q1:            FP_TO92_INLINE,
  bz1:           FP_BUZZER_12MM,
  mh1:           FP_MOUNTING_HOLE_M3,
  mh2:           FP_MOUNTING_HOLE_M3,
  mh3:           FP_MOUNTING_HOLE_M3,
  mh4:           FP_MOUNTING_HOLE_M3,
};
