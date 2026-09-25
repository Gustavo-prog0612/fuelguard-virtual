import React from 'react';

export type HonestyLevel = 'simulado' | 'aproximado' | 'requer_hardware' | 'pendente';

interface HonestyBadgeProps {
  level: HonestyLevel;
  text?: string;
  size?: 'sm' | 'md';
}

const BADGE_CONFIG: Record<HonestyLevel, { label: string; bg: string; text: string; border: string; dot: string; tooltip: string }> = {
  simulado: {
    label: 'SIMULADO',
    bg: 'bg-sky-50',
    text: 'text-sky-800',
    border: 'border-sky-300',
    dot: 'bg-sky-600',
    tooltip: 'Modelo matemático puro rodando no Web Worker (determinístico).',
  },
  aproximado: {
    label: 'APROXIMADO',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300',
    dot: 'bg-amber-600',
    tooltip: 'Simplificação didática para visualização (ex: ondas da água, ruído gaussiano).',
  },
  requer_hardware: {
    label: 'REQUER HARDWARE',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-300',
    dot: 'bg-rose-600',
    tooltip: 'Fenômeno físico que exige ensaio em bancada real (cone de eco, atenuação de paredes).',
  },
  pendente: {
    label: 'PENDENTE',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    dot: 'bg-slate-500',
    tooltip: 'Parâmetro dependente do exemplar físico de componente adquirido.',
  },
};

export const HonestyBadge: React.FC<HonestyBadgeProps> = ({ level, text, size = 'sm' }) => {
  const config = BADGE_CONFIG[level];
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs';

  return (
    <span
      title={config.tooltip}
      className={`inline-flex items-center font-mono font-semibold tracking-wide rounded-xs border ${config.bg} ${config.text} ${config.border} ${sizeClasses} select-none`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5 flex-shrink-0`} />
      {text || config.label}
    </span>
  );
};
