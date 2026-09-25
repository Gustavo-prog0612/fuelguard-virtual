/**
 * FuelGuard Virtual Test Bench — Visualizador Esquemático CAD (SVG Interativo)
 * Renderiza o diagrama elétrico unificado normalizado com padrão profissional de EDA,
 * alternador de tema (Papel Claro EDA vs Instrumento Obsidiana), blocos funcionais delimitados,
 * agrupamento de pinos do microcontrolador, capacitores de desacoplamento, flags direcionais de net
 * e selo formal de desenho técnico de engenharia (DIN/IEC 60617 / tscircuit IR).
 */

import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Download, Sun, Moon } from 'lucide-react';
import { CircuitJsonPackage } from '@/circuit-cad/circuit-json-builder';

interface SchematicCanvasProps {
  circuitPkg: CircuitJsonPackage;
}

export const SchematicCanvas: React.FC<SchematicCanvasProps> = ({ circuitPkg }) => {
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPaperTheme, setIsPaperTheme] = useState<boolean>(true); // Papel Claro EDA como padrão de alta fidelidade
  const svgRef = useRef<SVGSVGElement | null>(null);

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
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((z) => Math.max(0.5, Math.min(2.5, z * factor)));
  };

  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuelguard_schematic_eda_${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Detecta falha de 5V direto no circuito para pintar a linha de vermelho
  const hasFatal5V = circuitPkg.circuit_elements.some(
    (el) => el.type === 'source_net' && (el as any).name?.includes('FATAL')
  );

  // Paleta de Cores Dinâmica (Papel Claro EDA vs Dark Obsidiana)
  const colors = isPaperTheme
    ? {
        bg: '#fcfbf7',
        gridDot: '#d4d2c7',
        sheetBorder: '#94a3b8',
        boxBg: '#ffffff',
        boxStroke: '#1e293b',
        boxHeader: '#f1f5f9',
        wire: '#0f172a',
        wirePower: '#0284c7',
        wirePwr5V: '#d97706',
        wireGnd: '#475569',
        wireFault: '#dc2626',
        wireSafe: '#059669',
        wireSpi: '#7c3aed',
        textPrimary: '#0f172a',
        textSecondary: '#475569',
        textMuted: '#64748b',
        badgeBg: '#f8fafc',
        flagBg: '#e2e8f0',
        flagBorder: '#64748b',
        titleBlockBg: '#ffffff',
      }
    : {
        bg: '#070a0e',
        gridDot: '#1e293b',
        sheetBorder: '#334155',
        boxBg: '#0f172a',
        boxStroke: '#475569',
        boxHeader: '#1e293b',
        wire: '#cbd5e1',
        wirePower: '#38bdf8',
        wirePwr5V: '#f59e0b',
        wireGnd: '#64748b',
        wireFault: '#ef4444',
        wireSafe: '#22c55e',
        wireSpi: '#a855f7',
        textPrimary: '#f8fafc',
        textSecondary: '#cbd5e1',
        textMuted: '#94a3b8',
        badgeBg: '#0b0f15',
        flagBg: '#1e293b',
        flagBorder: '#475569',
        titleBlockBg: '#0f172a',
      };

  return (
    <div className="relative w-full h-full rounded-md border border-inst-border overflow-hidden select-none flex flex-col" style={{ backgroundColor: colors.bg }}>
      {/* Barra de Ferramentas Flutuante */}
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-1.5 bg-[#0b0f15]/90 backdrop-blur-xs border border-inst-border p-1.5 rounded-sm shadow-xs text-xs font-mono text-inst-primary">
        {/* Alternador de Tema EDA */}
        <button
          onClick={() => setIsPaperTheme(!isPaperTheme)}
          className="px-2 py-1 rounded-xs bg-inst-canvas border border-inst-border hover:border-fuelguard-green transition flex items-center gap-1.5 text-[11px]"
          title={isPaperTheme ? 'Alternar para Tema Escuro' : 'Alternar para Tema Papel Claro EDA'}
        >
          {isPaperTheme ? <Moon className="w-3.5 h-3.5 text-sky-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
          <span>{isPaperTheme ? 'Papel EDA' : 'Dark Obsidiana'}</span>
        </button>

        <div className="w-px h-3.5 bg-inst-border mx-1" />

        <button
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
          className="p-1 rounded-xs hover:bg-inst-subtle text-inst-secondary hover:text-inst-primary transition"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
          className="p-1 rounded-xs hover:bg-inst-subtle text-inst-secondary hover:text-inst-primary transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => { setZoom(1.0); setPan({ x: 0, y: 0 }); }}
          className="p-1 rounded-xs hover:bg-inst-subtle text-inst-secondary hover:text-inst-primary transition"
          title="Ajustar à Tela (Enquadramento Perfeito)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-3.5 bg-inst-border mx-1" />
        <span className="text-[10px] text-inst-muted px-1">{Math.round(zoom * 100)}%</span>

        <button
          onClick={handleExportSvg}
          className="px-2.5 py-1 rounded-xs bg-fuelguard-green text-white hover:bg-emerald-600 transition flex items-center gap-1 text-[11px]"
          title="Baixar Esquemático Vetorial SVG"
        >
          <Download className="w-3 h-3" />
          <span>Exportar SVG</span>
        </button>
      </div>

      {/* Selo Informativo de Topologia no Topo Esquerdo */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-[#0b0f15]/90 backdrop-blur-xs border border-inst-border px-2.5 py-1.5 rounded-sm shadow-xs text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-fuelguard-green" />
        <span className="text-inst-primary font-bold">
          {circuitPkg.title?.includes('RP2040') ? 'RP2040 Motor Cap: Multi-Sheet EDA' : 'Norma: IEC 60617 / tscircuit IR'}
        </span>
        <span className="text-[10px] text-inst-muted">
          {circuitPkg.title?.includes('RP2040') ? '• Driver DRV8847, INA241, TMP102' : '• Zonas Funcionais [01-07]'}
        </span>
      </div>

      {/* SVG Canvas com Pan, Zoom e Scroll */}
      <div
        className="flex-1 w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 1200 750"
          className="w-full h-full"
        >
          <defs>
            {/* Grade Técnica com Passo Milimétrico */}
            <pattern id="eda-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="0.8" fill={colors.gridDot} />
            </pattern>
            {/* Seta de Direção de Sinal */}
            <marker id="sig-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill={colors.textSecondary} />
            </marker>
          </defs>

          {/* Fundo e Grade */}
          <rect width="1200" height="750" fill={colors.bg} />
          <rect width="1200" height="750" fill="url(#eda-grid)" />

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {circuitPkg.title?.includes('RP2040') ? (
              <g id="rp2040-schematic-view">
                {/* Moldura da Folha Técnica */}
                <rect x="20" y="20" width="1160" height="710" fill="none" stroke={colors.sheetBorder} strokeWidth="1.5" />
                <rect x="25" y="25" width="1150" height="545" fill="#f8fafc" rx="4" />
                {/* Esquemático Vetorial SVG Oficial tscircuit */}
                <image
                  href="/data/rp2040/schematic.svg"
                  x="30"
                  y="30"
                  width="1140"
                  height="535"
                  preserveAspectRatio="xMidYMid meet"
                />

                {/* Selo de Desenho Técnico Formal RP2040 */}
                <g transform="translate(680, 580)">
                  <rect x="0" y="0" width="490" height="135" fill={colors.titleBlockBg} stroke={colors.boxStroke} strokeWidth="1.5" />
                  <line x1="0" y1="35" x2="490" y2="35" stroke={colors.boxStroke} strokeWidth="1" />
                  <line x1="0" y1="85" x2="490" y2="85" stroke={colors.boxStroke} strokeWidth="1" />
                  <line x1="310" y1="35" x2="310" y2="85" stroke={colors.boxStroke} strokeWidth="1" />
                  <line x1="310" y1="60" x2="490" y2="60" stroke={colors.boxStroke} strokeWidth="1" />

                  <text x="15" y="23" fill={colors.textPrimary} fontSize="12" fontWeight="bold" fontFamily="IBM Plex Mono">
                    RP2040 Stepper Motor Controller (imrishabh18)
                  </text>
                  <text x="15" y="52" fill={colors.textSecondary} fontSize="9" fontFamily="IBM Plex Mono">
                    Subsistema: <tspan fontWeight="bold" fill={colors.textPrimary}>NEMA 17 Cap • DRV8847 • USB-PD 12V</tspan>
                  </text>
                  <text x="15" y="72" fill={colors.textSecondary} fontSize="8.5" fontFamily="IBM Plex Mono">
                    Padrão: <tspan fill="#0284c7">tscircuit Multi-Sheet Schematics</tspan> • 4 Camadas
                  </text>

                  <text x="320" y="50" fill={colors.textSecondary} fontSize="8.5" fontFamily="IBM Plex Mono">REVISÃO: <tspan fontWeight="bold" fill={colors.textPrimary}>v1.0.23</tspan></text>
                  <text x="320" y="74" fill={colors.textSecondary} fontSize="8" fontFamily="IBM Plex Mono">FOLHAS: <tspan fontWeight="bold" fill={colors.textPrimary}>8 Folhas</tspan> • DATA: 2026-09-25</text>

                  <rect x="5" y="86" width="480" height="42" fill={isPaperTheme ? '#f8fafc' : '#080d14'} rx="2" />
                  <text x="15" y="103" fill={colors.textSecondary} fontSize="8.5" fontFamily="IBM Plex Mono">
                    TELEMETRIA: INA241A1 Shunts (ADC2/3) • TMP102 Interlock • RGB Status
                  </text>
                  <text x="15" y="119" fill={colors.wireSafe} fontSize="8.5" fontWeight="bold" fontFamily="IBM Plex Mono">
                    STATUS DRC: 0 ERROS • 1 REDE GND UNIFICADA • COMPLIANT IPC-2221
                  </text>
                </g>
              </g>
            ) : (
              <g id="fuelguard-schematic-view">
                {/* Moldura Externa da Folha Técnica DIN A3 */}
                <rect x="20" y="20" width="1160" height="710" fill="none" stroke={colors.sheetBorder} strokeWidth="1.5" />
                <rect x="25" y="25" width="1150" height="700" fill="none" stroke={colors.sheetBorder} strokeWidth="0.8" />

                {/* ============================================================== */}
                {/* ZONA 01: DESACOPLAMENTO E LINHAS DE ALIMENTAÇÃO               */}
                {/* ============================================================== */}
                <g transform="translate(60, 50)">
              {/* Borda tracejada da seção */}
              <rect x="0" y="0" width="220" height="150" rx="4" fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="4 3" />
              <rect x="0" y="0" width="200" height="20" fill={colors.boxHeader} rx="2" />
              <text x="8" y="14" fill="#0284c7" fontSize="10" fontWeight="bold" fontFamily="IBM Plex Mono">
                [ 01: POWER & BYPASS ]
              </text>

              {/* Barramento 3V3 */}
              <line x1="20" y1="40" x2="200" y2="40" stroke={colors.wirePower} strokeWidth="2" />
              <text x="25" y="35" fill={colors.wirePower} fontSize="10" fontWeight="bold" fontFamily="IBM Plex Mono">+3.3V DC</text>

              {/* Barramento 5V */}
              <line x1="20" y1="75" x2="200" y2="75" stroke={colors.wirePwr5V} strokeWidth="2" />
              <text x="25" y="70" fill={colors.wirePwr5V} fontSize="10" fontWeight="bold" fontFamily="IBM Plex Mono">+5.0V (VBUS)</text>

              {/* Barramento GND */}
              <line x1="20" y1="125" x2="200" y2="125" stroke={colors.wireGnd} strokeWidth="2" />
              <text x="25" y="140" fill={colors.wireGnd} fontSize="10" fontWeight="bold" fontFamily="IBM Plex Mono">GND (COMMON)</text>

              {/* Capacitor C1 (100nF) entre 3V3 e GND */}
              <g transform="translate(90, 40)">
                <line x1="0" y1="0" x2="0" y2="35" stroke={colors.wire} strokeWidth="1.2" />
                <line x1="-8" y1="35" x2="8" y2="35" stroke={colors.wire} strokeWidth="1.5" />
                <line x1="-8" y1="40" x2="8" y2="40" stroke={colors.wire} strokeWidth="1.5" />
                <line x1="0" y1="40" x2="0" y2="85" stroke={colors.wire} strokeWidth="1.2" />
                <text x="12" y="42" fill={colors.textPrimary} fontSize="9" fontFamily="IBM Plex Mono">C1 100nF</text>
              </g>

              {/* Capacitor C2 (10µF Bulk) entre 5V e GND */}
              <g transform="translate(160, 75)">
                <line x1="0" y1="0" x2="0" y2="20" stroke={colors.wire} strokeWidth="1.2" />
                <line x1="-8" y1="20" x2="8" y2="20" stroke={colors.wire} strokeWidth="1.5" />
                <line x1="-8" y1="25" x2="8" y2="25" stroke={colors.wire} strokeWidth="1.5" />
                <line x1="0" y1="25" x2="0" y2="50" stroke={colors.wire} strokeWidth="1.2" />
                <text x="12" y="26" fill={colors.textPrimary} fontSize="9" fontFamily="IBM Plex Mono">C2 10µF</text>
              </g>
            </g>

            {/* ============================================================== */}
            {/* ZONA 02: ESP32-S3 CORE CONTROLLER (U_MCU)                     */}
            {/* ============================================================== */}
            <g transform="translate(320, 50)">
              {/* Contorno tracejado da seção */}
              <rect x="-10" y="0" width="310" height="480" rx="4" fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="4 3" />
              <rect x="-10" y="0" width="220" height="20" fill={colors.boxHeader} rx="2" />
              <text x="0" y="14" fill="#16a34a" fontSize="10" fontWeight="bold" fontFamily="IBM Plex Mono">
                [ 02: ESP32-S3 CORE MCU ]
              </text>

              {/* Corpo Principal do Chip U1 */}
              <rect x="15" y="40" width="260" height="420" rx="3" fill={colors.boxBg} stroke={colors.boxStroke} strokeWidth="1.8" />
              
              {/* Header do Componente */}
              <rect x="15" y="40" width="260" height="30" fill={colors.boxHeader} />
              <text x="145" y="58" fill={colors.textPrimary} fontSize="12" fontWeight="bold" fontFamily="IBM Plex Mono" textAnchor="middle">
                U1 • ESP32-S3-WROOM-1
              </text>
              <text x="145" y="73" fill={colors.textMuted} fontSize="8.5" fontFamily="IBM Plex Sans" textAnchor="middle">
                Xtensa LX7 Dual-Core 240MHz • DIP-44 Carrier
              </text>

              {/* Grupo 1: Power & System Control (Esquerda Cima) */}
              <text x="25" y="100" fill="#0284c7" fontSize="9" fontWeight="bold" fontFamily="IBM Plex Mono">── POWER & BUS ──</text>
              {[
                { pin: '1', name: '3V3', y: 115, isPwr: true },
                { pin: '2', name: '5V (VBUS)', y: 140, isPwr: true },
                { pin: '3', name: 'GND', y: 165, isPwr: true },
                { pin: '4', name: 'CHIP_PU (EN)', y: 190 },
              ].map((p, i) => (
                <g key={i} transform={`translate(15, ${p.y})`}>
                  <line x1="-15" y1="0" x2="0" y2="0" stroke={colors.wire} strokeWidth="1.2" />
                  <circle cx="-15" cy="0" r="2.2" fill={colors.boxStroke} />
                  <text x="-18" y="3" fill={colors.textMuted} fontSize="8" fontFamily="IBM Plex Mono" textAnchor="end">{p.pin}</text>
                  <text x="8" y="3.5" fill={p.isPwr ? '#0284c7' : colors.textPrimary} fontSize="9.5" fontFamily="IBM Plex Mono" fontWeight="600">
                    {p.name}
                  </text>
                </g>
              ))}

              {/* Grupo 2: Telemetria Acústica & Nível (Esquerda Baixo) */}
              <text x="25" y="235" fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="IBM Plex Mono">── ACOUSTIC TELEM ──</text>
              {[
                { pin: '11', name: 'IO05 (TRIG)', y: 255 },
                { pin: '12', name: 'IO06 (ECHO_ATTEN)', y: 285, isEcho: true },
                { pin: '13', name: 'IO04 (LED_STAT)', y: 315 },
                { pin: '14', name: 'IO07 (REED_LID)', y: 345 },
              ].map((p, i) => (
                <g key={i} transform={`translate(15, ${p.y})`}>
                  <line x1="-15" y1="0" x2="0" y2="0" stroke={p.isEcho && hasFatal5V ? colors.wireFault : colors.wire} strokeWidth="1.4" />
                  <circle cx="-15" cy="0" r="2.2" fill={p.isEcho && hasFatal5V ? colors.wireFault : colors.boxStroke} />
                  <text x="-18" y="3" fill={colors.textMuted} fontSize="8" fontFamily="IBM Plex Mono" textAnchor="end">{p.pin}</text>
                  <text x="8" y="3.5" fill={p.isEcho && hasFatal5V ? colors.wireFault : colors.textPrimary} fontSize="9.5" fontFamily="IBM Plex Mono" fontWeight="600">
                    {p.name}
                  </text>
                </g>
              ))}

              {/* Grupo 3: Barramento SPI Isolado (Direita) */}
              <text x="265" y="100" fill="#7c3aed" fontSize="9" fontWeight="bold" fontFamily="IBM Plex Mono" textAnchor="end">── PN532 SPI ──</text>
              {[
                { pin: '23', name: 'IO10 (SPI_CS)', y: 120 },
                { pin: '24', name: 'IO11 (SPI_MOSI)', y: 155 },
                { pin: '25', name: 'IO12 (SPI_SCK)', y: 190 },
                { pin: '26', name: 'IO13 (SPI_MISO)', y: 225 },
              ].map((p, i) => (
                <g key={i} transform={`translate(275, ${p.y})`}>
                  <line x1="0" y1="0" x2="15" y2="0" stroke={colors.wire} strokeWidth="1.2" />
                  <circle cx="15" cy="0" r="2.2" fill={colors.boxStroke} />
                  <text x="18" y="3" fill={colors.textMuted} fontSize="8" fontFamily="IBM Plex Mono">{p.pin}</text>
                  <text x="-8" y="3.5" fill="#7c3aed" fontSize="9.5" fontFamily="IBM Plex Mono" fontWeight="600" textAnchor="end">
                    {p.name}
                  </text>
                </g>
              ))}
            </g>

            {/* ============================================================== */}
            {/* ZONA 03: CONDICIONAMENTO DE SINAL 5V (BUFFER + DIVISOR)       */}
            {/* ============================================================== */}
            <g transform="translate(680, 50)">
              <rect x="-10" y="0" width="220" height="480" rx="4" fill="none" stroke="#d97706" strokeWidth="1" strokeDasharray="4 3" />
              <rect x="-10" y="0" width="200" height="20" fill={colors.boxHeader} rx="2" />
              <text x="0" y="14" fill="#d97706" fontSize="10" fontWeight="bold" fontFamily="IBM Plex Mono">
                [ 03: LEVEL TRANSLATION ]
              </text>

              {/* Bloco 1: Buffer SN74AHCT125N (3V3 -> 5V) */}
              <g transform="translate(10, 40)">
                <rect x="0" y="0" width="180" height="150" rx="3" fill={colors.boxBg} stroke={colors.boxStroke} strokeWidth="1.5" />
                <rect x="0" y="0" width="180" height="24" fill={colors.boxHeader} />
                <text x="90" y="16" fill={colors.textPrimary} fontSize="11" fontWeight="bold" fontFamily="IBM Plex Mono" textAnchor="middle">
                  U2 • SN74AHCT125N
                </text>
                <text x="90" y="32" fill={colors.textMuted} fontSize="8" fontFamily="IBM Plex Sans" textAnchor="middle">
                  Buffer TTL Não-Inversor (3V3→5V)
                </text>

                {/* Entrada 1A (Pino 2) */}
                <g transform="translate(0, 65)">
                  <line x1="-15" y1="0" x2="0" y2="0" stroke={colors.wire} strokeWidth="1.2" />
                  <circle cx="-15" cy="0" r="2.2" fill={colors.boxStroke} />
                  <text x="8" y="3.5" fill={colors.textPrimary} fontSize="9" fontFamily="IBM Plex Mono">1A (IO5 3V3)</text>
                </g>

                {/* Habilitação /1OE (Pino 1) */}
                <g transform="translate(0, 100)">
                  <line x1="-15" y1="0" x2="0" y2="0" stroke={colors.wire} strokeWidth="1.2" />
                  <circle cx="-15" cy="0" r="2.2" fill={colors.boxStroke} />
                  <text x="8" y="3.5" fill={colors.textMuted} fontSize="9" fontFamily="IBM Plex Mono">/1OE (GND)</text>
                </g>

                {/* Saída 1Y (Pino 3) */}
                <g transform="translate(180, 65)">
                  <line x1="0" y1="0" x2="15" y2="0" stroke={colors.wirePwr5V} strokeWidth="1.4" />
                  <circle cx="15" cy="0" r="2.2" fill={colors.wirePwr5V} />
                  <text x="-8" y="3.5" fill={colors.wirePwr5V} fontSize="9.5" fontWeight="bold" fontFamily="IBM Plex Mono" textAnchor="end">
                    1Y (TRIG 5V)
                  </text>
                </g>
              </g>

              {/* Bloco 2: Divisor de Tensão Resistivo (10k / 15k) */}
              <g transform="translate(10, 240)">
                <rect x="0" y="0" width="180" height="200" rx="3" fill={colors.boxBg} stroke={hasFatal5V ? colors.wireFault : colors.boxStroke} strokeWidth="1.5" />
                <rect x="0" y="0" width="180" height="24" fill={colors.boxHeader} />
                <text x="90" y="16" fill={hasFatal5V ? colors.wireFault : colors.textPrimary} fontSize="11" fontWeight="bold" fontFamily="IBM Plex Mono" textAnchor="middle">
                  R_DIV • 10kΩ / 15kΩ
                </text>
                <text x="90" y="32" fill={colors.textMuted} fontSize="8" fontFamily="IBM Plex Sans" textAnchor="middle">
                  Atenuador Passivo 5.0V → 3.00V
                </text>

                {/* Entrada 5V do Echo */}
                <g transform="translate(180, 65)">
                  <line x1="0" y1="0" x2="15" y2="0" stroke={hasFatal5V ? colors.wireFault : colors.wirePwr5V} strokeWidth="1.4" />
                  <circle cx="15" cy="0" r="2.2" fill={hasFatal5V ? colors.wireFault : colors.wirePwr5V} />
                  <text x="-8" y="3.5" fill={colors.wirePwr5V} fontSize="9" fontFamily="IBM Plex Mono" textAnchor="end">ECHO_IN (5V)</text>
                </g>

                {/* Resistor R1 (10k) e R2 (15k) em esquema esquemático */}
                <g transform="translate(90, 65)">
                  <line x1="75" y1="0" x2="0" y2="0" stroke={colors.wire} strokeWidth="1.2" />
                  <rect x="-8" y="0" width="16" height="30" fill={colors.boxBg} stroke={colors.boxStroke} strokeWidth="1.2" />
                  <text x="14" y="18" fill={colors.textPrimary} fontSize="8.5" fontFamily="IBM Plex Mono">R1 10k</text>

                  {/* Ponto médio / saída segura */}
                  <line x1="0" y1="30" x2="0" y2="45" stroke={colors.wire} strokeWidth="1.2" />
                  <circle cx="0" cy="45" r="3" fill={colors.wireSafe} />
                  <line x1="0" y1="45" x2="-75" y2="45" stroke={colors.wireSafe} strokeWidth="1.4" />
                  <text x="-40" y="40" fill={colors.wireSafe} fontSize="9" fontWeight="bold" fontFamily="IBM Plex Mono">3.00V SAFE</text>

                  {/* Resistor R2 (15k) até GND */}
                  <line x1="0" y1="45" x2="0" y2="60" stroke={colors.wire} strokeWidth="1.2" />
                  <rect x="-8" y="60" width="16" height="30" fill={colors.boxBg} stroke={colors.boxStroke} strokeWidth="1.2" />
                  <text x="14" y="78" fill={colors.textPrimary} fontSize="8.5" fontFamily="IBM Plex Mono">R2 15k</text>

                  {/* Conexão ao GND */}
                  <line x1="0" y1="90" x2="0" y2="110" stroke={colors.wireGnd} strokeWidth="1.2" />
                  <line x1="-10" y1="110" x2="10" y2="110" stroke={colors.wireGnd} strokeWidth="1.5" />
                  <line x1="-6" y1="114" x2="6" y2="114" stroke={colors.wireGnd} strokeWidth="1.2" />
                  <line x1="-2" y1="118" x2="2" y2="118" stroke={colors.wireGnd} strokeWidth="1.0" />
                </g>
              </g>
            </g>

            {/* ============================================================== */}
            {/* ZONA 04: JSN-SR04T ULTRASONIC TRANSDUCER                       */}
            {/* ============================================================== */}
            <g transform="translate(950, 50)">
              <rect x="-10" y="0" width="200" height="210" rx="4" fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="4 3" />
              <rect x="-10" y="0" width="180" height="20" fill={colors.boxHeader} rx="2" />
              <text x="0" y="14" fill="#0284c7" fontSize="10" fontWeight="bold" fontFamily="IBM Plex Mono">
                [ 04: ULTRASONIC 40kHz ]
              </text>

              <g transform="translate(10, 40)">
                <rect x="0" y="0" width="160" height="150" rx="3" fill={colors.boxBg} stroke={colors.boxStroke} strokeWidth="1.5" />
                <rect x="0" y="0" width="160" height="24" fill={colors.boxHeader} />
                <text x="80" y="16" fill="#0284c7" fontSize="11" fontWeight="bold" fontFamily="IBM Plex Mono" textAnchor="middle">
                  SEN1 • JSN-SR04T v2
                </text>
                <text x="80" y="32" fill={colors.textMuted} fontSize="8" fontFamily="IBM Plex Sans" textAnchor="middle">
                  Transdutor Estanque (20-600cm)
                </text>

                {[
                  { name: 'VCC (5V)', y: 55, isPwr: true },
                  { name: 'TRIG (5V IN)', y: 85 },
                  { name: 'ECHO (5V OUT)', y: 115, isWarn: true },
                ].map((p, i) => (
                  <g key={i} transform={`translate(0, ${p.y})`}>
                    <line x1="-15" y1="0" x2="0" y2="0" stroke={p.isWarn && hasFatal5V ? colors.wireFault : colors.wire} strokeWidth="1.2" />
                    <circle cx="-15" cy="0" r="2.2" fill={p.isWarn && hasFatal5V ? colors.wireFault : colors.boxStroke} />
                    <text x="8" y="3.5" fill={p.isPwr ? '#0284c7' : p.isWarn ? colors.wirePwr5V : colors.textPrimary} fontSize="9" fontFamily="IBM Plex Mono">
                      {p.name}
                    </text>
                  </g>
                ))}
              </g>
            </g>

            {/* ============================================================== */}
            {/* ZONA 05: PN532 NFC / RFID SUBSYSTEM                           */}
            {/* ============================================================== */}
            <g transform="translate(950, 290)">
              <rect x="-10" y="0" width="200" height="240" rx="4" fill="none" stroke="#7c3aed" strokeWidth="1" strokeDasharray="4 3" />
              <rect x="-10" y="0" width="180" height="20" fill={colors.boxHeader} rx="2" />
              <text x="0" y="14" fill="#7c3aed" fontSize="10" fontWeight="bold" fontFamily="IBM Plex Mono">
                [ 05: PN532 NFC MODULE ]
              </text>

              <g transform="translate(10, 40)">
                <rect x="0" y="0" width="160" height="180" rx="3" fill={colors.boxBg} stroke={colors.boxStroke} strokeWidth="1.5" />
                <rect x="0" y="0" width="160" height="24" fill={colors.boxHeader} />
                <text x="80" y="16" fill="#7c3aed" fontSize="11" fontWeight="bold" fontFamily="IBM Plex Mono" textAnchor="middle">
                  RFID1 • PN532 Breakout
                </text>
                <text x="80" y="32" fill={colors.textMuted} fontSize="8" fontFamily="IBM Plex Sans" textAnchor="middle">
                  13.56 MHz NFC • Modo SPI Ativo
                </text>

                {[
                  { name: 'VCC (3V3)', y: 55, isPwr: true },
                  { name: 'GND', y: 80, isPwr: true },
                  { name: 'SS / CS (IO10)', y: 105 },
                  { name: 'MOSI (IO11)', y: 125 },
                  { name: 'SCK (IO12)', y: 145 },
                  { name: 'MISO (IO13)', y: 165 },
                ].map((p, i) => (
                  <g key={i} transform={`translate(0, ${p.y})`}>
                    <line x1="-15" y1="0" x2="0" y2="0" stroke={colors.wire} strokeWidth="1.2" />
                    <circle cx="-15" cy="0" r="2.2" fill={colors.boxStroke} />
                    <text x="8" y="3.5" fill={p.isPwr ? '#0284c7' : colors.textPrimary} fontSize="9" fontFamily="IBM Plex Mono">
                      {p.name}
                    </text>
                  </g>
                ))}
              </g>
            </g>

            {/* ============================================================== */}
            {/* ZONA 06: SENSOR MAGNÉTICO REED (INTERLOCK DA TAMPA)            */}
            {/* ============================================================== */}
            <g transform="translate(60, 230)">
              <rect x="0" y="0" width="220" height="200" rx="4" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="4 3" />
              <rect x="0" y="0" width="180" height="20" fill={colors.boxHeader} rx="2" />
              <text x="8" y="14" fill="#059669" fontSize="10" fontWeight="bold" fontFamily="IBM Plex Mono">
                [ 06: LID INTERLOCK ]
              </text>

              <g transform="translate(20, 40)">
                <rect x="0" y="0" width="180" height="140" rx="3" fill={colors.boxBg} stroke={colors.boxStroke} strokeWidth="1.5" />
                <text x="90" y="20" fill={colors.textPrimary} fontSize="11" fontWeight="bold" fontFamily="IBM Plex Mono" textAnchor="middle">
                  SW1 • REED SWITCH
                </text>
                <text x="90" y="34" fill={colors.textMuted} fontSize="8" fontFamily="IBM Plex Sans" textAnchor="middle">
                  Normalmente Aberto (N.A.)
                </text>

                {/* Símbolo elétrico de contato reed */}
                <line x1="20" y1="70" x2="60" y2="70" stroke={colors.wire} strokeWidth="1.4" />
                <line x1="60" y1="70" x2="95" y2="55" stroke={colors.wire} strokeWidth="1.6" />
                <line x1="100" y1="70" x2="140" y2="70" stroke={colors.wire} strokeWidth="1.4" />
                <circle cx="60" cy="70" r="2.5" fill={colors.boxStroke} />
                <circle cx="100" cy="70" r="2.5" fill={colors.boxStroke} />

                {/* Resistor de Pull-Up 10k */}
                <text x="90" y="105" fill={colors.textSecondary} fontSize="8.5" fontFamily="IBM Plex Mono" textAnchor="middle">
                  Pull-up Interno no IO7 (45kΩ)
                </text>
                <text x="90" y="122" fill={colors.wireSafe} fontSize="8" fontFamily="IBM Plex Mono" textAnchor="middle">
                  Estado: FECHADA = LOW (0V)
                </text>
              </g>
            </g>

            {/* ============================================================== */}
            {/* ZONA 07: TELEMETRIA AUDIOVISUAL (LED D1 + BUZZER BZ1)          */}
            {/* ============================================================== */}
            <g transform="translate(60, 445)">
              <rect x="0" y="0" width="220" height="150" rx="4" fill="none" stroke="#16a34a" strokeWidth="1" strokeDasharray="4 3" />
              <rect x="0" y="0" width="200" height="20" fill={colors.boxHeader} rx="2" />
              <text x="8" y="14" fill="#16a34a" fontSize="10" fontWeight="bold" fontFamily="IBM Plex Mono">
                [ 07: STATUS & AUDIO ]
              </text>

              <g transform="translate(15, 35)">
                {/* D1 LED */}
                <rect x="0" y="0" width="85" height="95" rx="3" fill={colors.boxBg} stroke={colors.boxStroke} strokeWidth="1.2" />
                <text x="42.5" y="16" fill={colors.textPrimary} fontSize="9" fontWeight="bold" fontFamily="IBM Plex Mono" textAnchor="middle">
                  D1 • LED
                </text>
                <text x="42.5" y="28" fill={colors.textMuted} fontSize="7.5" fontFamily="IBM Plex Sans" textAnchor="middle">
                  Verde 0805
                </text>
                {/* Símbolo LED com resistor 330R */}
                <line x1="42.5" y1="36" x2="42.5" y2="48" stroke={colors.wire} strokeWidth="1.2" />
                <polygon points="35,48 50,48 42.5,60" fill={colors.wireSafe} stroke={colors.wireSafe} />
                <line x1="34" y1="60" x2="51" y2="60" stroke={colors.wireSafe} strokeWidth="1.5" />
                <line x1="42.5" y1="60" x2="42.5" y2="72" stroke={colors.wire} strokeWidth="1.2" />
                <text x="42.5" y="84" fill={colors.textMuted} fontSize="7" fontFamily="IBM Plex Mono" textAnchor="middle">R3 330Ω</text>

                {/* BZ1 Buzzer */}
                <g transform="translate(95, 0)">
                  <rect x="0" y="0" width="95" height="95" rx="3" fill={colors.boxBg} stroke={colors.boxStroke} strokeWidth="1.2" />
                  <text x="47.5" y="16" fill={colors.textPrimary} fontSize="9" fontWeight="bold" fontFamily="IBM Plex Mono" textAnchor="middle">
                    BZ1 • BUZZER
                  </text>
                  <text x="47.5" y="28" fill={colors.textMuted} fontSize="7.5" fontFamily="IBM Plex Sans" textAnchor="middle">
                    Piezo 4kHz
                  </text>
                  {/* Símbolo de transdutor piezoelétrico */}
                  <rect x="37.5" y="40" width="20" height="20" rx="10" fill={colors.boxBg} stroke={colors.boxStroke} strokeWidth="1.2" />
                  <line x1="47.5" y1="35" x2="47.5" y2="40" stroke={colors.wire} strokeWidth="1.2" />
                  <line x1="47.5" y1="60" x2="47.5" y2="68" stroke={colors.wireGnd} strokeWidth="1.2" />
                  <text x="47.5" y="54" fill="#0284c7" fontSize="8" fontWeight="bold" fontFamily="IBM Plex Mono" textAnchor="middle">♪</text>
                  <text x="47.5" y="84" fill={colors.textMuted} fontSize="7" fontFamily="IBM Plex Mono" textAnchor="middle">IO04 / 3V3</text>
                </g>
              </g>
            </g>

            {/* ============================================================== */}
            {/* FIAÇÃO ORTOGONAL E FLAGS DIRECIONAIS DE NET                     */}
            {/* ============================================================== */}
            {/* 1. ESP32 IO5 -> Buffer 1A */}
            <path d="M 335 305 H 640 V 115 H 680" fill="none" stroke={colors.wire} strokeWidth="1.4" />
            <polygon points="630,111 640,115 630,119" fill={colors.textSecondary} />

            {/* 2. Buffer 1Y (5V) -> JSN TRIG (5V) */}
            <path d="M 875 115 H 935" fill="none" stroke={colors.wirePwr5V} strokeWidth="1.6" />
            <polygon points="925,111 935,115 925,119" fill={colors.wirePwr5V} />

            {/* 3. JSN ECHO (5V) -> Divisor R_DIV OU Falha Fatal direta */}
            {hasFatal5V ? (
              <g>
                {/* Linha vermelha de curto fatal direto no GPIO6 */}
                <path d="M 935 165 H 900 V 550 H 300 V 335 H 335" fill="none" stroke={colors.wireFault} strokeWidth="2.5" strokeDasharray="6 3" />
                <polygon points="325,331 335,335 325,339" fill={colors.wireFault} />
                <rect x="420" y="535" width="360" height="26" fill="#fef2f2" stroke={colors.wireFault} strokeWidth="1.2" rx="2" />
                <text x="600" y="552" fill={colors.wireFault} fontSize="11" fontWeight="bold" fontFamily="IBM Plex Mono" textAnchor="middle">
                  ⚠️ ALERTA DRC: 5.0V CONECTADO DIRETO AO GPIO6 DO ESP32!
                </text>
              </g>
            ) : (
              <g>
                {/* Caminho Seguro Nominal */}
                <path d="M 935 165 H 885 V 305 H 875" fill="none" stroke={colors.wirePwr5V} strokeWidth="1.4" />
                <polygon points="885,301 875,305 885,309" fill={colors.wirePwr5V} />

                {/* Divisor 3.00V -> ESP32 IO6 */}
                <path d="M 680 350 H 600 V 335 H 335" fill="none" stroke={colors.wireSafe} strokeWidth="1.5" />
                <polygon points="345,331 335,335 345,339" fill={colors.wireSafe} />
                <text x="480" y="328" fill={colors.wireSafe} fontSize="9" fontWeight="bold" fontFamily="IBM Plex Mono">
                  ECHO_3V0_SAFE (PROTEGIDO)
                </text>
              </g>
            )}

            {/* 4. Barramento SPI (IO10..IO13 -> PN532) */}
            <path d="M 610 170 H 650 V 510 H 920 V 435 H 950" fill="none" stroke={colors.wireSpi} strokeWidth="1.4" />
            <text x="730" y="504" fill={colors.wireSpi} fontSize="9" fontWeight="bold" fontFamily="IBM Plex Mono">
              SPI BUS 4-VIAS (10MHz) [CS, MOSI, SCK, MISO]
            </text>

            {/* ============================================================== */}
            {/* SELO DE DESENHO TÉCNICO FORMAL EDA (CANTO INFERIOR DIREITO)    */}
            {/* ============================================================== */}
            <g transform="translate(680, 580)">
              <rect x="0" y="0" width="490" height="135" fill={colors.titleBlockBg} stroke={colors.boxStroke} strokeWidth="1.5" />
              <line x1="0" y1="35" x2="490" y2="35" stroke={colors.boxStroke} strokeWidth="1" />
              <line x1="0" y1="85" x2="490" y2="85" stroke={colors.boxStroke} strokeWidth="1" />
              <line x1="310" y1="35" x2="310" y2="85" stroke={colors.boxStroke} strokeWidth="1" />
              <line x1="310" y1="60" x2="490" y2="60" stroke={colors.boxStroke} strokeWidth="1" />

              {/* Título do Projeto */}
              <text x="15" y="23" fill={colors.textPrimary} fontSize="12" fontWeight="bold" fontFamily="IBM Plex Mono">
                FuelGuard Virtual Test Bench — Esquemático Didático
              </text>

              {/* Informações de Documentação */}
              <text x="15" y="52" fill={colors.textSecondary} fontSize="9" fontFamily="IBM Plex Mono">
                Subsistema: <tspan fontWeight="bold" fill={colors.textPrimary}>Carrier Board ESP32-S3 + tscircuit IR</tspan>
              </text>
              <text x="15" y="72" fill={colors.textSecondary} fontSize="8.5" fontFamily="IBM Plex Mono">
                Norma: <tspan fill="#0284c7">IEC 60617 / IEEE 315</tspan> • Esquema Elétrico Formal
              </text>

              <text x="320" y="50" fill={colors.textSecondary} fontSize="8.5" fontFamily="IBM Plex Mono">REVISÃO: <tspan fontWeight="bold" fill={colors.textPrimary}>v1.0.4</tspan></text>
              <text x="320" y="74" fill={colors.textSecondary} fontSize="8" fontFamily="IBM Plex Mono">FOLHA: <tspan fontWeight="bold" fill={colors.textPrimary}>1/1</tspan> • DATA: 2026-09-25</text>

              {/* Aviso Mandatório de Segurança */}
              <rect x="5" y="86" width="480" height="42" fill={isPaperTheme ? '#f8fafc' : '#080d14'} rx="2" />
              <text x="15" y="103" fill={colors.textSecondary} fontSize="8.5" fontFamily="IBM Plex Mono">
                DIRETRIZ DIDÁTICA: Circuito projetado estritamente para recipiente com água.
              </text>
              <text x="15" y="119" fill={hasFatal5V ? colors.wireFault : colors.wireSafe} fontSize="8.5" fontWeight="bold" fontFamily="IBM Plex Mono">
                {hasFatal5V
                  ? 'STATUS DRC: FALHA DE SOBRETENSÃO 5V DETECTADA NO GPIO6'
                  : 'STATUS DRC: CIRCUIT JSON VÁLIDO • MARGENS ELÉTRICAS NOMINAIS OK'}
              </text>
            </g>
          </g>
        )}
      </g>
    </svg>
  </div>
</div>
);
};
