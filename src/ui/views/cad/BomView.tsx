/**
 * FuelGuard — Painel de BOM Profissional
 *
 * Visualização tabular da Bill of Materials com:
 *   - Filtros por categoria e status
 *   - Indicador de confiança por item
 *   - Links diretos para fornecedores (Brasil + internacional)
 *   - Destaque para itens novos (Q1 e R_BASE que estavam faltando)
 *   - Estatísticas por categoria
 *   - Exportação CSV
 */

import React, { useState, useMemo } from 'react';
import {
  Download, Filter, ShoppingCart, AlertTriangle, CheckCircle2,
  ExternalLink, Package, Cpu, Zap, Radio, ToggleLeft,
  Lightbulb, Wrench, Plug, Battery, ChevronDown, ChevronUp,
} from 'lucide-react';
import { FUELGUARD_BOM, BOM_SUMMARY, type BomItem, type BomConfidence } from '@/circuit-cad/bom';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const CONFIDENCE_CONFIG: Record<BomConfidence, { label: string; color: string; bg: string }> = {
  A: { label: 'Verificado',   color: 'text-emerald-400', bg: 'bg-emerald-900/40' },
  B: { label: 'Doc. Oficial', color: 'text-sky-400',     bg: 'bg-sky-900/40'     },
  C: { label: 'Aproximado',   color: 'text-amber-400',   bg: 'bg-amber-900/40'   },
  D: { label: 'Indefinido',   color: 'text-red-400',     bg: 'bg-red-900/40'     },
};

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  microcontroller: Cpu,
  sensor:          Radio,
  rfid:            Radio,
  switch:          ToggleLeft,
  indicator:       Lightbulb,
  driver:          Zap,
  passive:         Package,
  connector:       Plug,
  mechanical:      Wrench,
  power:           Battery,
};

const NEW_ITEMS = new Set(['Q1', 'R_BASE']);

function isNewItem(item: BomItem): boolean {
  return item.designator.split(',').some((d) => NEW_ITEMS.has(d.trim()));
}

