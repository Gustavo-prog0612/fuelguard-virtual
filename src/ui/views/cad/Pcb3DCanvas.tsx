/**
 * FuelGuard Virtual Test Bench — Visualizador 3D da Placa (tscircuit 3D Viewer)
 * Renderiza uma PCB importada com evidência de fonte (atualmente a referência
 * RP2040). O FuelGuard permanece em referência de engenharia e não recebe
 * uma Carrier Board procedural neste viewer.
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
import { CadComponentMetadata } from '@/circuit-cad/component-library';
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
  // MONTAGEM THREE.JS DA PCB IMPORTADA COM FONTE DECLARADA
  // =========================================================================
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !isRp2040) return;

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

    // Fundo limpo de estúdio com sombra suave de contato


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

    buildRp2040Board(
      boardGroup,
      pickableObjects,
      { pcbMat, enigGoldMat, tinSolderMat, whiteSilkscreenMat, edgeMat },
      (mesh) => { pulsingLed = mesh; }
    );

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
            const comp = RP2040_COMPONENT_LIBRARY[found.compKey];
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
      pcbMatGreen.dispose();
      pcbMatObsidian.dispose();
      edgeMat.dispose();
    };
  }, [activeBoard, isRp2040, updateRotation]);

  if (!isRp2040) {
    return (
      <div className="h-full w-full rounded-md border border-amber-700/70 bg-amber-950/20 p-6 flex items-center justify-center font-mono">
        <div className="max-w-2xl text-center space-y-4">
          <div className="text-amber-300 text-sm font-bold uppercase tracking-wider">3D de PCB bloqueado: não existe PCB FuelGuard revisada</div>
          <p className="text-xs text-amber-100/80 leading-relaxed">
            A bancada FuelGuard usa protoboard e módulos comerciais. O viewer não cria uma Carrier Board
            procedural para não transformar uma referência visual em geometria de fabricação.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-left text-[10px] text-inst-secondary">
            <div className="bg-inst-canvas/70 border border-inst-border rounded-sm p-3"><strong className="text-inst-primary block">Detalhado agora</strong>Bancada Física 3D, cabos, sonda, tanque e componentes comerciais.</div>
            <div className="bg-inst-canvas/70 border border-inst-border rounded-sm p-3"><strong className="text-inst-primary block">Futuro</strong>STEP/DXF do suporte, frasco e placa adaptadora.</div>
            <div className="bg-inst-canvas/70 border border-inst-border rounded-sm p-3"><strong className="text-inst-primary block">Fonte da placa</strong>Esquemático, contorno, footprints, roteamento e revisão DRC.</div>
          </div>
          <button onClick={() => onSelectTab?.('assembly')} className="px-3 py-1.5 rounded-xs bg-fuelguard-green text-white text-xs font-bold">Abrir Bancada Física 3D</button>
        </div>
      </div>
    );
  }

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
              <span>FuelGuard: PCB adaptadora não projetada • sem geometria fabricável</span>
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
              {selectedComp.validationStatus === 'exact_verified'
                ? 'Nível 2 (CAD verificado)'
                : selectedComp.validationStatus === 'documented_reference'
                ? 'Nível 3 (Fonte documentada)'
                : 'Nível 4 (Geometria pendente)'}
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
                  'Render Fotorealista 3D Oficial — RP2040 Motor Controller'
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
                src="/data/rp2040/3d.png"
                alt="Render 3D da Placa"
                className="max-h-[460px] object-contain rounded-xs shadow-md"
              />
            </div>
            <div className="flex justify-between items-center text-xs text-inst-secondary pt-1">
              <span>Origem declarada: tscircuit / imrishabh18 (dist/index/3d.png)</span>
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
