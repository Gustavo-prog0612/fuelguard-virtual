/**
 * FuelGuard Virtual Test Bench — Estação CAD & EDA (tscircuit Core)
 * 10 Áreas Técnicas Especializadas de Engenharia Mecatrônica & Eletrônica:
 * 1. Visão Geral (Overview do Gêmeo Digital, Limites A/B/C, Taxonomia de Proveniência)
 * 2. Bancada Física (Montagem 3D em escala 1:1, protoboard BB-830, fiação tubular)
 * 3. Esquemático (Esquema elétrico tscircuit/KiCad, isolamento 3.3V/5V)
 * 4. PCB 2D (Layout 2D com banner de especificação da Carrier / 4 camadas na RP2040)
 * 5. PCB 3D (Renderização 3D CAD com modelos fidedignos e ViewCube)
 * 6. Conexões (Programação de chicote DuPont/JST, AWG e waypoints)
 * 7. Sensor & Água (Modelo PBR óptico de 6 camadas, hidrostática e ToF ultrassônico)
 * 8. BOM & Assets (BOM com 12 itens industriais e catálogo de tolerâncias)
 * 9. Testes (Runner dos 78 testes automatizados 100% aprovados)
 * 10. Auditoria (Auditoria DRC e conformidade mecânica de contato/suporte)
 */

import React, { useState, useMemo } from 'react';
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
  AlertTriangle,
  FileCheck2,
} from 'lucide-react';
import { HonestyBadge } from '@/ui/components/badges/HonestyBadge';
import { CircuitJsonBuilder, CircuitJsonPackage } from '@/circuit-cad/circuit-json-builder';
import { DrcChecker } from '@/circuit-cad/drc-checker';
import { KiCadExporter } from '@/circuit-cad/kicad-exporter';
import {
  getRp2040CircuitPackage,
  getRp2040DrcViolations,
  RP2040_METADATA,
} from '@/circuit-cad/rp2040-circuit-provider';
import { SchematicCanvas } from './SchematicCanvas';
import { PcbCanvas } from './PcbCanvas';
import { Pcb3DCanvas } from './Pcb3DCanvas';
import { BenchAssemblyCanvas } from './BenchAssemblyCanvas';
import { DrcReportPanel } from './DrcReportPanel';
import { AgentSessionPanel } from './AgentSessionPanel';
import { CadOverviewTab } from './CadOverviewTab';
import { CadConnectionsTab } from './CadConnectionsTab';
import { CadSensorsWaterTab } from './CadSensorsWaterTab';
import { CadBomAssetsTab } from './CadBomAssetsTab';
import { CadTestsTab } from './CadTestsTab';

