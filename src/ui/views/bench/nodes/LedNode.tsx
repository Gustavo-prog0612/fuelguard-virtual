import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Lightbulb } from 'lucide-react';

export const LedNode: React.FC<{ data: any }> = () => {
  return (
    <div className="bg-inst-surface border-2 border-inst-border-strong rounded-md shadow-raised p-4 w-60 text-inst-primary font-ui select-none">
      <div className="flex justify-between items-center border-b border-inst-border pb-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-xs bg-[#166534] flex items-center justify-center text-white">
            <Lightbulb className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-display font-bold text-inst-primary">LED Verde + 220Ω</h3>
            <span className="text-[10px] font-mono text-inst-secondary">Sinalizador de Nível</span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
          1,5 mA
        </span>
      </div>

      <div className="space-y-2 text-[11px] font-mono">
        <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border">
          <Handle type="target" position={Position.Left} id="r3_in" className="!w-2.5 !h-2.5 !bg-[#166534] !-left-1.5 border border-white" />
          <span className="text-inst-primary">R3 entrada</span><span className="font-bold text-[#166534]">220 Ω</span>
        </div>
        <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border">
          <span className="text-inst-primary">R3 saída</span><span className="font-bold text-[#166534]">D1 +</span>
          <Handle type="source" position={Position.Right} id="r3_out" className="!w-2.5 !h-2.5 !bg-[#166534] !-right-1.5 border border-white" />
        </div>
        <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border">
          <Handle
            type="target"
            position={Position.Left}
            id="led_anode"
            className="!w-2.5 !h-2.5 !bg-[#166534] !-left-1.5 border border-white"
          />
          <span className="text-inst-primary">Anodo (via 220 Ω)</span>
          <span className="font-bold text-[#166534]">IO4</span>
        </div>

        <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border">
          <Handle
            type="target"
            position={Position.Left}
            id="led_cathode"
            className="!w-2.5 !h-2.5 !bg-[#1f2937] !-left-1.5 border border-white"
          />
          <span className="text-inst-primary">Catodo (Terra)</span>
          <span className="font-bold text-inst-primary">GND</span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-inst-border text-[9px] font-mono text-inst-muted">
        Resistor 220 Ω limita corrente do GPIO4
      </div>
    </div>
  );
};
