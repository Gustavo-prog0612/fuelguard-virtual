/**
 * FuelGuard Virtual Test Bench — Visualizador 3D da Placa (tscircuit 3D Viewer)
 * Renderiza o gêmeo tridimensional da Carrier Board de engenharia (FR-4 1.6mm)
 * em escala 1:1, com componentes soldados no plano Z=0, filetes de solda (fillets),
 * conector USB-C de borda, conectores JST-XH de periféricos, trilhas chanfradas a 45°,
 * serigrafia técnica em branco nítido e ViewCube interativo.
 *
 * Referências de projeto: imrishabh18/rp2040-motor-controller e tscircuit/3d-viewer.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Box,
  Maximize2,
  RotateCcw,
  Layers,
  Cpu,
  Info,
  X,
  Palette,
  Camera,
} from 'lucide-react';
import { ViewCube } from './ViewCube';
import { FUELGUARD_CAD_LIBRARY, CadComponentMetadata } from '@/circuit-cad/component-library';
import { RP2040_COMPONENT_LIBRARY } from '@/circuit-cad/rp2040-circuit-provider';
import { buildRp2040Board } from './rp2040-3d-builder';

interface Pcb3DCanvasProps {
  activeBoard?: 'fuelguard-carrier' | 'rp2040-motor-controller';
  onSelectTab?: (tab: 'schematic' | 'pcb' | '3d' | 'assembly' | 'drc' | 'catalog') => void;
}

type SolderMaskTheme = 'green' | 'obsidian';

export const Pcb3DCanvas: React.FC<Pcb3DCanvasProps> = ({ activeBoard = 'fuelguard-carrier', onSelectTab }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Estados de rotação sincronizados com o ViewCube
  const [rotX, setRotX] = useState<number>(0.38);
  const [rotY, setRotY] = useState<number>(-0.55);
  const rotRef = useRef<{ rotX: number; rotY: number }>({ rotX: 0.38, rotY: -0.55 });
  const animTargetRef = useRef<{ targetX: number; targetY: number; targetCamZ?: number } | null>(null);

  // Tema de máscara de solda (Verde Floresta Clássico vs Preto Fosco Obsidiana)
  const [maskTheme, setMaskTheme] = useState<SolderMaskTheme>('green');
  const maskThemeRef = useRef<SolderMaskTheme>('green');
  maskThemeRef.current = maskTheme;

  // Componente selecionado para inspeção
  const [selectedComp, setSelectedComp] = useState<CadComponentMetadata | null>(null);

  // Atualiza a referência de rotação
  const updateRotation = useCallback((newX: number, newY: number) => {
    rotRef.current = { rotX: newX, rotY: newY };
    setRotX(newX);
    setRotY(newY);
  }, []);

  // Alinhamento acionado ao clicar nas faces do ViewCube
  const handleSelectView = useCallback((targetRotX: number, targetRotY: number) => {
    animTargetRef.current = { targetX: targetRotX, targetY: targetRotY };
  }, []);

  // Modal para visualização do Render Fotorealista oficial da tscircuit
  const [showOfficialRenderModal, setShowOfficialRenderModal] = useState<boolean>(false);

  // Presets de Câmera de Engenharia
  const isRp2040 = activeBoard === 'rp2040-motor-controller';
  const camIsoZ = isRp2040 ? 60 : 145;
  const camOrthoZ = isRp2040 ? 65 : 155;
  const camFrontZ = isRp2040 ? 55 : 135;
  const camEdgeZ = isRp2040 ? 55 : 130;

  const setPresetView = (preset: 'iso' | 'top' | 'bottom' | 'front' | 'edge') => {
    switch (preset) {
      case 'iso':
        animTargetRef.current = { targetX: 0.38, targetY: -0.55, targetCamZ: camIsoZ };
        break;
      case 'top':
        animTargetRef.current = { targetX: Math.PI / 2 - 0.02, targetY: 0, targetCamZ: camOrthoZ };
        break;
      case 'bottom':
        animTargetRef.current = { targetX: -Math.PI / 2 + 0.02, targetY: 0, targetCamZ: camOrthoZ };
        break;
      case 'front':
        animTargetRef.current = { targetX: 0.05, targetY: 0, targetCamZ: camFrontZ };
        break;
      case 'edge':
        animTargetRef.current = { targetX: 0.02, targetY: -Math.PI / 2, targetCamZ: camEdgeZ };
        break;
    }
  };

  const handleFitToView = useCallback(() => {
    setPresetView('iso');
  }, []);

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // =========================================================================
  // MONTAGEM THREE.JS DA CARRIER BOARD PROFISSIONAL
  // =========================================================================
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // 1. Cena, Câmera e Renderizador WebGL
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06090d);

    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 2000);
    camera.position.set(0, isRp2040 ? 38 : 105, isRp2040 ? 56 : 140);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // 2. Iluminação de Laboratório Eletrônico PBR
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(80, 180, 120);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0006;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
    rimLight.position.set(-90, 80, -90);
    scene.add(rimLight);

    const goldAccentLight = new THREE.PointLight(0xf59e0b, 0.45, 250);
    goldAccentLight.position.set(50, 40, -40);
    scene.add(goldAccentLight);

    // Sombra de contato no piso virtual
    const shadowGeo = new THREE.PlaneGeometry(240, 200);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.28 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -10;
    shadowMesh.receiveShadow = true;
    scene.add(shadowMesh);

    // Grade sutil cinza escuro no piso (sem invadir a placa)
    const floorGrid = new THREE.GridHelper(260, 26, 0x1e293b, 0x0c131d);
    floorGrid.position.y = -10.1;
    scene.add(floorGrid);

    // Grupo Raiz da Placa (rotacionado interativamente)
    const boardGroup = new THREE.Group();
    scene.add(boardGroup);

    // Objetos clicáveis para Click-to-Inspect
    const pickableObjects: { mesh: THREE.Object3D; compKey: string }[] = [];

    // Materiais PBR de Alta Fidelidade (KiCad / tscircuit PBR)
    const pcbMatGreen = new THREE.MeshStandardMaterial({
      color: 0x0e3d23, // Verde floresta industrial KiCad/tscircuit
      roughness: 0.32,
      metalness: 0.12,
    });

    const pcbMatObsidian = new THREE.MeshStandardMaterial({
      color: 0x0e141b, // Preto obsidiana fosco premium
      roughness: 0.38,
      metalness: 0.08,
    });

    const pcbMat = maskThemeRef.current === 'green' ? pcbMatGreen : pcbMatObsidian;

    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0x142e1d,
      roughness: 0.6,
      metalness: 0.05,
    });

    const enigGoldMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      metalness: 0.88,
      roughness: 0.22,
    });

    const tinSolderMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Estanho/Prata SAC305
      metalness: 0.94,
      roughness: 0.16,
    });

    const whiteSilkscreenMat = new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      side: THREE.DoubleSide,
    });

    let pulsingLed: THREE.Mesh | null = null;
    let pcbGeo: THREE.BufferGeometry | null = null;
    let edgeTrim: THREE.Mesh | null = null;

    if (isRp2040) {
      buildRp2040Board(
        boardGroup,
        pickableObjects,
        { pcbMat, enigGoldMat, tinSolderMat, whiteSilkscreenMat, edgeMat },
        (mesh) => { pulsingLed = mesh; }
      );
    } else {
      // =========================================================================
      // 3. CARRIER BOARD FR-4 UNIFICADA (140 x 100 x 1.6 mm)
      // =========================================================================
      const boardW = 140;
      const boardH = 100;
      const pcbThickness = 1.6;

      pcbGeo = new THREE.BoxGeometry(boardW, pcbThickness, boardH);
      const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
      pcbMesh.position.y = -pcbThickness / 2;
      pcbMesh.receiveShadow = true;
      pcbMesh.castShadow = true;
      boardGroup.add(pcbMesh);

      edgeTrim = new THREE.Mesh(new THREE.BoxGeometry(boardW + 0.1, pcbThickness - 0.2, boardH + 0.1), edgeMat);
      edgeTrim.position.y = -pcbThickness / 2;
      boardGroup.add(edgeTrim);

    // Furos de Montagem M3 nos 4 cantos com ilhós metalizados ENIG
    const holeCoords = [
      [-62, -42],
      [62, -42],
      [-62, 42],
      [62, 42],
    ];
    const holeCutoutGeo = new THREE.CylinderGeometry(1.6, 1.6, pcbThickness + 0.4, 20);
    const holeCutoutMat = new THREE.MeshBasicMaterial({ color: 0x06090d });
    const ringPadGeo = new THREE.RingGeometry(1.7, 3.4, 24);

    holeCoords.forEach(([hx, hz]) => {
      const holeMesh = new THREE.Mesh(holeCutoutGeo, holeCutoutMat);
      holeMesh.position.set(hx, -pcbThickness / 2, hz);
      boardGroup.add(holeMesh);

      // Pad superior ENIG
      const ringTop = new THREE.Mesh(ringPadGeo, enigGoldMat);
      ringTop.rotation.x = -Math.PI / 2;
      ringTop.position.set(hx, 0.01, hz);
      boardGroup.add(ringTop);

      // Pad inferior ENIG
      const ringBottom = new THREE.Mesh(ringPadGeo, enigGoldMat);
      ringBottom.rotation.x = Math.PI / 2;
      ringBottom.position.set(hx, -pcbThickness - 0.01, hz);
      boardGroup.add(ringBottom);
    });

    // Marcas Fiduciais nos 3 cantos (círculos de cobre dourados para alinhamento pick-and-place)
    [
      [-58, -38],
      [58, -38],
      [-58, 38],
    ].forEach(([fx, fz]) => {
      const fiducial = new THREE.Mesh(new THREE.CircleGeometry(0.8, 16), enigGoldMat);
      fiducial.rotation.x = -Math.PI / 2;
      fiducial.position.set(fx, 0.02, fz);
      boardGroup.add(fiducial);
    });

    // =========================================================================
    // 4. CONECTOR USB-C DE BORDA (FLUSH NA BORDA FRONTAL: Z=50)
    // =========================================================================
    // Conector montado na borda com recorte no substrato, idêntico às fotos de referência
    const usbGroup = new THREE.Group();
    usbGroup.position.set(-20, 0, 50);

    // Carcaça metálica estampada tipo C
    const usbShell = new THREE.Mesh(
      new THREE.BoxGeometry(8.94, 3.16, 7.35),
      new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.15 })
    );
    usbShell.position.set(0, 1.2, -1.0);
    usbShell.castShadow = true;
    usbGroup.add(usbShell);

    // Abertura oval interna do conector
    const usbMouth = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 1.6, 2.0),
      new THREE.MeshBasicMaterial({ color: 0x090d14 })
    );
    usbMouth.position.set(0, 1.2, 2.0);
    usbGroup.add(usbMouth);

    // Língua central isolante com contatos dourados
    const usbTongue = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 0.5, 3.5),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 })
    );
    usbTongue.position.set(0, 1.2, 1.0);
    usbGroup.add(usbTongue);

    // 4 Abas laterais de fixação com solda nos pads de aterramento
    const tabGeo = new THREE.BoxGeometry(1.2, 2.0, 1.6);
    const tabL = new THREE.Mesh(tabGeo, tinSolderMat);
    tabL.position.set(-5.0, 0.4, -2.5);
    const tabR = new THREE.Mesh(tabGeo, tinSolderMat);
    tabR.position.set(5.0, 0.4, -2.5);
    usbGroup.add(tabL, tabR);

    boardGroup.add(usbGroup);
    pickableObjects.push({ mesh: usbShell, compKey: 'esp32_s3_devkit' });

    // =========================================================================
    // 5. ESP32-S3 DEVKITC-1 V1.1 (U1) MONTADO SOBRE HEADERS FÊMEA (X=-34, Z=-2)
    // =========================================================================
    const espGroup = new THREE.Group();
    espGroup.position.set(-34, 0, -2);

    // Barras de pinos fêmea pretas 1x22 na Carrier Board (onde o DevKit é inserido)
    const socketMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 });
    const socketLeft = new THREE.Mesh(new THREE.BoxGeometry(2.54, 5.0, 55.88), socketMat);
    socketLeft.position.set(-11.43, 2.5, 0);
    const socketRight = new THREE.Mesh(new THREE.BoxGeometry(2.54, 5.0, 55.88), socketMat);
    socketRight.position.set(11.43, 2.5, 0);
    espGroup.add(socketLeft, socketRight);

    // Placa do módulo DevKit (PCB azul marinho/preto de 25.5 x 68 x 1.2 mm elevada em Y=5.5)
    const espPcb = new THREE.Mesh(
      new THREE.BoxGeometry(25.5, 1.2, 68),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35 })
    );
    espPcb.position.y = 5.6;
    espPcb.castShadow = true;
    espGroup.add(espPcb);

    // Blindagem metálica RF do WROOM-1 (Can em prata brilhante com logo)
    const wroomCan = new THREE.Mesh(
      new THREE.BoxGeometry(18.0, 2.8, 24.5),
      new THREE.MeshStandardMaterial({
        color: 0xc8d0dc,
        metalness: 0.94,
        roughness: 0.18,
      })
    );
    wroomCan.position.set(0, 7.3, 3);
    wroomCan.castShadow = true;
    espGroup.add(wroomCan);

    // Inscrição gravada no RF Can
    const canLabel = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 6),
      new THREE.MeshBasicMaterial({ color: 0x334155, side: THREE.DoubleSide })
    );
    canLabel.rotation.x = -Math.PI / 2;
    canLabel.position.set(0, 8.75, 3);
    espGroup.add(canLabel);

    // Antena PCB Serpentina Dourada no topo da placa DevKit
    const antTrace = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 10),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.96,
        roughness: 0.15,
        side: THREE.DoubleSide,
      })
    );
    antTrace.rotation.x = -Math.PI / 2;
    antTrace.position.set(0, 6.25, -25);
    espGroup.add(antTrace);

    // Botões SMD micro (BOOT e EN/RESET)
    const btnMat = new THREE.MeshStandardMaterial({ color: 0x71717a, metalness: 0.8, roughness: 0.3 });
    const bootBtn = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.4, 2.5), btnMat);
    bootBtn.position.set(-6, 6.6, 26);
    const rstBtn = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.4, 2.5), btnMat);
    rstBtn.position.set(6, 6.6, 26);
    espGroup.add(bootBtn, rstBtn);

    boardGroup.add(espGroup);
    pickableObjects.push({ mesh: wroomCan, compKey: 'esp32_s3_devkit' });

    // =========================================================================
    // 6. BUFFER SN74AHCT125N (U2: DIP-14) COM TERMINAIS E SOLDA (X=14, Z=-24)
    // =========================================================================
    const dipGroup = new THREE.Group();
    dipGroup.position.set(14, 0, -24);

    // Corpo do encapsulamento DIP-14 plástico preto
    const dipBody = new THREE.Mesh(
      new THREE.BoxGeometry(7.62, 3.4, 19.3),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 })
    );
    dipBody.position.y = 2.4;
    dipBody.castShadow = true;
    dipGroup.add(dipBody);

    // Chanfro de orientação do pino 1
    const dipNotch = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.0, 0.8, 12),
      new THREE.MeshStandardMaterial({ color: 0x27272a })
    );
    dipNotch.position.set(0, 3.8, -9.0);
    dipGroup.add(dipNotch);

    // 14 Terminais com filetes de solda estanhados nos furos metalizados da placa
    const pinGeo = new THREE.BoxGeometry(0.5, 2.8, 0.3);
    const filletGeo = new THREE.ConeGeometry(0.7, 0.6, 8);

    for (let i = 0; i < 7; i++) {
      const zPos = -7.62 + i * 2.54;
      // Pino esquerdo e direito
      const pL = new THREE.Mesh(pinGeo, tinSolderMat);
      pL.position.set(-4.1, 1.4, zPos);
      const pR = new THREE.Mesh(pinGeo, tinSolderMat);
      pR.position.set(4.1, 1.4, zPos);
      dipGroup.add(pL, pR);

      // Filetes de solda na base (Z=0)
      const fL = new THREE.Mesh(filletGeo, tinSolderMat);
      fL.position.set(-4.1, 0.3, zPos);
      const fR = new THREE.Mesh(filletGeo, tinSolderMat);
      fR.position.set(4.1, 0.3, zPos);
      dipGroup.add(fL, fR);
    }

    boardGroup.add(dipGroup);
    pickableObjects.push({ mesh: dipBody, compKey: 'sn74ahct125n' });

    // =========================================================================
    // 7. PASSIVOS SMD 0805: DIVISOR 10k/15k, RESISTORES E CAPACITORES (Z=0)
    // =========================================================================
    const passivesGroup = new THREE.Group();
    passivesGroup.position.set(14, 0, 2);

    const createSmd0805 = (colorHex: number, _label: string, px: number, pz: number, compKey: string) => {
      const grp = new THREE.Group();
      grp.position.set(px, 0, pz);

      // Corpo cerâmico SMD (2.0 x 0.6 x 1.25 mm)
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.7, 1.25),
        new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.35 })
      );
      body.position.y = 0.45;
      grp.add(body);

      // Terminais metálicos laterais com solda
      const termGeo = new THREE.BoxGeometry(0.4, 0.72, 1.28);
      const term1 = new THREE.Mesh(termGeo, tinSolderMat);
      term1.position.set(-0.95, 0.45, 0);
      const term2 = new THREE.Mesh(termGeo, tinSolderMat);
      term2.position.set(0.95, 0.45, 0);
      grp.add(term1, term2);

      // Pads de cobre dourados na placa
      const padGeo = new THREE.BoxGeometry(0.8, 0.04, 1.4);
      const pad1 = new THREE.Mesh(padGeo, enigGoldMat);
      pad1.position.set(-1.1, 0.02, 0);
      const pad2 = new THREE.Mesh(padGeo, enigGoldMat);
      pad2.position.set(1.1, 0.02, 0);
      grp.add(pad1, pad2);

      passivesGroup.add(grp);
      pickableObjects.push({ mesh: body, compKey });
      return grp;
    };

    // R1: 10 kΩ (Divisor de Tensão)
    createSmd0805(0x18181b, 'R1_10k', -4, -6, 'voltage_divider');
    // R2: 15 kΩ (Divisor de Tensão)
    createSmd0805(0x18181b, 'R2_15k', 4, -6, 'voltage_divider');
    // R3: 330 Ω (Limitador do LED D1)
    createSmd0805(0x18181b, 'R3_330R', -4, 4, 'led_indicator');
    // C1: 100 nF (Desacoplamento Cerâmico)
    createSmd0805(0xca8a04, 'C1_100nF', 4, 4, 'sn74ahct125n');

    // C2: 10 µF (Bulk Eletrolítico SMD cilíndrico de alumínio)
    const c2Geo = new THREE.CylinderGeometry(2.5, 2.5, 5.4, 20);
    const c2Mat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });
    const c2Mesh = new THREE.Mesh(c2Geo, c2Mat);
    c2Mesh.position.set(12, 2.7, -1);
    passivesGroup.add(c2Mesh);

    boardGroup.add(passivesGroup);

    // =========================================================================
    // 8. BUZZER PIEZOELÉTRICO BZ1 (Ø12mm) COM POLARIDADE "+" E PORTA SONORA
    // =========================================================================
    // Baseado na captura de engenharia media_1790365078122.png
    const bzGroup = new THREE.Group();
    bzGroup.position.set(48, 0, -24);

    const bzBody = new THREE.Mesh(
      new THREE.CylinderGeometry(6.0, 6.0, 9.5, 32),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5, metalness: 0.1 })
    );
    bzBody.position.y = 4.8;
    bzBody.castShadow = true;
    bzGroup.add(bzBody);

    // Porta acústica central
    const bzHole = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, 0.5, 16),
      new THREE.MeshBasicMaterial({ color: 0x05070a })
    );
    bzHole.position.set(0, 9.6, 0);
    bzGroup.add(bzHole);

    // Símbolo "+" serigrafado em branco no topo
    const plusV = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 2.2), whiteSilkscreenMat);
    plusV.rotation.x = -Math.PI / 2;
    plusV.position.set(-3.2, 9.62, -2.5);
    const plusH = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.6), whiteSilkscreenMat);
    plusH.rotation.x = -Math.PI / 2;
    plusH.position.set(-3.2, 9.62, -2.5);
    bzGroup.add(plusV, plusH);

    boardGroup.add(bzGroup);
    pickableObjects.push({ mesh: bzBody, compKey: 'buzzer_piezo' });

    // =========================================================================
    // 9. LED INDICADOR VERDE D1 (0805 SMD COM LENTE TRANSLÚCIDA)
    // =========================================================================
    const ledGroup = new THREE.Group();
    ledGroup.position.set(10, 0, 16);

    const ledDome = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 1.2, 1.25),
      new THREE.MeshPhysicalMaterial({
        color: 0x22c55e,
        emissive: 0x166534,
        emissiveIntensity: 0.8,
        transmission: 0.5,
        transparent: true,
        roughness: 0.15,
      })
    );
    ledDome.position.y = 0.7;
    ledGroup.add(ledDome);

    boardGroup.add(ledGroup);
    pickableObjects.push({ mesh: ledDome, compKey: 'led_indicator' });

    // =========================================================================
    // 10. CONECTORES JST-XH DE SAÍDA PARA OS SENSORES DA BANCADA
    // =========================================================================
    // J1: Conector Chicote Ultrassônico (4 vias: 5V, GND, TRIG, ECHO) na borda direita
    const createJstXhConnector = (pins: number, px: number, pz: number, rotY: number, compKey: string) => {
      const grp = new THREE.Group();
      grp.position.set(px, 0, pz);
      grp.rotation.y = rotY;

      const connW = 2.5 * pins + 3.0;
      const shroud = new THREE.Mesh(
        new THREE.BoxGeometry(connW, 6.0, 5.8),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 })
      );
      shroud.position.y = 3.0;
      shroud.castShadow = true;
      grp.add(shroud);

      // Cavidade do conector
      const cavity = new THREE.Mesh(
        new THREE.BoxGeometry(connW - 1.2, 5.0, 4.4),
        new THREE.MeshBasicMaterial({ color: 0x1e293b })
      );
      cavity.position.set(0, 3.5, 0.5);
      grp.add(cavity);

      // Pinos dourados dentro do conector
      for (let p = 0; p < pins; p++) {
        const pinX = -((pins - 1) * 2.5) / 2 + p * 2.5;
        const goldPin = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.3, 4.5, 8),
          enigGoldMat
        );
        goldPin.position.set(pinX, 3.2, 0.5);
        grp.add(goldPin);
      }

      boardGroup.add(grp);
      pickableObjects.push({ mesh: shroud, compKey });
      return grp;
    };

    // J1 (4 pinos): Chicote Sonda Ultrassônica (X=54, Z=4)
    createJstXhConnector(4, 54, 4, 0, 'jsn_sr04t_v2');

    // J2 (6 pinos): Chicote Leitor NFC PN532 (X=54, Z=30)
    createJstXhConnector(6, 54, 30, 0, 'pn532_breakout');

    // J3 (2 pinos): Chicote Sensor Reed Switch Tampa (X=24, Z=38)
    createJstXhConnector(2, 24, 38, -Math.PI / 2, 'reed_switch');

    // =========================================================================
    // 11. CAMADA DE TRILHAS DE COBRE CHANFRADAS A 45° NA SUPERFÍCIE (TOP COPPER)
    // =========================================================================
    const tracesGroup = new THREE.Group();
    boardGroup.add(tracesGroup);

    const traceMatSignal = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.25,
      metalness: 0.75,
    });
    const traceMatPower5V = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.25,
      metalness: 0.85,
    });
    const traceMatPower3V3 = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.25,
      metalness: 0.85,
    });

    const addTraceLine = (points: [number, number][], widthMm: number, mat: THREE.Material) => {
      for (let i = 0; i < points.length - 1; i++) {
        const [x1, z1] = points[i];
        const [x2, z2] = points[i + 1];
        const dx = x2 - x1;
        const dz = z2 - z1;
        const len = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dx, dz);

        const segment = new THREE.Mesh(new THREE.PlaneGeometry(widthMm, len), mat);
        segment.rotation.x = -Math.PI / 2;
        segment.rotation.z = -angle;
        segment.position.set((x1 + x2) / 2, 0.025, (z1 + z2) / 2);
        tracesGroup.add(segment);
      }
    };

    // 1. Trilha de 5V da porta USB-C para o Buffer 74AHCT125 e Conector J1
    addTraceLine([[-20, 46], [-20, 20], [10, 20], [10, -10], [14 + 4, -16]], 1.2, traceMatPower5V);
    addTraceLine([[10, 20], [48, 20], [54 - 3.75, 4]], 1.2, traceMatPower5V);

    // 2. Trilha 3V3 do ESP32 para o conector J2 (PN532)
    addTraceLine([[-22.5, -20], [0, -20], [30, 24], [54 - 6.25, 30]], 1.0, traceMatPower3V3);

    // 3. Trilha TRIG do ESP32 (GPIO5) para o Buffer 74AHCT125 (Pin 2)
    addTraceLine([[-22.5, 8], [-10, 8], [6, -18], [14 - 4, -22]], 0.7, traceMatSignal);

    // 4. Trilha TRIG 5V do Buffer (Pin 3) para o conector J1 (Pin 3)
    addTraceLine([[14 - 4, -19.5], [30, -19.5], [42, 1.5], [54 + 1.25, 4]], 0.8, traceMatSignal);

    // 5. Trilha ECHO 5V de J1 para o Divisor Resistivo (R1)
    addTraceLine([[54 + 3.75, 4], [40, 4], [30, -4], [10, -4]], 0.8, traceMatSignal);

    // 6. Trilha ECHO_3V0_SAFE do divisor para o ESP32 (GPIO6)
    addTraceLine([[10, -4], [0, -4], [-12, 10], [-22.5, 10]], 0.7, traceMatSignal);

    // 7. Barramento SPI (4 vias) do ESP32 para J2 (PN532)
    addTraceLine([[-22.5, 14], [-2, 14], [25, 30], [54 - 3.75, 30]], 0.6, traceMatSignal);
    addTraceLine([[-22.5, 16], [-2, 16], [25, 32], [54 - 1.25, 30]], 0.6, traceMatSignal);
    addTraceLine([[-22.5, 18], [-2, 18], [25, 34], [54 + 1.25, 30]], 0.6, traceMatSignal);
    addTraceLine([[-22.5, 20], [-2, 20], [25, 36], [54 + 3.75, 30]], 0.6, traceMatSignal);

    // =========================================================================
    // 12. CAMADA DE SERIGRAFIA TÉCNICA EM BRANCO (SILKSCREEN)
    // =========================================================================
    const createSilkscreenRect = (px: number, pz: number, w: number, h: number) => {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-w / 2, 0.03, -h / 2),
        new THREE.Vector3(w / 2, 0.03, -h / 2),
        new THREE.Vector3(w / 2, 0.03, h / 2),
        new THREE.Vector3(-w / 2, 0.03, h / 2),
        new THREE.Vector3(-w / 2, 0.03, -h / 2),
      ]);
      const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xf8fafc, linewidth: 1.5 }));
      line.position.set(px, 0, pz);
      boardGroup.add(line);
    };

    // Contornos serigrafados sob os componentes
    createSilkscreenRect(-34, -2, 27, 70); // U1 ESP32
    createSilkscreenRect(14, -24, 9, 21); // U2 74AHCT125
    createSilkscreenRect(54, 4, 15, 7); // J1 Ultrasonic
    createSilkscreenRect(54, 30, 20, 7); // J2 NFC
    createSilkscreenRect(24, 38, 7, 10); // J3 Reed
    createSilkscreenRect(48, -24, 14, 14); // BZ1 Buzzer

    pulsingLed = ledDome;
  }

    // =========================================================================
    // 13. INTERAÇÃO ORBITAL POR MOUSE E RAYCASTING
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let totalDragDistance = 0;

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      totalDragDistance = 0;
      animTargetRef.current = null;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      totalDragDistance += Math.abs(deltaX) + Math.abs(deltaY);
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      const newY = rotRef.current.rotY + deltaX * 0.008;
      let newX = rotRef.current.rotX + deltaY * 0.008;
      newX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, newX));

      updateRotation(newX, newY);
    };

    const isDescendant = (parent: THREE.Object3D, child: THREE.Object3D): boolean => {
      let cur: THREE.Object3D | null = child;
      while (cur) {
        if (cur === parent) return true;
        cur = cur.parent;
      }
      return false;
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isMouseDown) return;
      isMouseDown = false;

      if (totalDragDistance < 5 && mount) {
        const rect = mount.getBoundingClientRect();
        mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouseCoord, camera);
        const meshesToTest = pickableObjects.map((p) => p.mesh);
        const intersects = raycaster.intersectObjects(meshesToTest, true);

        if (intersects.length > 0) {
          const hit = intersects[0];
          const found = pickableObjects.find(
            (p) => p.mesh === hit.object || isDescendant(p.mesh, hit.object)
          );
          if (found) {
            const comp = isRp2040
              ? RP2040_COMPONENT_LIBRARY[found.compKey]
              : FUELGUARD_CAD_LIBRARY[found.compKey];
            if (comp) {
              setSelectedComp(comp);
            }
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z += e.deltaY * (isRp2040 ? 0.06 : 0.14);
      camera.position.z = Math.max(isRp2040 ? 25 : 70, Math.min(isRp2040 ? 140 : 280, camera.position.z));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Loop de Animação 60 FPS
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (animTargetRef.current) {
        const { targetX, targetY, targetCamZ } = animTargetRef.current;
        const curX = rotRef.current.rotX;
        const curY = rotRef.current.rotY;

        const diffX = targetX - curX;
        const diffY = targetY - curY;

        if (Math.abs(diffX) < 0.004 && Math.abs(diffY) < 0.004) {
          updateRotation(targetX, targetY);
          if (!targetCamZ || Math.abs(camera.position.z - targetCamZ) < 1.0) {
            animTargetRef.current = null;
          }
        } else {
          updateRotation(curX + diffX * 0.16, curY + diffY * 0.16);
        }

        if (targetCamZ) {
          camera.position.z += (targetCamZ - camera.position.z) * 0.12;
        }
      }

      boardGroup.rotation.y = rotRef.current.rotY;
      boardGroup.rotation.x = rotRef.current.rotX;

      // Animação de pulsação suave no LED de status
      if (pulsingLed) {
        const t = Date.now() * 0.003;
        (pulsingLed.material as any).emissiveIntensity = 0.5 + Math.sin(t) * 0.35;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }

      renderer.dispose();
      if (pcbGeo) pcbGeo.dispose();
      pcbMatGreen.dispose();
      pcbMatObsidian.dispose();
      if (edgeTrim) edgeTrim.geometry.dispose();
      edgeMat.dispose();
    };
  }, [activeBoard, isRp2040, updateRotation]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#06090d] rounded-md border border-inst-border overflow-hidden select-none flex flex-col"
    >
      {/* 1. ViewCube Interativo no Canto Superior Esquerdo */}
      <div className="absolute top-3 left-3 z-20 flex flex-col items-center">
        <ViewCube rotX={rotX} rotY={rotY} onSelectView={handleSelectView} />
      </div>

      {/* 2. Barra Superior de Alternância e Status (Estilo HeyPCB / tscircuit) */}
      <div className="absolute top-3 right-3 z-10 flex flex-wrap items-center gap-2">
        <div className="flex items-center space-x-1 bg-[#0b0f15]/90 backdrop-blur-xs border border-inst-border p-1 rounded-sm shadow-xs text-xs font-mono">
          <button
            onClick={() => onSelectTab && onSelectTab('3d')}
            className="px-2.5 py-1 rounded-xs bg-fuelguard-green text-white font-bold flex items-center gap-1 shadow-xs"
          >
            <Box className="w-3 h-3" />
            <span>● 3D View</span>
          </button>
          <button
            onClick={() => onSelectTab && onSelectTab('pcb')}
            className="px-2.5 py-1 rounded-xs hover:bg-inst-subtle text-inst-secondary hover:text-inst-primary transition flex items-center gap-1"
          >
            <Layers className="w-3 h-3" />
            <span>2D PCB</span>
          </button>
          <button
            onClick={() => onSelectTab && onSelectTab('schematic')}
            className="px-2.5 py-1 rounded-xs hover:bg-inst-subtle text-inst-secondary hover:text-inst-primary transition flex items-center gap-1"
          >
            <Cpu className="w-3 h-3" />
            <span>Schematic</span>
          </button>
        </div>

        {/* Alternador de Cor da Máscara de Solda */}
        <div className="flex items-center space-x-1 bg-[#0b0f15]/90 backdrop-blur-xs border border-inst-border p-1 rounded-sm shadow-xs text-xs font-mono">
          <button
            onClick={() => setMaskTheme(maskTheme === 'green' ? 'obsidian' : 'green')}
            className="px-2 py-1 rounded-xs hover:bg-inst-subtle text-inst-secondary hover:text-inst-primary transition flex items-center gap-1.5 text-[11px]"
            title="Alternar entre Verde Floresta e Preto Obsidiana"
          >
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span>{maskTheme === 'green' ? 'Verde FR4' : 'Preto Obsidiana'}</span>
          </button>
        </div>

        {/* Presets Rápidos de Projeção */}
        <div className="hidden sm:flex items-center space-x-1 bg-[#0b0f15]/90 backdrop-blur-xs border border-inst-border p-1 rounded-sm shadow-xs text-[11px] font-mono">
          <button
            onClick={() => setPresetView('top')}
            className="px-2 py-0.5 rounded-xs hover:bg-inst-subtle text-inst-secondary hover:text-fuelguard-green transition"
            title="Vista Superior Ortogonal (Top)"
          >
            Top
          </button>
          <button
            onClick={() => setPresetView('bottom')}
            className="px-2 py-0.5 rounded-xs hover:bg-inst-subtle text-inst-secondary hover:text-fuelguard-green transition"
            title="Vista Inferior (Bottom / Solda)"
          >
            Bottom
          </button>
          <button
            onClick={() => setPresetView('front')}
            className="px-2 py-0.5 rounded-xs hover:bg-inst-subtle text-inst-secondary hover:text-fuelguard-green transition"
            title="Vista Frontal (Conector USB-C)"
          >
            Front
          </button>
          <button
            onClick={() => setPresetView('edge')}
            className="px-2 py-0.5 rounded-xs hover:bg-inst-subtle text-inst-secondary hover:text-fuelguard-green transition"
            title="Vista de Perfil (Espessura 1.6mm)"
          >
            Perfil
          </button>
        </div>

        {/* Botão para Render Fotorealista */}
        <div className="flex items-center space-x-1 bg-[#0b0f15]/90 backdrop-blur-xs border border-inst-border p-1 rounded-sm shadow-xs text-xs font-mono">
          <button
            onClick={() => setShowOfficialRenderModal(true)}
            className="px-2 py-1 rounded-xs bg-sky-950/70 hover:bg-sky-900 border border-sky-600 text-sky-200 transition flex items-center gap-1.5 text-[11px]"
            title="Visualizar Render Fotorealista da Placa"
          >
            <Camera className="w-3.5 h-3.5 text-sky-400" />
            <span>Render 3D</span>
          </button>
        </div>

        <div className="flex items-center space-x-1 bg-[#0b0f15]/90 backdrop-blur-xs border border-inst-border p-1 rounded-sm shadow-xs text-xs font-mono">
          <button
            onClick={handleFitToView}
            className="px-2 py-1 rounded-xs hover:bg-inst-subtle text-inst-secondary hover:text-fuelguard-green transition flex items-center gap-1 text-[11px]"
            title="Ajustar à Tela (Enquadramento Amplo)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ajustar</span>
          </button>
          <button
            onClick={handleToggleFullscreen}
            className="p-1 rounded-xs hover:bg-inst-subtle text-inst-secondary hover:text-inst-primary transition"
            title="Tela Cheia"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Rodapé com Metadados e Selos Técnicos */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2 text-[10px] font-mono">
        {isRp2040 ? (
          <>
            <div className="px-2 py-1 rounded-xs bg-[#0e141c]/90 border border-sky-800 text-sky-300 flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>RP2040 Motor Cap: 42.3×42.3×1.6mm • 4 Camadas FR-4 • ENIG</span>
            </div>
            <div className="px-2 py-1 rounded-xs bg-[#0e141c]/90 border border-purple-800 text-purple-300 flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>Dual USB-C (PD 12V + MCU) • JST-PH 4P • DRV8847</span>
            </div>
          </>
        ) : (
          <>
            <div className="px-2 py-1 rounded-xs bg-[#0e141c]/90 border border-emerald-800 text-emerald-300 flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Carrier FR-4: 140×100×1.6mm • Acabamento ENIG</span>
            </div>
            <div className="px-2 py-1 rounded-xs bg-[#0e141c]/90 border border-sky-800 text-sky-300 flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>USB-C de Borda + Conectores JST-XH (J1, J2, J3)</span>
            </div>
          </>
        )}
        <span className="text-inst-muted self-center ml-2 hidden sm:inline">
          • Clique num componente para inspecionar
        </span>
      </div>

      {/* 4. Cartão de Inspeção de Componente Selecionado (Click-to-Inspect) */}
      {selectedComp && (
        <div className="absolute bottom-3 right-3 z-30 w-80 bg-[#0e141c]/95 backdrop-blur-md border border-fuelguard-green p-3.5 rounded-md shadow-overlay font-mono text-xs text-inst-primary animate-in fade-in duration-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-[10px] text-inst-muted uppercase">Designator: {selectedComp.designatorPrefix}</div>
              <h2 className="text-sm font-bold text-fuelguard-green flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0" />
                {selectedComp.name}
              </h2>
            </div>
            <button
              onClick={() => setSelectedComp(null)}
              className="p-1 rounded-xs hover:bg-inst-subtle text-inst-muted hover:text-inst-primary transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 text-[11px] font-ui border-t border-inst-border pt-2 text-inst-secondary">
            <div><strong>Part Number:</strong> <span className="font-mono text-inst-primary">{selectedComp.partNumber}</span></div>
            <div><strong>Fabricante:</strong> <span className="text-inst-primary">{selectedComp.manufacturer}</span></div>
            <div><strong>Dimensões:</strong> <span className="font-mono text-inst-primary">{selectedComp.dimensionsMm.width} × {selectedComp.dimensionsMm.height} mm</span></div>
            <div><strong>Footprint:</strong> <span className="font-mono text-inst-primary">{selectedComp.footprintType}</span></div>
            <div><strong>Licença:</strong> <span className="text-inst-primary">{selectedComp.license}</span></div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-inst-border flex items-center justify-between text-[10px]">
            <span
              className={`px-2 py-0.5 rounded-xs font-bold uppercase border ${
                selectedComp.validationStatus === 'exact_verified'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border-amber-800'
              }`}
            >
              {selectedComp.validationStatus === 'exact_verified' ? 'Nível 2 (Verificado)' : 'Nível 4 (Aproximação Paramétrica)'}
            </span>
            <span className="text-inst-muted truncate max-w-[130px]">{selectedComp.sourceReference}</span>
          </div>
        </div>
      )}

      {/* 5. Modal de Render Fotorealista */}
      {showOfficialRenderModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e141c] border border-inst-border-strong rounded-lg max-w-3xl w-full p-4 space-y-3 font-mono shadow-overlay">
            <div className="flex justify-between items-center border-b border-inst-border pb-2">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-bold text-inst-primary">
                  {isRp2040 ? 'Render Fotorealista 3D Oficial — RP2040 Motor Controller' : 'Gêmeo Digital 3D — Carrier Board FuelGuard'}
                </span>
              </div>
              <button
                onClick={() => setShowOfficialRenderModal(false)}
                className="p-1 rounded-xs hover:bg-inst-subtle text-inst-muted hover:text-inst-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-[#06090d] rounded-md border border-inst-border p-3 flex items-center justify-center min-h-[360px]">
              <img
                src={isRp2040 ? '/data/rp2040/3d.png' : '/screenshot_cad_3d.png'}
                alt="Render 3D da Placa"
                className="max-h-[460px] object-contain rounded-xs shadow-md"
              />
            </div>
            <div className="flex justify-between items-center text-xs text-inst-secondary pt-1">
              <span>{isRp2040 ? 'Origem Oficial: tscircuit / imrishabh18 (dist/index/3d.png)' : 'Origem: Three.js PBR Engine'}</span>
              <button
                onClick={() => setShowOfficialRenderModal(false)}
                className="px-3 py-1 bg-inst-surface border border-inst-border hover:border-inst-border-strong rounded-xs text-inst-primary"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contêiner de Renderização Three.js */}
      <div ref={mountRef} className="flex-1 w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
