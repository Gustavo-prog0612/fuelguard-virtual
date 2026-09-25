/**
 * FuelGuard Virtual Test Bench — Estação 6: Projeto CAD & EDA (tscircuit Core)
 * Integra visualizadores de Esquemático, PCB 2D, Gêmeo 3D (com ViewCube) e Verificação DRC
 * com exportação para Circuit JSON e KiCad 8/9, acompanhado do painel Agent Session.
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
  Compass
} from 'lucide-react';
import { HonestyBadge } from '@/ui/components/badges/HonestyBadge';
import { CircuitJsonBuilder, CircuitJsonPackage } from '@/circuit-cad/circuit-json-builder';
import { DrcChecker } from '@/circuit-cad/drc-checker';
import { KiCadExporter } from '@/circuit-cad/kicad-exporter';
import { FUELGUARD_CAD_LIBRARY } from '@/circuit-cad/component-library';
import {
  getRp2040CircuitPackage,
  getRp2040DrcViolations,
  RP2040_COMPONENT_LIBRARY,
  RP2040_METADATA,
} from '@/circuit-cad/rp2040-circuit-provider';
import { SchematicCanvas } from './SchematicCanvas';
import { PcbCanvas } from './PcbCanvas';
import { Pcb3DCanvas } from './Pcb3DCanvas';
import { BenchAssemblyCanvas } from './BenchAssemblyCanvas';
import { DrcReportPanel } from './DrcReportPanel';
import { AgentSessionPanel } from './AgentSessionPanel';

export type ActiveCadBoard = 'fuelguard-carrier' | 'rp2040-motor-controller';
type CadSubTab = 'schematic' | 'pcb' | '3d' | 'assembly' | 'drc' | 'catalog';

export const CadView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CadSubTab>('schematic');
  const [activeBoard, setActiveBoard] = useState<ActiveCadBoard>('fuelguard-carrier');
  const [isFaultActive, setIsFaultActive] = useState<boolean>(false);
  const [isAgentCollapsed, setIsAgentCollapsed] = useState<boolean>(false);
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

  return (
    <div className="flex h-full bg-inst-canvas text-inst-primary font-ui overflow-hidden select-none">
      {/* Toast de Notificação Flutuante */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-2.5 rounded-md text-xs font-mono shadow-overlay flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Barra Lateral: Painel Agent Session (tscircuit EDA / AI Prompting) */}
      <AgentSessionPanel
        onSelectTab={(tab) => setActiveTab(tab)}
        onInjectFault={() => setIsFaultActive(true)}
        onRestoreSafe={() => setIsFaultActive(false)}
        isFaultActive={isFaultActive}
        onExportCircuitJson={handleDownloadCircuitJson}
        onExportKiCadSch={handleDownloadKiCadSch}
        onExportKiCadPcb={handleDownloadKiCadPcb}
        isCollapsed={isAgentCollapsed}
        onToggleCollapse={() => setIsAgentCollapsed(!isAgentCollapsed)}
      />

      {/* 2. Área Central de Engenharia CAD */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-4 md:p-6 space-y-3">
        {/* Topo: Cabeçalho com Metadados e Exportação */}
        <div className="bg-inst-surface border border-inst-border p-3.5 rounded-md shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#22c55e]" />
              <h1 className="text-sm font-display font-bold uppercase tracking-wider text-inst-primary flex items-center gap-2">
                Estação de Projeto CAD & Eletrônica (tscircuit Core)
              </h1>
              <HonestyBadge level="simulado" />
            </div>
            <p className="text-xs text-inst-secondary mt-1">
              {activeBoard === 'rp2040-motor-controller' ? (
                <span>
                  <strong>{RP2040_METADATA.name}</strong> • {RP2040_METADATA.description}
                </span>
              ) : (
                <span>
                  Topologia de hardware em <strong>Circuit JSON v1</strong> com validação de níveis lógicos, geração KiCad e gêmeo tridimensional.
                </span>
              )}
            </p>
          </div>

          {/* Exportações Oficiais */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <button
              onClick={handleDownloadCircuitJson}
              className="px-2.5 py-1.5 rounded-xs bg-inst-canvas border border-inst-border hover:border-fuelguard-green text-inst-primary hover:text-fuelguard-green transition flex items-center gap-1.5 shadow-xs"
              title="Baixar arquivo Circuit JSON universal"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Circuit JSON</span>
            </button>
            <button
              onClick={handleDownloadKiCadSch}
              className="px-2.5 py-1.5 rounded-xs bg-inst-canvas border border-inst-border hover:border-sky-500 text-inst-primary hover:text-sky-400 transition flex items-center gap-1.5 shadow-xs"
              title="Baixar esquemático KiCad 8/9 (.kicad_sch)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>KiCad Sch</span>
            </button>
            <button
              onClick={handleDownloadKiCadPcb}
              className="px-2.5 py-1.5 rounded-xs bg-inst-canvas border border-inst-border hover:border-purple-500 text-inst-primary hover:text-purple-400 transition flex items-center gap-1.5 shadow-xs"
              title="Baixar layout PCB KiCad 8/9 (.kicad_pcb)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>KiCad PCB</span>
            </button>
          </div>
        </div>

        {/* Seletor de Placa Ativa da Bancada (Dual-Board Architecture) */}
        <div className="flex flex-wrap items-center justify-between bg-inst-surface border border-inst-border p-2.5 rounded-md shadow-xs gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono text-inst-secondary font-bold uppercase tracking-wider">
              Placa de Circuito Ativa:
            </span>
            <div className="flex items-center space-x-1.5 bg-inst-canvas p-1 rounded-sm border border-inst-border">
              <button
                onClick={() => setActiveBoard('fuelguard-carrier')}
                className={`px-3 py-1.5 text-xs font-mono rounded-xs transition flex items-center gap-1.5 ${
                  activeBoard === 'fuelguard-carrier'
                    ? 'bg-fuelguard-green text-white font-bold shadow-xs'
                    : 'text-inst-secondary hover:text-inst-primary hover:bg-inst-subtle'
                }`}
                title="Placa Carrier FuelGuard com ESP32-WROOM-32E, Conversor de Nível e Sensores"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Carrier Board FuelGuard (ESP32)</span>
              </button>
              <button
                onClick={() => setActiveBoard('rp2040-motor-controller')}
                className={`px-3 py-1.5 text-xs font-mono rounded-xs transition flex items-center gap-1.5 ${
                  activeBoard === 'rp2040-motor-controller'
                    ? 'bg-purple-600 text-white font-bold shadow-xs'
                    : 'text-inst-secondary hover:text-inst-primary hover:bg-inst-subtle'
                }`}
                title="Controlador de Motores Dual Stepper RP2040 NEMA 17 Cap (imrishabh18)"
              >
                <Box className="w-3.5 h-3.5" />
                <span>RP2040 Motor Controller (imrishabh18)</span>
              </button>
            </div>
          </div>

          {/* Badge Informativo da Placa Selecionada */}
          <div className="flex items-center space-x-2 text-xs font-mono">
            {activeBoard === 'fuelguard-carrier' ? (
              <>
                <span className="text-inst-secondary">Estado do Circuito:</span>
                <span className={`px-2 py-0.5 rounded-xs font-bold ${isFaultActive ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
                  {isFaultActive ? 'FALHA 5V DIRETO ATIVA' : 'FIAÇÃO NOMINAL SEGURA'}
                </span>
              </>
            ) : (
              <span className="px-2.5 py-0.5 rounded-xs font-bold bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span>4 CAMADAS • 42.3×42.3mm • 262 TRILHAS • 166 REGRAS CONFORMES</span>
              </span>
            )}
          </div>
        </div>

        {/* Sub-Navegação por Vistas Técnicas CAD */}
        <div className="flex flex-wrap items-center justify-between border-b border-inst-border pb-2 text-xs font-mono gap-2">
          <div className="flex items-center space-x-1 bg-inst-canvas p-1 rounded-sm border border-inst-border">
            {[
              { id: 'schematic', label: '1. Esquemático (EDA)', icon: Cpu },
              { id: 'pcb', label: '2. Layout PCB (2D)', icon: Layers },
              { id: '3d', label: '3. Placa PCB (3D)', icon: Box },
              { id: 'assembly', label: '4. Montagem Física 3D', icon: Compass },
              { id: 'drc', label: `5. Auditoria DRC (${errorCount > 0 ? errorCount + ' Falha' : 'OK'})`, icon: ShieldCheck, hasBadge: errorCount > 0 },
              { id: 'catalog', label: '6. Registro & Tolerâncias', icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as CadSubTab)}
                  className={`px-3 py-1.5 rounded-xs transition flex items-center gap-1.5 ${
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

          <div className="text-[11px] text-inst-muted">
            Visualizador CAD: <strong className="text-inst-primary">{activeBoard === 'rp2040-motor-controller' ? 'RP2040 NEMA 17 Cap' : 'FuelGuard ESP32 Carrier'}</strong>
          </div>
        </div>

        {/* Viewport Principal com o Conteúdo da Aba Ativa */}
        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'schematic' && <SchematicCanvas circuitPkg={circuitPkg} />}

          {activeTab === 'pcb' && <PcbCanvas circuitPkg={circuitPkg} />}

          {activeTab === '3d' && <Pcb3DCanvas activeBoard={activeBoard} onSelectTab={(tab) => setActiveTab(tab)} />}

          {activeTab === 'assembly' && <BenchAssemblyCanvas onSelectTab={(tab) => setActiveTab(tab)} />}

          {activeTab === 'drc' && (
            <DrcReportPanel
              violations={drcViolations}
              onInjectFault={() => setIsFaultActive(true)}
              onRestoreSafe={() => setIsFaultActive(false)}
              isFaultActive={isFaultActive}
            />
          )}

          {activeTab === 'catalog' && (
            <div className="h-full overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(activeBoard === 'rp2040-motor-controller' ? RP2040_COMPONENT_LIBRARY : FUELGUARD_CAD_LIBRARY).map((comp) => (
                  <div
                    key={comp.id}
                    className="bg-inst-surface border border-inst-border p-4 rounded-md shadow-xs space-y-3 font-mono text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[10px] text-inst-muted uppercase">Designator: {comp.designatorPrefix}</div>
                        <h2 className="text-sm font-bold text-inst-primary">{comp.name}</h2>
                        <div className="text-[11px] text-fuelguard-green font-semibold">
                          {comp.partNumber} ({comp.revision})
                        </div>
                      </div>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-xs font-bold uppercase border ${
                          comp.confidenceLevel === 'A'
                            ? 'bg-emerald-950/70 text-emerald-400 border-emerald-700'
                            : comp.confidenceLevel === 'B'
                            ? 'bg-sky-950/70 text-sky-400 border-sky-700'
                            : comp.confidenceLevel === 'C'
                            ? 'bg-amber-950/70 text-amber-300 border-amber-700'
                            : 'bg-purple-950/70 text-purple-300 border-purple-700'
                        }`}
                      >
                        Classe {comp.confidenceLevel}
                      </span>
                    </div>

                    <div className="text-[10px] text-inst-muted bg-inst-canvas/60 p-2 rounded-xs border border-inst-border leading-tight">
                      <strong className="text-inst-secondary">Fidelidade Geométrica:</strong> {comp.confidenceRationale}
                    </div>

                    <p className="text-[11px] text-inst-secondary font-ui leading-relaxed">
                      {comp.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-inst-border text-inst-secondary">
                      <div>Fabricante: <strong className="text-inst-primary">{comp.manufacturer}</strong></div>
                      <div>Dimensões: <strong className="text-inst-primary">{comp.nominalDimensionsMm.width} × {comp.nominalDimensionsMm.height} × {comp.nominalDimensionsMm.depth} mm</strong></div>
                      <div>Footprint: <strong className="text-inst-primary">{comp.footprintType}</strong></div>
                      <div>Formato / Licença: <strong className="text-inst-primary">{comp.format} • {comp.license}</strong></div>
                    </div>

                    {comp.inferredDimensions.length > 0 && (
                      <div className="p-2 rounded-xs bg-amber-950/30 border border-amber-900/60 text-[10px] text-amber-200 font-ui space-y-0.5">
                        <strong className="text-amber-300 block">⚠️ Medições a Confirmar com Paquímetro:</strong>
                        <ul className="list-disc list-inside">
                          {comp.inferredDimensions.map((inf, i) => (
                            <li key={i}>{inf}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="text-[10px] text-inst-muted font-ui pt-1 border-t border-inst-border">
                      <strong className="text-inst-secondary block">Substituição por CAD Real:</strong>
                      <span>{comp.replacementInstructions}</span>
                      <div className="mt-1 text-sky-400 truncate">
                        Fonte: <a href={comp.sourceUrl} target="_blank" rel="noreferrer" className="hover:underline">{comp.sourceUrl}</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
