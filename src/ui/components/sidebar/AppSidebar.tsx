import React from 'react';
import { 
  CircuitBoard, 
  Waves, 
  Terminal, 
  FlaskConical, 
  BookOpenCheck,
  Cpu,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { AppRoute, NavItem } from '@/types/navigation';

interface AppSidebarProps {
  currentRoute: AppRoute;
  onRouteChange: (route: AppRoute) => void;
  onOpenHelpModal?: () => void;
  isCollapsed?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'bench',
    label: '1. Bancada',
    iconName: 'CircuitBoard',
    description: 'Canvas interativo e validador elétrico',
    shortcut: '1',
  },
  {
    id: 'signals',
    label: '2. Sinais',
    iconName: 'Waves',
    description: 'Tanque 2D, séries temporais e acústica',
    shortcut: '2',
  },
  {
    id: 'events',
    label: '3. Eventos',
    iconName: 'Terminal',
    description: 'Console serial UART e timeline monotônica',
    shortcut: '3',
  },
  {
    id: 'tests',
    label: '4. Testes',
    iconName: 'FlaskConical',
    description: 'Cenários, semente PRNG e falhas',
    shortcut: '4',
  },
  {
    id: 'cad',
    label: '5. Projeto CAD',
    iconName: 'Cpu',
    description: 'Gêmeo 3D, PCB 2D e esquemático',
    shortcut: '6',
  },
  {
    id: 'docs',
    label: '6. Guia & Design',
    iconName: 'BookOpenCheck',
    description: 'Checklist e laboratório de tipografia',
    shortcut: '5',
  },
];

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentRoute,
  onRouteChange,
  onOpenHelpModal,
  isCollapsed = false,
}) => {
  const getIcon = (id: AppRoute) => {
    switch (id) {
      case 'bench':
        return <CircuitBoard className="w-4 h-4" />;
      case 'signals':
        return <Waves className="w-4 h-4" />;
      case 'events':
        return <Terminal className="w-4 h-4" />;
      case 'tests':
        return <FlaskConical className="w-4 h-4" />;
      case 'cad':
        return <Cpu className="w-4 h-4" />;
      case 'docs':
        return <BookOpenCheck className="w-4 h-4" />;
    }
  };

  return (
    <aside className={`${isCollapsed ? 'w-[4.5rem]' : 'w-60 lg:w-64'} bg-inst-surface/95 border-r border-inst-border flex flex-col justify-between flex-shrink-0 select-none font-ui shadow-sm transition-[width] duration-200`}>
      {/* Navegação Principal */}
      <div className="p-3">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-3`}>
          {!isCollapsed && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-inst-muted font-bold px-2">
                Workspace
              </div>
              <div className="text-[11px] text-inst-secondary px-2 mt-0.5">Lab workspace</div>
            </div>
          )}
          {isCollapsed && <div className="w-8 h-8 rounded-lg bg-fuelguard-green text-white grid place-items-center font-mono font-bold text-xs">FG</div>}
        </div>
        <nav className="space-y-1" role="tablist" aria-label="Navegação de Tarefas">
          {NAV_ITEMS.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onRouteChange(item.id)}
                title={isCollapsed ? `${item.label}: ${item.description}` : undefined}
                className={`w-full text-left px-2.5 py-2.5 rounded-lg flex items-center justify-between text-xs font-medium transition ${
                  isActive
                    ? 'bg-inst-subtle text-fuelguard-green font-bold border border-inst-border-strong shadow-xs'
                    : 'text-inst-secondary hover:text-inst-primary hover:bg-inst-canvas border border-transparent'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-2'} truncate`}>
                  <span className={isActive ? 'text-fuelguard-green' : 'text-inst-muted'}>
                    {getIcon(item.id)}
                  </span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && (
                  <div className="flex items-center space-x-1 flex-shrink-0 font-mono text-[10px] text-inst-muted">
                    <span>[{item.shortcut}]</span>
                    {isActive && <ChevronRight className="w-3 h-3 text-fuelguard-green" />}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Rodapé da Barra Lateral */}
      <div className="p-3 border-t border-inst-border bg-inst-canvas space-y-2">
        {!isCollapsed && <div className="px-3 py-2.5 rounded-lg bg-inst-canvas border border-inst-border text-[10px] font-mono text-inst-secondary space-y-1">
          <div className="flex justify-between">
            <span className="text-inst-muted">MÉTODO:</span>
            <span className="text-fuelguard-green font-bold">DETERMINÍSTICO</span>
          </div>
          <div className="flex justify-between">
            <span className="text-inst-muted">LOOP:</span>
            <span className="text-fuelguard-green font-bold">WORKER 50Hz</span>
          </div>
        </div>}

        {onOpenHelpModal && (
          <button
            onClick={onOpenHelpModal}
            title={isCollapsed ? 'Manual do Instrumento' : undefined}
            className="w-full py-2 px-2 rounded-lg flex items-center justify-center space-x-1.5 text-xs text-inst-secondary hover:text-inst-primary hover:bg-inst-surface border border-inst-border transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            {!isCollapsed && <span>Manual do Instrumento</span>}
          </button>
        )}
      </div>
    </aside>
  );
};
