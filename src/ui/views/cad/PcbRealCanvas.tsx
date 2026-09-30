/**
 * FuelGuard — Canvas PCB 2D Profissional
 *
 * Renderizador canvas 2D que consome o Circuit JSON gerado pelo pcb-builder.ts.
 * Renderiza com fidelidade de ferramenta EDA profissional:
 *   - Substrato FR-4 com máscara de solda colorida
 *   - Pads THT circulares/quadrados com anel de cobre e furo de drill
 *   - Trilhas de cobre com larguras corretas por netclass
 *   - Silkscreen: linhas, arcos e círculos dos footprints KiCad
 *   - Furos mecânicos M3 NPTH
 *   - Courtyard de cada componente (fundo semitransparente)
 *   - Ratsnest quando em modo conceito
 *   - Crosshair de origem EDA
 *   - Controles: zoom, pan, alternador de máscara, camadas
 */

import React, { useRef, useEffect, useMemo, useState } from 'react';
import {
  ZoomIn, ZoomOut, RotateCcw, Layers, Compass,
  Download,
} from 'lucide-react';
import {
  buildRealPcbElements,
  computePcbStats,
  PCB_COMPONENT_POSITIONS,
} from '@/circuit-cad/pcb-builder';
import { KICAD_FOOTPRINT_MAP } from '@/circuit-cad/kicad-footprints';
import { FUELGUARD_NETLIST } from '@/circuit-cad/netlist';

type MaskColor = 'black' | 'green' | 'red_copper';
type DisplayMode = 'routed' | 'concept';

interface LayerVis {
  topCopper:    boolean;
  bottomCopper: boolean;
  pads:         boolean;
  silkscreen:   boolean;
  courtyard:    boolean;
  ratsnest:     boolean;
}

// Paleta de cores por netclass — fundo escuro EDA
const NET_CLASS_COLOR: Record<string, string> = {
  power:  '#f97316',  // laranja — alimentação
  ground: '#22c55e',  // verde — GND
  signal: '#38bdf8',  // azul claro — sinais GPIO
  spi:    '#a78bfa',  // violeta — SPI
  uart:   '#fb7185',  // rosa — UART
};

function getMaskColors(mask: MaskColor) {
  if (mask === 'green')      return { bg: '#064e3b', rim: '#047857', copper: '#ea580c', silk: '#f8fafc' };
  if (mask === 'red_copper') return { bg: '#3b1219', rim: '#991b1b', copper: '#ea580c', silk: '#f8fafc' };
  /* black */                return { bg: '#0f172a', rim: '#334155', copper: '#f59e0b', silk: '#f8fafc' };
}

