/**
 * FuelGuard Virtual Test Bench — Visualizador PCB 2D (Layout EDA / Circuit JSON v1)
 * Renderiza o layout da placa de circuito impresso consumindo diretamente os objetos
 * canônicos de Circuit JSON (pcb_board, pcb_component, pcb_plated_hole, pcb_trace).
 *
 * Exibe trilhas de cobre reais com rotas chanfradas a 45°, controle de camadas independentes
 * (Top Copper, Bottom Copper, Pads, Silkscreen, Ratsnest), mira de origem (0m, 0m),
 * e alternador formal entre 'PCB Roteada' e 'Conceito de Placa'.
 *
 * Referência visual de engenharia da placa adaptadora FuelGuard.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { CircuitJsonPackage } from '@/circuit-cad/circuit-json-builder';

interface PcbCanvasProps {
  circuitPkg: CircuitJsonPackage;
}

export type PcbDisplayMode = 'routed' | 'concept';

export const PcbCanvas: React.FC<PcbCanvasProps> = ({ circuitPkg }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Estados de Pan e Zoom
  const [zoom, setZoom] = useState<number>(1.25);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Modo de exibição: PCB Roteada vs Conceito de Placa (Pré-Roteamento)
  const [displayMode, setDisplayMode] = useState<PcbDisplayMode>('routed');

  // Filtros de Camadas EDA
  const [showTopCopper, setShowTopCopper] = useState<boolean>(true);
  const [showBottomCopper, setShowBottomCopper] = useState<boolean>(true);
  const [showPads, setShowPads] = useState<boolean>(true);
  const [showSilkscreen, setShowSilkscreen] = useState<boolean>(true);
  const [showRatsnest, setShowRatsnest] = useState<boolean>(false);
  const [solderMaskColor, setSolderMaskColor] = useState<'obsidian' | 'copper_red' | 'kicad_green'>('copper_red');

  // Extrai elementos canônicos do Circuit JSON
  const pcbBoard = useMemo(() => {
    return circuitPkg.circuit_elements.find((el) => el.type === 'pcb_board') as any;
  }, [circuitPkg]);

  const pcbComponents = useMemo(() => {
    return circuitPkg.circuit_elements.filter((el) => el.type === 'pcb_component') as any[];
  }, [circuitPkg]);

  const pcbHoles = useMemo(() => {
    return circuitPkg.circuit_elements.filter((el) => el.type === 'pcb_plated_hole') as any[];
  }, [circuitPkg]);

  const pcbVias = useMemo(() => {
    return circuitPkg.circuit_elements.filter((el) => el.type === 'pcb_via') as any[];
  }, [circuitPkg]);

  const pcbSmtPads = useMemo(() => {
    return circuitPkg.circuit_elements.filter((el) => el.type === 'pcb_smtpad') as any[];
  }, [circuitPkg]);

  const pcbTraces = useMemo(() => {
    return circuitPkg.circuit_elements.filter((el) => el.type === 'pcb_trace') as any[];
  }, [circuitPkg]);

  const sourceNets = useMemo(() => {
    return circuitPkg.circuit_elements.filter((el) => el.type === 'source_net') as any[];
  }, [circuitPkg]);

  // Contagem de redes e status
  const routedTracesCount = pcbTraces.length;
  const unroutedCount = displayMode === 'concept' ? routedTracesCount : 0;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((z) => Math.max(0.4, Math.min(3.5, z * factor)));
  };

  // Renderização 2D no Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Fundo Preto EDA Profissional
    ctx.fillStyle = '#06090d';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    ctx.scale(zoom, zoom);

    // Escala adaptativa para caber na tela: placas compactas (ex: 42.3 mm) usam fator maior
    const basePcbWidth = pcbBoard?.width ?? 90;
    const pxScale = basePcbWidth < 60 ? 6.8 : 3.6;
    const mmToPx = (mm: number) => mm * pxScale;

    // Dimensões da Placa a partir do Circuit JSON
    const bWidth = pcbBoard?.width ?? 90;
    const bHeight = pcbBoard?.height ?? 65;
    const boardW = mmToPx(bWidth);
    const boardH = mmToPx(bHeight);
    const boardX = -boardW / 2;
    const boardY = -boardH / 2;

    // 2. Substrato e Plano de Cobre / Máscara de Solda
    // Cores de máscara calibradas com referências de EDA (media_1790365048497.png)
    let maskBgColor = '#3b1219'; // Cobre/Vermelho EDA clássico tscircuit
    let rimBorderColor = '#991b1b';
    if (solderMaskColor === 'obsidian') {
      maskBgColor = '#0f172a';
      rimBorderColor = '#334155';
    } else if (solderMaskColor === 'kicad_green') {
      maskBgColor = '#064e3b';
      rimBorderColor = '#047857';
    }

    ctx.fillStyle = maskBgColor;
    ctx.strokeStyle = rimBorderColor;
    ctx.lineWidth = 1.5;

    // Verifica se há contorno paramétrico poligonal da placa FuelGuard.
    const boardOutline = pcbBoard?.outline as Array<{ x: number; y: number }> | undefined;
    if (boardOutline && boardOutline.length > 2) {
      ctx.beginPath();
      boardOutline.forEach((pt, idx) => {
        const px = mmToPx(pt.x);
        const py = mmToPx(-pt.y);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.roundRect(boardX, boardY, boardW, boardH, 8);
      ctx.fill();
      ctx.stroke();
    }

    // Plano de Cobre Interno (Ground Pour Polygon com transparência EDA)
    ctx.fillStyle = 'rgba(234, 88, 12, 0.12)';
    ctx.beginPath();
    ctx.roundRect(boardX + 8, boardY + 8, boardW - 16, boardH - 16, 4);
    ctx.fill();

    // 3. Furos de Montagem M3 nos 4 Cantos com anéis de folga (Clearance) e anel ENIG
    const holeRadius = mmToPx(1.65);
    const cornerHoles = pcbHoles.length > 0 
      ? pcbHoles.filter((h) => (h.hole_diameter ?? 0) >= 3.0).map((h) => ({ x: mmToPx(h.x), y: mmToPx(-h.y) }))
      : [
          { x: boardX + mmToPx(8), y: boardY + mmToPx(8) },
          { x: boardX + boardW - mmToPx(8), y: boardY + mmToPx(8) },
          { x: boardX + mmToPx(8), y: boardY + boardH - mmToPx(8) },
          { x: boardX + boardW - mmToPx(8), y: boardY + boardH - mmToPx(8) },
        ];

    cornerHoles.forEach((h) => {
      // Anel de alívio térmico/folga
      ctx.fillStyle = '#ec4899'; // Magenta de furação/pad EDA
      ctx.beginPath();
      ctx.arc(h.x, h.y, holeRadius + mmToPx(1.8), 0, Math.PI * 2);
      ctx.fill();

      // Anel metalizado dourado ENIG
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(h.x, h.y, holeRadius + mmToPx(0.8), 0, Math.PI * 2);
      ctx.fill();

      // Furo mecânico escuro
      ctx.fillStyle = '#06090d';
      ctx.beginPath();
      ctx.arc(h.x, h.y, holeRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Cruz Cartesiana de Origem (0m, 0m) no Centro — Padrão tscircuit
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(boardX - 25, 0);
    ctx.lineTo(boardX + boardW + 25, 0);
    ctx.moveTo(0, boardY - 25);
    ctx.lineTo(0, boardY + boardH + 25);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = 'bold 9px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#22c55e';
    ctx.fillText('0m, 0m', 6, -6);

    // 5. CAMADA DE TRILHAS DE COBRE (Consumindo pcb_trace do Circuit JSON)
    if (displayMode === 'routed') {
      pcbTraces.forEach((trace) => {
        const route = trace.route;
        if (!route || route.length < 2) return;

        const isBottom = route[0].layer === 'bottom';
        if (isBottom && !showBottomCopper) return;
        if (!isBottom && !showTopCopper) return;

        // Cor da trilha: Top = Laranja/Vermelho Cobre EDA (#ea580c) ou Verde; Bottom = Azul Cobalto (#2563eb)
        ctx.strokeStyle = isBottom ? '#38bdf8' : '#ea580c';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        route.forEach((pt: any, idx: number) => {
          const px = mmToPx(pt.x);
          const py = mmToPx(-pt.y); // Inverte Y cartesiano para canvas
          ctx.lineWidth = Math.max(1.8, mmToPx(pt.width));

          if (idx === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        });
        ctx.stroke();
      });
    }

    if (displayMode === 'concept' || showRatsnest) {
      // Modo Conceito / Ratsnest (Conexões ponta-a-ponta em linha tracejada dourada)
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.0;
      ctx.setLineDash([3, 3]);

      pcbTraces.forEach((trace) => {
        const route = trace.route;
        if (!route || route.length < 2) return;
        const p1 = route[0];
        const p2 = route[route.length - 1];

        ctx.beginPath();
        ctx.moveTo(mmToPx(p1.x), mmToPx(-p1.y));
        ctx.lineTo(mmToPx(p2.x), mmToPx(-p2.y));
        ctx.stroke();
      });
      ctx.setLineDash([]);
    }

    // 6. CAMADA DE ILHÓS, PADS SMD E VIAS (Consumindo Circuit JSON)
    if (showPads) {
      // 6.1 Furos Passantes Metalizados (THT / Mounting)
      pcbHoles.forEach((hole) => {
        const px = mmToPx(hole.x);
        const py = mmToPx(-hole.y);
        const padR = Math.max(1.8, mmToPx((hole.outer_diameter ?? 1.7) / 2));
        const drillR = Math.max(0.8, mmToPx((hole.hole_diameter ?? 0.9) / 2));

        // Anel de cobre dourado ENIG
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(px, py, padR, 0, Math.PI * 2);
        ctx.fill();

        // Anel de solda prateado interno
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(px, py, drillR + 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Furo mecânico escuro
        ctx.fillStyle = '#06090d';
        ctx.beginPath();
        ctx.arc(px, py, drillR, 0, Math.PI * 2);
        ctx.fill();
      });

      // 6.2 Vias de Interconexão entre Camadas (pcb_via)
      pcbVias.forEach((via) => {
        const px = mmToPx(via.x);
        const py = mmToPx(-via.y);
        const outerR = Math.max(1.4, mmToPx((via.outer_diameter ?? 0.6) / 2));
        const drillR = Math.max(0.6, mmToPx((via.hole_diameter ?? 0.3) / 2));

        // Anel ENIG
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(px, py, outerR, 0, Math.PI * 2);
        ctx.fill();

        // Furo da via
        ctx.fillStyle = '#06090d';
        ctx.beginPath();
        ctx.arc(px, py, drillR, 0, Math.PI * 2);
        ctx.fill();
      });

      // 6.3 Pads de Montagem em Superfície (pcb_smtpad)
      pcbSmtPads.forEach((pad) => {
        const px = mmToPx(pad.x);
        const py = mmToPx(-pad.y);
        const pw = Math.max(1.6, mmToPx(pad.width));
        const ph = Math.max(1.6, mmToPx(pad.height));
        const isBottom = pad.layer === 'bottom';
        if (isBottom && !showBottomCopper) return;
        if (!isBottom && !showTopCopper) return;

        // Base dourada ENIG
        ctx.fillStyle = '#eab308';
        ctx.fillRect(px - pw / 2, py - ph / 2, pw, ph);

        // Centro estanhado SAC305
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(px - pw / 2 + 0.6, py - ph / 2 + 0.6, Math.max(0.8, pw - 1.2), Math.max(0.8, ph - 1.2));
      });
    }

    // 7. CAMADA DE SERIGRAFIA TÉCNICA (Consumindo pcb_component do Circuit JSON)
    if (showSilkscreen) {
      ctx.strokeStyle = '#f8fafc';
      ctx.fillStyle = '#f8fafc';
      ctx.lineWidth = 1.0;

      // Inscrição formal do projeto na placa
      const projectTitle = circuitPkg.title || 'CIRCUITO IMPRESSO EDA';
      ctx.font = 'bold 10px "IBM Plex Mono", monospace';
      ctx.fillText(projectTitle.toUpperCase(), boardX + mmToPx(8), boardY + mmToPx(10));

      ctx.font = '7.5px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('DESIGNED WITH TSCIRCUIT IR • 4-LAYER / FR-4 HIGH-DENSITY', boardX + mmToPx(8), boardY + mmToPx(14));

      // Contornos de Footprint dos Componentes
      pcbComponents.forEach((comp) => {
        const cx = mmToPx(comp.center.x);
        const cy = mmToPx(-comp.center.y);
        const cw = mmToPx(comp.width);
        const ch = mmToPx(comp.height);

        // Retângulo de contorno do componente
        ctx.strokeStyle = '#cbd5e1';
        ctx.strokeRect(cx - cw / 2, cy - ch / 2, cw, ch);

        // Ponto de polaridade do pino 1
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(cx - cw / 2 + 3, cy - ch / 2 + 3, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Designator do componente
        const sourceComp = circuitPkg.circuit_elements.find(
          (el) => el.type === 'source_component' && el.source_component_id === comp.source_component_id
        ) as any;
        const name = sourceComp?.name ?? 'COMP';

        ctx.font = '8.5px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(name, cx - cw / 2 + 2, cy - ch / 2 - 4);
      });
    }

    ctx.restore();
  }, [
    circuitPkg,
    zoom,
    pan,
    displayMode,
    showTopCopper,
    showBottomCopper,
    showPads,
    showSilkscreen,
    showRatsnest,
    solderMaskColor,
    pcbBoard,
    pcbComponents,
    pcbHoles,
    pcbVias,
    pcbSmtPads,
    pcbTraces,
  ]);

  if (!pcbBoard) {
    return (
      <div className="h-full w-full rounded-md border border-amber-700/70 bg-amber-950/20 p-6 flex items-center justify-center font-mono">
        <div className="max-w-2xl space-y-4 text-center">
          <div className="text-amber-300 text-sm font-bold uppercase tracking-wider">PCB adaptadora ainda não projetada</div>
          <p className="text-xs text-amber-100/80 leading-relaxed">
            O circuito FuelGuard exibido nesta estação é a topologia elétrica da bancada em protoboard.
            Como ainda não existem contorno, footprints, furos, regras de fabricação e trilhas revisadas,
            nenhum retângulo, pad ou cobre sintético é desenhado aqui.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-left text-[10px] text-inst-secondary">
            <div className="bg-inst-canvas/70 border border-inst-border rounded-sm p-3"><strong className="text-inst-primary block">Disponível</strong>Netlist, portas, redes e esquemático documental.</div>
            <div className="bg-inst-canvas/70 border border-inst-border rounded-sm p-3"><strong className="text-inst-primary block">Pendente</strong>Esquemático KiCad revisado e footprints dos módulos.</div>
            <div className="bg-inst-canvas/70 border border-inst-border rounded-sm p-3"><strong className="text-inst-primary block">Bloqueado</strong>Gerbers, DRC de PCB e liberação para fabricação.</div>
          </div>
          <div className="text-[10px] text-inst-muted">Status do pacote: {circuitPkg.pcbReadiness ?? 'not-designed'} • Fonte: {circuitPkg.sourceOfTruth?.[0] ?? 'hardware/board-status.ts'}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#06090d] rounded-md border border-inst-border overflow-hidden select-none flex flex-col font-mono"
    >
      {/* 1. Barra Superior Esquerda: Alternador de Modo e Camadas EDA */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 bg-[#0e141c]/95 backdrop-blur-md border border-inst-border p-2 rounded-sm shadow-xs text-xs">
        {/* Alternador de Modo: PCB Roteada vs Conceito de Placa */}
        <div className="flex items-center space-x-1 border-r border-inst-border pr-2 mr-1">
          <button
            onClick={() => setDisplayMode('routed')}
            className={`px-2.5 py-1 rounded-xs font-bold transition flex items-center gap-1.5 ${
              displayMode === 'routed'
                ? 'bg-fuelguard-green text-white shadow-xs'
                : 'text-inst-secondary hover:text-inst-primary hover:bg-inst-subtle'
            }`}
            title="Exibe as trilhas físicas roteadas em Circuit JSON"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>PCB Roteada</span>
          </button>
          <button
            onClick={() => setDisplayMode('concept')}
            className={`px-2.5 py-1 rounded-xs font-bold transition flex items-center gap-1.5 ${
              displayMode === 'concept'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-inst-secondary hover:text-inst-primary hover:bg-inst-subtle'
            }`}
            title="Exibe o ratsnest conceitual pré-roteamento"
          >
            <Compass className="w-3 h-3" />
            <span>Conceito de Placa</span>
          </button>
        </div>

        {/* Camadas Ativas */}
        <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
          <input
            type="checkbox"
            checked={showTopCopper}
            onChange={(e) => setShowTopCopper(e.target.checked)}
            className="accent-orange-500"
          />
          <span className="text-orange-400">Top Copper (F.Cu)</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
          <input
            type="checkbox"
            checked={showBottomCopper}
            onChange={(e) => setShowBottomCopper(e.target.checked)}
            className="accent-sky-400"
          />
          <span className="text-sky-300">Bottom Copper (B.Cu)</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
          <input
            type="checkbox"
            checked={showPads}
            onChange={(e) => setShowPads(e.target.checked)}
            className="accent-yellow-400"
          />
          <span className="text-yellow-300">Pads / Vias</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
          <input
            type="checkbox"
            checked={showSilkscreen}
            onChange={(e) => setShowSilkscreen(e.target.checked)}
            className="accent-slate-200"
          />
          <span className="text-slate-200">Silkscreen</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
          <input
            type="checkbox"
            checked={showRatsnest}
            onChange={(e) => setShowRatsnest(e.target.checked)}
            className="accent-yellow-400"
          />
          <span className="text-yellow-300">Ratsnest</span>
        </label>

        <div className="w-px h-3.5 bg-inst-border mx-1" />

        <button
          onClick={() => {
            const next =
              solderMaskColor === 'copper_red'
                ? 'kicad_green'
                : solderMaskColor === 'kicad_green'
                ? 'obsidian'
                : 'copper_red';
            setSolderMaskColor(next);
          }}
          className="text-[10px] px-2 py-0.5 rounded-xs border border-inst-border hover:bg-inst-subtle transition"
          title="Alternar Máscara de Solda"
        >
          Máscara: {solderMaskColor === 'copper_red' ? 'Cobre EDA' : solderMaskColor === 'kicad_green' ? 'Verde KiCad' : 'Obsidiana'}
        </button>
      </div>

      {/* 2. Barra Superior Direita: Zoom e Enquadramento */}
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-1.5 bg-[#0e141c]/95 backdrop-blur-md border border-inst-border p-1.5 rounded-sm shadow-xs text-xs">
        <button
          onClick={() => setZoom((z) => Math.min(3.5, z + 0.2))}
          className="p-1 rounded-xs hover:bg-inst-subtle text-inst-secondary hover:text-inst-primary transition"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))}
          className="p-1 rounded-xs hover:bg-inst-subtle text-inst-secondary hover:text-inst-primary transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => { setZoom(1.25); setPan({ x: 0, y: 0 }); }}
          className="p-1 rounded-xs hover:bg-inst-subtle text-inst-secondary hover:text-fuelguard-green transition"
          title="Centralizar e Ajustar Enquadramento"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] text-inst-muted px-1.5">{Math.round(zoom * 100)}%</span>
      </div>

      {/* 3. Rodapé com Metadados de Roteamento e Regras DRC */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-2 text-[10px]">
        <div className="px-2 py-1 rounded-xs bg-[#0e141c]/90 border border-emerald-800 text-emerald-300 flex items-center gap-1.5 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>
            {displayMode === 'routed'
              ? `PCB Roteada: ${routedTracesCount} de ${sourceNets.length} Redes em 2 Camadas (Top/Bottom)`
              : `Conceito de Placa: ${unroutedCount} Conexões em Ratsnest`}
          </span>
        </div>
        <div className="px-2 py-1 rounded-xs bg-[#0e141c]/90 border border-inst-border text-inst-secondary flex items-center gap-1.5 shadow-xs">
          <span>FR-4: {Math.round(pcbBoard?.width ?? 140)}×{Math.round(pcbBoard?.height ?? 100)}mm • 2 camadas de referência • M3 (4 cantos)</span>
        </div>
      </div>

      {/* 4. Canvas Gráfico 2D Interativo */}
      <div
        className="flex-1 w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          width={1000}
          height={650}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};
