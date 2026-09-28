/**
 * FuelGuard Virtual Test Bench — Modelador 3D Realista do RP2040 Motor Controller (imrishabh18)
 * Constrói o gêmeo tridimensional fiel em escala 1:1 (42.30 x 42.32 x 1.6 mm) da placa oficial:
 * - Substrato NEMA 17 Cap de 4 camadas FR-4 com cantos chanfrados a 45°
 * - 4 anéis de fixação M3.3 ENIG (padrão 31x31 mm)
 * - Conectores USB-C duplos de borda (PD 12V e Serial)
 * - Microcontrolador RP2040 QFN-56 com 56 pads perimétricos e solda SAC305
 * - Driver de passo duplo DRV8847 HTSSOP-16 com PowerPAD térmico
 * - Shunts de corrente e amplificadores INA241A1
 * - Sensor de temperatura TMP102 acoplado termicamente ao driver
 * - Capacitor de tântalo polímero 220 µF (Case D) TCJD227
 * - Conector JST-PH 4 pinos (passo 2.0 mm) para fases do motor
 * - Buzzer magnético SMD HYG-8503A e LED RGB de status de 3 cores
 */

import * as THREE from 'three';

export interface Rp20403DMaterials {
  pcbMat: THREE.Material;
  enigGoldMat: THREE.Material;
  tinSolderMat: THREE.Material;
  whiteSilkscreenMat: THREE.Material;
  edgeMat: THREE.Material;
}

