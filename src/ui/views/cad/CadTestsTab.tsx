import React, { useMemo, useState } from 'react';
import { ShieldCheck, Zap, Compass, Droplets, Box, FileCheck2, RefreshCw, Clock3 } from 'lucide-react';
import { TestResult } from '@/../hardware/tests/TestDefinition';
import { runEngineeringVerification } from '@/verification/run-engineering-verification';

interface CadTestsTabProps { onSelectTab?: (tabId: string) => void; }

const iconForScope = (scope: TestResult['scope']) => {
  if (scope === 'electrical') return Zap;
  if (scope === 'mechanical') return Compass;
  if (scope === 'fluid') return Droplets;
  if (scope === 'asset') return Box;
  return ShieldCheck;
};

const badgeClass = (status: TestResult['status']) => {
  if (status === 'PASS') return 'bg-emerald-950 text-emerald-300 border-emerald-800';
  if (status === 'FAIL') return 'bg-rose-950 text-rose-300 border-rose-800';
  return 'bg-amber-950 text-amber-300 border-amber-800';
};

export const CadTestsTab: React.FC<CadTestsTabProps> = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<string | null>(null);
  const [results, setResults] = useState<TestResult[]>(() => runEngineeringVerification());

  const summary = useMemo(() => ({
    pass: results.filter((test) => test.status === 'PASS').length,
    warn: results.filter((test) => test.status === 'WARN').length,
    pending: results.filter((test) => test.status === 'PENDING').length,
    fail: results.filter((test) => test.status === 'FAIL').length,
  }), [results]);

  const handleRerun = () => {
    setIsRunning(true);
    window.setTimeout(() => {
      setResults(runEngineeringVerification());
      setLastRunTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setIsRunning(false);
    }, 250);
  };

  return (
    <div className="h-full overflow-y-auto space-y-4 pr-1 text-inst-primary font-ui select-text">
      <div className="bg-inst-surface border border-inst-border p-4 rounded-md shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-inst-border pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-fuelguard-green" />
              <h2 className="text-base font-display font-bold uppercase tracking-wider">Verificação de Engenharia com Evidência</h2>
            </div>
            <p className="text-xs text-inst-secondary mt-1 max-w-4xl leading-relaxed">
              Os resultados abaixo são calculados a partir dos contratos de hardware e dos auditores disponíveis nesta versão.
              PENDING significa que falta medição, revisão manual ou arquivo de fabricação; não é aprovação.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleRerun} disabled={isRunning} className="px-3 py-1.5 rounded-xs bg-inst-canvas border border-inst-border hover:border-fuelguard-green text-xs font-mono transition flex items-center gap-1.5 disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Executando...' : 'Executar verificação'}</span>
            </button>
            <div className={`px-3 py-1.5 rounded-xs border text-xs font-mono font-bold ${summary.fail ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-amber-950 text-amber-300 border-amber-800'}`}>
              {summary.fail ? `${summary.fail} FALHA` : `${summary.pass} PASS • ${summary.pending} PENDENTE`}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
          <div className="bg-inst-canvas p-2.5 rounded-xs border border-inst-border"><span className="text-[10px] text-inst-muted block uppercase">PASS</span><span className="text-sm font-bold text-emerald-400">{summary.pass}</span></div>
          <div className="bg-inst-canvas p-2.5 rounded-xs border border-inst-border"><span className="text-[10px] text-inst-muted block uppercase">PENDENTE</span><span className="text-sm font-bold text-amber-300">{summary.pending}</span></div>
          <div className="bg-inst-canvas p-2.5 rounded-xs border border-inst-border"><span className="text-[10px] text-inst-muted block uppercase">FAIL</span><span className="text-sm font-bold text-rose-400">{summary.fail}</span></div>
          <div className="bg-inst-canvas p-2.5 rounded-xs border border-inst-border"><span className="text-[10px] text-inst-muted block uppercase">Última execução</span><span className="text-sm font-bold text-sky-400 flex items-center gap-1">{lastRunTime ?? 'ao abrir'} <Clock3 className="w-3 h-3" /></span></div>
        </div>
      </div>

      <div className="space-y-2">
        {results.map((test) => {
          const Icon = iconForScope(test.scope);
          return (
            <div key={test.id} className="bg-inst-surface border border-inst-border rounded-md p-4 space-y-2 font-mono text-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <Icon className="w-4 h-4 text-fuelguard-green mt-0.5 shrink-0" />
                  <div><h3 className="font-bold text-inst-primary text-sm">{test.title}</h3><span className="text-[10px] text-inst-muted">{test.id} • {test.requirement}</span></div>
                </div>
                <span className={`px-2 py-0.5 rounded-xs border text-[10px] font-bold shrink-0 ${badgeClass(test.status)}`}>{test.status}</span>
              </div>
              <p className="text-[11px] text-inst-secondary pl-6">{test.message}</p>
              <div className="border-t border-inst-border pt-2 pl-6 text-[10px] text-inst-muted">Evidência: <span className="text-sky-300">{test.evidenceRef}</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
