import React, { useState } from 'react';
import { 
  FlaskConical, 
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

interface ScenarioPreset {
  id: string;
  title: string;
  description: string;
  category: 'nominal' | 'sensor_fault' | 'nfc' | 'network' | 'mechanical';
  badge: string;
  params: {
    noise_sigma_cm: number;
    initial_volume_l: number;
    water_flow_rate_l_min: number;
    nfc_authorized: boolean;
    lid_open: boolean;
    offline: boolean;
  };
}

const PRESETS: ScenarioPreset[] = [
  {
    id: 'nominal',
    title: 'Cenário A: Operação Nominal Estável',
    description: 'Nível intermediário estável, sem agitação, sensor alinhado, tag NFC autorizada cadastrada e conexão online.',
    category: 'nominal',
    badge: 'Padrão',
    params: { noise_sigma_cm: 0.2, initial_volume_l: 577, water_flow_rate_l_min: 0, nfc_authorized: true, lid_open: false, offline: false },
  },
  {
    id: 'slosh',
    title: 'Cenário B: Abastecimento Rápido & Slosh',
    description: 'Entrada abrupta de água no galão gerando oscilações harmônicas de superfície, testando filtro mediano de 5 amostras.',
    category: 'mechanical',
    badge: 'Dinâmico',
    params: { noise_sigma_cm: 1.8, initial_volume_l: 200, water_flow_rate_l_min: 45, nfc_authorized: true, lid_open: false, offline: false },
  },
  {
    id: 'blind_zone',
    title: 'Cenário C: Obstrução & Zona Cega (< 20 cm)',
    description: 'Nível da água se aproxima a menos de 20 cm do sensor JSN, gerando eco múltiplo dentro da zona de anelamento piezoelétrico.',
    category: 'sensor_fault',
    badge: 'Falha Acústica',
    params: { noise_sigma_cm: 4.5, initial_volume_l: 920, water_flow_rate_l_min: 10, nfc_authorized: true, lid_open: false, offline: false },
  },
  {
    id: 'nfc_unauthorized',
    title: 'Cenário D: Tag NFC Não Autorizada',
    description: 'Apresentação de cartão com UID desconhecido (04:9B:11:3E:8A). Emissão de evento nfc.denied sem iniciar sessão.',
    category: 'nfc',
    badge: 'Segurança Didática',
    params: { noise_sigma_cm: 0.2, initial_volume_l: 577, water_flow_rate_l_min: 0, nfc_authorized: false, lid_open: false, offline: false },
  },
  {
    id: 'lid_bounce',
    title: 'Cenário E: Abertura da Tampa com Rebote',
    description: 'Abertura do reed switch gerando rajada mecânica de 10 pulsos em 15 ms, testando a estabilização do debounce de 50 ms.',
    category: 'mechanical',
    badge: 'Debounce 50ms',
    params: { noise_sigma_cm: 0.2, initial_volume_l: 577, water_flow_rate_l_min: 0, nfc_authorized: true, lid_open: true, offline: false },
  },
  {
    id: 'offline_queue',
    title: 'Cenário F: Queda de Rede & Fila Offline',
    description: 'Desconexão do transporte virtual durante abastecimento, acumulando eventos na fila e descarregando de forma idempotente.',
    category: 'network',
    badge: 'Resiliência IoT',
    params: { noise_sigma_cm: 0.5, initial_volume_l: 300, water_flow_rate_l_min: 20, nfc_authorized: true, lid_open: false, offline: true },
  },
];

export const ScenariosView: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>('nominal');
  const [seed, setSeed] = useState<number>(42);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Topo */}
      <div className="bg-bench-panel p-4 rounded-xl border border-bench-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-sky-400" />
            Laboratório de Cenários & Injeção de Falhas
            <HonestyBadge level="simulado" />
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ensaios pré-configurados rastreáveis à Seção 11 do Briefing para testar a resiliência do firmware virtual antes da montagem física.
          </p>
        </div>

        {/* Semente PRNG */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
          <span className="text-slate-400">Semente PRNG:</span>
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
            className="w-16 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-sky-400 font-bold"
          />
          <button 
            onClick={() => setSeed(Math.floor(Math.random() * 10000))}
            className="p-1 text-slate-400 hover:text-slate-200"
            title="Gerar Semente Aleatória"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid de Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRESETS.map((preset) => {
          const isSelected = selectedScenario === preset.id;
          return (
            <div
              key={preset.id}
              onClick={() => setSelectedScenario(preset.id)}
              className={`p-5 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-sky-950/40 border-sky-500/80 shadow-md shadow-sky-950/50'
                  : 'bg-bench-card border-bench-border hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {preset.badge}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
                </div>

                <h3 className="text-xs font-bold text-slate-200">{preset.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">{preset.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>Ruído: ±{preset.params.noise_sigma_cm} cm</span>
                <button
                  className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition ${
                    isSelected ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" /> Carregar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Injeção Rápida de Eventos Manuais */}
      <div className="bg-bench-card border border-bench-border rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          Injeção Manual de Falhas e Estímulos em Tempo Real
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <button className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-amber-600 text-left space-y-1 transition group">
            <div className="flex justify-between text-amber-400 font-bold">
              <span>Alternar Tampa</span>
              <Lock className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-slate-400">Dispara rajada de contato de 15ms no Reed Switch.</p>
          </button>

          <button className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-sky-600 text-left space-y-1 transition group">
            <div className="flex justify-between text-sky-400 font-bold">
              <span>Aproximar Tag NFC</span>
              <KeyRound className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-slate-400">Apresenta cartão demonstrativo autorizado.</p>
          </button>

          <button className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-rose-600 text-left space-y-1 transition group">
            <div className="flex justify-between text-rose-400 font-bold">
              <span>Perda de Eco (Timeout)</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-slate-400">Bloqueia reflexão acústica (timeout 30ms).</p>
          </button>

          <button className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-purple-600 text-left space-y-1 transition group">
            <div className="flex justify-between text-purple-400 font-bold">
              <span>Agitar Superfície</span>
              <Waves className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-slate-400">Induz oscilação amortecida de 3 Hz na água.</p>
          </button>
        </div>
      </div>
    </div>
  );
};
