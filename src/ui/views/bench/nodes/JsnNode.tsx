import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Waves } from 'lucide-react';

export const JsnNode: React.FC<{ data: any }> = () => {
  return (
    <div className="bg-inst-surface border-2 border-inst-border-strong rounded-md shadow-raised p-4 w-64 text-inst-primary font-ui select-none">
      <div className="flex justify-between items-center border-b border-inst-border pb-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-xs bg-sky-700 flex items-center justify-center text-white">
            <Waves className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-display font-bold text-inst-primary">JSN-SR04T v2.0</h3>
            <span className="text-[10px] font-mono text-inst-secondary">Sensor Acústico 40 kHz</span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-inst-subtle border border-inst-border text-inst-secondary font-semibold">
          5V TTL
        </span>
      </div>

      <div className="space-y-2 text-[11px] font-mono">
        <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border">
          <span className="text-inst-primary">Alimentação VCC</span>
          <span className="font-bold text-[#dc2626]">5V</span>
          <Handle
            type="target"
            position={Position.Right}
            id="jsn_vcc"
            className="!w-2.5 !h-2.5 !bg-[#dc2626] !-right-1.5 border border-white"
          />
        </div>

        <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border">
          <span className="text-inst-primary">Terra GND</span>
          <span className="font-bold text-inst-primary">GND</span>
          <Handle
            type="target"
            position={Position.Right}
            id="jsn_gnd"
            className="!w-2.5 !h-2.5 !bg-[#1f2937] !-right-1.5 border border-white"
          />
        </div>

        <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border">
          <span className="text-inst-primary">Disparo TRIG (5V)</span>
          <span className="font-bold text-[#7c3aed]">TRIG</span>
          <Handle
            type="target"
            position={Position.Right}
            id="jsn_trig"
            className="!w-2.5 !h-2.5 !bg-[#7c3aed] !-right-1.5 border border-white"
          />
        </div>

        <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border">
          <span className="text-inst-primary">Retorno ECHO (5V!)</span>
          <span className="font-bold text-[#0284c7]">ECHO</span>
          <Handle
            type="source"
            position={Position.Right}
            id="jsn_echo"
            className="!w-2.5 !h-2.5 !bg-[#0284c7] !-right-1.5 border border-white"
          />
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-inst-border text-[10px] font-mono text-inst-muted flex justify-between">
        <span>Zona Cega: 20 cm</span>
        <span>Cone: ~55°</span>
      </div>
    </div>
  );
};