export type ActiveCadBoard = 'fuelguard-carrier' | 'rp2040-motor-controller';
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
  const [activeBoard, setActiveBoard] = useState<ActiveCadBoard>('fuelguard-carrier');
  const [isFaultActive, setIsFaultActive] = useState<boolean>(false);
  const [isAgentCollapsed, setIsAgentCollapsed] = useState<boolean>(true); // Painel de agente retrátil (fechado por padrão)
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const builder = useMemo(() => new CircuitJsonBuilder(), []);

  // Circuito canônico atual em Circuit JSON (Carrier Board FuelGuard vs RP2040 Stepper Controller)
  const circuitPkg: CircuitJsonPackage = useMemo(() => {
    if (activeBoard === 'rp2040-motor-controller') {
      return getRp2040CircuitPackage();
    }
    return isFaultActive
      ? builder.buildFaultyBenchCircuit()
      : builder.buildNominalBenchCircuit();
  }, [activeBoard, isFaultActive, builder]);

  // Auditoria DRC em tempo real
  const drcViolations = useMemo(() => {
    if (activeBoard === 'rp2040-motor-controller') {
      return getRp2040DrcViolations();
    }
    return DrcChecker.runChecks(circuitPkg.circuit_elements);
  }, [activeBoard, circuitPkg]);

  const errorCount = drcViolations.filter((v) => v.severity === 'ERROR').length;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDownloadCircuitJson = () => {
    const filename = activeBoard === 'rp2040-motor-controller'
      ? `rp2040_motor_controller_${Date.now()}.circuit.json`
      : `fuelguard_circuit_${Date.now()}.circuit.json`;
    KiCadExporter.triggerDownload(
      filename,
      JSON.stringify(circuitPkg, null, 2),
      'application/json'
    );
    showToast(`Pacote Circuit JSON (${activeBoard === 'rp2040-motor-controller' ? 'RP2040' : 'FuelGuard'}) baixado com sucesso!`);
  };

  const handleDownloadKiCadSch = () => {
    const content = KiCadExporter.generateKiCadSchematic(circuitPkg);
    KiCadExporter.triggerDownload(
      `fuelguard_schematic_${Date.now()}.kicad_sch`,
      content,
      'text/plain'
    );
    showToast('Esquemático KiCad 8 (.kicad_sch) demonstrativo gerado!');
  };

  const handleDownloadKiCadPcb = () => {
    const content = KiCadExporter.generateKiCadPcb(circuitPkg);
    KiCadExporter.triggerDownload(
      `fuelguard_pcb_${Date.now()}.kicad_pcb`,
      content,
      'text/plain'
    );
    showToast('Layout PCB KiCad 8 (.kicad_pcb) demonstrativo gerado!');
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
      <div className="flex-1 flex flex-col h-full overflow-hidden p-3 md:p-4 space-y-2.5">
        {/* Topo: Cabeçalho com Metadados, Dual-Board Switcher e Exportação */}
        <div className="bg-inst-surface border border-inst-border p-3 rounded-md shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#22c55e]" />
                <h1 className="text-sm font-display font-bold uppercase tracking-wider text-inst-primary flex items-center gap-2">
                  Estação de Projeto CAD & Eletrônica (tscircuit Core)
                </h1>
                <HonestyBadge level="simulado" />
              </div>
              <p className="text-[11px] text-inst-secondary mt-0.5">
                {activeBoard === 'rp2040-motor-controller' ? (
                  <span>
                    <strong>{RP2040_METADATA.name}</strong> • {RP2040_METADATA.description}
                  </span>
                ) : (
                  <span>
                    Gêmeo Digital Verificável: Protoboard BB-830, Sensores M20/PN532 e Fiação DuPont Ponto a Ponto.
                  </span>
                )}
              </p>
            </div>

            {/* Dual-Board Switcher */}
            <div className="flex items-center space-x-1.5 bg-inst-canvas p-1 rounded-sm border border-inst-border shrink-0">
              <button
                onClick={() => setActiveBoard('fuelguard-carrier')}
                className={`px-2.5 py-1 text-xs font-mono rounded-xs transition flex items-center gap-1.5 ${
                  activeBoard === 'fuelguard-carrier'
                    ? 'bg-fuelguard-green text-white font-bold shadow-xs'
                    : 'text-inst-secondary hover:text-inst-primary hover:bg-inst-subtle'
                }`}
                title="Bancada Didática FuelGuard ESP32-S3 com Sensores"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>FuelGuard ESP32 MVP</span>
              </button>
              <button
                onClick={() => setActiveBoard('rp2040-motor-controller')}
                className={`px-2.5 py-1 text-xs font-mono rounded-xs transition flex items-center gap-1.5 ${
                  activeBoard === 'rp2040-motor-controller'
                    ? 'bg-purple-600 text-white font-bold shadow-xs'
                    : 'text-inst-secondary hover:text-inst-primary hover:bg-inst-subtle'
                }`}
                title="Placa 4 Camadas Roteada: RP2040 Dual Stepper Controller (imrishabh18)"
              >
                <Box className="w-3.5 h-3.5" />
                <span>RP2040 Controller (4L)</span>
              </button>
            </div>
          </div>

          {/* Exportações Oficiais & Ações Rápidas */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <button
              onClick={handleDownloadCircuitJson}
              className="px-2.5 py-1 rounded-xs bg-inst-canvas border border-inst-border hover:border-fuelguard-green text-inst-primary hover:text-fuelguard-green transition flex items-center gap-1.5 shadow-xs"
              title="Baixar arquivo Circuit JSON universal"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Circuit JSON</span>
            </button>
            <button
              onClick={handleDownloadKiCadSch}
              className="px-2.5 py-1 rounded-xs bg-inst-canvas border border-inst-border hover:border-sky-500 text-inst-primary hover:text-sky-400 transition flex items-center gap-1.5 shadow-xs"
              title="Baixar esquemático KiCad 8/9 (.kicad_sch)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>KiCad Sch</span>
            </button>
            <button
              onClick={handleDownloadKiCadPcb}
              className="px-2.5 py-1 rounded-xs bg-inst-canvas border border-inst-border hover:border-purple-500 text-inst-primary hover:text-purple-400 transition flex items-center gap-1.5 shadow-xs"
              title="Baixar layout PCB KiCad 8/9 (.kicad_pcb)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>KiCad PCB</span>
            </button>
          </div>
        </div>

        {/* 10 Sub-Abas Técnicas de Engenharia */}
        <div className="flex flex-wrap items-center justify-between border-b border-inst-border pb-1.5 text-xs font-mono gap-1.5">
          <div className="flex flex-wrap items-center gap-1 bg-inst-canvas p-1 rounded-sm border border-inst-border">
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
                  className={`px-2.5 py-1 rounded-xs transition flex items-center gap-1.5 text-[11px] ${
                    isActive
                      ? 'bg-inst-surface text-inst-primary font-bold shadow-xs border border-inst-border-strong text-fuelguard-green'
                      : 'text-inst-secondary hover:text-inst-primary hover:bg-inst-subtle'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${tab.hasBadge ? 'text-rose-500' : ''}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[10px] text-inst-muted hidden md:block">
            Modelo: <strong className="text-inst-primary">{activeBoard === 'rp2040-motor-controller' ? 'RP2040 Motor Controller (4L)' : 'FuelGuard ESP32 Lab Rig'}</strong>
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
            <BenchAssemblyCanvas onSelectTab={handleNavigateTab} />
          )}

          {/* Estação 3: Esquemático Elétrico */}
          {activeTab === 'schematic' && (
            <SchematicCanvas circuitPkg={circuitPkg} />
          )}

          {/* Estação 4: PCB 2D */}
          {activeTab === 'pcb' && (
            <div className="h-full flex flex-col overflow-hidden">
              {activeBoard === 'fuelguard-carrier' && (
                <div className="bg-amber-950/40 border border-amber-600/70 p-2.5 rounded-sm mb-2 text-xs font-mono text-amber-200 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>BANCADA MVP: Prototipada em Protoboard BB-830</strong> • PCB Adaptadora: Em Especificação / Não Roteada em Cobre Físico.
                    </span>
                  </div>
                  <span className="text-[10px] bg-amber-900/60 px-2 py-0.5 rounded-2xs border border-amber-500/50 text-amber-300">
                    [IPC-2221A / JLCPCB Class 2]
                  </span>
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <PcbCanvas circuitPkg={circuitPkg} />
              </div>
            </div>
          )}

          {/* Estação 5: Placa PCB 3D */}
          {activeTab === '3d' && (
            <Pcb3DCanvas activeBoard={activeBoard} onSelectTab={handleNavigateTab} />
          )}

          {/* Estação 6: Conexões, Chicote & Pinagem */}
          {activeTab === 'connections' && (
            <CadConnectionsTab onSelectTab={handleNavigateTab} />
          )}

          {/* Estação 7: Sensor Ultrassônico & Água PBR */}
          {activeTab === 'sensors' && (
            <CadSensorsWaterTab onSelectTab={handleNavigateTab} />
          )}

          {/* Estação 8: BOM & Catálogo de Assets */}
          {activeTab === 'bom' && (
            <CadBomAssetsTab
              activeBoard={activeBoard}
              onSelectTab={handleNavigateTab}
            />
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
