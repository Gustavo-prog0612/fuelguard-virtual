import React from 'react';
import { Palette, Type, CheckCircle2, AlertTriangle, Sliders, Layers } from 'lucide-react';
import { useDesignSystem } from '@/design-system/DesignSystemContext';
import { TypographyPreset, TYPOGRAPHY_PRESETS } from '@/design-system/tokens';
import { HonestyBadge } from '@/ui/components/badges/HonestyBadge';

export const StyleGuideView: React.FC = () => {
  const { preset, setPreset } = useDesignSystem();

  return (
    <div className="p-8 space-y-10 overflow-y-auto h-full max-w-7xl mx-auto bg-inst-canvas text-inst-primary">
      {/* 1. Cabeçalho de Apresentação do Design System */}
      <div className="border-b border-inst-border pb-6 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="w-3 h-3 rounded-xs bg-fuelguard-green" />
            <h1 className="text-xl font-display font-bold tracking-tight text-inst-primary">
              FuelGuard Design System — Instrumento de Engenharia Sereno
            </h1>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-sm bg-inst-subtle border border-inst-border text-inst-secondary font-medium">
            v1.0.0 • WCAG AAA
          </span>
        </div>
        <p className="text-xs font-ui text-inst-secondary max-w-3xl leading-relaxed">
          Sistema de design concebido especificamente para bancada de testes de mecatrônica didática. Rejeita o padrão visual de SaaS/admin genérico em favor da clareza, contenção espacial e rigor visual de um instrumento físico de laboratório.
        </p>
      </div>

      {/* 2. Laboratório de Comparação Tipográfica com Conteúdo Idêntico */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-inst-border pb-3">
          <div>
            <h2 className="text-sm font-display font-bold uppercase tracking-wider text-inst-primary flex items-center gap-2">
              <Type className="w-4 h-4 text-fuelguard-green" />
              1. Laboratório de Avaliação Tipográfica (4 Combinações)
            </h2>
            <p className="text-xs font-ui text-inst-secondary mt-0.5">
              Compare as 4 combinações aplicadas ao mesmo vocabulário técnico de bancada em Português. Clique para ativar a família no sistema.
            </p>
          </div>

          {/* Seletor Ativo */}
          <div className="flex items-center gap-1.5 bg-inst-surface border border-inst-border p-1 rounded-sm">
            {(['A', 'B', 'C', 'D'] as TypographyPreset[]).map((p) => (
              <button
                key={p}
                onClick={() => setPreset(p)}
                className={`px-3 py-1 rounded-xs text-xs font-mono font-medium transition ${
                  preset === p
                    ? 'bg-fuelguard-green text-white font-bold shadow-xs'
                    : 'text-inst-secondary hover:text-inst-primary hover:bg-inst-subtle'
                }`}
              >
                Opção {p}
              </button>
            ))}
          </div>
        </div>

        {/* Grade Comparativa das 4 Opções */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(['A', 'B', 'C', 'D'] as TypographyPreset[]).map((pKey) => {
            const p = TYPOGRAPHY_PRESETS[pKey];
            const isSelected = preset === pKey;

            return (
              <div
                key={pKey}
                onClick={() => setPreset(pKey)}
                className={`p-5 rounded-md border text-left cursor-pointer transition relative space-y-4 ${
                  isSelected
                    ? 'bg-inst-surface border-fuelguard-green shadow-raised ring-1 ring-fuelguard-green/30'
                    : 'bg-inst-surface border-inst-border hover:border-inst-border-strong'
                }`}
              >
                {/* Header do Card Tipográfico */}
                <div className="flex justify-between items-start border-b border-inst-border pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-1.5 py-0.5 bg-inst-subtle rounded-xs border border-inst-border">
                        OPÇÃO {p.id}
                      </span>
                      <h3 className="text-xs font-bold text-inst-primary">
                        {p.name.split('—')[1]}
                      </h3>
                    </div>
                    <div className="text-[11px] font-mono text-inst-muted mt-1">
                      Display: <strong>{p.displayFont.split(',')[0]}</strong> • UI: <strong>{p.uiFont.split(',')[0]}</strong> • Mono: <strong>{p.monoFont.split(',')[0]}</strong>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-mono font-bold text-fuelguard-green bg-fuelguard-green-light px-2 py-0.5 rounded-xs border border-fuelguard-green-border">
                      ATIVA NO SISTEMA
                    </span>
                  )}
                </div>

                {/* Bloco de Demonstração Técnica com Conteúdo Idêntico */}
                <div 
                  className="space-y-3 p-3.5 bg-inst-canvas rounded-sm border border-inst-border"
                  style={{
                    ['--card-display' as any]: p.displayFont,
                    ['--card-ui' as any]: p.uiFont,
                    ['--card-mono' as any]: p.monoFont,
                  }}
                >
                  {/* Título de Display */}
                  <div style={{ fontFamily: p.displayFont }} className="text-base font-bold text-inst-primary leading-tight">
                    FuelGuard Virtual Test Bench • Estação Didática
                  </div>

                  {/* Nome do Componente e Especificações */}
                  <div style={{ fontFamily: p.uiFont }} className="text-xs text-inst-secondary">
                    ESP32-S3 DevKitC-1 • Microcontrolador Dual-Core Xtensa LX7 com sensor acústico JSN-SR04T v2.0
                  </div>

                  {/* Telemetria e Medições Numéricas Monoespaçadas */}
                  <div style={{ fontFamily: p.monoFont }} className="text-xs font-medium p-2 bg-inst-surface rounded-xs border border-inst-border text-inst-primary flex justify-between">
                    <span>d = 42.3 cm</span>
                    <span>h = 57.7 cm</span>
                    <span className="text-fuelguard-green font-bold">V = 577 L</span>
                    <span className="text-inst-muted">t_echo = 2450 μs</span>
                  </div>

                  {/* Pinagem e Níveis Lógicos */}
                  <div style={{ fontFamily: p.monoFont }} className="text-[11px] text-inst-secondary space-y-0.5">
                    <div>GPIO5: TRIG (AHCT125 5V) • GPIO6: ECHO (Divisor 10k/15k → 3.0V)</div>
                    <div>SPI PN532: CS:10, MOSI:11, SCK:12, MISO:13 • Reed Switch: GPIO7 (3V3)</div>
                  </div>

                  {/* Texto Explicativo em Português com Acentuação */}
                  <p style={{ fontFamily: p.uiFont }} className="text-[11px] text-inst-secondary leading-relaxed border-t border-inst-border pt-2">
                    A velocidade do som no ar varia termodinamicamente conforme a temperatura ambiente: c(T) = 331,3 · √(1 + T/273,15). A validação acústica exige comprovação na bancada física.
                  </p>
                </div>

                {/* Justificativa e Parecer */}
                <div className="text-[11px] text-inst-secondary border-t border-inst-border pt-2 leading-relaxed">
                  <strong>Avaliação:</strong> {p.rationale}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Paleta de Cores e Tokens Funcionais */}
      <section className="space-y-4">
        <div className="border-b border-inst-border pb-3">
          <h2 className="text-sm font-display font-bold uppercase tracking-wider text-inst-primary flex items-center gap-2">
            <Palette className="w-4 h-4 text-fuelguard-green" />
            2. Paleta de Cores & Relação de Contraste
          </h2>
          <p className="text-xs font-ui text-inst-secondary mt-0.5">
            Cinza quente de laboratório, grafite profundo e verde funcional reservado estritamente para ações e validações.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* Canvas */}
          <div className="p-3 rounded-sm bg-inst-surface border border-inst-border space-y-2">
            <div className="w-full h-10 rounded-xs bg-[#f8f9fa] border border-inst-border" />
            <div className="font-mono text-[10px] text-inst-muted">canvas</div>
            <div className="font-bold text-inst-primary">#f8f9fa</div>
            <div className="text-[10px] text-inst-secondary">Fundo da Bancada</div>
          </div>

          {/* Surface */}
          <div className="p-3 rounded-sm bg-inst-surface border border-inst-border space-y-2">
            <div className="w-full h-10 rounded-xs bg-[#ffffff] border border-inst-border" />
            <div className="font-mono text-[10px] text-inst-muted">surface</div>
            <div className="font-bold text-inst-primary">#ffffff</div>
            <div className="text-[10px] text-inst-secondary">Instrumentos & Painéis</div>
          </div>

          {/* FuelGuard Green */}
          <div className="p-3 rounded-sm bg-inst-surface border border-inst-border space-y-2">
            <div className="w-full h-10 rounded-xs bg-[#0f5132]" />
            <div className="font-mono text-[10px] text-inst-muted">fuelguard.green</div>
            <div className="font-bold text-[#0f5132]">#0f5132</div>
            <div className="text-[10px] text-inst-secondary">Verde Floresta (8.6:1 AAA)</div>
          </div>

          {/* Warning */}
          <div className="p-3 rounded-sm bg-inst-surface border border-inst-border space-y-2">
            <div className="w-full h-10 rounded-xs bg-[#b45309]" />
            <div className="font-mono text-[10px] text-inst-muted">status.warning</div>
            <div className="font-bold text-[#b45309]">#b45309</div>
            <div className="text-[10px] text-inst-secondary">Alerta de Nível Marginal</div>
          </div>

          {/* Danger */}
          <div className="p-3 rounded-sm bg-inst-surface border border-inst-border space-y-2">
            <div className="w-full h-10 rounded-xs bg-[#b91c1c]" />
            <div className="font-mono text-[10px] text-inst-muted">status.danger</div>
            <div className="font-bold text-[#b91c1c]">#b91c1c</div>
            <div className="text-[10px] text-inst-secondary">Sobretensão / Curto</div>
          </div>

          {/* Info */}
          <div className="p-3 rounded-sm bg-inst-surface border border-inst-border space-y-2">
            <div className="w-full h-10 rounded-xs bg-[#0369a1]" />
            <div className="font-mono text-[10px] text-inst-muted">status.info</div>
            <div className="font-bold text-[#0369a1]">#0369a1</div>
            <div className="text-[10px] text-inst-secondary">Acústica & Barramentos</div>
          </div>
        </div>
      </section>

      {/* 4. Componentes-Base e seus Estados Interativos */}
      <section className="space-y-4">
        <div className="border-b border-inst-border pb-3">
          <h2 className="text-sm font-display font-bold uppercase tracking-wider text-inst-primary flex items-center gap-2">
            <Sliders className="w-4 h-4 text-fuelguard-green" />
            3. Componentes-Base de Instrumentação & Seus Estados
          </h2>
          <p className="text-xs font-ui text-inst-secondary mt-0.5">
            Estados padronizados: Default, Hover, Focus visível, Active e Disabled.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Botões */}
          <div className="p-5 rounded-md bg-inst-surface border border-inst-border space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-inst-secondary">Botões de Ação</h3>
            
            <div className="space-y-2">
              <button className="w-full py-2 px-3 rounded-sm bg-fuelguard-green hover:bg-fuelguard-green-hover active:bg-[#0a3822] text-white text-xs font-ui font-semibold transition shadow-xs flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Primário (Ação / Confirmar)</span>
              </button>

              <button className="w-full py-2 px-3 rounded-sm bg-inst-surface hover:bg-inst-subtle border border-inst-border-strong text-inst-primary text-xs font-ui font-medium transition flex items-center justify-center gap-1.5">
                <span>Secundário (Contorno Neutro)</span>
              </button>

              <button className="w-full py-2 px-3 rounded-sm bg-inst-subtle hover:bg-inst-inset text-inst-secondary hover:text-inst-primary text-xs font-ui transition flex items-center justify-center gap-1.5">
                <span>Terciário (Ação Discreta)</span>
              </button>

              <button className="w-full py-2 px-3 rounded-sm bg-[#fef2f2] hover:bg-[#fee2e2] border border-[#fecaca] text-[#b91c1c] text-xs font-ui font-semibold transition flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Destrutivo / Desarme</span>
              </button>

              <button disabled className="w-full py-2 px-3 rounded-sm bg-inst-subtle text-inst-muted text-xs font-ui opacity-50 cursor-not-allowed border border-inst-border">
                <span>Desabilitado (Opacidade 50%)</span>
              </button>
            </div>
          </div>

          {/* Badges Semânticos */}
          <div className="p-5 rounded-md bg-inst-surface border border-inst-border space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-inst-secondary">Badges de Honestidade</h3>
            <p className="text-[11px] text-inst-secondary leading-tight">
              Identificação visual compulsória em todos os widgets de leitura:
            </p>

            <div className="space-y-2 pt-1 font-mono text-xs">
              <div className="p-2 rounded-sm bg-inst-canvas border border-inst-border flex items-center justify-between">
                <span>Cálculo Exato</span>
                <HonestyBadge level="simulado" />
              </div>

              <div className="p-2 rounded-sm bg-inst-canvas border border-inst-border flex items-center justify-between">
                <span>Ondas / Slosh</span>
                <HonestyBadge level="aproximado" />
              </div>

              <div className="p-2 rounded-sm bg-inst-canvas border border-inst-border flex items-center justify-between">
                <span>Atenuação Real</span>
                <HonestyBadge level="requer_hardware" />
              </div>

              <div className="p-2 rounded-sm bg-inst-canvas border border-inst-border flex items-center justify-between">
                <span>Dados de Compra</span>
                <HonestyBadge level="pendente" />
              </div>
            </div>
          </div>

          {/* Controles de Parâmetros (Inputs e Sliders) */}
          <div className="p-5 rounded-md bg-inst-surface border border-inst-border space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-inst-secondary">Ajustes & Parâmetros</h3>
            
            <div className="space-y-3 text-xs font-ui">
              <div className="space-y-1">
                <label className="text-inst-secondary font-medium flex justify-between">
                  <span>Distância Href:</span>
                  <span className="font-mono text-inst-primary font-bold">100.0 cm</span>
                </label>
                <input
                  type="range"
                  defaultValue="100"
                  className="w-full accent-fuelguard-green"
                />
              </div>

              <div className="space-y-1">
                <label className="text-inst-secondary font-medium">Parâmetro de Calibração:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue="bench-A-v1"
                    className="flex-1 px-2.5 py-1.5 rounded-sm bg-inst-canvas border border-inst-border text-inst-primary font-mono text-xs focus:border-fuelguard-green focus:bg-white"
                  />
                  <button className="px-3 py-1.5 rounded-sm bg-inst-subtle border border-inst-border text-inst-primary font-medium hover:bg-inst-inset">
                    Gravar
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-sm bg-fuelguard-green-light border border-fuelguard-green-border text-[11px] text-fuelguard-green flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Nó elétrico verificado: Tensão segura de 3,00 V no pino GPIO6.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Regras de Rigor Visual do Design System */}
      <section className="p-6 rounded-md bg-inst-surface border border-inst-border space-y-4">
        <h2 className="text-sm font-display font-bold uppercase tracking-wider text-inst-primary flex items-center gap-2">
          <Layers className="w-4 h-4 text-fuelguard-green" />
          4. Diretrizes de Composição e Regras Antipadrão
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
          <div className="space-y-2">
            <h3 className="font-bold text-fuelguard-green flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Diretrizes Obrigatórias
            </h3>
            <ul className="space-y-1.5 text-inst-secondary list-disc pl-4">
              <li>A bancada virtual de fiação é a protagonista espacial da aplicação.</li>
              <li>Linhas de divisão de 1px substituem cartões e sombras desnecessárias.</li>
              <li>Toda grandeza física deve exibir unidade visível (cm, L, °C, ms, V).</li>
              <li>O verde FuelGuard é reservado para ação de decisão ou confirmação física.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-[#b91c1c] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Antipadrões Terminantemente Proibidos
            </h3>
            <ul className="space-y-1.5 text-inst-secondary list-disc pl-4">
              <li>Proibido o uso de temas escuros genéricos de jogos ou dashboards de marketing.</li>
              <li>Proibido criar botões tipo cápsula ultra-arredondada (*pill buttons*).</li>
              <li>Proibido usar fontes monoespaçadas em parágrafos ou descrições longas.</li>
              <li>Proibido apresentar valores simulados sem o badge semântico correspondente.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