function exportCsv(bom: BomItem[]): void {
  const headers = [
    'Designator', 'Qtd.', 'Valor', 'Descrição', 'Fabricante', 'MPN',
    'Fornecedor', 'URL Compra', 'Fornecedor BR', 'URL BR',
    'Footprint', 'Package', 'Tensão(V)', 'Corrente(mA)', 'Confiança', 'Status', 'Notas',
  ];
  const rows = bom.map((item) => [
    item.designator, item.quantity, item.value,
    `"${item.description.replace(/"/g, "'")}"`,
    item.manufacturer, item.mpn,
    item.supplier, item.supplierUrl,
    item.altSupplier, item.altSupplierUrl,
    item.footprint, item.package,
    item.voltageV, item.currentMa,
    item.confidence, item.status,
    `"${item.notes.replace(/"/g, "'")}"`,
  ].join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'fuelguard-bom.csv'; a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────
export const BomView: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedRow,    setExpandedRow]     = useState<string | null>(null);
  const [showOnlyNew,    setShowOnlyNew]     = useState(false);

  const filtered = useMemo(() => {
    return FUELGUARD_BOM.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (showOnlyNew && !isNewItem(item)) return false;
      return true;
    });
  }, [categoryFilter, showOnlyNew]);

  const totalQty = filtered.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="flex flex-col h-full bg-[#06090d] text-slate-200 font-mono overflow-hidden">

      {/* Cabeçalho */}
      <div className="bg-[#0e141c] border-b border-slate-800 px-5 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-violet-400" />
            Bill of Materials — FuelGuard Real Bench
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {BOM_SUMMARY.totalLineItems} itens • {BOM_SUMMARY.totalComponents} componentes • Estimativa BR: R\${BOM_SUMMARY.estimatedCostBRL.min}–R\${BOM_SUMMARY.estimatedCostBRL.max}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOnlyNew(!showOnlyNew)}
            className={`px-2.5 py-1.5 rounded text-xs font-bold border transition flex items-center gap-1.5 ${showOnlyNew ? 'bg-amber-600 border-amber-500 text-white' : 'border-amber-700 text-amber-400 hover:bg-amber-900/30'}`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {showOnlyNew ? 'Mostrar todos' : 'Itens novos (Q1, R_BASE)'}
          </button>
          <button
            onClick={() => exportCsv(FUELGUARD_BOM)}
            className="px-2.5 py-1.5 rounded text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Sumário por Categoria */}
      <div className="bg-[#0a0f18] border-b border-slate-800 px-5 py-2 flex items-center gap-3 flex-wrap flex-shrink-0">
        {Object.entries(BOM_SUMMARY.byCategory).map(([cat, qty]) => {
          const Icon = CATEGORY_ICONS[cat] ?? Package;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter((c) => c === cat ? 'all' : cat)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold border transition ${categoryFilter === cat ? 'bg-violet-800 border-violet-600 text-white' : 'border-slate-700 text-slate-400 hover:border-violet-700 hover:text-violet-300'}`}
            >
              <Icon className="w-3 h-3" />
              {cat} ({qty})
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2 text-[10px] text-slate-500">
          <Filter className="w-3 h-3" />
          {filtered.length} de {FUELGUARD_BOM.length} itens • {totalQty} peças
        </div>
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-[11px]">
          <thead className="bg-[#0a0f18] border-b border-slate-800 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left text-slate-400 w-28">Designator</th>
              <th className="px-3 py-2 text-center text-slate-400 w-10">Qtd.</th>
              <th className="px-3 py-2 text-left text-slate-400 w-28">Valor</th>
              <th className="px-3 py-2 text-left text-slate-400">Descrição</th>
              <th className="px-3 py-2 text-left text-slate-400 w-32">MPN</th>
              <th className="px-3 py-2 text-center text-slate-400 w-20">Confiança</th>
              <th className="px-3 py-2 text-left text-slate-400 w-32">Comprar no Brasil</th>
              <th className="px-3 py-2 text-center text-slate-400 w-20">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filtered.map((item) => {
              const conf   = CONFIDENCE_CONFIG[item.confidence];
              const isNew  = isNewItem(item);
              const isOpen = expandedRow === item.designator;
              return (
                <React.Fragment key={item.designator}>
                  <tr
                    className={`transition cursor-pointer ${isNew ? 'bg-amber-900/15 hover:bg-amber-900/25' : 'hover:bg-slate-800/40'}`}
                    onClick={() => setExpandedRow(isOpen ? null : item.designator)}
                  >
                    <td className="px-3 py-2.5 font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        {isNew && <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                        <span className={isNew ? 'text-amber-300' : ''}>{item.designator}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center text-slate-300">{item.quantity}</td>
                    <td className="px-3 py-2.5 text-sky-300 font-medium">{item.value}</td>
                    <td className="px-3 py-2.5 text-slate-300 max-w-xs">
                      <div className="truncate">{item.description.slice(0, 80)}{item.description.length > 80 ? '…' : ''}</div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-400 font-mono text-[10px]">{item.mpn}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${conf.bg} ${conf.color}`}>
                        {item.confidence} — {conf.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-400">{item.altSupplier}</td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {item.altSupplierUrl && (
                          <a
                            href={item.altSupplierUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 rounded bg-violet-800 hover:bg-violet-700 text-white transition"
                            title="Comprar no Brasil"
                          >
                            <ShoppingCart className="w-3 h-3" />
                          </a>
                        )}
                        {item.supplierUrl && (
                          <a
                            href={item.supplierUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-white transition"
                            title="Fornecedor internacional"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                      </div>
                    </td>
                  </tr>

                  {/* Linha expandida com detalhes */}
                  {isOpen && (
                    <tr className={isNew ? 'bg-amber-900/10' : 'bg-slate-800/20'}>
                      <td colSpan={8} className="px-5 py-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
                          <div>
                            <div className="text-slate-500 mb-1 font-bold uppercase tracking-wider">Footprint KiCad</div>
                            <div className="text-slate-300">{item.footprint}</div>
                          </div>
                          <div>
                            <div className="text-slate-500 mb-1 font-bold uppercase tracking-wider">Package</div>
                            <div className="text-slate-300">{item.package}</div>
                          </div>
                          <div>
                            <div className="text-slate-500 mb-1 font-bold uppercase tracking-wider">Elétrico</div>
                            <div className="text-slate-300">{item.voltageV}V / {item.currentMa}mA</div>
                          </div>
                          <div>
                            <div className="text-slate-500 mb-1 font-bold uppercase tracking-wider">Fabricante</div>
                            <div className="text-slate-300">{item.manufacturer}</div>
                          </div>
                          <div className="md:col-span-4">
                            <div className={`flex items-start gap-1.5 p-2 rounded ${isNew ? 'bg-amber-900/30 border border-amber-700/50' : 'bg-slate-800/50'}`}>
                              <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${isNew ? 'text-amber-400' : 'text-slate-500'}`} />
                              <span className={isNew ? 'text-amber-200' : 'text-slate-400'}>{item.notes}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
            Nenhum item com os filtros selecionados.
          </div>
        )}
      </div>

      {/* Rodapé com distribuição de confiança */}
      <div className="bg-[#0a0f18] border-t border-slate-800 px-5 py-2 flex items-center gap-4 flex-shrink-0 text-[10px]">
        <span className="text-slate-500 font-bold">Confiança:</span>
        {Object.entries(CONFIDENCE_CONFIG).map(([grade, config]) => (
          <span key={grade} className={`flex items-center gap-1 ${config.color}`}>
            <CheckCircle2 className="w-3 h-3" />
            {grade}: {BOM_SUMMARY.confidenceDistribution[grade as BomConfidence]}
          </span>
        ))}
        <span className="ml-auto text-slate-500">
          Atualizado em: 29/09/2026 • FuelGuard Virtual Test Bench
        </span>
      </div>
    </div>
  );
};
