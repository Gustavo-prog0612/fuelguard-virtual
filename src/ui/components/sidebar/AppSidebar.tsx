import React, { useState } from 'react';
import { 
  CircuitBoard, 
  Waves, 
  Terminal, 
  FlaskConical, 
  BookOpenCheck,
  Cpu,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  FileSpreadsheet,
  Compass
} from 'lucide-react';
import { AppRoute } from '@/types/navigation';

interface AppSidebarProps {
  currentRoute: AppRoute;
  onRouteChange: (route: AppRoute) => void;
  onOpenHelpModal?: () => void;
  isCollapsed?: boolean;
}

const PRIMARY_NAV_ITEMS: { id: AppRoute; label: string; icon: React.FC<{ className?: string }>; badge: string; shortcut: string }[] = [
  {
    id: 'overview',
    label: '0. Visão Geral',
    icon: Compass,
    badge: 'LIVE',
    shortcut: '0',
  },
  {
    id: 'bench',
    label: '1. Bancada',
    icon: CircuitBoard,
    badge: '3D',
    shortcut: '1',
  },
  {
    id: 'signals',
    label: '2. Sinais',
    icon: Waves,
    badge: '50Hz',
    shortcut: '2',
  },
  {
    id: 'events',
    label: '3. Eventos',
    icon: Terminal,
    badge: 'UART',
    shortcut: '3',
  },
  {
    id: 'tests',
    label: '4. Testes',
    icon: FlaskConical,
    badge: '83',
    shortcut: '4',
  },
  {
    id: 'cad',
    label: '5. Projeto CAD',
    icon: Cpu,
    badge: '10',
    shortcut: '5',
  },
  {
    id: 'docs',
    label: '6. Docs & Guia',
    icon: BookOpenCheck,
    badge: 'PDF',
    shortcut: '6',
  },
];

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentRoute,
  onRouteChange,
  onOpenHelpModal,
  isCollapsed = false,
}) => {
  const [isAiActive, setIsAiActive] = useState<boolean>(true);

  return (
    <aside className={`${isCollapsed ? 'w-[4.5rem]' : 'w-64'} bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between flex-shrink-0 select-none font-ui shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-[width] duration-200 z-20`}>
      {/* Topo: Seletor de Workspace (Permity Style) */}
      <div className="p-3.5 space-y-4">
        {/* Workspace Dropdown Card */}
        {!isCollapsed ? (
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                FG
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  Bancada Dev • Lab 01
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  ESP32-S3 Hardware Twin
                </div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          </div>
        ) : (
          <div className="w-9 h-9 mx-auto rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            FG
          </div>
        )}

        {/* Grupo 1: PERMITTING / WORKSPACES */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-1.5">
              Workspaces / Estações
            </div>
          )}
          <nav className="space-y-0.5" role="tablist" aria-label="Navegação de Tarefas">
            {PRIMARY_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onRouteChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full text-left px-3 py-2 rounded-2xl flex items-center justify-between text-xs transition ${
                    isActive
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60 font-medium'
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-2.5'} truncate`}>
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white dark:text-neutral-900' : 'text-slate-400'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && (
                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                        isActive 
                          ? 'bg-neutral-800 dark:bg-slate-200 text-neutral-300 dark:text-neutral-800 font-bold' 
                          : 'text-slate-400'
                      }`}>
                        {item.badge}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Grupo 2: AUDITORIA & ENGENHARIA (Permity Style Workspace Section) */}
        {!isCollapsed && (
          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-1.5">
              Auditoria & Engenharia
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => onRouteChange('cad')}
                className="w-full text-left px-3 py-1.5 rounded-2xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60 font-medium transition"
              >
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Central de Riscos (DRC)</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full font-bold">
                  0 Erros
                </span>
              </button>

              <button
                onClick={() => onRouteChange('cad')}
                className="w-full text-left px-3 py-1.5 rounded-2xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60 font-medium transition"
              >
                <div className="flex items-center space-x-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                  <span>Lista de Peças (BOM)</span>
                </div>
                <span className="text-[10px] font-mono text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded-full font-bold">
                  12 MPNs
                </span>
              </button>

              <button
                onClick={() => onRouteChange('signals')}
                className="w-full text-left px-3 py-1.5 rounded-2xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60 font-medium transition"
              >
                <div className="flex items-center space-x-2.5">
                  <Waves className="w-4 h-4 text-sky-600" />
                  <span>Metrologia & Água</span>
                </div>
                <span className="text-[10px] font-mono text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded-full font-bold">
                  5L
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rodapé da Barra Lateral: Permity Electric Lime AI Card + User Profile */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
        {/* Permity Signature Electric Lime Card (#D4F63D) */}
        {!isCollapsed && (
          <div className="p-3.5 rounded-2xl bg-[#D4F63D] text-slate-950 shadow-sm border border-[#c2e825] space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
                <span>Audit AI</span>
              </div>
              {/* Working Toggle Switch */}
              <button
                onClick={() => setIsAiActive(!isAiActive)}
                className={`w-8 h-4 rounded-full p-0.5 transition ${isAiActive ? 'bg-slate-950' : 'bg-slate-400'}`}
                title="Alternar auditoria inteligente contínua"
              >
                <div className={`w-3 h-3 rounded-full bg-white transition transform ${isAiActive ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="text-[10px] text-slate-800 font-medium leading-tight">
              {isAiActive ? 'Auditoria em tempo real ativa • 83 verificações em dia' : 'Auditoria em modo manual'}
            </div>
          </div>
        )}

        {/* User Profile Bar (Permity Style) */}
        {!isCollapsed ? (
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center flex-shrink-0">
                GB
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  Gustavo Baptista
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  Engenheiro de Hardware
                </div>
              </div>
            </div>
            <button
              onClick={onOpenHelpModal}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              title="Manual do Instrumento"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
            GB
          </div>
        )}
      </div>
    </aside>
  );
};
