/**
 * FuelGuard Virtual Test Bench — Painel de Relatório DRC (Design Rule Checks)
 * Exibe a auditoria de regras de projeto elétrico e físico sobre o Circuit JSON.
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  SlidersHorizontal,
  Flame,
  Wrench
} from 'lucide-react';
import { DrcViolation } from '@/circuit-cad/drc-checker';

interface DrcReportPanelProps {
  violations: DrcViolation[];
  onInjectFault: () => void;
  onRestoreSafe: () => void;
  isFaultActive: boolean;
}

export const DrcReportPanel: React.FC<DrcReportPanelProps> = ({
  violations,
  onInjectFault,
  onRestoreSafe,
  isFaultActive,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const errors = violations.filter((v) => v.severity === 'ERROR');
  const warnings = violations.filter((v) => v.severity === 'WARNING');
  const infos = violations.filter((v) => v.severity === 'INFO');

  const filteredViolations = violations.filter((v) => {
    if (filterSeverity === 'ALL') return true;
    return v.severity === filterSeverity;
  });

  return (
    <div className="flex flex-col h-full space-y-4 font-ui">
      {/* Resumo Quantitativo do DRC */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-inst-surface border border-inst-border p-3 rounded-md shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-inst-secondary uppercase">Status Geral DRC</div>
            <div className={`text-base font-bold font-mono ${errors.length > 0 ? 'text-[#b91c1c] dark:text-rose-400' : 'text-[#166534] dark:text-emerald-400'}`}>
              {errors.length > 0 ? 'FALHA DE REGRA' : 'CONFORME (APROVADO)'}
            </div>
          </div>
          {errors.length > 0 ? (
            <ShieldAlert className="w-6 h-6 text-rose-500 animate-pulse" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          )}
        </div>

        <div className="bg-inst-surface border border-inst-border p-3 rounded-md shadow-xs flex items-center justify-between font-mono">
          <div>
            <div className="text-[10px] text-inst-secondary uppercase">Erros Críticos</div>
            <div className={`text-xl font-bold ${errors.length > 0 ? 'text-rose-500' : 'text-inst-primary'}`}>
              {errors.length}
            </div>
          </div>
          <Flame className="w-5 h-5 text-rose-500" />
        </div>

        <div className="bg-inst-surface border border-inst-border p-3 rounded-md shadow-xs flex items-center justify-between font-mono">
          <div>
            <div className="text-[10px] text-inst-secondary uppercase">Advertências</div>
            <div className="text-xl font-bold text-amber-500">{warnings.length}</div>
          </div>
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        </div>

        <div className="bg-inst-surface border border-inst-border p-3 rounded-md shadow-xs flex items-center justify-between font-mono">
          <div>
            <div className="text-[10px] text-inst-secondary uppercase">Avisos Didáticos</div>
            <div className="text-xl font-bold text-sky-500">{infos.length}</div>
          </div>
          <Info className="w-5 h-5 text-sky-500" />
        </div>
      </div>

      {/* Controles e Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-inst-surface border border-inst-border p-3 rounded-md text-xs font-mono">
        <div className="flex items-center space-x-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-fuelguard-green" />
          <span className="text-inst-secondary font-bold">Filtro:</span>
          {['ALL', 'ERROR', 'WARNING', 'INFO'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterSeverity(f)}
              className={`px-2 py-0.5 rounded-xs transition ${
                filterSeverity === f
                  ? 'bg-fuelguard-green text-white font-bold'
                  : 'text-inst-secondary hover:text-inst-primary hover:bg-inst-subtle'
              }`}
            >
              {f === 'ALL' ? 'Todos' : f === 'ERROR' ? 'Críticos' : f === 'WARNING' ? 'Avisos' : 'Didáticos'}
            </button>
          ))}
        </div>

        {/* Injeção de Falha em Tempo Real */}
        <div className="flex items-center space-x-2">
          {isFaultActive ? (
            <button
              onClick={onRestoreSafe}
              className="px-3 py-1 rounded-xs bg-[#166534] hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Restaurar Fiação Segura
            </button>
          ) : (
            <button
              onClick={onInjectFault}
              className="px-3 py-1 rounded-xs bg-[#b91c1c] hover:bg-rose-700 text-white font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Flame className="w-3.5 h-3.5" />
              Injetar Falha 5V Direto (DRC-01)
            </button>
          )}
        </div>
      </div>

      {/* Lista de Violações */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredViolations.map((v) => {
          const isErr = v.severity === 'ERROR';
          const isWarn = v.severity === 'WARNING';

          return (
            <div
              key={v.id}
              className={`p-4 rounded-md border text-xs font-mono space-y-2.5 transition shadow-xs ${
                isErr
                  ? 'bg-rose-950/20 border-rose-800/80 text-rose-200'
                  : isWarn
                  ? 'bg-amber-950/20 border-amber-800/80 text-amber-200'
                  : 'bg-inst-surface border-inst-border text-inst-primary'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold ${
                      isErr
                        ? 'bg-rose-900 text-rose-100'
                        : isWarn
                        ? 'bg-amber-900 text-amber-100'
                        : 'bg-sky-900 text-sky-100'
                    }`}
                  >
                    {v.ruleCode} • {v.severity}
                  </span>
                  <span className="font-bold text-sm text-inst-primary">{v.title}</span>
                </div>
                {v.relatedNetName && (
                  <span className="text-[10px] text-inst-muted px-1.5 py-0.2 bg-inst-canvas rounded-xs border border-inst-border">
                    Net: {v.relatedNetName}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-inst-secondary font-ui leading-relaxed">
                {v.message}
              </p>

              <div className="pt-2 border-t border-inst-border flex items-start gap-2 text-[11px]">
                <Wrench className="w-3.5 h-3.5 text-fuelguard-green flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-inst-primary">Remédio de Engenharia:</strong>{' '}
                  <span className="text-inst-secondary font-ui">{v.remedy}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
