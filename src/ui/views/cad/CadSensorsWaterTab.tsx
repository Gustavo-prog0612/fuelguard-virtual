/**
 * FuelGuard Virtual Test Bench — Estação de Metrologia Ultrassônica
 * Preparação do ensaio com a baseline FG-TANK-6L-R1; calibração física continua separada.
 */

import React, { useState } from 'react';
import {
  Radio,
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

  return (
    <div className="h-full flex flex-col space-y-3 font-ui text-inst-primary overflow-hidden select-text">
      {/* 1. Header do Módulo de Sensor e Água */}
      <div className="bg-inst-surface border border-inst-border p-3.5 rounded-md shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-display font-bold uppercase tracking-wider text-inst-primary">
              Estação de Metrologia Ultrassônica — Dados Pendentes
            </h2>
            <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800">
              A02YYUW / SEN0311 • UART 9600 8N1
            </span>
          </div>
          <p className="text-xs text-inst-secondary mt-1">
            Baseline paramétrica: tanque interno 200 × 200 × 160 mm, tampa 5 mm, sensor central. A geometria orienta o desenho; a calibração exige peça fabricada e medida.
          </p>
        </div>

        {/* Presets Rápidos dos 5 Estados Oficiais */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-[11px] text-inst-muted mr-1">Perfil de ensaio:</span>
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
              <span className="text-[10px] text-amber-300">[PENDENTE]</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-inst-muted font-ui">Distância à Água (d):</span>
                <strong className="text-sky-300">35–135 mm nominal (1–5 L)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-inst-muted font-ui">Tempo de Voo (ToF):</span>
                <strong className="text-sky-300">UART; sem ToF exposto</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-inst-muted font-ui">Volume de Água:</span>
                <strong className="text-amber-300">6,4 L geométrico; não calibrado</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-inst-muted font-ui">Altura da Coluna:</span>
                <strong className="text-sky-300">25–125 mm nominal</strong>
              </div>
            </div>

            <div className="p-2 rounded-xs bg-amber-950/40 border border-amber-700/60 text-amber-300 text-[10px] flex items-start gap-1.5 font-ui">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>O SEN0311 documenta zona cega nominal de 30 mm, faixa 30–4500 mm e IP67. O suporte do probe, a visada e a calibração dependem da unidade e do tanque fabricado.</span>
            </div>
          </div>

          {/* Propriedades do Meio Físico */}
          <div className="bg-inst-canvas p-3 rounded-sm border border-inst-border space-y-2">
            <div className="text-[11px] font-bold text-inst-primary uppercase tracking-wider border-b border-inst-border pb-1">
              Baseline física da bancada [não é calibração]
            </div>
            <div className="space-y-1 text-[11px] text-inst-secondary">
              <div className="flex justify-between">
                <span>Zona cega SEN0311:</span>
                <strong className="text-sky-300">30 mm nominal</strong>
              </div>
              <div className="flex justify-between">
                <span>Faixa SEN0311:</span>
                <strong className="text-sky-300">30–4500 mm</strong>
              </div>
              <div className="flex justify-between">
                <span>Protocolo:</span>
                <strong className="text-sky-300">TTL 9600 8N1</strong>
              </div>
              <div className="flex justify-between">
                <span>Volume operacional:</span>
                <strong className="text-sky-300">1,0–5,0 L</strong>
              </div>
              <div className="flex justify-between">
                <span>Capacidade geométrica:</span>
                <strong className="text-amber-300">6,4 L nominal</strong>
              </div>
            </div>
          </div>

          {/* Renderização 3D bloqueada */}
          <div className="bg-inst-canvas p-3 rounded-sm border border-inst-border space-y-2">
            <div className="text-[11px] font-bold text-inst-primary uppercase tracking-wider border-b border-inst-border pb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-fuelguard-green" />
              <span>Pipeline 3D paramétrico [REFERÊNCIA]</span>
            </div>
            <div className="text-[10px] text-amber-300">
              A cena 3D usa a caixa FG-TANK-6L-R1 e mostra a coluna d'água nominal. Não usar o render para liberar corte, vedação ou calibração sem a peça fabricada e medida.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
