# FuelGuard Virtual Test Bench — Sistema de Design de Instrumento de Engenharia

> **Status:** Especificação Oficial do Design System  
> **Versão:** 1.0.0  
> **Data:** 25 de Setembro de 2026  
> **Conceito:** "Instrumento de Engenharia Sereno" (*Serene Engineering Instrument*)  
> **Identidade:** Original, minimalista, rigoroso e de alta precisão visual para mecatrônica didática

---

## 1. Manifesto Visual e Filosofia de Design

### O que o FuelGuard Virtual Test Bench É:
- **Um instrumento de laboratório de precisão:** Como um osciloscópio Tektronix de alta precisão, uma fonte programável Rohde & Schwarz ou uma bancada de ensaios aeronáuticos — ferramentas projetadas para técnicos e engenheiros que precisam de dados confiáveis, foco absoluto e zero ruído visual.
- **Espacialmente disciplinado:** Utiliza alinhamentos geométricos rigorosos, divisores finos (*hairlines* de 1px) e agrupamentos espaciais limpos em vez de cartões empilhados com bordas arredondadas e sombras borradas.
- **Funcional e honesto:** Não disfarça simulações com efeitos estéticos; indica categoricamente o que é simulado deterministicamente, o que é aproximação didática e o que exige bancada física.
- **Verde como sinal, não como tinta:** A assinatura de cor FuelGuard é um verde floresta profundo (`#0f5132`) reservado exclusivamente para ações primárias, estados operacionais validados e nós energizados com segurança.

### O que o FuelGuard Virtual Test Bench NÃO É:
- **NÃO é um dashboard SaaS genérico:** Sem métricas em cards isolados com ícones coloridinhos em bolinhas, sem gradientes roxos/alaranjados chamativos, sem avatares decorativos ou visual de aplicativo de vendas.
- **NÃO é um template de painel de administração:** Sem tabelas infladas com paginação decorativa ou gráficos empilhados sem relação com o circuito.
- **NÃO é um clone da Apple ou HeyPCB:** Não reproduz o minimalismo de consumo da Apple (raios excessivamente redondos, tipografia SF Pro idêntica, glassmorphism) nem o layout do HeyPCB. Adota caráter técnico instrumental próprio.

---

## 2. Princípios de Design

| Princípio | Aplicação Prática na Interface |
| :--- | :--- |
| **1. A Bancada é o Altar (Foco Primário)** | O canvas de montagem, os componentes (ESP32-S3, SEN0311, PN532 V4, tanque FG-TANK-6L-R1) e as conexões elétricas têm prioridade visual máxima. Painéis de controle são compactos e orbitam a bancada. |
| **2. Densidade Serena** | Informações técnicas (GPIOs, tensões DC, microsegundos de eco, taxa de baud) são apresentadas de forma compacta e legível, sem sensação de aperto ou poluição. |
| **3. Contenção Cromática** | O fundo é um cinza muito claro e quente (`#f8f9fa` / `#f1f3f5`). Superfícies são brancas puras com divisores neutros. Cores saturadas são reservadas exclusivamente para estados elétricos e de segurança. |
| **4. Tipografia Funcional** | Famílias tipográficas com desenho sóbrio, excelente suporte a diacríticos do português, numerais tabulares que alinham com perfeição e fonte monoespaçada dedicada para nós, portas e telemetria. |
| **5. Honestidade Semântica** | Valores nunca são apresentados como "verdade de hardware" sem verificação física. Toda grandeza possui unidade visível (cm, L, °C, ms, V, baud). |

---

## 3. Tokens de Design Estruturados

### 3.1. Paleta de Cores (WCAG AA & AAA Validado)

| Token | Valor Hex | Amostra | Relação de Contraste | Uso Intencional |
| :--- | :---: | :---: | :---: | :--- |
| `color.bg.canvas` | `#f8f9fa` | Suave | Base | Fundo geral da bancada de laboratório (cinza muito claro quente). |
| `color.bg.surface` | `#ffffff` | Puro | 1.05:1 vs canvas | Superfície de instrumentos, canvas e painéis principais. |
| `color.bg.subtle` | `#f1f3f5` | Neutro | 1.15:1 vs canvas | Baías de inserção, áreas de ferramentas e cabeçalhos secundários. |
| `color.bg.inset` | `#eaedf0` | Recesso | 1.3:1 vs canvas | Cavidades de encaixe de pinos, slots e caixas de código/logs. |
| `color.fg.primary` | `#111827` | Grafite | **16.2:1 (AAA)** | Texto principal, títulos, rótulos de controle primários. |
| `color.fg.secondary`| `#4b5563` | Médio | **7.4:1 (AAA)** | Descrições técnicas, instruções de uso e unidades de medida. |
| `color.fg.muted` | `#6b7280` | Sutil | **4.9:1 (AA)** | Metadados, timestamps, numeração de pinos inativos. |
| `color.border.subtle`| `#e5e7eb` | Linha 1px | Estrutural | Divisores verticais e horizontais serenos entre áreas funcionais. |
| `color.border.strong`| `#d1d5db` | Linha 1px | Delimitação | Contorno de módulos físicos, terminais e botões secundários. |
| `color.fgBrand.deep`| `#0f5132` | Verde Floresta| **8.6:1 (AAA)** | Ação principal FuelGuard, estado operacional validado, relógio ativo. |
| `color.fgBrand.surface`|`#f0fdf4` | Verde Suave | Fundo | Tonalidade de fundo para alertas de validação nominal bem-sucedida. |
| `color.fgBrand.border` |`#86efac` | Verde Claro | Contorno | Borda indicadora de conector corretamente associado. |
| `color.status.warning`|`#b45309` | Âmbar | **5.8:1 (AA)** | Zona cega de 3 cm, gap do MC-38 pendente ou medição incompleta. |
| `color.status.danger` |`#b91c1c` | Vermelho Carmim| **6.5:1 (AA)** | UART 5V em GPIO16, curto-circuito, terra flutuante ou vazamento. |
| `color.status.info` |`#0369a1` | Azul Técnico | **6.1:1 (AA)** | Informações acústicas $c(T)$, protocolo SPI e conexões de barramento. |

