import React from 'react';
import { 
  Play, 
  AlertTriangle, 
  KeyRound, 
  Waves, 
  Sliders, 
  Shuffle, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';
import { HonestyBadge } from '@/ui/components/badges/HonestyBadge';
import { useSimulation } from '@/core/worker/use-simulation';
import { BUILT_IN_SCENARIOS } from '@/core/scenarios/built-in-scenarios';

export const TestsView: React.FC = () => {
  const sim = useSimulation();

  const handleRandomSeed = () => {
    const newSeed = Math.floor(Math.random() * 100000);
    sim.setSeed(newSeed);
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F5F7] dark:bg-slate-950 text-slate-900 dark:text-white font-ui overflow-y-auto p-5 md:p-8 space-y-6">
      {/* Topo: Cabeçalho do Laboratório de Testes (Permity Style) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h1 className="text-sm font-display font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Estação de Testes & Laboratório de Falhas
            </h1>
            <HonestyBadge level="simulado" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Ensaios pré-configurados determinísticos rastreáveis à Seção 11 do Briefing para avaliar a robustez do firmware antes da montagem física.
          </p>
        </div>

        {/* Controle do PRNG */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Semente PRNG:</span>
          <input
            type="number"
            value={sim.seed}
            onChange={(e) => sim.setSeed(parseInt(e.target.value) || 0)}
            className="w-24 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
          />
          <button
            onClick={handleRandomSeed}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
            title="Sortear Nova Semente"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grade de Cenários Didáticos Pré-configurados (Permity Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {BUILT_IN_SCENARIOS.map((preset) => {
          const isSelected = sim.activeScenarioId === preset.id;
          return (
            <div
              key={preset.id}
              onClick={() => sim.loadScenario(preset.id)}
              className={`p-6 rounded-3xl border text-left cursor-pointer transition flex flex-col justify-between space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-neutral-900 dark:border-white ring-2 ring-neutral-900/10 dark:ring-white/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-400'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {preset.badge}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>

                <h2 className="text-sm font-bold text-slate-900 dark:text-white">{preset.name}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{preset.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-mono text-slate-400">
                <span>Ruído: ±{preset.noiseStdDevCm} cm</span>
                <button
                  className={`px-3.5 py-1.5 rounded-full text-xs font-ui font-semibold flex items-center gap-1.5 transition ${
                    isSelected 
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" /> Carregar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Injeção Manual de Falhas e Estímulos */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-600" />
          Injeção de Estímulos e Falhas em Tempo Real
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
          <button 
            onClick={() => sim.toggleLid()}
            className="p-3 rounded-xs bg-inst-canvas border border-inst-border hover:border-amber-600 text-left space-y-1 transition"
          >
            <div className="flex justify-between text-[#b45309] font-bold">
              <span>Alternar Tampa ({sim.snapshot.isLidClosed ? 'Fechada' : 'Aberta'})</span>
              <Lock className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-inst-secondary">Gera 10 pulsos oscilatórios em 15 ms no Reed Switch (debounce 50ms).</p>
          </button>

          <button 
            onClick={() => sim.presentNfc('04:3A:7F:2C:5D')}
            className="p-3 rounded-xs bg-inst-canvas border border-inst-border hover:border-emerald-600 text-left space-y-1 transition"
          >
            <div className="flex justify-between text-[#166534] dark:text-emerald-400 font-bold">
              <span>Aproximar Tag Autorizada</span>
              <KeyRound className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-inst-secondary">UID: 04:3A:7F:2C:5D (Operador Didático Cadastrado).</p>
          </button>

          <button 
            onClick={() => sim.presentNfc('04:9B:11:3E:8A')}
            className="p-3 rounded-xs bg-inst-canvas border border-inst-border hover:border-rose-600 text-left space-y-1 transition"
          >
            <div className="flex justify-between text-[#b91c1c] dark:text-rose-400 font-bold">
              <span>Aproximar Tag Desconhecida</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-inst-secondary">UID: 04:9B:11:3E:8A (Recusa Didática sem Atuador).</p>
          </button>

          <button 
            onClick={() => sim.removeNfc()}
            className="p-3 rounded-xs bg-inst-canvas border border-inst-border hover:border-inst-border-strong text-left space-y-1 transition"
          >
            <div className="flex justify-between text-inst-secondary font-bold">
              <span>Afastar Tag NFC</span>
              <KeyRound className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-inst-secondary">Retira o cartão do campo indutivo do PN532.</p>
          </button>

          <button 
            onClick={() => sim.setWaterHeight(70.0)}
            className="p-3 rounded-xs bg-inst-canvas border border-inst-border hover:border-sky-600 text-left space-y-1 transition"
          >
            <div className="flex justify-between text-[#0369a1] dark:text-sky-400 font-bold">
              <span>Ajustar Nível para 70 cm</span>
              <Waves className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-inst-secondary">Eleva o nível para 70 cm (distância acústica 30 cm).</p>
          </button>

          <button 
            onClick={() => sim.setWaterHeight(88.0)}
            className="p-3 rounded-xs bg-inst-canvas border border-inst-border hover:border-rose-600 text-left space-y-1 transition"
          >
            <div className="flex justify-between text-[#b91c1c] dark:text-rose-400 font-bold">
              <span>Perda de Eco / Zona Cega</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-inst-secondary">Eleva nível para 15 cm (distância 1 cm &lt; 3 cm).</p>
          </button>

          <button 
            onClick={() => sim.triggerSlosh(6.0)}
            className="p-3 rounded-xs bg-inst-canvas border border-inst-border hover:border-sky-600 text-left space-y-1 transition"
          >
            <div className="flex justify-between text-[#0369a1] dark:text-sky-400 font-bold">
              <span>Agitar Superfície (Slosh)</span>
              <Waves className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-inst-secondary">Induz perturbação amortecida de 2.5 Hz na água.</p>
          </button>
        </div>
      </div>
    </div>
  );
};
