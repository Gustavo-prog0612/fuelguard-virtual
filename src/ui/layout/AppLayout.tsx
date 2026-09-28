import React, { lazy, Suspense, useState, useEffect } from 'react';
import { AppRoute } from '@/types/navigation';
import { TopNavBar } from '@/ui/components/header/TopNavBar';
import { BenchView } from '@/ui/views/bench/BenchView';
import { SignalsView } from '@/ui/views/signals/SignalsView';
import { EventsView } from '@/ui/views/events/EventsView';
import { TestsView } from '@/ui/views/tests/TestsView';
import { DocsView } from '@/ui/views/docs/DocsView';
const CadView = lazy(() => import('@/ui/views/cad/CadView').then((module) => ({ default: module.CadView })));
import { HonestyBadge } from '@/ui/components/badges/HonestyBadge';
import { X, BookOpen } from 'lucide-react';
import { DesignSystemProvider } from '@/design-system/DesignSystemContext';
import { useSimulation } from '@/core/worker/use-simulation';

export const AppLayoutContent: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('bench');
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);

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
      case 'bench':
        return <BenchView />;
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
          <Suspense fallback={<div className="h-full flex items-center justify-center bg-inst-canvas text-inst-secondary font-mono text-xs">Carregando estação CAD…</div>}>
            <CadView />
          </Suspense>
        );
      default:
        return <BenchView />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-inst-canvas text-inst-primary overflow-hidden font-ui">
      {/* Barra de Instrumentação Superior */}
      <TopNavBar
        currentRoute={currentRoute}
        onRouteChange={setCurrentRoute}
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
      />

      {/* Viewport Principal com Foco Primário na Bancada */}
      <main className="flex-1 overflow-hidden relative" role="main">
        {renderActiveView()}
      </main>

      {/* Modal Didático Técnico */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-inst-surface border border-inst-border-strong rounded-md max-w-xl w-full p-6 space-y-4 shadow-overlay relative">
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 right-4 p-1 rounded-xs text-inst-secondary hover:text-inst-primary transition"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xs bg-fuelguard-green text-white">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-display font-bold text-inst-primary">
                  FuelGuard Virtual Test Bench — Manual do Instrumento
                </h3>
                <p className="text-xs text-inst-secondary">
                  Bancada de Engenharia (ESP32-S3 + PN532 V4 + SEN0311 + Água)
                </p>
              </div>
            </div>

            <div className="p-3 bg-inst-canvas border border-inst-border rounded-xs text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-inst-secondary">Versão do Esquema:</span>
                <span className="font-bold text-inst-primary">v1.0.0 (Canônico)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-inst-secondary">Motor Determinístico:</span>
                <span className="font-bold text-fuelguard-green">Web Worker Ativo (50 Hz)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-inst-secondary">Líquido de Teste:</span>
                <span className="font-bold text-[#0284c7]">Água Aberta (Didático)</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-inst-secondary leading-relaxed">
              <p>
                <strong>Regras Críticas de Bancada Física:</strong>
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Alimente o A02YYUW/SEN0311 em 3,3 V; TX deve ir ao GPIO16/UART1_RX e RX/MODE deve ficar em nível alto.</li>
                <li>Mantenha a eletrônica fora dos respingos, use laço de gotejamento e confira o PN532 V4 em SPI antes de energizar.</li>
                <li>A referência paramétrica não libera fabricação: tanque, tampa, sensor, MC-38, MB-102 e conectores exigem conferência física.</li>
              </ul>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-inst-border">
              <HonestyBadge level="requer_hardware" size="sm" />
              <button
                onClick={() => setShowAboutModal(false)}
                className="px-3 py-1.5 rounded-xs bg-fuelguard-green text-white font-bold text-xs hover:bg-fuelguard-green-hover transition shadow-xs"
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