### 3.2. Espaçamento e Grade (Base 4px / 8px)

```text
space.2xs = 2px   (Micro-ajustes de pinos e ícones inline)
space.xs  = 4px   (Distância entre indicador de status e texto)
space.sm  = 8px   (Padding interno de badges, gap entre botões)
space.md  = 12px  (Espaçamento entre campos de formulário e rótulos)
space.lg  = 16px  (Padding padrão de painéis e barras de ferramentas)
space.xl  = 24px  (Distância entre grupos funcionais principais)
space.2xl = 32px  (Margens externas da bancada)
```

### 3.3. Raios de Borda (*Border Radii*) — Anti-Bubbly

Para manter a sobriedade de um instrumento físico de bancada, são estritamente proibidas formas ovais ou botões tipo "cápsula":
- `radius.none`: `0px` (Extremidades de barramentos de alimentação e fios).
- `radius.xs`: `2px` (Pinos de conector, tags de protocolo SPI/GPIO).
- `radius.sm`: `4px` (Botões de instrumentação, caixas de input, badges de status).
- `radius.md`: `6px` (Invólucros de módulos, placas de circuito, chassi do tanque).
- `radius.lg`: `8px` (Estrutura mestra do canvas e diálogos modais técnicos).

### 3.4. Elevação e Sombras

Substituímos o blur excessivo por linhas de definição nítidas (*clean engineering lines*):
- `shadow.none`: Sem elevação (elementos planos flush ao painel).
- `shadow.hairline`: `0 0 0 1px rgba(0, 0, 0, 0.08)` (Contorno preciso sem desfoque).
- `shadow.raised`: `0 1px 3px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.06)` (Módulos sobre a bancada).
- `shadow.overlay`: `0 8px 24px rgba(0, 0, 0, 0.10), 0 0 0 1px rgba(0, 0, 0, 0.08)` (Modais e popovers técnicos).

---

## 4. Avaliação Comparativa de Tipografia

Conforme a solicitação, realizamos a análise prática das quatro combinações tipográficas aplicadas com rigor ao vocabulário técnico do FuelGuard (português com acentuação, grandezas físicas e pinagem de microcontroladores):

| Combinação | Família de Títulos | Família de Interface | Família de Dados | Avaliação Técnica & Racional | Recomendação |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **A** | **Space Grotesk** | **IBM Plex Sans** | **IBM Plex Mono** | Personalidade técnica industrial forte sem perder seriedade. O Space Grotesk confere autoridade de engenharia nos cabeçalhos; o IBM Plex Sans entrega legibilidade excepcional em rótulos pequenos de circuito; o IBM Plex Mono possui distinção cirúrgica entre `0`/`O`, `1`/`l`/`I` e suporte impecável a diacríticos do Português. | **PRINCIPAL (Recomendada)** |
| **B** | **Bricolage Grotesque** | **Instrument Sans** | **IBM Plex Mono** | Visual contemporâneo com ritmo humanista. Excelente para ferramentas de design criativo, porém o Bricolage traz curvaturas expressivas que podem parecer lúdicas demais para instrumentação rigorosa de laboratório. | **Alternativa de Personalidade** |
| **C** | **Sora** | **IBM Plex Sans** | **Azeret Mono** | Sora possui geometria límpida e moderna; o Azeret Mono tem largura generosa e visual brutalista marcante, porém ocupa espaço horizontal excessivo em tabelas compactas de pinagem. | **Viável** |
| **D** | **Archivo** | **Archivo** | **IBM Plex Mono** | Grande consistência por unificar títulos e interface na mesma família grotesca técnica clássica. Altamente neutra e funcional, porém com menor assinatura visual própria. | **Alternativa Neutra Sólida** |

### Veredito da Recomendação Tipográfica:
- **Combinação Eleita Oficial:** **Combinação A (Space Grotesk + IBM Plex Sans + IBM Plex Mono)**. É a combinação que melhor sintetiza o "instrumento de engenharia sereno": rigorosa, contemporânea, com distinção gráfica imediata e leitura impecável de números decimais e registradores em tabelas densas.
- **Segunda Escolha (Alternativa Neutra):** **Combinação D (Archivo + IBM Plex Mono)** para cenários de sobriedade extrema de documentação impressa.

