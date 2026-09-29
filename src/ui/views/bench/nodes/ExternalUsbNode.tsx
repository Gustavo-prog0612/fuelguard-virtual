import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Usb } from 'lucide-react';

export const ExternalUsbNode: React.FC<{ data: any }> = () => (
  <div className="bg-inst-surface border-2 border-inst-border-strong rounded-md shadow-raised p-4 w-56 text-inst-primary font-ui select-none">
    <div className="flex items-center gap-2 border-b border-inst-border pb-2.5 mb-3">
      <div className="w-6 h-6 rounded-xs bg-slate-600 flex items-center justify-center text-white"><Usb className="w-3.5 h-3.5" /></div>
      <div>
        <h3 className="text-xs font-display font-bold">Host / Fonte USB-C</h3>
        <span className="text-[10px] font-mono text-inst-secondary">5 V regulados + console</span>
      </div>
    </div>
    <div className="relative flex items-center justify-end h-8 px-3 bg-inst-canvas rounded-xs border border-inst-border text-[11px] font-mono">
      <span className="font-bold text-slate-600">USB-A → Micro-USB</span>
      <Handle type="source" position={Position.Right} id="external_usb_out" className="!w-2.5 !h-2.5 !bg-slate-600 !-right-1.5 border border-white" />
    </div>
    <div className="mt-3 pt-2 border-t border-inst-border text-[9px] font-mono text-inst-muted">Origem única da alimentação da DevKitC</div>
  </div>
);
