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
    <div className="flex flex-col h-full bg-inst-canvas text-inst-primary font-ui overflow-y-auto p-6 space-y-6">
      {/* Topo: Cabeçalho do Laboratório de Testes */}
      <div className="bg-inst-surface border border-inst-border p-4 rounded-md shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#b45309]" />
            <h1 className="text-sm font-display font-bold uppercase tracking-wider text-inst-primary">
              Estação de Testes & Laboratório de Falhas
            </h1>
            <HonestyBadge level="simulado" />
          </div>
          <p className="text-xs text-inst-secondary mt-1 max-w-3xl">
            Ensaios pré-configurados determinísticos rastreáveis à Seção 11 do Briefing para avaliar a robustez do firmware antes da montagem física.
          </p>
        </div>

        {/* Controle do PRNG */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-inst-secondary">Semente PRNG:</span>
          <input
            type="number"
            value={sim.seed}
            onChange={(e) => sim.setSeed(parseInt(e.target.value) || 0)}
            className="w-20 px-2 py-1 rounded-xs bg-inst-canvas border border-inst-border text-xs font-mono text-inst-primary focus:border-fuelguard-green"
          />
          <button
            onClick={handleRandomSeed}
            className="p-1.5 rounded-xs bg-inst-surface border border-inst-border hover:bg-inst-subtle text-inst-secondary hover:text-inst-primary transition"
            title="Sortear Nova Semente"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grade de Cenários Didáticos Pré-configurados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BUILT_IN_SCENARIOS.map((preset) => {
          const isSelected = sim.activeScenarioId === preset.id;
          return (
            <div
              key={preset.id}
              onClick={() => sim.loadScenario(preset.id)}
              className={`p-5 rounded-md border text-left cursor-pointer transition flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-inst-surface border-fuelguard-green shadow-raised ring-1 ring-fuelguard-green/30'
                  : 'bg-inst-surface border-inst-border hover:border-inst-border-strong'
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-xs bg-inst-subtle text-inst-secondary border border-inst-border">
                    {preset.badge}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-fuelguard-green" />}
                </div>

                <h2 className="text-xs font-display font-bold text-inst-primary">{preset.name}</h2>
                <p className="text-[11px] text-inst-secondary leading-relaxed">{preset.description}</p>
              </div>

              <div className="pt-3 border-t border-inst-border flex justify-between items-center text-[10px] font-mono text-inst-muted">
                <span>Ruído: ±{preset.noiseStdDevCm} cm</span>
                <button
                  className={`px-3 py-1 rounded-xs text-xs font-ui font-semibold flex items-center gap-1 transition ${
                    isSelected 
                      ? 'bg-fuelguard-green text-white shadow-xs' 
                      : 'bg-inst-subtle text-inst-primary hover:bg-inst-inset border border-inst-border'
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
      <div className="bg-inst-surface border border-inst-border rounded-md p-5 space-y-4 shadow-xs">
        <h2 className="text-xs font-display font-bold uppercase tracking-wider text-inst-primary flex items-center gap-2">
          <Sliders className="w-4 h-4 text-fuelguard-green" />
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