---

## 5. Estrutura de Navegação por Tarefas

A navegação foi reestruturada de forma enxuta em 5 tarefas essenciais de engenharia, eliminando rotas redundantes:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [FG] FuelGuard  Bancada Real de Engenharia  •  ESP32-S3 / SEN0311 / PN532 V4 [GATE]    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [ 1. BANCADA ]   [ 2. SINAIS ]   [ 3. EVENTOS ]   [ 4. TESTES ]   [ 5. GUIA & DESIGN ] │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **1. BANCADA (Foco Central):**
   - Canvas de instrumentação interativo com protoboard, ESP32-S3, PN532 V4, probe SEN0311, MC-38, LED e buzzer ativo.
   - Fiação com roteamento limpo, identificação funcional de nós e validador elétrico em tempo real.
2. **2. SINAIS (Telemetria & Acústica):**
   - Instrumento de corte do galão d'água com feixe ultrassônico e cota $H_{ref}$.
   - Mostradores digitais serenos de nível (%), distância acústica (cm) e volume (L).
   - Séries temporais em canvas vetorial com decimação e comparação entre amostra bruta e estabilizada.
3. **3. EVENTOS (Linha do Tempo & Serial):**
   - Console serial UART 115200 8N1 com filtros de severidade (`ALL`, `INFO`, `WARN`, `DEBUG`).
   - Linha do tempo monotônica de eventos do firmware virtual ordenada por `sim_time_ms` + `seq`.
4. **4. TESTES (Cenários & Falhas):**
   - Presets de ensaio do briefing (Nominal, Slosh com agitação, Zona Cega, Tag Recusada, Debounce da Tampa, Fila Offline).
   - Injeção controlada de ruído, timeout e simulação de desconexão.
5. **5. GUIA & DESIGN SYSTEM (Referência & Estilo):**
   - Laboratório interativo de comparação tipográfica (A, B, C, D) com o mesmo conteúdo técnico.
   - Vitrine de componentes e estados do design system.
   - Checklist físico de segurança e limitações do mundo real.

---

## 6. Componentes-Base e seus Estados

Todos os componentes interativos do sistema seguem uma máquina de 5 estados explícitos:

```text
[ DEFAULT ]  ──(hover)──>  [ HOVER ]  ──(click)──>  [ ACTIVE ]
     │                         │
  (tab/foco)                (tab/foco)
     ▼                         ▼
 [ FOCUSED (Anel 2px Verde Floresta #0f5132 + Offset 2px) ]
     │
 (condição inválida / bloqueado)
     ▼
 [ DISABLED (Opacidade 45% + Cursor not-allowed) ]
```

### Anatomia dos Componentes Primários:
1. **Botão Primário de Instrumento:** Fundo verde floresta profundo (`#0f5132`), texto branco nítido, cantos levemente atenuados (4px), foco acessível de alto contraste.
2. **Botão Secundário:** Superfície branca, contorno neutro sutil (`#d1d5db`), texto grafite (`#111827`).
3. **Badges de Honestidade Técnica:** Fundo neutro com borda de 1px e ponto indicador semântico preenchido:
   - `[SIMULADO]`: Borda azul discreto, ponto azul `#0284c7`.
   - `[APROXIMADO]`: Borda âmbar, ponto âmbar `#d97706`.
   - `[REQUER HARDWARE]`: Borda vermelho sóbrio, ponto vermelho `#b91c1c`.
   - `[PENDENTE]`: Borda grafite médio, ponto cinza `#6b7280`.
4. **Terminal / Display Virtual:** Superfície cinza grafite muito escuro (`#181e24`), texto monoespaçado em IBM Plex Mono com coloração semântica funcional (verde para confirmação, âmbar para debounce, azul para eco, vermelho para falha).

---

## 7. Regras de Uso: O que Fazer vs O que Evitar

| Prática Recomendada (O que FAZER) | Prática Proibida (O que EVITAR) |
| :--- | :--- |
| **Separadores de 1px finos** para demarcar baías e módulos técnicos. | **NÃO** usar cartões inflados com sombras difusas em todos os blocos. |
| **Tipografia monoespaçada** exclusiva para valores, registradores e pinos. | **NÃO** usar monoespaçada para textos longos ou parágrafos didáticos. |
| **Fundo cinza claro calmo e neutro** (`#f8f9fa`) simulando bancada técnica. | **NÃO** usar temas escuros gamers com neons roxos ou azuis saturados. |
| **Verde Floresta FuelGuard** aplicado em pontos focais de decisão e estado ativo. | **NÃO** pintar todos os botões, ícones e bordas de verde. |
| **Rótulos com unidades explícitas** (ex: `80 mm`, `3.2 L`, `24.8 °C`). | **NÃO** mostrar números isolados sem contexto físico. |
| **Indicação explícita de limitação física** em alertas e transições. | **NÃO** prometer que a simulação geométrica substitui prova acústica. |
