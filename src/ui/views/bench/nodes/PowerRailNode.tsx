import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Cable, CircleDot } from 'lucide-react';

const railRows = [
  { label: '+5V VBUS', id: 'rail_5v', color: '#dc2626' },
  { label: '+3V3 LOGIC', id: 'rail_3v3', color: '#d97706' },
  { label: 'GND COMMON', id: 'rail_gnd', color: '#1f2937' },
] as const;

export const PowerRailNode: React.FC<{ data: any }> = () => (
  <div className="bg-inst-surface border-2 border-inst-border-strong rounded-md shadow-raised p-4 w-72 text-inst-primary font-ui select-none">
    <div className="flex justify-between items-center border-b border-inst-border pb-2.5 mb-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-xs bg-slate-700 flex items-center justify-center text-white">
          <Cable className="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 className="text-xs font-display font-bold">MB-102 · Barramentos</h3>
          <span className="text-[10px] font-mono text-inst-secondary">Distribuição física de potência</span>
        </div>
      </div>
      <CircleDot className="w-4 h-4 text-fuelguard-green" />
    </div>

    <div className="space-y-2 text-[11px] font-mono">
      {railRows.map((rail) => (
        <div key={rail.id} className="relative flex items-center justify-between h-8 px-3 bg-inst-canvas rounded-xs border border-inst-border">
          <Handle
            type="target"
            position={Position.Left}
            id={`${rail.id}_in`}
            className="!w-2.5 !h-2.5 !-left-1.5 border border-white"
            style={{ background: rail.color }}
          />
          <span className="font-bold" style={{ color: rail.color }}>{rail.label}</span>
          <Handle
            type="source"
            position={Position.Right}
            id={`${rail.id}_out`}
            className="!w-2.5 !h-2.5 !-right-1.5 border border-white"
            style={{ background: rail.color }}
          />
        </div>
      ))}
    </div>

    <div className="mt-3 pt-2 border-t border-inst-border text-[9px] font-mono text-inst-muted">
      Trilhos separados · nenhum periférico fica alimentado diretamente por GPIO
    </div>
  </div>
);
