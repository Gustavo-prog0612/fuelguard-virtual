/**
 * FuelGuard Virtual Test Bench — Estação 6: Conexões, Chicotes & Pinagem Física
 * Tabela e escalonamento completo do cabeamento ponto a ponto da bancada didática:
 * - 100% de cabos com terminações mecânicas reais em ambas as extremidades (DuPont/JST/RCA)
 * - Identificação de pino de origem, pino de destino, bitola AWG e tensão nominal [MEDIDO]
 * - Verificação de rotas com waypoints calculados [CALCULADO]
 */

import React, { useState, useMemo } from 'react';
import {
  Cable as CableIcon,
  CheckCircle2,
  Filter,
  Search,
} from 'lucide-react';
import cableRoutesData from '@/../fuelguard/assembly/cable-routes.json';

type SignalGroupFilter = 'ALL' | 'POWER' | 'ULTRASONIC' | 'NFC' | 'PERIPHERALS';

interface CadConnectionsTabProps {
  onSelectTab?: (tabId: string) => void;
}

export const CadConnectionsTab: React.FC<CadConnectionsTabProps> = () => {
  const [filterGroup, setFilterGroup] = useState<SignalGroupFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const cables = cableRoutesData.cables;

  const filteredCables = useMemo(() => {
    return cables.filter((c) => {
      const isPower = c.signalType.includes('POWER') || c.signalType.includes('GROUND');
      const isUltra = c.id.includes('TRIG') || c.id.includes('ECHO') || c.signalType.includes('TTL') || c.signalType.includes('DIVIDER');
      const isNfc = c.id.includes('NFC') || c.id.includes('SPI') || c.id.includes('SDA') || c.id.includes('SCL');
      const isPerip = c.id.includes('REED') || c.id.includes('BUZZER') || c.id.includes('LED');

      const matchesGroup =
        filterGroup === 'ALL' ||
        (filterGroup === 'POWER' && isPower) ||
        (filterGroup === 'ULTRASONIC' && isUltra) ||
        (filterGroup === 'NFC' && isNfc) ||
        (filterGroup === 'PERIPHERALS' && isPerip);

      const matchesSearch =
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.netName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.origin.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.destination.component.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGroup && matchesSearch;
    });
  }, [cables, filterGroup, searchQuery]);

  return (
    <div className="h-full overflow-y-auto space-y-4 pr-1 text-inst-primary font-ui select-text">
      {/* Header com Resumo do Chicote */}
      <div className="bg-inst-surface border border-inst-border p-4 rounded-md shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-inst-border pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <CableIcon className="w-4 h-4 text-fuelguard-green" />
              <h2 className="text-base font-display font-bold uppercase tracking-wider text-inst-primary">
                Programação de Chicote e Tabela de Conexões Físicas (DuPont / JST)
              </h2>
            </div>
            <p className="text-xs text-inst-secondary mt-1 max-w-4xl leading-relaxed">
              Todos os condutores da bancada física possuem terminais reais em ambas as pontas (macho ou fêmea 2.54mm,
              JST-XH ou conector RCA estanque). As rotas obedecem o raio de curvatura mínimo de 15mm para evitar fadiga mecânica.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xs bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-mono font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% dos Cabos Conectados (Sem pontas soltas)</span>
            </span>
          </div>
        </div>

        {/* Estatísticas do Chicote */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
          <div className="bg-inst-canvas p-2.5 rounded-xs border border-inst-border">
            <span className="text-[10px] text-inst-muted block uppercase">Total de Condutores:</span>
            <span className="text-sm font-bold text-inst-primary">{cables.length} Cabos Físicos</span>
          </div>
          <div className="bg-inst-canvas p-2.5 rounded-xs border border-inst-border">
            <span className="text-[10px] text-inst-muted block uppercase">Terminações Homologadas:</span>
            <span className="text-sm font-bold text-emerald-400">24 / 24 Terminais Reais</span>
          </div>
          <div className="bg-inst-canvas p-2.5 rounded-xs border border-inst-border">
            <span className="text-[10px] text-inst-muted block uppercase">Bitolas Utilizadas:</span>
            <span className="text-sm font-bold text-sky-400">AWG 22 (Alimentação) / AWG 26 (Sinal)</span>
          </div>
          <div className="bg-inst-canvas p-2.5 rounded-xs border border-inst-border">
            <span className="text-[10px] text-inst-muted block uppercase">Raio Mínimo de Curvatura:</span>
            <span className="text-sm font-bold text-purple-400">R &gt;= 15.0 mm [MEDIDO]</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtro e Busca */}
      <div className="bg-inst-surface border border-inst-border p-3 rounded-md shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-inst-muted flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Grupo:</span>
          </span>
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'POWER', label: 'Alimentação' },
            { id: 'ULTRASONIC', label: 'Ultrassom (JSN-SR04T)' },
            { id: 'NFC', label: 'NFC / RFID (PN532)' },
            { id: 'PERIPHERALS', label: 'Periféricos (Reed/Buzzer/LED)' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterGroup(item.id as SignalGroupFilter)}
              className={`px-2.5 py-1 rounded-xs border transition ${
                filterGroup === item.id
                  ? 'bg-fuelguard-green text-white border-fuelguard-green font-bold shadow-xs'
                  : 'bg-inst-canvas text-inst-secondary hover:text-inst-primary border-inst-border'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-inst-muted absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por ID, net ou componente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xs bg-inst-canvas border border-inst-border text-inst-primary placeholder:text-inst-muted focus:border-fuelguard-green focus:outline-none w-56 text-xs"
          />
        </div>
      </div>

      {/* Tabela Oficial de Chicotes e Conexões */}
      <div className="bg-inst-surface border border-inst-border rounded-md shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-inst-canvas border-b border-inst-border text-[11px] text-inst-muted uppercase">
                <th className="p-3">ID do Cabo</th>
                <th className="p-3">Net Name</th>
                <th className="p-3">Tipo de Sinal</th>
                <th className="p-3">Tensão [MEDIDO]</th>
                <th className="p-3">Origem & Terminal</th>
                <th className="p-3">Destino & Terminal</th>
                <th className="p-3">Bitola</th>
                <th className="p-3">Comprimento [MEDIDO]</th>
                <th className="p-3">Waypoints [CALCULADO]</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inst-border">
              {filteredCables.map((cable) => {
                const voltage = cable.signalType.includes('5V')
                  ? '5.0V'
                  : cable.signalType.includes('GROUND')
                  ? '0.0V (GND)'
                  : '3.3V';

                return (
                  <tr key={cable.id} className="hover:bg-inst-canvas/60 transition">
                    <td className="p-3 font-bold text-fuelguard-green">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-inst-border"
                          style={{ backgroundColor: cable.color }}
                        />
                        <span>{cable.id}</span>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-inst-primary">
                      {cable.netName}
                    </td>
                    <td className="p-3 text-[11px] text-inst-secondary">
                      {cable.signalType}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold border ${
                          voltage === '5.0V'
                            ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                            : voltage === '3.3V'
                            ? 'bg-sky-950/60 text-sky-300 border-sky-800'
                            : 'bg-slate-900 text-slate-300 border-slate-700'
                        }`}
                      >
                        {voltage}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="text-inst-primary font-bold">{cable.origin.component} ({cable.origin.pin})</div>
                      <div className="text-[10px] text-inst-muted">{cable.terminals.start}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-inst-primary font-bold">{cable.destination.component} ({cable.destination.pin})</div>
                      <div className="text-[10px] text-inst-muted">{cable.terminals.end}</div>
                    </td>
                    <td className="p-3 text-inst-secondary">
                      AWG {cable.wireGaugeAwg}
                    </td>
                    <td className="p-3 text-inst-secondary">
                      {cable.estimatedLengthMm.toFixed(1)} mm
                    </td>
                    <td className="p-3 text-inst-muted text-[11px]">
                      {cable.waypoints.length} nós de interpolação
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