export const PcbRealCanvas: React.FC = () => {
  const canvasRef    = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom]     = useState(2.2);
  const [pan,  setPan]      = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [drag, setDrag]     = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mask, setMask]     = useState<MaskColor>('black');
  const [mode, setMode]     = useState<DisplayMode>('routed');
  const [layers, setLayers] = useState<LayerVis>({
    topCopper: true, bottomCopper: true, pads: true,
    silkscreen: true, courtyard: true, ratsnest: false,
  });
  const [hovered, setHovered] = useState<string | null>(null);

  // Gerar elementos PCB uma vez (memoizado)
  const pcbElements = useMemo(() => buildRealPcbElements(), []);
  const pcbStats    = useMemo(() => computePcbStats(pcbElements), [pcbElements]);

  const board   = useMemo(() => pcbElements.find((e) => e.type === 'pcb_board') as any, [pcbElements]);
  const holes   = useMemo(() => pcbElements.filter((e) => e.type === 'pcb_plated_hole') as any[], [pcbElements]);
  const traces  = useMemo(() => pcbElements.filter((e) => e.type === 'pcb_trace') as any[], [pcbElements]);
  const nets    = useMemo(() => pcbElements.filter((e) => e.type === 'source_net') as any[], [pcbElements]);
  const sourceTraces = useMemo(() => pcbElements.filter((e) => e.type === 'source_trace') as any[], [pcbElements]);
  const traceNetNames = useMemo(() => {
    const sourceNetNames = new Map(nets.map((net) => [net.source_net_id, net.name]));
    return new Map(sourceTraces.map((trace) => [
      trace.source_trace_id,
      trace.connected_source_net_ids?.map((netId: string) => sourceNetNames.get(netId)).find(Boolean) ?? '',
    ]));
  }, [nets, sourceTraces]);
  const silkLines   = useMemo(() => pcbElements.filter((e) => e.type === 'pcb_silkscreen_line') as any[], [pcbElements]);
  const silkCircles = useMemo(() => pcbElements.filter((e) => e.type === 'pcb_silkscreen_circle') as any[], [pcbElements]);
  const bottomTraceCount = useMemo(
    () => traces.filter((trace) => trace.route?.some((point: any) => point.layer === 'bottom')).length,
    [traces],
  );

  // mm → pixels

  const onMouseDown  = (e: React.MouseEvent) => { setDrag(true); setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); };
  const onMouseMove  = (e: React.MouseEvent) => {
    if (drag) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const scale = zoom * 3.2;
    const xMm = ((e.clientX - rect.left) - rect.width / 2 - pan.x) / scale + board.width / 2;
    const yMm = ((e.clientY - rect.top) - rect.height / 2 - pan.y) / scale + board.height / 2;
    const hoveredComponent = Object.entries(PCB_COMPONENT_POSITIONS).find(([componentId, position]) => {
      const footprint = KICAD_FOOTPRINT_MAP[componentId];
      if (!footprint) return false;
      return Math.abs(xMm - position.x) <= footprint.courtyardW / 2
        && Math.abs(yMm - position.y) <= footprint.courtyardH / 2;
    });
    setHovered(hoveredComponent?.[0] ?? null);
  };
  const onMouseUp    = () => setDrag(false);
  const onWheel      = (e: React.WheelEvent) => { e.preventDefault(); setZoom((z) => Math.max(0.5, Math.min(8, z * (e.deltaY < 0 ? 1.12 : 0.89)))); };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !board) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const colors = getMaskColors(mask);

    // 1. Fundo preto
    ctx.fillStyle = '#06090d';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(W / 2 + pan.x, H / 2 + pan.y);

    const m = (mm: number) => mm * zoom * 3.2;
    const bW = m(board.width);
    const bH = m(board.height);
    const bX = -bW / 2;
    const bY = -bH / 2;

    // 2. Substrato FR-4 com máscara de solda
    ctx.fillStyle = colors.bg;
    ctx.strokeStyle = colors.rim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bX, bY, bW, bH, 6);
    ctx.fill();
    ctx.stroke();

    // 3. Plano de cobre interno sutil (ground pour)
    ctx.fillStyle = 'rgba(234,88,12,0.07)';
    ctx.beginPath();
    ctx.roundRect(bX + 6, bY + 6, bW - 12, bH - 12, 3);
    ctx.fill();

    // 4. Courtyards dos componentes
    if (layers.courtyard) {
      for (const [compId, pos] of Object.entries(PCB_COMPONENT_POSITIONS)) {
        const fp = KICAD_FOOTPRINT_MAP[compId];
        if (!fp) continue;
        const cx = m(pos.x) - bW / 2;
        const cy = m(pos.y) - bH / 2;
        const cw = m(fp.courtyardW);
        const ch = m(fp.courtyardH);
        ctx.fillStyle = compId === hovered ? 'rgba(251,191,36,0.18)' : 'rgba(99,102,241,0.06)';
        ctx.strokeStyle = compId === hovered ? 'rgba(251,191,36,0.7)' : 'rgba(99,102,241,0.25)';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.rect(cx - cw / 2, cy - ch / 2, cw, ch);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 5. Crosshair de origem EDA
    ctx.strokeStyle = 'rgba(34,197,94,0.5)';
    ctx.lineWidth = 0.7;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(bX - 20, 0); ctx.lineTo(bX + bW + 20, 0);
    ctx.moveTo(0, bY - 20); ctx.lineTo(0, bY + bH + 20);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 8px "IBM Plex Mono", monospace';
    ctx.fillText('0,0', 4, -4);

    // 6. Trilhas de cobre
    if (mode === 'routed') {
      for (const trace of traces) {
        const route = trace.route;
        if (!route || route.length < 2) continue;

        const traceLayer = route[0]?.layer ?? 'top';
        if (traceLayer === 'top' && !layers.topCopper) continue;
        if (traceLayer === 'bottom' && !layers.bottomCopper) continue;

        // Cor baseada no índice da rede (netclass via nome)
        const netName: string = traceNetNames.get(trace.source_trace_id) ?? '';
        const netDef = FUELGUARD_NETLIST.find((n) => n.name === netName);
        const traceColor = netDef ? NET_CLASS_COLOR[netDef.netClass] : colors.copper;

        ctx.strokeStyle = traceColor;
        ctx.lineCap  = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        route.forEach((pt: any, idx: number) => {
          const px = m(pt.x) - bW / 2;
          const py = m(pt.y) - bH / 2;
          ctx.lineWidth = Math.max(1.5, m(pt.width ?? 0.3));
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }
    }

    // Ratsnest / modo conceito
    if (mode === 'concept' || layers.ratsnest) {
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 0.9;
      ctx.setLineDash([3, 3]);
      for (const trace of traces) {
        const route = trace.route;
        if (!route || route.length < 2) continue;
        const p1 = route[0];
        const p2 = route[route.length - 1];
        ctx.beginPath();
        ctx.moveTo(m(p1.x) - bW / 2, m(p1.y) - bH / 2);
        ctx.lineTo(m(p2.x) - bW / 2, m(p2.y) - bH / 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // 7. Pads THT — anel de cobre + furo
    if (layers.pads) {
      for (const hole of holes) {
        const px = m(hole.x) - bW / 2;
        const py = m(hole.y) - bH / 2;
        const padR  = Math.max(2.5, m((hole.outer_diameter ?? 1.7) / 2));
        const holeR = Math.max(1.2, m((hole.hole_diameter ?? 0.9)  / 2));

        // Anel de cobre dourado ENIG
        ctx.fillStyle = '#d4a017';
        ctx.beginPath();
        ctx.arc(px, py, padR, 0, Math.PI * 2);
        ctx.fill();

        // Halo de solda HAL
        ctx.fillStyle = '#e8d5a3';
        ctx.beginPath();
        ctx.arc(px, py, holeR + m(0.2), 0, Math.PI * 2);
        ctx.fill();

        // Furo escuro
        ctx.fillStyle = '#06090d';
        ctx.beginPath();
        ctx.arc(px, py, holeR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 8. Silkscreen — linhas dos footprints KiCad
    if (layers.silkscreen) {
      ctx.strokeStyle = colors.silk;
      ctx.lineWidth = 1.0;
      ctx.setLineDash([]);

      for (const line of silkLines) {
        const x1 = m(line.x1) - bW / 2;
        const y1 = m(line.y1) - bH / 2;
        const x2 = m(line.x2) - bW / 2;
        const y2 = m(line.y2) - bH / 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      for (const circle of silkCircles) {
        const cx = m(circle.x) - bW / 2;
        const cy = m(circle.y) - bH / 2;
        const r  = m(circle.radius);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Designators dos componentes
      ctx.font = `bold ${Math.max(6, m(1.0))}px "IBM Plex Mono", monospace`;
      ctx.fillStyle = colors.silk;
      for (const [compId, pos] of Object.entries(PCB_COMPONENT_POSITIONS)) {
        const fp = KICAD_FOOTPRINT_MAP[compId];
        if (!fp) continue;
        const tx = m(pos.x + fp.refText.x) - bW / 2;
        const ty = m(pos.y + fp.refText.y) - bH / 2;
        ctx.fillText(compId.toUpperCase(), tx, ty);
      }
    }

    // 9. Borda e dimensões da placa
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.rect(bX, bY, bW, bH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Dimensão horizontal
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px "IBM Plex Mono", monospace';
    ctx.fillText(`${board.width} mm`, bX + bW / 2 - 15, bY - 8);
    ctx.fillText(`${board.height} mm`, bX - 35, bY + bH / 2);

    ctx.restore();
  }, [pcbElements, board, holes, traces, silkLines, silkCircles, traceNetNames, zoom, pan, mask, mode, layers, hovered]);

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `fuelguard-pcb-${Date.now()}.png`;
    a.click();
  };

  const cycleColors = () => {
    setMask((m) => m === 'black' ? 'green' : m === 'green' ? 'red_copper' : 'black');
  };

  const maskLabel = mask === 'black' ? 'Obsidiana' : mask === 'green' ? 'Verde KiCad' : 'Cobre EDA';

  if (!board) return (
    <div className="flex items-center justify-center h-full text-amber-300 font-mono text-sm">
      Gerando PCB real...
    </div>
  );

  return (
    <div className="relative w-full h-full bg-[#06090d] flex flex-col overflow-hidden font-mono select-none">
      {/* Toolbar Superior Esquerda */}
      <div className="absolute top-2 left-2 z-20 flex flex-wrap gap-1.5 bg-[#0e141c]/95 backdrop-blur border border-slate-700/60 p-2 rounded-lg shadow text-xs">
        {/* Modo */}
        <div className="flex items-center gap-1 border-r border-slate-700 pr-2 mr-0.5">
          <button
            onClick={() => setMode('routed')}
            className={`px-2 py-1 rounded flex items-center gap-1 font-bold transition ${mode === 'routed' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Compass className="w-3 h-3" /> Proposta de layout
          </button>
          <button
            onClick={() => setMode('concept')}
            className={`px-2 py-1 rounded flex items-center gap-1 font-bold transition ${mode === 'concept' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Compass className="w-3 h-3" /> Ratsnest
          </button>
        </div>

        {/* Camadas */}
        {([
          ['topCopper',    'Top Cu',    'text-orange-400'],
          ['bottomCopper', `Bot Cu (${bottomTraceCount})`, 'text-sky-400'],
          ['pads',         'Pads',      'text-yellow-400'],
          ['silkscreen',   'Silk',      'text-slate-300'],
          ['courtyard',    'Courtyard', 'text-indigo-400'],
          ['ratsnest',     'Ratsnest',  'text-yellow-400'],
        ] as const).map(([key, label, cls]) => (
          <label key={key} className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={layers[key as keyof LayerVis]}
              disabled={key === 'bottomCopper' && bottomTraceCount === 0}
              onChange={(e) => setLayers((l) => ({ ...l, [key]: e.target.checked }))}
              className="w-3 h-3 disabled:opacity-40"
            />
            <span className={`${cls} ${key === 'bottomCopper' && bottomTraceCount === 0 ? 'opacity-50' : ''}`}>{label}</span>
          </label>
        ))}

        <button onClick={cycleColors} className="px-2 py-0.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-800 transition">
          Máscara: {maskLabel}
        </button>
      </div>

      {/* Toolbar Superior Direita — Zoom */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-[#0e141c]/95 backdrop-blur border border-slate-700/60 p-1.5 rounded-lg shadow text-xs">
        <button onClick={() => setZoom((z) => Math.min(8, z + 0.4))}   className="p-1 hover:bg-slate-800 rounded"><ZoomIn  className="w-3.5 h-3.5 text-slate-300" /></button>
        <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.4))} className="p-1 hover:bg-slate-800 rounded"><ZoomOut className="w-3.5 h-3.5 text-slate-300" /></button>
        <button onClick={() => { setZoom(2.2); setPan({ x: 0, y: 0 }); }} className="p-1 hover:bg-slate-800 rounded"><RotateCcw className="w-3.5 h-3.5 text-slate-300" /></button>
        <span className="text-slate-400 px-1">{Math.round(zoom * 100)}%</span>
        <div className="w-px h-4 bg-slate-700" />
        <button onClick={exportPng} className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded flex items-center gap-1">
          <Download className="w-3 h-3" /> PNG
        </button>
      </div>

      {/* Estatísticas Inferiores */}
      <div className="absolute bottom-2 left-2 z-20 flex flex-wrap gap-2 text-[10px]">
        <div className="px-2 py-1 bg-[#0e141c]/90 border border-emerald-800 text-emerald-300 rounded flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          {pcbStats.totalPads} pads • {pcbStats.totalTraces} segmentos gerados • {pcbStats.totalNets} redes
        </div>
        <div className="px-2 py-1 bg-[#0e141c]/90 border border-slate-700 text-slate-400 rounded">
          {pcbStats.boardWidthMm}×{pcbStats.boardHeightMm}mm • FR-4 1.6mm • {pcbStats.layers} camadas • {pcbStats.mountingHoles}× M3
        </div>
        <div className="px-2 py-1 bg-[#0e141c]/90 border border-violet-800 text-violet-300 rounded flex items-center gap-1">
          <Layers className="w-3 h-3" />
          Footprints KiCad (CC-BY-SA 4.0) • github.com/KiCad/kicad-footprints
        </div>
      </div>

      {/* Legenda de Nets */}
      <div className="absolute bottom-2 right-2 z-20 bg-[#0e141c]/90 border border-slate-700 rounded p-2 text-[10px] space-y-0.5">
        {Object.entries(NET_CLASS_COLOR).map(([cls, color]) => (
          <div key={cls} className="flex items-center gap-1.5">
            <span className="w-5 h-1.5 rounded-full inline-block" style={{ backgroundColor: color }} />
            <span className="text-slate-400 capitalize">{cls}</span>
          </div>
        ))}
      </div>

      <div className="absolute top-14 left-2 z-20 max-w-[330px] px-2.5 py-2 bg-amber-950/90 border border-amber-700/80 rounded-lg text-[10px] text-amber-200 leading-relaxed shadow">
        <strong className="block text-amber-300">Não liberada para fabricação</strong>
        Esta vista é uma proposta visual derivada do netlist. O gate KiCad/DRC/Gerber continua pendente.
      </div>

      {/* Canvas */}
      <div
        className="flex-1 w-full h-full cursor-crosshair active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={() => { onMouseUp(); setHovered(null); }}
        onWheel={onWheel}
      >
        <canvas
          ref={canvasRef}
          width={1400}
          height={900}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};
