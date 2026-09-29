import React, { lazy, Suspense, useState, useEffect } from 'react';
import { AppRoute } from '@/types/navigation';
import { TopNavBar } from '@/ui/components/header/TopNavBar';
import { BenchView } from '@/ui/views/bench/BenchView';
import { SignalsView } from '@/ui/views/signals/SignalsView';
import { EventsView } from '@/ui/views/events/EventsView';
import { TestsView } from '@/ui/views/tests/TestsView';
import { DocsView } from '@/ui/views/docs/DocsView';
import { OverviewView } from '@/ui/views/overview/OverviewView';
import { AppSidebar } from '@/ui/components/sidebar/AppSidebar';
const CadView = lazy(() => import('@/ui/views/cad/CadView').then((module) => ({ default: module.CadView })));
import { HonestyBadge } from '@/ui/components/badges/HonestyBadge';
import { X, BookOpen } from 'lucide-react';
import { DesignSystemProvider } from '@/design-system/DesignSystemContext';
import { useSimulation } from '@/core/worker/use-simulation';

export const AppLayoutContent: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('bench');
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const sim = useSimulation();

  // Inicia simulação automaticamente na montagem
  useEffect(() => {
    sim.start();
    return () => {
      sim.stop();
    };
  }, []);

  // Atalhos de Teclado de Instrumento
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        sim.togglePlay();
      } else if (e.key === '0') {
        setCurrentRoute('overview');
      } else if (e.key === '1') {
        setCurrentRoute('bench');
      } else if (e.key === '2') {
        setCurrentRoute('signals');
      } else if (e.key === '3') {
        setCurrentRoute('events');
      } else if (e.key === '4') {
        setCurrentRoute('tests');
      } else if (e.key === '5') {
        setCurrentRoute('cad');
      } else if (e.key === '6') {
        setCurrentRoute('docs');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sim]);

  const renderActiveView = () => {
    switch (currentRoute) {
      case 'overview':
        return <OverviewView onNavigate={(route) => setCurrentRoute(route)} />;
      case 'bench':
        return <BenchView onOpenCad={() => setCurrentRoute('cad')} />;
      case 'signals':
        return <SignalsView />;
      case 'events':
        return <EventsView />;
      case 'tests':
        return <TestsView />;
      case 'docs':
        return <DocsView />;
      case 'cad':
        return (
          <Suspense fallback={<div className="h-full flex items-center justify-center bg-[#f4f5f7] text-slate-500 font-mono text-xs">Carregando estação CAD…</div>}>
            <CadView />
          </Suspense>
        );
      default:
        return <BenchView onOpenCad={() => setCurrentRoute('cad')} />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-inst-canvas text-inst-primary overflow-hidden font-ui">
      {/* Barra de Instrumentação Superior */}
      <TopNavBar
        currentRoute={currentRoute}
        isRunning={sim.isRunning}
        simTimeFormatted={sim.simTimeFormatted}
        speed={sim.speed}
        isOnline={sim.isOnline}
        onTogglePlay={sim.togglePlay}
        onStep={sim.step}
        onReset={sim.reset}
        onSetSpeed={sim.setSpeed}
        onToggleOnline={sim.toggleTransport}
        onOpenHelpModal={() => setShowAboutModal(true)}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
      />

      {/* Workspace persistente: navegação contextual + área técnica ampla. */}
      <main className="flex-1 flex min-h-0 overflow-hidden" role="main">
        <AppSidebar
          currentRoute={currentRoute}
          onRouteChange={setCurrentRoute}
          onOpenHelpModal={() => setShowAboutModal(true)}
          isCollapsed={isSidebarCollapsed}
        />
        <section className="flex-1 min-w-0 min-h-0 overflow-hidden">
          {renderActiveView()}
        </section>
      </main>

      {/* Modal Didático Técnico (Permity Style) */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition grid place-items-center"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  FuelGuard Virtual Test Bench — Manual do Instrumento
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bancada de Engenharia (ESP32-S3 + PN532 V4 + SEN0311 + Água)
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 rounded-2xl text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Versão do Esquema:</span>
                <span className="font-bold text-slate-900 dark:text-white">v1.0.0 (Canônico)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Motor Determinístico:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Web Worker Ativo (50 Hz)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Líquido de Teste:</span>
                <span className="font-bold text-sky-600 dark:text-sky-400">Água Aberta (Didático)</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Regras Críticas de Bancada Física:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Alimente o A02YYUW/SEN0311 em 3,3 V; TX deve ir ao GPIO16/UART1_RX e RX/MODE deve ficar em nível alto.</li>
                <li>Mantenha a eletrônica fora dos respingos, use laço de gotejamento e confira o PN532 V4 em SPI antes de energizar.</li>
                <li>A referência paramétrica não libera fabricação: tanque, tampa, sensor, MC-38, MB-102 e conectores exigem conferência física.</li>
              </ul>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <HonestyBadge level="requer_hardware" size="sm" />
              <button
                onClick={() => setShowAboutModal(false)}
                className="px-4 py-2 rounded-full bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition shadow-sm"
              >
                Compreendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AppLayout: React.FC = () => {
  return (
    <DesignSystemProvider>
      <AppLayoutContent />
    </DesignSystemProvider>
  );
};
