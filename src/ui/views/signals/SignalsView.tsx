import React, { useState, useEffect } from 'react';
import { 
  Waves, 
  Gauge, 
  Activity, 
  Thermometer, 
  Cylinder,
  Sparkles
} from 'lucide-react';
import { HonestyBadge } from '@/ui/components/badges/HonestyBadge';
import { useSimulation } from '@/core/worker/use-simulation';
import { AcousticTankCanvas } from './AcousticTankCanvas';
import { RealtimeSignalChart, SignalSample } from './RealtimeSignalChart';

export const SignalsView: React.FC = () => {
  const href = 16.0;
  const sim = useSimulation();

  const [samples, setSamples] = useState<SignalSample[]>([]);

  const snap = sim.snapshot;
  const waterHeight = snap.waterHeightCm;
  const rawDist = snap.rawDistanceCm;
  const filteredDist = snap.filteredDistanceCm;
  const soundSpeed = snap.soundSpeedMps;
  const echoTimeUs = Math.round((2 * (href - waterHeight) / (soundSpeed * 100)) * 1000000);
  const volumeL = snap.volumeL;
  const temp = snap.temperatureC;
  const inBlindZone = snap.inBlindZone;
  const echoValid = snap.echoValid;

  // Atualiza histórico em tempo real
  useEffect(() => {
    const isOutlier = Math.abs(rawDist - filteredDist) > 3.0;
    const newSample: SignalSample = {
      simTimeMs: sim.simTimeMs,
      rawDistanceCm: rawDist,
      filteredDistanceCm: filteredDist,
      waterHeightCm: waterHeight,
      isOutlier,
    };

    setSamples((prev) => [...prev.slice(-59), newSample]);
  }, [rawDist, filteredDist, waterHeight, sim.simTimeMs]);

  return (
    <div className="flex flex-col h-full bg-inst-canvas text-inst-primary font-ui overflow-y-auto p-6 space-y-6">
      {/* Topo: Título da Estação de Sinais */}
      <div className="bg-inst-surface border border-inst-border p-4 rounded-md shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#0369a1]" />
            <h1 className="text-sm font-display font-bold uppercase tracking-wider text-inst-primary">
              Estação de Sinais Acústicos & Telemetria do Tanque
            </h1>
            <HonestyBadge level="simulado" />
          </div>
          <p className="text-xs text-inst-secondary mt-1 max-w-3xl">
            Sensoriamento ultrassônico DFRobot A02YYUW/SEN0311 via UART TTL 9600 8N1, geometria do FG-TANK-6L-R1, ondas de slosh e filtro mediano de 5 amostras.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-inst-secondary">
          <span>Líquido: <strong className="text-inst-primary">Água Aberta</strong></span>
          <span>Sensor: <strong className="text-inst-primary">A02YYUW / SEN0311</strong></span>
        </div>
      </div>

      {/* Mostradores Numéricos Serenos (Precisão Instrumental) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Nível d'água */}
        <div className="bg-inst-surface border border-inst-border p-4 rounded-md shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs text-inst-secondary font-medium">
            <span className="flex items-center gap-1.5"><Waves className="w-4 h-4 text-sky-700" /> Nível da Água</span>
            <span className="text-[10px] font-mono text-inst-muted">h = Href - d</span>
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <div className="text-2xl font-bold text-inst-primary">{waterHeight.toFixed(1)} <span className="text-xs font-normal text-inst-secondary">cm</span></div>
            <div className="text-xs text-inst-secondary font-semibold">{(waterHeight / href * 100).toFixed(1)}%</div>
          </div>
          <div className="w-full bg-inst-subtle rounded-xs h-1.5 overflow-hidden border border-inst-border">
            <div className="bg-fuelguard-green h-1.5 transition-all duration-150" style={{ width: `${(waterHeight / href * 100)}%` }} />
          </div>
        </div>

        {/* Distância Acústica */}
        <div className="bg-inst-surface border border-inst-border p-4 rounded-md shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs text-inst-secondary font-medium">
            <span className="flex items-center gap-1.5"><Gauge className="w-4 h-4 text-emerald-700" /> Distância do Sensor</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-xs border ${
              echoValid 
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 border-rose-200 dark:border-rose-800 animate-pulse font-bold'
            }`}>
              {echoValid ? 'ECO VÁLIDO' : 'ZONA CEGA / TIMEOUT'}
            </span>
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <div className="text-2xl font-bold text-inst-primary">{filteredDist.toFixed(1)} <span className="text-xs font-normal text-inst-secondary">cm</span></div>
            <div className="text-xs text-inst-secondary">t_echo = {echoTimeUs} μs</div>
          </div>
          <div className="text-[10px] font-mono text-inst-muted truncate">
            Zona Cega: 3 cm • Faixa: 30–450 cm • UART: 9600 8N1
          </div>
        </div>

        {/* Volume Estimado */}
        <div className="bg-inst-surface border border-inst-border p-4 rounded-md shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs text-inst-secondary font-medium">
            <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-purple-700" /> Volume Estimado</span>
            <span className="text-[10px] font-mono text-inst-muted">V(h) Prismático</span>
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <div className="text-2xl font-bold text-inst-primary">{volumeL} <span className="text-xs font-normal text-inst-secondary">L</span></div>
            <div className="text-xs text-inst-secondary">de 1.000 L</div>
          </div>
          <div className="text-[10px] font-mono text-inst-muted">
            Base: 1,0 m × 1,0 m • Incerteza: ±0,5 L
          </div>
        </div>

        {/* Temperatura e Acústica */}
        <div className="bg-inst-surface border border-inst-border p-4 rounded-md shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs text-inst-secondary font-medium">
            <span className="flex items-center gap-1.5"><Thermometer className="w-4 h-4 text-amber-700" /> Temperatura Nominal</span>
            <HonestyBadge level="simulado" size="sm" />
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <div className="text-2xl font-bold text-inst-primary">{temp.toFixed(1)} <span className="text-xs font-normal text-inst-secondary">°C</span></div>
            <div className="text-xs text-inst-secondary">c = {soundSpeed.toFixed(2)} m/s</div>
          </div>
          <div className="text-[10px] font-mono text-inst-muted">
            c(T) = 331,3 · √(1 + T/273,15)
          </div>
        </div>
      </div>

      {/* Área Central: Corte Didático 2D do Tanque & Gráficos Temporais */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Painel do Tanque e Acústica Interativo (5 Colunas) */}
        <div className="lg:col-span-5 bg-inst-surface border border-inst-border p-5 rounded-md shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-inst-border pb-3">
            <span className="text-xs font-display font-bold uppercase tracking-wider text-inst-primary flex items-center gap-1.5">
              <Cylinder className="w-4 h-4 text-sky-700" />
              Corte Transversal 2D (Ondas & Feixe Acústico)
            </span>
            <HonestyBadge level="aproximado" size="sm" />
          </div>

          {/* Canvas Didático Interativo com Slosh e Feixe */}
          <AcousticTankCanvas
            waterHeightCm={waterHeight}
            hrefCm={href}
            inBlindZone={inBlindZone}
            echoValid={echoValid}
            soundSpeedMps={soundSpeed}
          />

          {/* Sliders de Interação */}
          <div className="space-y-3 pt-2 text-xs font-ui border-t border-inst-border">
            <div className="space-y-1">
              <div className="flex justify-between text-inst-secondary font-medium">
                <span>Nível da Água (Simulação):</span>
                <span className="font-mono text-inst-primary font-bold">{waterHeight.toFixed(1)} cm</span>
              </div>
              <input
                type="range"
                min="0"
                max={href}
                step="0.5"
                value={waterHeight}
                onChange={(e) => sim.setWaterHeight(parseFloat(e.target.value))}
                className="w-full accent-fuelguard-green"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-inst-secondary font-medium">
                <span>Temperatura do Ar:</span>
                <span className="font-mono text-inst-primary font-bold">{temp.toFixed(1)} °C</span>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                step="0.5"
                value={temp}
                onChange={(e) => sim.setAmbientTemp(parseFloat(e.target.value))}
                className="w-full accent-fuelguard-green"
              />
            </div>
          </div>
        </div>

        {/* Gráfico de Séries Temporais & Filtro Mediano (7 Colunas) */}
        <div className="lg:col-span-7 bg-inst-surface border border-inst-border p-5 rounded-md shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-inst-border pb-3">
            <div>
              <h2 className="text-xs font-display font-bold uppercase tracking-wider text-inst-primary flex items-center gap-2">
                <Activity className="w-4 h-4 text-fuelguard-green" />
                Osciloscópio Acústico & Filtro Mediano
              </h2>
              <p className="text-[11px] text-inst-secondary mt-0.5">
                Comparação contínua entre pulso sonoro bruto amostrado e sinal estabilizado via Filtro Mediano (5 amostras).
              </p>
            </div>

            <div className="flex items-center space-x-3 text-[11px] font-mono text-inst-secondary">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-fuelguard-green" /> Filtrado (cm)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Bruto (cm)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Outlier</span>
            </div>
          </div>

          {/* Gráfico Canvas 60 FPS */}
          <div className="h-72">
            <RealtimeSignalChart samples={samples} hrefCm={href} />
          </div>

          <div className="p-3 bg-inst-subtle border border-inst-border rounded-xs flex flex-wrap items-center justify-between text-xs font-mono text-inst-secondary gap-2">
            <span>Filtro: <strong className="text-inst-primary">Mediana (5 amostras)</strong></span>
            <span>Taxa: <strong className="text-inst-primary">5 Hz (200 ms)</strong></span>
            <span className="flex items-center gap-1 text-fuelguard-green">
              <Sparkles className="w-3.5 h-3.5" />
              Rejeição de Ruído Ativa
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
