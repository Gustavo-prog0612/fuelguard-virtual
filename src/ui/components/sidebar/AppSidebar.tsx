import React from 'react';
import { 
  CircuitBoard, 
  Waves, 
  Terminal, 
  FlaskConical, 
  BookOpenCheck,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { AppRoute, NavItem } from '@/types/navigation';

interface AppSidebarProps {
  currentRoute: AppRoute;
  onRouteChange: (route: AppRoute) => void;
  onOpenHelpModal?: () => void;
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
    id: 'docs',
    label: '5. Guia & Design',
    iconName: 'BookOpenCheck',
    description: 'Checklist e laboratório de tipografia',
    shortcut: '5',
  },
];

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentRoute,
  onRouteChange,
  onOpenHelpModal,
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
      case 'docs':
        return <BookOpenCheck className="w-4 h-4" />;
    }
  };

  return (
    <aside className="w-56 bg-inst-surface border-r border-inst-border flex flex-col justify-between flex-shrink-0 select-none font-ui">
      {/* Navegação Principal */}
      <div className="p-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-inst-muted font-bold px-2 py-1.5">
          Tarefas de Engenharia
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
                className={`w-full text-left px-2.5 py-2 rounded-xs flex items-center justify-between text-xs font-medium transition ${
                  isActive
                    ? 'bg-inst-subtle text-fuelguard-green font-bold border border-inst-border-strong shadow-xs'
                    : 'text-inst-secondary hover:text-inst-primary hover:bg-inst-canvas border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className={isActive ? 'text-fuelguard-green' : 'text-inst-muted'}>
                    {getIcon(item.id)}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center space-x-1 flex-shrink-0 font-mono text-[10px] text-inst-muted">
                  <span>[{item.shortcut}]</span>
                  {isActive && <ChevronRight className="w-3 h-3 text-fuelguard-green" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Rodapé da Barra Lateral */}
      <div className="p-3 border-t border-inst-border bg-inst-canvas space-y-2">
        <div className="px-2 py-1 rounded-xs bg-inst-surface border border-inst-border text-[10px] font-mono text-inst-secondary space-y-0.5">
          <div className="flex justify-between">
            <span className="text-inst-muted">MÉTODO:</span>
            <span className="text-[#166534] font-bold">DETERMINÍSTICO</span>
          </div>
          <div className="flex justify-between">
            <span className="text-inst-muted">LOOP:</span>
            <span className="text-fuelguard-green font-bold">WORKER 50Hz</span>
          </div>
        </div>

        {onOpenHelpModal && (
          <button
            onClick={onOpenHelpModal}
            className="w-full py-1.5 px-2 rounded-xs flex items-center justify-center space-x-1.5 text-xs text-inst-secondary hover:text-inst-primary hover:bg-inst-surface border border-inst-border transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Manual do Instrumento</span>
          </button>
        )}
      </div>
    </aside>
  );
};
