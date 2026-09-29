import React, { useState } from 'react';
import { 
  Waves, 
  Cylinder, 
  Thermometer, 
  Table, 
  Save, 
  Plus, 
  Trash2, 
  FileSpreadsheet
} from 'lucide-react';
import { HonestyBadge } from '@/ui/components/badges/HonestyBadge';

export const TankView: React.FC = () => {
  const [href, setHref] = useState(16.0);
  const [temp, setTemp] = useState(24.8);
  const [tankShape, setTankShape] = useState<'cylinder' | 'empirical'>('empirical');
  
  // Tabela empírica padrão de bancada
  const [calibrationPoints, setCalibrationPoints] = useState([
    { h: 0.0, v: 0.0 },
    { h: 20.0, v: 180.0 },
    { h: 40.0, v: 390.0 },
    { h: 6.366, v: 2.0 },
    { h: 9.549, v: 3.0 },
    { h: 12.732, v: 4.0 },
    { h: 13.0, v: 4.084 },
    { h: 16.0, v: 5.0265 },
  ]);

  const soundSpeed = (331.3 * Math.sqrt(1 + temp / 273.15)).toFixed(2);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Topo */}
      <div className="bg-bench-panel p-4 rounded-xl border border-bench-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Waves className="w-5 h-5 text-sky-400" />
            Modelador do Tanque & Calibração Acústica
            <HonestyBadge level="simulado" />
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ajuste da distância de referência H_ref, parâmetros ambientais c(T) e curva volumétrica V(h) empírica calibrada com proveta física.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium flex items-center gap-1.5 transition">
            <Save className="w-4 h-4" />
            <span>Salvar Calibração (IndexedDB)</span>
          </button>
        </div>
      </div>

      {/* Grid: Parâmetros Acústicos & Físicos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lado Esquerdo: Parâmetros Geométricos (5 Colunas) */}
        <div className="lg:col-span-5 bg-bench-card border border-bench-border rounded-xl p-5 space-y-5">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Cylinder className="w-4 h-4 text-sky-400" /> Geometria & Ponto Zero (Datum)
          </h3>

          <div className="space-y-4 text-xs">
            {/* Href */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-slate-300 font-medium">Distância de Referência (Href):</label>
                <span className="font-mono text-sky-400 font-bold">{href} cm</span>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                step="0.5"
                value={href}
                onChange={(e) => setHref(parseFloat(e.target.value))}
                className="w-full accent-sky-500"
              />
              <p className="text-[10px] text-slate-500">
                Distância vertical entre a face do SEN0311 na tampa e o fundo interno do tanque FG-TANK-5L-CYL-R1.
              </p>
            </div>

            {/* Temperatura */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-slate-300 font-medium flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Temperatura Nominal do Ar:
                </label>
                <span className="font-mono text-amber-400 font-bold">{temp} °C</span>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                step="0.2"
                value={temp}
                onChange={(e) => setTemp(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
                <span>Velocidade Calculada:</span>
                <span className="text-amber-300 font-bold">c = {soundSpeed} m/s</span>
              </div>
            </div>

            {/* Forma do Tanque */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-slate-300 font-medium block">Modelo Volumétrico:</label>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <button
                  onClick={() => setTankShape('cylinder')}
                  className={`p-2.5 rounded-lg border text-left transition ${tankShape === 'cylinder' ? 'bg-sky-950/60 border-sky-600 text-sky-200' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                >
                  <div className="font-bold">Cilíndrico Ø200</div>
                  <div className="text-[10px] text-slate-500">V = π · r² · h</div>
                </button>

                <button
                  onClick={() => setTankShape('empirical')}
                  className={`p-2.5 rounded-lg border text-left transition ${tankShape === 'empirical' ? 'bg-sky-950/60 border-sky-600 text-sky-200' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                >
                  <div className="font-bold">Tabela Empírica</div>
                  <div className="text-[10px] text-slate-500">Interpolação PCHIP / Spline</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Tabela de Calibração Empírica (7 Colunas) */}
        <div className="lg:col-span-7 bg-bench-card border border-bench-border rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Table className="w-4 h-4 text-emerald-400" /> Tabela de Calibração Empírica [h, V]
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Pontos reais coletados despejando volumes medidos com jarra graduada no galão de bancada.
              </p>
            </div>

            <button 
              onClick={() => setCalibrationPoints([...calibrationPoints, { h: 50.0, v: 500.0 }])}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 border border-slate-700 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Ponto
            </button>
          </div>

          {/* Tabela de Pontos */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                  <th className="pb-2">Ponto #</th>
                  <th className="pb-2">Altura d'Água (h cm)</th>
                  <th className="pb-2">Volume Real (V Litros)</th>
                  <th className="pb-2 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {calibrationPoints.map((pt, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="py-2 text-slate-500">#{idx + 1}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        step="0.1"
                        value={pt.h}
                        onChange={(e) => {
                          const newPts = [...calibrationPoints];
                          newPts[idx].h = parseFloat(e.target.value) || 0;
                          setCalibrationPoints(newPts);
                        }}
                        className="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-sky-400 font-mono"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        step="1"
                        value={pt.v}
                        onChange={(e) => {
                          const newPts = [...calibrationPoints];
                          newPts[idx].v = parseFloat(e.target.value) || 0;
                          setCalibrationPoints(newPts);
                        }}
                        className="w-28 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-purple-400 font-mono"
                      />
                    </td>
                    <td className="py-2 text-right">
                      {idx > 0 && idx < calibrationPoints.length - 1 && (
                        <button
                          onClick={() => setCalibrationPoints(calibrationPoints.filter((_, i) => i !== idx))}
                          className="p-1 text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2 text-[11px] text-slate-400">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Calibração em Bancada Real:</strong> A geometria do galão de água não deve ser presumida de fotos ou desenhos artísticos. Encha o recipiente passo-a-passo com jarra medidora para registrar a curva real (<span className="text-sky-300">Seção 7 do Briefing</span>).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
