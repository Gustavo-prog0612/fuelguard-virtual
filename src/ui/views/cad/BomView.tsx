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
  Box, Eye, Ruler, ShieldCheck, Clock3, Search,
} from 'lucide-react';
import { FUELGUARD_BOM, BOM_SUMMARY, BOM_CATALOG_UPDATED_AT, PURCHASE_CATALOG, type BomItem, type BomConfidence } from '@/circuit-cad/bom';
import {
  CARRIER_CAD_ASSET_MANIFEST,
  getCarrierAssetStatusClass,
  getCarrierAssetStatusLabel,
} from '@/circuit-cad/carrier-assets';
import { FUELGUARD_CAD_LIBRARY, type CadComponentMetadata } from '@/circuit-cad/component-library';
import { Component360InspectorModal } from './Component360InspectorModal';

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

const CARRIER_PURCHASE_ONLY = [
  { designator: 'U2', mpn: 'SN74AHCT125N', description: 'Buffer lógico DIP-14 do Carrier' },
  { designator: 'R1', mpn: 'CFR-25JB-52-10K', description: 'Divisor resistivo · 10 kΩ' },
  { designator: 'R2', mpn: 'CFR-25JB-52-15K', description: 'Divisor resistivo · 15 kΩ' },
];

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

function formatDimensions(dimensions?: { width: number; height: number; depth: number }): string {
  if (!dimensions) return 'Ainda não medido';
  return `${dimensions.width} × ${dimensions.height} × ${dimensions.depth} mm`;
}

