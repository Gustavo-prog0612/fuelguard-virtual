import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Waves } from 'lucide-react';

export const Sen0311Node: React.FC<{ data: any }> = () => (
  <div className="bg-inst-surface border-2 border-inst-border-strong rounded-md shadow-raised p-4 w-64 text-inst-primary font-ui select-none">
    <div className="flex justify-between items-center border-b border-inst-border pb-2 mb-3">
      <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-xs bg-sky-700 flex items-center justify-center text-white"><Waves className="w-3.5 h-3.5" /></div><div><h3 className="text-xs font-display font-bold">A02YYUW / SEN0311</h3><span className="text-[10px] font-mono text-inst-secondary">UART TTL · IP67 · 30–4500 mm</span></div></div>
      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-inst-subtle border border-inst-border text-inst-secondary font-semibold">3V3</span>
    </div>
    <div className="space-y-2 text-[11px] font-mono">
      <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border"><span>VCC</span><span className="font-bold text-[#d97706]">3V3</span><Handle type="target" position={Position.Right} id="level_vcc" className="!w-2.5 !h-2.5 !bg-[#d97706] !-right-1.5 border border-white" /></div>
      <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border"><span>GND</span><span className="font-bold">0V</span><Handle type="target" position={Position.Right} id="level_gnd" className="!w-2.5 !h-2.5 !bg-[#1f2937] !-right-1.5 border border-white" /></div>
      <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border"><span>RX / MODE</span><span className="font-bold text-[#f97316]">HIGH</span><Handle type="target" position={Position.Right} id="level_rx_mode" className="!w-2.5 !h-2.5 !bg-[#f97316] !-right-1.5 border border-white" /></div>
      <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border"><span>TX / UART</span><span className="font-bold text-[#0ea5e9]">GPIO16</span><Handle type="source" position={Position.Right} id="level_tx" className="!w-2.5 !h-2.5 !bg-[#0ea5e9] !-right-1.5 border border-white" /></div>
    </div>
    <div className="mt-3 pt-2 border-t border-inst-border text-[9px] font-mono text-inst-muted flex justify-between"><span>9600 8N1</span><span>RX high = processed</span></div>
  </div>
);
