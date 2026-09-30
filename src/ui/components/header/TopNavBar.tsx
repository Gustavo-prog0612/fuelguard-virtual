import React from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Wifi, 
  WifiOff, 
  ShieldAlert,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Plus
} from 'lucide-react';
import { AppRoute } from '@/types/navigation';
import { useDesignSystem } from '@/design-system/DesignSystemContext';

interface TopNavBarProps {
  currentRoute?: AppRoute;
  isRunning: boolean;
  simTimeFormatted: string;
  speed: number;
  isOnline: boolean;
  onTogglePlay: () => void;
  onStep: () => void;
  onReset: () => void;
  onSetSpeed: (speed: number) => void;
  onToggleOnline: () => void;
  onOpenHelpModal: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentRoute: _currentRoute,
  isRunning,
  simTimeFormatted,
  speed,
  isOnline,
  onTogglePlay,
  onStep,
  onReset,
  onSetSpeed,
  onToggleOnline,
  onOpenHelpModal,
  isSidebarCollapsed,
  onToggleSidebar,
}) => {
  const { themeMode, toggleTheme } = useDesignSystem();

  return (
    <header className="h-16 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800 px-4 lg:px-6 flex items-center justify-between gap-3 z-30 select-none shadow-[0_1px_3px_rgba(0,0,0,0.02)] font-ui backdrop-blur-md">
      {/* 1. Esquerda: Logo Oficial FuelGuard, Identidade e Badge Permity Style */}
      <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
        <button
          onClick={onToggleSidebar}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition grid place-items-center"
          title={isSidebarCollapsed ? 'Expandir navegação' : 'Recolher navegação'}
          aria-label={isSidebarCollapsed ? 'Expandir navegação' : 'Recolher navegação'}
        >
          {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        {/* Logo Icon Jet-Black com cantos arredondados (Permity style) */}
        <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-mono font-bold text-xs tracking-tighter shadow-sm">
          FG
        </div>

        <div className="min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-display font-bold tracking-tight text-slate-900 dark:text-white">
              FuelGuard <span className="text-slate-500 dark:text-slate-400 font-normal text-xs">Real Hardware Reference</span>
            </span>
            {/* Estado honesto do gate: os contratos nominais estão disponíveis, mas a fabricação ainda depende de evidência física. */}
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-xs">
              <ShieldAlert className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Gate físico pendente</span>
            </span>
          </div>
          <div className="hidden md:flex text-[10px] font-mono text-slate-400 items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>ESP32-S3 v1.1 • Adafruit PN532 v1.6 • SEN0311 UART • PCB sob gate</span>
          </div>
        </div>
      </div>

      {/* 2. Centro: Permity Search Bar (Pill arredondado com lupa) */}
      <div className="hidden md:flex items-center justify-center flex-1 max-w-md px-2">
        <div className="w-full flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:border-slate-400 transition shadow-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar sinais, componentes, pinos, nets..."
            className="w-full bg-transparent border-none outline-none text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-ui"
          />
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-medium text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* 3. Direita: Controles de Relógio de Instrumento & Conectividade */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Bloco do Relógio Virtual (Pill Permity Style) */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 px-3 py-1 rounded-full text-xs font-mono shadow-xs">
          <div className="flex items-center space-x-1.5 pr-2 border-r border-slate-200 dark:border-slate-700">
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-bold text-slate-800 dark:text-slate-200">{simTimeFormatted}</span>
          </div>

          {/* Botões Play / Step / Reset */}
          <div className="flex items-center space-x-0.5">
            <button
              onClick={onTogglePlay}
              className={`p-1 rounded-full transition ${
                isRunning 
                  ? 'text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-950/60' 
                  : 'text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/60'
              }`}
              title={isRunning ? 'Pausar Simulação (Espaço)' : 'Iniciar Simulação (Espaço)'}
              aria-label={isRunning ? 'Pausar Simulação' : 'Iniciar Simulação'}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
            <button
              onClick={onStep}
              disabled={isRunning}
              className="p-1 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Passo Único (20ms)"
              aria-label="Avançar Passo Único"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onReset}
              className="p-1 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition"
              title="Reiniciar Relógio"
              aria-label="Reiniciar Relógio"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Multiplicador de Velocidade */}
          <div className="flex items-center space-x-0.5 pl-1.5 border-l border-slate-200 dark:border-slate-700">
            {[0.5, 1.0, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => onSetSpeed(s)}
                className={`text-[10px] px-1.5 py-0.5 rounded-full transition font-semibold ${
                  speed === s
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Toggle de Rede (Pill Permity) */}
        <button
          onClick={onToggleOnline}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border shadow-xs transition ${
            isOnline
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
          }`}
          title={isOnline ? 'Rede Virtual Conectada' : 'Rede Desconectada (Fila Offline Acumulando)'}
        >
          {isOnline ? <Wifi className="w-3 h-3 text-emerald-600" /> : <WifiOff className="w-3 h-3 text-rose-600" />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </button>

        {/* Alternador de Tema Claro / Escuro */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition grid place-items-center"
          title={themeMode === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          aria-label="Alternar Tema"
        >
          {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Botão Sobre / Ajuda */}
        <button
          onClick={onOpenHelpModal}
          className="w-8 h-8 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition grid place-items-center"
          title="Manual do Instrumento & Limites Físicos"
          aria-label="Manual e Ajuda"
        >
          <ShieldAlert className="w-4 h-4" />
        </button>

        {/* Permity Signature Primary Action Button: Jet-Black Rounded Pill */}
        <button
          onClick={onOpenHelpModal}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo Ensaio</span>
        </button>
      </div>
    </header>
  );
};
