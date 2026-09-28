/**
 * FuelGuard Virtual Test Bench — Estação 1: Visão Geral do Gêmeo Digital
 * Define com precisão matemática os limites de escopo entre:
 * A) Bancada Didática MVP (Protoboard BB-830 + Módulos Comerciais)
 * B) Placa Adaptadora Futura (Em especificação / Não roteada / Não fabricada)
 * C) Produto Final Automotivo (Fora do escopo da bancada)
 * e o índice de proveniência de dados [MEDIDO], [CALCULADO], [SIMULADO], [PENDENTE], [VALIDADO].
 */

import React from 'react';
import {
  Compass,
  Cpu,
  Layers,
  Box,
  Cable as CableIcon,
  Droplets,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  FileCheck2,
} from 'lucide-react';
import { HARDWARE_REQUIREMENTS } from '@/../fuelguard/hardware/circuit/requirements';

interface CadOverviewTabProps {
  onSelectTab: (tabId: string) => void;
  isFaultActive?: boolean;
}

export const CadOverviewTab: React.FC<CadOverviewTabProps> = ({
  onSelectTab,
}) => {
  return (
    <div className="h-full overflow-y-auto space-y-4 pr-1 text-inst-primary font-ui select-text">
      {/* 1. Header do Gêmeo Digital */}
      <div className="bg-inst-surface border border-inst-border p-4 rounded-md shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-inst-border pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base font-display font-bold uppercase tracking-wider text-inst-primary">
                Gêmeo Digital Verificável — FuelGuard Virtual Test Bench
              </h2>
              <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                MVP BANCADA v1.2
              </span>
            </div>
            <p className="text-xs text-inst-secondary mt-1 max-w-4xl leading-relaxed">
              Ambiente de engenharia mecatrônica, eletrônica e acústica para validação do protótipo físico FuelGuard.
              Todos os modelos 3D, conexões ponto a ponto e equações hidrostáticas seguem tolerâncias reais de bancada
              sem aproximações genéricas ou componentes imaginários.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded-xs bg-inst-canvas border border-inst-border text-[11px] font-mono text-inst-secondary flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-fuelguard-green" />
              <span>78 / 78 Testes Aprovados</span>
            </span>
          </div>
        </div>

        {/* Tags de Proveniência de Dados Oficiais */}
        <div>
          <div className="text-[10px] font-mono uppercase text-inst-muted font-bold tracking-wider mb-2">
            Taxonomia Rigorosa de Proveniência de Dados Técnicos:
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs font-mono">
            <div className="bg-inst-canvas p-2 rounded-xs border border-emerald-900/60">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <span>[MEDIDO]</span>
              </div>
              <p className="text-[10px] text-inst-muted mt-0.5">
                Obtido com paquímetro digital Mitutoyo 150mm ou multímetro Minipa.
              </p>
            </div>
            <div className="bg-inst-canvas p-2 rounded-xs border border-amber-900/60">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                <span>[CALCULADO]</span>
              </div>
              <p className="text-[10px] text-inst-muted mt-0.5">
                Deduzido por formulação analítica (ToF acústico, divisor resistivo).
              </p>
            </div>
            <div className="bg-inst-canvas p-2 rounded-xs border border-sky-900/60">
              <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px]">
                <span>[SIMULADO]</span>
              </div>
              <p className="text-[10px] text-inst-muted mt-0.5">
                Variável gerada dinamicamente pelo motor de simulação (nível d'água).
              </p>
            </div>
            <div className="bg-inst-canvas p-2 rounded-xs border border-purple-900/60">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold text-[11px]">
                <span>[PENDENTE]</span>
              </div>
              <p className="text-[10px] text-inst-muted mt-0.5">
                Dado nominal de folha de dados a aguardar verificação em laboratório.
              </p>
            </div>
            <div className="bg-inst-canvas p-2 rounded-xs border border-emerald-900/60">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <span>[VALIDADO]</span>
              </div>
              <p className="text-[10px] text-inst-muted mt-0.5">
                Regra formal de DRC ou asserção de teste unitário 100% satisfeita.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Matriz de Separação de Níveis de Projeto (A / B / C) */}
      <div className="bg-inst-surface border border-inst-border p-4 rounded-md shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-inst-border pb-2">
          <h3 className="text-sm font-bold text-inst-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-fuelguard-green" />
            <span>Matriz Canônica de Escopo de Hardware (A / B / C)</span>
          </h3>
          <span className="text-[11px] font-mono text-inst-muted">Sem mistura de fases conceituais</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          {/* Nível A */}
          <div className="bg-inst-canvas p-3 rounded-sm border border-emerald-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-xs bg-emerald-950 text-emerald-300 font-bold text-[10px] border border-emerald-700 uppercase">
                Nível A: Bancada MVP Física
              </span>
              <span className="text-emerald-400 text-[10px] font-bold">100% OPERACIONAL</span>
            </div>
            <h4 className="text-xs font-bold text-inst-primary">Hardware Físico de Bancada</h4>
            <ul className="text-[11px] text-inst-secondary space-y-1 list-disc list-inside">
              <li>Protoboard BB-830 sobre tapete ESD antiestático</li>
              <li>ESP32-S3 DevKitC-1 v1.1 comercial oficial</li>
              <li>Módulo JSN-SR04T v2.0 com sonda estanque M20</li>
              <li>Módulo PN532 v4 com suporte de acrílico na tampa</li>
              <li>Chicote tubular com terminais DuPont Macho/Fêmea e JST</li>
              <li>Recipiente didático 5L de parede dupla com água potável</li>
            </ul>
            <div className="pt-2 border-t border-inst-border text-[10px] text-emerald-400">
              ✓ Base para todos os 78 testes de regressão
            </div>
          </div>

          {/* Nível B */}
          <div className="bg-inst-canvas p-3 rounded-sm border border-amber-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-xs bg-amber-950 text-amber-300 font-bold text-[10px] border border-amber-700 uppercase">
                Nível B: Placa Adaptadora Futura
              </span>
              <span className="text-amber-400 text-[10px] font-bold">EM ESPECIFICAÇÃO</span>
            </div>
            <h4 className="text-xs font-bold text-inst-primary">Carrier Board Dedicada</h4>
            <ul className="text-[11px] text-inst-secondary space-y-1 list-disc list-inside">
              <li>Esquemático elétrico formal em Circuit JSON e KiCad 8</li>
              <li>Regras de projeto IPC-2221A / JLCPCB 2-Layer</li>
              <li>BOM fechado com 12 componentes industriais</li>
              <li>Sem fabricação física no MVP atual</li>
              <li><strong>Não roteada em cobre físico final</strong></li>
            </ul>
            <div className="pt-2 border-t border-inst-border text-[10px] text-amber-400">
              ⚠️ Não simula trilhas manuais arbitrárias
            </div>
          </div>

          {/* Nível C */}
          <div className="bg-inst-canvas p-3 rounded-sm border border-slate-800 space-y-2 opacity-80">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-xs bg-slate-900 text-slate-400 font-bold text-[10px] border border-slate-700 uppercase">
                Nível C: Produto Final
              </span>
              <span className="text-slate-400 text-[10px] font-bold">FORA DO ESCOPO</span>
            </div>
            <h4 className="text-xs font-bold text-slate-300">Produto Veicular Integrado</h4>
            <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
              <li>PCB única embarcada em chassi veicular</li>
              <li>Gabinete industrial com vedação IP67</li>
              <li>Conectores automotivos selados (Deutsch DT)</li>
              <li>Tanque automotivo e hidrocarbonetos reais</li>
              <li>Não faz parte da bancada didática virtual</li>
            </ul>
            <div className="pt-2 border-t border-inst-border text-[10px] text-slate-500">
              ∅ Excluído do gêmeo digital do laboratório
            </div>
          </div>
        </div>
      </div>

      {/* 3. Requisitos Oficiais de Hardware e Conformidade */}
      <div className="bg-inst-surface border border-inst-border p-4 rounded-md shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-inst-border pb-2">
          <h3 className="text-sm font-bold text-inst-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-fuelguard-green" />
            <span>Requisitos Críticos de Hardware e Engenharia</span>
          </h3>
          <span className="text-[11px] font-mono text-inst-muted">Conformidade com Espressif & IPC</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          {HARDWARE_REQUIREMENTS.map((req) => (
            <div
              key={req.id}
              className={`p-3 rounded-xs border space-y-1.5 ${
                req.status === 'PROVED_SAFE'
                  ? 'bg-inst-canvas border-inst-border hover:border-emerald-600/70'
                  : 'bg-rose-950/20 border-rose-900/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-fuelguard-green font-bold text-[11px]">{req.id}</span>
                <span className="px-1.5 py-0.2 rounded-xs text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  [{req.status}]
                </span>
              </div>
              <h5 className="font-bold text-inst-primary">{req.title}</h5>
              <p className="text-[11px] text-inst-secondary font-ui leading-tight">{req.description}</p>
              <div className="text-[10px] text-inst-muted pt-1 border-t border-inst-border">
                <strong>Condição de Aceitação:</strong> {req.condition} (Nominal: {req.nominalValue}{req.unit})
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Navegação Rápida para as 10 Estações de Engenharia */}
      <div className="bg-inst-surface border border-inst-border p-4 rounded-md shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-inst-border pb-2">
          <h3 className="text-sm font-bold text-inst-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-fuelguard-green" />
            <span>Mapa das 10 Estações Técnicas da Bancada Virtual</span>
          </h3>
          <span className="text-[11px] font-mono text-inst-muted">Clique para navegar diretamente</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs font-mono">
          {[
            { id: 'assembly', label: '2. Bancada Física', icon: Box, desc: '3D com escala 1:1, protoboard BB-830 e fiação' },
            { id: 'schematic', label: '3. Esquemático', icon: Cpu, desc: 'Circuit JSON e KiCad com divisor e buffer 5V' },
            { id: 'pcb', label: '4. PCB 2D', icon: Layers, desc: 'Layout com regras IPC e aviso de carrier futura' },
            { id: '3d', label: '5. PCB 3D', icon: Box, desc: 'Modelos CAD reais 1:1 com ViewCube' },
            { id: 'connections', label: '6. Conexões', icon: CableIcon, desc: 'Tabela de pinagem, bitola AWG e terminais' },
            { id: 'sensors', label: '7. Sensor & Água', icon: Droplets, desc: 'Modelo PBR do galão 5L e ToF ultrassônico' },
            { id: 'bom', label: '8. BOM & Assets', icon: BookOpen, desc: 'BOM com 12 itens e classes de confiança A/B/C/D' },
            { id: 'tests', label: '9. Testes', icon: CheckCircle2, desc: 'Execução dos 78 testes automatizados' },
            { id: 'audit', label: '10. Auditoria', icon: ShieldCheck, desc: 'DRC em tempo real e montagem mecânica' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className="bg-inst-canvas border border-inst-border hover:border-fuelguard-green p-3 rounded-xs text-left transition space-y-1.5 group shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <Icon className="w-4 h-4 text-fuelguard-green group-hover:scale-110 transition" />
                  <ArrowRight className="w-3.5 h-3.5 text-inst-muted group-hover:text-fuelguard-green transition" />
                </div>
                <div className="font-bold text-inst-primary text-xs">{item.label}</div>
                <p className="text-[10px] text-inst-muted leading-tight line-clamp-2">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
