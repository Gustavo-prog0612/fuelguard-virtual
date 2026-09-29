/**
 * FuelGuard Virtual Test Bench — Estação 8: BOM (Lista de Materiais) & Catálogo de Assets
 * Exibe o BOM completo oficial com 12 itens industriais e a matriz de fidelidade CAD:
 * - BOM com designators, part numbers, fabricantes, footprints, preços e fornecedores
 * - Catálogo de modelos 3D com classes de confiança A, B, C, D e notas de paquímetro
 */

import React, { useState } from 'react';
import {
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import bomData from '@/../hardware/bom/bom.json';
import {
  FUELGUARD_CAD_LIBRARY,
  CadComponentMetadata,
} from '@/circuit-cad/component-library';

interface CadBomAssetsTabProps {
  onSelectTab: (tabId: string) => void;
}

export const CadBomAssetsTab: React.FC<CadBomAssetsTabProps> = ({
  onSelectTab,
}) => {
  const [subView, setSubView] = useState<'bom' | 'assets'>('bom');

  const bomItems = bomData.items;
  const totalQuantity = bomItems.reduce((acc, item) => acc + item.quantity, 0);

  const componentsList = Object.values(FUELGUARD_CAD_LIBRARY) as CadComponentMetadata[];

  return (
    <div className="h-full overflow-y-auto space-y-4 pr-1 text-inst-primary font-ui select-text">
      {/* 1. Header do Módulo */}
      <div className="bg-inst-surface border border-inst-border p-4 rounded-md shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-inst-border pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-fuelguard-green" />
              <h2 className="text-base font-display font-bold uppercase tracking-wider text-inst-primary">
                BOM de Referência Real & Registro de Tolerâncias Mecatrônicas
              </h2>
            </div>
            <p className="text-xs text-inst-secondary mt-1 max-w-4xl leading-relaxed">
              A BOM canônica separa módulos comerciais, passivos e peças mecânicas. Classes C/D são referências dimensionais
              e não devem ser usadas para fabricar uma PCB ou suporte sem medição da unidade real.
            </p>
          </div>

          {/* Seletor de Sub-Visão: BOM vs Assets CAD */}
          <div className="flex items-center space-x-1 bg-inst-canvas p-1 rounded-sm border border-inst-border font-mono text-xs">
            <button
              onClick={() => setSubView('bom')}
              className={`px-3 py-1.5 rounded-xs transition ${
                subView === 'bom'
                  ? 'bg-fuelguard-green text-white font-bold shadow-xs'
                  : 'text-inst-secondary hover:text-inst-primary'
              }`}
            >
              1. Lista de Materiais (BOM)
            </button>
            <button
              onClick={() => setSubView('assets')}
              className={`px-3 py-1.5 rounded-xs transition ${
                subView === 'assets'
                  ? 'bg-fuelguard-green text-white font-bold shadow-xs'
                  : 'text-inst-secondary hover:text-inst-primary'
              }`}
            >
              2. Catálogo CAD & Tolerâncias
            </button>
          </div>
        </div>

        {/* Resumo de Custos e Classes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
          <div className="bg-inst-canvas p-2.5 rounded-xs border border-inst-border">
            <span className="text-[10px] text-inst-muted block uppercase">Itens cadastrados:</span>
            <span className="text-sm font-bold text-fuelguard-green">{bomItems.length} referências / {totalQuantity} unidades</span>
          </div>
          <div className="bg-inst-canvas p-2.5 rounded-xs border border-inst-border">
            <span className="text-[10px] text-inst-muted block uppercase">Componentes Críticos:</span>
            <span className="text-sm font-bold text-amber-400">ESP32-S3, PN532 V4, SEN0311</span>
          </div>
          <div className="bg-inst-canvas p-2.5 rounded-xs border border-inst-border">
            <span className="text-[10px] text-inst-muted block uppercase">Classes de Fidelidade:</span>
            <span className="text-sm font-bold text-sky-400">Classe A (Oficial), B (Padrão), C (Paquímetro), D (Didático)</span>
          </div>
          <div className="bg-inst-canvas p-2.5 rounded-xs border border-inst-border">
            <span className="text-[10px] text-inst-muted block uppercase">Normas de Tolerância:</span>
            <span className="text-sm font-bold text-purple-400">IPC-7351B / IPC-2221A</span>
          </div>
        </div>
      </div>

      {/* Sub-Visão 1: Tabela BOM Oficial */}
      {subView === 'bom' && (
        <div className="bg-inst-surface border border-inst-border rounded-md shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-inst-canvas border-b border-inst-border text-[11px] text-inst-muted uppercase">
                  <th className="p-3">Ref</th>
                  <th className="p-3">Part Number</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Descrição Técnica</th>
                  <th className="p-3">Fabricante</th>
                  <th className="p-3">Dimensões</th>
                  <th className="p-3">Preço</th>
                  <th className="p-3">Classe</th>
                  <th className="p-3">Fornecedor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inst-border">
                {bomItems.map((item, index) => (
                  <tr key={index} className="hover:bg-inst-canvas/60 transition">
                    <td className="p-3 font-bold text-fuelguard-green">{item.designator}</td>
                    <td className="p-3 font-bold text-inst-primary">{item.partNumber}</td>
                    <td className="p-3 text-[10px] text-inst-muted uppercase">{item.category}</td>
                    <td className="p-3 text-inst-secondary max-w-xs">{item.description}</td>
                    <td className="p-3 text-inst-secondary">{item.manufacturer}</td>
                    <td className="p-3 text-inst-muted text-[11px]">
                      {item.dimensionsMm
                        ? `${item.dimensionsMm.width} × ${item.dimensionsMm.height} × ${item.dimensionsMm.depth} mm`
                        : 'Pendente: lote/medição'}
                    </td>
                    <td className="p-3 text-amber-300 font-bold">Não congelado</td>
                    <td className="p-3">
                      <span
                        className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold border ${
                          item.confidenceLevel === 'A'
                            ? 'bg-emerald-950/70 text-emerald-400 border-emerald-700'
                            : item.confidenceLevel === 'B'
                            ? 'bg-sky-950/70 text-sky-400 border-sky-700'
                            : item.confidenceLevel === 'C'
                            ? 'bg-amber-950/70 text-amber-300 border-amber-700'
                            : 'bg-purple-950/70 text-purple-300 border-purple-700'
                        }`}
                      >
                        Classe {item.confidenceLevel}
                      </span>
                    </td>
                    <td className="p-3">
                      {item.sourceUrl ? (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-400 hover:underline flex items-center gap-1 text-[11px]"
                        >
                          <span>{item.manufacturer}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-inst-muted text-[11px]">{item.manufacturer}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Visão 2: Catálogo de Modelos CAD e Tolerâncias Mecânicas */}
      {subView === 'assets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {componentsList.map((comp) => (
            <div
              key={comp.id}
              className="bg-inst-surface border border-inst-border p-4 rounded-md shadow-xs space-y-3 font-mono text-xs"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="text-[10px] text-inst-muted uppercase">
                    Designator: <span className="text-fuelguard-green font-bold">{comp.designatorPrefix}</span>
                  </div>
                  <h3 className="text-sm font-bold text-inst-primary">{comp.name}</h3>
                  <div className="text-[11px] text-fuelguard-green font-semibold">
                    {comp.partNumber} ({comp.revision})
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
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
                  {comp.validationStatus === 'exact_verified' && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-2xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 uppercase tracking-tight">
                      ★ CAD verificado
                    </span>
                  )}
                  {comp.validationStatus === 'documented_reference' && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-2xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/50 uppercase tracking-tight">
                      Fonte documentada
                    </span>
                  )}
                </div>
              </div>

              <div className="text-[10px] text-inst-muted bg-inst-canvas/60 p-2 rounded-xs border border-inst-border leading-tight">
                <strong className="text-inst-secondary">Fidelidade Geométrica:</strong> {comp.confidenceRationale}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-inst-border text-inst-secondary">
                <div>Fabricante: <strong className="text-inst-primary">{comp.manufacturer}</strong></div>
                <div>Dimensões: <strong className="text-inst-primary">{comp.nominalDimensionsMm.width} × {comp.nominalDimensionsMm.height} × {comp.nominalDimensionsMm.depth} mm</strong></div>
                <div>Footprint: <strong className="text-inst-primary">{comp.footprintType}</strong></div>
                <div>Formato: <strong className="text-fuelguard-green font-semibold">{comp.format}</strong></div>
              </div>

              {comp.inferredDimensions.length > 0 && (
                <div className="p-2 rounded-xs bg-amber-950/30 border border-amber-900/60 text-[10px] text-amber-200 font-ui space-y-0.5">
                  <strong className="text-amber-300 block">⚠️ Medições a Confirmar com Paquímetro:</strong>
                  <ul className="list-disc list-inside">
                    {comp.inferredDimensions.map((inf: string, i: number) => (
                      <li key={i}>{inf}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-[10px] text-inst-muted font-ui pt-1 border-t border-inst-border flex items-center justify-between gap-2">
                <div className="truncate">
                  <strong className="text-inst-secondary">Substituição:</strong> {comp.replacementInstructions}
                </div>
                <button
                  onClick={() => onSelectTab('3d')}
                  className="text-fuelguard-green hover:underline text-[10px] font-mono shrink-0"
                >
                  [Inspecionar 3D]
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
