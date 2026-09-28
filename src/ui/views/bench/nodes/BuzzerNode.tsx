import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Volume2 } from 'lucide-react';

export const BuzzerNode: React.FC<{ data: any }> = () => (
  <div className="bg-inst-surface border-2 border-inst-border-strong rounded-md shadow-raised p-4 w-60 text-inst-primary font-ui select-none">
    <div className="flex items-center gap-2 border-b border-inst-border pb-2 mb-3"><div className="w-6 h-6 rounded-xs bg-amber-600 flex items-center justify-center text-white"><Volume2 className="w-3.5 h-3.5" /></div><div><h3 className="text-xs font-display font-bold">Buzzer ativo BZ1</h3><span className="text-[10px] font-mono text-inst-secondary">CMI-1295IC-0385T · 2–5 V</span></div></div>
    <div className="space-y-2 text-[11px] font-mono">
      <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border"><span>CTRL</span><span className="font-bold text-amber-500">GPIO14</span><Handle type="target" position={Position.Left} id="buzzer_ctrl" className="!w-2.5 !h-2.5 !bg-amber-500 !-left-1.5 border border-white" /></div>
      <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border"><span>GND</span><span className="font-bold">0V</span><Handle type="target" position={Position.Left} id="buzzer_gnd" className="!w-2.5 !h-2.5 !bg-slate-800 !-left-1.5 border border-white" /></div>
    </div>
    <div className="mt-3 pt-2 border-t border-inst-border text-[9px] font-mono text-inst-muted">Ativo internamente · validar 30 mA máx.</div>
  </div>
);
