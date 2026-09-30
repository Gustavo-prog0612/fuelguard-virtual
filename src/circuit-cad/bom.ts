/**
 * FuelGuard — BOM Completa (Bill of Materials)
 *
 * Lista de materiais completa e corrigida para a bancada real.
 * Inclui Q1 (transistor NPN 2N2222) e R_BASE (1kΩ) que estavam faltando.
 *
 * Campos:
 *   - designator: referência no esquemático
 *   - quantity: quantidade
 *   - value: valor do componente
 *   - description: descrição detalhada
 *   - manufacturer: fabricante
 *   - mpn: part number do fabricante
 *   - supplier: fornecedor principal
 *   - supplierUrl: URL de compra
 *   - altSupplier: fornecedor alternativo (Brasil)
 *   - footprint: footprint KiCad
 *   - package: encapsulamento
 *   - voltage: tensão de operação
 *   - currentMa: corrente de operação (mA)
 *   - notes: observações críticas
 *   - confidence: nível de confiança (A=verificado, B=referência doc, C=approx, D=indefinido)
 *   - status: 'required' | 'optional' | 'pending'
 */

export type BomConfidence = 'A' | 'B' | 'C' | 'D';
export type BomStatus = 'required' | 'optional' | 'pending';

export interface BomItem {
  designator: string;
  quantity: number;
  value: string;
  description: string;
  manufacturer: string;
  mpn: string;
  supplier: string;
  supplierUrl: string;
  altSupplier: string;
  altSupplierUrl: string;
  footprint: string;
  package: string;
  voltageV: number;
  currentMa: number;
  notes: string;
  confidence: BomConfidence;
  status: BomStatus;
  category: 'microcontroller' | 'sensor' | 'rfid' | 'switch' | 'indicator' | 'driver' | 'passive' | 'connector' | 'mechanical' | 'power';
}

