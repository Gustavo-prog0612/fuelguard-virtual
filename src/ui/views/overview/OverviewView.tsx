import React from 'react';
import { 
  Waves, 
  Gauge, 
  Thermometer, 
  Activity, 
  Cpu, 
  Radio, 
  Lock, 
  CheckCircle2
} from 'lucide-react';
import { HonestyBadge } from '@/ui/components/badges/HonestyBadge';

export const OverviewView: React.FC = () => {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Banner de Aviso de Escopo */}
      <div className="bg-sky-950/30 border border-sky-800/50 rounded-xl p-4 flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-sky-900/50 text-sky-400 mt-0.5">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Central Didática de Monitoramento — Tanque com Água
              <HonestyBadge level="simulado" />
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Esta visão consolida o estado do FG-TANK-5L-CYL-R1, a telemetria UART do DFRobot A02YYUW/SEN0311 e os eventos da máquina de estados do ESP32-S3.
            </p>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-end gap-1 text-[11px] font-mono text-slate-400">
          <span>Álvo Acústico: <strong className="text-slate-200">Água Aberta</strong></span>
          <span>Sensor: <strong className="text-slate-200">A02YYUW / SEN0311</strong></span>
        </div>
      </div>

      {/* Grid Principal: Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Nível do Líquido */}
        <div className="bg-bench-card border border-bench-border rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Waves className="w-4 h-4 text-sky-400" /> Nível da Água
            </span>
            <HonestyBadge level="simulado" size="sm" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-bold font-mono text-sky-400">50.0%</div>
            <div className="text-xs font-mono text-slate-400">h = 8.0 cm</div>
          </div>
          {/* Barra de Progresso do Nível */}
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-sky-600 to-sky-400 h-2 rounded-full" style={{ width: '50%' }} />
          </div>
        </div>

        {/* Distância Acústica */}
        <div className="bg-bench-card border border-bench-border rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Gauge className="w-4 h-4 text-emerald-400" /> Distância do Sensor
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
              ECO VÁLIDO
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-bold font-mono text-emerald-400">42.3 <span className="text-sm font-normal text-slate-400">cm</span></div>
            <div className="text-xs font-mono text-slate-400">t_echo ≈ 2.45 ms</div>
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            Href: 16.0 cm • Zona Cega: 3 cm • Operação: 1–4,084 L
          </div>
        </div>

        {/* Volume Estimado */}
        <div className="bg-bench-card border border-bench-border rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="w-4 h-4 text-purple-400" /> Volume Estimado
            </span>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/60">
              V(h) Cilíndrico
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-bold font-mono text-purple-400">3.2 <span className="text-sm font-normal text-slate-400">L</span></div>
            <div className="text-xs font-mono text-slate-400">de 5,0265 L geométricos</div>
          </div>
          <div className="text-[11px] text-slate-400">
            Base: Ø200 mm • Erro: pendente de calibração
          </div>
        </div>

        {/* Temperatura e Acústica */}
        <div className="bg-bench-card border border-bench-border rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Thermometer className="w-4 h-4 text-amber-400" /> Temperatura & Som
            </span>
            <HonestyBadge level="simulado" size="sm" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-bold font-mono text-amber-400">24.8 <span className="text-sm font-normal text-slate-400">°C</span></div>
            <div className="text-xs font-mono text-slate-400">c ≈ 346.0 m/s</div>
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            Fórmula: c(T) = 331.3 · √(1 + T/273.15)
          </div>
        </div>
      </div>

      {/* Seção Central: Corte do Tanque Didático 2D e Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel Esquerdo: Representação 2D do Tanque (4 Colunas) */}
        <div className="lg:col-span-4 bg-bench-card border border-bench-border rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-sky-400" /> Corte do Tanque Didático
            </h3>
            <HonestyBadge level="aproximado" size="sm" />
          </div>

          {/* Canvas SVG Ilustrativo da Seção 7 do Briefing */}
          <div className="relative w-full h-72 bg-slate-950/70 rounded-lg border border-slate-800 p-3 flex flex-col items-center justify-between overflow-hidden">
            {/* Sensor no Topo */}
            <div className="w-24 h-7 rounded bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-[10px] font-mono text-slate-300 shadow-md z-10">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>SEN0311 UART</span>
              </div>
            </div>

            {/* Zona Cega Visual (0 a 3 cm) */}
            <div className="absolute top-11 w-44 h-8 border-b border-dashed border-rose-500/60 bg-rose-950/20 flex items-center justify-center text-[9px] font-mono text-rose-400">
              Zona Cega (3 cm)
            </div>

            {/* Pulso e Feixe Cônico */}
            <div className="absolute top-11 w-48 h-32 pointer-events-none flex flex-col items-center justify-start opacity-70">
              <div className="w-12 h-6 border-b-2 border-sky-400/60 rounded-full animate-pulse" />
              <div className="w-24 h-8 border-b-2 border-sky-400/40 rounded-full animate-pulse delay-75" />
              <div className="w-36 h-10 border-b-2 border-sky-400/20 rounded-full animate-pulse delay-150" />
            </div>

            {/* Água (Nível Atual: 50%) */}
            <div className="w-full absolute bottom-0 left-0 right-0 bg-gradient-to-t from-sky-900/90 to-sky-600/70 border-t-2 border-sky-300/80 flex flex-col justify-start p-2 transition-all duration-300" style={{ height: '50%' }}>
              <div className="flex justify-between text-[10px] font-mono text-sky-100 font-bold">
                <span>Água: 8.0 cm</span>
                <span>V = 3.2 L</span>
              </div>
              <div className="text-[9px] font-mono text-sky-200/70 mt-1">
                Superfície Calma • Ruído: ±0.3 cm
              </div>
            </div>

            {/* Régua de Cotas */}
            <div className="absolute right-2 top-11 bottom-2 w-4 flex flex-col justify-between text-[9px] font-mono text-slate-500 pointer-events-none border-l border-slate-800 pl-1">
              <span>0 cm</span>
              <span>3 cm</span>
              <span>8 cm</span>
              <span>16 cm</span>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-400 leading-tight">
            * Modelo geométrico determinístico. Não é CFD nem representa reflexão em paredes do galão real (<span className="text-amber-400">Seção 7 do Briefing</span>).
          </div>
        </div>

        {/* Painel Direito: Gráficos de Séries Temporais (8 Colunas) */}
        <div className="lg:col-span-8 bg-bench-card border border-bench-border rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Séries Temporais (Nível & Distância Acústica)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Comparação entre distância UART bruta do SEN0311 e sinal estabilizado pós-filtro mediano de 5 amostras.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-sky-400" /> Filtrado (cm)
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                <span className="w-2.5 h-2.5 rounded bg-slate-600" /> Bruto (cm)
              </span>
            </div>
          </div>

          {/* Gráfico Simulado Visualmente no M1 (Integrado a Chart.js no M4) */}
          <div className="h-64 bg-slate-950/60 rounded-lg border border-slate-800 p-4 flex flex-col justify-between">
            <div className="h-full w-full flex items-end space-x-1 pt-6 pb-2">
              {[42.5, 42.1, 42.3, 42.0, 42.8, 42.2, 42.4, 42.3, 42.1, 42.5, 42.3, 42.2, 42.3, 42.4, 42.3, 42.1, 42.3, 42.2, 42.3, 42.3, 42.4, 42.3, 42.2, 42.3].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div
                    className="w-full rounded-t bg-sky-500/80 hover:bg-sky-400 transition-all"
                    style={{ height: `${(val / 60) * 100}%` }}
                    title={`Amostra #${i + 1}: ${val} cm`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
              <span>-60s</span>
              <span>-45s</span>
              <span>-30s</span>
              <span>-15s</span>
              <span>Agora (Tempo Real)</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
            <span>Algoritmo: <strong className="text-slate-300">Mediana Móvel (5 amostras)</strong></span>
            <span>Taxa de Amostragem: <strong className="text-slate-300">5 Hz (200 ms)</strong></span>
            <span>Rejeição de Outliers: <strong className="text-emerald-400">Ativa (100%)</strong></span>
          </div>
        </div>
      </div>

      {/* Seção Inferior: Status dos Módulos Físicos da Bancada & Linha do Tempo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Status dos Componentes (7 Colunas) */}
        <div className="lg:col-span-7 bg-bench-card border border-bench-border rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400" /> Componentes da Bancada Didática
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 5 Módulos Operacionais
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* ESP32-S3 */}
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200">ESP32-S3 DevKitC-1</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">ONLINE</span>
              </div>
              <p className="text-[11px] text-slate-400">Firmware: FSM Didática v0.1 • 3,3V Lógica</p>
              <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
                <span>Free Heap: 284 kB</span>
                <span>Clock: 240 MHz</span>
              </div>
            </div>

            {/* PN532 NFC */}
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-sky-400" /> PN532 NFC (SPI)
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">PRONTO</span>
              </div>
              <p className="text-[11px] text-slate-400">Pinos: CS:10, MOSI:11, SCK:12, MISO:13</p>
              <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
                <span>Sessão: Operador Demo</span>
                <span>Tag: 04:3A:7F:2C:5D</span>
              </div>
            </div>

            {/* A02YYUW / SEN0311 */}
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-emerald-400" /> A02YYUW / SEN0311
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">ECO OK</span>
              </div>
              <p className="text-[11px] text-slate-400">UART TTL: 9600 8N1 • TX → GPIO16 • RX/MODE: HIGH</p>
              <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
                <span>Cone: ~55°</span>
                <span>Freq: 40 kHz</span>
              </div>
            </div>

            {/* Reed Switch da Tampa */}
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> Tampa (Reed Switch)
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800">FECHADA</span>
              </div>
              <p className="text-[11px] text-slate-400">GPIO7 • Pull-up 10k a 3V3 • Debounce 50ms</p>
              <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
                <span>Estado: Seguro</span>
                <span>Bounce: Filtrado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Linha do Tempo de Eventos em Tempo Real (5 Colunas) */}
        <div className="lg:col-span-5 bg-bench-card border border-bench-border rounded-xl p-5 space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" /> Linha do Tempo (Eventos)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Ordenado por seq + ms</span>
          </div>

          <div className="space-y-2 h-48 overflow-y-auto pr-1 text-xs font-mono">
            {[
              { id: 42, time: '14:27:18', kind: 'tank.stable', desc: 'Leitura estável: 50.0% (8.0 cm, 3.2 L)', type: 'tank' },
              { id: 41, time: '14:26:58', kind: 'tank.sample', desc: 'Amostra UART: 80 mm (frame SEN0311)', type: 'raw' },
              { id: 40, time: '14:26:41', kind: 'session.started', desc: 'NFC Tag Autorizada (04:3A:7F:2C:5D)', type: 'nfc' },
              { id: 39, time: '14:26:20', kind: 'lid.changed', desc: 'Tampa Fechada (após debounce 50ms)', type: 'lid' },
              { id: 38, time: '14:25:01', kind: 'transport.state', desc: 'Wi-Fi Conectado • Fila Descarregada', type: 'net' },
            ].map((ev) => (
              <div key={ev.id} className="p-2 rounded bg-slate-900/60 border border-slate-800/80 flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>#{ev.id} • {ev.kind}</span>
                    <span>{ev.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate mt-0.5">{ev.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-bench-border flex justify-between text-[11px] text-slate-400">
            <span>Fila Pendente: <strong className="text-emerald-400">0 msgs</strong></span>
            <span>schema_version: <strong className="text-slate-300">1</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
