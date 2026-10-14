/**
 * FuelGuard Virtual Test Bench — Estação CAD & EDA (tscircuit Core)
 * 10 Áreas Técnicas Especializadas de Engenharia Mecatrônica & Eletrônica:
 * 1. Visão Geral (Overview do Gêmeo Digital, Limites A/B/C, Taxonomia de Proveniência)
 * 2. Bancada Física (Montagem 3D de referência, protoboard MB-102, fiação tubular)
 * 3. Esquemático (Esquema elétrico tscircuit/KiCad, isolamento 3.3V/5V)
 * 4. PCB 2D (layout atual de referência da FuelGuard)
 * 5. PCB 3D (gate explícito até existir PCB FuelGuard fabricável)
 * 6. Conexões (Programação de chicote DuPont/JST, AWG e waypoints)
 * 7. Sensor & Água (Metrologia bloqueada até lote, recipiente e tampa reais)
 * 8. BOM & Assets (BOM rastreável, estados de evidência e gates de fabricação)
 * 9. Testes (Runner automatizado e relatório de evidências)
 * 10. Auditoria (Auditoria DRC e conformidade mecânica de contato/suporte)
 */

import React, { lazy, Suspense, useState, useMemo } from 'react';
import { 
  Cpu, 
  Box, 
  ShieldCheck, 
  Download, 
  BookOpen, 
  CheckCircle2,
  Layers,
  Compass,
  Cable as CableIcon,
  Droplets,
  FileCheck2,
} from 'lucide-react';
import { HonestyBadge } from '@/ui/components/badges/HonestyBadge';
import { CircuitJsonBuilder, CircuitJsonPackage } from '@/circuit-cad/circuit-json-builder';
import { DrcChecker } from '@/circuit-cad/drc-checker';
import { KiCadExporter } from '@/circuit-cad/kicad-exporter';
import { SchematicCanvas } from './SchematicCanvas';
import { PcbRealCanvas } from './PcbRealCanvas';
import { BomView } from './BomView';
import { DrcReportPanel } from './DrcReportPanel';
import ErrorBoundary from '@/ui/components/ErrorBoundary';
import { AgentSessionPanel } from './AgentSessionPanel';
import { CadOverviewTab } from './CadOverviewTab';
import { CadConnectionsTab } from './CadConnectionsTab';
import { CadSensorsWaterTab } from './CadSensorsWaterTab';
import { CadTestsTab } from './CadTestsTab';

const BenchAssemblyCanvas = lazy(() => import('./BenchAssemblyCanvas').then((module) => ({ default: module.BenchAssemblyCanvas })));
const Pcb3DCanvas = lazy(() => import('./Pcb3DCanvas').then((module) => ({ default: module.Pcb3DCanvas })));

const CadViewerLoading: React.FC = () => (
  <div className="h-full flex items-center justify-center rounded-2xl bg-[#0a0f18] text-slate-300 font-mono text-xs">
    Carregando viewer técnico…
  </div>
);

export type CadSubTab = 
  | 'overview' 
  | 'assembly' 
  | 'schematic' 
  | 'pcb' 
  | '3d' 
  | 'connections' 
  | 'sensors' 
  | 'bom' 
  | 'tests' 
  | 'audit';

