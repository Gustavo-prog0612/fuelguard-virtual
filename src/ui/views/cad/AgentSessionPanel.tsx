/**
 * FuelGuard Virtual Test Bench — Painel de Sessão do Agente CAD (Agent Session)
 * Inspirado no fluxo moderno de EDA/IA (tscircuit / HeyPCB) mantendo identidade própria
 * de instrumentação obsidiana e didática estrita de água.
 */

import React, { useState } from 'react';
import { 
  Bot, 
  AlertTriangle, 
  Download, 
  Send, 
  Cpu, 
  Box, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Compass,
  Layers
} from 'lucide-react';

interface AgentMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  tags?: string[];
  actionType?: 'fault_inject' | 'drc_run' | 'export_kicad' | 'switch_tab';
}

interface AgentSessionPanelProps {
  onSelectTab: (tab: 'schematic' | 'pcb' | '3d' | 'assembly' | 'drc' | 'catalog') => void;
  onInjectFault: () => void;
  onRestoreSafe: () => void;
  isFaultActive: boolean;
  onExportCircuitJson: () => void;
  onExportKiCadSch: () => void;
  onExportKiCadPcb: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const AgentSessionPanel: React.FC<AgentSessionPanelProps> = ({
  onSelectTab,
  onInjectFault,
  onRestoreSafe,
  isFaultActive,
  onExportCircuitJson,
  onExportKiCadSch,
  onExportKiCadPcb,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [inputVal, setInputVal] = useState<string>('');
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'm1',
      sender: 'system',
      text: 'Inicializado subsistema tscircuit IR v1.0.0. Carrier board 180×120mm configurada com ESP32-S3 e condicionadores de sinal.',
      timestamp: '14:20:01',
      tags: ['SYS', 'INIT'],
    },
    {
      id: 'm2',
      sender: 'agent',
      text: 'Bancada didática nominal carregada. Níveis lógicos seguros validados: 3.3V GPIO6 com atenuação via divisor 10k/15k e disparo 5V via buffer 74AHCT125.',
      timestamp: '14:20:05',
      tags: ['EDA', 'SAFE'],
    },
  ]);

  const handleSendPrompt = (promptText?: string) => {
    const text = promptText || inputVal;
    if (!text.trim()) return;

    const userMsg: AgentMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptText) setInputVal('');

    // Resposta inteligente do agente conforme o prompt
    setTimeout(() => {
      const lower = text.toLowerCase();
      let responseText = '';
      let tags = ['AGENT'];

      if (lower.includes('drc') || lower.includes('auditoria') || lower.includes('verificar')) {
        onSelectTab('drc');
        responseText = isFaultActive
          ? 'ALERTA DRC: Detectada violação fatal DRC-01! Tensão de 5.0V conectada diretamente ao GPIO6 do ESP32-S3 sem atenuação.'
          : 'Auditoria DRC executada: 0 violações críticas. Todos os pinos estão dentro das margens elétricas seguras da Espressif.';
        tags = ['DRC', isFaultActive ? 'ERROR' : 'PASS'];
      } else if (lower.includes('curto') || lower.includes('falha') || lower.includes('5v')) {
        onInjectFault();
        onSelectTab('drc');
        responseText = 'Injeção de falha executada: Linha de 5V do sensor JSN conectada diretamente ao pino IO6 do ESP32-S3. DRC agora acusa risco de dano por sobretensão.';
        tags = ['FAULT', 'HAZARD'];
      } else if (lower.includes('restaurar') || lower.includes('nominal') || lower.includes('seguro')) {
        onRestoreSafe();
        onSelectTab('schematic');
        responseText = 'Topologia restaurada para fiação nominal segura com divisor de tensão resistivo (3.00V máx no GPIO6).';
        tags = ['SAFE', 'NOMINAL'];
      } else if (lower.includes('3d') || lower.includes('gemeo') || lower.includes('placa 3d')) {
        onSelectTab('3d');
        responseText = 'Alternado para visualização do Gêmeo 3D (WebGL / Three.js). Explore a rotação espacial com o ViewCube ou o mouse.';
        tags = ['3D', 'VIEW'];
      } else if (lower.includes('esquematico') || lower.includes('diagrama')) {
        onSelectTab('schematic');
        responseText = 'Exibindo esquemático vetorial unificado com simbologia IEC e zonas funcionais isoladas.';
        tags = ['SCH', 'EDA'];
      } else if (lower.includes('pcb') || lower.includes('layout')) {
        onSelectTab('pcb');
        responseText = 'Exibindo layout de PCB 2D em FR-4 com camadas Top Copper, Serigrafia, Máscara e Vias.';
        tags = ['PCB', '2D'];
      } else if (lower.includes('montagem') || lower.includes('assembly') || lower.includes('galão') || lower.includes('bancada')) {
        onSelectTab('assembly');
        responseText = 'Alternado para a Montagem Física 3D da Bancada (Assembly View). Visualizando arranjo real com protoboard, ESP32-S3 DevKitC-1 v1.1, galão com água translúcida, sonda JSN e jumpers 3D.';
        tags = ['ASSEMBLY', '3D'];
      } else if (lower.includes('circuit json') || lower.includes('json')) {
        onExportCircuitJson();
        responseText = 'Pacote canônico Circuit JSON gerado e exportado com sucesso.';
        tags = ['EXPORT', 'JSON'];
      } else if (lower.includes('pcb') && lower.includes('kicad')) {
        onExportKiCadPcb();
        responseText = 'Layout KiCad PCB (.kicad_pcb) gerado e exportado com sucesso.';
        tags = ['EXPORT', 'KICAD_PCB'];
      } else if (lower.includes('kicad')) {
        onExportKiCadSch();
        responseText = 'Gerado e baixado arquivo KiCad 8/9 demonstrativo (.kicad_sch). Arquivo pronto para importação no KiCad EDA.';
        tags = ['EXPORT', 'KICAD_SCH'];
      } else {
        responseText = `Comando interpretado pelo motor tscircuit: "${text}". Estado atualizado no grafo de conexões.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'agent',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          tags: tags,
        },
      ]);
    }, 400);
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-inst-surface border-r border-inst-border flex flex-col items-center py-4 space-y-4 select-none shrink-0 transition-all">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-xs bg-inst-canvas border border-inst-border hover:border-fuelguard-green text-inst-secondary hover:text-inst-primary transition"
          title="Expandir Painel de Sessão do Agente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="flex-1 flex flex-col items-center justify-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-inst-muted -rotate-90 whitespace-nowrap">
            AGENT SESSION
          </span>
        </div>
        <div className="w-2.5 h-2.5 rounded-full bg-fuelguard-green animate-pulse" title="Agente Online" />
      </div>
    );
  }

  return (
    <div className="w-80 md:w-88 bg-inst-surface border-r border-inst-border flex flex-col h-full select-none shrink-0 text-inst-primary font-ui transition-all">
      {/* 1. Cabeçalho macOS Dot Style */}
      <div className="p-3 border-b border-inst-border bg-[#0b0f15] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Pontos macOS */}
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] border border-[#dc2626]/40 shadow-xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] border border-[#d97706]/40 shadow-xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] border border-[#059669]/40 shadow-xs" />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-inst-primary ml-2 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-fuelguard-green" />
            AGENT SESSION
          </span>
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-xs hover:bg-inst-subtle text-inst-muted hover:text-inst-primary transition"
          title="Recolher Painel"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Prompts Rápidos de Ação (Presets) */}
      <div className="p-3 border-b border-inst-border bg-[#0e141c]/50 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-inst-muted">
          <span className="uppercase tracking-wider">Ações Rápidas EDA</span>
          <Sparkles className="w-3 h-3 text-fuelguard-green" />
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
          <button
            onClick={() => handleSendPrompt('Verificar auditoria DRC de níveis lógicos')}
            className="p-1.5 text-left rounded-xs bg-inst-canvas border border-inst-border hover:border-fuelguard-green hover:text-fuelguard-green transition flex items-center gap-1.5 truncate"
          >
            <ShieldCheck className="w-3 h-3 shrink-0 text-emerald-400" />
            <span className="truncate">Auditar DRC</span>
          </button>
          <button
            onClick={() => handleSendPrompt(isFaultActive ? 'Restaurar topologia nominal segura' : 'Injetar falha de sobretensão 5V no GPIO6')}
            className={`p-1.5 text-left rounded-xs border transition flex items-center gap-1.5 truncate ${
              isFaultActive 
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:border-emerald-600'
                : 'bg-rose-950/40 border-rose-800 text-rose-300 hover:border-rose-600'
            }`}
          >
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span className="truncate">{isFaultActive ? 'Sanar Falha' : 'Injetar 5V'}</span>
          </button>
          <button
            onClick={() => handleSendPrompt('Exibir montagem física 3D da bancada com galão e fiação')}
            className="p-1.5 text-left rounded-xs bg-inst-canvas border border-inst-border hover:border-emerald-500 hover:text-emerald-400 transition flex items-center gap-1.5 truncate"
          >
            <Compass className="w-3 h-3 shrink-0 text-emerald-400" />
            <span className="truncate">Montagem 3D</span>
          </button>
          <button
            onClick={() => handleSendPrompt('Exibir Gêmeo 3D da placa com ViewCube')}
            className="p-1.5 text-left rounded-xs bg-inst-canvas border border-inst-border hover:border-sky-500 hover:text-sky-400 transition flex items-center gap-1.5 truncate"
          >
            <Box className="w-3 h-3 shrink-0 text-sky-400" />
            <span className="truncate">Placa 3D</span>
          </button>
          <button
            onClick={() => handleSendPrompt('Exibir esquemático elétrico unificado')}
            className="p-1.5 text-left rounded-xs bg-inst-canvas border border-inst-border hover:border-amber-500 hover:text-amber-400 transition flex items-center gap-1.5 truncate"
          >
            <Cpu className="w-3 h-3 shrink-0 text-amber-400" />
            <span className="truncate">Esquemático</span>
          </button>
          <button
            onClick={() => handleSendPrompt('Exibir layout PCB 2D em FR-4')}
            className="p-1.5 text-left rounded-xs bg-inst-canvas border border-inst-border hover:border-purple-500 hover:text-purple-400 transition flex items-center gap-1.5 truncate"
          >
            <Layers className="w-3 h-3 shrink-0 text-purple-400" />
            <span className="truncate">Layout PCB</span>
          </button>
          <button
            onClick={() => handleSendPrompt('Exportar Circuit JSON canônico')}
            className="p-1.5 text-left rounded-xs bg-inst-canvas border border-inst-border hover:border-fuelguard-green hover:text-fuelguard-green transition flex items-center gap-1.5 truncate col-span-2"
          >
            <Download className="w-3 h-3 shrink-0 text-fuelguard-green" />
            <span className="truncate">Exportar Circuit JSON (tscircuit IR)</span>
          </button>
        </div>
      </div>

      {/* 3. Terminal e Histórico de Interações */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-2.5 rounded-sm border ${
              m.sender === 'user'
                ? 'bg-inst-subtle/80 border-inst-border-strong text-inst-primary ml-4'
                : m.sender === 'system'
                ? 'bg-[#080d14] border-inst-border text-inst-muted text-[10px]'
                : 'bg-[#0f172a]/60 border-inst-border-strong text-inst-secondary mr-2'
            }`}
          >
            <div className="flex items-center justify-between text-[9px] mb-1">
              <span className={`font-bold uppercase ${m.sender === 'user' ? 'text-sky-400' : m.sender === 'system' ? 'text-inst-muted' : 'text-fuelguard-green'}`}>
                {m.sender === 'user' ? 'Operador' : m.sender === 'system' ? 'tscircuit Engine' : 'FuelGuard Agent'}
              </span>
              <span className="text-inst-muted">{m.timestamp}</span>
            </div>

            <p className="leading-relaxed text-[11px] whitespace-pre-wrap">{m.text}</p>

            {m.tags && (
              <div className="flex flex-wrap gap-1 mt-2">
                {m.tags.map((tag, i) => (
                  <span
                    key={i}
                    className={`text-[8px] px-1 py-0.5 rounded-xs font-bold uppercase ${
                      tag === 'ERROR' || tag === 'FAULT'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : tag === 'PASS' || tag === 'SAFE'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-inst-canvas text-inst-muted border border-inst-border'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 4. Campo de Entrada do Usuário */}
      <div className="p-3 border-t border-inst-border bg-[#0b0f15] space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="flex items-center gap-1.5"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Digite instrução CAD ou selecione ação..."
              className="w-full bg-inst-canvas border border-inst-border rounded-xs px-2.5 py-1.5 text-xs font-mono text-inst-primary placeholder:text-inst-muted focus:outline-none focus:border-fuelguard-green"
            />
          </div>
          <button
            type="submit"
            className="p-1.5 rounded-xs bg-fuelguard-green text-white hover:bg-emerald-600 transition"
            title="Enviar Instrução"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Rodapé de Status do Agente */}
        <div className="flex items-center justify-between text-[10px] font-mono text-inst-muted pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-fuelguard-green animate-pulse" />
            <span>Engine: tscircuit IR (Ready)</span>
          </div>
          <span className="text-[9px]">Sinc: 50Hz Worker</span>
        </div>
      </div>
    </div>
  );
};
