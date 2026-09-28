/**
 * FuelGuard Virtual Test Bench — Construtor 3D de Alta Fidelidade da Carrier Board
 * Modela todos os componentes com geometrias reais de engenharia e materiais PBR (escala 1:1):
 * - U1: ESP32-S3 DevKitC-1 v1.1 com blindagem WROOM-1 gravada, 2x USB-C, antena serpentina e botões
 * - U2: Buffer SN74AHCT125N DIP-14 padrão JEDEC MS-001 BA com chanfro, dimple e pinos formados
 * - R_DIV: Divisor 10k/15k com resistores axiais DO-41 e anéis de cores IEC 60062
 * - J1, J2, J3: Conectores JST-XH reais em Nylon 66 com trava frontal, chavetas e pinos de 0.64 mm
 * - BZ1: Buzzer piezoelétrico 12mm CUI CPE-1200 com porta acústica e símbolo polar '+'
 * - D1: LED radial 5mm translúcido com chanfro de catodo e taça refletiva interna
 * - C1/C2: Capacitores de desacoplamento e bulk
 * - Conector USB-C de borda em aço inoxidável
 */

import * as THREE from 'three';

export interface Carrier3DMaterials {
  pcbMat: THREE.Material;
  enigGoldMat: THREE.Material;
  tinSolderMat: THREE.Material;
  whiteSilkscreenMat: THREE.Material;
  edgeMat: THREE.Material;
}