const PurchaseImage: React.FC<{ src: string | null; alt: string; designator: string }> = ({ src, alt, designator }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-[92px] rounded-lg border border-slate-600 bg-[#091018] px-2 py-3 flex flex-col items-center text-center" aria-label={`${alt} — imagem indisponível`}>
        <Box className="w-5 h-5 text-sky-300 mb-1" aria-hidden="true" />
        <span className="text-sm font-bold text-emerald-400">{designator}</span>
        <span className="mt-1 text-[8px] leading-tight uppercase tracking-wide text-slate-500">{src ? 'Imagem indisponível' : 'Imagem rastreável pendente'}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="max-w-[92px] max-h-[92px] object-contain"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};

const PURCHASE_STATUS: Record<'observed' | 'consult' | 'pending', { label: string; className: string }> = {
  observed: { label: 'Preço observado', className: 'text-emerald-300' },
  consult: { label: 'Consultar preço', className: 'text-sky-300' },
  pending: { label: 'Fornecedor pendente', className: 'text-amber-300' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────
export const BomView: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow,    setExpandedRow]     = useState<string | null>(null);
  const [showOnlyNew,    setShowOnlyNew]     = useState(false);
  const [carrierClassFilter, setCarrierClassFilter] = useState<'all' | 'A' | 'B' | 'C' | 'D'>('all');
  const [carrierStatusFilter, setCarrierStatusFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [inspectedCarrierComponent, setInspectedCarrierComponent] = useState<CadComponentMetadata | null>(null);

  const normalizedSearch = searchQuery.trim().toLocaleLowerCase('pt-BR');
  const matchesSearch = (values: Array<string | undefined>): boolean => {
    if (!normalizedSearch) return true;
    return values.some((value) => value?.toLocaleLowerCase('pt-BR').includes(normalizedSearch));
  };

  const filtered = useMemo(() => {
    return FUELGUARD_BOM.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (showOnlyNew && !isNewItem(item)) return false;
      if (!matchesSearch([item.designator, item.value, item.description, item.mpn, item.manufacturer])) return false;
      return true;
    });
  }, [categoryFilter, showOnlyNew, normalizedSearch]);

  const totalQty = filtered.reduce((s, i) => s + i.quantity, 0);
  const purchaseItems = filtered.filter((item) => PURCHASE_CATALOG[item.mpn]);
  const purchaseCards = [
    ...purchaseItems.map((item) => ({ designator: item.designator, mpn: item.mpn, description: item.description })),
    ...(categoryFilter === 'all' ? CARRIER_PURCHASE_ONLY : []),
  ].filter((item) => matchesSearch([item.designator, item.mpn, item.description]));
  const observedPrices = purchaseCards.filter((item) => PURCHASE_CATALOG[item.mpn]?.priceStatus === 'observed').length;
  const verifiedCarrierAssets = CARRIER_CAD_ASSET_MANIFEST.filter((entry) => entry.assetStatus === 'verified').length;
  const unverifiedCarrierAssets = CARRIER_CAD_ASSET_MANIFEST.filter((entry) => entry.assetStatus !== 'verified').length;
  const visibleCarrierAssets = CARRIER_CAD_ASSET_MANIFEST.filter((entry) => {
    if (carrierClassFilter !== 'all' && entry.confidenceLevel !== carrierClassFilter) return false;
    if (carrierStatusFilter === 'verified' && entry.assetStatus !== 'verified') return false;
    if (carrierStatusFilter === 'unverified' && entry.assetStatus === 'verified') return false;
    const component = FUELGUARD_CAD_LIBRARY[entry.componentId];
    if (!matchesSearch([entry.designator, entry.partNumber, entry.revision, component?.name, entry.sourceReference])) return false;
    return true;
  });

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
            {BOM_SUMMARY.totalLineItems} itens • {BOM_SUMMARY.totalComponents} componentes • Estimativa BR: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(BOM_SUMMARY.estimatedCostBRL.min)}–{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(BOM_SUMMARY.estimatedCostBRL.max)}
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
        <label className="relative min-w-[220px] flex-1 max-w-sm" aria-label="Buscar referências da BOM e do CAD">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Buscar designator, MPN ou peça"
            className="w-full rounded-md border border-slate-700 bg-[#091018] pl-8 pr-2 py-1.5 text-[10px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-900"
          />
        </label>
        <div className="ml-auto flex items-center gap-2 text-[10px] text-slate-500">
          <Filter className="w-3 h-3" />
          {normalizedSearch
            ? `${filtered.length} BOM · ${purchaseCards.length} compras · ${visibleCarrierAssets.length} CAD`
            : `${filtered.length} de ${FUELGUARD_BOM.length} itens • ${totalQty} peças`}
        </div>
      </div>

      {/* Referências de compra: valores datados, fonte e variante ficam explícitos. */}
      <section className="px-5 pt-4 flex-shrink-0" aria-labelledby="purchase-catalog-title">
        <div className="flex items-end justify-between gap-3 mb-2">
          <div>
            <div id="purchase-catalog-title" className="text-xs font-bold uppercase tracking-[0.14em] text-white">Referências para compra</div>
            <p className="text-[10px] text-slate-500 mt-1">{observedPrices} preços observados em {BOM_CATALOG_UPDATED_AT.split('-').reverse().join('/')} · valores sujeitos a estoque, frete e imposto.</p>
          </div>
          <span className="text-[10px] text-amber-400 font-semibold">A compra abre a fonte do fornecedor</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {purchaseCards.map((item) => {
            const reference = PURCHASE_CATALOG[item.mpn];
            if (!reference) return null;
            const priceStatus = PURCHASE_STATUS[reference.priceStatus];
            const price = reference.price === null
              ? 'Consultar'
              : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: reference.currency ?? 'USD' }).format(reference.price);
            return (
              <article key={`purchase-${item.designator}`} className="rounded-xl border border-slate-800 bg-[#0e141c] overflow-hidden flex min-h-[126px]">
                <div className="w-28 shrink-0 bg-[#151e29] grid place-items-center border-r border-slate-800">
                  <PurchaseImage
                    src={reference.imageUrl}
                    alt={reference.imageAlt}
                    designator={item.designator.split(',')[0].trim()}
                  />
                </div>
                <div className="p-3 flex-1 min-w-0 flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-emerald-400">{item.designator}</span>
                      <span className={`text-[9px] font-bold uppercase ${priceStatus.className}`}>{priceStatus.label}</span>
                    </div>
                    <h3 className="text-xs font-bold text-white mt-1 truncate">{item.mpn}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{item.description} · {reference.note}</p>
                    {reference.imageUrl && (
                      <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-wide">
                        {reference.imageKind === 'technical_cad'
                          ? 'Prévia CAD local · não é foto comercial'
                          : reference.imageKind === 'technical_reference'
                            ? 'Referência visual · variante/lote pendente'
                            : 'Foto do fornecedor'}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-amber-300">{price}</span>
                    <div className="flex items-center gap-1.5">
                      {reference.imageSourceUrl && (
                        <a
                          href={reference.imageSourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-md border border-slate-700 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                          title="Abrir a fonte da imagem do fornecedor"
                          aria-label={`Abrir fonte da imagem de ${item.mpn}`}
                        >
                          <Eye className="w-3 h-3" />
                        </a>
                      )}
                      {reference.buyUrl ? (
                        <a href={reference.buyUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-md bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-bold inline-flex items-center gap-1.5 transition">
                          <ShoppingCart className="w-3 h-3" /> Comprar <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : <span className="text-[10px] text-slate-500">Fornecedor não selecionado</span>}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Registro CAD do Carrier: uma fonte visível para status, dimensões e origem. */}
      <section className="px-5 pt-4 pb-3 flex-shrink-0" aria-labelledby="carrier-cad-title">
        <div className="flex items-end justify-between gap-3 mb-2">
          <div>
            <div id="carrier-cad-title" className="text-xs font-bold uppercase tracking-[0.14em] text-white flex items-center gap-2">
              <Box className="w-3.5 h-3.5 text-sky-400" />
              CAD do Carrier · ordem A → D
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {verifiedCarrierAssets} GLBs locais verificados · {unverifiedCarrierAssets} pendências/aproximações explícitas · nenhum asset do RP2040 entra nesta lista.
            </p>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">Fonte, licença e dimensão ficam no cartão</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mb-3" aria-label="Filtros do registro CAD Carrier">
          <span className="text-[9px] text-slate-500 uppercase tracking-wider mr-1">Classe</span>
          {(['all', 'A', 'B', 'C', 'D'] as const).map((grade) => (
            <button
              key={grade}
              type="button"
              aria-pressed={carrierClassFilter === grade}
              onClick={() => setCarrierClassFilter(grade)}
              className={`px-2 py-1 rounded-md border text-[10px] font-bold transition ${carrierClassFilter === grade ? 'bg-sky-900/70 border-sky-600 text-sky-100' : 'border-slate-800 text-slate-500 hover:border-sky-800 hover:text-sky-300'}`}
            >
              {grade === 'all' ? 'Todas' : `Classe ${grade}`}
            </button>
          ))}
          <span className="h-4 w-px bg-slate-800 mx-1" aria-hidden="true" />
          <span className="text-[9px] text-slate-500 uppercase tracking-wider mr-1">Asset</span>
          {([['all', 'Todos'], ['verified', 'Verificados'], ['unverified', 'Pendentes / aproximações']] as const).map(([status, label]) => (
            <button
              key={status}
              type="button"
              aria-pressed={carrierStatusFilter === status}
              onClick={() => setCarrierStatusFilter(status)}
              className={`px-2 py-1 rounded-md border text-[10px] font-bold transition ${carrierStatusFilter === status ? 'bg-emerald-900/70 border-emerald-700 text-emerald-100' : 'border-slate-800 text-slate-500 hover:border-emerald-800 hover:text-emerald-300'}`}
            >
              {label}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-slate-500">{visibleCarrierAssets.length}/{CARRIER_CAD_ASSET_MANIFEST.length} exibidos</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
          {visibleCarrierAssets.map((entry) => {
            const component = FUELGUARD_CAD_LIBRARY[entry.componentId];
            if (!component) return null;
            const isVerified = entry.assetStatus === 'verified';
            const hasReference = Boolean(entry.referenceAssetPath);
            return (
              <article
                key={entry.designator}
                className="rounded-xl border border-slate-800 bg-[#0e141c] p-3 min-h-[145px] flex flex-col gap-2"
                data-testid={`carrier-asset-${entry.designator}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-400">{entry.designator}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Classe {entry.confidenceLevel}</span>
                    </div>
                    <h3 className="text-xs font-bold text-white truncate mt-1">{component.name}</h3>
                    <p className="text-[10px] text-slate-400 truncate">{entry.partNumber} · {entry.revision}</p>
                  </div>
                  <span className={`shrink-0 text-[9px] font-bold uppercase px-2 py-1 rounded-full border ${getCarrierAssetStatusClass(entry.assetStatus)}`}>
                    {getCarrierAssetStatusLabel(entry.assetStatus)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="rounded-md bg-[#091018] border border-slate-800 px-2 py-1.5">
                    <div className="text-slate-500 flex items-center gap-1"><Ruler className="w-3 h-3" /> Nominal</div>
                    <div className="text-slate-200 mt-0.5">{formatDimensions(component.nominalDimensionsMm)}</div>
                  </div>
                  <div className="rounded-md bg-[#091018] border border-slate-800 px-2 py-1.5">
                    <div className="text-slate-500 flex items-center gap-1"><Box className="w-3 h-3" /> {isVerified ? 'GLB medido' : hasReference ? 'Referência 3D local' : 'Validação física'}</div>
                    <div className={isVerified ? 'text-emerald-300 mt-0.5' : 'text-amber-300 mt-0.5'}>{isVerified ? formatDimensions(entry.assetDimensionsMm) : hasReference ? (entry.referenceAssetDimensionsMm ? formatDimensions(entry.referenceAssetDimensionsMm) : 'Disponível para inspeção') : 'Ainda não medido'}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mt-auto">
                  <div className="min-w-0 flex items-center gap-1.5 text-[10px] text-slate-500 truncate" title={entry.pendingReason ?? entry.limitations[0]}>
                    {isVerified ? <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" /> : <Clock3 className="w-3 h-3 text-amber-400 shrink-0" />}
                    <span className="truncate">{entry.pendingReason ?? entry.limitations[0]}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setInspectedCarrierComponent(component)}
                      className="px-2 py-1 rounded-md border border-sky-800 bg-sky-950/40 text-sky-300 hover:bg-sky-900/60 text-[10px] font-bold inline-flex items-center gap-1 transition"
                    >
                      <Eye className="w-3 h-3" /> Inspecionar
                    </button>
                    <a
                      href={entry.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Abrir fonte do CAD"
                      aria-label={`Abrir fonte do CAD de ${entry.designator}`}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {visibleCarrierAssets.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-800 px-3 py-5 text-center text-[11px] text-slate-500">
            Nenhum asset corresponde aos filtros selecionados.
          </div>
        )}
        {normalizedSearch && purchaseCards.length === 0 && visibleCarrierAssets.length === 0 && (
          <div className="mt-2 rounded-lg border border-dashed border-amber-800/70 bg-amber-950/20 px-3 py-2 text-center text-[11px] text-amber-300">
            Nenhuma referência de compra ou asset CAD corresponde a “{searchQuery}”.
          </div>
        )}
      </section>

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
          Atualizado em: {BOM_CATALOG_UPDATED_AT.split('-').reverse().join('/')} • FuelGuard Virtual Test Bench
        </span>
      </div>

      {inspectedCarrierComponent && (
        <Component360InspectorModal
          component={inspectedCarrierComponent}
          onClose={() => setInspectedCarrierComponent(null)}
        />
      )}
    </div>
  );
};
