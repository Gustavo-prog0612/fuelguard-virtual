import React, { useState, useRef, useEffect } from 'react';
import { 
  Trash2, 
  Download, 
  Upload,
  Clock,
  Search,
  Copy,
  Check,
  Wifi,
  WifiOff,
  Database,
  FileText,
  Terminal,
  Activity
} from 'lucide-react';
import { HonestyBadge } from '@/ui/components/badges/HonestyBadge';
import { useSimulation } from '@/core/worker/use-simulation';
import { globalSimulationBridge } from '@/core/worker/worker-bridge';
import { idbStorage, TelemetrySession } from '@/persistence/idb-storage';
import {
  createExportPackage,
  downloadExportPackage,
  parseAndValidatePackage,
} from '@/persistence/json-exporter';

export const EventsView: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [dbNotice, setDbNotice] = useState<string | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sim = useSimulation();

  const initialLogs = [
    { time: '00:00.000', level: 'SYSTEM', msg: '[SYSTEM] ESP32-S3 WROOM-1 boot complete (FreeRTOS v10.4.3). Relógio sincronizado.' },
    { time: '00:00.020', level: 'INFO', msg: '[FW] Periféricos inicializados: SPI (PN532 @ 4MHz), UART1 SEN0311 (GPIO16 RX), GPIO7 (Reed), GPIO14 (buzzer).' },
    { time: '00:00.200', level: 'INFO', msg: '[FW] SEN0311 UART: dist=80mm quality=VALID -> Median=80mm h=8.0cm vol=3.2L' },
  ];

  const displayLogs = sim.uartLogs.length > 0 ? sim.uartLogs : initialLogs;

  // Filtragem combinada por nível e texto de busca
  const filteredLogs = displayLogs.filter((l) => {
    const matchesLevel = filterType === 'ALL' || l.level === filterType;
    const matchesSearch =
      searchQuery.trim() === '' ||
      l.msg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.level.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [displayLogs, autoScroll]);

  // Exportar Pacote JSON Canônico
  const handleExportJson = () => {
    const pkg = createExportPackage({
      events: sim.events,
      uartLogs: displayLogs,
      simTimeMs: sim.simTimeMs,
    });
    downloadExportPackage(pkg, `fuelguard_dossie_telemetria_${Date.now()}.json`);
  };

  // Exportar texto simples .log
  const handleExportTxtLog = () => {
    const text = displayLogs.map((l) => `[${l.time}] [${l.level}] ${l.msg}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuelguard_uart_${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copiar logs para área de transferência
  const handleCopyLogs = () => {
    const text = filteredLogs.map((l) => `[${l.time}] [${l.level}] ${l.msg}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Salvar sessão no IndexedDB local
  const handleSaveToIdb = async () => {
    const session: TelemetrySession = {
      id: `session_${Date.now()}`,
      title: `Ensaio Didático #${Date.now().toString().slice(-4)}`,
      startTime: new Date().toISOString(),
      durationMs: sim.simTimeMs,
      totalEvents: sim.events.length,
      events: sim.events,
      uartLogs: displayLogs,
    };

    try {
      await idbStorage.saveSession(session);
      setDbNotice('✓ Sessão salva com sucesso no IndexedDB local!');
      setTimeout(() => setDbNotice(null), 3500);
    } catch (err: any) {
      setDbNotice(`Erro ao salvar no IndexedDB: ${err.message}`);
      setTimeout(() => setDbNotice(null), 4000);
    }
  };

  // Importar JSON canônico
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const pkg = parseAndValidatePackage(content);
        setDbNotice(
          `✓ Dossiê importado com sucesso! (${pkg.summary.total_events} eventos, ${pkg.summary.total_logs} logs)`
        );
        setTimeout(() => setDbNotice(null), 5000);
      } catch (err: any) {
        alert(`Erro na validação do pacote: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F5F7] dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-ui overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Topo com Título e Ações de Exportação/Persistência (Permity Card) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" />
            <h1 className="text-sm font-display font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              Estação de Eventos & Console Serial UART
            </h1>
            <HonestyBadge level="simulado" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Monitor de telemetria serial a 115200 baud idêntico à saída do ESP32-S3, barramento com ordenação cronológica estrita e persistência offline local em IndexedDB.
          </p>
        </div>

        {/* Barra de Ações Rápidas (Permity Pills) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Botão de Rede: Online / Offline */}
          <button
            onClick={sim.toggleTransport}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-mono font-medium flex items-center gap-1.5 transition shadow-xs ${
              sim.isOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400'
                : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-400 font-bold'
            }`}
            title="Alterna conexão simulada de rede Wi-Fi / MQTT"
          >
            {sim.isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5 text-amber-500 animate-pulse" />}
            <span>{sim.isOnline ? 'Rede Online' : 'Rede Offline (Fila Ativa)'}</span>
          </button>

          {/* Salvar no IndexedDB */}
          <button
            onClick={handleSaveToIdb}
            className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-mono font-medium flex items-center gap-1.5 transition shadow-xs"
            title="Persiste a sessão de ensaio atual no banco local IndexedDB"
          >
            <Database className="w-3.5 h-3.5 text-sky-500" />
            <span>Salvar IDB</span>
          </button>

          {/* Importar Dossiê JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-mono font-medium flex items-center gap-1.5 transition shadow-xs"
            title="Importar e validar arquivo .json canônico (schema_version: 1)"
          >
            <Upload className="w-3.5 h-3.5 text-purple-500" />
            <span>Importar</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />

          {/* Exportar Dossiê JSON */}
          <button 
            onClick={handleExportJson}
            className="px-3.5 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-mono font-medium flex items-center gap-1.5 transition shadow-xs"
            title="Baixar arquivo JSON completo com eventos, logs e metadados"
          >
            <Download className="w-3.5 h-3.5 text-[#D4F63D]" />
            <span>Exportar JSON</span>
          </button>
        </div>
      </div>

      {/* Notificação Toast do IndexedDB */}
      {dbNotice && (
        <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-200 px-4 py-2.5 rounded-2xl text-xs font-mono flex items-center justify-between shadow-xs">
          <span>{dbNotice}</span>
          <button onClick={() => setDbNotice(null)} className="text-emerald-400 hover:text-white font-bold ml-4">✕</button>
        </div>
      )}

      {/* Grid: Console Serial & Linha do Tempo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Console Serial UART (8 Colunas) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800 gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${sim.isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  Terminal Interativo
                </span>
                <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                  (UART0 115200 8N1)
                </span>
              </div>

              {/* Filtros por Nível (Pills) */}
              <div className="flex items-center space-x-1 pl-2 border-l border-slate-200 dark:border-slate-800">
                {['ALL', 'INFO', 'WARN', 'DEBUG', 'SYSTEM'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setFilterType(lvl)}
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full transition ${
                      filterType === lvl
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Ações do Terminal */}
            <div className="flex items-center space-x-2">
              {/* Barra de Busca (Pill) */}
              <div className="relative flex items-center">
                <Search className="w-3 h-3 absolute left-2.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filtrar logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 pr-3 py-1 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-full text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-slate-400 w-28 sm:w-40 transition"
                />
              </div>

              {/* Copiar Logs */}
              <button
                onClick={handleCopyLogs}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
                title="Copiar mensagens exibidas"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {/* Exportar .log */}
              <button
                onClick={handleExportTxtLog}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
                title="Baixar arquivo de texto .log"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>

              {/* Auto-scroll */}
              <label className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded-xs accent-neutral-900 dark:accent-white"
                />
                Scroll
              </label>

              {/* Limpar */}
              <button 
                onClick={() => globalSimulationBridge.send({ type: 'RESET' })}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-full transition"
                title="Limpar e Reiniciar Console"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Área do Terminal de Texto */}
          <div
            ref={logContainerRef}
            className="h-96 overflow-y-auto bg-slate-950 rounded-2xl p-4 font-mono text-xs space-y-1.5 text-slate-100 border border-slate-800/80 shadow-inner"
          >
            {filteredLogs.length > 0 ? (
              filteredLogs.map((l, idx) => (
                <div key={idx} className="flex items-start space-x-2 hover:bg-slate-900/80 px-2 py-0.5 rounded-lg transition">
                  <span className="text-slate-500 text-[11px] flex-shrink-0 select-none font-medium">{l.time}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold flex-shrink-0 ${
                    l.level === 'INFO' ? 'bg-sky-950/80 text-sky-400 border border-sky-800/80' :
                    l.level === 'WARN' ? 'bg-amber-950/80 text-amber-400 border border-amber-800/80' :
                    l.level === 'DEBUG' ? 'bg-purple-950/80 text-purple-400 border border-purple-800/80' :
                    'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                  }`}>
                    {l.level}
                  </span>
                  <span className="text-slate-300 break-all leading-relaxed">{l.msg}</span>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
                Nenhum registro corresponde aos filtros selecionados.
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-200/80 dark:border-slate-800">
            <span>Buffer: {displayLogs.length} linhas / 1000 máx</span>
            <span>Filtro ativo: {filteredLogs.length} exibidos</span>
            <span>Taxa: 115200 baud • Paridade: 8N1</span>
          </div>
        </div>

        {/* Linha do Tempo de Eventos Ordenada (4 Colunas) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200/80 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-display font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#7c3aed]" />
              Linha do Tempo Monotônica
            </h2>
            <span className="text-[10px] font-mono text-slate-500 font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">seq + ms</span>
          </div>

          <div className="space-y-2 text-xs font-mono max-h-96 overflow-y-auto pr-1">
            {(sim.events.length > 0 ? sim.events.slice(-6).reverse() : [
              { seq: 42, sim_time_ms: 14200, kind: 'tank.level_update', payload: { percentage: 50.0, water_height_cm: 8.0, volume_liters: 3.2 } },
              { seq: 41, sim_time_ms: 12100, kind: 'nfc.tag_read', payload: { uid: '04:3A:7F:2C:5D', operator_name: 'Operador Didático' } },
              { seq: 40, sim_time_ms: 8050, kind: 'lid.state_change', payload: { is_open: false, bounces_count: 12 } },
              { seq: 39, sim_time_ms: 0, kind: 'clock.tick', payload: { delta_ms: 20 } },
            ]).map((e: any) => (
              <div key={e.seq} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span className="font-bold text-slate-600 dark:text-slate-300">#{e.seq} • {e.kind}</span>
                  <span className="font-mono text-slate-400">{(e.sim_time_ms / 1000).toFixed(2)}s</span>
                </div>
                <div className="text-[11px] text-slate-800 dark:text-slate-200 font-medium truncate">
                  {e.kind === 'tank.level_update' && `Nível: ${e.payload.percentage}% (${e.payload.water_height_cm?.toFixed(1)} cm, ${e.payload.volume_liters} L)`}
                  {e.kind === 'nfc.tag_read' && `NFC Autorizado: ${e.payload.uid} (${e.payload.operator_name})`}
                  {e.kind === 'nfc.denied' && `NFC REJEITADO: ${e.payload.uid}`}
                  {e.kind === 'lid.state_change' && `Tampa ${e.payload.is_open ? 'Aberta' : 'Fechada'} (após debounce)`}
                  {e.kind === 'circuit.fault_injected' && `FALHA INJETADA: ${e.payload.name}`}
                  {e.kind === 'transport.status' && `Wi-Fi ${e.payload.is_online ? 'Online' : 'Offline'}`}
                  {e.kind === 'clock.tick' && `Sincronismo de relógio (delta=${e.payload.delta_ms}ms)`}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-400 space-y-2">
            <div className="flex justify-between font-mono">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                Status do Transporte:
              </span>
              <strong className={sim.isOnline ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-amber-500 font-bold'}>
                {sim.isOnline ? 'Sincronizado (Online)' : 'Fila Offline Ativa'}
              </strong>
            </div>
            <div className="flex justify-between font-mono">
              <span>Fila de Retenção:</span>
              <strong className={sim.isOnline ? 'text-slate-400' : 'text-amber-500'}>
                {sim.isOnline ? '0 pendentes' : 'Acumulando eventos...'}
              </strong>
            </div>
            <div className="flex justify-between font-mono">
              <span>Schema Version:</span>
              <strong className="text-slate-900 dark:text-white">1 (Canônico)</strong>
            </div>
            <div className="flex justify-between font-mono">
              <span>Persistência:</span>
              <strong className="text-slate-900 dark:text-white">IndexedDB Offline</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
