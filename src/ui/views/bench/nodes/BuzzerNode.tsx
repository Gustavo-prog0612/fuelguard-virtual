import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Volume2, Zap } from 'lucide-react';

export const BuzzerNode: React.FC<{ data: any }> = () => (
  <div className="bg-inst-surface border-2 border-inst-border-strong rounded-md shadow-raised p-4 w-60 text-inst-primary font-ui select-none">
    <div className="flex items-center gap-2 border-b border-inst-border pb-2 mb-3"><div className="w-6 h-6 rounded-xs bg-amber-600 flex items-center justify-center text-white"><Volume2 className="w-3.5 h-3.5" /></div><div><h3 className="text-xs font-display font-bold">Driver Q1 + buzzer BZ1</h3><span className="text-[10px] font-mono text-inst-secondary">R_BASE 1 kΩ · CMI-1295IC-0385T</span></div></div>
    <div className="space-y-2 text-[11px] font-mono">
      <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border"><span>R_BASE IN</span><span className="font-bold text-amber-500">GPIO14</span><Handle type="target" position={Position.Left} id="r_base_in" className="!w-2.5 !h-2.5 !bg-amber-500 !-left-1.5 border border-white" /></div>
      <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border"><span>R_BASE OUT</span><span className="font-bold text-amber-500">Q1 B</span><Handle type="source" position={Position.Right} id="r_base_out" className="!w-2.5 !h-2.5 !bg-amber-500 !-right-1.5 border border-white" /></div>
      <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border"><span>Q1 BASE</span><span className="font-bold text-amber-500">B</span><Handle type="target" position={Position.Left} id="q1_base" className="!w-2.5 !h-2.5 !bg-amber-500 !-left-1.5 border border-white" /></div>
      <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border"><span>Q1 C → BZ1−</span><span className="font-bold text-amber-500">LOAD</span><Handle type="source" position={Position.Right} id="q1_collector" className="!w-2.5 !h-2.5 !bg-amber-500 !-right-1.5 border border-white" /><Handle type="target" position={Position.Left} id="buzzer_minus" className="!w-2.5 !h-2.5 !bg-amber-500 !-left-1.5 border border-white" /></div>
      <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border"><span>BZ1+</span><span className="font-bold text-red-500">+5V</span><Handle type="target" position={Position.Left} id="buzzer_vcc" className="!w-2.5 !h-2.5 !bg-red-500 !-left-1.5 border border-white" /></div>
      <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border"><span>Q1 E</span><span className="font-bold">GND</span><Handle type="source" position={Position.Right} id="q1_emitter" className="!w-2.5 !h-2.5 !bg-slate-800 !-right-1.5 border border-white" /></div>
    </div>
    <div className="mt-3 pt-2 border-t border-inst-border text-[9px] font-mono text-inst-muted flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> GPIO nunca alimenta a carga diretamente.</div>
  </div>
);
