/** Visualização SVG da topologia elétrica canônica da bancada real. */

import React, { useRef, useState } from 'react';
import { Download, Moon, RotateCcw, Sun, ZoomIn, ZoomOut } from 'lucide-react';
import { CircuitJsonPackage } from '@/circuit-cad/circuit-json-builder';

interface SchematicCanvasProps { circuitPkg: CircuitJsonPackage; }

type Box = { id: string; title: string; subtitle: string; x: number; y: number; w: number; h: number; color: string; pins: string[] };

const BOXES: Box[] = [
  { id: 'esp32', title: 'U1 · ESP32-S3-DevKitC-1-N8R8', subtitle: 'v1.1 · GPIO 3.3 V · SPI/UART1', x: 380, y: 190, w: 300, h: 300, color: '#16a34a', pins: ['3V3', 'GND', 'GPIO4 · LED', 'GPIO7 · LID', 'GPIO14 · BZ1', 'GPIO16 · UART1_RX', 'GPIO10–13 · SPI'] },
  { id: 'level', title: 'SEN1 · DFRobot A02YYUW / SEN0311', subtitle: 'IP67 · UART TTL 9600 8N1 · 3.3 V', x: 55, y: 90, w: 270, h: 220, color: '#0284c7', pins: ['VCC · 3V3', 'GND', 'RX · MODE HIGH', 'TX · GPIO16'] },
  { id: 'pn532', title: 'RFID1 · ELECHOUSE PN532 V4', subtitle: 'SPI selecionado · header 1×8', x: 845, y: 95, w: 270, h: 235, color: '#7c3aed', pins: ['VCC · 3V3', 'GND', 'SS · GPIO10', 'MOSI · GPIO11', 'SCK · GPIO12', 'MISO · GPIO13'] },
  { id: 'lid', title: 'SW1 · MC-38 + ímã', subtitle: 'Variante NO/NC e gap pendentes', x: 55, y: 410, w: 270, h: 160, color: '#059669', pins: ['SINAL · GPIO7', 'GND'] },
  { id: 'status', title: 'D1/R3 + BZ1', subtitle: 'LED 220 Ω · buzzer ativo 2–5 V', x: 845, y: 410, w: 270, h: 160, color: '#d97706', pins: ['LED · GPIO4', 'BZ1 · GPIO14', 'GND'] },
];

const WIRES: Array<{ from: [number, number]; to: [number, number]; label: string; color: string }> = [
  { from: [325, 175], to: [380, 350], label: 'LEVEL_UART_RX · TX → GPIO16', color: '#0284c7' },
  { from: [325, 230], to: [380, 270], label: 'LEVEL_MODE_PROCESSED · RX → 3V3', color: '#f97316' },
  { from: [680, 265], to: [845, 185], label: 'SPI_CS / MOSI / SCK / MISO', color: '#7c3aed' },
  { from: [325, 485], to: [380, 390], label: 'LID_INTERLOCK · GPIO7', color: '#059669' },
  { from: [680, 430], to: [845, 470], label: 'STATUS_LED_CTRL / BUZZER_CTRL', color: '#d97706' },
];

