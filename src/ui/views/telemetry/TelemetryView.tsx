import React, { useState } from 'react';
import { 
  Terminal, 
  Trash2, 
  Download, 
  Layers
} from 'lucide-react';
import { HonestyBadge } from '@/ui/components/badges/HonestyBadge';

export const TelemetryView: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  const mockSerialLogs = [
    { time: '14:27:18.420', level: 'INFO', msg: '[FW] SEN0311 UART: dist=80mm quality=VALID' },
    { time: '14:27:18.421', level: 'INFO', msg: '[BUS] Event dispatched: kind=tank.stable seq=42 h=8.0cm vol=3.2L' },
    { time: '14:27:18.220', level: 'DEBUG', msg: '[FILTER] Window [80, 81, 79, 80, 80] -> Median=80mm sigma=0.8' },
    { time: '14:27:16.105', level: 'INFO', msg: '[PN532] Passive Target detected: UID=04:3A:7F:2C:5D (Authorized Demo Operator)' },
    { time: '14:27:16.106', level: 'INFO', msg: '[BUS] Event dispatched: kind=session.started seq=41' },
    { time: '14:27:12.050', level: 'WARN', msg: '[REED] State changed to CLOSED after 50ms software debounce (12 raw bounces)' },
    { time: '14:27:00.000', level: 'SYSTEM', msg: '[SYSTEM] FuelGuard Virtual Test Bench Clock initialized (DeltaT=20ms, Speed=1.0x)' },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Topo */}
      <div className="bg-bench-panel p-4 rounded-xl border border-bench-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-sky-400" />
            Telemetria & Console Serial Virtual (UART 115200)
            <HonestyBadge level="simulado" />
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Logs ASCII idênticos aos emitidos pelo sketch C++ do ESP32-S3 e barramento interno de eventos versionados.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition border border-slate-700">
            <Download className="w-4 h-4" />
            <span>Exportar Logs (JSON/ASCII)</span>
          </button>
        </div>
      </div>

      {/* Grid: Console Serial & Fila Offline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Console Serial Virtual (8 Colunas) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between h-[500px] shadow-2xl">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-slate-300">
                  UART0: /dev/ttyUSB0 (115200 8N1)
                </span>
              </div>

              {/* Botões de Filtro */}
              <div className="flex items-center space-x-1 pl-2 border-l border-slate-800">
                {['ALL', 'INFO', 'WARN', 'DEBUG'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setFilterType(level)}
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition ${
                      filterType === level
                        ? 'bg-sky-600 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded accent-sky-500"
                />
                Auto-scroll
              </label>
              <button 
                className="p-1 text-slate-500 hover:text-slate-300 transition"
                title="Limpar Console"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Área de Linhas do Console */}
          <div className="flex-1 overflow-y-auto py-3 space-y-1 font-mono text-[11px]">
            {mockSerialLogs
              .filter((log) => filterType === 'ALL' || log.level === filterType)
              .map((log, idx) => (
              <div key={idx} className="flex items-start space-x-2 hover:bg-slate-900/50 p-1 rounded">
                <span className="text-slate-500 flex-shrink-0 select-none">{log.time}</span>
                <span className={`px-1 rounded text-[9px] font-bold flex-shrink-0 ${
                  log.level === 'INFO' ? 'bg-sky-950 text-sky-400 border border-sky-800' :
                  log.level === 'WARN' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  log.level === 'DEBUG' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
                  'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {log.level}
                </span>
                <span className="text-slate-300 break-all">{log.msg}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex justify-between">
            <span>Buffer: 7 linhas / 1000 máx</span>
            <span>Encoding: UTF-8 CRLF</span>
          </div>
        </div>

        {/* Fila de Transporte & Resiliência Offline (4 Colunas) */}
        <div className="lg:col-span-4 bg-bench-card border border-bench-border rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Fila de Envio Offline
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                SINCRONIZADO
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Mecanismo de resiliência: eventos são armazenados em buffer monotônico caso o enlace de dados sofra interrupção.
            </p>

            {/* Status da Fila */}
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Eventos Pendentes:</span>
                <span className="text-emerald-400 font-bold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Último Seq Entregue:</span>
                <span className="text-sky-400 font-bold">#42</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Garantia de Entrega:</span>
                <span className="text-slate-300">Idempotente / Monotônica</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 leading-tight">
            * Em modo offline, eventos não são descartados. Ao reconectar, a fila executa replay cronológico sem duplicações (<span className="text-sky-300">Seção 8 do Briefing</span>).
          </div>
        </div>
      </div>
    </div>
  );
};
