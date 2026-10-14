/**
 * FuelGuard Virtual Test Bench — Tokens Estruturados do Design System
 * Conceito: "Produto técnico sereno"
 */

export type TypographyPreset = 'A' | 'B' | 'C' | 'D';

export interface TypographyConfig {
  id: TypographyPreset;
  name: string;
  displayFont: string;
  uiFont: string;
  monoFont: string;
  rationale: string;
  tag: string;
}

export const TYPOGRAPHY_PRESETS: Record<TypographyPreset, TypographyConfig> = {
  A: {
    id: 'A',
    name: 'Sistema A — Nativo e editorial',
    displayFont: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
    uiFont: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif',
    monoFont: '"SF Mono", "Cascadia Code", "IBM Plex Mono", ui-monospace, monospace',
    rationale: 'Ritmo editorial, tipografia nativa e contraste contido. A informação técnica só ganha ênfase quando orienta uma decisão.',
    tag: 'Sistema ativo',
  },
  B: {
    id: 'B',
    name: 'Combinação B — Humanista & Expressiva',
    displayFont: "'Bricolage Grotesque', system-ui, sans-serif",
    uiFont: "'Instrument Sans', system-ui, sans-serif",
    monoFont: "'IBM Plex Mono', monospace",
    rationale: 'Estilo editorial contemporâneo com curvas expressivas nos títulos e ritmo humanista na interface.',
    tag: 'Alternativa Expressiva',
  },
  C: {
    id: 'C',
    name: 'Combinação C — Moderna & Brutalista',
    displayFont: "'Sora', system-ui, sans-serif",
    uiFont: "'IBM Plex Sans', system-ui, sans-serif",
    monoFont: "'Azeret Mono', monospace",
    rationale: 'Títulos de geometria limpa e moderna combinados com monoespaçada densa e marcante (Azeret).',
    tag: 'Moderna / Densa',
  },
  D: {
    id: 'D',
    name: 'Combinação D — Neutra Unificada',
    displayFont: "'Archivo', system-ui, sans-serif",
    uiFont: "'Archivo', system-ui, sans-serif",
    monoFont: "'IBM Plex Mono', monospace",
    rationale: 'Extrema sobriedade tipográfica unificando títulos e interface na mesma família grotesca clássica.',
    tag: 'Neutra Sólida',
  },
};

export const TOKENS = {
  colors: {
    // Fundo geral de bancada técnica
    canvas: '#f5f5f7',
    // Superfície de instrumentos e cartões funcionais
    surface: '#ffffff',
    // Baías secundárias e áreas embutidas
    subtle: '#f5f5f7',
    // Recessos técnicos, cavidades de pinos e terminais
    inset: '#e8e8ed',
    // Texto primário grafite profundo (Contraste 16.2:1 - AAA)
    fgPrimary: '#1d1d1f',
    // Texto secundário cinza neutro (Contraste 7.4:1 - AAA)
    fgSecondary: '#424245',
    // Texto terciário e metadados (Contraste 4.9:1 - AA)
    fgMuted: '#6e6e73',
    // Linhas finas estruturais (Hairline 1px)
    borderSubtle: '#d2d2d7',
    borderStrong: '#a1a1a6',
    borderFocus: '#0071e3',
    // Azul é a ação; cores semânticas permanecem exclusivas de estados técnicos.
    fuelGuardGreen: {
      deep: '#0071e3',
      surface: '#eaf4ff',
      border: '#7ab8f5',
      hover: '#0077ed',
    },
    // Sinalização Semântica Rigorosa
    status: {
      success: '#248a3d',
      warning: '#b25000',
      danger: '#d70015',
      info: '#0071e3',
    },
    // Fiação da Bancada (Norma Didática de Cores Elétricas)
    wire: {
      gnd: '#1f2937',     // Preto / Grafite escuro
      vcc5v: '#dc2626',   // Vermelho vivo
      vcc3v3: '#d97706',  // Laranja / Âmbar
      trig: '#7c3aed',    // Roxo (Pulso de disparo)
      echo: '#0284c7',    // Azul claro (Retorno de eco)
      spiMosi: '#059669', // Verde esmeralda
      spiMiso: '#0284c7', // Azul
      spiSck: '#eab308',  // Amarelo
      spiCs: '#4b5563',   // Cinza neutro
    }
  },
  radii: {
    none: '0px',
    xs: '2px',   // Pinos e tags microscópicas
    sm: '4px',   // Botões, badges, campos
    md: '6px',   // Chassi de módulos, painéis
    lg: '8px',   // Canvas externo e modais
  },
  shadows: {
    none: 'none',
    hairline: '0 0 0 1px rgba(0, 0, 0, 0.08)',
    raised: '0 1px 3px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.06)',
    overlay: '0 8px 24px rgba(0, 0, 0, 0.10), 0 0 0 1px rgba(0, 0, 0, 0.08)',
  },
  spacing: {
    '2xs': '2px',
    'xs': '4px',
    'sm': '8px',
    'md': '12px',
    'lg': '16px',
    'xl': '24px',
    '2xl': '32px',
  },
} as const;
