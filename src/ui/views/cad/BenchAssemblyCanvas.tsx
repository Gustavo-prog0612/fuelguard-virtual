/**
 * FuelGuard Virtual Test Bench — Cena 3D de Montagem da Bancada Física (Assembly View)
 * Renderiza o arranjo tridimensional da referência de engenharia, com proveniência explícita:
 * - Tapete ESD e Protoboard MB-102 com furação e barramentos
 * - ESP32-S3 DevKitC-1 v1.1 com WROOM-1, pinagem 2x22, duas portas Micro-USB e botões (GLB documentado Classe B)
 * - A02YYUW / SEN0311 com GLB reconstruído a partir do desenho mecânico documentado (Classe B)
 * - Módulo PN532 em suporte frontal seco, fora do tanque, com antena espiral plana (Classe A no GLB)
 * - Reed Switch em ampola de vidro e ímã de neodímio na tampa (Classe C)
 * - Tanque cilíndrico paramétrico FG-TANK-5L-CYL-R1 com tampa 4x M3
 * - Chicote tubular físico com terminais DuPont e rotas respeitando conectores
 * - Auditoria Automática Mecânica & Elétrica integrada (Assembly Auditor)
 * - Linhas de guia axiais na vista explodida, réguas e sincronização com telemetria
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
  Box,
  Sparkles,
  Maximize2,
  RotateCcw,
  Cpu,
  Info,
  X,
  Droplets,
  Split,
  Compass,
  Cable as CableIcon,
  Ruler,
  Zap,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Radio,
  Layers,
  Grid3X3,
  Waves,
  SlidersHorizontal,
} from 'lucide-react';
import { ViewCube } from './ViewCube';
import {
  FUELGUARD_CAD_LIBRARY,
  CadComponentMetadata,
} from '@/circuit-cad/component-library';
import {
  PHYSICAL_WIRING_REGISTRY,
  PhysicalCable,
  CableSignalGroup,
} from '@/circuit-cad/wiring-registry';
import { AssemblyAuditor, AssemblyAuditReport } from '@/circuit-cad/assembly-auditor';
import { getSceneObject, TANK_SPEC } from '@/circuit-cad/assembly-source';
import { SceneObjectRegistry, CollisionStatus } from '@/geometry/scene-object-registry';
import { useSimulation } from '@/core/worker/use-simulation';
import { Component360InspectorModal } from './Component360InspectorModal';

interface BenchAssemblyCanvasProps {
  onSelectTab?: (tab: 'schematic' | 'pcb' | '3d' | 'assembly' | 'drc' | 'catalog') => void;
}

export type BenchViewMode = 'montagem' | 'explodida' | 'conexoes' | 'sensores';
type ViewPreset = 'iso' | 'top' | 'front' | 'right' | 'left' | 'wiring' | 'exploded';

export const BenchAssemblyCanvas: React.FC<BenchAssemblyCanvasProps> = ({ onSelectTab }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Conexão com o motor de simulação (telemetria sincronizada com o nível d'água)
  const { snapshot } = useSimulation();

  // Estados de navegação 3D
  const [rotX, setRotX] = useState<number>(0.38);
  const [rotY, setRotY] = useState<number>(-0.65);
  const rotRef = useRef<{ rotX: number; rotY: number }>({ rotX: 0.38, rotY: -0.65 });
  const animTargetRef = useRef<{ targetX: number; targetY: number; targetCamZ?: number } | null>(null);

  // Modos oficiais da bancada: Montagem, Explodida, Conexões e Sensores
  const [benchMode, setBenchMode] = useState<BenchViewMode>('montagem');

  // Estados operacionais da bancada
  const [waterLevelPct, setWaterLevelPct] = useState<number>(65);
  const [tankOpacity, setTankOpacity] = useState<number>(0.88);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [selectedComp, setSelectedComp] = useState<CadComponentMetadata | null>(null);
  const [selectedCable, setSelectedCable] = useState<PhysicalCable | null>(null);
  const [isInspectionAutoRotate, setIsInspectionAutoRotate] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [collisionStatus, setCollisionStatus] = useState<CollisionStatus>('PENDING_PHYSICAL_EVIDENCE');
  const focusTargetRef = useRef<{ object: THREE.Object3D; distance: number } | null>(null);
  const inspectionObjectRef = useRef<THREE.Object3D | null>(null);
  const inspectionBaseRotationRef = useRef<THREE.Euler | null>(null);
  const inspectionAngleRef = useRef(0);
  const inspectionVisibilityRef = useRef<Array<{ object: THREE.Object3D; visible: boolean }>>([]);

  // Filtros de cabos e ferramentas visuais
  const [activeCableGroup, setActiveCableGroup] = useState<CableSignalGroup | 'all'>('all');
  const [showCables, setShowCables] = useState<boolean>(true);
  const [showCalipers, setShowCalipers] = useState<boolean>(false);
  const [enableShadows, setEnableShadows] = useState<boolean>(true);
  const [lowPowerMode, setLowPowerMode] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false); // Grade de piso discreta desligada por padrão
  const [enableRipples, setEnableRipples] = useState<boolean>(true);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState<boolean>(false);

  // Executa auditoria automática mecatrônica & elétrica
  const auditReport: AssemblyAuditReport = useMemo(() => AssemblyAuditor.runAudit(), []);

  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);

  // Sincroniza nível inicial com telemetria ativa (a menos que o usuário tenha ajustado manualmente)
  useEffect(() => {
    if (!isManualOverride && snapshot && typeof snapshot.percentage === 'number' && !isNaN(snapshot.percentage)) {
      setWaterLevelPct(Math.round(snapshot.percentage));
    }
  }, [snapshot?.percentage, isManualOverride]);

  // Refs reativos para animação sem re-instanciação do Three.js
  const waterLevelRef = useRef<number>(65);
  waterLevelRef.current = waterLevelPct;

  const tankOpacityRef = useRef<number>(0.88);
  tankOpacityRef.current = tankOpacity;

  const isExplodedTargetRef = useRef<number>(0);
  isExplodedTargetRef.current = isExploded ? 1.0 : 0.0;

  const selectedCableIdRef = useRef<string | null>(null);
  selectedCableIdRef.current = selectedCable ? selectedCable.id : null;

  const inspectionAutoRotateRef = useRef<boolean>(false);
  inspectionAutoRotateRef.current = isInspectionAutoRotate;

  const showCablesRef = useRef<boolean>(true);
  showCablesRef.current = showCables;

  const activeGroupRef = useRef<CableSignalGroup | 'all'>('all');
  activeGroupRef.current = activeCableGroup;

  const showGridRef = useRef<boolean>(false);
  showGridRef.current = showGrid;

  const enableRipplesRef = useRef<boolean>(true);
  enableRipplesRef.current = enableRipples;

  const isSensorModeRef = useRef<boolean>(false);
  isSensorModeRef.current = benchMode === 'sensores';

  const showCalipersRef = useRef<boolean>(false);
  showCalipersRef.current = showCalipers;

  const updateRotation = useCallback((newX: number, newY: number) => {
    rotRef.current = { rotX: newX, rotY: newY };
    setRotX(newX);
    setRotY(newY);
  }, []);

  const handleSelectView = useCallback((targetRotX: number, targetRotY: number) => {
    focusTargetRef.current = null;
    setIsInspectionAutoRotate(false);
    animTargetRef.current = { targetX: targetRotX, targetY: targetRotY };
  }, []);

  const setPresetView = (preset: ViewPreset) => {
    focusTargetRef.current = null;
    setIsInspectionAutoRotate(false);
    switch (preset) {
      case 'iso':
        animTargetRef.current = { targetX: 0.38, targetY: -0.65, targetCamZ: 560 };
        setIsExploded(false);
        break;
      case 'top':
        animTargetRef.current = { targetX: Math.PI / 2 - 0.04, targetY: 0, targetCamZ: 580 };
        break;
      case 'front':
        animTargetRef.current = { targetX: 0.08, targetY: 0, targetCamZ: 520 };
        break;
      case 'right':
        animTargetRef.current = { targetX: 0.15, targetY: -Math.PI / 2, targetCamZ: 520 };
        break;
      case 'left':
        animTargetRef.current = { targetX: 0.15, targetY: Math.PI / 2, targetCamZ: 520 };
        break;
      case 'wiring':
        animTargetRef.current = { targetX: 0.52, targetY: -0.35, targetCamZ: 460 };
        setActiveCableGroup('all');
        setShowCables(true);
        break;
      case 'exploded':
        setIsExploded(true);
        animTargetRef.current = { targetX: 0.42, targetY: -0.75, targetCamZ: 620 };
        break;
    }
  };

  const handleSelectMode = (mode: BenchViewMode) => {
    setBenchMode(mode);
    switch (mode) {
      case 'montagem':
        setIsExploded(false);
        setActiveCableGroup('all');
        setPresetView('iso');
        break;
      case 'explodida':
        setIsExploded(true);
        setPresetView('exploded');
        break;
      case 'conexoes':
        setIsExploded(false);
        setActiveCableGroup('all');
        setPresetView('wiring');
        break;
      case 'sensores':
        setIsExploded(false);
        focusTargetRef.current = null;
        animTargetRef.current = { targetX: 0.22, targetY: -0.75, targetCamZ: 260 };
        break;
    }
  };

  const handleFitToView = useCallback(() => {
    setPresetView('iso');
  }, []);

  const restoreInspectionVisibility = useCallback(() => {
    inspectionVisibilityRef.current.forEach(({ object, visible }) => {
      object.visible = visible;
    });
    inspectionVisibilityRef.current = [];
  }, []);

  const closeComponentInspection = useCallback(() => {
    if (inspectionObjectRef.current && inspectionBaseRotationRef.current) {
      inspectionObjectRef.current.rotation.copy(inspectionBaseRotationRef.current);
    }
    restoreInspectionVisibility();
    inspectionAngleRef.current = 0;
    inspectionObjectRef.current = null;
    inspectionBaseRotationRef.current = null;
    setIsInspectionAutoRotate(false);
    setSelectedComp(null);
  }, [restoreInspectionVisibility]);

  // O foco 3D é modal: ESC fecha a inspeção e devolve o foco ao canvas.
  useEffect(() => {
    if (!selectedComp) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeComponentInspection();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedComp, closeComponentInspection]);

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // =========================================================================
  // MONTAGEM THREE.JS DA BANCADA MECATRÔNICA
  // =========================================================================
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // 1. Cena e Câmera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06090d);

    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 3500);
    camera.position.set(0, 235, 560);
    const defaultCameraTarget = new THREE.Vector3(0, 70, 0);
    camera.lookAt(defaultCameraTarget);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !lowPowerMode,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      const fallback = document.createElement('div');
      fallback.className = 'h-full grid place-items-center bg-[#06090d] text-slate-300 font-mono text-xs p-6 text-center';
      fallback.textContent = 'Viewer 3D indisponível neste ambiente: WebGL não foi inicializado.';
      mount.appendChild(fallback);
      return () => {
        if (mount.contains(fallback)) mount.removeChild(fallback);
      };
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(lowPowerMode ? 1.0 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = enableShadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // 2. Iluminação PBR da Bancada
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.85);
    keyLight.position.set(180, 340, 220);
    keyLight.castShadow = enableShadows;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0008;
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x38bdf8, 0.65, 500);
    fillLight.position.set(-160, 100, -140);
    scene.add(fillLight);

    const tankLight = new THREE.PointLight(0x0284c7, 1.1, 360);
    tankLight.position.set(85, 140, -10);
    scene.add(tankLight);

    // 3. Piso e Grid de Engenharia
    const floorGeo = new THREE.PlaneGeometry(600, 500);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Piso limpo de estúdio com acabamento fosco


    // Grupo Raiz
    const benchGroup = new THREE.Group();
    scene.add(benchGroup);
    const sceneRegistry = new SceneObjectRegistry();
    let sceneDisposed = false;
    const bbPosition = getSceneObject('BB1')?.positionMm ?? [-105, 4.25, -50];
    const u1Position = getSceneObject('U1')?.positionMm ?? [-128, 11.5, -50];
    const ledPosition = getSceneObject('D1')?.positionMm ?? [-65, 12, -65];
    const buzzerPosition = getSceneObject('BZ1')?.positionMm ?? [-45, 13.25, -45];
    const pn532Position = getSceneObject('RFID1')?.positionMm ?? [-5, 28, -105];

    // Zona seca explícita: toda a eletrônica permanece fora do tanque e da tampa.
    const dryBayGroup = new THREE.Group();
    dryBayGroup.name = 'DRY_ELECTRONICS_BAY — electronics outside water';
    dryBayGroup.position.set(-105, 2.8, -50);
    const dryBayBase = new THREE.Mesh(
      new THREE.BoxGeometry(190, 2.2, 104),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.72, metalness: 0.12 }),
    );
    dryBayBase.name = 'Baia seca de eletrônica';
    dryBayGroup.add(dryBayBase);
    benchGroup.add(dryBayGroup);

    // Dicionário de objetos clicáveis para Raycasting
    const pickableObjects: { mesh: THREE.Object3D; compKey?: string; cableId?: string }[] = [];

    // Assets de referência carregados sob demanda. Cada callback oculta a
    // geometria didática somente depois que o GLB chega, mantendo a cena
    // utilizável quando o servidor não servir um asset público.
    const referenceLoader = new GLTFLoader();
    const loadReferenceAsset = (
      path: string,
      targetGroup: THREE.Group,
      designator: string,
      componentKey: string,
      fallbackNodes: THREE.Object3D[],
      options: {
        registryId?: string;
        position?: [number, number, number];
        rotation?: [number, number, number];
        onLoaded?: (root: THREE.Object3D) => void;
      } = {},
    ) => {
      referenceLoader.load(
        path,
        (gltf) => {
          if (sceneDisposed) {
            gltf.scene.traverse((node) => {
              if (node instanceof THREE.Mesh) node.geometry.dispose();
            });
            return;
          }
          fallbackNodes.forEach((node) => { node.visible = false; });
          gltf.scene.name = `${designator} — documented reference GLB`;
          if (options.position) gltf.scene.position.set(...options.position);
          if (options.rotation) gltf.scene.rotation.set(...options.rotation);
          gltf.scene.traverse((node) => {
            if (node instanceof THREE.Mesh) {
              node.castShadow = enableShadows;
              node.receiveShadow = true;
              node.userData.componentKey = componentKey;
            }
          });
          targetGroup.add(gltf.scene);
          sceneRegistry.register(options.registryId ?? designator, gltf.scene, { designator, collisionClass: 'DOCUMENTED_REFERENCE_ASSET', verified: false });
          pickableObjects.push({ mesh: gltf.scene, compKey: componentKey });
          options.onLoaded?.(gltf.scene);
        },
        undefined,
        () => {
          // O fallback continua sendo a referência visual quando o GLB não estiver disponível.
        },
      );
    };

    // =========================================================================
    // 4. TAPETE ESD PROFISSIONAL COM RÉGUA MILIMÉTRICA E TERMINAL DE TERRA (0, 1.5, 0)
    // =========================================================================
    const matGeo = new THREE.BoxGeometry(380, 3, 260);
    const matMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Tapete antiestático azul-ardósia escuro profissional
      roughness: 0.85,
      metalness: 0.05,
    });
    const matMesh = new THREE.Mesh(matGeo, matMat);
    matMesh.position.set(0, 1.5, 0);
    matMesh.receiveShadow = true;
    benchGroup.add(matMesh);

    // Moldura perimétrica fina biselada grafite (apenas nas 4 bordas externas, sem cobrir o topo)
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x090d14, roughness: 0.6 });
    const fTop = new THREE.Mesh(new THREE.BoxGeometry(384, 1.5, 2.5), frameMat);
    fTop.position.set(0, 2.25, -131.25);
    const fBot = new THREE.Mesh(new THREE.BoxGeometry(384, 1.5, 2.5), frameMat);
    fBot.position.set(0, 2.25, 131.25);
    const fLeft = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.5, 264), frameMat);
    fLeft.position.set(-191.25, 2.25, 0);
    const fRight = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.5, 264), frameMat);
    fRight.position.set(191.25, 2.25, 0);
    benchGroup.add(fTop, fBot, fLeft, fRight);

    // Linha de régua milimétrica serigrafada discreta ao longo da borda frontal (Y=3.02)
    const rulerGroup = new THREE.Group();
    rulerGroup.position.set(0, 3.02, 122);
    const rulerTickMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
    for (let r = -180; r <= 180; r += 10) {
      const isMajor = r % 50 === 0;
      const tickGeo = new THREE.PlaneGeometry(0.8, isMajor ? 6.0 : 3.0);
      const tick = new THREE.Mesh(tickGeo, rulerTickMat);
      tick.rotation.x = -Math.PI / 2;
      tick.position.x = r;
      rulerGroup.add(tick);
    }
    benchGroup.add(rulerGroup);

    // Stud de aterramento ESD metálico no canto superior esquerdo
    const esdStud = new THREE.Mesh(
      new THREE.CylinderGeometry(4, 4, 3, 16),
      new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95, roughness: 0.2 })
    );
    esdStud.position.set(-180, 4.5, -120);
    benchGroup.add(esdStud);

    // =========================================================================
    // 5. PROTOBOARD SOLDERLESS MB-102 830 PONTOS (-80, 7.5, 20) — CLASSE B
    // =========================================================================
    const bbGroup = new THREE.Group();
    bbGroup.position.set(bbPosition[0], bbPosition[1], bbPosition[2]);

    const bbBody = new THREE.Mesh(
      new THREE.BoxGeometry(165, 8.5, 55),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35 })
    );
    bbBody.castShadow = enableShadows;
    bbBody.receiveShadow = true;
    bbGroup.add(bbBody);

    // Canaleta central de 0.3" (7.62mm) para encapsulamento DIP
    const gutter = new THREE.Mesh(
      new THREE.BoxGeometry(162, 1.6, 4.0),
      new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.5 })
    );
    gutter.position.set(0, 4.1, 0);
    bbGroup.add(gutter);

    // Linhas de barramento serigrafadas (Vermelha +5V / Azul GND)
    const redRailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const blueRailMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });

    const rail1 = new THREE.Mesh(new THREE.BoxGeometry(156, 0.2, 1.2), redRailMat);
    rail1.position.set(0, 4.3, -23);
    const rail2 = new THREE.Mesh(new THREE.BoxGeometry(156, 0.2, 1.2), blueRailMat);
    rail2.position.set(0, 4.3, -20);
    const rail3 = new THREE.Mesh(new THREE.BoxGeometry(156, 0.2, 1.2), redRailMat);
    rail3.position.set(0, 4.3, 20);
    const rail4 = new THREE.Mesh(new THREE.BoxGeometry(156, 0.2, 1.2), blueRailMat);
    rail4.position.set(0, 4.3, 23);
    bbGroup.add(rail1, rail2, rail3, rail4);

    // Matriz de contatos internos da protoboard (pontos de conexão)
    const pinHoleMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
    const holeGeo = new THREE.BoxGeometry(0.8, 0.2, 0.8);
    for (let r = -70; r <= 70; r += 7.62) {
      const h1 = new THREE.Mesh(holeGeo, pinHoleMat);
      h1.position.set(r, 4.3, -12);
      const h2 = new THREE.Mesh(holeGeo, pinHoleMat);
      h2.position.set(r, 4.3, 12);
      bbGroup.add(h1, h2);
    }

    // Travas laterais em cauda de andorinha (referência visual; confirmar no MB-102 recebido)
    const dovetailMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35 });
    [-50, 0, 50].forEach((dx) => {
      const mTab = new THREE.Mesh(new THREE.BoxGeometry(6.0, 6.0, 2.5), dovetailMat);
      mTab.position.set(dx, 0, 28.75);
      bbGroup.add(mTab);
      const fSlot = new THREE.Mesh(new THREE.BoxGeometry(6.4, 6.4, 1.0), new THREE.MeshBasicMaterial({ color: 0xcbd5e1 }));
      fSlot.position.set(dx, 0, -28.0);
      bbGroup.add(fSlot);
    });

    benchGroup.add(bbGroup);
    sceneRegistry.register('BB1', bbGroup, { designator: 'BB1', collisionClass: 'SOLID_BASE' });
    pickableObjects.push({ mesh: bbBody, compKey: 'breadboard_830' });
    loadReferenceAsset('/models/reference/mb102-830-reference.glb', bbGroup, 'BB1', 'breadboard_830', [...bbGroup.children]);

    // =========================================================================
    // 6. ESP32-S3 DevKitC-1 v1.1 na baia seca — GLB detalhado Classe B
    // =========================================================================
    const espGroup = new THREE.Group();
    espGroup.position.set(u1Position[0], u1Position[1], u1Position[2]);
    espGroup.name = 'ESP32 fallback detailed procedural reference';

    const espPcb = new THREE.Mesh(
      new THREE.BoxGeometry(25.5, 1.6, 68.0),
      new THREE.MeshStandardMaterial({ color: 0x090e17, roughness: 0.35 })
    );
    espPcb.castShadow = enableShadows;
    espPcb.receiveShadow = true;
    espGroup.add(espPcb);

    // Área de Keepout da Antena RF (Golden PCB trace)
    const antTrace = new THREE.Mesh(
      new THREE.BoxGeometry(18, 0.2, 11),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.15 })
    );
    antTrace.position.set(0, 0.9, -24);
    espGroup.add(antTrace);

    // Módulo WROOM-1: Blindagem de Alumínio (Can metálico)
    const espCan = new THREE.Mesh(
      new THREE.BoxGeometry(18, 2.8, 23.5),
      new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.88, roughness: 0.22 })
    );
    espCan.position.set(0, 2.0, 5);
    espCan.castShadow = enableShadows;
    espGroup.add(espCan);

    // Fallback: duas portas Micro-USB (UART/PROG e OTG), caso o GLB não carregue.
    const usbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.92, roughness: 0.2 });
    const usbProg = new THREE.Mesh(new THREE.BoxGeometry(8.8, 3.2, 7.2), usbMat);
    usbProg.position.set(0, 2.0, 33);
    const usbProgCavity = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.2, 0.9), new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.45 }));
    usbProgCavity.position.set(0, 2.1, 36.65);
    const usbOtg = new THREE.Mesh(new THREE.BoxGeometry(8.8, 3.2, 7.2), usbMat);
    usbOtg.position.set(0, 2.0, -33);
    const usbOtgCavity = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.2, 0.9), new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.45 }));
    usbOtgCavity.position.set(0, 2.1, -36.65);
    espGroup.add(usbProg, usbProgCavity, usbOtg, usbOtgCavity);

    // Botões táteis BOOT e RESET (SMD)
    const btnMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.4 });
    const btnActuator = new THREE.MeshStandardMaterial({ color: 0xe4e4e7, metalness: 0.7 });
    const btnBoot = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.8, 3.5), btnMat);
    btnBoot.position.set(-7, 1.4, 25);
    const btnBootCap = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.6, 12), btnActuator);
    btnBootCap.position.set(-7, 2.4, 25);

    const btnRst = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.8, 3.5), btnMat);
    btnRst.position.set(7, 1.4, 25);
    const btnRstCap = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.6, 12), btnActuator);
    btnRstCap.position.set(7, 2.4, 25);
    espGroup.add(btnBoot, btnBootCap, btnRst, btnRstCap);

    // LED RGB WS2812 status
    const rgbLed = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 1.0, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.2, emissive: 0x16a34a, emissiveIntensity: 0.5 })
    );
    rgbLed.position.set(0, 1.2, 22);
    espGroup.add(rgbLed);

    // Barras de pinos 2x22 machos (Pinos reais dourados)
    const pinHeaderMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 });
    const goldPinMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.1 });
    const headerStripLeft = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3.0, 56), pinHeaderMat);
    headerStripLeft.position.set(-11.43, -1.8, 2);
    const headerStripRight = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3.0, 56), pinHeaderMat);
    headerStripRight.position.set(11.43, -1.8, 2);

    const pinPinsLeft = new THREE.Mesh(new THREE.BoxGeometry(0.64, 6.0, 54), goldPinMat);
    pinPinsLeft.position.set(-11.43, -4.5, 2);
    const pinPinsRight = new THREE.Mesh(new THREE.BoxGeometry(0.64, 6.0, 54), goldPinMat);
    pinPinsRight.position.set(11.43, -4.5, 2);
    espGroup.add(headerStripLeft, headerStripRight, pinPinsLeft, pinPinsRight);

    benchGroup.add(espGroup);
    sceneRegistry.register('U1', espGroup, { designator: 'U1', collisionClass: 'ACTIVE_MODULE' });
    pickableObjects.push({ mesh: espCan, compKey: 'esp32_s3_devkit' });
    pickableObjects.push({ mesh: espPcb, compKey: 'esp32_s3_devkit' });

    // GLB detalhado reconstruído a partir da documentação oficial Espressif.
    let espAssetRoot: THREE.Object3D | null = null;
    const espLoader = new GLTFLoader();
    espLoader.load(
      '/models/official/espressif-esp32-s3-devkitc-1-v1.1.glb',
      (gltf) => {
        if (sceneDisposed) {
          gltf.scene.traverse((node) => {
            if (node instanceof THREE.Mesh) node.geometry.dispose();
          });
          return;
        }
        espAssetRoot = gltf.scene;
        espAssetRoot.name = 'ESP32-S3-DevKitC-1-N8R8 v1.1 — detailed reference GLB';
        espAssetRoot.position.set(u1Position[0], u1Position[1], u1Position[2]);
        espAssetRoot.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.castShadow = enableShadows;
            node.receiveShadow = true;
            node.userData.componentKey = 'esp32_s3_devkit';
          }
        });
        espGroup.visible = false;
        benchGroup.add(espAssetRoot);
        sceneRegistry.register('U1', espAssetRoot, { designator: 'U1', collisionClass: 'ACTIVE_MODULE', verified: false });
        pickableObjects.push({ mesh: espAssetRoot, compKey: 'esp32_s3_devkit' });
      },
      undefined,
      () => {
        // Mantém o fallback geométrico apenas se o GLB local não estiver disponível.
      },
    );

    // Plugue e cabo externo USB-C da fonte/host; as portas da DevKitC são Micro-USB.
    const usbPlug = new THREE.Mesh(
      new THREE.BoxGeometry(11, 5.5, 22),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 })
    );
    usbPlug.position.set(u1Position[0], u1Position[1] + 4.5, u1Position[2] + 45);
    usbPlug.castShadow = enableShadows;
    benchGroup.add(usbPlug);
    pickableObjects.push({ mesh: usbPlug, compKey: 'usb_cable_assembly' });

    // Origem física do cabo USB: o cabo não começa em um ponto abstrato no
    // espaço; ele sai de um bloco de host/fonte fixado na borda da bancada.
    const externalHostGroup = new THREE.Group();
    externalHostGroup.name = 'EXTERNAL_USB_HOST — fixed bench edge source';
    externalHostGroup.position.set(-170, 8, -5);
    const externalHostBody = new THREE.Mesh(
      new THREE.BoxGeometry(22, 12, 20),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.62, metalness: 0.18 }),
    );
    externalHostBody.position.x = -10;
    const externalHostPort = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 5.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.75, roughness: 0.28 }),
    );
    externalHostPort.position.x = 0;
    externalHostGroup.add(externalHostBody, externalHostPort);
    benchGroup.add(externalHostGroup);
    sceneRegistry.register('EXT_USB', externalHostGroup, { designator: 'HOST', collisionClass: 'POWER_SOURCE' });

    // =========================================================================
    // 7. INDICADORES NA PROTOBOARD: LED STATUS D1 & BUZZER ATIVO BZ1
    // =========================================================================
    // LED Verde 5mm + Resistor 220Ω no GPIO4 (-20, 11.5, 22)
    const ledIndicatorGroup = new THREE.Group();
    ledIndicatorGroup.position.set(ledPosition[0], ledPosition[1], ledPosition[2]);
    const rLeadMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.2 });

    const rLed = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 5.5, 12), new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6 }));
    rLed.rotation.x = Math.PI / 2;
    rLed.position.set(0, 1.5, 4);
    const rLedLead = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 10, 8), rLeadMat);
    rLedLead.position.set(0, 0, 4);
    ledIndicatorGroup.add(rLed, rLedLead);

    const ledLensGeo = new THREE.CylinderGeometry(2.5, 2.5, 4.5, 16);
    const ledDomeGeo = new THREE.SphereGeometry(2.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const ledMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x16a34a,
      emissiveIntensity: 0.65,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9,
    });
    const ledBody = new THREE.Mesh(ledLensGeo, ledMat);
    ledBody.position.set(0, 2.5, 0);
    const ledDome = new THREE.Mesh(ledDomeGeo, ledMat);
    ledDome.position.set(0, 4.75, 0);

    const ledLead1 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 6, 8), rLeadMat);
    ledLead1.position.set(-1.27, -0.5, 0);
    const ledLead2 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 6, 8), rLeadMat);
    ledLead2.position.set(1.27, -0.5, 0);
    ledIndicatorGroup.add(ledBody, ledDome, ledLead1, ledLead2);

    benchGroup.add(ledIndicatorGroup);
    sceneRegistry.register('D1', ledIndicatorGroup, { designator: 'D1', collisionClass: 'PASSIVE_COMPONENT' });
    pickableObjects.push({ mesh: ledBody, compKey: 'led_indicator' });
    pickableObjects.push({ mesh: ledDome, compKey: 'led_indicator' });
    loadReferenceAsset('/models/reference/kingbright-wp7113gd-reference.glb', ledIndicatorGroup, 'D1', 'led_indicator', [...ledIndicatorGroup.children]);

    // Buzzer ativo Same Sky CMI-1295IC-0385T THT 12mm (-5, 11.5, 20)
    const buzzerGroup = new THREE.Group();
    buzzerGroup.position.set(buzzerPosition[0], buzzerPosition[1], buzzerPosition[2]);

    const bzBodyMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 });
    const bzBody = new THREE.Mesh(new THREE.CylinderGeometry(6.0, 6.0, 9.5, 24), bzBodyMat);
    bzBody.position.set(0, 4.75, 0);
    bzBody.castShadow = enableShadows;

    const bzHole = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.6, 0.5, 16),
      new THREE.MeshBasicMaterial({ color: 0x09090b })
    );
    bzHole.position.set(0, 9.55, 0);

    const bzPlus = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xa1a1aa, side: THREE.DoubleSide })
    );
    bzPlus.rotation.x = -Math.PI / 2;
    bzPlus.position.set(3.5, 9.55, 0);

    const bzPin1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 6, 8), rLeadMat);
    bzPin1.position.set(0, -1.0, 3.81);
    const bzPin2 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 6, 8), rLeadMat);
    bzPin2.position.set(0, -1.0, -3.81);
    buzzerGroup.add(bzBody, bzHole, bzPlus, bzPin1, bzPin2);

    benchGroup.add(buzzerGroup);
    sceneRegistry.register('BZ1', buzzerGroup, { designator: 'BZ1', collisionClass: 'ACTIVE_MODULE' });
    pickableObjects.push({ mesh: bzBody, compKey: 'buzzer_active' });
    loadReferenceAsset('/models/reference/samesky-cmi-1295ic-0385t-reference.glb', buzzerGroup, 'BZ1', 'buzzer_active', [...buzzerGroup.children]);

    // =========================================================================
    // 8. SEN0311 / A02YYUW — asset documentado, centralizado na tampa
    // =========================================================================
    const tankDefinition = getSceneObject('TK1');
    const tankPosition = tankDefinition?.positionMm ?? [85, 84, -10];

    const TANK_GEOMETRY_RELEASED = true;
    // =========================================================================
    // 9. TANQUE E TAMPA REAIS (somente após gate de geometria)
    // =========================================================================
    const tankGroup = new THREE.Group();
    tankGroup.position.set(tankPosition[0], tankPosition[1] - TANK_SPEC.outerHeightMm / 2, tankPosition[2]);

    const tankOuterDiameter = TANK_SPEC.outerDiameterMm;
    const tankInnerDiameter = TANK_SPEC.innerDiameterMm;
    const tankOuterRadius = tankOuterDiameter / 2;
    const tankInnerRadius = tankInnerDiameter / 2;
    const tankWallThickness = TANK_SPEC.wallMm;
    const innerHeight = TANK_SPEC.innerHeightMm;
    const tankBottomThickness = TANK_SPEC.wallMm;
    const tankBodyHeight = innerHeight + tankBottomThickness;
    const tankHeight = tankBodyHeight;

    // Geometria cilíndrica FG-TANK-5L-CYL-R1. A capacidade geométrica é
    // calculada por πr²h; a calibração da peça fabricada permanece pendente.
    const tankShellGeo = new THREE.CylinderGeometry(
      tankOuterRadius,
      tankOuterRadius,
      tankBodyHeight,
      96,
      1,
      true,
    );

    // Materiais ópticos de referência para acrílico transparente.
    const outerPmmaMatBack = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      transmission: tankOpacityRef.current,
      opacity: 1.0,
      transparent: true,
      roughness: 0.05,
      ior: 1.491,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const outerPmmaMatFront = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: tankOpacityRef.current,
      opacity: 1.0,
      transparent: true,
      roughness: 0.07,
      ior: 1.491,
      side: THREE.FrontSide,
      depthWrite: false,
    });
    const innerPmmaMatFront = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: tankOpacityRef.current,
      opacity: 1.0,
      transparent: true,
      roughness: 0.06,
      ior: 1.491,
      side: THREE.FrontSide,
      depthWrite: false,
    });

    // Parede cilíndrica transparente aberta no topo para não ocultar o volume.
    const outerShellMesh = new THREE.Mesh(tankShellGeo, outerPmmaMatBack);
    outerShellMesh.position.y = tankBodyHeight / 2;
    outerShellMesh.renderOrder = 1;
    tankGroup.add(outerShellMesh);

    const innerShellMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(tankInnerRadius, tankInnerRadius, innerHeight, 96, 1, true),
      innerPmmaMatFront,
    );
    innerShellMesh.position.y = tankBottomThickness + innerHeight / 2;
    innerShellMesh.renderOrder = 2;
    tankGroup.add(innerShellMesh);

    // Fundo espesso do tanque em acrílico (renderOrder: 1)
    const bottomMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(tankOuterRadius, tankOuterRadius, tankBottomThickness, 96),
      outerPmmaMatFront,
    );
    bottomMesh.position.y = tankBottomThickness / 2;
    bottomMesh.renderOrder = 1;
    tankGroup.add(bottomMesh);

    // Coluna de água cilíndrica da baseline (volume nominal, não calibração).
    const waterGeo = new THREE.CylinderGeometry(tankInnerRadius, tankInnerRadius, 1, 96);
    // Material estável para WebGL: a refração transmissiva do MeshPhysical
    // cria artefatos radiais em alguns drivers e faz a água parecer um feixe
    // de cabos. A transparência PBR mantém volume, cor e contraste sem
    // desenhar linhas internas que não existem na bancada.
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      opacity: 0.78,
      transparent: true,
      roughness: 0.12,
      metalness: 0.02,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.renderOrder = 3;
    tankGroup.add(waterMesh);

    // Menisco superior da água e anel de tensão superficial (renderOrder: 4)
    const waterSurface = new THREE.Mesh(
      new THREE.CircleGeometry(tankInnerRadius, 96),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.06,
        metalness: 0.15,
      })
    );
    waterSurface.rotation.x = -Math.PI / 2;
    waterSurface.renderOrder = 4;
    tankGroup.add(waterSurface);

    const meniscusRing = new THREE.Mesh(
      new THREE.RingGeometry(tankInnerRadius - 1.2, tankInnerRadius, 96),
      new THREE.MeshStandardMaterial({
        color: 0x0369a1,
        roughness: 0.08,
        transparent: true,
        opacity: 0.75,
      })
    );
    meniscusRing.rotation.x = -Math.PI / 2;
    meniscusRing.renderOrder = 4;
    tankGroup.add(meniscusRing);

    // Borda física mínima: apenas a espessura do acrílico, sem graduação
    // decorativa. A leitura de volume fica no painel e na superfície da água,
    // mantendo o tanque legível sem transformar o recipiente em uma gaiola de linhas.
    const rimMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: tankOpacityRef.current,
      opacity: 0.34,
      transparent: true,
      roughness: 0.16,
      ior: 1.491,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const rimTubeRadius = Math.max(0.28, tankWallThickness / 6);
    const rimRadius = tankInnerRadius + tankWallThickness / 2;
    const bottomRim = new THREE.Mesh(new THREE.TorusGeometry(rimRadius, rimTubeRadius, 8, 96), rimMaterial);
    bottomRim.position.y = tankBottomThickness;
    tankGroup.add(bottomRim);
    const topRim = new THREE.Mesh(new THREE.TorusGeometry(rimRadius, rimTubeRadius, 8, 96), rimMaterial);
    topRim.position.y = tankBodyHeight;
    tankGroup.add(topRim);

    // =========================================================================
    // 10. TAMPA FG-TANK-5L-CYL-R1, SUPORTE, PN532 E PROBE SEN0311
    // =========================================================================
    const lidAssemblyGroup = new THREE.Group();
    lidAssemblyGroup.position.y = tankHeight;

    const lidMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(tankOuterRadius, tankOuterRadius, 5, 96),
      new THREE.MeshPhysicalMaterial({
        color: 0xe2e8f0,
        transmission: 0.62,
        opacity: 0.54,
        transparent: true,
        roughness: 0.14,
        ior: 1.491,
        depthWrite: false,
      })
    );
    lidMesh.position.y = 2.5;
    lidMesh.castShadow = enableShadows;
    lidAssemblyGroup.add(lidMesh);

    // Fallback visual do probe A02YYUW/SEN0311. O GLB documentado abaixo o
    // substitui quando carregado; o fallback permanece para modo offline.
    const probeGeo = new THREE.CylinderGeometry(5, 5, 20, 24);
    const probeMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.2,
    });
    const probeMesh = new THREE.Mesh(probeGeo, probeMat);
    probeMesh.position.set(0, -6, 0);
    probeMesh.castShadow = enableShadows;
    lidAssemblyGroup.add(probeMesh);

    // Disco de suporte paramétrico do probe (não assumir rosca M20).
    const probeFlange = new THREE.Mesh(
      new THREE.CylinderGeometry(7.0, 7.0, 3.0, 24),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.15 })
    );
    probeFlange.position.set(0, 8.5, 0);
    probeMesh.add(probeFlange);

    // Anel O-Ring de vedação estanque em borracha nitrílica (preto)
    const oRing = new THREE.Mesh(
      new THREE.TorusGeometry(5.2, 0.6, 10, 24),
      new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.85 })
    );
    oRing.rotation.x = Math.PI / 2;
    oRing.position.set(0, 6.8, 0);
    probeMesh.add(oRing);

    // Anéis visuais do suporte; não representam rosca comercial.
    for (let rz = -4; rz <= 4; rz += 2.5) {
      const threadRidge = new THREE.Mesh(
        new THREE.TorusGeometry(5.2, 0.25, 8, 24),
        new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 })
      );
      threadRidge.rotation.x = Math.PI / 2;
      threadRidge.position.set(0, rz, 0);
      probeMesh.add(threadRidge);
    }

    // Face acústica piezoelétrica rebaixada (alumínio escovado) voltada para o líquido
    const piezoFace = new THREE.Mesh(
      new THREE.CircleGeometry(4.0, 24),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.92, roughness: 0.1, side: THREE.DoubleSide })
    );
    piezoFace.rotation.x = Math.PI / 2;
      piezoFace.position.set(0, -10.05, 0);
    probeMesh.add(piezoFace);

    // Prensa-cabo traseiro no topo e alívio de tensão do cabo coaxial
    const cableGland = new THREE.Mesh(
      new THREE.CylinderGeometry(4.5, 5.5, 6.0, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })
    );
    cableGland.position.set(0, 12.0, 0);
    probeMesh.add(cableGland);

    let sensorAssetRoot: THREE.Object3D | null = null;
    loadReferenceAsset(
      '/models/reference/dfrobot-sen0311-a02yyuw-reference.glb',
      lidAssemblyGroup,
      'SEN1',
      'a02yyuw_sen0311',
      [probeMesh],
      { registryId: 'SEN1_PROBE', onLoaded: (root) => { sensorAssetRoot = root; } },
    );

    // Suporte acrílico transparente para o PN532 montado em base sólida na bancada
    const pn532DryGroup = new THREE.Group();
    pn532DryGroup.name = 'PN532 V4 — dry external front support';
    pn532DryGroup.position.set(pn532Position[0], pn532Position[1] - 15.5, pn532Position[2]);
    benchGroup.add(pn532DryGroup);

    // 1. Placa base de sustentação no tapete ESD (Y = -9.5 a -7.5)
    const nfcBasePlate = new THREE.Mesh(
      new THREE.BoxGeometry(48, 2.0, 48),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65, metalness: 0.25 })
    );
    nfcBasePlate.position.set(0, -8.5, 0);
    nfcBasePlate.receiveShadow = true;
    pn532DryGroup.add(nfcBasePlate);

    // 2. Quatro pés antiderrapantes de borracha apoiados no tapete ESD (Y = -9.5)
    const footMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.95 });
    const footGeo = new THREE.CylinderGeometry(3.5, 4.0, 1.0, 16);
    [
      [-18, -9.0, -17],
      [18, -9.0, -17],
      [-18, -9.0, 17],
      [18, -9.0, 17],
    ].forEach(([fx, fy, fz]) => {
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.position.set(fx, fy, fz);
      pn532DryGroup.add(foot);
    });

    // 3. Quatro pilares verticais em alumínio anodizado conectando a base ao suporte
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.88, roughness: 0.22 });
    const pillarGeo = new THREE.CylinderGeometry(2.5, 2.5, 16.25, 16);
    [
      [-18, 0.625, -17],
      [18, 0.625, -17],
      [-18, 0.625, 17],
      [18, 0.625, 17],
    ].forEach(([px, py, pz]) => {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(px, py, pz);
      pillar.castShadow = enableShadows;
      pn532DryGroup.add(pillar);
    });

    // 4. Placa de acrílico cristal de fixação do PN532 (Y = 10)
    const nfcBracket = new THREE.Mesh(
      new THREE.BoxGeometry(46, 2.5, 46),
      new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.85, roughness: 0.15 })
    );
    nfcBracket.position.set(0, 10, 0);
    pn532DryGroup.add(nfcBracket);

    // 5. Porcas serrilhadas de retenção M3 no topo da placa de acrílico
    const nutMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.92, roughness: 0.18 });
    const nutGeo = new THREE.CylinderGeometry(3.0, 3.0, 1.8, 6);
    [
      [-18, 11.5, -17],
      [18, 11.5, -17],
      [-18, 11.5, 17],
      [18, 11.5, 17],
    ].forEach(([nx, ny, nz]) => {
      const nut = new THREE.Mesh(nutGeo, nutMat);
      nut.position.set(nx, ny, nz);
      pn532DryGroup.add(nut);
    });

    // 6. Quatro espaçadores de nylon M3 entre o acrílico e a PCB do PN532
    const standoffMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
    const standoffGeo = new THREE.CylinderGeometry(1.6, 1.6, 5, 12);
    [
      [-18, 12.5, -17],
      [18, 12.5, -17],
      [-18, 12.5, 17],
      [18, 12.5, 17],
    ].forEach(([sx, sy, sz]) => {
      const so = new THREE.Mesh(standoffGeo, standoffMat);
      so.position.set(sx, sy, sz);
      pn532DryGroup.add(so);
    });

    // Módulo PN532 Breakout PCB (Classe C)
    const nfcPcb = new THREE.Mesh(
      new THREE.BoxGeometry(42.7, 1.6, 40.4),
      new THREE.MeshStandardMaterial({ color: 0x4c1d95, roughness: 0.4 })
    );
    nfcPcb.position.set(0, 15.5, 0);
    nfcPcb.castShadow = enableShadows;
    pn532DryGroup.add(nfcPcb);

    // 4 Furos de fixação M3 com anéis metalizados em ouro ENIG nos vértices
    const nfcEnigMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.2 });
    [
      [-18, -17],
      [18, -17],
      [-18, 17],
      [18, 17],
    ].forEach(([hx, hz]) => {
      const pad = new THREE.Mesh(new THREE.RingGeometry(1.6, 2.8, 16), nfcEnigMat);
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(hx, 0.82, hz);
      nfcPcb.add(pad);
    });

    // CI NXP PN532 em encapsulamento QFN-40 central
    const pn532Ic = new THREE.Mesh(
      new THREE.BoxGeometry(6.0, 0.9, 6.0),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3 })
    );
    pn532Ic.position.set(0, 1.25, 0);
    nfcPcb.add(pn532Ic);

    // Cristal cerâmico oscilador 27.12 MHz
    const oscCrystal = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.8, 2.5),
      new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9 })
    );
    oscCrystal.position.set(7.0, 1.2, 2.0);
    nfcPcb.add(oscCrystal);

    // Regulador de tensão LDO 3.3V SOT-223
    const sot223 = new THREE.Mesh(
      new THREE.BoxGeometry(6.5, 1.6, 3.5),
      new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.5 })
    );
    sot223.position.set(-10.0, 1.6, 8.0);
    nfcPcb.add(sot223);

    // Antena planar impressa (espiras concêntricas em ouro ENIG)
    for (let radius = 12; radius <= 18; radius += 1.8) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(radius, radius + 0.6, 32),
        nfcEnigMat
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(0, 0.82, 0);
      nfcPcb.add(ring);
    }

    // Chaves de seleção de modo SPI (DIP switches SEL0/SEL1)
    const dipSwitchNfc = new THREE.Mesh(
      new THREE.BoxGeometry(6, 2, 4),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 })
    );
    dipSwitchNfc.position.set(14, 16.5, 12);
    // Sliders brancos da chave DIP (SEL0=0, SEL1=1 para modo SPI)
    const sliderMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const slider0 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 1.2), sliderMat);
    slider0.position.set(-1.4, 0.7, -0.6);
    const slider1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 1.2), sliderMat);
    slider1.position.set(1.4, 0.7, 0.6);
    dipSwitchNfc.add(slider0, slider1);
    pn532DryGroup.add(dipSwitchNfc);

    const nfcHeader = new THREE.Mesh(
      new THREE.BoxGeometry(15, 3.5, 2.5),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 })
    );
    nfcHeader.position.set(-18, 17.0, -10);
    pn532DryGroup.add(nfcHeader);

    // Asset real do fabricante: o STEP oficial do ELECHOUSE PN532 V4 foi
    // convertido para GLB offline e só substitui a geometria didática quando
    // o arquivo termina de carregar. Assim a bancada continua utilizável se
    // um servidor local for iniciado sem os assets públicos.
    let nfcAssetRoot: THREE.Object3D | null = null;
    const nfcLoader = new GLTFLoader();
    nfcLoader.load(
      '/models/official/elechouse-pn532-v4.glb',
      (gltf) => {
        if (sceneDisposed) {
          gltf.scene.traverse((node) => {
            if (node instanceof THREE.Mesh) node.geometry.dispose();
          });
          return;
        }
        nfcAssetRoot = gltf.scene;
        nfcAssetRoot.name = 'PN532 V4 — ELECHOUSE / official GLB';
        nfcAssetRoot.rotation.x = -Math.PI / 2;
        nfcAssetRoot.position.set(19.35, 17.4, 0);
        nfcAssetRoot.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.castShadow = enableShadows;
            node.receiveShadow = true;
            node.userData.componentKey = 'pn532_breakout';
          }
        });
        // Os elementos abaixo são fallback visual e não ficam duplicados no
        // estado normal da cena quando o modelo oficial está disponível.
        nfcPcb.visible = false;
        dipSwitchNfc.visible = false;
        nfcHeader.visible = false;
        pn532DryGroup.add(nfcAssetRoot);
        sceneRegistry.register('RFID1', nfcAssetRoot, { designator: 'RFID1', collisionClass: 'STANDALONE_MODULE', verified: true });
        pickableObjects.push({ mesh: nfcAssetRoot, compKey: 'pn532_breakout' });
      },
      undefined,
      () => {
        // Mantém o fallback nominal quando o GLB não estiver acessível.
      },
    );

    // Ímã de neodímio N35 com polos identificados (Norte vermelho / Sul azul)
    const magnetNorth = new THREE.Mesh(
      new THREE.CylinderGeometry(5, 5, 1.25, 20),
      new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6, roughness: 0.3 })
    );
    magnetNorth.position.set(tankOuterRadius - 5, 5.125, 0);
    const magnetSouth = new THREE.Mesh(
      new THREE.CylinderGeometry(5, 5, 1.25, 20),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.6, roughness: 0.3 })
    );
    magnetSouth.position.set(tankOuterRadius - 5, 3.875, 0);
    lidAssemblyGroup.add(magnetNorth, magnetSouth);

    // Reed Switch na lateral superior do recipiente (Classe C)
    const reedGroup = new THREE.Group();
    reedGroup.position.set(tankOuterRadius - 5, tankHeight - 10, 0);

    const reedGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.6, 12, 16),
      new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.94, roughness: 0.05, transparent: true })
    );
    reedGlass.rotation.z = Math.PI / 2;

    const glassCap1 = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 12), reedGlass.material);
    glassCap1.position.set(6, 0, 0);
    const glassCap2 = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 12), reedGlass.material);
    glassCap2.position.set(-6, 0, 0);

    // Duas lâminas ferromagnéticas de ferro-níquel (Fe-Ni) sobrepostas com gap de 0.2mm
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.15 });
    const bladeLeft = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.35, 0.8), bladeMat);
    bladeLeft.position.set(-2.2, 0.12, 0);
    const bladeRight = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.35, 0.8), bladeMat);
    bladeRight.position.set(2.2, -0.12, 0);

    // Terminais axiais estanhados
    const leadMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 });
    const lead1 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 8, 8), leadMat);
    lead1.rotation.z = Math.PI / 2;
    lead1.position.set(-9.5, 0, 0);
    const lead2 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 8, 8), leadMat);
    lead2.rotation.z = Math.PI / 2;
    lead2.position.set(9.5, 0, 0);

    reedGroup.add(reedGlass, glassCap1, glassCap2, bladeLeft, bladeRight, lead1, lead2);
    tankGroup.add(reedGroup);
    loadReferenceAsset(
      '/models/reference/mc-38-reed-switch-magnet-reference.glb',
      tankGroup,
      'SW1',
      'reed_switch',
      [reedGroup, magnetNorth, magnetSouth],
      { registryId: 'SW1', position: [tankOuterRadius - 5, tankHeight - 10, 0] },
    );

    // =========================================================================
    // 10.1 FEIXE ACÚSTICO ULTRASSÔNICO & ZONA CEGA (MODO SENSORES)
    // =========================================================================
    const acousticGroup = new THREE.Group();
    tankGroup.add(acousticGroup);

    // Cone acústico de referência (abertura nominal SEN0311; geometria acústica deve ser ensaiada)
    const acousticConeGeo = new THREE.CylinderGeometry(9.5, 46, 1, 32, 1, true);
    const acousticConeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const acousticCone = new THREE.Mesh(acousticConeGeo, acousticConeMat);
    acousticGroup.add(acousticCone);

    // Anel de emissão acústica (pulso ultrassônico propagando)
    const pulseRing = new THREE.Mesh(
      new THREE.RingGeometry(8, 14, 32),
      new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide, transparent: true, opacity: 0.85, depthWrite: false })
    );
    pulseRing.rotation.x = -Math.PI / 2;
    acousticGroup.add(pulseRing);

    // Halo de emissão no transdutor: indica o instante de disparo sem
    // transformar o recipiente inteiro em uma sobreposição permanente.
    const sensorEmitterRing = new THREE.Mesh(
      new THREE.RingGeometry(7, 10, 32),
      new THREE.MeshBasicMaterial({ color: 0x67e8f9, side: THREE.DoubleSide, transparent: true, opacity: 0.72, depthWrite: false }),
    );
    sensorEmitterRing.rotation.x = -Math.PI / 2;
    acousticGroup.add(sensorEmitterRing);

    // Cilindro delimitador da Zona Cega do Sensor (0 a 200mm nominais, proporcional a 22mm no topo)
    const blindZoneMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(18, 18, 22, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide, transparent: true, opacity: 0.38, depthWrite: false })
    );
    blindZoneMesh.position.set(0, tankBodyHeight - 30 - 11, 0);
    acousticGroup.add(blindZoneMesh);

    // Anel de aviso de limite inferior da Zona Cega
    const blindRing = new THREE.Mesh(
      new THREE.RingGeometry(15, 20, 24),
      new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
    );
    blindRing.rotation.x = -Math.PI / 2;
    blindRing.position.set(0, tankBodyHeight - 30 - 22, 0);
    acousticGroup.add(blindRing);

    acousticGroup.visible = false;

    tankGroup.add(lidAssemblyGroup);
    tankGroup.visible = TANK_GEOMETRY_RELEASED;
    benchGroup.add(tankGroup);
    sceneRegistry.register('TK1', tankGroup, { designator: 'TK1', collisionClass: 'TRANSPARENT_FLUID_CONTAINER' });
    sceneRegistry.register('LID1', lidAssemblyGroup, { designator: 'LID1', collisionClass: 'LID_ASSEMBLY' });
    sceneRegistry.register('SEN1_PROBE', probeMesh, { designator: 'SEN1', collisionClass: 'SENSOR_PROBE' });
    sceneRegistry.register('WATER_VOLUME', waterMesh, { collisionClass: 'FLUID_VOLUME' });
    sceneRegistry.register('RFID1', pn532DryGroup, { designator: 'RFID1', collisionClass: 'STANDALONE_MODULE' });

    pickableObjects.push({ mesh: outerShellMesh, compKey: 'tank_cylinder' });
    pickableObjects.push({ mesh: probeMesh, compKey: 'a02yyuw_sen0311' });
    pickableObjects.push({ mesh: nfcPcb, compKey: 'pn532_breakout' });
    pickableObjects.push({ mesh: reedGlass, compKey: 'reed_switch' });

    // =========================================================================
    // 11. LINHAS DE GUIA AXIAIS DA VISTA EXPLODIDA (KINEMATIC ALIGNMENT GUIDES)
    // =========================================================================
    const explodeGuidesGroup = new THREE.Group();
    benchGroup.add(explodeGuidesGroup);

    const guideLineMat = new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      dashSize: 3,
      gapSize: 2,
      transparent: true,
      opacity: 0.6,
    });

    const createDashedGuide = (p1: [number, number, number], p2: [number, number, number]) => {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...p1), new THREE.Vector3(...p2)]);
      const l = new THREE.Line(g, guideLineMat);
      l.computeLineDistances();
      return l;
    };

    // Guias dos 4 furos M3 do PN532 no suporte frontal seco
    [
      [pn532Position[0] - 18, pn532Position[1] + 10, pn532Position[2] - 17],
      [pn532Position[0] + 18, pn532Position[1] + 10, pn532Position[2] - 17],
      [pn532Position[0] - 18, pn532Position[1] + 10, pn532Position[2] + 17],
      [pn532Position[0] + 18, pn532Position[1] + 10, pn532Position[2] + 17],
    ].forEach(([gx, gy, gz]) => {
      explodeGuidesGroup.add(createDashedGuide([gx, gy, gz], [gx, gy + 65, gz]));
    });

    // Guia central da sonda ultrassônica
    explodeGuidesGroup.add(createDashedGuide([tankPosition[0], tankPosition[1] + 56, tankPosition[2]], [tankPosition[0], tankPosition[1] + 251, tankPosition[2]]));

    // Guias das barras de pinos do ESP32 para a protoboard
    explodeGuidesGroup.add(createDashedGuide([u1Position[0] - 11.43, u1Position[1] - 0.5, u1Position[2]], [u1Position[0] - 11.43, u1Position[1] + 25, u1Position[2]]));
    explodeGuidesGroup.add(createDashedGuide([u1Position[0] + 11.43, u1Position[1] - 0.5, u1Position[2]], [u1Position[0] + 11.43, u1Position[1] + 25, u1Position[2]]));

    // =========================================================================
    // 12. CABOS COM ROTA FÍSICA E TERMINAIS DUPONT (TUBEGEOMETRY)
    // =========================================================================
    const cableMeshes: {
      id: string;
      group: CableSignalGroup;
      mesh: THREE.Mesh;
      baseMat: THREE.Material;
      highlightMat: THREE.Material;
      dimMat: THREE.Material;
    }[] = [];

    const cableRootGroup = new THREE.Group();
    benchGroup.add(cableRootGroup);

    PHYSICAL_WIRING_REGISTRY.forEach((cable) => {
      // A rota é resolvida pelo ID do cabo no registro físico.
      const waypoints = cable.waypoints;
      const vectors = waypoints.map((p) => new THREE.Vector3(...p));

      // Catmull-Rom spline centripetally tensionada gera curvas suaves e realistas
      // de chicote mecatrônico sem quinas poligonais quebradas ou loops anormais.
      const curve = new THREE.CatmullRomCurve3(vectors, false, 'centripetal', 0.5);

      const segments = lowPowerMode ? 32 : 64;
      const radius = cable.diameterMm / 2;
      const tubeGeo = new THREE.TubeGeometry(curve, segments, radius, 10, false);

      const baseMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(cable.colorHex),
        roughness: 0.45,
        metalness: 0.15,
      });

      const highlightMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(cable.colorHex),
        emissive: new THREE.Color(cable.colorHex),
        emissiveIntensity: 0.9,
        roughness: 0.2,
      });

      const dimMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x334155),
        transparent: true,
        opacity: 0.2,
        roughness: 0.9,
      });

      const tubeMesh = new THREE.Mesh(tubeGeo, baseMat);
      tubeMesh.castShadow = enableShadows;
      cableRootGroup.add(tubeMesh);

      // Terminais DuPont retangulares pretos (2.54 x 2.54 x 9.5 mm) orientados verticalmente
      // assentados nos furos da protoboard e nas barras de pinos (sem quinas no ar)
      const dupontGeo = new THREE.BoxGeometry(2.54, 9.5, 2.54);
      const dupontMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.55 });
      const pinCollarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
      const bootMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });

      const createTerminal = (pos: THREE.Vector3, isOrigin: boolean) => {
        const terminalGroup = new THREE.Group();
        terminalGroup.name = `${cable.id} terminal ${isOrigin ? (cable.fromTerminal ?? 'origem') : (cable.toTerminal ?? 'destino')}`;
        terminalGroup.userData.cableId = cable.id;

        // Corpo plástico principal do terminal DuPont
        const body = new THREE.Mesh(dupontGeo, dupontMat);
        body.position.y = 4.75;
        body.castShadow = enableShadows;
        terminalGroup.add(body);

        // Anel metálico de contato niquelado
        const collar = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 2.2), pinCollarMat);
        collar.position.y = 0.6;
        terminalGroup.add(collar);

        // Bota de alívio de tensão onde o fio flexível entra
        const boot = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.4, 2.0, 8), bootMat);
        boot.position.y = 9.8;
        terminalGroup.add(boot);

        terminalGroup.position.copy(pos);
        return terminalGroup;
      };

      const d1 = createTerminal(vectors[0], true);
      const d2 = createTerminal(vectors[vectors.length - 1], false);
      cableRootGroup.add(d1, d2);

      cableMeshes.push({
        id: cable.id,
        group: cable.group,
        mesh: tubeMesh,
        baseMat,
        highlightMat,
        dimMat,
      });
      sceneRegistry.register(cable.id, tubeMesh, { collisionClass: 'FLEXIBLE_CABLE' });

      pickableObjects.push({ mesh: tubeMesh, cableId: cable.id });
    });

    // =========================================================================
    // 13. RÉGUA E LINHAS DE COTA MILIMÉTRICAS (CALIPERS)
    // =========================================================================
    const caliperGroup = new THREE.Group();
    benchGroup.add(caliperGroup);

    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8 });
    const createCaliperLine = (p1: [number, number, number], p2: [number, number, number]) => {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...p1),
        new THREE.Vector3(...p2),
      ]);
      return new THREE.Line(geo, lineMat);
    };

    // Cota 1: Comprimento da Protoboard (165mm)
    caliperGroup.add(createCaliperLine([-162.5, 18, 50], [2.5, 18, 50]));
    caliperGroup.add(createCaliperLine([-162.5, 15, 50], [-162.5, 21, 50]));
    caliperGroup.add(createCaliperLine([2.5, 15, 50], [2.5, 21, 50]));

    // Cota 2: Distância entre Centro da Protoboard e Centro do Tanque (165mm)
    caliperGroup.add(createCaliperLine([-80, 5, 60], [85, 5, 60]));
    caliperGroup.add(createCaliperLine([-80, 2, 60], [-80, 8, 60]));
    caliperGroup.add(createCaliperLine([85, 2, 60], [85, 8, 60]));

    caliperGroup.visible = showCalipersRef.current;

    // =========================================================================
    // 14. INTERAÇÃO ORBITAL E RAYCASTING
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();
    let isMouseDown = false;
    let startedOnCanvas = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let totalDragDistance = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isMouseDown = true;
      startedOnCanvas = true;
      focusTargetRef.current = null;
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

      const newY = rotRef.current.rotY + deltaX * 0.007;
      let newX = rotRef.current.rotX + deltaY * 0.007;
      newX = Math.max(-Math.PI / 4, Math.min(Math.PI / 2.1, newX));

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

    const inspectionRootFor = (componentKey: string, fallback: THREE.Object3D): THREE.Object3D => {
      switch (componentKey) {
        case 'esp32_s3_devkit': return espAssetRoot ?? espGroup;
        case 'pn532_breakout': return nfcAssetRoot ?? pn532DryGroup;
        case 'a02yyuw_sen0311': return sensorAssetRoot ?? probeMesh;
        case 'reed_switch': return reedGroup;
        case 'led_indicator': return ledIndicatorGroup;
        case 'buzzer_active': return buzzerGroup;
        default: return fallback;
      }
    };

    const isolateForInspection = (target: THREE.Object3D) => {
      inspectionVisibilityRef.current = [];
      benchGroup.traverse((object) => {
        inspectionVisibilityRef.current.push({ object, visible: object.visible });
      });

      // Keep only the selected object and its ancestor path. This makes the
      // component appear alone while the UI overlay blurs the rest of the CAD
      // stage; the original visibility is restored on close/Escape.
      const keepPath = (object: THREE.Object3D): boolean => {
        const containsTarget = object === target || object.children.some(keepPath);
        if (object !== benchGroup && !containsTarget) object.visible = false;
        return containsTarget;
      };
      keepPath(benchGroup);
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isMouseDown) return;
      isMouseDown = false;

      // O mouseup pode chegar ao window com target=body mesmo quando o gesto
      // começou no canvas. A origem do gesto é a autoridade para distinguir
      // uma seleção 3D de um clique em controles HTML.
      if (!startedOnCanvas) return;
      startedOnCanvas = false;

      if (totalDragDistance < 5 && mount) {
        const rect = mount.getBoundingClientRect();
        mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouseCoord, camera);
        const meshesToTest = pickableObjects.filter((p) => p.mesh.visible).map((p) => p.mesh);
        const intersects = raycaster.intersectObjects(meshesToTest, true);

        if (intersects.length > 0) {
          const hit = intersects[0];
          const found = pickableObjects.find(
            (p) => p.mesh === hit.object || isDescendant(p.mesh, hit.object)
          );
          if (found) {
            if (found.cableId) {
              const cb = PHYSICAL_WIRING_REGISTRY.find((c) => c.id === found.cableId);
              if (cb) {
                restoreInspectionVisibility();
                setSelectedCable(cb);
                setSelectedComp(null);
              }
            } else if (found.compKey && FUELGUARD_CAD_LIBRARY[found.compKey]) {
              restoreInspectionVisibility();
              const inspectionRoot = inspectionRootFor(found.compKey, found.mesh);
              isolateForInspection(inspectionRoot);
              // A inspeção sempre parte da montagem nominal: o componente
              // não pode parecer solto por herdar uma vista explodida.
              setIsExploded(false);
              isExplodedTargetRef.current = 0;
              setSelectedComp(FUELGUARD_CAD_LIBRARY[found.compKey]);
              setIsInspectionAutoRotate(true);
              inspectionObjectRef.current = inspectionRoot;
              inspectionBaseRotationRef.current = inspectionRoot.rotation.clone();
              inspectionAngleRef.current = 0;
              setSelectedCable(null);
              const bounds = new THREE.Box3().setFromObject(inspectionRoot);
              const sphere = bounds.getBoundingSphere(new THREE.Sphere());
              focusTargetRef.current = {
                object: inspectionRoot,
                distance: Math.min(520, Math.max(125, sphere.radius * 4.2)),
              };
            }
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.22;
      camera.position.z = Math.max(220, Math.min(800, camera.position.z));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // =========================================================================
    // 15. LOOP DE ANIMAÇÃO 60 FPS
    // =========================================================================
    let animId: number;
    let curExplode = 0;
    let collisionFrame = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Suavização do ViewCube / Preset transitions
      if (animTargetRef.current) {
        const { targetX, targetY, targetCamZ } = animTargetRef.current;
        const curX = rotRef.current.rotX;
        const curY = rotRef.current.rotY;

        const diffX = targetX - curX;
        const diffY = targetY - curY;

        if (Math.abs(diffX) < 0.005 && Math.abs(diffY) < 0.005) {
          updateRotation(targetX, targetY);
          if (targetCamZ) camera.position.z = targetCamZ;
          animTargetRef.current = null;
        } else {
          updateRotation(curX + diffX * 0.15, curY + diffY * 0.15);
          if (targetCamZ) {
            camera.position.z += (targetCamZ - camera.position.z) * 0.12;
          }
        }
      }

      benchGroup.rotation.y = rotRef.current.rotY;
      benchGroup.rotation.x = rotRef.current.rotX;

      const focus = focusTargetRef.current;
      if (focus) {
        const focusBounds = new THREE.Box3().setFromObject(focus.object);
        const focusCenter = focusBounds.getCenter(new THREE.Vector3());
        const focusSphere = focusBounds.getBoundingSphere(new THREE.Sphere());
        const focusPosition = focusCenter.clone().add(new THREE.Vector3(0, Math.max(42, focusSphere.radius * 0.65), focus.distance));
        camera.position.lerp(focusPosition, 0.12);
        camera.lookAt(focusCenter);
        if (inspectionAutoRotateRef.current && inspectionObjectRef.current === focus.object && inspectionBaseRotationRef.current) {
          inspectionAngleRef.current = (inspectionAngleRef.current + 0.012) % (Math.PI * 2);
          const base = inspectionBaseRotationRef.current;
          focus.object.rotation.set(base.x, base.y + inspectionAngleRef.current, base.z);
        }
      } else {
        camera.lookAt(defaultCameraTarget);
      }

      collisionFrame += 1;
      if (collisionFrame % 20 === 0) {
        const probeLid = sceneRegistry.checkCollision('SEN1_PROBE', 'LID1');
        const dryBayChecks = [
          sceneRegistry.checkCollision('U1', 'TK1'),
          sceneRegistry.checkCollision('BB1', 'TK1'),
          sceneRegistry.checkCollision('D1', 'TK1'),
          sceneRegistry.checkCollision('BZ1', 'TK1'),
          sceneRegistry.checkCollision('RFID1', 'TK1'),
        ];
        const checks = [probeLid, ...dryBayChecks];
        const nextStatus: CollisionStatus = checks.some((check) => check.status === 'FAIL')
          ? 'FAIL'
          : checks.some((check) => check.status === 'WARNING')
            ? 'WARNING'
            : checks.every((check) => check.status === 'PASS')
              ? 'PASS'
              : 'PENDING_PHYSICAL_EVIDENCE';
        setCollisionStatus(nextStatus);
      }

      // Interpolação suave da Vista Explodida (Exploded View)
      const targetExp = isExplodedTargetRef.current;
      curExplode += (targetExp - curExplode) * 0.12;

      // Deslocamentos axiais controlados sem perda de alinhamento
      const lidExplodeY = curExplode * 65;
      const probeExplodeY = curExplode * 30;
      const espExplodeY = curExplode * 25;

      lidAssemblyGroup.position.y = tankHeight + lidExplodeY;
      const now = Date.now();
      const sensorMotion = isSensorModeRef.current ? Math.sin(now * 0.009) * 0.16 : 0;
      probeMesh.position.y = -6 + probeExplodeY + sensorMotion;
      if (sensorAssetRoot) {
        sensorAssetRoot.position.y = sensorMotion;
        sensorAssetRoot.rotation.z = sensorMotion * 0.012;
      }
      espGroup.position.y = u1Position[1] + espExplodeY;
      if (espAssetRoot) espAssetRoot.position.y = u1Position[1] + espExplodeY;

      // Linhas de guia visíveis apenas quando explodido
      explodeGuidesGroup.visible = curExplode > 0.04;
      guideLineMat.opacity = Math.min(0.7, curExplode * 0.85);


      // Altura dinâmica e micro-ondulação da água potável
      const currentPct = waterLevelRef.current;
      if (currentPct <= 0) {
        waterMesh.visible = false;
        waterSurface.visible = false;
        meniscusRing.visible = false;
      } else {
        waterMesh.visible = true;
        waterSurface.visible = true;
        meniscusRing.visible = true;
        const curWaterHeight = innerHeight * (currentPct / 100);
        waterMesh.scale.set(1, Math.max(0.001, curWaterHeight), 1);
        waterMesh.position.y = tankBottomThickness + curWaterHeight / 2;

        // Sutil oscilação de menisco (ondulação discreta de líquido)
        const ripple = enableRipplesRef.current ? Math.sin(Date.now() * 0.0025) * 0.3 : 0;
        waterSurface.position.y = tankBottomThickness + curWaterHeight + ripple;
        meniscusRing.position.y = tankBottomThickness + curWaterHeight + ripple;
      }

      // Modo Sensores: feixe acústico ultrassônico e pulso propagando
      const isSensorsMode = isSensorModeRef.current;
      acousticGroup.visible = isSensorsMode;
      if (isSensorsMode) {
        const probeY = tankHeight + lidExplodeY - 6;
        const waterTopY = currentPct <= 0 ? tankBottomThickness : (innerHeight * (currentPct / 100) + tankBottomThickness);
        const beamSpan = Math.max(3, probeY - waterTopY);

        acousticCone.scale.set(1, beamSpan, 1);
        acousticCone.position.set(0, probeY - beamSpan / 2, 0);

        const pulseCycle = (now * 0.0016) % 1.0;
        const pulseY = probeY - beamSpan * pulseCycle;
        pulseRing.position.set(0, pulseY, 0);
        pulseRing.scale.setScalar(0.7 + pulseCycle * 1.6);
        sensorEmitterRing.position.set(0, probeY - 0.8, 0);
        const emitterPhase = (now * 0.004) % 1.0;
        sensorEmitterRing.scale.setScalar(0.8 + emitterPhase * 0.9);
        (sensorEmitterRing.material as THREE.MeshBasicMaterial).opacity = 0.82 - emitterPhase * 0.52;
      }

      // Transparência configurável dos cilindros de acrílico PMMA (PBR)
      outerPmmaMatBack.transmission = tankOpacityRef.current;
      outerPmmaMatFront.transmission = tankOpacityRef.current;
      innerPmmaMatFront.transmission = tankOpacityRef.current;

      // Visibilidade e Destaque de Cabos (Modo Conexões)
      const isVisible = showCablesRef.current;
      const selId = selectedCableIdRef.current;
      const curGrp = activeGroupRef.current;

      cableRootGroup.visible = isVisible;
      caliperGroup.visible = showCalipersRef.current;

      if (isVisible) {
        cableMeshes.forEach((item) => {
          const matchGroup = curGrp === 'all' || item.group === curGrp;
          if (!matchGroup) {
            item.mesh.visible = false;
          } else {
            item.mesh.visible = true;
            if (selId) {
              if (item.id === selId) {
                item.mesh.material = item.highlightMat;
              } else {
                item.mesh.material = item.dimMat;
              }
            } else {
              item.mesh.material = item.baseMat;
            }
          }
        });
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
      sceneDisposed = true;
      sceneRegistry.dispose();
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [enableShadows, lowPowerMode]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#06090d] rounded-xl border border-inst-border overflow-hidden select-none flex flex-col font-ui"
    >
      {/* 1. ViewCube Interativo no Canto Superior Esquerdo */}
      <div className="absolute top-3 left-3 z-20 flex flex-col items-center">
        <ViewCube rotX={rotX} rotY={rotY} onSelectView={handleSelectView} />
      </div>

      {/* 2. Barra Superior de Alternância, Auditoria e Presets */}
      <div className="absolute top-3 right-3 z-40 flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => setSelectedComp(FUELGUARD_CAD_LIBRARY['pn532_breakout'])}
          className="hidden lg:flex items-center gap-1.5 rounded-md border border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/80 px-2 py-1 text-[10px] text-emerald-300 hover:text-white shadow-xs cursor-pointer transition"
          title="Clique para inspecionar o PN532 V4 em 360° e ver simulador RFID"
        >
          <ShieldCheck className="w-3 h-3" />
          <span>PN532 V4 • GLB oficial (360°)</span>
        </button>
        <button
          onClick={() => setSelectedComp(FUELGUARD_CAD_LIBRARY['esp32_s3_devkit'])}
          className="hidden lg:flex items-center gap-1.5 rounded-md border border-sky-500/40 hover:border-sky-400 bg-sky-950/80 px-2 py-1 text-[10px] text-sky-300 hover:text-white shadow-xs cursor-pointer transition"
          title="Clique para inspecionar o ESP32-S3 em 360° e ver simulador de firmware"
        >
          <Cpu className="w-3 h-3" />
          <span>ESP32-S3 • GLB detalhado (360°)</span>
        </button>
        <div
          className={`hidden lg:flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] shadow-xs ${
            collisionStatus === 'FAIL'
              ? 'border-rose-500/60 bg-rose-950/80 text-rose-300'
              : collisionStatus === 'PASS'
                ? 'border-emerald-500/40 bg-emerald-950/80 text-emerald-300'
                : 'border-amber-500/50 bg-amber-950/80 text-amber-300'
          }`}
          title="Consulta BVH de colisão; assets sem evidência física permanecem pendentes"
        >
          <ShieldCheck className="w-3 h-3" />
          <span>BVH • {collisionStatus}</span>
        </div>
        {/* Alternador de Vistas Principais */}
        <div className="flex items-center space-x-1 bg-[#0b0f15]/95 backdrop-blur-xs border border-inst-border p-1 rounded-sm shadow-xs">
          <button
            onClick={() => onSelectTab && onSelectTab('assembly')}
            className="px-2.5 py-1 rounded-xs bg-fuelguard-green text-white font-bold flex items-center gap-1 shadow-xs"
          >
            <Compass className="w-3 h-3" />
            <span>● Assembly 3D</span>
          </button>
          <button
            onClick={() => onSelectTab && onSelectTab('3d')}
            className="px-2.5 py-1 rounded-xs hover:bg-inst-subtle text-inst-secondary hover:text-inst-primary transition flex items-center gap-1"
          >
            <Box className="w-3 h-3" />
            <span>PCB 3D</span>
          </button>
          <button
            onClick={() => onSelectTab && onSelectTab('schematic')}
            className="px-2.5 py-1 rounded-xs hover:bg-inst-subtle text-inst-secondary hover:text-inst-primary transition flex items-center gap-1"
          >
            <Cpu className="w-3 h-3" />
            <span>Schematic</span>
          </button>
        </div>

        {/* Botão de Auditoria Mecatrônica (Assembly Auditor) */}
        <button
          onClick={() => setIsAuditModalOpen(true)}
          className={`px-2.5 py-1 rounded-sm border shadow-xs text-xs font-bold transition flex items-center gap-1.5 ${
            auditReport.isCompliant
              ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
              : 'bg-rose-950/80 border-rose-600 text-rose-300'
          }`}
          title="Abrir Relatório de Auditoria Mecânica e Elétrica da Montagem"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Auditoria: {auditReport.isCompliant ? 'Conforme (15 Regras)' : 'Atenção Requerida'}</span>
        </button>

        {/* Presets de Câmera Mecânica */}
        <div className="hidden lg:flex items-center space-x-1 bg-[#0b0f15]/95 backdrop-blur-xs border border-inst-border p-1 rounded-sm shadow-xs text-[11px]">
          <button
            onClick={() => setPresetView('iso')}
            className="px-2 py-0.5 rounded-xs hover:bg-inst-subtle text-inst-secondary hover:text-fuelguard-green transition"
            title="Vista Isométrica Axonométrica"
          >
            ISO
          </button>
          <button
            onClick={() => setPresetView('top')}
            className="px-2 py-0.5 rounded-xs hover:bg-inst-subtle text-inst-secondary hover:text-fuelguard-green transition"
            title="Vista Superior Ortográfica (Plano Z)"
          >
            Top
          </button>
          <button
            onClick={() => setPresetView('front')}
            className="px-2 py-0.5 rounded-xs hover:bg-inst-subtle text-inst-secondary hover:text-fuelguard-green transition"
            title="Vista Frontal (Conectores e Alturas)"
          >
            Front
          </button>
          <button
            onClick={() => setPresetView('right')}
            className="px-2 py-0.5 rounded-xs hover:bg-inst-subtle text-inst-secondary hover:text-fuelguard-green transition"
            title="Vista Lateral Direita (Perfil Tanque)"
          >
            Right
          </button>
          <button
            onClick={() => setPresetView('wiring')}
            className="px-2 py-0.5 rounded-xs hover:bg-inst-subtle text-amber-400 hover:text-amber-300 transition flex items-center gap-1"
            title="Foco nas Rotas de Fiação"
          >
            <Zap className="w-3 h-3" />
            <span>Rotas</span>
          </button>
        </div>

        <button
          onClick={() => setIsControlPanelOpen((open) => !open)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border shadow-xs text-[11px] transition ${
            isControlPanelOpen
              ? 'bg-sky-950/80 border-sky-500 text-sky-300'
              : 'bg-[#0b0f15]/95 border-inst-border text-inst-secondary hover:text-inst-primary hover:bg-inst-subtle'
          }`}
          title="Abrir ou recolher os controles de nível, transparência e fiação"
          aria-expanded={isControlPanelOpen}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Controles</span>
        </button>

        {/* 4 Modos Oficiais da Bancada: Montagem | Explodida | Conexões | Sensores */}
        <div className="flex items-center space-x-1 bg-[#0b0f15]/95 backdrop-blur-xs border border-inst-border p-1 rounded-sm shadow-xs">
          <button
            onClick={() => handleSelectMode('montagem')}
            className={`px-2.5 py-1 rounded-xs text-xs font-bold transition flex items-center gap-1.5 ${
              benchMode === 'montagem'
                ? 'bg-fuelguard-green text-white shadow-xs'
                : 'text-inst-secondary hover:text-inst-primary hover:bg-inst-subtle'
            }`}
            title="Modo Montagem: Vista física nominal da bancada; validar dimensões no hardware"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Montagem</span>
          </button>
          <button
            onClick={() => handleSelectMode('explodida')}
            className={`px-2.5 py-1 rounded-xs text-xs font-bold transition flex items-center gap-1.5 ${
              benchMode === 'explodida'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-inst-secondary hover:text-inst-primary hover:bg-inst-subtle'
            }`}
            title="Modo Explodida: Deslocamento axial com linhas de alinhamento"
          >
            <Split className="w-3.5 h-3.5" />
            <span>Explodida</span>
          </button>
          <button
            onClick={() => handleSelectMode('conexoes')}
            className={`px-2.5 py-1 rounded-xs text-xs font-bold transition flex items-center gap-1.5 ${
              benchMode === 'conexoes'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-inst-secondary hover:text-inst-primary hover:bg-inst-subtle'
            }`}
            title="Modo Conexões: Destaque da fiação física e barramentos"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Conexões</span>
          </button>
          <button
            onClick={() => handleSelectMode('sensores')}
            className={`px-2.5 py-1 rounded-xs text-xs font-bold transition flex items-center gap-1.5 ${
              benchMode === 'sensores'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-inst-secondary hover:text-inst-primary hover:bg-inst-subtle'
            }`}
            title="Modo Sensores: Feixe acústico ultrassônico, zona cega e tempo de trânsito"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Sensores</span>
          </button>
        </div>

        {/* Ferramentas: Cota/Régua, Cabos, Sombras e Modo Leve */}
        <div className="flex items-center space-x-1 bg-[#0b0f15]/95 backdrop-blur-xs border border-inst-border p-1 rounded-sm shadow-xs">
          <button
            onClick={() => setShowCalipers(!showCalipers)}
            className={`p-1 rounded-xs transition ${
              showCalipers ? 'bg-sky-950 text-sky-400 border border-sky-800' : 'text-inst-secondary hover:text-inst-primary'
            }`}
            title="Ligar/Desligar Linhas de Cota em Milímetros"
          >
            <Ruler className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowCables(!showCables)}
            className={`p-1 rounded-xs transition ${
              showCables ? 'text-emerald-400' : 'text-rose-400'
            }`}
            title="Ocultar/Exibir Chicote de Cabos"
          >
            {showCables ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setEnableShadows(!enableShadows)}
            className={`p-1 rounded-xs transition ${
              enableShadows ? 'text-amber-400' : 'text-inst-muted hover:text-inst-primary'
            }`}
            title="Alternar Sombras Suaves PCF"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1 rounded-xs transition ${
              showGrid ? 'bg-fuelguard-green text-white shadow-xs' : 'text-inst-secondary hover:text-inst-primary'
            }`}
            title="Ligar/Desligar Grade de Piso (Padrão: Desligada para clareza visual)"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setEnableRipples(!enableRipples)}
            className={`p-1 rounded-xs transition ${
              enableRipples ? 'text-sky-400' : 'text-inst-muted hover:text-inst-primary'
            }`}
            title="Ligar/Desligar Ondulação Dinâmica da Água"
          >
            <Waves className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setLowPowerMode(!lowPowerMode)}
            className={`px-1.5 py-0.5 rounded-xs transition text-[10px] font-bold ${
              lowPowerMode
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : 'bg-inst-canvas text-inst-secondary hover:text-inst-primary border border-inst-border'
            }`}
            title="Modo Leve (1x DPR / 30fps para computadores modestos)"
          >
            {lowPowerMode ? '1x' : '2x'}
          </button>
          <button
            onClick={handleFitToView}
            className="p-1 rounded-xs hover:bg-inst-subtle text-inst-secondary hover:text-fuelguard-green transition"
            title="Ajustar e Centralizar Enquadramento"
          >
            <RotateCcw className="w-3.5 h-3.5" />
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

      {/* 3. Controles Flutuantes à Esquerda (Nível de Água, Transparência & Filtro de Fiação) */}
      {isControlPanelOpen && (
      <div className="absolute top-28 left-3 z-20 space-y-2 w-64 max-w-[calc(100%-1.5rem)]">
        {/* HUD Dedicado do Modo Sensores (Caminho Acústico, Zona Cega e Presets) */}
        {benchMode === 'sensores' && (
          <div className="bg-[#0a0f18]/98 backdrop-blur-md border border-sky-500/80 p-3 rounded-sm shadow-overlay text-xs text-inst-primary space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-inst-border pb-1.5">
              <span className="flex items-center gap-1.5 text-sky-400 font-bold uppercase tracking-wider text-[11px]">
                <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                Caminho Acústico (40 kHz)
              </span>
              <span className="px-1.5 py-0.5 rounded-xs bg-sky-950 text-sky-300 font-mono text-[9px] border border-sky-800">
                A02YYUW / SEN0311
              </span>
            </div>

            <div className="space-y-1 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="text-inst-muted font-ui">Sensor:</span>
                <span className="text-inst-primary">Probe central [ENVELOPE PENDENTE]</span>
              </div>
              <div className="flex justify-between">
                <span className="text-inst-muted font-ui">Distância à Água (d):</span>
                <strong className="text-amber-300">Pendente <span className="text-[8px] text-amber-400/80">[MEDIÇÃO]</span></strong>
              </div>
              <div className="flex justify-between">
                <span className="text-inst-muted font-ui">UART:</span>
                <strong className="text-sky-300">9600 8N1 · TX GPIO16</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-inst-muted font-ui">Tanque:</span>
                <strong className="text-amber-300">FG-TANK-5L-CYL-R1 <span className="text-[8px] text-amber-400/80">[BASELINE]</span></strong>
              </div>
            </div>

            {/* Alerta / Conformidade de Zona Cega */}
            <div className="p-1.5 rounded-xs bg-amber-950/40 border border-amber-700/60 text-amber-300 text-[10px] flex items-start gap-1.5">
              <Info className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
              <span className="text-[10px]">Zona cega nominal de 30 mm; a visada, o suporte e a calibração dependem da peça fabricada e do ensaio com água.</span>
            </div>

            {/* Presets Rápidos do Tanque (5 Níveis Oficiais de Teste) */}
            <div className="pt-1.5 border-t border-inst-border">
              <span className="text-[10px] text-inst-muted block mb-1">Perfil de teste nominal (não calibração):</span>
              <div className="grid grid-cols-5 gap-1">
                {[
                  { lvl: 0, label: '0%' },
                  { lvl: 25, label: '25%' },
                  { lvl: 50, label: '50%' },
                  { lvl: 75, label: '75%' },
                  { lvl: 100, label: '100%' },
                ].map(({ lvl, label }) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setIsManualOverride(true);
                      setWaterLevelPct(lvl);
                    }}
                    className={`px-1 py-1 rounded-xs border text-[10px] font-bold text-center transition ${
                      waterLevelPct === lvl
                        ? 'bg-sky-600 text-white border-sky-400'
                        : 'bg-inst-canvas text-inst-secondary hover:text-inst-primary border-inst-border'
                    }`}
                    title={lvl === 0 ? 'Vazio (0%)' : lvl === 100 ? 'Cheio (100%)' : `${lvl}%`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Controle Flutuante de Nível d'Água do Galão */}
        <div className="bg-[#0e141c]/95 backdrop-blur-xs border border-inst-border p-2.5 rounded-sm shadow-xs text-xs text-inst-primary space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 text-sky-400 font-bold">
              <Droplets className="w-3 h-3" />
              Perfil de nível (FG-TANK-5L-CYL-R1)
            </span>
            <span className="text-inst-primary font-bold">
              {waterLevelPct === 0 ? '0% (Vazio)' : waterLevelPct === 100 ? '100% (Cheio)' : `${waterLevelPct}%`}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={waterLevelPct}
            onChange={(e) => {
              setIsManualOverride(true);
              setWaterLevelPct(Number(e.target.value));
            }}
            className="w-full accent-fuelguard-green cursor-pointer h-1.5 bg-inst-canvas rounded-xs"
          />
          <div className="grid grid-cols-5 gap-1 pt-0.5">
            {[
              { lvl: 0, label: '0%' },
              { lvl: 25, label: '25%' },
              { lvl: 50, label: '50%' },
              { lvl: 75, label: '75%' },
              { lvl: 100, label: '100%' },
            ].map(({ lvl, label }) => (
              <button
                key={lvl}
                onClick={() => {
                  setIsManualOverride(true);
                  setWaterLevelPct(lvl);
                }}
                className={`py-0.5 rounded-xs border text-[9px] font-mono font-bold text-center transition ${
                  waterLevelPct === lvl
                    ? 'bg-sky-600 text-white border-sky-400'
                    : 'bg-inst-canvas text-inst-muted hover:text-inst-primary border-inst-border'
                }`}
                title={lvl === 0 ? '0% (Vazio)' : lvl === 100 ? '100% (Cheio)' : `${lvl}%`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Controle paramétrico do CAD da bancada; não representa calibração física */}
        <div className="bg-[#0e141c]/95 backdrop-blur-xs border border-inst-border p-2 rounded-sm shadow-xs text-[10px] text-inst-primary space-y-1">
          <div className="flex justify-between text-inst-muted">
            <span>Transparência do tanque (bloqueada):</span>
            <span className="font-bold text-inst-primary">{Math.round(tankOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="0.98"
            step="0.05"
            value={tankOpacity}
            onChange={(e) => setTankOpacity(Number(e.target.value))}
            className="w-full accent-sky-400 cursor-pointer h-1 bg-inst-canvas rounded-xs"
          />
        </div>

        {/* Filtro de Grupos de Cabos e Redes */}
        <div className="bg-[#0e141c]/95 backdrop-blur-xs border border-inst-border p-2.5 rounded-sm shadow-xs text-xs text-inst-primary space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-inst-muted">
            <span className="flex items-center gap-1 text-inst-secondary font-bold">
              <CableIcon className="w-3 h-3" />
              Filtro de Fiação
            </span>
            {selectedCable && (
              <button
                onClick={() => setSelectedCable(null)}
                className="text-[9px] text-rose-400 hover:underline"
              >
                Limpar Rota
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            <button
              onClick={() => setActiveCableGroup('all')}
              className={`px-2 py-1 rounded-xs border transition text-left ${
                activeCableGroup === 'all'
                  ? 'bg-fuelguard-green/20 border-fuelguard-green text-fuelguard-green font-bold'
                  : 'bg-inst-canvas border-inst-border text-inst-muted hover:text-inst-primary'
              }`}
            >
              Todos ({PHYSICAL_WIRING_REGISTRY.length})
            </button>
            <button
              onClick={() => setActiveCableGroup('power')}
              className={`px-2 py-1 rounded-xs border transition text-left ${
                activeCableGroup === 'power'
                  ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-bold'
                  : 'bg-inst-canvas border-inst-border text-inst-muted hover:text-inst-primary'
              }`}
            >
              Energia / GND
            </button>
            <button
              onClick={() => setActiveCableGroup('spi')}
              className={`px-2 py-1 rounded-xs border transition text-left ${
                activeCableGroup === 'spi'
                  ? 'bg-purple-950/60 border-purple-500 text-purple-300 font-bold'
                  : 'bg-inst-canvas border-inst-border text-inst-muted hover:text-inst-primary'
              }`}
            >
              SPI NFC (4 vias)
            </button>
            <button
              onClick={() => setActiveCableGroup('sensors')}
              className={`px-2 py-1 rounded-xs border transition text-left ${
                activeCableGroup === 'sensors'
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-inst-canvas border-inst-border text-inst-muted hover:text-inst-primary'
              }`}
            >
              Sensores / Eco
            </button>
          </div>
        </div>
      </div>
      )}

      {/* 4. Banner Superior do Modo Conexões (Highlight de Rota Elétrica Ativa) */}
      {selectedCable && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-[#0e141c]/95 backdrop-blur-md border border-fuelguard-green px-4 py-2 rounded-md shadow-overlay text-xs flex items-center gap-3 animate-in fade-in duration-150">
          <div className="w-2.5 h-2.5 rounded-full bg-fuelguard-green animate-pulse" />
          <div>
            <div className="text-[10px] text-inst-muted uppercase">
              Rota Elétrica Ativa: <span className="text-inst-primary font-bold">{selectedCable.netName}</span> • {selectedCable.awgGauge}
            </div>
            <div className="text-[11px] text-inst-secondary font-ui">
              De <strong className="text-inst-primary">{selectedCable.fromComponent} ({selectedCable.fromPin})</strong> até{' '}
              <strong className="text-inst-primary">{selectedCable.toComponent} ({selectedCable.toPin})</strong> • {selectedCable.estimatedLengthMm} mm
            </div>
          </div>
          <button
            onClick={() => setSelectedCable(null)}
            className="p-1 rounded-xs hover:bg-inst-subtle text-inst-muted hover:text-inst-primary"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 5. Viewport Canvas Three.js */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 6. Rodapé com Metadados da Montagem Mecatrônica e Réguas */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2 text-[10px]">
        <button
          onClick={() => setSelectedComp(FUELGUARD_CAD_LIBRARY['esp32_s3_devkit'])}
          className="px-2.5 py-1 rounded-xs bg-[#0e141c]/90 border border-emerald-800 hover:border-fuelguard-green text-emerald-300 hover:text-white flex items-center gap-1.5 shadow-xs cursor-pointer transition"
          title="Clique para inspecionar em 360° e ver simulador funcional do ESP32-S3"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>ESP32-S3 DevKitC-1 v1.1 • Inspeção 360° & Funcionalidades</span>
        </button>
        <button
          onClick={() => setSelectedComp(FUELGUARD_CAD_LIBRARY['pn532_breakout'])}
          className="px-2.5 py-1 rounded-xs bg-[#0e141c]/90 border border-purple-800 hover:border-purple-400 text-purple-300 hover:text-white flex items-center gap-1.5 shadow-xs cursor-pointer transition"
          title="Clique para inspecionar em 360° e ver simulador RFID do PN532"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          <span>Leitor NFC PN532 • Inspeção 360° & RFID</span>
        </button>
        <button
          onClick={() => setSelectedComp(FUELGUARD_CAD_LIBRARY['a02yyuw_sen0311'])}
          className="px-2.5 py-1 rounded-xs bg-[#0e141c]/90 border border-sky-800 hover:border-sky-400 text-sky-300 hover:text-white flex items-center gap-1.5 shadow-xs cursor-pointer transition"
          title="Clique para inspecionar em 360° e ver simulador ultrassônico do SEN0311"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          <span>Sensor SEN0311 • Inspeção 360° & ToF</span>
        </button>
        <button
          onClick={() => setSelectedComp(FUELGUARD_CAD_LIBRARY['reed_switch'])}
          className="px-2.5 py-1 rounded-xs bg-[#0e141c]/90 border border-amber-800 hover:border-amber-400 text-amber-300 hover:text-white flex items-center gap-1.5 shadow-xs cursor-pointer transition"
          title="Clique para inspecionar em 360° e ver simulador de interlock do Reed Switch"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Reed Switch MC-38 • Interlock</span>
        </button>
        <button
          onClick={() => setSelectedComp(FUELGUARD_CAD_LIBRARY['breadboard_830'])}
          className="px-2.5 py-1 rounded-xs bg-[#0e141c]/90 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white flex items-center gap-1.5 shadow-xs cursor-pointer transition"
          title="Clique para inspecionar em 360° a Protoboard MB-102"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>Protoboard MB-102</span>
        </button>
      </div>

      {/* 7. Modal de Auditoria Mecatrônica & Elétrica (Assembly Auditor) */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b0f15] border border-inst-border w-full max-w-2xl max-h-[85vh] rounded-md shadow-overlay flex flex-col overflow-hidden font-ui">
            {/* Cabeçalho do Modal */}
            <div className="p-4 border-b border-inst-border flex items-center justify-between bg-inst-surface/50">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="text-sm font-bold font-display text-inst-primary uppercase tracking-wider">
                    Auditoria Mecatrônica & Elétrica da Montagem
                  </h2>
                  <div className="text-[11px] font-mono text-inst-secondary">
                    Status: <strong className="text-emerald-400">Conforme (Regras de Projeto)</strong> • {auditReport.totalChecks} verificações executadas (6 tolerâncias pendentes de medição física)
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="p-1 rounded-xs hover:bg-inst-subtle text-inst-muted hover:text-inst-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo com os Itens Auditados */}
            <div className="p-4 overflow-y-auto space-y-3 font-mono text-xs">
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-2 rounded-xs bg-emerald-950/40 border border-emerald-800 text-emerald-300">
                  <div className="text-lg font-bold">{auditReport.passCount}</div>
                  <div>Aprovados</div>
                </div>
                <div className="p-2 rounded-xs bg-amber-950/40 border border-amber-800 text-amber-300">
                  <div className="text-lg font-bold">{auditReport.warningCount}</div>
                  <div>Avisos Didáticos</div>
                </div>
                <div className="p-2 rounded-xs bg-rose-950/40 border border-rose-800 text-rose-300">
                  <div className="text-lg font-bold">{auditReport.failCount}</div>
                  <div>Erros Fatais</div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {auditReport.items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xs border text-[11px] space-y-1 ${
                      item.severity === 'PASS'
                        ? 'bg-emerald-950/20 border-emerald-900 text-emerald-200'
                        : item.severity === 'WARNING'
                        ? 'bg-amber-950/20 border-amber-900 text-amber-200'
                        : 'bg-rose-950/20 border-rose-900 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="flex items-center gap-1.5 font-bold">
                        {item.severity === 'PASS' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : item.severity === 'WARNING' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Flame className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span>{item.title}</span>
                      </strong>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-xs font-bold border border-current opacity-80">
                        {item.severity}
                      </span>
                    </div>
                    <p className="font-ui text-inst-secondary text-[11px] leading-relaxed">
                      {item.message}
                    </p>
                    <div className="text-[10px] text-inst-muted font-ui">
                      <strong>Detalhe Técnico:</strong> {item.technicalDetails}
                    </div>
                    {item.mitigationOrAction && (
                      <div className="text-[10px] text-amber-300/90 font-ui pt-0.5">
                        👉 <strong>Ação Recomendada:</strong> {item.mitigationOrAction}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="p-3 border-t border-inst-border bg-inst-surface/50 flex justify-end">
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-1.5 rounded-xs bg-fuelguard-green text-white font-mono font-bold text-xs shadow-xs"
              >
                Concluir Inspeção
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Modal de Inspeção 360° com Foco Isolado, Background Blur e Simulador Funcional */}
      {selectedComp && (
        <Component360InspectorModal
          component={selectedComp}
          onClose={closeComponentInspection}
        />
      )}
    </div>
  );
};
