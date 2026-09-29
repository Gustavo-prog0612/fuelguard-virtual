import React, { useState } from 'react';
import { 
  Waves, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Box,
  Clock,
  Check
} from 'lucide-react';
import { AppRoute } from '@/types/navigation';

interface OverviewViewProps {
  onNavigate?: (route: AppRoute) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate }) => {
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days'>('today');

  return (
    <div className="p-5 md:p-8 space-y-6 overflow-y-auto h-full bg-[#F4F5F7] dark:bg-slate-950 font-ui select-none">
      {/* 1. Header do Dashboard (Permity Style): Saudação + Badge de Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bom dia, Gustavo
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF9A5] dark:bg-lime-950/70 text-[#1E3A0F] dark:text-lime-300 border border-[#CDEB65] dark:border-lime-700/60 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#588000] dark:text-lime-400" />
            <span>4 itens sob auditoria ativa</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate?.('bench')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs shadow-sm transition"
          >
            <Box className="w-3.5 h-3.5" />
            <span>Abrir Bancada 3D</span>
          </button>
        </div>
      </div>

      {/* 2. Top Grid: 4 Cards Principais (Exatamente como 00:00 no Vídeo da Permity) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5">
        {/* Card 1 (Hero Project Card - "1254 Oak Street" no vídeo): 3.5 colunas */}
        <div className="xl:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Visual Header com Thumbnail e Badges */}
            <div className="relative w-full h-32 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/60 p-3 flex flex-col justify-between overflow-hidden shadow-inner">
              {/* Background Geometric Effect */}
              <div className="absolute -right-4 -bottom-4 w-28 h-28 rounded-full bg-[#D4F63D]/10 blur-xl pointer-events-none" />
              
              <div className="flex justify-between items-start z-10">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                  PL-2841 • BENCH-MVP
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                  Em Operação
                </span>
              </div>

              <div className="z-10 flex items-center justify-between text-white">
                <div>
                  <div className="text-xs font-bold font-mono">ESP32-S3 + PN532 + SEN0311</div>
                  <div className="text-[10px] text-slate-300">Gêmeo Digital de Bancada</div>
                </div>
                <div className="w-6 h-6 rounded-full bg-[#D4F63D] text-slate-950 flex items-center justify-center font-bold text-xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            </div>

            {/* Title & Location */}
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Bancada de Teste MVP #01
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Laboratório de Engenharia • ESP32-S3 NodeMCU
              </p>
            </div>

            {/* Specs Row */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">Alimentação</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">3.3V / 5.0V LDO</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">Amostragem</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">50 Hz Worker</span>
              </div>
            </div>
          </div>

          {/* Progress Bar (Permity Style) */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600 dark:text-slate-400">Validação Geral</span>
              <span className="font-bold text-slate-900 dark:text-white">83/83 PASS (100%)</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-[#D4F63D] h-2 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        {/* Card 2 (Portfolio / Statistics Card - "Portfolio: 128 Total projects" no vídeo): 4 colunas */}
        <div className="xl:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-4">
          <div>
            {/* Header com Segmented Time Toggle */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Portfólio de Testes & Sinais
              </h2>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-full text-[10px] font-semibold">
                {(['today', '7days', '30days'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-2.5 py-0.5 rounded-full transition ${
                      timeRange === r 
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {r === 'today' ? 'Hoje' : r === '7days' ? '7 dias' : '30 dias'}
                  </button>
                ))}
              </div>
            </div>

            {/* Big Stat Number */}
            <div className="py-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                83
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                verificações automatizadas (16 suítes)
              </span>
            </div>

            {/* 4 Stat Columns (Permity Style) */}
            <div className="grid grid-cols-4 gap-2 py-2 text-center border-y border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="block text-base font-bold text-slate-900 dark:text-white">16</span>
                <span className="text-[10px] text-slate-500 leading-tight block">Mecânica</span>
              </div>
              <div>
                <span className="block text-base font-bold text-slate-900 dark:text-white">8</span>
                <span className="text-[10px] text-slate-500 leading-tight block">DRC / Nets</span>
              </div>
              <div>
                <span className="block text-base font-bold text-slate-900 dark:text-white">28</span>
                <span className="text-[10px] text-slate-500 leading-tight block">Firmware</span>
              </div>
              <div>
                <span className="block text-base font-bold text-slate-900 dark:text-white">31</span>
                <span className="text-[10px] text-slate-500 leading-tight block">Acústica</span>
              </div>
            </div>
          </div>

          {/* Pipeline Stages Progress (Permity Style) */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Distribuição por Domínio
            </span>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 flex overflow-hidden gap-0.5">
              <div className="bg-[#D4F63D] h-full" style={{ width: '20%' }} title="Mecânica (16)" />
              <div className="bg-amber-400 h-full" style={{ width: '10%' }} title="DRC / Nets (8)" />
              <div className="bg-sky-400 h-full" style={{ width: '35%' }} title="Firmware (28)" />
              <div className="bg-emerald-500 h-full" style={{ width: '35%' }} title="Acústica (31)" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span>Fixação 3D</span>
              <span>Regras DRC</span>
              <span>FreeRTOS</span>
              <span>Ultra-som</span>
            </div>
          </div>
        </div>

        {/* Card 3 (Signature Featured Jet-Black AI Card - Permity Style): 3 colunas */}
        <div className="xl:col-span-3 bg-neutral-900 text-white rounded-3xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4F63D]">
              <Sparkles className="w-4 h-4 fill-current" />
              <span>FuelGuard AI</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Gêmeo Digital 100% Sincronizado
            </h2>
            <div className="space-y-2 pt-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4F63D] mt-1.5 flex-shrink-0" />
                <span>0 violações de sobretensão no GPIO do ESP32-S3</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                <span>1 gate ativo: PCB adaptadora aguarda roteamento</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />
                <span>Metrologia bloqueada até medição física de lote</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate?.('cad')}
            className="w-full py-2.5 px-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-[#D4F63D] font-bold text-xs flex items-center justify-center gap-1.5 transition border border-neutral-700 shadow-sm"
          >
            <span>Revisar Central de Riscos DRC</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4 (Package Compliance Gauge Card - "Package compliance: 94%" no vídeo): 2.5 colunas */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col items-center justify-between text-center space-y-3">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Conformidade Geral
          </h2>

          {/* SVG Circular Radial Gauge (Permity Style) */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Foreground Arc in Electric Lime */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-[#D4F63D]"
                strokeWidth="10"
                strokeDasharray="251.2"
                strokeDashoffset="10.0"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                96<span className="text-sm font-semibold">%</span>
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase">SCORE</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            <strong className="text-slate-800 dark:text-slate-200 block">83/83 verificações</strong>
            <span>Contratos canônicos OK</span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Section: "Needs Attention" Table Card (Exatamente como 00:01 - 00:02 no vídeo da Permity) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4">
        {/* Table Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Itens de Atenção & Gates Técnicos
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              4 itens sinalizados • Verificado em tempo real
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF9A5] dark:bg-lime-950/70 text-[#1E3A0F] dark:text-lime-300 border border-[#CDEB65] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#588000]" />
              <span>Sinalizado por FuelGuard AI</span>
            </span>
          </div>
        </div>

        {/* Clean Modern Table (Permity Style) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 text-[11px] font-semibold border-b border-slate-100 dark:border-slate-800">
                <th className="pb-3 font-medium">Código</th>
                <th className="pb-3 font-medium">Item de Hardware</th>
                <th className="pb-3 font-medium">Fase</th>
                <th className="pb-3 font-medium">Alerta Principal / Condição</th>
                <th className="pb-3 font-medium">Status / Risco</th>
                <th className="pb-3 font-medium text-right">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-ui">
              {/* Linha 1: PCB Adaptadora */}
              <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                <td className="py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                  HW-PCB-01
                </td>
                <td className="py-3.5">
                  <div className="font-bold text-slate-800 dark:text-slate-200">Placa Adaptadora FuelGuard</div>
                  <div className="text-[10px] text-slate-400 font-mono">Nível B • Em especificação</div>
                </td>
                <td className="py-3.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                    Gate PCB
                  </span>
                </td>
                <td className="py-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-medium">
                    <Clock className="w-3 h-3 text-amber-700" />
                    <span>Aguardando roteamento de cobre real</span>
                  </span>
                </td>
                <td className="py-3.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                    Médio
                  </span>
                </td>
                <td className="py-3.5 text-right font-mono text-slate-400">
                  29 Set
                </td>
              </tr>

              {/* Linha 2: Tanque de Acrílico */}
              <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                <td className="py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                  TANK-CYL-01
                </td>
                <td className="py-3.5">
                  <div className="font-bold text-slate-800 dark:text-slate-200">Tanque FG-TANK-5L-CYL-R1</div>
                  <div className="text-[10px] text-slate-400 font-mono">Acrílico 3mm • Ø200 × 160 mm</div>
                </td>
                <td className="py-3.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                    Metrologia
                  </span>
                </td>
                <td className="py-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-300 text-[11px] font-medium">
                    <Waves className="w-3 h-3 text-sky-700" />
                    <span>Curva de calibração física pendente</span>
                  </span>
                </td>
                <td className="py-3.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 font-bold text-[10px]">
                    Aviso
                  </span>
                </td>
                <td className="py-3.5 text-right font-mono text-slate-400">
                  29 Set
                </td>
              </tr>

              {/* Linha 3: Reed Switch MC-38 */}
              <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                <td className="py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                  SENS-MC38-01
                </td>
                <td className="py-3.5">
                  <div className="font-bold text-slate-800 dark:text-slate-200">Sensor Magnético MC-38</div>
                  <div className="text-[10px] text-slate-400 font-mono">Intertravamento de tampa</div>
                </td>
                <td className="py-3.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                    Aferição Lote
                  </span>
                </td>
                <td className="py-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-medium">
                    <AlertTriangle className="w-3 h-3 text-amber-700" />
                    <span>Gap e contato NO/NC dependente do lote</span>
                  </span>
                </td>
                <td className="py-3.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                    Médio
                  </span>
                </td>
                <td className="py-3.5 text-right font-mono text-slate-400">
                  28 Set
                </td>
              </tr>

              {/* Linha 4: DFRobot A02YYUW */}
              <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                <td className="py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                  SENS-A02-01
                </td>
                <td className="py-3.5">
                  <div className="font-bold text-slate-800 dark:text-slate-200">DFRobot A02YYUW / SEN0311</div>
                  <div className="text-[10px] text-slate-400 font-mono">Ultrassônico UART TTL 9600</div>
                </td>
                <td className="py-3.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                    Validação
                  </span>
                </td>
                <td className="py-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-lime-100 text-lime-900 border border-lime-300 text-[11px] font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    <span>Alimentação 3.3V e retorno GND validados</span>
                  </span>
                </td>
                <td className="py-3.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-lime-50 text-lime-800 border border-lime-200 font-bold text-[10px]">
                    Baixo
                  </span>
                </td>
                <td className="py-3.5 text-right font-mono text-slate-400">
                  28 Set
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
          <span>Exibindo 4 de 4 gates técnicos ativos</span>
          <button
            onClick={() => onNavigate?.('cad')}
            className="font-bold text-slate-800 dark:text-slate-200 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 transition"
          >
            <span>Ver Lista de Materiais & Gates na Estação CAD</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
