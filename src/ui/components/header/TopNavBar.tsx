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
  Moon
} from 'lucide-react';
import { AppRoute } from '@/types/navigation';
import { useDesignSystem } from '@/design-system/DesignSystemContext';

interface TopNavBarProps {
  currentRoute: AppRoute;
  onRouteChange: (route: AppRoute) => void;
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
}

const NAV_TABS: { id: AppRoute; label: string; shortcut: string }[] = [
  { id: 'bench', label: '1. Bancada', shortcut: '1' },
  { id: 'signals', label: '2. Sinais', shortcut: '2' },
  { id: 'events', label: '3. Eventos', shortcut: '3' },
  { id: 'tests', label: '4. Testes', shortcut: '4' },
  { id: 'cad', label: '5. Projeto CAD', shortcut: '5' },
];

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentRoute,
  onRouteChange,
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
}) => {
  const { themeMode, toggleTheme } = useDesignSystem();

  return (
    <header className="h-14 bg-inst-surface border-b border-inst-border px-4 flex items-center justify-between z-30 select-none shadow-xs font-ui">
      {/* 1. Esquerda: Logo Oficial FuelGuard & Badge de Versão */}
      <div className="flex items-center space-x-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-xs bg-[#0f5132] flex items-center justify-center text-white font-mono font-bold text-xs tracking-tighter shadow-xs">
          FG
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-display font-bold tracking-tight text-inst-primary">
              FuelGuard <span className="text-inst-secondary font-normal text-xs">Virtual Test Bench</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-inst-subtle text-inst-secondary border border-inst-border">
              v1.0
            </span>
          </div>
          <div className="text-[10px] font-mono text-inst-muted flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#166534]" />
            ESP32-S3 • JSN-SR04T • PN532 • Recipiente com Água
          </div>
        </div>
      </div>

      {/* 2. Centro: Navegação por Tarefas de Engenharia */}
      <nav className="hidden md:flex items-center space-x-1 bg-inst-canvas p-1 rounded-sm border border-inst-border" role="tablist">
        {NAV_TABS.map((tab) => {
          const isActive = currentRoute === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onRouteChange(tab.id)}
              className={`px-3 py-1 rounded-xs text-xs font-medium transition flex items-center gap-1.5 ${
                isActive
                  ? 'bg-inst-surface text-inst-primary font-bold shadow-xs border border-inst-border-strong text-fuelguard-green'
                  : 'text-inst-secondary hover:text-inst-primary hover:bg-inst-subtle'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[9px] font-mono opacity-50">[{tab.shortcut}]</span>
            </button>
          );
        })}
      </nav>

      {/* 3. Direita: Controles de Relógio de Instrumento & Conectividade */}
      <div className="flex items-center space-x-3">
        {/* Bloco do Relógio Virtual */}
        <div className="flex items-center space-x-2 bg-inst-canvas border border-inst-border px-2.5 py-1 rounded-sm text-xs font-mono">
          <div className="flex items-center space-x-1.5 pr-2 border-r border-inst-border">
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#166534] animate-pulse' : 'bg-[#b45309]'}`} />
            <span className="font-bold text-inst-primary">{simTimeFormatted}</span>
          </div>

          {/* Botões Play / Step / Reset */}
          <div className="flex items-center space-x-0.5">
            <button
              onClick={onTogglePlay}
              className={`p-1 rounded-xs transition ${
                isRunning 
                  ? 'text-[#b45309] hover:bg-amber-100 dark:hover:bg-amber-950' 
                  : 'text-[#166534] hover:bg-emerald-100 dark:hover:bg-emerald-950'
              }`}
              title={isRunning ? 'Pausar Simulação (Espaço)' : 'Iniciar Simulação (Espaço)'}
              aria-label={isRunning ? 'Pausar Simulação' : 'Iniciar Simulação'}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
            <button
              onClick={onStep}
              disabled={isRunning}
              className="p-1 rounded-xs text-inst-secondary hover:text-inst-primary disabled:opacity-30 disabled:cursor-not-allowed"
              title="Passo Único (20ms)"
              aria-label="Avançar Passo Único"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onReset}
              className="p-1 rounded-xs text-inst-secondary hover:text-inst-primary"
              title="Reiniciar Relógio"
              aria-label="Reiniciar Relógio"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Multiplicador de Velocidade */}
          <div className="flex items-center space-x-0.5 pl-1.5 border-l border-inst-border">
            {[0.5, 1.0, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => onSetSpeed(s)}
                className={`text-[10px] px-1 rounded-xs transition ${
                  speed === s
                    ? 'bg-fuelguard-green text-white font-bold'
                    : 'text-inst-secondary hover:text-inst-primary'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Toggle de Rede */}
        <button
          onClick={onToggleOnline}
          className={`flex items-center space-x-1.5 px-2 py-1 rounded-sm text-xs font-mono border transition ${
            isOnline
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
              : 'bg-rose-50 dark:bg-rose-950/60 text-[#b91c1c] dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
          }`}
          title={isOnline ? 'Rede Virtual Conectada' : 'Rede Desconectada (Fila Offline Acumulando)'}
        >
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </button>

        {/* Alternador de Tema Claro / Escuro (Obsidiana) */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-sm text-inst-secondary hover:text-inst-primary hover:bg-inst-subtle border border-inst-border transition"
          title={themeMode === 'dark' ? 'Mudar para Modo Laboratório Claro' : 'Mudar para Modo Instrumento Obsidiana (Escuro)'}
          aria-label="Alternar Tema"
        >
          {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-inst-primary" />}
        </button>

        {/* Botão Sobre / Ajuda */}
        <button
          onClick={onOpenHelpModal}
          className="p-1.5 rounded-sm text-inst-secondary hover:text-inst-primary hover:bg-inst-subtle border border-inst-border transition"
          title="Manual do Instrumento & Limites Físicos"
          aria-label="Manual e Ajuda"
        >
          <ShieldAlert className="w-4 h-4 text-inst-secondary" />
        </button>
      </div>
    </header>
  );
};
