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
    bg: 'bg-sky-50 dark:bg-sky-950/70',
    text: 'text-sky-800 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-800/80',
    dot: 'bg-sky-500 dark:bg-sky-400',
    tooltip: 'Modelo matemático puro rodando no Web Worker (determinístico).',
  },
  aproximado: {
    label: 'APROXIMADO',
    bg: 'bg-amber-50 dark:bg-amber-950/70',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/80',
    dot: 'bg-amber-500 dark:bg-amber-400',
    tooltip: 'Simplificação didática para visualização (ex: ondas da água, ruído gaussiano).',
  },
  requer_hardware: {
    label: 'REQUER HARDWARE',
    bg: 'bg-rose-50 dark:bg-rose-950/70',
    text: 'text-rose-800 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/80',
    dot: 'bg-rose-500 dark:bg-rose-400',
    tooltip: 'Fenômeno físico que exige ensaio em bancada real (cone de eco, atenuação de paredes).',
  },
  pendente: {
    label: 'PENDENTE',
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700/80',
    dot: 'bg-slate-500 dark:bg-slate-400',
    tooltip: 'Parâmetro dependente do exemplar físico de componente adquirido.',
  },
};

export const HonestyBadge: React.FC<HonestyBadgeProps> = ({ level, text, size = 'sm' }) => {
  const config = BADGE_CONFIG[level];
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span
      title={config.tooltip}
      className={`inline-flex items-center font-mono font-medium tracking-wide rounded-full border shadow-xs ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5 flex-shrink-0 animate-pulse`} />
      {text || config.label}
    </span>
  );
};
