import React, { lazy, Suspense, useState, useEffect } from 'react';
import { CircuitBoard, AlertTriangle, CheckCircle2, Zap, Info, Box, ShieldCheck, Cable } from 'lucide-react';
import { HonestyBadge } from '@/ui/components/badges/HonestyBadge';
import { InteractiveBenchCanvas } from './InteractiveBenchCanvas';
import { 
  CircuitValidator, 
  CircuitConnection, 
  SAFE_CANONICAL_WIRING,
  CircuitValidationReport 
} from '@/electrical/circuit-validator';
import { useSimulation } from '@/core/worker/use-simulation';

interface BenchViewProps {
  onOpenCad?: () => void;
}

const BenchAssemblyCanvas = lazy(() => import('@/ui/views/cad/BenchAssemblyCanvas').then((module) => ({ default: module.BenchAssemblyCanvas })));

export const BenchView: React.FC<BenchViewProps> = ({ onOpenCad }) => {
  const [simulatedFault, setSimulatedFault] = useState<boolean>(false);
  const [connections, setConnections] = useState<CircuitConnection[]>(SAFE_CANONICAL_WIRING);
  const [report, setReport] = useState<CircuitValidationReport>(() => CircuitValidator.evaluate(SAFE_CANONICAL_WIRING));
  const [workspaceMode, setWorkspaceMode] = useState<'3d' | 'connections'>('3d');

  const sim = useSimulation();

  // Reavalia o circuito sempre que a fiação for modificada
  useEffect(() => {
    const rep = CircuitValidator.evaluate(connections);
    setReport(rep);

    // Se houver violação crítica, avisa a simulação
    if (rep.overallStatus === 'CRITICAL_ERROR') {
      sim.setFault('FAULT_LEVEL_UART_5V', true);
    } else {
      sim.setFault('FAULT_LEVEL_UART_5V', false);
    }
  }, [connections]);

  const handleSetFault = (fault: boolean) => {
    setSimulatedFault(fault);
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F5F7] dark:bg-slate-950 text-slate-900 dark:text-white font-ui overflow-hidden">
      {/* Barra de Subferramentas da Bancada (Permity Style) */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 z-20 shadow-xs">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-display font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <CircuitBoard className="w-4 h-4 text-emerald-600" />
            Bancada Virtual de Montagem
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {workspaceMode === '3d' ? 'Gêmeo digital 3D da bancada física' : 'Topologia elétrica editável'}
          </span>
          <HonestyBadge level="simulado" />
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          {/* Segmented Pill Switcher (Permity Style) */}
          <div className="flex items-center gap-1 rounded-full border border-slate-200/80 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800 p-1" role="tablist" aria-label="Modo da bancada">
            <button
              role="tab"
              aria-selected={workspaceMode === '3d'}
              onClick={() => setWorkspaceMode('3d')}
              className={`rounded-full px-3 py-1 font-semibold transition ${
                workspaceMode === '3d' 
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Gêmeo 3D
            </button>
            <button
              role="tab"
              aria-selected={workspaceMode === 'connections'}
              onClick={() => setWorkspaceMode('connections')}
              className={`rounded-full px-3 py-1 font-semibold transition ${
                workspaceMode === 'connections' 
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Conexões 2D
            </button>
          </div>

          <span className="text-slate-500 dark:text-slate-400 text-xs hidden sm:inline">
            Conexões Ativas: <strong className="text-slate-900 dark:text-white">{connections.length}</strong>
          </span>

          <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-xs ${
            report.overallStatus === 'NOMINAL'
              ? 'bg-[#EAF9A5] dark:bg-lime-950/70 text-[#1E3A0F] dark:text-lime-300 border border-[#CDEB65] dark:border-lime-700'
              : report.overallStatus === 'CRITICAL_ERROR'
              ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-700 animate-pulse'
              : 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
          }`}>
            {report.overallStatus === 'NOMINAL' ? 'NOMINAL (0 ERROS)' : report.overallStatus === 'CRITICAL_ERROR' ? 'FALHA DE SEGURANÇA' : 'ADVERTÊNCIAS'}
          </span>
        </div>
      </div>

      {/* Resumo primário do gêmeo digital (Permity Clean Cards Grid) */}
      <section className="p-3 md:p-4 grid grid-cols-2 lg:grid-cols-5 gap-3 bg-[#F4F5F7] dark:bg-slate-950 shrink-0" aria-label="Resumo do gêmeo digital">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-xs">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Gêmeo digital</div>
          <div className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Operacional
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Simulação determinística · 50 Hz</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-xs">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Tanque</div>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
            <Box className="w-4 h-4 text-sky-600" /> Cilíndrico 5,0265 L
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Ø200 × 160 mm interno · nível {Math.round(sim.snapshot.percentage)}%</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-xs">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Assets Oficiais</div>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> PN532 GLB oficial
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">ESP32-S3 DevKitC-1 v1.1 · SEN0311 GLB B</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-xs">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Colisões</div>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-amber-600">
            <AlertTriangle className="w-4 h-4" /> Aferição Pendente
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">BVH disponível no viewer 3D</div>
        </div>

        <div className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl p-3.5 shadow-sm transition flex flex-col justify-center cursor-pointer col-span-2 lg:col-span-1" onClick={onOpenCad}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <Cable className="w-4 h-4 text-[#D4F63D]" /> Abrir Estação CAD
            </span>
            <span className="text-[#D4F63D] text-xs">→</span>
          </div>
          <div className="text-[10px] text-slate-300 mt-0.5">3D · PCB 2D · esquemático</div>
        </div>
      </section>

      {/* Conteúdo Principal: Canvas Focal (Esquerda/Centro) + Painel Lateral do Validador (Direita) */}
      <div className="flex-1 flex overflow-hidden">
        {/* CANVAS INTERATIVO REACT FLOW (75% DA ÁREA) */}
        <div className="flex-1 h-full relative overflow-hidden">
          {workspaceMode === '3d' ? (
            <Suspense fallback={<div className="h-full grid place-items-center bg-[#06090d] text-slate-300 font-mono text-xs">Carregando gêmeo digital 3D…</div>}>
              <BenchAssemblyCanvas />
            </Suspense>
          ) : (
            <InteractiveBenchCanvas
              onConnectionsChange={setConnections}
              isSimulatedFault={simulatedFault}
              onSetFault={handleSetFault}
            />
          )}

          {/* Legenda Flutuante de Fiação no Rodapé do Canvas */}
          <div className="absolute bottom-4 left-4 z-10 bg-inst-surface/90 backdrop-blur-xs border border-inst-border p-2.5 rounded-sm shadow-xs flex items-center space-x-4 text-[10px] font-mono">
            <span className="font-bold text-inst-primary uppercase">Cores dos Fios:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-[#1f2937]" /> GND</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-[#dc2626]" /> +5V</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-[#d97706]" /> +3V3</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-[#7c3aed]" /> UART TX</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-[#0284c7]" /> UART RX</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-[#059669]" /> SPI</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-[#166534]" /> LED</span>
          </div>
        </div>

        {/* PAINEL LATERAL: VALIDADOR ELÉTRICO TOPOLÓGICO (25% DA ÁREA) */}
        <div className="w-72 lg:w-80 xl:w-96 bg-inst-surface border-l border-inst-border flex flex-col justify-between flex-shrink-0 z-20 shadow-xs">
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {/* Header do Validador */}
            <div className="flex justify-between items-center border-b border-inst-border pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-fuelguard-green" />
                <h2 className="text-xs font-display font-bold uppercase tracking-wider text-inst-primary">
                  Validador Elétrico
                </h2>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-xs font-bold border ${
                report.overallStatus === 'NOMINAL'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : report.overallStatus === 'CRITICAL_ERROR'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-[#b91c1c] dark:text-rose-400 border-rose-200 dark:border-rose-800'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-[#b45309] dark:text-amber-400 border-amber-200 dark:border-amber-800'
              }`}>
                {report.passedCount} / {report.rules.length} OK
              </span>
            </div>

            {/* Banner de Status Geral */}
            {report.overallStatus === 'NOMINAL' && (
              <div className="p-3 rounded-xs bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#166534] dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Circuito Elétrico em Conformidade</span>
                </div>
                <p className="text-[11px] text-emerald-900 dark:text-emerald-300">
                  Todas as regras topológicas aprovadas. Níveis lógicos de 3,3V e 5V compatíveis e terra unificado.
                </p>
              </div>
            )}

            {report.overallStatus === 'CRITICAL_ERROR' && (
              <div className="p-3 rounded-xs bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-700 text-xs space-y-1.5 animate-pulse">
                <div className="flex items-center gap-1.5 font-bold text-[#b91c1c] dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>VIOLAÇÃO CRÍTICA DE SOBRETENSÃO</span>
                </div>
                <p className="text-[11px] text-rose-900 dark:text-rose-300 leading-relaxed">
                  Tensão de 5,0V detectada diretamente no pino 3,3V do ESP32! Risco permanente de destruição do silício.
                </p>
              </div>
            )}

            {/* Lista de Avaliação das Regras */}
            <div className="space-y-2.5">
              {report.rules.map((rule) => {
                const isFail = rule.status === 'FAIL';
                const isPass = rule.status === 'PASS';

                return (
                  <div
                    key={rule.ruleId}
                    className={`p-3 rounded-xs border text-xs space-y-1.5 transition ${
                      isFail
                        ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                        : isPass
                        ? 'bg-inst-canvas border-inst-border hover:border-inst-border-strong'
                        : 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono font-bold text-inst-primary text-[11px]">
                        {rule.ruleId}: {rule.title}
                      </span>
                      <span className={`text-[9px] font-mono px-1 rounded-xs font-bold ${
                        isFail
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                          : isPass
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                      }`}>
                        {rule.voltageObserved}
                      </span>
                    </div>

                    <p className="text-[11px] text-inst-secondary leading-relaxed">
                      {rule.message}
                    </p>

                    <div className="text-[10px] font-mono text-inst-muted flex items-start gap-1 pt-1 border-t border-inst-border">
                      <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span>{rule.recommendation}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rodapé com Informações Técnicas de Alimentação */}
          <div className="p-4 bg-inst-canvas border-t border-inst-border space-y-2 text-[11px] font-mono text-inst-secondary">
            <div className="flex justify-between">
              <span>Fonte:</span>
              <strong className="text-inst-primary">USB 5,0V Regulada</strong>
            </div>
            <div className="flex justify-between">
              <span>Corrente Total Est.:</span>
              <strong className="text-inst-primary">~180 mA</strong>
            </div>
            <div className="flex justify-between">
              <span>Potência Dissipada:</span>
              <strong className="text-inst-primary">~0,90 W</strong>
            </div>
            <div className="pt-2 border-t border-inst-border text-[10px] text-inst-muted flex items-center justify-between">
              <span>Laço de gotejamento ativo</span>
              <HonestyBadge level="requer_hardware" size="sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