export const CadView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CadSubTab>('overview');
  const [isFaultActive, setIsFaultActive] = useState<boolean>(false);
  const [isAgentCollapsed, setIsAgentCollapsed] = useState<boolean>(true); // Painel de agente retrátil (fechado por padrão)
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const builder = useMemo(() => new CircuitJsonBuilder(), []);

  // Circuito canônico atual em Circuit JSON da FuelGuard.
  const circuitPkg: CircuitJsonPackage = useMemo(() => {
    return isFaultActive
      ? builder.buildFaultyBenchCircuit()
      : builder.buildNominalBenchCircuit();
  }, [isFaultActive, builder]);

  // Auditoria DRC em tempo real
  const drcViolations = useMemo(() => {
    return DrcChecker.runChecks(circuitPkg.circuit_elements);
  }, [circuitPkg]);

  const errorCount = drcViolations.filter((v) => v.severity === 'ERROR').length;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDownloadCircuitJson = () => {
    const filename = `fuelguard_circuit_${Date.now()}.circuit.json`;
    KiCadExporter.triggerDownload(
      filename,
      JSON.stringify(circuitPkg, null, 2),
      'application/json'
    );
    showToast('Pacote Circuit JSON FuelGuard baixado com sucesso!');
  };

  const handleDownloadKiCadSch = () => {
    showToast('Bloqueado: o esquemático KiCad real será criado após medições, MPNs, conectores e footprints aprovados.');
  };

  const handleDownloadKiCadPcb = () => {
    if (circuitPkg.pcbReadiness !== 'manufacturing-ready') {
      showToast('Exportação bloqueada: este pacote ainda não está liberado para fabricação.');
      return;
    }
    const content = KiCadExporter.generateKiCadPcb(circuitPkg);
    KiCadExporter.triggerDownload(
      `fuelguard_pcb_${Date.now()}.kicad_pcb`,
      content,
      'text/plain'
    );
    showToast('Layout PCB KiCad 8 (.kicad_pcb) exportado para revisão.');
  };

  const handleNavigateTab = (tabId: string) => {
    if (tabId === 'drc') setActiveTab('audit');
    else if (tabId === 'catalog') setActiveTab('bom');
    else setActiveTab(tabId as CadSubTab);
  };

  return (
    <div className="flex h-full bg-inst-canvas text-inst-primary font-ui overflow-hidden select-none">
      {/* Toast de Notificação Flutuante */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-2.5 rounded-md text-xs font-mono shadow-overlay flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Painel Lateral do Agente CAD (Retrátil, Fechado por Padrão) */}
      <AgentSessionPanel
        onSelectTab={handleNavigateTab}
        onInjectFault={() => setIsFaultActive(true)}
        onRestoreSafe={() => setIsFaultActive(false)}
        isFaultActive={isFaultActive}
        onExportCircuitJson={handleDownloadCircuitJson}
        onExportKiCadSch={handleDownloadKiCadSch}
        onExportKiCadPcb={handleDownloadKiCadPcb}
        isCollapsed={isAgentCollapsed}
        onToggleCollapse={() => setIsAgentCollapsed(!isAgentCollapsed)}
      />

      {/* 2. Área Central de Engenharia CAD (10 Áreas Técnicas) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-4 md:p-5 space-y-3 bg-[#F4F5F7] dark:bg-slate-950">
        {/* Topo: Cabeçalho com Metadados e Exportação (Permity Style) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h1 className="text-sm font-display font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  Estação de Projeto CAD & Eletrônica
                </h1>
                <HonestyBadge level="simulado" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                <span>Gêmeo digital FuelGuard: bancada, placas, sensores, assets rastreáveis e fiação de referência.</span>
              </p>
            </div>
          </div>

          {/* Exportações Oficiais & Ações Rápidas (Pills Permity) */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <button
              onClick={handleDownloadCircuitJson}
              className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition flex items-center gap-1.5 font-sans font-semibold shadow-xs"
              title="Baixar arquivo Circuit JSON universal"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Circuit JSON</span>
            </button>
            <button
              onClick={handleDownloadKiCadSch}
              className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition flex items-center gap-1.5 font-sans font-semibold shadow-xs"
              title="Bloqueado até existir fonte KiCad real revisada"
            >
              <Download className="w-3.5 h-3.5" />
              <span>KiCad Sch</span>
            </button>
            <button
              onClick={handleDownloadKiCadPcb}
              disabled={circuitPkg.pcbReadiness !== 'manufacturing-ready'}
              className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition flex items-center gap-1.5 font-sans font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
              title={circuitPkg.pcbReadiness !== 'manufacturing-ready' ? 'Bloqueado até revisão de fabricação e DRC' : 'Baixar layout PCB KiCad 8/9 (.kicad_pcb)'}
            >
              <Download className="w-3.5 h-3.5" />
              <span>KiCad PCB</span>
            </button>
          </div>
        </div>

        {/* 10 Sub-Abas Técnicas de Engenharia (Permity Horizontal Pill Tab Strip) */}
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-full border border-slate-200/80 dark:border-slate-800 shadow-xs">
            {[
              { id: 'overview', label: '1. Visão Geral', icon: Compass },
              { id: 'assembly', label: '2. Bancada Física', icon: Box },
              { id: 'schematic', label: '3. Esquemático', icon: Cpu },
              { id: 'pcb', label: '4. PCB 2D', icon: Layers },
              { id: '3d', label: '5. PCB 3D', icon: Box },
              { id: 'connections', label: '6. Conexões', icon: CableIcon },
              { id: 'sensors', label: '7. Sensor & Água', icon: Droplets },
              { id: 'bom', label: '8. BOM & Assets', icon: BookOpen },
              { id: 'tests', label: '9. Testes', icon: FileCheck2 },
              { id: 'audit', label: `10. Auditoria (${errorCount > 0 ? errorCount + ' Falha' : 'OK'})`, icon: ShieldCheck, hasBadge: errorCount > 0 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as CadSubTab)}
                  className={`px-2.5 py-1 rounded-full transition flex items-center gap-1.5 text-xs ${
                    isActive
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${tab.hasBadge ? 'text-rose-400' : ''}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 font-medium hidden lg:block">
            Projeto: <strong className="text-slate-900 dark:text-white">FuelGuard Digital Twin</strong>
          </div>
        </div>

        {/* Viewport Principal com o Conteúdo da Aba Técnica Ativa */}
        <div className="flex-1 overflow-hidden relative">
          {/* Estação 1: Visão Geral */}
          {activeTab === 'overview' && (
            <CadOverviewTab
              onSelectTab={handleNavigateTab}
              isFaultActive={isFaultActive}
            />
          )}

          {/* Estação 2: Bancada Física 3D */}
          {activeTab === 'assembly' && (
            <ErrorBoundary fallbackMessage="Erro ao carregar estação CAD. Verifique se seu navegador suporta WebGL.">
              <Suspense fallback={<CadViewerLoading />}>
                <BenchAssemblyCanvas onSelectTab={handleNavigateTab} />
              </Suspense>
            </ErrorBoundary>
          )}

          {/* Estação 3: Esquemático Elétrico */}
          {activeTab === 'schematic' && (
            <SchematicCanvas circuitPkg={circuitPkg} />
          )}

          {/* Estação 4: PCB 2D Real com Footprints KiCad */}
          {activeTab === 'pcb' && (
            <div className="h-full flex flex-col overflow-hidden">
              <div className="flex-1 overflow-hidden">
                <PcbRealCanvas />
              </div>
            </div>
          )}

          {/* Estação 5: Placa PCB 3D */}
          {activeTab === '3d' && (
            <ErrorBoundary fallbackMessage="Erro ao carregar estação CAD. Verifique se seu navegador suporta WebGL.">
              <Suspense fallback={<CadViewerLoading />}>
                <Pcb3DCanvas onSelectTab={handleNavigateTab} />
              </Suspense>
            </ErrorBoundary>
          )}

          {/* Estação 6: Conexões, Chicote & Pinagem */}
          {activeTab === 'connections' && (
            <CadConnectionsTab onSelectTab={handleNavigateTab} />
          )}

          {/* Estação 7: Sensor Ultrassônico & Água — dados bloqueados */}
          {activeTab === 'sensors' && (
            <CadSensorsWaterTab onSelectTab={handleNavigateTab} />
          )}

          {/* Estação 8: BOM & Catálogo de Assets (Completo com Compras BR) */}
          {activeTab === 'bom' && (
            <div className="h-full flex flex-col overflow-hidden">
              <BomView />
            </div>
          )}

          {/* Estação 9: Testes Automatizados */}
          {activeTab === 'tests' && (
            <CadTestsTab onSelectTab={handleNavigateTab} />
          )}

          {/* Estação 10: Auditoria DRC & Mecânica */}
          {activeTab === 'audit' && (
            <DrcReportPanel
              violations={drcViolations}
              onInjectFault={() => setIsFaultActive(true)}
              onRestoreSafe={() => setIsFaultActive(false)}
              isFaultActive={isFaultActive}
            />
          )}
        </div>
      </div>
    </div>
  );
};
