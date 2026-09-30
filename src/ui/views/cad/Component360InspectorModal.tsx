import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Cpu,
  Layers,
  Activity,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Zap,
  CheckCircle,
  AlertTriangle,
  FileText,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { CadComponentMetadata } from '@/circuit-cad/component-library';
import {
  getCarrierAssetEntry,
  getCarrierAssetStatusClass,
  getCarrierAssetStatusLabel,
} from '@/circuit-cad/carrier-assets';
import { disposeCarrierAsset, loadCarrierAsset } from './carrier-asset-loader';

interface Component360InspectorModalProps {
  component: CadComponentMetadata;
  onClose: () => void;
}

type InspectorTab = 'demo' | 'specs' | 'cad';

export const Component360InspectorModal: React.FC<Component360InspectorModalProps> = ({
  component,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Estados de navegação 3D no visualizador isolado
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const autoRotateRef = useRef<boolean>(isAutoRotate);
  useEffect(() => {
    autoRotateRef.current = isAutoRotate;
  }, [isAutoRotate]);
  const [activeTab, setActiveTab] = useState<InspectorTab>('demo');
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Estados dos simuladores funcionais
  // ESP32-S3 Simulator State
  const [espLogs, setEspLogs] = useState<string[]>([
    '[BOOT] ESP32-S3 Core 0 & 1 inicializados @ 240 MHz',
    '[INIT] FreeRTOS v10.4 ativo. Memória livre: 312 KB Heap',
    '[INIT] SPI Master inicializado (MOSI=11, MISO=13, SCK=12, CS=10)',
    '[INIT] UART1 inicializado em 9600 8N1 no GPIO16',
    '[INIT] GPIO7 configurado como INPUT_PULLUP (Interlock Tampa)',
    '[RUN] vTaskSensorRead executando a cada 100ms...',
  ]);

  // PN532 Simulator State
  const [nfcDistanceMm, setNfcDistanceMm] = useState<number>(18);

  // SEN0311 Simulator State
  const [ultrasonicDistanceMm, setUltrasonicDistanceMm] = useState<number>(65);

  // MC-38 Reed Switch Simulator State
  const [reedDistanceMm, setReedDistanceMm] = useState<number>(5);

  // Breadboard Simulator State
  const [selectedRail, setSelectedRail] = useState<'3V3' | '5V' | 'GND'>('3V3');

  // Three.js instances refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const isMouseDownRef = useRef<boolean>(false);
  const mouseCoordRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const baseCameraDistRef = useRef<number>(120);

  const carrierAsset = useMemo(() => getCarrierAssetEntry(component.id), [component.id]);
  const evidenceClass = carrierAsset?.confidenceLevel ?? component.confidenceLevel;
  const displayPartNumber = carrierAsset?.partNumber ?? component.partNumber;
  const displayRevision = carrierAsset?.revision ?? component.revision;

  // Caminhos legados continuam disponíveis apenas quando o manifesto Carrier
  // não possui uma decisão mais específica para o componente.
  const legacyModelPath = useMemo(() => {
    switch (component.id) {
      case 'esp32_s3_devkit':
        return '/models/official/espressif-esp32-s3-devkitc-1-v1.1.glb';
      case 'pn532_breakout':
        return '/assets/cad/carrier/RFID1/reference-derived.glb';
      case 'a02yyuw_sen0311':
        return '/models/reference/dfrobot-sen0311-a02yyuw-reference.glb';
      case 'reed_switch':
        return '/models/reference/mc-38-reed-switch-magnet-reference.glb';
      case 'breadboard_830':
        return '/models/reference/mb102-830-reference.glb';
      case 'led_indicator':
        return '/models/reference/kingbright-wp7113gd-reference.glb';
      case 'buzzer_active':
        return '/models/reference/samesky-cmi-1295ic-0385t-reference.glb';
      default:
        return null;
    }
  }, [component.id]);

  // O GLB verificado sempre tem prioridade. Referências locais pendentes podem
  // ser inspecionadas para melhorar a geometria, mas continuam com o status
  // pendente e não são tratadas como CAD liberado para fabricação.
  const modelPath = useMemo(() => {
    if (carrierAsset) {
      if (carrierAsset.assetStatus === 'verified') return carrierAsset.assetPath ?? null;
      if (carrierAsset.referenceAssetPath) return carrierAsset.referenceAssetPath;
      if (carrierAsset.assetStatus === 'pending') return null;
    }
    return legacyModelPath;
  }, [carrierAsset, legacyModelPath]);

  const viewportDimensions = carrierAsset?.assetDimensionsMm ?? carrierAsset?.referenceAssetDimensionsMm ?? component.dimensionsMm;
  const hasDedicatedDemo = ['esp32_s3_devkit', 'pn532_breakout', 'a02yyuw_sen0311', 'reed_switch', 'breadboard_830', 'led_indicator', 'buzzer_active'].includes(component.id);
  const componentRole = component.id === 'sn74ahct125n'
    ? 'Buffer lógico quadruplo DIP-14 para acondicionamento dos sinais do Carrier. O modelo renderiza o encapsulamento real da biblioteca KiCad; a lógica funcional continua sendo verificada no circuito elétrico.'
    : component.id === 'voltage_divider'
    ? 'Divisor resistivo de entrada: R1 = 10 kΩ e R2 = 15 kΩ. O GLB representa o corpo axial reutilizável; valores, referências e conexões permanecem separados na BOM.'
    : component.description;

  // Tecla ESC fecha a inspeção
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Inicialização do Three.js isolado
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth || 600;
    const height = canvas.clientHeight || 500;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 1, 1000);
    camera.position.set(0, 35, 120);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Iluminação de estúdio profissional 3-Point
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(60, 90, 80);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.4);
    fillLight.position.set(-80, 40, -40);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfef08a, 1.8);
    rimLight.position.set(0, -60, -90);
    scene.add(rimLight);

    // Pedestal de inspeção elegante com anel concêntrico suave
    const pedestalGroup = new THREE.Group();
    const pedestalRing1 = new THREE.Mesh(
      new THREE.RingGeometry(35, 36.5, 64),
      new THREE.MeshBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
    );
    pedestalRing1.rotation.x = -Math.PI / 2;
    pedestalRing1.position.y = -22;

    const pedestalRing2 = new THREE.Mesh(
      new THREE.RingGeometry(45, 46, 64),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
    );
    pedestalRing2.rotation.x = -Math.PI / 2;
    pedestalRing2.position.y = -22;

    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 160),
      new THREE.ShadowMaterial({ opacity: 0.35 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -22.1;
    shadowPlane.receiveShadow = true;

    pedestalGroup.add(pedestalRing1, pedestalRing2, shadowPlane);
    scene.add(pedestalGroup);

    // Grupo para o modelo
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // Carregamento do modelo 3D
    let isMounted = true;
    setIsLoadingModel(true);

    const createFallbackEnvelope = () => {
      const fallbackGeo = new THREE.BoxGeometry(
        component.dimensionsMm.width,
        component.dimensionsMm.height,
        component.dimensionsMm.depth,
      );
      const envelope = new THREE.LineSegments(
        new THREE.EdgesGeometry(fallbackGeo),
        new THREE.LineBasicMaterial({ color: carrierAsset?.assetStatus === 'pending' ? 0xf59e0b : 0x64748b, transparent: true, opacity: 0.9 }),
      );
      envelope.userData.assetStatus = carrierAsset?.assetStatus ?? 'unavailable';
      envelope.userData.isFallbackEnvelope = true;
      modelGroup.add(envelope);
      setIsLoadingModel(false);
    };

    const focusModel = (root: THREE.Object3D) => {
      const bbox = new THREE.Box3().setFromObject(root);
      const center = bbox.getCenter(new THREE.Vector3());
      root.position.sub(center);

      root.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          if (node.material) {
            const materials = Array.isArray(node.material) ? node.material : [node.material];
            materials.forEach((material) => { material.roughness = Math.min(material.roughness ?? 0.5, 0.6); });
          }
        }
      });

      const focusedBounds = new THREE.Box3().setFromObject(root);
      const sphere = focusedBounds.getBoundingSphere(new THREE.Sphere());
      const targetDist = Math.max(45, sphere.radius * 2.8);
      baseCameraDistRef.current = targetDist;
      camera.position.set(0, targetDist * 0.35, targetDist);
      camera.lookAt(0, 0, 0);
      modelGroup.add(root);
      setIsLoadingModel(false);
    };

    let loadedCarrierRoot: THREE.Object3D | null = null;

    const loadModel = async () => {
      if (carrierAsset?.assetStatus === 'verified' || carrierAsset?.referenceAssetPath) {
        try {
          const loaded = await loadCarrierAsset(component.id, { includeReference: carrierAsset.assetStatus !== 'verified' });
          if (!isMounted) return;
          if (!loaded) {
            createFallbackEnvelope();
            return;
          }
          loadedCarrierRoot = loaded.root;
          focusModel(loaded.root);
          return;
        } catch (error) {
          console.warn('Erro ao carregar asset Carrier:', error);
          if (isMounted) createFallbackEnvelope();
          return;
        }
      }

      if (modelPath) {
      const loader = new GLTFLoader();
      loader.load(
        modelPath,
        (gltf) => {
          if (!isMounted) return;
          focusModel(gltf.scene);
        },
        undefined,
        (err) => {
          console.warn('Erro ao carregar GLB:', err);
          if (isMounted) {
            createFallbackEnvelope();
          }
        }
      );
        return;
      }

      createFallbackEnvelope();
    };

    void loadModel();

    // Interações de mouse (Orbit & Zoom)
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (modelGroupRef.current && autoRotateRef.current) {
        modelGroupRef.current.rotation.y += 0.8 * delta;
      }

      renderer.render(scene, camera);
    };
    animationFrameId = requestAnimationFrame(animate);

    // Redimensionamento
    const handleResize = () => {
      if (!canvas || !renderer || !camera) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (loadedCarrierRoot) disposeCarrierAsset(loadedCarrierRoot);
      modelGroup.traverse((object) => {
        if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.LineSegments)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
      renderer.dispose();
    };
  }, [carrierAsset, component.id, component.dimensionsMm, modelPath]);

  // Controles de mouse para Orbit manual
  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDownRef.current = true;
    mouseCoordRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !modelGroupRef.current) return;
    const deltaX = e.clientX - mouseCoordRef.current.x;
    const deltaY = e.clientY - mouseCoordRef.current.y;
    mouseCoordRef.current = { x: e.clientX, y: e.clientY };

    modelGroupRef.current.rotation.y += deltaX * 0.01;
    modelGroupRef.current.rotation.x += deltaY * 0.01;
    modelGroupRef.current.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, modelGroupRef.current.rotation.x));
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!cameraRef.current) return;
    const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
    const currentDist = cameraRef.current.position.length();
    const newDist = Math.max(25, Math.min(300, currentDist * zoomFactor));
    cameraRef.current.position.setLength(newDist);
    setZoomLevel(Math.round((baseCameraDistRef.current / newDist) * 100) / 100);
  };

  const handleResetView = () => {
    if (modelGroupRef.current) {
      modelGroupRef.current.rotation.set(0, 0, 0);
    }
    if (cameraRef.current) {
      const dist = baseCameraDistRef.current;
      cameraRef.current.position.set(0, dist * 0.35, dist);
      cameraRef.current.lookAt(0, 0, 0);
      setZoomLevel(1.0);
    }
  };

  // Badge de Confiança
  const confidenceBadge = useMemo(() => {
    switch (evidenceClass) {
      case 'A':
        return { label: 'Classe A · CAD Exato Fabricante', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' };
      case 'B':
        return { label: 'Classe B · Reconstrução Fiel Datasheet', color: 'bg-sky-500/20 text-sky-300 border-sky-500/50' };
      case 'C':
        return { label: 'Classe C · Envelope Paramétrico Nominal', color: 'bg-amber-500/20 text-amber-300 border-amber-500/50' };
      case 'D':
      default:
        return { label: 'Classe D · Estimado Experimental', color: 'bg-rose-500/20 text-rose-300 border-rose-500/50' };
    }
  }, [evidenceClass]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-2xl p-3 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspector-title"
    >
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[880px] bg-[#0c121d] border border-fuelguard-green/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <header className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-fuelguard-green/10 border border-fuelguard-green/30 text-fuelguard-green">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  {component.designatorPrefix} · {component.footprintType}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${confidenceBadge.color}`}>
                  {confidenceBadge.label}
                </span>
                {carrierAsset && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getCarrierAssetStatusClass(carrierAsset.assetStatus)}`}>
                    Carrier · {getCarrierAssetStatusLabel(carrierAsset.assetStatus)}
                  </span>
                )}
              </div>
              <h1 id="inspector-title" className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                {component.name}
                <span className="text-xs font-mono font-normal text-slate-400">
                  ({displayPartNumber} Rev {displayRevision})
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
              aria-label="Fechar modal de inspeção"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Body: Split into Left (3D Viewer) and Right (Details & Interactive Demo) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto lg:overflow-hidden">
          {/* LEFT: Isolated 360° Studio Viewport (7 Cols) */}
          <div
            className="lg:col-span-7 relative flex flex-col h-[44vh] min-h-[330px] lg:h-auto lg:min-h-0 bg-radial from-slate-900/90 via-[#090e17] to-[#060a10] border-b lg:border-b-0 lg:border-r border-slate-800 select-none cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
          >
            {/* Top Toolbar overlay on 3D viewport */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-slate-800 backdrop-blur-md pointer-events-auto">
                <button
                  onClick={() => setIsAutoRotate((v) => !v)}
                  className={`p-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                    isAutoRotate
                      ? 'bg-fuelguard-green text-slate-950 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title={isAutoRotate ? 'Pausar rotação contínua' : 'Girar continuamente em 360°'}
                >
                  {isAutoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isAutoRotate ? 'Pausar 360°' : 'Girar 360°'}</span>
                </button>

                <div className="w-px h-4 bg-slate-800" />

                <button
                  onClick={handleResetView}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-mono flex items-center gap-1 transition"
                  title="Restaurar orientação original"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950/70 border border-slate-800 backdrop-blur-md pointer-events-auto text-[11px] font-mono text-slate-400">
                <span>Zoom: {zoomLevel}x</span>
              </div>
            </div>

            {/* Canvas 3D */}
            <canvas ref={canvasRef} className="w-full h-full block" />

            <div className="absolute top-14 left-3 max-w-[70%] px-2.5 py-1 rounded-md bg-slate-950/75 border border-slate-800/90 text-[10px] font-mono text-slate-300 pointer-events-none">
              {carrierAsset?.assetStatus === 'verified'
                ? 'GLB local verificado · escala em milímetros'
                : carrierAsset?.referenceAssetPath
                ? 'GLB de referência local · variante física pendente'
                : carrierAsset?.assetStatus === 'approximate'
                ? 'Envelope de aproximação · referência física pendente'
                : carrierAsset?.assetStatus === 'pending'
                ? 'Envelope nominal · CAD físico pendente'
                : modelPath
                ? 'GLB de referência do componente'
                : 'Envelope paramétrico · asset não disponível'}
            </div>

            {/* Bottom helper overlay */}
            <div className="absolute bottom-3 inset-x-3 flex justify-between items-center text-[10px] font-mono text-slate-500 pointer-events-none">
              <span className="bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-800/80">
                💡 Arraste para orbitar · Scroll do mouse para zoom
              </span>
              <span className="bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-800/80 text-emerald-400">
                {carrierAsset?.assetDimensionsMm ? 'Asset medido' : 'Dimensão nominal'}: {viewportDimensions.width} × {viewportDimensions.height} × {viewportDimensions.depth} mm
              </span>
            </div>

            {isLoadingModel && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs">
                  <Activity className="w-4 h-4 text-fuelguard-green animate-spin" />
                  {carrierAsset?.referenceAssetPath ? 'Carregando referência local rastreável…' : carrierAsset?.assetStatus === 'pending' ? 'Preparando envelope pendente…' : 'Carregando malha 3D rastreável…'}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Tabbed Panel with Functional Demo & Engineering Specs (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col min-h-[430px] lg:min-h-0 bg-[#0b1019] overflow-hidden">
            {/* Tab Selector */}
            <div className="flex border-b border-slate-800 bg-slate-900/40 px-3 pt-2">
              <button
                onClick={() => setActiveTab('demo')}
                className={`flex-1 py-2.5 px-3 text-xs font-bold font-mono border-b-2 flex items-center justify-center gap-2 transition ${
                  activeTab === 'demo'
                    ? 'border-fuelguard-green text-fuelguard-green bg-fuelguard-green/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-4 h-4" />
                Exemplo das Funcionalidades
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`flex-1 py-2.5 px-3 text-xs font-bold font-mono border-b-2 flex items-center justify-center gap-2 transition ${
                  activeTab === 'specs'
                    ? 'border-fuelguard-green text-fuelguard-green bg-fuelguard-green/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                Especificações & Pinagem
              </button>
              <button
                onClick={() => setActiveTab('cad')}
                className={`flex-1 py-2.5 px-3 text-xs font-bold font-mono border-b-2 flex items-center justify-center gap-2 transition ${
                  activeTab === 'cad'
                    ? 'border-fuelguard-green text-fuelguard-green bg-fuelguard-green/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                Registro CAD
              </button>
            </div>

            {/* Tab Contents (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 font-ui text-xs">
              {/* TAB 1: EXEMPLO DAS FUNCIONALIDADES */}
              {activeTab === 'demo' && (
                <div className="space-y-4">
                  {/* --- SIMULADOR: ESP32-S3 --- */}
                  {component.id === 'esp32_s3_devkit' && (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-sky-500/40 bg-sky-950/20 p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono uppercase font-bold text-sky-300 flex items-center gap-1.5">
                            <Cpu className="w-4 h-4 text-sky-400" />
                            Firmware Core FuelGuard · ESP-IDF FreeRTOS
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/20 text-sky-200 border border-sky-500/40">
                            Dual-Core @ 240 MHz
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          O ESP32-S3 centraliza a lógica do gêmeo digital: processa a telemetria serial do sensor ultrassônico, autentica crachás de frotistas via barramento SPI no PN532, monitora o interlock da tampa e sinaliza alarmes.
                        </p>
                      </div>

                      {/* Simulador Interativo de Tarefas FreeRTOS */}
                      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-3">
                        <div className="text-[11px] font-mono uppercase text-slate-400 font-bold">
                          Monitor de Tarefas RTOS em Tempo Real
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                            <div className="text-slate-400">Core 0 (Comms & MQTT)</div>
                            <div className="text-emerald-400 font-bold mt-1">Uptime: 100% · Carga 14%</div>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                            <div className="text-slate-400">Core 1 (Sensors & NFC)</div>
                            <div className="text-sky-400 font-bold mt-1">Uptime: 100% · Carga 32%</div>
                          </div>
                        </div>

                        {/* Botões de Ação para Testar Cenários no ESP32 */}
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[10px] font-mono text-slate-400">Simular Evento de Hardware:</div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={() => {
                                setEspLogs((prev) => [
                                  `[UART] Frame recebido: 0xFF 0x01 0x2C 0x2C -> Nível: 300 mm (65%)`,
                                  ...prev.slice(0, 7),
                                ]);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[10px] font-mono flex items-center justify-center gap-1 transition"
                            >
                              <Zap className="w-3 h-3 text-sky-400" />
                              Receber UART SEN0311
                            </button>
                            <button
                              onClick={() => {
                                setEspLogs((prev) => [
                                  `[NFC] Cartão detectado UID: 04:E2:89:1A:4C -> Operador Autorizado!`,
                                  ...prev.slice(0, 7),
                                ]);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[10px] font-mono flex items-center justify-center gap-1 transition"
                            >
                              <Radio className="w-3 h-3 text-emerald-400" />
                              Autenticar Tag NFC
                            </button>
                            <button
                              onClick={() => {
                                setEspLogs((prev) => [
                                  `[ALERTA] Interlock GPIO7 = HIGH! Tampa de combustível violada! Buzzer ativado!`,
                                  ...prev.slice(0, 7),
                                ]);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-200 text-[10px] font-mono flex items-center justify-center gap-1 transition"
                            >
                              <ShieldAlert className="w-3 h-3 text-rose-400" />
                              Disparar Violação Tampa
                            </button>
                            <button
                              onClick={() => {
                                setEspLogs([
                                  `[RESET] ESP_RESTART executado. Reinicializando subsistemas...`,
                                  `[BOOT] ESP32-S3 Core 0 & 1 inicializados @ 240 MHz`,
                                ]);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[10px] font-mono flex items-center justify-center gap-1 transition"
                            >
                              <RotateCcw className="w-3 h-3 text-amber-400" />
                              Soft Reset MCU
                            </button>
                          </div>
                        </div>

                        {/* Terminal Serial Virtual */}
                        <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800 font-mono text-[9px] space-y-1 text-slate-300">
                          <div className="text-slate-500 uppercase tracking-wider text-[8px] flex items-center justify-between">
                            <span>Console Serial (USB UART 115200 bps)</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                          <div className="max-h-24 overflow-y-auto space-y-0.5">
                            {espLogs.map((log, i) => (
                              <div key={i} className="truncate">
                                {log}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- SIMULADOR: Adafruit PN532 v1.6 NFC --- */}
                  {component.id === 'pn532_breakout' && (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-purple-500/40 bg-purple-950/20 p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono uppercase font-bold text-purple-300 flex items-center gap-1.5">
                            <Radio className="w-4 h-4 text-purple-400" />
                            Acoplamento Indutivo 13,56 MHz (ISO/IEC 14443A)
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-200 border border-purple-500/40">
                            Protocolo SPI @ 4 MHz
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          A Adafruit PN532 v1.6 opera como leitora de proximidade para identificar frotistas e motoristas homologados antes de liberar a válvula de combustível.
                        </p>
                      </div>

                      {/* Simulador Interativo de Distância do Cartão */}
                      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-3">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-400 font-bold">Proximidade do Cartão RFID:</span>
                          <span className="text-purple-300 font-bold">{nfcDistanceMm} mm</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={nfcDistanceMm}
                          onChange={(e) => setNfcDistanceMm(Number(e.target.value))}
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] font-mono text-slate-500">
                          <span>0 mm (Contato direto)</span>
                          <span>25 mm (Limite operacional)</span>
                          <span>50 mm (Sem campo)</span>
                        </div>

                        {/* Status de Leitura Decodificado */}
                        {nfcDistanceMm <= 25 ? (
                          <div className="rounded-lg border border-emerald-500/50 bg-emerald-950/30 p-3 space-y-1.5 animate-in fade-in">
                            <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px]">
                              <CheckCircle className="w-4 h-4" />
                              TAG DETECTADA COM SUCESSO!
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-300">
                              <div>UID: <span className="text-emerald-300 font-bold">04:E2:89:1A:4C:5B:80</span></div>
                              <div>Tipo: <span className="text-slate-200">Mifare Classic 1K</span></div>
                              <div>Frotista: <span className="text-sky-300 font-bold">Caminhão Tanque #402</span></div>
                              <div>Status: <span className="text-emerald-400 font-bold">Abastecimento Liberado</span></div>
                            </div>
                            <div className="text-[9px] font-mono text-slate-400 pt-1 border-t border-emerald-900/50">
                              Trama SPI: [MOSI: 00 00 FF 04 FC D4 4A 01 00] → [MISO: 00 00 FF 0B F5 D5 4B 01 01 00]
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-center space-y-1">
                            <div className="text-slate-400 font-mono text-[10px]">
                              Campo RF ativo · Nenhum cartão no raio de detecção.
                            </div>
                            <div className="text-[9px] font-mono text-slate-500">
                              Aproxime o controle deslizante para menos de 25 mm para simular autenticação.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* --- SIMULADOR: SEN0311 / A02YYUW ULTRASSÔNICO --- */}
                  {component.id === 'a02yyuw_sen0311' && (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-sky-500/40 bg-sky-950/20 p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono uppercase font-bold text-sky-300 flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-sky-400" />
                            Eco Acústico Time-of-Flight (ToF) & UART
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/20 text-sky-200 border border-sky-500/40">
                            Frequência 40 kHz · IP67
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          O sensor emite pulsos ultrassônicos fechados de 40 kHz contra a superfície da água/combustível e mede o tempo de voo acústico, convertendo a altura em volume através da geometria cilíndrica calibrada.
                        </p>
                      </div>

                      {/* Simulador de Nível e Osciloscópio ToF */}
                      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-3">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-400 font-bold">Distância Sonda → Superfície Líquido:</span>
                          <span className="text-sky-300 font-bold">{ultrasonicDistanceMm} mm</span>
                        </div>
                        <input
                          type="range"
                          min="15"
                          max="160"
                          value={ultrasonicDistanceMm}
                          onChange={(e) => setUltrasonicDistanceMm(Number(e.target.value))}
                          className="w-full accent-sky-500 cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] font-mono text-slate-500">
                          <span>15 mm (Zona Cega)</span>
                          <span>80 mm (Meio tanque)</span>
                          <span>160 mm (Fundo do tanque)</span>
                        </div>

                        {/* Análise de Zona Cega e Cálculos de Engenharia */}
                        {ultrasonicDistanceMm < 30 ? (
                          <div className="rounded-lg border border-rose-500/60 bg-rose-950/30 p-2.5 space-y-1">
                            <div className="flex items-center gap-1 text-rose-300 font-bold text-[10px]">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              ALERTA DE ENGENHARIA: ZONA CEGA ATINGIDA (&lt; 30 mm)
                            </div>
                            <p className="text-slate-300 text-[10px] leading-relaxed">
                              O transdutor piezoelétrico não consegue registrar o eco pois a reverberação do pulso de disparo ainda está presente na membrana acústica. Risco de leitura errônea.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                              <div className="text-slate-400">Tempo ToF (Δt)</div>
                              <div className="text-sky-300 font-bold mt-0.5">
                                {Math.round((2 * (ultrasonicDistanceMm / 1000) / 343) * 1000000)} µs
                              </div>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                              <div className="text-slate-400">Altura Líquido</div>
                              <div className="text-emerald-300 font-bold mt-0.5">
                                {Math.max(0, 160 - ultrasonicDistanceMm)} mm
                              </div>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                              <div className="text-slate-400">Volume Cilindro</div>
                              <div className="text-fuelguard-green font-bold mt-0.5">
                                {(Math.PI * Math.pow(0.1, 2) * (Math.max(0, 160 - ultrasonicDistanceMm) / 1000) * 1000).toFixed(2)} L
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Gerador de Pacote Serial UART Real */}
                        <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800 font-mono text-[9px] space-y-1">
                          <div className="text-slate-500 uppercase text-[8px]">
                            Trama UART 9600 8N1 Gerada pelo Sensor (DFRobot Spec):
                          </div>
                          {(() => {
                            const highByte = (ultrasonicDistanceMm >> 8) & 0xff;
                            const lowByte = ultrasonicDistanceMm & 0xff;
                            const checksum = (0xff + highByte + lowByte) & 0xff;
                            return (
                              <div className="flex items-center gap-2 text-sky-400 font-bold">
                                <span className="bg-sky-950 px-1.5 py-0.5 rounded border border-sky-800">0xFF (Header)</span>
                                <span className="bg-sky-950 px-1.5 py-0.5 rounded border border-sky-800">
                                  0x{highByte.toString(16).padStart(2, '0').toUpperCase()} (Data H)
                                </span>
                                <span className="bg-sky-950 px-1.5 py-0.5 rounded border border-sky-800">
                                  0x{lowByte.toString(16).padStart(2, '0').toUpperCase()} (Data L)
                                </span>
                                <span className="bg-sky-950 px-1.5 py-0.5 rounded border border-sky-800 text-emerald-400">
                                  0x{checksum.toString(16).padStart(2, '0').toUpperCase()} (Checksum OK)
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- SIMULADOR: MC-38 REED SWITCH & ÍMÃ --- */}
                  {component.id === 'reed_switch' && (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono uppercase font-bold text-amber-300 flex items-center gap-1.5">
                            <Lock className="w-4 h-4 text-amber-400" />
                            Interlock Magnético de Segurança da Tampa
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-200 border border-amber-500/40">
                            Ampola Hermética Fe-Ni
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          O sensor MC-38 impede fraudes durante o abastecimento. Quando a tampa do tanque é fechada, o ímã de neodímio fecha as lâminas ferromagnéticas conectando o GPIO7 ao terra (GND). A abertura da tampa abre o circuito, disparando o alarme.
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-3">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-400 font-bold">Distância Tampa (Ímã) → Sensor Reed:</span>
                          <span className="text-amber-300 font-bold">{reedDistanceMm} mm</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="25"
                          value={reedDistanceMm}
                          onChange={(e) => setReedDistanceMm(Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] font-mono text-slate-500">
                          <span>0 mm (Tampa Travada)</span>
                          <span>12 mm (Gap Limite)</span>
                          <span>25 mm (Tampa Aberta/Violada)</span>
                        </div>

                        {reedDistanceMm <= 12 ? (
                          <div className="rounded-lg border border-emerald-500/60 bg-emerald-950/30 p-3 space-y-1 animate-in fade-in">
                            <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px]">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              TAMPA FECHADA E SEGURA (INTERLOCK ATIVO)
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-300 pt-1">
                              <div>Contato: <span className="text-emerald-400 font-bold">FECHADO (GND)</span></div>
                              <div>GPIO7: <span className="text-emerald-400 font-bold">LOW (0V)</span></div>
                              <div>Campo B: <span className="text-slate-200 font-bold">~420 Gauss</span></div>
                              <div>Buzzer: <span className="text-slate-400">Silenciado</span></div>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-rose-500/60 bg-rose-950/40 p-3 space-y-1 animate-in fade-in">
                            <div className="flex items-center gap-1.5 text-rose-300 font-bold text-[11px]">
                              <ShieldAlert className="w-4 h-4 text-rose-400" />
                              VIOLAÇÃO DETECTADA! TAMPA DO TANQUE ABERTA!
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-300 pt-1">
                              <div>Contato: <span className="text-rose-400 font-bold">ABERTO</span></div>
                              <div>GPIO7: <span className="text-rose-400 font-bold">HIGH (Pull-up 3.3V)</span></div>
                              <div>Interrupção: <span className="text-amber-300 font-bold">Trigger ISR GPIO7</span></div>
                              <div>Ação: <span className="text-rose-400 font-bold">Bloqueio & Buzzer 2.4kHz</span></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* --- SIMULADOR: PROTOBOARD MB-102 --- */}
                  {component.id === 'breadboard_830' && (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono uppercase font-bold text-slate-200 flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-fuelguard-green" />
                            Matriz de Barramentos 830 Pontos Solderless
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                            Passo 2,54 mm (0.1")
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          A MB-102 organiza os nós elétricos do MVP. Os 4 trilhos laterais distribuem tensões reguladas e terra equipotencial, enquanto a ravina central de 7,62 mm acomoda circuitos DIP e os módulos da bancada.
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-3">
                        <div className="text-[11px] font-mono text-slate-400 font-bold">
                          Inspeção de Barramentos de Alimentação:
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            onClick={() => setSelectedRail('3V3')}
                            className={`p-2 rounded-lg border text-[10px] font-mono font-bold transition ${
                              selectedRail === '3V3'
                                ? 'bg-orange-950/60 border-orange-500 text-orange-200'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            Trilho +3.3V Lógico
                          </button>
                          <button
                            onClick={() => setSelectedRail('5V')}
                            className={`p-2 rounded-lg border text-[10px] font-mono font-bold transition ${
                              selectedRail === '5V'
                                ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            Trilho +5V VBUS
                          </button>
                          <button
                            onClick={() => setSelectedRail('GND')}
                            className={`p-2 rounded-lg border text-[10px] font-mono font-bold transition ${
                              selectedRail === 'GND'
                                ? 'bg-sky-950/60 border-sky-500 text-sky-200'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            Barramento GND
                          </button>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-[10px] font-mono">
                          {selectedRail === '3V3' && (
                            <>
                              <div className="text-orange-300 font-bold">Domínio +3.3V (Regulado pela DevKitC):</div>
                              <div className="text-slate-300">Alimenta: Sensor ultrassônico SEN0311, Módulo NFC PN532, Pull-up Reed Switch.</div>
                              <div className="text-slate-400">Resistência de contato média: &lt; 0.05 Ω por clipe niquelado.</div>
                            </>
                          )}
                          {selectedRail === '5V' && (
                            <>
                              <div className="text-rose-300 font-bold">Domínio +5V VBUS (Fonte Externa / USB-C):</div>
                              <div className="text-slate-300">Alimenta: Entrada do regulador LDO do ESP32 e barramento de força auxiliar.</div>
                              <div className="text-rose-400">ATENÇÃO DRC: Proibido injetar nos GPIOs de 3.3V do ESP32!</div>
                            </>
                          )}
                          {selectedRail === 'GND' && (
                            <>
                              <div className="text-sky-300 font-bold">Barramento Equipotencial GND:</div>
                              <div className="text-slate-300">Retorno comum unificado para todos os 6 módulos do projeto FuelGuard.</div>
                              <div className="text-emerald-400">Continuidade 100% verificada no Auditor Elétrico.</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fallback de Demonstração para Componentes sem simulador dedicado */}
                  {['led_indicator', 'buzzer_active'].includes(component.id) && (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-fuelguard-green font-bold text-xs font-mono">
                        <Activity className="w-4 h-4" />
                        Sinalizador Ativo da Bancada
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        {component.id === 'led_indicator'
                          ? 'Acionado pelo GPIO4 do ESP32-S3 através de um resistor limitador de corrente de 220 Ω (corrente direta nominal: 5,45 mA). Indica o status operacional da bancada e pulsa durante transações NFC válidas.'
                          : 'Buzzer eletromagnético ativo acionado pelo GPIO14. Emite aviso sonoro contínuo de 2,4 kHz em caso de abertura de tampa pelo interlock ou anomalia no sensor ultrassônico.'}
                      </p>
                    </div>
                  )}

                  {!hasDedicatedDemo && (
                    <div className="rounded-xl border border-sky-800/70 bg-sky-950/20 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sky-300 font-bold text-xs font-mono">
                          <Layers className="w-4 h-4" />
                          Ficha de engenharia do componente
                        </div>
                        <span className="text-[9px] uppercase tracking-wide text-slate-500">Sem simulador dedicado</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{componentRole}</p>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                        <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-2">
                          <div className="text-slate-500 uppercase tracking-wide">Footprint</div>
                          <div className="text-slate-200 mt-1">{component.footprintType}</div>
                        </div>
                        <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-2">
                          <div className="text-slate-500 uppercase tracking-wide">Nets conectadas</div>
                          <div className="text-slate-200 mt-1">{component.connectedNets.length ? component.connectedNets.join(' · ') : 'Nenhuma registrada'}</div>
                        </div>
                      </div>
                      <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-2 text-[10px] text-slate-400">
                        A interação 3D está disponível acima. Para validar comportamento elétrico, use a aba <strong className="text-sky-300">Especificações & Pinagem</strong> e a estação <strong className="text-sky-300">Testes</strong>.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ESPECIFICAÇÕES & PINAGEM */}
              {activeTab === 'specs' && (
                <div className="space-y-4">
                  {/* Tabela de Parâmetros Elétricos e Mecânicos */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                    <div className="px-3.5 py-2.5 bg-slate-900/80 border-b border-slate-800 font-mono text-[11px] font-bold text-slate-200">
                      Parâmetros Nominais de Engenharia
                    </div>
                    <div className="divide-y divide-slate-800 text-[10px] font-mono">
                      <div className="flex justify-between px-3.5 py-2">
                        <span className="text-slate-400">Fabricante / Fornecedor</span>
                        <span className="text-slate-200 font-bold">{component.manufacturer}</span>
                      </div>
                      <div className="flex justify-between px-3.5 py-2">
                        <span className="text-slate-400">Part Number Comercial (MPN)</span>
                        <span className="text-slate-200 font-bold">{component.partNumber}</span>
                      </div>
                      <div className="flex justify-between px-3.5 py-2">
                        <span className="text-slate-400">Revisão de Hardware</span>
                        <span className="text-fuelguard-green font-bold">{component.revision}</span>
                      </div>
                      <div className="flex justify-between px-3.5 py-2">
                        <span className="text-slate-400">Dimensões Físicas (L × A × P)</span>
                        <span className="text-slate-200 font-bold">
                          {component.dimensionsMm.width} × {component.dimensionsMm.height} × {component.dimensionsMm.depth} mm
                        </span>
                      </div>
                      <div className="flex justify-between px-3.5 py-2">
                        <span className="text-slate-400">Dimensões Nominais</span>
                        <span className="text-slate-300 font-bold">
                          {component.nominalDimensionsMm.width} × {component.nominalDimensionsMm.height} × {component.nominalDimensionsMm.depth} mm
                        </span>
                      </div>
                      <div className="flex justify-between px-3.5 py-2">
                        <span className="text-slate-400">Ponto de Apoio Mecânico</span>
                        <span className="text-sky-300 font-bold">{component.footprintType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pinagem / Terminais Documentados */}
                  {component.pins && component.pins.length > 0 && (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                      <div className="px-3.5 py-2.5 bg-slate-900/80 border-b border-slate-800 font-mono text-[11px] font-bold text-slate-200">
                        Pinagem Mecatrônica e Conexões
                      </div>
                      <div className="divide-y divide-slate-800 text-[10px] font-mono">
                        {component.pins.map((pin) => (
                          <div key={pin.id} className="px-3.5 py-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-5 text-slate-400 font-bold">P{pin.pinNumber}</span>
                              <span className="text-slate-200 font-bold">{pin.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">{pin.description}</span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] ${
                                  pin.signalType === 'power'
                                    ? 'bg-rose-950 text-rose-300'
                                    : pin.signalType === 'ground'
                                    ? 'bg-slate-800 text-slate-300'
                                    : 'bg-sky-950 text-sky-300'
                                }`}
                              >
                                {pin.nominalVoltageV === 0 ? 'GND' : `${pin.nominalVoltageV} V`}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: REGISTRO CAD & FABRICAÇÃO */}
              {activeTab === 'cad' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                    <div className="text-slate-200 font-bold text-xs font-mono flex items-center gap-2">
                      <Layers className="w-4 h-4 text-sky-400" />
                      Classificação CAD e Rastreabilidade do Asset
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {component.confidenceRationale ??
                        'Este modelo segue os critérios de confiabilidade dimensional estabelecidos no repositório FuelGuard.'}
                    </p>

                    <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-2 text-[10px] font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Origem do Arquivo CAD:</span>
                        <span className="text-slate-200 truncate max-w-[200px]">
                          {component.sourceReference ?? modelPath ?? 'Geometria Procedural FuelGuard'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status de Validação:</span>
                        <span className="text-emerald-400 font-bold">{component.validationStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Nível de Confiança CAD:</span>
                        <span className="text-sky-300 font-bold">
                          Classe {evidenceClass}
                        </span>
                      </div>
                      {component.disclaimerNote && (
                        <div className="text-amber-300/90 pt-1 border-t border-slate-800">
                          Nota: {component.disclaimerNote}
                        </div>
                      )}
                    </div>

                    {carrierAsset && (
                      <div className="rounded-lg bg-slate-950 p-3 border border-sky-900/70 space-y-2 text-[10px] font-mono">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-400">Registro Carrier</span>
                          <span className={`px-1.5 py-0.5 rounded border ${getCarrierAssetStatusClass(carrierAsset.assetStatus)}`}>
                            {getCarrierAssetStatusLabel(carrierAsset.assetStatus)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                          <span className="text-slate-400">{carrierAsset.assetPath ? 'Asset local verificado' : 'Referência local'}</span>
                          <span className="text-slate-200 truncate">{carrierAsset.assetPath ?? carrierAsset.referenceAssetPath ?? 'Não disponível'}</span>
                          <span className="text-slate-400">Dimensão nominal</span>
                          <span className="text-slate-200">{component.nominalDimensionsMm.width} × {component.nominalDimensionsMm.height} × {component.nominalDimensionsMm.depth} mm</span>
                          <span className="text-slate-400">Dimensão do asset</span>
                          <span className="text-slate-200">{carrierAsset.assetDimensionsMm ? `${carrierAsset.assetDimensionsMm.width} × ${carrierAsset.assetDimensionsMm.height} × ${carrierAsset.assetDimensionsMm.depth} mm` : 'Ainda não medida'}</span>
                          <span className="text-slate-400">Tolerância</span>
                          <span className="text-slate-200">±{carrierAsset.toleranceMm} mm</span>
                        </div>
                        <a href={carrierAsset.sourceUrl} target="_blank" rel="noreferrer" className="text-sky-300 hover:underline inline-flex items-center gap-1">
                          Abrir fonte original <ExternalLink className="w-3 h-3" />
                        </a>
                        {carrierAsset.pendingReason && (
                          <div className="pt-2 border-t border-slate-800 text-amber-300/90">Pendência: {carrierAsset.pendingReason}</div>
                        )}
                        {carrierAsset.limitations.length > 0 && (
                          <div className="pt-2 border-t border-slate-800 text-slate-400">Limitação: {carrierAsset.limitations[0]}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer Actions */}
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
              <span className="text-[10px] font-mono text-slate-500">
                Pressione <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">ESC</kbd> para fechar
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-fuelguard-green hover:bg-fuelguard-green/90 text-slate-950 font-mono font-bold text-xs shadow-xs transition"
              >
                Concluir Inspeção
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
