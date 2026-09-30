import React, { useMemo } from 'react';
import { ArrowUpRight, CheckCircle2, ClipboardCheck, ExternalLink, Layers, Ruler, ShieldAlert } from 'lucide-react';
import {
  CARRIER_CAD_ASSET_MANIFEST,
  getCarrierAssetStatusClass,
  getCarrierAssetStatusLabel,
} from '@/circuit-cad/carrier-assets';

interface Pcb3DCanvasProps {
  onSelectTab?: (tab: 'schematic' | 'pcb' | '3d' | 'assembly' | 'drc' | 'catalog') => void;
}

/** A PCB viewer must not invent copper, footprints or board geometry. */
export const Pcb3DCanvas: React.FC<Pcb3DCanvasProps> = ({ onSelectTab }) => {
  const verified = useMemo(() => CARRIER_CAD_ASSET_MANIFEST.filter((entry) => entry.assetStatus === 'verified').length, []);
  const localReferences = useMemo(() => CARRIER_CAD_ASSET_MANIFEST.filter((entry) => entry.referenceAssetPath).length, []);
  const pending = CARRIER_CAD_ASSET_MANIFEST.length - verified;
  const completion = Math.round((verified / CARRIER_CAD_ASSET_MANIFEST.length) * 100);

  return (
    <section className="h-full w-full rounded-2xl border border-inst-border bg-inst-surface/90 shadow-sm overflow-hidden flex flex-col">
      <header className="px-6 py-5 border-b border-inst-border flex flex-col xl:flex-row xl:items-start justify-between gap-4 shrink-0">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-fuelguard-green font-semibold">FuelGuard / PCB 3D</p>
          <h2 className="mt-2 text-2xl font-display font-semibold tracking-tight text-inst-primary">Gate de placa fabricável</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-inst-secondary">
            A PCB 3D não é renderizada enquanto não houver um layout KiCad real revisado. Neste estado, a estação entrega rastreabilidade do Carrier e direciona para a montagem física detalhada, sem criar cobre ou footprints fictícios.
          </p>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-300 max-w-sm shrink-0">
          <div className="flex items-center gap-2 font-semibold"><ShieldAlert className="h-4 w-4" /> Gate de fabricação bloqueado</div>
          <p className="mt-1 leading-5">Liberar somente após esquemático, footprints, roteamento, DRC e Gerbers revisados.</p>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto p-5 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_42%)]">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5 mb-4">
          <div className="rounded-xl border border-inst-border bg-inst-canvas/80 p-3"><span className="text-[10px] uppercase tracking-wider text-inst-muted">Prontidão PCB</span><strong className="mt-1 block text-xl text-amber-300">Bloqueada</strong><span className="text-[10px] text-inst-secondary">layout real ausente</span></div>
          <div className="rounded-xl border border-inst-border bg-inst-canvas/80 p-3"><span className="text-[10px] uppercase tracking-wider text-inst-muted">Carrier verificado</span><strong className="mt-1 block text-xl text-emerald-300">{verified}/{CARRIER_CAD_ASSET_MANIFEST.length}</strong><span className="text-[10px] text-inst-secondary">{completion}% com GLB validado</span></div>
          <div className="rounded-xl border border-inst-border bg-inst-canvas/80 p-3"><span className="text-[10px] uppercase tracking-wider text-inst-muted">Referências locais</span><strong className="mt-1 block text-xl text-sky-300">{localReferences}</strong><span className="text-[10px] text-inst-secondary">inspecionáveis no Carrier</span></div>
          <div className="rounded-xl border border-inst-border bg-inst-canvas/80 p-3"><span className="text-[10px] uppercase tracking-wider text-inst-muted">Pendências físicas</span><strong className="mt-1 block text-xl text-orange-300">{pending}</strong><span className="text-[10px] text-inst-secondary">não aptas a fabricação</span></div>
        </div>

        <div className="grid xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] gap-4 items-start">
          <section className="rounded-2xl border border-inst-border bg-inst-canvas/80 overflow-hidden" aria-labelledby="carrier-readiness-title">
            <div className="px-4 py-3 border-b border-inst-border flex items-center justify-between gap-3">
              <div><div id="carrier-readiness-title" className="flex items-center gap-2 text-sm font-semibold text-inst-primary"><Layers className="h-4 w-4 text-fuelguard-green" /> Inventário do Carrier</div><p className="mt-1 text-[10px] text-inst-secondary">Ordem de substituição A → D · somente assets do Carrier FuelGuard</p></div>
              <button onClick={() => onSelectTab?.('catalog')} className="text-[10px] text-sky-300 hover:text-sky-200 inline-flex items-center gap-1">Abrir registro <ExternalLink className="h-3 w-3" /></button>
            </div>
            <div className="grid md:grid-cols-2 gap-2 p-3">
              {CARRIER_CAD_ASSET_MANIFEST.map((entry) => (
                <article key={entry.designator} data-testid={`pcb3d-asset-${entry.designator}`} className="rounded-xl border border-inst-border bg-inst-surface/70 p-3 min-w-0">
                  <div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="flex items-center gap-2"><span className="text-[10px] font-bold text-emerald-300">{entry.designator}</span><span className="text-[9px] text-inst-muted">Classe {entry.confidenceLevel}</span></div><h3 className="mt-1 truncate text-xs font-semibold text-inst-primary">{entry.partNumber}</h3></div><span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase ${getCarrierAssetStatusClass(entry.assetStatus)}`}>{getCarrierAssetStatusLabel(entry.assetStatus)}</span></div>
                  <div className="mt-2 flex items-center justify-between gap-2 text-[10px]"><span className="truncate text-inst-secondary">{entry.assetPath ? 'GLB medido' : entry.referenceAssetPath ? 'GLB de referência local' : 'Envelope nominal'}</span><span className="inline-flex items-center gap-1 text-inst-muted"><Ruler className="h-3 w-3" />{entry.assetDimensionsMm ? `${entry.assetDimensionsMm.width} mm` : 'a medir'}</span></div>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-3">
            <section className="rounded-2xl border border-inst-border bg-inst-canvas/80 p-4" aria-labelledby="pcb3d-next-title">
              <div id="pcb3d-next-title" className="flex items-center gap-2 text-sm font-semibold text-inst-primary"><ClipboardCheck className="h-4 w-4 text-fuelguard-green" /> Próximo gate</div>
              <ol className="mt-4 space-y-3 text-xs"><li className="flex gap-2"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-500/15 text-[10px] font-bold text-amber-300">1</span><span className="text-inst-secondary">Definir MPNs e footprints finais do Carrier.</span></li><li className="flex gap-2"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-700 text-[10px] font-bold text-slate-300">2</span><span className="text-inst-secondary">Revisar ERC/DRC, roteamento e Gerbers.</span></li><li className="flex gap-2"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-700 text-[10px] font-bold text-slate-300">3</span><span className="text-inst-secondary">Gerar GLB da PCB e medir contra a placa fabricada.</span></li></ol>
            </section>
            <section className="rounded-2xl border border-emerald-800/50 bg-emerald-950/20 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-emerald-200"><CheckCircle2 className="h-4 w-4" /> Disponível agora</div><p className="mt-2 text-xs leading-5 text-emerald-100/70">A montagem física 3D já permite explorar sensores, água, chicote e modelos locais rastreáveis.</p><button onClick={() => onSelectTab?.('assembly')} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-fuelguard-green px-3 py-2 text-xs font-semibold text-white hover:bg-fuelguard-green-hover transition">Abrir montagem 3D <ArrowUpRight className="h-3.5 w-3.5" /></button></section>
          </aside>
        </div>
      </div>
    </section>
  );
};
