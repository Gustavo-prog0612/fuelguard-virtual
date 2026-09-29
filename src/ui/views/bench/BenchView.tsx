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
    <div className="flex flex-col h-full bg-inst-canvas text-inst-primary font-ui overflow-hidden">
      {/* Barra de Subferramentas da Bancada */}
      <div className="h-11 bg-inst-surface border-b border-inst-border px-5 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-display font-bold uppercase tracking-wider text-inst-primary flex items-center gap-1.5">
            <CircuitBoard className="w-4 h-4 text-fuelguard-green" />
            Bancada Virtual de Montagem
          </span>
          <span className="text-inst-border">|</span>
          <span className="text-[11px] font-mono text-inst-secondary">
            {workspaceMode === '3d' ? 'Gêmeo digital 3D da bancada física' : 'Topologia elétrica editável'}
          </span>
          <HonestyBadge level="simulado" />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1 rounded-lg border border-inst-border bg-inst-canvas p-1" role="tablist" aria-label="Modo da bancada">
            <button
              role="tab"
              aria-selected={workspaceMode === '3d'}
              onClick={() => setWorkspaceMode('3d')}
              className={`rounded-md px-2.5 py-1.5 transition ${workspaceMode === '3d' ? 'bg-inst-surface text-fuelguard-green shadow-xs' : 'text-inst-secondary hover:text-inst-primary'}`}
            >
              Gêmeo 3D
            </button>
            <button
              role="tab"
              aria-selected={workspaceMode === 'connections'}
              onClick={() => setWorkspaceMode('connections')}
              className={`rounded-md px-2.5 py-1.5 transition ${workspaceMode === 'connections' ? 'bg-inst-surface text-fuelguard-green shadow-xs' : 'text-inst-secondary hover:text-inst-primary'}`}
            >
              Conexões 2D
            </button>
          </div>
          <span className="text-inst-secondary">
            Conexões Ativas: <strong className="text-inst-primary">{connections.length}</strong>
          </span>
          <span className="text-inst-border">|</span>
          <span className={`px-2 py-0.5 rounded-xs font-bold ${
            report.overallStatus === 'NOMINAL'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              : report.overallStatus === 'CRITICAL_ERROR'
              ? 'bg-rose-50 dark:bg-rose-950/60 text-[#b91c1c] dark:text-rose-400 border border-rose-200 dark:border-rose-800 animate-pulse'
              : 'bg-amber-50 dark:bg-amber-950/60 text-[#b45309] dark:text-amber-400 border border-amber-200 dark:border-amber-800'
          }`}>
            {report.overallStatus === 'NOMINAL' ? 'NOMINAL (0 ERROS)' : report.overallStatus === 'CRITICAL_ERROR' ? 'FALHA DE SEGURANÇA' : 'ADVERTÊNCIAS'}
          </span>
        </div>
      </div>

      {/* Resumo primário do gêmeo digital: estado, tanque, assets, colisões e atalhos. */}
      <section className="grid grid-cols-2 xl:grid-cols-5 gap-px bg-inst-border border-b border-inst-border shrink-0" aria-label="Resumo do gêmeo digital">
        <div className="bg-inst-surface px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-inst-muted">Gêmeo digital</div>
          <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-inst-primary"><span className="w-2 h-2 rounded-full bg-fuelguard-green" /> Operacional</div>
          <div className="text-[10px] text-inst-secondary mt-0.5">Simulação determinística · 50 Hz</div>
        </div>
        <div className="bg-inst-surface px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-inst-muted">Tanque</div>
          <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-inst-primary"><Box className="w-4 h-4 text-sky-600" /> Cilíndrico 5,0265 L</div>
          <div className="text-[10px] text-inst-secondary mt-0.5">Ø200 × 160 mm interno · nível {Math.round(sim.snapshot.percentage)}%</div>
        </div>
        <div className="bg-inst-surface px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-inst-muted">Assets</div>
          <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-inst-primary"><ShieldCheck className="w-4 h-4 text-fuelguard-green" /> PN532 GLB oficial</div>
          <div className="text-[10px] text-inst-secondary mt-0.5">ESP32-S3 DevKitC-1 v1.1 · GLB B · SEN0311 GLB B · MC-38 GLB C · tanque paramétrico C</div>
        </div>
        <div className="bg-inst-surface px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-inst-muted">Colisões</div>
          <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400"><AlertTriangle className="w-4 h-4" /> Evidência física pendente</div>
          <div className="text-[10px] text-inst-secondary mt-0.5">BVH disponível no viewer 3D</div>
        </div>
        <div className="bg-inst-surface px-4 py-3 flex items-center gap-2 col-span-2 xl:col-span-1">
          <button onClick={onOpenCad} className="flex-1 min-w-0 text-left rounded-md px-3 py-2 bg-fuelguard-green text-white hover:bg-fuelguard-green-hover transition" aria-label="Abrir gêmeo digital 3D">
            <div className="flex items-center gap-2 text-xs font-semibold"><Cable className="w-4 h-4" /> Abrir projeto CAD</div>
            <div className="text-[10px] text-white/75 mt-0.5">3D · PCB 2D · esquemático</div>
          </button>
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
