import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Lock } from 'lucide-react';

export const ReedNode: React.FC<{ data: any }> = () => {
  return (
    <div className="bg-inst-surface border-2 border-inst-border-strong rounded-md shadow-raised p-4 w-60 text-inst-primary font-ui select-none">
      <div className="flex justify-between items-center border-b border-inst-border pb-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-xs bg-amber-700 flex items-center justify-center text-white">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-display font-bold text-inst-primary">Reed Switch</h3>
            <span className="text-[10px] font-mono text-inst-secondary">Sensor da Tampa</span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-inst-subtle border border-inst-border text-inst-secondary font-semibold">
          Pull-up 10k
        </span>
      </div>

      <div className="space-y-2 text-[11px] font-mono">
        <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border">
          <Handle
            type="target"
            position={Position.Left}
            id="reed_pin1"
            className="!w-2.5 !h-2.5 !bg-[#b45309] !-left-1.5 border border-white"
          />
          <span className="text-inst-primary">Terminal 1 (Sinal)</span>
          <span className="font-bold text-[#b45309]">IO7</span>
        </div>

        <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border">
          <Handle
            type="target"
            position={Position.Left}
            id="reed_pin2"
            className="!w-2.5 !h-2.5 !bg-[#1f2937] !-left-1.5 border border-white"
          />
          <span className="text-inst-primary">Terminal 2 (GND)</span>
          <span className="font-bold text-inst-primary">GND</span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-inst-border text-[9px] font-mono text-inst-muted">
        Contato magnético N.A. com debounce 50ms
      </div>
    </div>
  );
};