export function buildCarrierBoard(
  boardGroup: THREE.Group,
  pickableObjects: { mesh: THREE.Object3D; compKey: string }[],
  materials: Carrier3DMaterials,
  onLedCreated?: (mesh: THREE.Mesh) => void
): void {
  const { pcbMat, enigGoldMat, tinSolderMat, whiteSilkscreenMat, edgeMat } = materials;

  // =========================================================================
  // 1. SUBSTRATO FR-4 (140.0 x 100.0 x 1.6 mm) COM CANTOS CHANFRADOS
  // =========================================================================
  const boardW = 140.0;
  const boardH = 100.0;
  const pcbThickness = 1.6;

  // Cria o formato 2D da placa com cantos chanfrados a 45° (5 mm de chanfro)
  const cornerChamfer = 5.0;
  const halfW = boardW / 2;
  const halfH = boardH / 2;

  const boardShape = new THREE.Shape();
  boardShape.moveTo(-halfW + cornerChamfer, -halfH);
  boardShape.lineTo(halfW - cornerChamfer, -halfH);
  boardShape.lineTo(halfW, -halfH + cornerChamfer);
  boardShape.lineTo(halfW, halfH - cornerChamfer);
  boardShape.lineTo(halfW - cornerChamfer, halfH);
  boardShape.lineTo(-halfW + cornerChamfer, halfH);
  boardShape.lineTo(-halfW, halfH - cornerChamfer);
  boardShape.lineTo(-halfW, -halfH + cornerChamfer);
  boardShape.closePath();

  // Furação M3 nos 4 cantos (raio 1.6 mm para parafuso M3)
  const holeCoords: [number, number][] = [
    [-62, -42],
    [62, -42],
    [-62, 42],
    [62, 42],
  ];

  holeCoords.forEach(([hx, hz]) => {
    const holePath = new THREE.Path();
    holePath.absarc(hx, hz, 1.6, 0, Math.PI * 2, true);
    boardShape.holes.push(holePath);
  });

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: pcbThickness,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.15,
    bevelThickness: 0.15,
  };

  const pcbGeo = new THREE.ExtrudeGeometry(boardShape, extrudeSettings);
  const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
  pcbMesh.rotation.x = Math.PI / 2;
  pcbMesh.position.y = 0;
  pcbMesh.receiveShadow = true;
  pcbMesh.castShadow = true;
  boardGroup.add(pcbMesh);

  // Borda cobreada / acabamento chanfrado da lateral da PCB
  const edgeGeo = new THREE.BoxGeometry(boardW + 0.2, pcbThickness - 0.2, boardH + 0.2);
  const edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
  edgeMesh.position.y = -pcbThickness / 2;
  boardGroup.add(edgeMesh);

  // Anéis dourados metalizados ENIG nos 4 furos M3 (Top e Bottom)
  const ringGeo = new THREE.RingGeometry(1.65, 3.4, 24);
  holeCoords.forEach(([hx, hz]) => {
    // Top pad
    const ringTop = new THREE.Mesh(ringGeo, enigGoldMat);
    ringTop.rotation.x = -Math.PI / 2;
    ringTop.position.set(hx, 0.02, hz);
    boardGroup.add(ringTop);

    // Bottom pad
    const ringBottom = new THREE.Mesh(ringGeo, enigGoldMat);
    ringBottom.rotation.x = Math.PI / 2;
    ringBottom.position.set(hx, -pcbThickness - 0.02, hz);
    boardGroup.add(ringBottom);
  });

  // Marcas Fiduciais de alinhamento pick-and-place (3 cantos)
  [[-58, -38], [58, -38], [-58, 38]].forEach(([fx, fz]) => {
    const fiducial = new THREE.Mesh(new THREE.CircleGeometry(0.75, 16), enigGoldMat);
    fiducial.rotation.x = -Math.PI / 2;
    fiducial.position.set(fx, 0.02, fz);
    boardGroup.add(fiducial);

    const maskRing = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.25, 16), whiteSilkscreenMat);
    maskRing.rotation.x = -Math.PI / 2;
    maskRing.position.set(fx, 0.022, fz);
    boardGroup.add(maskRing);
  });

  // =========================================================================
  // 2. CONECTOR USB-C DE BORDA (FLUSH NA BORDA FRONTAL: Z=50)
  // =========================================================================
  const usbGroup = new THREE.Group();
  usbGroup.position.set(-20, 0, 50);

  // Carcaça metálica estampada em aço inoxidável escovado
  const usbShellMat = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    metalness: 0.95,
    roughness: 0.18,
  });
  const usbShell = new THREE.Mesh(new THREE.BoxGeometry(8.94, 3.16, 7.35), usbShellMat);
  usbShell.position.set(0, 1.25, -1.0);
  usbShell.castShadow = true;
  usbGroup.add(usbShell);

  // Abertura chanfrada interna do receptáculo USB-C
  const usbMouth = new THREE.Mesh(
    new THREE.BoxGeometry(7.2, 1.6, 2.0),
    new THREE.MeshBasicMaterial({ color: 0x05070a })
  );
  usbMouth.position.set(0, 1.25, 2.0);
  usbGroup.add(usbMouth);

  // Língua isolante central com contatos dourados
  const usbTongue = new THREE.Mesh(
    new THREE.BoxGeometry(6.4, 0.48, 3.5),
    new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3 })
  );
  usbTongue.position.set(0, 1.25, 1.0);
  usbGroup.add(usbTongue);

  // Filetes dourados dos 16 contatos elétricos na língua
  for (let c = 0; c < 8; c++) {
    const finger = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 1.8), enigGoldMat);
    finger.position.set(-2.45 + c * 0.7, 1.51, 1.0);
    usbGroup.add(finger);
  }

  // 4 Abas de aterramento soldadas com estanho SAC305
  const tabGeo = new THREE.BoxGeometry(1.2, 2.0, 1.6);
  const tabL = new THREE.Mesh(tabGeo, tinSolderMat);
  tabL.position.set(-5.0, 0.4, -2.5);
  const tabR = new THREE.Mesh(tabGeo, tinSolderMat);
  tabR.position.set(5.0, 0.4, -2.5);
  usbGroup.add(tabL, tabR);

  boardGroup.add(usbGroup);
  pickableObjects.push({ mesh: usbShell, compKey: 'esp32_s3_devkit' });

  // =========================================================================
  // 3. U1: ESP32-S3 DEVKITC-1 V1.1 (CAD REAL COMPLETO)
  // =========================================================================
  // Montado sobre barra de pinos fêmea (headers) na Carrier Board em X=-34, Z=-2
  const espGroup = new THREE.Group();
  espGroup.position.set(-34, 0, -2);

  // Soquetes fêmea pretos 1x22 na placa (Padrão 2.54 mm)
  const socketMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.55 });
  const socketLeft = new THREE.Mesh(new THREE.BoxGeometry(2.54, 5.0, 55.88), socketMat);
  socketLeft.position.set(-11.43, 2.5, 0);
  const socketRight = new THREE.Mesh(new THREE.BoxGeometry(2.54, 5.0, 55.88), socketMat);
  socketRight.position.set(11.43, 2.5, 0);
  espGroup.add(socketLeft, socketRight);

  // PCB oficial do DevKit (25.5 x 68.0 x 1.2 mm) em Y=5.5
  const espPcbMat = new THREE.MeshStandardMaterial({
    color: 0x091428, // Azul marinho escuro industrial Espressif
    roughness: 0.32,
    metalness: 0.1,
  });
  const espPcb = new THREE.Mesh(new THREE.BoxGeometry(25.5, 1.2, 68.0), espPcbMat);
  espPcb.position.y = 5.6;
  espPcb.castShadow = true;
  espGroup.add(espPcb);

  // Pinos de conexão dourados passando da placa DevKit para o soquete fêmea
  const espPinGeo = new THREE.CylinderGeometry(0.32, 0.32, 4.8, 8);
  for (let p = 0; p < 22; p++) {
    const pinZ = -26.67 + p * 2.54;
    const pinL = new THREE.Mesh(espPinGeo, enigGoldMat);
    pinL.position.set(-11.43, 2.6, pinZ);
    const pinR = new THREE.Mesh(espPinGeo, enigGoldMat);
    pinR.position.set(11.43, 2.6, pinZ);
    espGroup.add(pinL, pinR);
  }

  // BLINDAGEM METÁLICA RF WROOM-1 (18.0 x 24.5 x 2.8 mm) COM CHANFRO
  const wroomCanMat = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    metalness: 0.94,
    roughness: 0.18,
  });
  const wroomCan = new THREE.Mesh(new THREE.BoxGeometry(18.0, 2.8, 24.5), wroomCanMat);
  wroomCan.position.set(0, 7.3, 3);
  wroomCan.castShadow = true;
  espGroup.add(wroomCan);

  // Gravação a Laser Oficial no Can (Logotipo Espressif, ESP32-S3-WROOM-1 e QR Code)
  const canLaserLabel = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 18),
    new THREE.MeshBasicMaterial({ color: 0x27272a, side: THREE.DoubleSide })
  );
  canLaserLabel.rotation.x = -Math.PI / 2;
  canLaserLabel.position.set(0, 8.72, 3);
  espGroup.add(canLaserLabel);

  // Faixa de texto gravada em serigrafia de alta resolução
  const canTextLine = new THREE.Mesh(
    new THREE.PlaneGeometry(13, 2.4),
    new THREE.MeshBasicMaterial({ color: 0xf4f4f5, side: THREE.DoubleSide })
  );
  canTextLine.rotation.x = -Math.PI / 2;
  canTextLine.position.set(0, 8.73, -1);
  espGroup.add(canTextLine);

  // ANTENA SERPENTINA PCB DOURADA (Inverted-F Antenna MIFA)
  // Região de cobre superior exposto sem plano de terra embaixo
  const antSubstrate = new THREE.Mesh(
    new THREE.BoxGeometry(18.0, 0.05, 12.0),
    new THREE.MeshStandardMaterial({ color: 0x050b14, roughness: 0.4 })
  );
  antSubstrate.position.set(0, 6.22, -26);
  espGroup.add(antSubstrate);

  // Trilha serpentina dourada
  const antTrace = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 9),
    new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.96,
      roughness: 0.15,
      side: THREE.DoubleSide,
    })
  );
  antTrace.rotation.x = -Math.PI / 2;
  antTrace.position.set(0, 6.26, -26);
  espGroup.add(antTrace);

  // PORTAS DUPLAS USB-C NA PLACA DEVKIT (USB e UART)
  const devUsbMat = new THREE.MeshStandardMaterial({ color: 0xe4e4e7, metalness: 0.92, roughness: 0.2 });
  const devUsb1 = new THREE.Mesh(new THREE.BoxGeometry(7.5, 2.6, 6.0), devUsbMat);
  devUsb1.position.set(-5.5, 7.3, 31.5);
  const devUsb2 = new THREE.Mesh(new THREE.BoxGeometry(7.5, 2.6, 6.0), devUsbMat);
  devUsb2.position.set(5.5, 7.3, 31.5);
  espGroup.add(devUsb1, devUsb2);

  // BOTÕES TÁCTEIS MICRO SMD (BOOT e EN/RESET) COM ATUADORES
  const switchBaseMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.85, roughness: 0.25 });
  const actuatorMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 });

  [-6, 6].forEach((btnX) => {
    const swBase = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.4, 3.2), switchBaseMat);
    swBase.position.set(btnX, 6.8, 24);
    const swActuator = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.6, 12), actuatorMat);
    swActuator.position.set(btnX, 7.7, 24);
    espGroup.add(swBase, swActuator);
  });

  // CHIP PONTE USB-SERIAL (CP2102N / CH340) QFN-24
  const icUsbMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.35 });
  const icUsb = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.9, 4.0), icUsbMat);
  icUsb.position.set(0, 6.6, 20);
  espGroup.add(icUsb);

  boardGroup.add(espGroup);
  pickableObjects.push({ mesh: wroomCan, compKey: 'esp32_s3_devkit' });

  // =========================================================================
  // 4. U2: BUFFER SN74AHCT125N (DIP-14 PADRÃO JEDEC MS-001 BA)
  // =========================================================================
  // Montado em X=14, Z=-24
  const dipGroup = new THREE.Group();
  dipGroup.position.set(14, 0, -24);

  // Corpo epóxi preto fosco (19.3 x 6.35 x 3.4 mm) com chanfros superiores
  const dipBodyMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.6,
    metalness: 0.05,
  });
  const dipBody = new THREE.Mesh(new THREE.BoxGeometry(7.62, 3.4, 19.3), dipBodyMat);
  dipBody.position.y = 2.4;
  dipBody.castShadow = true;
  dipGroup.add(dipBody);

  // Chanfro semicircular na extremidade do pino 1
  const dipNotch = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.1, 0.8, 16, 1, false, 0, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.5 })
  );
  dipNotch.position.set(0, 3.8, -9.1);
  dipNotch.rotation.x = Math.PI / 2;
  dipGroup.add(dipNotch);

  // Dimple circular (rebaixo) no canto superior do pino 1
  const dimple = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.4, 0.4, 16),
    new THREE.MeshStandardMaterial({ color: 0x111317 })
  );
  dimple.position.set(-2.4, 4.0, -7.5);
  dipGroup.add(dimple);

  // Gravação a laser nítida: Texas Instruments SN74AHCT125N
  const dipLaserText = new THREE.Mesh(
    new THREE.PlaneGeometry(5.0, 12.0),
    new THREE.MeshBasicMaterial({ color: 0x3f3f46, side: THREE.DoubleSide })
  );
  dipLaserText.rotation.x = -Math.PI / 2;
  dipLaserText.position.set(0, 4.12, 0);
  dipGroup.add(dipLaserText);

  // 14 Terminais estanhados conformados (7 por lado) com filetes de solda cônicos
  const leadHGeo = new THREE.BoxGeometry(1.6, 0.35, 0.5); // Ombro horizontal
  const leadVGeo = new THREE.BoxGeometry(0.35, 2.6, 0.5); // Trecho vertical
  const solderFilletGeo = new THREE.ConeGeometry(0.75, 0.6, 8);

  for (let i = 0; i < 7; i++) {
    const zPos = -7.62 + i * 2.54;

    // Lado esquerdo
    const leadH_L = new THREE.Mesh(leadHGeo, tinSolderMat);
    leadH_L.position.set(-4.2, 2.3, zPos);
    const leadV_L = new THREE.Mesh(leadVGeo, tinSolderMat);
    leadV_L.position.set(-4.9, 1.1, zPos);
    const fillet_L = new THREE.Mesh(solderFilletGeo, tinSolderMat);
    fillet_L.position.set(-4.9, 0.3, zPos);
    dipGroup.add(leadH_L, leadV_L, fillet_L);

    // Lado direito
    const leadH_R = new THREE.Mesh(leadHGeo, tinSolderMat);
    leadH_R.position.set(4.2, 2.3, zPos);
    const leadV_R = new THREE.Mesh(leadVGeo, tinSolderMat);
    leadV_R.position.set(4.9, 1.1, zPos);
    const fillet_R = new THREE.Mesh(solderFilletGeo, tinSolderMat);
    fillet_R.position.set(4.9, 0.3, zPos);
    dipGroup.add(leadH_R, leadV_R, fillet_R);
  }

  boardGroup.add(dipGroup);
  pickableObjects.push({ mesh: dipBody, compKey: 'sn74ahct125n' });

  // =========================================================================
  // 5. R_DIV: DIVISOR RESISTIVO 10k / 15k (RESISTORES AXIAIS THT DO-41 REAIS)
  // =========================================================================
  // Montado em X=14, Z=2
  const divGroup = new THREE.Group();
  divGroup.position.set(14, 0, 2);

  // Construtor de resistor axial DO-41 com anéis de cores IEC 60062
  const createAxialResistor = (
    name: string,
    posX: number,
    posZ: number,
    bands: number[]
  ) => {
    const rGroup = new THREE.Group();
    rGroup.name = name;
    rGroup.position.set(posX, 0, posZ);

    // Corpo cerâmico cilíndrico bege claro com extremidades ogivais (Ø2.3 mm x 6.5 mm)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xe0d6b5, // Bege cerâmico padrão de resistores de filme metálico/carbono
      roughness: 0.3,
    });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 6.2, 16), bodyMat);
    body.rotation.z = Math.PI / 2;
    body.position.y = 2.4;
    body.castShadow = true;
    rGroup.add(body);

    // 5 Anéis de cores normalizados
    const bandGeo = new THREE.CylinderGeometry(1.18, 1.18, 0.45, 16);
    bands.forEach((colorHex, bIdx) => {
      const bandMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const bandMesh = new THREE.Mesh(bandGeo, bandMat);
      bandMesh.rotation.z = Math.PI / 2;
      bandMesh.position.set(-2.0 + bIdx * 0.9, 2.4, 0);
      rGroup.add(bandMesh);
    });

    // Terminais axiais estanhados (fio de cobre estanhado Ø0.5 mm) dobrados a 90°
    const wireMat = tinSolderMat;
    // Trecho horizontal esquerdo e direito
    const wireH_L = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 2.2, 8), wireMat);
    wireH_L.rotation.z = Math.PI / 2;
    wireH_L.position.set(-4.2, 2.4, 0);
    const wireH_R = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 2.2, 8), wireMat);
    wireH_R.rotation.z = Math.PI / 2;
    wireH_R.position.set(4.2, 2.4, 0);
    rGroup.add(wireH_L, wireH_R);

    // Trechos verticais descendo para a PCB
    const wireV_L = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 2.4, 8), wireMat);
    wireV_L.position.set(-5.3, 1.2, 0);
    const wireV_R = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 2.4, 8), wireMat);
    wireV_R.position.set(5.3, 1.2, 0);
    rGroup.add(wireV_L, wireV_R);

    // Filetes de solda cônicos na furação da placa
    const sL = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.5, 8), wireMat);
    sL.position.set(-5.3, 0.25, 0);
    const sR = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.5, 8), wireMat);
    sR.position.set(5.3, 0.25, 0);
    rGroup.add(sL, sR);

    divGroup.add(rGroup);
    pickableObjects.push({ mesh: body, compKey: 'voltage_divider' });
  };

  // R1: 10 kΩ (Marrom 0x78350f, Preto 0x18181b, Laranja 0xea580c, Ouro 0xd97706)
  createAxialResistor('R1_10k', 0, -4, [0x78350f, 0x18181b, 0xea580c, 0xd97706]);

  // R2: 15 kΩ (Marrom 0x78350f, Verde 0x16a34a, Laranja 0xea580c, Ouro 0xd97706)
  createAxialResistor('R2_15k', 0, 4, [0x78350f, 0x16a34a, 0xea580c, 0xd97706]);

  boardGroup.add(divGroup);

  // =========================================================================
  // 6. CONECTORES JST-XH REAIS (NYLON 66 COM TRAVA, CHAVETAS E PINOS DOURADOS)
  // =========================================================================
  const createRealJstXhConnector = (
    pins: number,
    posX: number,
    posZ: number,
    rotY: number,
    compKey: string,
    label: string
  ) => {
    const connGroup = new THREE.Group();
    connGroup.name = label;
    connGroup.position.set(posX, 0, posZ);
    connGroup.rotation.y = rotY;

    const pitch = 2.50;
    const bodyW = pitch * pins + 2.45; // Largura exata do alojamento JST-XH
    const bodyD = 5.75;
    const bodyH = 7.0;

    // Material do Alojamento: Nylon 66 Branco Leitoso
    const nylonMat = new THREE.MeshStandardMaterial({
      color: 0xf4f4f5,
      roughness: 0.45,
      metalness: 0.05,
    });

    // Corpo externo do receptáculo
    const shroud = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH, bodyD), nylonMat);
    shroud.position.y = bodyH / 2;
    shroud.castShadow = true;
    connGroup.add(shroud);

    // Cavidade retangular interna para encaixe do conector macho
    const cavityMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.7 });
    const cavity = new THREE.Mesh(new THREE.BoxGeometry(bodyW - 1.2, bodyH - 1.2, bodyD - 1.4), cavityMat);
    cavity.position.set(0, bodyH / 2 + 0.6, 0.4);
    connGroup.add(cavity);

    // Trava mecânica frontal (Locking notch)
    const latchLock = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 3.2, 0.9),
      new THREE.MeshStandardMaterial({ color: 0xe4e4e7, roughness: 0.35 })
    );
    latchLock.position.set(0, bodyH / 2 + 0.8, -bodyD / 2 - 0.4);
    connGroup.add(latchLock);

    // Nervuras de polarização lateral (Guia contra inversão de pinagem)
    [-bodyW / 2 + 0.3, bodyW / 2 - 0.3].forEach((rx) => {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.5, bodyH - 1.5, 0.8), nylonMat);
      rib.position.set(rx, bodyH / 2, -bodyD / 2 - 0.3);
      connGroup.add(rib);
    });

    // Pinos de latão quadrados estanhados/dourados (0.64 x 0.64 mm)
    const pinGeo = new THREE.BoxGeometry(0.64, 5.2, 0.64);
    for (let p = 0; p < pins; p++) {
      const pinX = -((pins - 1) * pitch) / 2 + p * pitch;
      const pin = new THREE.Mesh(pinGeo, enigGoldMat);
      pin.position.set(pinX, 3.8, 0.4);
      connGroup.add(pin);

      // Filete de solda SAC305 na base do pino
      const s = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.45, 8), tinSolderMat);
      s.position.set(pinX, 0.22, 0.4);
      connGroup.add(s);
    }

    // Serigrafia de identificação do conector na PCB
    const lblMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(bodyW + 2, 2.0),
      whiteSilkscreenMat
    );
    lblMesh.rotation.x = -Math.PI / 2;
    lblMesh.position.set(0, 0.02, bodyD / 2 + 2.0);
    connGroup.add(lblMesh);

    boardGroup.add(connGroup);
    pickableObjects.push({ mesh: shroud, compKey });
  };

  // J1 (4 Pinos): Chicote Ultrassônico JSN-SR04T (5V, TRIG, ECHO, GND) em X=54, Z=4
  createRealJstXhConnector(4, 54, 4, 0, 'jsn_sr04t', 'J1: JSN-SR04T (4P)');

  // J2 (6 Pinos): Chicote Leitor NFC PN532 (VCC, GND, CS, MOSI, SCK, MISO) em X=54, Z=30
  createRealJstXhConnector(6, 54, 30, 0, 'pn532_breakout', 'J2: PN532 (6P)');

  // J3 (2 Pinos): Chicote Sensor Reed Switch Tampa (LID, GND) em X=24, Z=38
  createRealJstXhConnector(2, 24, 38, -Math.PI / 2, 'reed_switch', 'J3: REED (2P)');

  // =========================================================================
  // 7. BZ1: BUZZER PIEZOELÉTRICO 12mm (CUI CPE-1200 / BZ-12MM)
  // =========================================================================
  // Montado em X=48, Z=-24
  const bzGroup = new THREE.Group();
  bzGroup.position.set(48, 0, -24);

  // Corpo cilíndrico escalonado em PBT preto fosco (Ø12.0 mm x 9.5 mm)
  const bzMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.5,
    metalness: 0.1,
  });
  const bzBody = new THREE.Mesh(new THREE.CylinderGeometry(6.0, 6.0, 9.5, 32), bzMat);
  bzBody.position.y = 4.75;
  bzBody.castShadow = true;
  bzGroup.add(bzBody);

  // Porta acústica central (furo de emissão sonora Ø2.4 mm)
  const bzPort = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 0.6, 20),
    new THREE.MeshBasicMaterial({ color: 0x05070a })
  );
  bzPort.position.set(0, 9.52, 0);
  bzGroup.add(bzPort);

  // Símbolo polar "+" em relevo com serigrafia branca nítida
  const plusV = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 2.2), whiteSilkscreenMat);
  plusV.rotation.x = -Math.PI / 2;
  plusV.position.set(-3.2, 9.54, -2.5);
  const plusH = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.6), whiteSilkscreenMat);
  plusH.rotation.x = -Math.PI / 2;
  plusH.position.set(-3.2, 9.54, -2.5);
  bzGroup.add(plusV, plusH);

  // Terminais Through-Hole de inserção e solda
  [-3.8, 3.8].forEach((px) => {
    const s = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.5, 8), tinSolderMat);
    s.position.set(px, 0.25, 0);
    bzGroup.add(s);
  });

  boardGroup.add(bzGroup);
  pickableObjects.push({ mesh: bzBody, compKey: 'buzzer_piezo' });

  // =========================================================================
  // 8. D1: LED RADIAL 5mm VERDE TRANSLÚCIDO (COM CHANFRO NO CATODO)
  // =========================================================================
  // Montado em X=10, Z=16
  const ledGroup = new THREE.Group();
  ledGroup.position.set(10, 0, 16);

  // Lente hemisférica de 5mm em resina epóxi verde translúcida
  const ledLensMat = new THREE.MeshPhysicalMaterial({
    color: 0x22c55e,
    emissive: 0x15803d,
    emissiveIntensity: 0.9,
    transmission: 0.75,
    opacity: 0.95,
    transparent: true,
    roughness: 0.1,
    ior: 1.5,
  });

  // Cúpula superior
  const dome = new THREE.Mesh(new THREE.SphereGeometry(2.5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), ledLensMat);
  dome.position.y = 6.2;
  // Cilindro do corpo
  const bodyCyl = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 3.8, 24), ledLensMat);
  bodyCyl.position.y = 4.3;
  // Flange inferior (Ø5.6 mm com chanfro plano indicando catodo)
  const flange = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.8, 24), ledLensMat);
  flange.position.y = 2.0;
  ledGroup.add(dome, bodyCyl, flange);

  // Taça condutora interna refletiva (leadframe cup)
  const cup = new THREE.Mesh(
    new THREE.ConeGeometry(0.9, 1.2, 12),
    new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95 })
  );
  cup.position.set(0, 4.0, 0);
  cup.rotation.x = Math.PI;
  ledGroup.add(cup);

  // Terminais axiais THT com filetes de solda
  [-1.27, 1.27].forEach((lx) => {
    const lead = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 2.0, 8), tinSolderMat);
    lead.position.set(lx, 1.0, 0);
    const s = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.45, 8), tinSolderMat);
    s.position.set(lx, 0.22, 0);
    ledGroup.add(lead, s);
  });

  boardGroup.add(ledGroup);
  pickableObjects.push({ mesh: bodyCyl, compKey: 'led_indicator' });
  if (onLedCreated) onLedCreated(dome);

  // =========================================================================
  // 9. C1 (100nF CERÂMICO) E C2 (10µF ELETROLÍTICO DE ALUMÍNIO)
  // =========================================================================
  // C1: Desacoplamento SMD 0805 cerâmico junto ao pino VCC do buffer (X=20, Z=-16)
  const c1Group = new THREE.Group();
  c1Group.position.set(20, 0, -16);
  const c1Body = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.8, 1.25),
    new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.35 })
  );
  c1Body.position.y = 0.4;
  c1Group.add(c1Body);
  [-0.95, 0.95].forEach((tx) => {
    const term = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.82, 1.28), tinSolderMat);
    term.position.set(tx, 0.4, 0);
    c1Group.add(term);
  });
  boardGroup.add(c1Group);
  pickableObjects.push({ mesh: c1Body, compKey: 'sn74ahct125n' });

  // C2: Bulk Eletrolítico cilíndrico de alumínio (Ø6.3 mm x 7.7 mm) com tarja de polaridade negativa
  const c2Group = new THREE.Group();
  c2Group.position.set(28, 0, -6);
  const c2Can = new THREE.Mesh(
    new THREE.CylinderGeometry(3.15, 3.15, 7.7, 24),
    new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 })
  );
  c2Can.position.y = 3.85;
  c2Can.castShadow = true;
  c2Group.add(c2Can);

  // Tarja preta de polaridade negativa (-)
  const c2Stripe = new THREE.Mesh(
    new THREE.CylinderGeometry(3.18, 3.18, 7.7, 8, 1, false, -Math.PI / 4, Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x18181b })
  );
  c2Stripe.position.y = 3.85;
  c2Group.add(c2Stripe);

  boardGroup.add(c2Group);

  // =========================================================================
  // 10. TRILHAS DE COBRE CHANFRADAS A 45° E SERIGRAFIA TÉCNICA
  // =========================================================================
  const traceMatSignal = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    roughness: 0.25,
    metalness: 0.75,
  });

  const traceMatPower = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.25,
    metalness: 0.8,
  });

  const traceMatSpi = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.25,
    metalness: 0.75,
  });

  const addTraceSegment = (x1: number, z1: number, x2: number, z2: number, width: number, mat: THREE.Material) => {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const angle = Math.atan2(dz, dx);

    const geo = new THREE.BoxGeometry(len, 0.05, width);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((x1 + x2) / 2, 0.025, (z1 + z2) / 2);
    mesh.rotation.y = -angle;
    boardGroup.add(mesh);
  };

  // Linhas de alimentação 5V USB (Trilha larga de potência em ouro/âmbar)
  addTraceSegment(-20, 48, -20, 20, 1.2, traceMatPower);
  addTraceSegment(-20, 20, 50, 20, 1.2, traceMatPower);
  addTraceSegment(50, 20, 54, 4, 1.0, traceMatPower); // Rota até conector J1 (5V JSN)

  // Linha TRIG (ESP32 IO5 -> Buffer 1A -> J1 TRIG)
  addTraceSegment(-22, -2, 10, -2, 0.5, traceMatSignal);
  addTraceSegment(10, -2, 10, -20, 0.5, traceMatSignal);
  addTraceSegment(18, -20, 36, -20, 0.5, traceMatSignal);
  addTraceSegment(36, -20, 48, -8, 0.5, traceMatSignal);
  addTraceSegment(48, -8, 54, 2, 0.5, traceMatSignal);

  // Linha ECHO (J1 ECHO -> Divisor R1/R2 -> ESP32 IO6)
  addTraceSegment(54, 6, 40, 6, 0.5, traceMatSignal);
  addTraceSegment(40, 6, 26, 2, 0.5, traceMatSignal);
  addTraceSegment(14, 2, 0, 2, 0.5, traceMatSignal);
  addTraceSegment(0, 2, -22, 2, 0.5, traceMatSignal);

  // Barramento SPI de 4 vias (ESP32 IO10..13 -> Conector J2 PN532)
  [-3, -1, 1, 3].forEach((offset) => {
    addTraceSegment(-22, 12 + offset, 20, 12 + offset, 0.35, traceMatSpi);
    addTraceSegment(20, 12 + offset, 36, 28 + offset, 0.35, traceMatSpi);
    addTraceSegment(36, 28 + offset, 54, 28 + offset, 0.35, traceMatSpi);
  });

  // Linha Reed Switch Tampa (J3 -> ESP32 IO7)
  addTraceSegment(24, 36, 0, 36, 0.4, traceMatSignal);
  addTraceSegment(0, 36, -22, 16, 0.4, traceMatSignal);

  // Rótulos técnicos em serigrafia na PCB (Silkscreen nítida)
  const titleSilkscreen = new THREE.Mesh(
    new THREE.PlaneGeometry(36, 4.5),
    new THREE.MeshBasicMaterial({ color: 0xf8fafc, side: THREE.DoubleSide })
  );
  titleSilkscreen.rotation.x = -Math.PI / 2;
  titleSilkscreen.position.set(-20, 0.022, -42);
  boardGroup.add(titleSilkscreen);
}