export const SchematicCanvas: React.FC<SchematicCanvasProps> = ({ circuitPkg }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [paper, setPaper] = useState(true);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const hasFatal = circuitPkg.circuit_elements.some((el) => el.type === 'source_net' && (el as any).name?.includes('FATAL'));
  const colors = paper
    ? { bg: '#fcfbf7', grid: '#d4d2c7', ink: '#0f172a', muted: '#475569', panel: '#ffffff', wire: '#334155' }
    : { bg: '#070a0e', grid: '#1e293b', ink: '#f8fafc', muted: '#cbd5e1', panel: '#0f172a', wire: '#cbd5e1' };

  const exportSvg = () => {
    if (!svgRef.current) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svgRef.current)], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `fuelguard-schematic-${Date.now()}.svg`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full h-full rounded-md border border-inst-border overflow-hidden" style={{ background: colors.bg }}>
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-inst-surface/95 border border-inst-border p-1.5 rounded-sm shadow-xs">
        <button onClick={() => setPaper(!paper)} className="px-2 py-1 text-[11px] rounded-xs border border-inst-border flex items-center gap-1.5">{paper ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />} {paper ? 'Dark' : 'Papel EDA'}</button>
        <button onClick={() => setZoom((value) => Math.min(2.5, value + 0.15))} className="p-1"><ZoomIn className="w-3.5 h-3.5" /></button>
        <button onClick={() => setZoom((value) => Math.max(0.5, value - 0.15))} className="p-1"><ZoomOut className="w-3.5 h-3.5" /></button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="p-1"><RotateCcw className="w-3.5 h-3.5" /></button>
        <button onClick={exportSvg} className="px-2 py-1 rounded-xs bg-fuelguard-green text-white text-[11px] flex items-center gap-1"><Download className="w-3 h-3" /> SVG</button>
      </div>
      <div className="absolute top-3 left-3 z-10 px-2.5 py-1.5 rounded-sm bg-inst-surface/95 border border-inst-border text-[11px] font-mono">
        <span className="text-fuelguard-green font-bold">FUELGUARD · ESQUEMÁTICO DE REFERÊNCIA</span>
        <span className="text-inst-muted"> · {circuitPkg.pcbReadiness} · PCB não liberada</span>
      </div>
      <div className="w-full h-full cursor-grab active:cursor-grabbing" onMouseDown={(event) => { setDragging(true); setDragStart({ x: event.clientX - pan.x, y: event.clientY - pan.y }); }} onMouseMove={(event) => { if (dragging) setPan({ x: event.clientX - dragStart.x, y: event.clientY - dragStart.y }); }} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)} onWheel={(event) => { event.preventDefault(); setZoom((value) => Math.max(0.5, Math.min(2.5, value * (event.deltaY < 0 ? 1.08 : 0.92)))); }}>
        <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 1200 680" className="w-full h-full">
          <defs><pattern id="fg-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill={colors.grid} /></pattern></defs>
          <rect width="1200" height="680" fill={colors.bg} /><rect width="1200" height="680" fill="url(#fg-grid)" />
          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
            <rect x="20" y="20" width="1160" height="640" fill="none" stroke={colors.muted} strokeWidth="1.5" />
            {WIRES.map((wire) => <g key={wire.label}><path d={`M ${wire.from[0]} ${wire.from[1]} H ${(wire.from[0] + wire.to[0]) / 2} V ${wire.to[1]} H ${wire.to[0]}`} fill="none" stroke={hasFatal && wire.label.includes('LEVEL_UART') ? '#dc2626' : wire.color} strokeWidth="2" /><text x={(wire.from[0] + wire.to[0]) / 2} y={(wire.from[1] + wire.to[1]) / 2 - 5} fill={hasFatal && wire.label.includes('LEVEL_UART') ? '#dc2626' : wire.color} fontSize="9" fontFamily="IBM Plex Mono" textAnchor="middle">{wire.label}</text></g>)}
            {BOXES.map((box) => <g key={box.id} transform={`translate(${box.x},${box.y})`}><rect width={box.w} height={box.h} rx="4" fill={colors.panel} stroke={box.color} strokeWidth="1.5" /><rect width={box.w} height="40" rx="4" fill={box.color} fillOpacity="0.12" /><text x="12" y="18" fill={colors.ink} fontSize="11" fontWeight="bold" fontFamily="IBM Plex Mono">{box.title}</text><text x="12" y="32" fill={colors.muted} fontSize="8" fontFamily="IBM Plex Sans">{box.subtitle}</text>{box.pins.map((pin, index) => <g key={pin} transform={`translate(14,${58 + index * 28})`}><circle r="3" fill={box.color} /><text x="10" y="3" fill={colors.ink} fontSize="9" fontFamily="IBM Plex Mono">{pin}</text></g>)}</g>)}
            <g transform="translate(380,525)"><rect width="735" height="90" fill={colors.panel} stroke={colors.muted} /><text x="14" y="22" fill={colors.ink} fontSize="11" fontWeight="bold" fontFamily="IBM Plex Mono">DIRETRIZES DE RELEASE</text><text x="14" y="43" fill={colors.muted} fontSize="9" fontFamily="IBM Plex Mono">SEN0311: VCC=3V3 · TX→GPIO16 · RX/MODE=HIGH · 9600 8N1</text><text x="14" y="60" fill={colors.muted} fontSize="9" fontFamily="IBM Plex Mono">PN532 V4: SPI · GPIO10–13 · confirmar header e furação da unidade</text><text x="14" y="77" fill={hasFatal ? '#dc2626' : '#059669'} fontSize="9" fontWeight="bold" fontFamily="IBM Plex Mono">{hasFatal ? 'DRC: FALHA — UART 5V INJETADA NO GPIO16' : 'DRC: NOMINAL — SEM SOBRETENSÃO NO CIRCUITO CANÔNICO'}</text></g>
          </g>
        </svg>
      </div>
    </div>
  );
};
