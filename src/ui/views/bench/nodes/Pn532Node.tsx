import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Radio } from 'lucide-react';

export const Pn532Node: React.FC<{ data: any }> = () => {
  return (
    <div className="bg-inst-surface border-2 border-inst-border-strong rounded-md shadow-raised p-4 w-64 text-inst-primary font-ui select-none">
      <div className="flex justify-between items-center border-b border-inst-border pb-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-xs bg-emerald-700 flex items-center justify-center text-white">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-display font-bold text-inst-primary">PN532 Breakout</h3>
            <span className="text-[10px] font-mono text-inst-secondary">NFC / RFID 13,56 MHz</span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-inst-subtle border border-inst-border text-inst-secondary font-semibold">
          SPI 3V3
        </span>
      </div>

      <div className="space-y-1.5 text-[11px] font-mono">
        <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border">
          <Handle
            type="target"
            position={Position.Left}
            id="nfc_vcc"
            className="!w-2.5 !h-2.5 !bg-[#d97706] !-left-1.5 border border-white"
          />
          <span className="text-inst-primary">Alimentação VCC</span>
          <span className="font-bold text-[#d97706]">3V3</span>
        </div>

        <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border">
          <Handle
            type="target"
            position={Position.Left}
            id="nfc_gnd"
            className="!w-2.5 !h-2.5 !bg-[#1f2937] !-left-1.5 border border-white"
          />
          <span className="text-inst-primary">Terra GND</span>
          <span className="font-bold text-inst-primary">GND</span>
        </div>

        <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border">
          <Handle
            type="target"
            position={Position.Left}
            id="nfc_cs"
            className="!w-2.5 !h-2.5 !bg-[#059669] !-left-1.5 border border-white"
          />
          <span className="text-inst-primary">Chip Select SS/CS</span>
          <span className="font-bold text-[#059669]">IO10</span>
        </div>

        <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border">
          <Handle
            type="target"
            position={Position.Left}
            id="nfc_mosi"
            className="!w-2.5 !h-2.5 !bg-[#059669] !-left-1.5 border border-white"
          />
          <span className="text-inst-primary">Master Out MOSI</span>
          <span className="font-bold text-[#059669]">IO11</span>
        </div>

        <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border">
          <Handle
            type="target"
            position={Position.Left}
            id="nfc_sck"
            className="!w-2.5 !h-2.5 !bg-[#eab308] !-left-1.5 border border-white"
          />
          <span className="text-inst-primary">SPI Clock SCK</span>
          <span className="font-bold text-[#eab308]">IO12</span>
        </div>

        <div className="relative flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border">
          <Handle
            type="source"
            position={Position.Left}
            id="nfc_miso"
            className="!w-2.5 !h-2.5 !bg-[#0284c7] !-left-1.5 border border-white"
          />
          <span className="text-inst-primary">Master In MISO</span>
          <span className="font-bold text-[#0284c7]">IO13</span>
        </div>
      </div>
    </div>
  );
};