export const FUELGUARD_BOM: BomItem[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // MICROCONTROLADOR
  // ──────────────────────────────────────────────────────────────────────────
  {
    designator:  'U1',
    quantity:    1,
    value:       'ESP32-S3-N8R8',
    description: 'ESP32-S3-DevKitC-1-N8R8 v1.1 — Módulo de desenvolvimento com 8MB Flash, 8MB PSRAM, Wi-Fi 2.4GHz, Bluetooth 5.0 LE, USB Micro-B, 2 headers 1×22 pitch 2.54mm',
    manufacturer:'Espressif Systems',
    mpn:         'ESP32-S3-DevKitC-1-N8R8',
    supplier:    'Mouser',
    supplierUrl: 'https://www.mouser.com/ProductDetail/Espressif-Systems/ESP32-S3-DevKitC-1-N8R8',
    altSupplier: 'Robocore (Brasil)',
    altSupplierUrl:'https://www.robocore.net/plataformas-robocore/esp32',
    footprint:   'Connector_PinSocket_2.54mm:PinSocket_1x22_P2.54mm_Vertical × 2',
    package:     'DevKit DIP-44 (2×22 headers)',
    voltageV:    3.3,
    currentMa:   500,
    notes:       'Confirmar revisão v1.1 (header J1/J2 identical). Alimentar via USB-C→Micro-USB. GPIO Max source: 40mA chip; 12mA por pino recomendado.',
    confidence:  'B',
    status:      'required',
    category:    'microcontroller',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // SENSOR DE NÍVEL
  // ──────────────────────────────────────────────────────────────────────────
  {
    designator:  'SEN1',
    quantity:    1,
    value:       'SEN0311 / A02YYUW',
    description: 'DFRobot A02YYUW / SEN0311 — Sensor ultrassônico de nível IP67, UART TTL 3.3V, 9600 8N1, faixa 30–4500mm, zona cega 30mm, cabo 300±10mm terminado em conector JST PH2.0-4P',
    manufacturer:'DFRobot',
    mpn:         'SEN0311',
    supplier:    'DFRobot Store',
    supplierUrl: 'https://www.dfrobot.com/product-1894.html',
    altSupplier: 'Eletrogate (Brasil)',
    altSupplierUrl:'https://www.eletrogate.com/sensor-ultrassonico-de-distancia-a-prova-d-agua',
    footprint:   'Connector_JST:JST_PH_B4B-PH-K_1x04_P2.00mm_Vertical',
    package:     'Módulo com cabo; conector PH2.0-4P na PCB',
    voltageV:    3.3,
    currentMa:   8,
    notes:       'CRÍTICO: pinos do conector PH2.0: P1=VCC(vermelho), P2=GND(preto), P3=RX/MODE(branco)→3.3V, P4=TX(azul)→GPIO16. Pode ser necessário adaptador PH2.0 para DuPont se usar protoboard.',
    confidence:  'B',
    status:      'required',
    category:    'sensor',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // LEITOR RFID/NFC
  // ──────────────────────────────────────────────────────────────────────────
  {
    designator:  'RFID1',
    quantity:    1,
    value:       'PN532 V4',
    description: 'ELECHOUSE PN532 NFC/RFID Module V4 — Controlador NFC 13.56MHz, interface SPI/I2C/HSU selecionável por DIP switches, header 1×8 pitch 2.54mm. Para SPI: CH1=OFF, CH2=ON.',
    manufacturer:'ELECHOUSE',
    mpn:         'NFC-PN532_V4',
    supplier:    'Elechouse Store',
    supplierUrl: 'https://www.elechouse.com/product/pn532-nfc-rfid-module-v4/',
    altSupplier: 'AliExpress',
    altSupplierUrl:'https://www.aliexpress.com/item/PN532-NFC-RFID-V4.html',
    footprint:   'Connector_PinHeader_2.54mm:PinHeader_1x08_P2.54mm_Vertical',
    package:     'Módulo breakout; conector 1×8 macho na PCB',
    voltageV:    3.3,
    currentMa:   150,
    notes:       'CRÍTICO: Configurar DIP switches ANTES de conectar — SPI: CH1=OFF CH2=ON. Confirmar revisão V4 (pinout pode mudar nas V3). SPI frequência máx: 5MHz.',
    confidence:  'C',
    status:      'required',
    category:    'rfid',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // SENSOR DE TAMPA (REED SWITCH)
  // ──────────────────────────────────────────────────────────────────────────
  {
    designator:  'SW1',
    quantity:    1,
    value:       'MC-38 NO',
    description: 'MC-38 Reed Switch Normalmente Aberto (NO) + ímã emparelhado — Sensor magnético para detecção de fechamento de tampa. Quando ímã aproxima: contatos fecham → GPIO7 vai a GND. COMPRAR VARIANTE NO (Normalmente Aberto).',
    manufacturer:'MC-38 family (Vendor-lot)',
    mpn:         'MC-38-NO',
    supplier:    'TinyTronics',
    supplierUrl: 'https://www.tinytronics.nl/en/switches/magnetic-switches/door-switch-reed-relay-with-magnet',
    altSupplier: 'FilipeFlop (Brasil)',
    altSupplierUrl:'https://www.filipeflop.com/produto/sensor-magnetico-reed-switch/',
    footprint:   'TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-1,5-2_1x02_P5.08mm_Horizontal',
    package:     'Reed switch com cabo; borne parafuso 2P na PCB',
    voltageV:    3.3,
    currentMa:   1,
    notes:       'CRÍTICO: comprar variante NO (Normalmente Aberto). Se comprar NC a lógica fica invertida. GPIO7 usa INPUT_PULLUP interno do ESP32. Gap de operação: tipicamente 10-15mm.',
    confidence:  'C',
    status:      'required',
    category:    'switch',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // LED INDICADOR
  // ──────────────────────────────────────────────────────────────────────────
  {
    designator:  'D1',
    quantity:    1,
    value:       'LED verde 5mm',
    description: 'Kingbright WP7113GD — LED verde difuso Ø5mm THT, 565nm, If=20mA, Vf=2.1V, intensidade 8mcd @20mA',
    manufacturer:'Kingbright',
    mpn:         'WP7113GD',
    supplier:    'Mouser',
    supplierUrl: 'https://www.mouser.com/ProductDetail/Kingbright/WP7113GD',
    altSupplier: 'FilipeFlop (Brasil)',
    altSupplierUrl:'https://www.filipeflop.com/produto/led-verde-5mm/',
    footprint:   'LED_THT:LED_D5.0mm',
    package:     'LED THT Ø5mm',
    voltageV:    2.1,
    currentMa:   12,
    notes:       'Operar em ~12mA (GPIO4 via R3 220Ω). Equação: (3.3V - 2.1V) / 220Ω = 5.5mA (conservador). Subst: qualquer LED verde 5mm Vf≈2.0-2.2V.',
    confidence:  'B',
    status:      'required',
    category:    'indicator',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // RESISTOR DO LED
  // ──────────────────────────────────────────────────────────────────────────
  {
    designator:  'R3',
    quantity:    1,
    value:       '220Ω 1/4W 5%',
    description: 'Resistor de limitação de corrente do LED D1. Valor calculado: R = (VCC - Vf_LED) / I_LED = (3.3 - 2.1) / 0.0055 ≈ 218Ω → usar 220Ω padrão.',
    manufacturer:'Yageo (ou equivalente)',
    mpn:         'CFR-25JB-52-220R',
    supplier:    'Mouser',
    supplierUrl: 'https://www.mouser.com/ProductDetail/Yageo/CFR-25JB-52-220R',
    altSupplier: 'FilipeFlop (Brasil)',
    altSupplierUrl:'https://www.filipeflop.com/produto/resistor-220-ohm-14w-x20-unidades/',
    footprint:   'Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal',
    package:     'Resistor THT Axial DIN0207 — P10.16mm',
    voltageV:    3.3,
    currentMa:   6,
    notes:       'Atenção à orientação: não tem polaridade, mas manter sentido de montagem consistente para facilitar inspeção visual. Corpo verde com faixa laranja-laranja-marrom-dourado.',
    confidence:  'A',
    status:      'required',
    category:    'passive',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // TRANSISTOR NPN — DRIVER DO BUZZER (ANTES FALTANDO)
  // ──────────────────────────────────────────────────────────────────────────
  {
    designator:  'Q1',
    quantity:    1,
    value:       '2N2222A',
    description: 'Transistor NPN BJT TO-92 — Driver de corrente do buzzer BZ1. GPIO14 (3.3V) → R_BASE (1kΩ) → Base Q1 → Satura transistor → BZ1 acionado. I_base = (3.3-0.7)/1000 = 2.6mA; Ic_max = hFE × Ib = 75 × 2.6 = 195mA >> I_buzzer (30mA). ESTE COMPONENTE ESTAVA FALTANDO NA BOM ORIGINAL.',
    manufacturer:'ON Semiconductor (ou equiv.)',
    mpn:         'P2N2222AG',
    supplier:    'Mouser',
    supplierUrl: 'https://www.mouser.com/ProductDetail/onsemi/P2N2222AG',
    altSupplier: 'FilipeFlop (Brasil)',
    altSupplierUrl:'https://www.filipeflop.com/produto/transistor-npn-2n2222a/',
    footprint:   'Package_TO_SOT_THT:TO-92_Inline',
    package:     'TO-92 inline (CBE pinout — Fairchild/ON Semi)',
    voltageV:    5.0,
    currentMa:   30,
    notes:       'NOVO: adicionado à BOM para proteger o ESP32. Pinout TO-92 (flat face para frente): pino 1=E(emissor), 2=B(base), 3=C(coletor) — CONFIRMAR com datasheet da variante comprada. Alternativas: BC337, 2N3904.',
    confidence:  'B',
    status:      'required',
    category:    'driver',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // RESISTOR DE BASE DO TRANSISTOR (ANTES FALTANDO)
  // ──────────────────────────────────────────────────────────────────────────
  {
    designator:  'R_BASE',
    quantity:    1,
    value:       '1kΩ 1/4W 5%',
    description: 'Resistor de base do transistor Q1 (driver do buzzer). Limita corrente de base: I_base = (3.3V - Vbe) / R_base = (3.3 - 0.7) / 1000 = 2.6mA. ESTE COMPONENTE ESTAVA FALTANDO NA BOM ORIGINAL.',
    manufacturer:'Yageo (ou equivalente)',
    mpn:         'CFR-25JB-52-1K',
    supplier:    'Mouser',
    supplierUrl: 'https://www.mouser.com/ProductDetail/Yageo/CFR-25JB-52-1K',
    altSupplier: 'FilipeFlop (Brasil)',
    altSupplierUrl:'https://www.filipeflop.com/produto/resistor-1k-ohm-14w-x20-unidades/',
    footprint:   'Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal',
    package:     'Resistor THT Axial DIN0207 — P10.16mm',
    voltageV:    3.3,
    currentMa:   3,
    notes:       'NOVO: adicionado à BOM. Corpo marrom com faixa marrom-preto-vermelho-dourado. Pode usar 820Ω a 2.2kΩ como alternativa.',
    confidence:  'A',
    status:      'required',
    category:    'passive',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // BUZZER ATIVO
  // ──────────────────────────────────────────────────────────────────────────
  {
    designator:  'BZ1',
    quantity:    1,
    value:       'CMI-1295IC-0385T',
    description: 'Same Sky (ex-CUI Devices) CMI-1295IC-0385T — Buzzer ativo magnético 12mm, 3.8kHz, 2-5V, 30mA, 85dB@10cm. Internamente oscilado — basta aplicar tensão para soar.',
    manufacturer:'Same Sky (ex-CUI Devices)',
    mpn:         'CMI-1295IC-0385T',
    supplier:    'Mouser',
    supplierUrl: 'https://www.mouser.com/ProductDetail/Same-Sky/CMI-1295IC-0385T',
    altSupplier: 'FilipeFlop (Brasil)',
    altSupplierUrl:'https://www.filipeflop.com/produto/buzzer-ativo-5v/',
    footprint:   'Buzzer_Beeper:Buzzer_12x9.5mm_P5mm',
    package:     'Buzzer THT Ø12mm P5mm',
    voltageV:    3.3,
    currentMa:   30,
    notes:       'ATENÇÃO: nunca conectar diretamente ao GPIO — usar driver Q1 (2N2222). Pino + identificado por pino mais longo e marcação + no corpo. Alternativa: qualquer buzzer ativo 3.3V ou 5V.',
    confidence:  'B',
    status:      'required',
    category:    'indicator',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CONECTORES NA PCB ADAPTADORA
  // ──────────────────────────────────────────────────────────────────────────
  {
    designator:  'J_ESP32_L, J_ESP32_R',
    quantity:    2,
    value:       'Socket fêmea 1×22 P2.54mm',
    description: 'Conector fêmea 1×22 pinos pitch 2.54mm (PinSocket) — Para encaixe do ESP32-S3 DevKitC-1 na PCB. Uma unidade por fileira (esquerda e direita).',
    manufacturer:'Various',
    mpn:         'PinSocket_1x22_P2.54mm',
    supplier:    'Mouser',
    supplierUrl: 'https://www.mouser.com/ProductDetail/Samtec/SSW-122-01-T-S',
    altSupplier: 'FilipeFlop (Brasil)',
    altSupplierUrl:'https://www.filipeflop.com/produto/conector-header-22-vias-femea-1-fileira-180-2-54mm/',
    footprint:   'Connector_PinSocket_2.54mm:PinSocket_1x22_P2.54mm_Vertical',
    package:     'Through-hole socket 1×22',
    voltageV:    5.0,
    currentMa:   500,
    notes:       'Espaçamento entre conectores: 22.86mm (0.9") — confirmar com DXF oficial Espressif DevKitC-1 v1.1. Usar altura de socket adequada para ESP32 sentar nivelado.',
    confidence:  'B',
    status:      'required',
    category:    'connector',
  },

  {
    designator:  'J_PN532',
    quantity:    1,
    value:       'Header macho 1×8 P2.54mm',
    description: 'Conector macho 1×8 pinos pitch 2.54mm (PinHeader) — Para conexão do módulo PN532 V4 via fio jumper. Montado na PCB; cabo DuPont fêmea-fêmea no PN532.',
    manufacturer:'Various',
    mpn:         'PinHeader_1x08_P2.54mm',
    supplier:    'FilipeFlop (Brasil)',
    supplierUrl: 'https://www.filipeflop.com/produto/barra-de-pinos-macho-1x08-180-2-54mm/',
    altSupplier: 'Mouser',
    altSupplierUrl:'https://www.mouser.com/ProductDetail/Amphenol-ICC/68000-108HLF',
    footprint:   'Connector_PinHeader_2.54mm:PinHeader_1x08_P2.54mm_Vertical',
    package:     'Through-hole header 1×8',
    voltageV:    3.3,
    currentMa:   150,
    notes:       'Alternativa: usar socket fêmea para encaixar o PN532 diretamente se os pinos do módulo forem machos.',
    confidence:  'B',
    status:      'required',
    category:    'connector',
  },

  {
    designator:  'J_SEN1',
    quantity:    1,
    value:       'JST PH2.0 fêmea 4P vertical',
    description: 'Conector JST PH B4B-PH-K 4 pinos pitch 2.0mm — Para conexão do cabo do sensor SEN0311/A02YYUW que vem terminado em PH2.0 macho.',
    manufacturer:'JST',
    mpn:         'B4B-PH-K-S(LF)(SN)',
    supplier:    'Mouser',
    supplierUrl: 'https://www.mouser.com/ProductDetail/JST-Sales-America/B4B-PH-K-S-LF-SN',
    altSupplier: 'Eletrogate (Brasil)',
    altSupplierUrl:'https://www.eletrogate.com/conector-jst-ph-2-0-femea-4-pinos',
    footprint:   'Connector_JST:JST_PH_B4B-PH-K_1x04_P2.00mm_Vertical',
    package:     'JST PH 4P vertical THT',
    voltageV:    3.3,
    currentMa:   10,
    notes:       'Este conector recebe o cabo do SEN0311 diretamente. Verificar se o cabo do lote vem com macho ou fêmea para determinar a polaridade de montagem.',
    confidence:  'B',
    status:      'required',
    category:    'connector',
  },

  {
    designator:  'J_REED',
    quantity:    1,
    value:       'Borne parafuso 2P P5.08mm',
    description: 'Borne de parafuso 2 pinos pitch 5.08mm (ex: Phoenix Contact MKDS 1,5/2-5,08 ou similar) — Para conexão dos fios do MC-38 Reed Switch.',
    manufacturer:'Phoenix Contact (ou equiv.)',
    mpn:         'MKDS 1,5/ 2-5,08',
    supplier:    'Mouser',
    supplierUrl: 'https://www.mouser.com/ProductDetail/Phoenix-Contact/1715721',
    altSupplier: 'FilipeFlop (Brasil)',
    altSupplierUrl:'https://www.filipeflop.com/produto/conector-borne-kf301-2-pinos-5mm/',
    footprint:   'TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-1,5-2_1x02_P5.08mm_Horizontal',
    package:     'Borne parafuso 2P P5.08mm',
    voltageV:    3.3,
    currentMa:   1,
    notes:       'Alternativa: KF301-2P pitch 5.0mm (muito comum no Brasil) — ajustar footprint se pitch diferente.',
    confidence:  'B',
    status:      'required',
    category:    'connector',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ALIMENTAÇÃO
  // ──────────────────────────────────────────────────────────────────────────
  {
    designator:  'PS1',
    quantity:    1,
    value:       'Fonte USB-C 5V/2A',
    description: 'Fonte de alimentação USB-C 5V / 2A mínimo, certificada (UL, CE ou similar) — Alimenta o ESP32-S3 DevKitC-1 via cabo Micro-USB.',
    manufacturer:'A selecionar',
    mpn:         'USB-C-5V-2A-CERTIFIED',
    supplier:    'Amazon Brasil',
    supplierUrl: 'https://www.amazon.com.br/s?k=fonte+usb-c+5v+2a+certificada',
    altSupplier: 'Kabum (Brasil)',
    altSupplierUrl:'https://www.kabum.com.br/hardware/fontes/para-notebook-e-tablet',
    footprint:   'N/A',
    package:     'Adaptador de parede USB-C',
    voltageV:    5.0,
    currentMa:   2000,
    notes:       'Selecionar fonte certificada com proteção contra curto-circuito. Corrente mínima 1A (recomendado 2A para margem). Usar junto com cabo Micro-USB PS2.',
    confidence:  'D',
    status:      'required',
    category:    'power',
  },

  {
    designator:  'PS2',
    quantity:    1,
    value:       'Cabo USB-C → Micro-USB 1m',
    description: 'Cabo USB-C (fonte) → Micro-USB (ESP32 DevKit) — Conexão de alimentação e programação. Deve suportar dados (para flash via Arduino IDE).',
    manufacturer:'A selecionar',
    mpn:         'CABLE-USBC-MICROUSB-1M',
    supplier:    'Amazon Brasil',
    supplierUrl: 'https://www.amazon.com.br/s?k=cabo+usb-c+micro-usb',
    altSupplier: 'FilipeFlop (Brasil)',
    altSupplierUrl:'https://www.filipeflop.com/produto/cabo-usb-c-micro-usb/',
    footprint:   'N/A',
    package:     'Cabo 1m',
    voltageV:    5.0,
    currentMa:   2000,
    notes:       'Usar cabo de dados (não apenas carga) para poder programar o ESP32. Comprimento recomendado: 1m.',
    confidence:  'C',
    status:      'required',
    category:    'power',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // COMPONENTES MECÂNICOS
  // ──────────────────────────────────────────────────────────────────────────
  {
    designator:  'MH1, MH2, MH3, MH4',
    quantity:    4,
    value:       'Parafuso M3×6mm + espaçador M3',
    description: 'Furos de montagem M3 nos quatro cantos da PCB adaptadora. Usar parafusos M3×6mm com espaçadores de nylon ou metal para fixar a PCB em uma base.',
    manufacturer:'Various',
    mpn:         'M3-SCREWS-SPACERS',
    supplier:    'Amazon Brasil',
    supplierUrl: 'https://www.amazon.com.br/s?k=parafuso+m3+espa%C3%A7ador+nylon',
    altSupplier: 'Local (loja de ferragens)',
    altSupplierUrl:'',
    footprint:   'MountingHole:MountingHole_3.2mm_M3',
    package:     'Furo NPTH Ø3.2mm',
    voltageV:    0,
    currentMa:   0,
    notes:       'Usar espaçadores de nylon para evitar curto com a bancada. Altura mínima: 5mm (para componentes sob a PCB).',
    confidence:  'C',
    status:      'required',
    category:    'mechanical',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // TANQUE
  // ──────────────────────────────────────────────────────────────────────────
  {
    designator:  'TK1',
    quantity:    1,
    value:       'Tanque cilíndrico 5L acrílico',
    description: 'Cilindro acrílico FG-TANK-5L-CYL-R1: diâmetro interno Ø200mm, altura interna 160mm, parede 3mm. Tampa circular com furo central para sensor SEN0311 e furo lateral para MC-38. Volume geométrico: π × (100)² × 160 / 1000 ≈ 5026 mL.',
    manufacturer:'FuelGuard bench design (fabricar)',
    mpn:         'FG-TANK-5L-CYL-R1',
    supplier:    'Fabricar localmente (acrílico)',
    supplierUrl: '',
    altSupplier: 'Alternativa: balde cilíndrico Ø200mm',
    altSupplierUrl:'',
    footprint:   'N/A',
    package:     'Cilindro acrílico customizado',
    voltageV:    0,
    currentMa:   0,
    notes:       'Fabricar ou adaptar: usar cilindro acrílico cortado a laser ou tubo de PVC Ø200mm. Furos: 1× central na tampa (SEN0311), 1× lateral (MC-38), 4× M3 para fixação da tampa.',
    confidence:  'C',
    status:      'required',
    category:    'mechanical',
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Estatísticas e totais da BOM
// ──────────────────────────────────────────────────────────────────────────────

export interface BomSummary {
  totalLineItems: number;
  totalComponents: number;
  requiredItems: number;
  pendingItems: number;
  byCategory: Record<string, number>;
  confidenceDistribution: Record<BomConfidence, number>;
  estimatedCostBRL: { min: number; max: number };
  suppliersBR: string[];
}

export function computeBomSummary(bom: BomItem[]): BomSummary {
  const required = bom.filter((item) => item.status === 'required');
  const pending  = bom.filter((item) => item.status === 'pending');

  const totalQty = bom.reduce((sum, item) => sum + item.quantity, 0);

  const byCategory = bom.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + item.quantity;
    return acc;
  }, {});

  const confDist = bom.reduce<Record<BomConfidence, number>>((acc, item) => {
    acc[item.confidence] = (acc[item.confidence] ?? 0) + 1;
    return acc;
  }, { A: 0, B: 0, C: 0, D: 0 });

  const suppliersBR = [...new Set(
    bom
      .filter((item) => item.altSupplier.toLowerCase().includes('brasil') || item.altSupplier.toLowerCase().includes('br)'))
      .map((item) => item.altSupplier)
  )];

  return {
    totalLineItems: bom.length,
    totalComponents: totalQty,
    requiredItems: required.length,
    pendingItems: pending.length,
    byCategory,
    confidenceDistribution: confDist,
    // Estimativa conservadora para o mercado brasileiro
    estimatedCostBRL: { min: 350, max: 650 },
    suppliersBR,
  };
}

export const BOM_SUMMARY = computeBomSummary(FUELGUARD_BOM);
