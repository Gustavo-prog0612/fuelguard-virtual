import React from 'react';
import { Box, Layers, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { RUNTIME_MODEL_REGISTRY } from '@/circuit-cad/model-registry';

interface Pcb3DCanvasProps {
  onSelectTab?: (tab: 'schematic' | 'pcb' | '3d' | 'assembly' | 'drc' | 'catalog') => void;
}

/** A PCB viewer must not invent copper, footprints or board geometry. */
export const Pcb3DCanvas: React.FC<Pcb3DCanvasProps> = ({ onSelectTab }) => (
  <section className="h-full w-full rounded-2xl border border-inst-border bg-inst-surface/90 shadow-sm overflow-hidden flex flex-col">
    <div className="px-7 py-6 border-b border-inst-border flex flex-col lg:flex-row lg:items-center justify-between gap-5">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-fuelguard-green font-semibold">FuelGuard / PCB 3D</p>
        <h2 className="mt-2 text-2xl font-display font-semibold tracking-tight text-inst-primary">A placa adaptadora ainda não existe</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-inst-secondary">Este espaço fica reservado para o GLB derivado da PCB KiCad real. O twin não usa uma placa inventada: a bancada 3D continua disponível com assets comerciais e rastreabilidade de origem.</p>
      </div>
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-300 max-w-xs">
        <div className="flex items-center gap-2 font-semibold"><ShieldAlert className="h-4 w-4" /> Gate de fabricação</div>
        <p className="mt-1 leading-5">Liberar somente após esquemático, footprints, roteamento, DRC e Gerbers revisados.</p>
      </div>
    </div>
    <div className="flex-1 grid place-items-center p-8 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_55%)]">
      <div className="max-w-3xl w-full grid md:grid-cols-[1.2fr_0.8fr] gap-5 items-stretch">
        <div className="rounded-2xl border border-inst-border bg-inst-canvas/80 p-7 flex flex-col justify-between min-h-[280px]">
          <div>
            <div className="h-12 w-12 rounded-2xl bg-fuelguard-green/10 text-fuelguard-green grid place-items-center"><Box className="h-6 w-6" /></div>
            <h3 className="mt-6 text-lg font-semibold text-inst-primary">Visualização honesta</h3>
            <p className="mt-2 text-sm leading-6 text-inst-secondary">A vista 2D continua mostrando a topologia de referência. A vista 3D de placa será habilitada quando houver geometria fabricável.</p>
          </div>
          <button onClick={() => onSelectTab?.('assembly')} className="mt-6 self-start inline-flex items-center gap-2 rounded-lg bg-fuelguard-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-fuelguard-green-hover transition">Abrir bancada 3D <ArrowUpRight className="h-4 w-4" /></button>
        </div>
        <div className="rounded-2xl border border-inst-border bg-inst-canvas/80 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-inst-primary"><Layers className="h-4 w-4 text-fuelguard-green" /> Pipeline de assets ativo</div>
          <div className="mt-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-inst-border pb-3"><span className="text-inst-secondary">Assets de runtime rastreados</span><strong className="text-fuelguard-green">{RUNTIME_MODEL_REGISTRY.length}</strong></div>
            <div className="flex items-center justify-between border-b border-inst-border pb-3"><span className="text-inst-secondary">PN532 V4</span><span className="text-emerald-600 dark:text-emerald-400">GLB verificado</span></div>
            <div className="flex items-center justify-between border-b border-inst-border pb-3"><span className="text-inst-secondary">PCB FuelGuard</span><span className="text-amber-600 dark:text-amber-400">não roteada</span></div>
            <div className="flex items-center justify-between"><span className="text-inst-secondary">Eletrônica da bancada</span><span className="text-inst-muted">baia seca externa</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
