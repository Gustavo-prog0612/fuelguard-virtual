import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Cpu } from 'lucide-react';

export const Esp32Node: React.FC<{ data: any }> = () => {
  return (
    <div className="bg-inst-surface border-2 border-inst-border-strong rounded-md shadow-raised p-4 w-72 text-inst-primary font-ui select-none">
      {/* Cabeçalho do Microcontrolador */}
      <div className="flex justify-between items-center border-b border-inst-border pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-xs bg-fuelguard-green flex items-center justify-center text-white">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-display font-bold text-inst-primary">ESP32-S3 DevKitC-1</h3>
            <span className="text-[10px] font-mono text-inst-secondary">Xtensa Dual-Core 240MHz</span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-inst-subtle border border-inst-border text-inst-secondary font-semibold">
          3,3V CMOS
        </span>
      </div>

      {/* Grade de Pinos / Headers */}
      <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
        {/* Coluna Esquerda: Alimentação e Sinais Baixos */}
        <div className="space-y-2">
          <div className="relative flex items-center justify-start h-6 pl-3 pr-1 bg-inst-canvas rounded-xs border border-inst-border">
            <Handle
              type="source"
              position={Position.Left}
              id="esp_3v3"
              className="!w-2.5 !h-2.5 !bg-[#d97706] !-left-1.5 border border-white"
            />
            <span className="font-bold text-[#d97706]">3V3</span>
          </div>

          <div className="relative flex items-center justify-start h-6 pl-3 pr-1 bg-inst-canvas rounded-xs border border-inst-border">
            <Handle
              type="source"
              position={Position.Left}
              id="esp_5v"
              className="!w-2.5 !h-2.5 !bg-[#dc2626] !-left-1.5 border border-white"
            />
            <span className="font-bold text-[#dc2626]">5V (USB)</span>
          </div>

          <div className="relative flex items-center justify-start h-6 pl-3 pr-1 bg-inst-canvas rounded-xs border border-inst-border">
            <Handle
              type="source"
              position={Position.Left}
              id="esp_gnd"
              className="!w-2.5 !h-2.5 !bg-[#1f2937] !-left-1.5 border border-white"
            />
            <span className="font-bold text-inst-primary">GND</span>
          </div>

          <div className="relative flex items-center justify-start h-6 pl-3 pr-1 bg-inst-canvas rounded-xs border border-inst-border">
            <Handle
              type="source"
              position={Position.Left}
              id="esp_gpio4"
              className="!w-2.5 !h-2.5 !bg-[#166534] !-left-1.5 border border-white"
            />
            <span className="font-bold text-inst-primary">GPIO4 (LED)</span>
          </div>

          <div className="relative flex items-center justify-start h-6 pl-3 pr-1 bg-inst-canvas rounded-xs border border-inst-border"><Handle type="source" position={Position.Left} id="esp_gpio14" className="!w-2.5 !h-2.5 !bg-amber-500 !-left-1.5 border border-white" /><span className="font-bold text-inst-primary">GPIO14 (BUZZER)</span></div>
          <div className="relative flex items-center justify-start h-6 pl-3 pr-1 bg-inst-canvas rounded-xs border border-inst-border"><Handle type="target" position={Position.Left} id="esp_gpio16" className="!w-2.5 !h-2.5 !bg-sky-500 !-left-1.5 border border-white" /><span className="font-bold text-inst-primary">GPIO16 (UART RX)</span></div>
        </div>

        {/* Coluna Direita: Tampa e Barramento SPI */}
        <div className="space-y-2">
          <div className="relative flex items-center justify-end h-6 pr-3 pl-1 bg-inst-canvas rounded-xs border border-inst-border">
            <span className="font-bold text-inst-primary">GPIO7 (LID)</span>
            <Handle
              type="target"
              position={Position.Right}
              id="esp_gpio7"
              className="!w-2.5 !h-2.5 !bg-[#b45309] !-right-1.5 border border-white"
            />
          </div>

          <div className="relative flex items-center justify-end h-6 pr-3 pl-1 bg-inst-canvas rounded-xs border border-inst-border">
            <span className="font-bold text-inst-primary">GPIO10 (CS)</span>
            <Handle
              type="source"
              position={Position.Right}
              id="esp_gpio10"
              className="!w-2.5 !h-2.5 !bg-[#059669] !-right-1.5 border border-white"
            />
          </div>

          <div className="relative flex items-center justify-end h-6 pr-3 pl-1 bg-inst-canvas rounded-xs border border-inst-border">
            <span className="font-bold text-inst-primary">GPIO11 (MOSI)</span>
            <Handle
              type="source"
              position={Position.Right}
              id="esp_gpio11"
              className="!w-2.5 !h-2.5 !bg-[#059669] !-right-1.5 border border-white"
            />
          </div>

          <div className="relative flex items-center justify-end h-6 pr-3 pl-1 bg-inst-canvas rounded-xs border border-inst-border">
            <span className="font-bold text-inst-primary">GPIO12 (SCK)</span>
            <Handle
              type="source"
              position={Position.Right}
              id="esp_gpio12"
              className="!w-2.5 !h-2.5 !bg-[#eab308] !-right-1.5 border border-white"
            />
          </div>

          <div className="relative flex items-center justify-end h-6 pr-3 pl-1 bg-inst-canvas rounded-xs border border-inst-border">
            <span className="font-bold text-inst-primary">GPIO13 (MISO)</span>
            <Handle
              type="target"
              position={Position.Right}
              id="esp_gpio13"
              className="!w-2.5 !h-2.5 !bg-[#0284c7] !-right-1.5 border border-white"
            />
          </div>
          <div className="relative flex items-center justify-end h-6 pr-3 pl-1 bg-inst-canvas rounded-xs border border-inst-border"><span className="font-bold text-inst-primary">GPIO17 (UART TX)</span><Handle type="source" position={Position.Right} id="esp_gpio17" className="!w-2.5 !h-2.5 !bg-sky-500 !-right-1.5 border border-white" /></div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-inst-border flex justify-between text-[10px] font-mono text-inst-muted">
        <span>Micro-USB Alimentado</span>
        <span className="text-fuelguard-green font-bold">LDO 3V3 OK</span>
      </div>
      <div className="relative mt-2 flex items-center justify-between h-6 px-3 bg-inst-canvas rounded-xs border border-inst-border text-[11px] font-mono">
        <Handle type="target" position={Position.Left} id="esp_micro_usb_in" className="!w-2.5 !h-2.5 !bg-slate-600 !-left-1.5 border border-white" />
        <span className="font-bold text-slate-600">Micro-USB 5V / UART</span>
      </div>
    </div>
  );
};
