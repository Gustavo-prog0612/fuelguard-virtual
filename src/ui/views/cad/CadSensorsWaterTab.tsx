/**
 * FuelGuard Virtual Test Bench — Estação 7: Sensor Ultrassônico & Hidrostática PBR
 * Análise aprofundada do acoplamento acústico do sensor JSN-SR04T com a coluna d'água 5L:
 * - Modelo óptico PBR de parede dupla em acrílico PMMA (η=1.491) e água potável (η=1.333)
 * - 6 passes ópticos de renderização com menisco superficial e anel de tensão
 * - 5 estados oficiais de ensaio: [0% (Vazio), 25%, 50%, 75%, 100% (Cheio)]
 * - Tags de proveniência [MEDIDO], [CALCULADO], [SIMULADO]
 */

import React, { useState, useMemo } from 'react';
import {
  Radio,
  AlertTriangle,
  CheckCircle2,
  Info,
  Waves,
  Layers,
} from 'lucide-react';
import { BenchAssemblyCanvas } from './BenchAssemblyCanvas';

interface CadSensorsWaterTabProps {
  onSelectTab?: (tabId: string) => void;
}

export const CadSensorsWaterTab: React.FC<CadSensorsWaterTabProps> = ({ onSelectTab }) => {
  const [waterLevelPct, setWaterLevelPct] = useState<number>(50);

  const tankHeightMm = 150.0;
  const sensorYMm = 144.0; // Posição nominal da face da sonda M20

  // Altura da coluna d'água útil
  const waterHeightMm = useMemo(() => {
    if (waterLevelPct <= 0) return 0;
    return (tankHeightMm - 24) * (waterLevelPct / 100);
  }, [waterLevelPct]);

  // Distância do transdutor à lâmina d'água
  const acousticDistanceMm = useMemo(() => {
    if (waterLevelPct <= 0) return sensorYMm - 2.5; // Distância até o fundo acrílico interno (141.5mm)
    return Math.max(10, sensorYMm - (waterHeightMm + 2.5));
  }, [waterLevelPct, waterHeightMm]);

  // Tempo de voo acústico (ToF) ida e volta: t = 2d / v_som (v_som = 343 m/s = 0.343 mm/μs)
  const timeOfFlightUs = useMemo(() => {
    return (2 * acousticDistanceMm) / 0.343;
  }, [acousticDistanceMm]);

  const transitTimeMs = useMemo(() => {
    return timeOfFlightUs / 1000;
  }, [timeOfFlightUs]);

  // Volume analítico em litros
  const volumeLiters = useMemo(() => {
    return (waterLevelPct / 100) * 5.0;
  }, [waterLevelPct]);

  const isBlindZone = waterLevelPct > 88;

  return (
    <div className="h-full flex flex-col space-y-3 font-ui text-inst-primary overflow-hidden select-text">
      {/* 1. Header do Módulo de Sensor e Água */}
      <div className="bg-inst-surface border border-inst-border p-3.5 rounded-md shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-display font-bold uppercase tracking-wider text-inst-primary">
              Estação de Telemetria Ultrassônica & Hidrostática PBR
            </h2>
            <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800">
              JSN-SR04T v2.0 • 40 kHz
            </span>
          </div>
          <p className="text-xs text-inst-secondary mt-1">
            Simulação física do feixe cônico acústico (15°) e modelo de transmissão óptica de 6 camadas (PMMA/Água/Ar).
          </p>
        </div>

        {/* Presets Rápidos dos 5 Estados Oficiais */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-[11px] text-inst-muted mr-1">5 Níveis Oficiais:</span>
          {[
            { lvl: 0, label: '0% (Vazio)' },
            { lvl: 25, label: '25%' },
            { lvl: 50, label: '50%' },
            { lvl: 75, label: '75%' },
            { lvl: 100, label: '100% (Cheio)' },
          ].map(({ lvl, label }) => (
            <button
              key={lvl}
              onClick={() => setWaterLevelPct(lvl)}
              className={`px-2.5 py-1 rounded-xs border text-[11px] font-bold transition ${
                waterLevelPct === lvl
                  ? 'bg-sky-600 text-white border-sky-400 shadow-xs'
                  : 'bg-inst-canvas text-inst-secondary hover:text-inst-primary border-inst-border'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Conteúdo Dividido: 3D à Esquerda, Telemetria & Parâmetros à Direita */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        {/* Viewport 3D Interativo da Bancada */}
        <div className="lg:col-span-8 bg-inst-surface border border-inst-border rounded-md shadow-xs overflow-hidden relative">
          <BenchAssemblyCanvas onSelectTab={onSelectTab as any} />
        </div>

        {/* Painel Lateral com Equações e Parâmetros PBR */}
        <div className="lg:col-span-4 bg-inst-surface border border-inst-border rounded-md shadow-xs p-4 overflow-y-auto space-y-4 font-mono text-xs">
          {/* Card de Telemetria Ativa */}
          <div className="bg-inst-canvas p-3 rounded-sm border border-sky-900/60 space-y-2.5">
            <div className="flex items-center justify-between border-b border-inst-border pb-1.5">
              <span className="text-sky-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5" />
                <span>Leitura Acústica Ativa</span>
              </span>
              <span className="text-[10px] text-inst-muted">[SIMULADO]</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-inst-muted font-ui">Distância à Água (d):</span>
                <strong className="text-sky-300">{acousticDistanceMm.toFixed(1)} mm</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-inst-muted font-ui">Tempo de Voo (ToF):</span>
                <strong className="text-amber-300">{timeOfFlightUs.toFixed(1)} μs ({transitTimeMs.toFixed(3)} ms)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-inst-muted font-ui">Volume de Água:</span>
                <strong className="text-emerald-400">{volumeLiters.toFixed(2)} L ({waterLevelPct}%)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-inst-muted font-ui">Altura da Coluna:</span>
                <strong className="text-inst-primary">{waterHeightMm.toFixed(1)} mm</strong>
              </div>
            </div>

            {/* Diagnóstico de Zona Cega */}
            {isBlindZone ? (
              <div className="p-2 rounded-xs bg-rose-950/70 border border-rose-600 text-rose-200 text-[10px] flex items-start gap-1.5 font-ui">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">ALERTA: Zona Cega do Sensor Ultrassônico</strong>
                  <span>A água está a menos de 20cm da sonda. Em um circuito físico, o pulso de emissão pode sobrepor a leitura do eco.</span>
                </div>
              </div>
            ) : waterLevelPct === 0 ? (
              <div className="p-2 rounded-xs bg-amber-950/40 border border-amber-700/60 text-amber-300 text-[10px] flex items-center gap-1.5 font-ui">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Tanque 100% Vazio — Eco refletindo diretamente no fundo acrílico (141.5mm).</span>
              </div>
            ) : (
              <div className="p-2 rounded-xs bg-emerald-950/40 border border-emerald-700/60 text-emerald-300 text-[10px] flex items-center gap-1.5 font-ui">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zona de leitura linear nominal livre de saturação.</span>
              </div>
            )}
          </div>

          {/* Propriedades do Meio Físico */}
          <div className="bg-inst-canvas p-3 rounded-sm border border-inst-border space-y-2">
            <div className="text-[11px] font-bold text-inst-primary uppercase tracking-wider border-b border-inst-border pb-1">
              Constantes Físicas do Meio [MEDIDO / CONSTANTE]
            </div>
            <div className="space-y-1 text-[11px] text-inst-secondary">
              <div className="flex justify-between">
                <span>Velocidade do Som no Ar:</span>
                <strong className="text-inst-primary">343.0 m/s @ 20°C</strong>
              </div>
              <div className="flex justify-between">
                <span>Ângulo de Abertura Acústica:</span>
                <strong className="text-inst-primary">15° cônico</strong>
              </div>
              <div className="flex justify-between">
                <span>Densidade do Fluido:</span>
                <strong className="text-inst-primary">1.000 kg/m³ (Água Potável)</strong>
              </div>
              <div className="flex justify-between">
                <span>Índice Refração da Água (η):</span>
                <strong className="text-sky-300">1.333</strong>
              </div>
              <div className="flex justify-between">
                <span>Índice Refração do Acrílico (PMMA):</span>
                <strong className="text-purple-300">1.491</strong>
              </div>
            </div>
          </div>

          {/* Ordem de Renderização Óptica 6-Pass PBR */}
          <div className="bg-inst-canvas p-3 rounded-sm border border-inst-border space-y-2">
            <div className="text-[11px] font-bold text-inst-primary uppercase tracking-wider border-b border-inst-border pb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-fuelguard-green" />
              <span>Pipeline Óptico 6-Pass PBR [VALIDADO]</span>
            </div>
            <ol className="text-[10px] text-inst-secondary space-y-1 list-decimal list-inside">
              <li>Parede posterior externa PMMA (renderOrder: 1)</li>
              <li>Parede posterior interna PMMA (renderOrder: 2)</li>
              <li>Coluna d'água ciano com absorção (renderOrder: 3)</li>
              <li>Menisco elíptico e anel de tensão (renderOrder: 4)</li>
              <li>Parede frontal interna PMMA + Escala (renderOrder: 5)</li>
              <li>Parede frontal externa PMMA (renderOrder: 6)</li>
            </ol>
            <div className="text-[9px] text-emerald-400 pt-1 border-t border-inst-border">
              ✓ Elimina artefatos de depth-fighting e vazamento de polígonos
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