export function buildRp2040Board(
  boardGroup: THREE.Group,
  pickableObjects: { mesh: THREE.Object3D; compKey: string }[],
  materials: Rp20403DMaterials,
  onLedCreated?: (ledMesh: THREE.Mesh) => void
): void {
  const { pcbMat, enigGoldMat, tinSolderMat, whiteSilkscreenMat, edgeMat } = materials;

  const width = 42.30;
  const height = 42.32;
  const thickness = 1.6;
  const hw = width / 2; // 21.15
  const hh = height / 2; // 21.16
  const c = 4.6; // Tamanho do chanfro a 45 graus dos cantos

  // 1. Substrato Poligonal Chamfered NEMA 17 Cap (Octógono)
  const shape = new THREE.Shape();
  shape.moveTo(-hw + c, -hh);
  shape.lineTo(hw - c, -hh);
  shape.lineTo(hw, -hh + c);
  shape.lineTo(hw, hh - c);
  shape.lineTo(hw - c, hh);
  shape.lineTo(-hw + c, hh);
  shape.lineTo(-hw, hh - c);
  shape.lineTo(-hw, -hh + c);
  shape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: thickness,
    bevelEnabled: false,
  };
  const pcbGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
  pcbMesh.rotation.x = Math.PI / 2;
  pcbMesh.position.y = 0;
  pcbMesh.castShadow = true;
  pcbMesh.receiveShadow = true;
  boardGroup.add(pcbMesh);

  // Núcleo de fibra de vidro visível nas bordas (borda chanfrada de 4 camadas)
  const edgeTrimMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: thickness - 0.15, bevelEnabled: false }),
    edgeMat
  );
  edgeTrimMesh.rotation.x = Math.PI / 2;
  edgeTrimMesh.position.y = -0.075;
  boardGroup.add(edgeTrimMesh);

  // 2. Furos de Montagem M3 nos 4 Cantos (Padrão 31 x 31 mm)
  const holeCoords: [number, number][] = [
    [-15.5, -15.5],
    [15.5, -15.5],
    [-15.5, 15.5],
    [15.5, 15.5],
  ];
  const holeCutoutGeo = new THREE.CylinderGeometry(1.65, 1.65, thickness + 0.3, 20);
  const holeCutoutMat = new THREE.MeshBasicMaterial({ color: 0x06090d });
  const ringPadGeo = new THREE.RingGeometry(1.65, 3.2, 24);

  holeCoords.forEach(([hx, hz]) => {
    const holeMesh = new THREE.Mesh(holeCutoutGeo, holeCutoutMat);
    holeMesh.position.set(hx, -thickness / 2, hz);
    boardGroup.add(holeMesh);

    // Pad superior ENIG
    const ringTop = new THREE.Mesh(ringPadGeo, enigGoldMat);
    ringTop.rotation.x = -Math.PI / 2;
    ringTop.position.set(hx, 0.01, hz);
    boardGroup.add(ringTop);

    // Pad inferior ENIG
    const ringBottom = new THREE.Mesh(ringPadGeo, enigGoldMat);
    ringBottom.rotation.x = Math.PI / 2;
    ringBottom.position.set(hx, -thickness - 0.01, hz);
    boardGroup.add(ringBottom);
  });

  // Marcas Fiduciais nos cantos
  [
    [-17.5, -11.0],
    [17.5, -11.0],
    [-17.5, 11.0],
  ].forEach(([fx, fz]) => {
    const fiducial = new THREE.Mesh(new THREE.CircleGeometry(0.5, 16), enigGoldMat);
    fiducial.rotation.x = -Math.PI / 2;
    fiducial.position.set(fx, 0.02, fz);
    boardGroup.add(fiducial);
  });

  // 3. Conectores USB-C Duplos de Borda (Topo da Placa: Z = -18.5)
  // J_PD (Alimentação 12V USB-PD) e J_USB (Programação / Dados MCU)
  const usbShellMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    metalness: 0.95,
    roughness: 0.15,
  });

  const createUsbCReceptacle = (posX: number, _label: string) => {
    const usbGroup = new THREE.Group();
    usbGroup.position.set(posX, 0, -18.5);

    // Carcaça de aço inoxidável chanfrada
    const shell = new THREE.Mesh(new THREE.BoxGeometry(8.94, 3.16, 7.35), usbShellMat);
    shell.position.set(0, 1.58, -0.8);
    shell.castShadow = true;
    usbGroup.add(shell);

    // Cavidade preta frontal
    const cavity = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 1.8, 2.0),
      new THREE.MeshBasicMaterial({ color: 0x090d14 })
    );
    cavity.position.set(0, 1.58, -4.5);
    usbGroup.add(cavity);

    // Língua interna central dourada
    const tongue = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 0.5, 4.0),
      new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.85, roughness: 0.25 })
    );
    tongue.position.set(0, 1.58, -3.2);
    usbGroup.add(tongue);

    // Terminais de ancoragem laterais com filetes de solda SAC305
    const tabGeo = new THREE.BoxGeometry(1.2, 1.0, 1.8);
    const tab1 = new THREE.Mesh(tabGeo, tinSolderMat);
    tab1.position.set(-4.8, 0.4, 0);
    const tab2 = new THREE.Mesh(tabGeo, tinSolderMat);
    tab2.position.set(4.8, 0.4, 0);
    usbGroup.add(tab1, tab2);

    boardGroup.add(usbGroup);
    pickableObjects.push({ mesh: shell, compKey: 'usbc_dual_connectors' });
  };

  createUsbCReceptacle(-10.5, 'J_PD');
  createUsbCReceptacle(5.5, 'J_USB');

  // 4. Microcontrolador RP2040 QFN-56 (U1: X = -4.5, Z = 3.5)
  const rp2040Group = new THREE.Group();
  rp2040Group.position.set(-4.5, 0, 3.5);

  const qfnMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.45,
    metalness: 0.15,
  });

  const qfnBody = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.9, 7.0), qfnMat);
  qfnBody.position.y = 0.45;
  qfnBody.castShadow = true;
  rp2040Group.add(qfnBody);

  // Marcador de Pino 1
  const dotPin1 = new THREE.Mesh(new THREE.CircleGeometry(0.35, 12), whiteSilkscreenMat);
  dotPin1.rotation.x = -Math.PI / 2;
  dotPin1.position.set(-2.6, 0.91, -2.6);
  rp2040Group.add(dotPin1);

  // Inscrição gravada a laser no encapsulamento
  const chipLabel = new THREE.Mesh(
    new THREE.PlaneGeometry(5.2, 3.0),
    new THREE.MeshBasicMaterial({ color: 0x334155, side: THREE.DoubleSide })
  );
  chipLabel.rotation.x = -Math.PI / 2;
  chipLabel.position.set(0, 0.91, 0.2);
  rp2040Group.add(chipLabel);

  // 56 Terminais QFN com filetes de solda (14 por lado)
  const qfnPinGeo = new THREE.BoxGeometry(0.25, 0.35, 0.6);
  for (let i = 0; i < 14; i++) {
    const offset = -2.6 + i * 0.4;
    // Lado esquerdo e direito
    const pinL = new THREE.Mesh(qfnPinGeo, tinSolderMat);
    pinL.position.set(-3.6, 0.15, offset);
    const pinR = new THREE.Mesh(qfnPinGeo, tinSolderMat);
    pinR.position.set(3.6, 0.15, offset);
    rp2040Group.add(pinL, pinR);

    // Lado superior e inferior
    const pinT = new THREE.Mesh(qfnPinGeo, tinSolderMat);
    pinT.rotation.y = Math.PI / 2;
    pinT.position.set(offset, 0.15, -3.6);
    const pinB = new THREE.Mesh(qfnPinGeo, tinSolderMat);
    pinB.rotation.y = Math.PI / 2;
    pinB.position.set(offset, 0.15, 3.6);
    rp2040Group.add(pinT, pinB);
  }

  boardGroup.add(rp2040Group);
  pickableObjects.push({ mesh: qfnBody, compKey: 'rp2040_mcu' });

  // 5. Driver de Motor de Passo Duplo DRV8847 (U_DRIVER: X = 8.5, Z = 2.5)
  const drvGroup = new THREE.Group();
  drvGroup.position.set(8.5, 0, 2.5);

  const htssopBody = new THREE.Mesh(
    new THREE.BoxGeometry(5.0, 1.15, 4.4),
    new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 })
  );
  htssopBody.position.y = 0.58;
  htssopBody.castShadow = true;
  drvGroup.add(htssopBody);

  // Terminais gull-wing com solda SAC305
  const gullLeadGeo = new THREE.BoxGeometry(1.0, 0.25, 0.28);
  for (let i = 0; i < 8; i++) {
    const zPos = -1.75 + i * 0.5;
    const leadL = new THREE.Mesh(gullLeadGeo, tinSolderMat);
    leadL.position.set(-2.8, 0.2, zPos);
    const leadR = new THREE.Mesh(gullLeadGeo, tinSolderMat);
    leadR.position.set(2.8, 0.2, zPos);
    drvGroup.add(leadL, leadR);
  }

  boardGroup.add(drvGroup);
  pickableObjects.push({ mesh: htssopBody, compKey: 'drv8847_driver' });

  // 6. Amplificadores de Corrente INA241A1 e Shunts 1206
  const createCurrentSenseChannel = (posX: number, posZ: number, _label: string) => {
    const senseGroup = new THREE.Group();
    senseGroup.position.set(posX, 0, posZ);

    // IC SOT-23 (INA241A1)
    const sotBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.9, 1.1, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35 })
    );
    sotBody.position.y = 0.55;
    senseGroup.add(sotBody);

    // Shunt de Potência 1206 (0.10 Ohm, 1W)
    const shuntBody = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.6, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 })
    );
    shuntBody.position.set(0, 0.35, 2.8);
    senseGroup.add(shuntBody);

    // Terminais prateados do shunt
    const shuntTerm = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.62, 1.64), tinSolderMat);
    const st1 = shuntTerm.clone();
    st1.position.set(-1.4, 0.35, 2.8);
    const st2 = shuntTerm.clone();
    st2.position.set(1.4, 0.35, 2.8);
    senseGroup.add(st1, st2);

    boardGroup.add(senseGroup);
    pickableObjects.push({ mesh: sotBody, compKey: 'ina241_current_sense' });
  };

  createCurrentSenseChannel(13.0, 7.5, 'SENSE_A');
  createCurrentSenseChannel(13.0, -2.5, 'SENSE_B');

  // 7. Sensor de Temperatura TMP102 (U_TEMP: X = 8.5, Z = -6.5)
  const tmpGroup = new THREE.Group();
  tmpGroup.position.set(8.5, 0, -6.5);

  const sot563Body = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.6, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
  );
  sot563Body.position.y = 0.3;
  tmpGroup.add(sot563Body);

  // Plano de acoplamento térmico de cobre até o driver
  const thermalTrace = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 4.0), enigGoldMat);
  thermalTrace.rotation.x = -Math.PI / 2;
  thermalTrace.position.set(0, 0.02, 2.2);
  tmpGroup.add(thermalTrace);

  boardGroup.add(tmpGroup);
  pickableObjects.push({ mesh: sot563Body, compKey: 'tmp102_temp_sensor' });

  // 8. Capacitor de Tântalo Polímero 220 µF Case D (C_BULK: X = -14.5, Z = 6.0)
  const capGroup = new THREE.Group();
  capGroup.position.set(-14.5, 0, 6.0);

  // Corpo em tom característico laranja/pêssego cerâmico do TCJD227
  const capBody = new THREE.Mesh(
    new THREE.BoxGeometry(7.3, 2.9, 4.3),
    new THREE.MeshStandardMaterial({
      color: 0xd97706, // Tom âmbar/tântalo característico
      roughness: 0.35,
    })
  );
  capBody.position.y = 1.45;
  capBody.castShadow = true;
  capGroup.add(capBody);

  // Faixa dourada polarizadora indicando terminal positivo
  const polStripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 2.92, 4.32),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, metalness: 0.8, roughness: 0.2 })
  );
  polStripe.position.set(-3.0, 1.45, 0);
  capGroup.add(polStripe);

  // Terminais metálicos soldados
  const capTermGeo = new THREE.BoxGeometry(0.8, 2.8, 4.2);
  const ct1 = new THREE.Mesh(capTermGeo, tinSolderMat);
  ct1.position.set(-3.7, 1.4, 0);
  const ct2 = new THREE.Mesh(capTermGeo, tinSolderMat);
  ct2.position.set(3.7, 1.4, 0);
  capGroup.add(ct1, ct2);

  boardGroup.add(capGroup);
  pickableObjects.push({ mesh: capBody, compKey: 'tcjd227_bulk_cap' });

  // 9. Conector JST PH 4 Pinos (Passo 2.0 mm) para Motor de Passo (X = 13.0, Z = -14.5)
  const jstGroup = new THREE.Group();
  jstGroup.position.set(13.0, 0, -14.5);

  const jstMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9, // Nylon branco natural
    roughness: 0.38,
  });

  // Alojamento polarizado com guia
  const jstHousing = new THREE.Mesh(new THREE.BoxGeometry(9.9, 6.0, 4.5), jstMat);
  jstHousing.position.y = 3.0;
  jstHousing.castShadow = true;
  jstGroup.add(jstHousing);

  // Abertura superior interna
  const jstCavity = new THREE.Mesh(
    new THREE.BoxGeometry(8.5, 4.5, 3.2),
    new THREE.MeshBasicMaterial({ color: 0x090d14 })
  );
  jstCavity.position.set(0, 4.0, 0);
  jstGroup.add(jstCavity);

  // 4 Pinos dourados internos (passo 2.0 mm)
  const pinGeo = new THREE.BoxGeometry(0.5, 4.2, 0.5);
  for (let i = 0; i < 4; i++) {
    const xPos = -3.0 + i * 2.0;
    const pin = new THREE.Mesh(pinGeo, enigGoldMat);
    pin.position.set(xPos, 3.2, 0);
    jstGroup.add(pin);
  }

  // Rótulos de fases serigrafados A+, A-, B+, B-
  const jstLabel = new THREE.Mesh(
    new THREE.PlaneGeometry(8.5, 2.0),
    new THREE.MeshBasicMaterial({ color: 0x94a3b8, side: THREE.DoubleSide })
  );
  jstLabel.rotation.x = -Math.PI / 2;
  jstLabel.position.set(0, 0.02, 3.2);
  jstGroup.add(jstLabel);

  boardGroup.add(jstGroup);
  pickableObjects.push({ mesh: jstHousing, compKey: 'jst_ph_motor_connector' });

  // 10. Buzzer Magnético SMD HYG-8503A (BZ1: X = 4.5, Z = -14.5)
  const bzGroup = new THREE.Group();
  bzGroup.position.set(4.5, 0, -14.5);

  // Corpo cilíndrico de 8.5 x 8.5 x 3.0 mm
  const bzBody = new THREE.Mesh(
    new THREE.CylinderGeometry(4.25, 4.25, 3.0, 24),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
  );
  bzBody.position.y = 1.5;
  bzBody.castShadow = true;
  bzGroup.add(bzBody);

  // Abertura acústica central
  const soundHole = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 0.4, 16),
    new THREE.MeshBasicMaterial({ color: 0x0f172a })
  );
  soundHole.position.y = 3.05;
  bzGroup.add(soundHole);

  // Marcação "+" de polaridade serigrafada no topo
  const plusH = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), whiteSilkscreenMat);
  plusH.rotation.x = -Math.PI / 2;
  plusH.position.set(2.2, 3.02, -1.8);
  const plusV = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 1.6), whiteSilkscreenMat);
  plusV.rotation.x = -Math.PI / 2;
  plusV.position.set(2.2, 3.02, -1.8);
  bzGroup.add(plusH, plusV);

  boardGroup.add(bzGroup);
  pickableObjects.push({ mesh: bzBody, compKey: 'hyg_buzzer' });

  // 11. LED RGB de Status (D_STATUS) e LED de Power
  const rgbGroup = new THREE.Group();
  rgbGroup.position.set(-14.5, 0, -2.5);

  const rgbBody = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.55, 1.5),
    new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      transmission: 0.7,
      thickness: 0.5,
    })
  );
  rgbBody.position.y = 0.35;
  rgbGroup.add(rgbBody);

  if (onLedCreated) {
    onLedCreated(rgbBody);
  }

  boardGroup.add(rgbGroup);
  pickableObjects.push({ mesh: rgbBody, compKey: 'rgb_status_led' });

  // LED de Power (D_PWR: verde)
  const pwrLed = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.5, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x16a34a, emissiveIntensity: 0.9 })
  );
  pwrLed.position.set(-5.5, 0.3, -13.5);
  boardGroup.add(pwrLed);

  // 12. Botões Táteis SMD (BOOT e RUN)
  const btnMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });
  const plungerMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });

  const createTactileBtn = (bx: number, bz: number, _name: string) => {
    const btnGrp = new THREE.Group();
    btnGrp.position.set(bx, 0, bz);

    const base = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.4, 2.8), btnMat);
    base.position.y = 0.7;
    btnGrp.add(base);

    const plunger = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.6, 16), plungerMat);
    plunger.position.y = 1.6;
    btnGrp.add(plunger);

    boardGroup.add(btnGrp);
  };

  createTactileBtn(-10.5, -9.5, 'BOOT');
  createTactileBtn(5.5, 11.5, 'RUN');

  // 13. Cristal Oscilador 12 MHz (Y1)
  const xtalMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    metalness: 0.9,
    roughness: 0.2,
  });
  const xtalMesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.8, 2.5), xtalMat);
  xtalMesh.position.set(-0.5, 0.4, 11.5);
  boardGroup.add(xtalMesh);

  // 14. Matriz Realista de Passivos 0402 e Vias de Cobre
  const cap0402Mat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.4 }); // Cerâmico tan
  const res0402Mat = new THREE.MeshStandardMaterial({ color: 0x090d14, roughness: 0.5 }); // Preto fosco

  const passivePositions: [number, number, 'res' | 'cap'][] = [
    [-8.0, 3.5, 'cap'],
    [-8.0, 5.0, 'cap'],
    [-1.0, -1.0, 'cap'],
    [-1.0, 7.5, 'cap'],
    [2.5, 3.5, 'cap'],
    [2.5, 5.5, 'cap'],
    [4.5, -5.0, 'res'],
    [4.5, -6.5, 'res'],
    [-12.0, 11.0, 'res'],
    [-9.5, 11.0, 'cap'],
    [-7.0, 11.0, 'cap'],
    [10.5, 11.0, 'res'],
    [13.0, 11.0, 'cap'],
    [10.5, -10.0, 'res'],
    [12.5, -10.0, 'cap'],
    [-14.5, -6.5, 'res'],
    [-14.5, -8.0, 'res'],
    [-14.5, -11.0, 'res'],
  ];

  passivePositions.forEach(([px, pz, type]) => {
    const grp = new THREE.Group();
    grp.position.set(px, 0, pz);

    const bodyGeo = new THREE.BoxGeometry(1.0, 0.45, 0.5);
    const bodyMesh = new THREE.Mesh(bodyGeo, type === 'cap' ? cap0402Mat : res0402Mat);
    bodyMesh.position.y = 0.25;
    grp.add(bodyMesh);

    // Terminais de solda laterais
    const termGeo = new THREE.BoxGeometry(0.22, 0.46, 0.52);
    const tL = new THREE.Mesh(termGeo, tinSolderMat);
    tL.position.set(-0.45, 0.25, 0);
    const tR = new THREE.Mesh(termGeo, tinSolderMat);
    tR.position.set(0.45, 0.25, 0);
    grp.add(tL, tR);

    boardGroup.add(grp);
  });

  // Vias de Cobre ENIG na Superfície
  const viaPositions: [number, number][] = [
    [-6.5, -0.5],
    [-6.5, 7.5],
    [-2.5, -0.5],
    [-2.5, 7.5],
    [6.5, -0.5],
    [6.5, 5.5],
    [10.5, 0.5],
    [10.5, 4.5],
    [-12.0, 2.5],
    [-12.0, 0.0],
    [15.5, 3.5],
    [15.5, 0.5],
  ];

  viaPositions.forEach(([vx, vz]) => {
    const viaMesh = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.38, 12), enigGoldMat);
    viaMesh.rotation.x = -Math.PI / 2;
    viaMesh.position.set(vx, 0.015, vz);
    boardGroup.add(viaMesh);
  });

  // 15. Inscrições de Serigrafia em Branco Nítido
  const silkPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(28, 3.5),
    new THREE.MeshBasicMaterial({ color: 0xf8fafc, side: THREE.DoubleSide })
  );
  silkPlane.rotation.x = -Math.PI / 2;
  silkPlane.position.set(0, 0.02, 18.5);
  boardGroup.add(silkPlane);
}
