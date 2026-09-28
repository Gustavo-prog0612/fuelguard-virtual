# FuelGuard Virtual Test Bench — Plano Mestre de Engenharia e Produto

> **Status:** M0 — Proposta Técnica Integral para Revisão Humana  
> **Versão do Documento:** 1.1.0  
> **Data:** 25 de Setembro de 2026  
> **Referência Principal:** Brief de Produto e Simulação FuelGuard (25/09/2026)  
> **Inspiração de Fluxo:** HeyPCB (apenas referência de categoria e fluxo de trabalho guiado; sem cópia de código, marca, imagens ou layout)  
> **Diretriz de Desempenho:** Arquitetura ultraleve, fluida e responsiva sem travamentos (*zero UI jank*, 60 FPS estáveis)

---

## 1. Visão Geral e Objetivo do Produto

O **FuelGuard** é uma central de comando e referência digital de engenharia voltada ao planejamento, inspeção de circuitos, metrologia e ensaios funcionais do hardware físico FuelGuard. O software não substitui o hardware comprado, o esquemático KiCad, a metrologia ou a homologação veicular.

A aplicação adota o princípio da **honestidade visual e técnica**, diferenciando claramente através de badges semânticos o que é **simulado deterministicamente**, o que é **aproximação pedagógica** e o que **exige ensaio obrigatório em bancada física**.

---

## 2. Limites Estritos de Segurança e Escopo

| Diretriz de Escopo | Regra de Implementação no Virtual Test Bench |
| :--- | :--- |
| **Líquido do Recipiente** | **Exclusivamente ÁGUA**. Modelado por geometria estática, distância acústica, calibração volumétrica empírica, ruído e oscilação amortecida. **PROIBIDO** simular, recomendar ou mencionar integração com combustível diesel, gasolina, etanol ou recipientes pressurizados/inflamáveis. |
| **Atuadores e Veículo** | **PROIBIDO** qualquer simulação ou recomendação de ligação a linhas de combustível, circuitos de ignição, relés de corte veicular, válvulas solenoides, bombas ou imobilizadores automotivos. |
| **Hardware de Bancada Didática** | Estritamente restrito a: **ESP32-S3 DevKitC-1**, breakout **PN532** (SPI 3,3 V), sensor ultrassônico externo **JSN-SR04T v2.0**, buffer **SN74AHCT125N** (5 V para TRIG), divisor resistivo **10 kΩ / 15 kΩ** (para 3,0 V no ECHO), **reed switch** com ímã (sensor de tampa), resistor limitador **1 kΩ** com **LED verde**, buzzer didático e recipiente aberto com água. |
| **Segurança e Privacidade** | Sem UIDs reais de cartões físicos, sem senhas, credenciais Wi-Fi reais ou dados pessoais nos cenários compartilhados. O UID do NFC é meramente demonstrativo e educativo, não constituindo credencial criptográfica de segurança. |
| **Isolamento de Fluidos** | O modelo de água é determinístico e geométrico ($V(h)$ e $h = H_{ref} - d$). Não é apresentado nem vendido como CFD (Computational Fluid Dynamics). |

---

## 3. Matriz de Análise Crítica dos Repositórios e Tecnologias Investigados

Conforme exigido pelo briefing e pelas regras de trabalho, realizamos a análise seletiva de cada repositório e ferramenta (Categorias A até G + Ecossistema Python), verificando licenças, atividade, utilidade prática, limitações técnicas e decidindo seu papel no projeto:

| Categoria | Repositório / Fonte | Licença | Atividade / Maturidade | Utilidade para FuelGuard | Limitações Críticas | Decisão de Uso |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **A. Eletrônica & PCB** | `tscircuit/tscircuit` | MIT | Muito ativo | Geração de circuitos em código React/TS. | Não simula firmware em execução nem acústica; foco em layout de PCB. | **Avaliar em fase futura** (pós-validação física). |
| **A. Eletrônica & PCB** | `tscircuit/tscircuit.com` | MIT | Ativo | Referência de UX para edição de circuitos no browser. | Aplicação completa, pesada para importar no bundle. | **Usar apenas como referência de UX**. |
| **A. Eletrônica & PCB** | `tscircuit/3d-viewer` | MIT | Ativo | Visualização 3D de placas PCB fabricáveis. | A PCB FuelGuard só será visualizada depois de existir layout revisado e fabricável. | **Avaliar após validação física**. |
| **A. Eletrônica & PCB** | `wokwi/wokwi-elements` | MIT | Ativo | Web Components visuais de peças eletrônicas. | Apenas desenha SVGs; não executa regras elétricas nem física. | **Usar somente como referência visual**. |
| **A. Eletrônica & PCB** | `wokwi/wokwi-cli` | Apache-2.0 | Ativo | Automação de simulação e exportação VCD em CI. | Exige `WOKWI_CLI_TOKEN` para a API de simulação completa. | **Avaliar no Marco M5** (fallback gracioso se sem token). |
| **A. Eletrônica & PCB** | `wokwi/wokwi-docs` | Docs | Oficial | Mapeamento de pinos do ESP32-S3 e formato `diagram.json`. | Registra que o HC-SR04 do Wokwi difere dos parâmetros do JSN. | **Usar como referência técnica**. |
| **A. Eletrônica & PCB** | `pfalstad/circuitjs1` | **GPL-2.0** | Ativo | Referência para simulação e animação de correntes. | **GPL viral**. Incorporar código contamina o projeto com GPL. | **Não incorporar código**; manter como link externo. |
| **B. Firmware & Sensores** | `espressif/arduino-esp32` | LGPL-2.1 | Oficial / Ativo | Core oficial de APIs de GPIO, SPI, timers do ESP32-S3. | Firmware em C++ roda no chip, não no browser diretamente. | **Usar como base do sketch demo C++** e espelho da lógica em TS. |
| **B. Firmware & Sensores** | `elechouse/PN532` & `Adafruit-PN532`| BSD-3-Clause | Maduro | Sequência de comandos SPI do PN532 (`SAMConfig`, leitura UID). | Breakouts comerciais podem ter pinagens distintas do oficial. | **Usar como referência de protocolo** para o chip virtual em TS. |
| **C. Editor de Bancada** | `xyflow/xyflow` (React Flow) | MIT | Altamente ativo | Canvas interativo para componentes, pinos e fios. | É puramente visualizador; **NÃO** faz simulação nem validação elétrica. | **Usar com motor próprio de validação elétrica**. |
| **D. 3D & Física** | `mrdoob/three.js` & `react-three-fiber`| MIT | Altamente ativo | Renderização 3D WebGL da bancada e do tanque. | Peso no bundle e sobrecarga de GPU. O 2D atende com leveza e fluidez. | **Avaliar em fase futura** (após o 2D estar 100% validado). |
| **D. 3D & Física** | `dimforge/rapier` & `pmndrs/cannon-es` | Apache-2.0 / MIT | Ativo | Motores de física de corpos rígidos 3D em WASM/JS. | Corpos rígidos não simulam nível d'água nem acústica; pesados para UI. | **Não usar no escopo atual**. |
| **D. 3D & Física** | `Kitware/vtk-js` | Apache-2.0 | Ativo | Visualização científica 3D volumétrica médica/engenharia. | Biblioteca gigantesca e complexa; desproporcional ao produto atual. | **Não usar no escopo atual**. |
| **E. Fluidos & Água** | `jeantimex/fluid` | MIT | Demonstrativo | Simulação SPH em WebGPU. | Exige WebGPU (incompatível com PCs modestos); quebra determinismo. | **Não usar no escopo atual**. |
| **E. Fluidos & Água** | `amandaghassaei/gpu-io` & `gl-water2d` | MIT | Ativo | Shaders WebGL2 para ondas e superfícies d'água. | Custo computacional excessivo para galão didático. | **Usar apenas como referência visual futura**. |
| **E. Fluidos & Água** | `amandaghassaei/FluidSimulation` | MIT | Obsoleto | Antigo simulador WebGL de fluidos. | Substituído pelo autor pelo `gpu-io`. | **Não usar** (descontinuado). |
| **F. Térmica & CFD** | `openfoam/openfoam` & `seamplex/fino` | **GPL-3.0** | Ativo | CFD industrial e solver FEM de condução térmica. | Inviável no browser; a referência usa fórmula analítica $c(T)$ direta. | **Não usar no escopo atual**. |
| **G. Mensageria & IoT** | `mqttjs/MQTT.js` | MIT | Ativo | Cliente MQTT para WebSockets no browser. | O primeiro release deve funcionar 100% offline sem broker ativo. | **Avaliar em fase futura / Opcional**. |
| **G. Mensageria & IoT** | `eclipse-mosquitto` | EPL-2.0 / EDL-1.0 | Ativo | Broker MQTT leve executável localmente. | Exige instalação nativa e configuração externa. | **Opcional para testes de rede de bancada**. |
| **G. Mensageria & IoT** | `node-red` & `thingsboard` | Apache-2.0 | Corporativo | Orquestração de fluxos e dashboards IoT industriais. | Servidores complexos em Node/Java; fora do escopo web didático. | **Usar apenas como referência de design de widgets**. |
| **Python: API & Contratos** | `fastapi/fastapi` | MIT | Extremamente ativo | Framework web assíncrono moderno em Python. | Servidor backend externo. Não deve ser obrigatório para abrir a web app. | **Avaliar como backend de suporte local / Gateway HIL opcional**. |
| **Python: API & Contratos** | `pydantic/pydantic` | MIT | Padrão da indústria | Validação estrita de contratos de dados em Python. | Nenhuma no escopo Python. | **Usar como espelho de contratos** (`schema_version: 1`) entre TS e Python. |
| **Python: Sinais & Sim** | `simpx/simpy` | MIT | Maduro | Simulação baseada em eventos discretos (DES). | Não simula fluidos nem equações contínuas de propagação de som. | **Usar em scripts analíticos de modelagem de filas offline**. |
| **Python: Sinais & Sim** | `rlabbe/filterpy` | MIT | Maduro | Filtros de Kalman e estimadores de estado bayesianos. | Complexidade de sintonia de matrizes $Q$ e $R$; pesado para rodar no browser. | **Usar em estudo comparativo offline contra o Filtro Mediano**. |
| **Python: Sinais & Sim** | `numpy/numpy` | BSD-3-Clause | Pilar científico | Computação matricial e ajuste polinomial de calibração. | Não deve ser carregado no browser (evitar Pyodide pesado). | **Usar em scripts de suporte de calibração volumétrica**. |
| **Python: Sinais & Sim** | `scipy/scipy` | BSD-3-Clause | Ativo | Interpolação cúbica (PCHIP) e regressão não linear. | Execução fora do cliente web. | **Usar em scripts de geração de curvas $V(h)$ para galões irregulares**. |
| **Python: Sinais & Sim** | `pandas-dev/pandas` | BSD-3-Clause | Padrão analítico | Manipulação tabular de séries temporais de bancada. | Desnecessário no cliente web leve. | **Usar em scripts de pós-processamento de datasets de ensaio**. |
| **Python: ML Futuro** | `scikit-learn` & `online-ml/river` | BSD-3-Clause | Muito ativo | Algoritmos de Machine Learning supervisionado e online. | **Proibido usar ML para inventar dados** ou substituir regras físicas. | **Não usar antes de coletar dados reais e rotulados**. |
| **Python: Mensageria & Testes** | `eclipse-paho/paho.mqtt.python` | EPL-2.0 / EDL-1.0 | Ativo | Cliente MQTT padrão em Python. | Requer broker externo. | **Usar em scripts de teste de mensageria de bancada**. |
| **Python: Mensageria & Testes** | `empicano/aiomqtt` | BSD-3-Clause | Ativo | Wrapper assíncrono moderno sobre Paho MQTT. | Requer runtime Python assíncrono. | **Avaliar em conjunto com FastAPI em fase futura**. |
| **Python: Mensageria & Testes** | `pytest-dev/pytest` | MIT | Padrão industrial | Runner de testes para scripts analíticos Python. | Nenhuma. | **Usar na suíte de testes de ferramentas analíticas Python**. |

---

## 4. Requisitos Rastreáveis ao Briefing

### 4.1. Requisitos da referência de engenharia
- **REQ-ENG-01 (Bancada de Referência Visual 2D):** Renderizar em canvas interativo 2D ultraleve os componentes comerciais especificados, mantendo bloqueados os itens sem lote ou geometria confirmados.
- **REQ-ENG-02 (Fiação e Validação Elétrica em Tempo Real):** Permitir ligar e desligar pinos visualmente com jumpers. O validador elétrico bloqueia sobretensão, incompatibilidade lógica e ausência de GND comum.
- **REQ-ENG-03 (Núcleo Isolado em Web Worker):** Simulação matemática determinística desacoplada da UI, controlada por clock virtual.
- **REQ-ENG-04 (Modelo Acústico do Sensor JSN-SR04T):** Cálculo da velocidade do som com base na temperatura ajustável:
  $$c(T) = 331.3 \cdot \sqrt{1 + \frac{T}{273.15}} \text{ m/s}$$
  Cálculo do tempo de trânsito $t_{echo} = \frac{2 \cdot d}{c}$, modelagem da zona cega mínima ($d < 20\text{ cm}$ $\rightarrow$ `out_of_range`), alcance máximo ($d > 450\text{ cm}$ ou sem eco $\rightarrow$ `timeout`), ruído acústico gaussiano com semente reprodutível (Mulberry32) e oscilação de superfície após abastecimento.
- **REQ-ENG-05 (Modelo Geométrico e Volumétrico do Recipiente):** Só calcular volume após receber geometria e calibração do recipiente real.
- **REQ-ENG-06 (Filtro de Firmware e Qualidade):** Algoritmo em TypeScript espelhando o firmware, com rejeição de transientes e flags de qualidade.
- **REQ-ENG-07 (NFC de Referência):** Simulação do PN532 com máquina de estados SPI e aviso de que UID não é credencial criptográfica segura.
- **REQ-ENG-08 (Sensor de Tampa com Debounce):** Simulação do reed switch no GPIO7, condicionada à tampa e ao ímã reais.
- **REQ-ENG-09 (Central de Comando & Dashboard):** Exibir nível, volume e eventos somente com indicação explícita de dados simulados, documentados ou medidos.
- **REQ-ENG-10 (Conectividade Offline & Fila de Eventos):** Controle offline/online e fila local idempotente para ensaios.
- **REQ-ENG-11 (Persistência Local e Exportação/Importação):** Armazenar projetos, calibrações e logs de ensaio com schema versionado.

### 4.2. Requisitos ainda não liberados
- **REQ-FUT-01 (Emulação Wokwi ESP32-S3):** Integração com API/CLI do Wokwi e exportação de `diagram.json` para rodar o sketch C++ real do ESP32-S3 com fallback gracioso sem token.
- **REQ-FUT-02 (Renderização 3D Opcional com Three.js):** Modelo 3D interativo do tanque e bancada didática ativado sob demanda, sem pesar no carregamento padrão.
- **REQ-FUT-03 (Telemetria Externa MQTT & Gateway Python):** Conexão via WebSocket com broker MQTT local (Mosquitto) ou backend FastAPI para integração HIL física via USB.
- **REQ-FUT-04 (Geração de Esquemático KiCad):** Exportação de netlist e arquivos KiCad básicos a partir do mapa de conexões validadas na bancada.
- **REQ-FUT-05 (Hardware-in-the-Loop via Web Serial):** Conexão direta com ESP32 real via cabo USB/Serial no navegador recebendo e enviando telemetria idêntica à simulada.

### 4.3. Fora de Escopo Definitivo
- **OUT-01:** Qualquer líquido diferente de água (diesel, gasolina, etanol, fluidos combustíveis).
- **OUT-02:** Atuadores veiculares, bombas de combustível, relés de corte de motor, imobilizadores ou sensores capacitivos veiculares originais.
- **OUT-03:** Simulação CFD pesada (Navier-Stokes com malhas dinâmicas).
- **OUT-04:** Sistema de autenticação na nuvem ou dependência de servidores online no primeiro release.
- **OUT-05:** Cópia de marca, layouts ou código-fonte do HeyPCB.
- **OUT-06:** Modelos de Machine Learning inventando leituras de nível ou mascarando incertezas do sensor.

---

## 5. Estrutura de Pastas Sugerida

A estrutura organiza o projeto de forma limpa, isolando o frontend web ultraleve das ferramentas analíticas em Python:

```text
bancada_dev/
├── docs/                               # Documentação oficial e auditada
│   ├── ARCHITECTURE.md                 # Arquitetura, fluxo e contratos
│   ├── PLAN.md                         # Este documento de planejamento mestre
│   ├── TEST_PLAN.md                    # Matriz de testes (Vitest, Playwright, Pytest)
│   ├── RISKS.md                        # Gestão de riscos e honestidade técnica
│   └── THIRD_PARTY_NOTICES.md          # Licenças e atribuições legais
├── tools/                              # Ferramentas analíticas e de suporte em Python
│   ├── analytics/                      # Scripts de estudo e calibração
│   │   ├── compare_filters.py          # Benchmark: Mediana vs Kalman (FilterPy)
│   │   ├── tank_calibration.py         # Ajuste empírico de curvas V(h) com NumPy/SciPy
│   │   └── models_pydantic.py          # Espelho de contratos tipados em Pydantic
│   ├── tests/                          # Testes unitários das ferramentas Python (Pytest)
│   │   └── test_contract_parity.py     # Validação de paridade JSON com Pydantic
│   └── requirements.txt                # Dependências Python opcionais
├── public/                             # Assets estáticos, ícones e SVGs
├── src/
│   ├── core/                           # NÚCLEO DETERMINÍSTICO (Web Worker puro, zero UI)
│   │   ├── bus/                        # Barramento de eventos tipado
│   │   │   ├── event-bus.ts            # Implementação pub/sub com fila ordenada
│   │   │   └── event-contracts.ts      # Interfaces e schemas versionados (schema_version: 1)
│   │   ├── physics/                    # Modelos físicos e matemáticos
│   │   │   ├── acoustic.ts             # c(T), t_echo, atenuação e ruído
│   │   │   ├── tank-geometry.ts        # Href, h = Href - d, V(h) prismático e spline
│   │   │   └── slosh-damping.ts        # Oscilação amortecida pós-abastecimento
│   │   ├── components/                 # Modelos virtuais dos componentes
│   │   │   ├── jsn-sr04t.ts            # Sensor ultrassônico, pulso TRIG/ECHO, zona cega
│   │   │   ├── pn532.ts                # Leitor NFC, máquina de estados SPI, UIDs demo
│   │   │   ├── reed-switch.ts          # Sensor de tampa com debounce temporal
│   │   │   ├── ahct125.ts              # Buffer conversor de nível 3V3 -> 5V
│   │   │   └── voltage-divider.ts      # Divisor 10k/15k (5V -> 3.0V)
│   │   ├── firmware-logic/             # Simulação fiel do sketch do ESP32
│   │   │   ├── median-filter.ts        # Filtro mediano de 5 amostras e rejeição
│   │   │   ├── calibration-engine.ts   # Interpolação de pontos de calibração
│   │   │   └── mcu-state-machine.ts    # Orquestrador de leitura e alertas
│   │   ├── scenarios/                  # Presets e gerador de cenários com seed
│   │   │   ├── scenario-types.ts       # Tipos de cenário e parâmetros
│   │   │   └── built-in-scenarios.ts   # Nominal, agitação, eco ruidoso, tampa aberta, offline
│   │   └── worker/                     # Web Worker wrapper
│   │       ├── simulation.worker.ts    # Loop de simulação a 50 Hz em thread isolada
│   │       └── worker-bridge.ts        # Ponte de comunicação UI <-> Worker (batching 60 FPS)
│   ├── electrical/                     # REGRAS E VALIDAÇÃO ELÉTRICA
│   │   ├── pin-definitions.ts          # Pinagens oficiais do ESP32-S3, PN532, JSN, AHCT
│   │   ├── circuit-validator.ts        # Validador de topologia, nós e sobretensão
│   │   └── wire-rules.ts               # Cores de fios e convenções didáticas
│   ├── persistence/                    # PERSISTÊNCIA LOCAL (OFFLINE-FIRST)
│   │   ├── idb-storage.ts              # Driver IndexedDB via 'idb' para projetos e logs
│   │   └── json-exporter.ts            # Importador/Exportador com schema_version: 1
│   ├── ui/                             # CAMADA DE INTERFACE COM O USUÁRIO (React 19)
│   │   ├── components/                 # Componentes reutilizáveis
│   │   │   ├── badges/                 # Badges: Simulado, Aproximado, Requer Hardware
│   │   │   ├── controls/               # Play, pause, step, velocidade (0.5x, 1x, 2x)
│   │   │   └── modals/                 # Exportação, calibração e ajuda
│   │   ├── views/                      # Telas da Central de Comando
│   │   │   ├── overview/               # Visão Geral (Tanque 2D, Gráficos Chart.js, Timeline)
│   │   │   ├── bench-editor/           # Bancada Virtual & Canvas de Conexões (xyflow)
│   │   │   ├── tank-lab/               # Modelagem do Tanque e Calibração Acústica
│   │   │   ├── scenarios/              # Painel de Cenários e Injeção de Falhas
│   │   │   ├── serial-monitor/         # Console serial virtual (logs ASCII do ESP32)
│   │   │   └── hardware-guide/         # Roteiro didático para transição ao físico
│   │   └── layout/                     # Shell principal da aplicação, navegação e header
│   ├── app.tsx                         # Raiz da aplicação React
│   └── main.tsx                        # Ponto de entrada Vite
├── tests/                              # SUÍTE DE TESTES AUTOMATIZADOS (Vitest & Playwright)
│   ├── unit/                           # Testes unitários do núcleo matemático
│   ├── integration/                    # Testes de integração Web Worker + Fila Offline
│   └── e2e/                            # Testes end-to-end e visuais
├── index.html                          # Template HTML
├── package.json                        # Dependências e scripts
├── tsconfig.json                       # Configuração TypeScript estrita
├── vite.config.ts                      # Configuração Vite com worker ESM
└── tailwind.config.js                  # Tema industrial com paleta escura de alto contraste
```

---

## 6. Marcos de Implementação e Critérios de Aceite

| Marco | Denominação | Entregável Verificável | Critério de Aceite (Gate) |
| :---: | :--- | :--- | :--- |
| **M0** | **Descoberta & Planejamento** | Documentos `PLAN.md`, `ARCHITECTURE.md`, `TEST_PLAN.md`, `RISKS.md` e `THIRD_PARTY_NOTICES.md`. | **Aprovação formal do usuário** sobre escopo, licenças, regras de honestidade e arquitetura. |
| **M1** | **Casca do Sistema & Design Base** | Setup React + TS + Vite + Tailwind. Shell com navegação fluida pelas 6 rotas. Layout responsivo e acessível por teclado. | Build sem erros (`npm run build`), testes de renderização de rotas e screenshots limpas sem dados falsos. |
| **M2** | **Núcleo Determinístico em Web Worker** | Implementação de `acoustic.ts`, `tank-geometry.ts`, `median-filter.ts`, `pn532.ts`, `reed-switch.ts` e event-bus no Web Worker. Relógio com seeds repetíveis e controle de velocidade. | 100% de aprovação nos testes unitários Vitest; cálculos de $c(T)$, $h$, $V(h)$ e debounce com precisão comprovada por asserções numéricas. |
| **M3** | **Bancada Virtual & Fiação Elétrica** | Canvas de montagem com React Flow (`@xyflow/react`). Nós customizados de cada componente (ESP32-S3, PN532, JSN, AHCT, divisor, reed, LED). Fiação interativa e regras de validação elétrica em tempo real. | Alertas imediatos ao conectar 5V no pino GPIO 3V3 do ESP32; detecção de falta de buffer no TRIG; validação de terra comum. |
| **M4** | **Dashboard Integrado & Eventos** | Integração do Web Worker à tela de Visão Geral: tanque animado 2D com ondas e eco, gráficos de séries temporais Chart.js com decimação, timeline com ordenação `sim_time_ms` + `seq`, console serial virtual, fila offline e persistência em IndexedDB. | Disparo de eventos nominal, fluidez a 60 FPS comprovada, exportação e importação de JSON restaurando perfeitamente a sessão e os gráficos. |
| **M5** | **Integração Wokwi Opcional & Suporte Python** | Geração e download do `diagram.json` para ESP32-S3 DevKitC-1; sketch C++ didático espelho do firmware virtual; scripts analíticos Python (`compare_filters.py`, `models_pydantic.py`). | O sketch compila sem erros no core oficial ESP32-S3; exportação de diagramas válida segundo esquemas do Wokwi; testes Pytest de paridade aprovados. |
| **M6** | **Validação Final, A11y & E2E** | Testes automatizados Playwright em navegadores Chromium/Firefox, testes de contraste e leitor de tela (A11y), benchmark de 60 FPS sem Long Tasks, guia didático de transição para bancada física e captura de evidências. | Zero bugs críticos; todos os 10 cenários do plano de testes aprovados; relatórios exportáveis marcados categoricamente como simulados. |

---

## 7. Decisão de Stack Enxuta e Racional de Fluidez

1. **Frontend:** React 19 + TypeScript + Vite. Permite bundle estático ultrarrápido executável localmente no navegador, sem custo de servidor e com carregamento instantâneo.
2. **Estilização & Ícones:** Tailwind CSS + Lucide React. Interface escura de alta densidade informativa, ideal para centrais de controle industrial, com contraste WCAG AA e zero custo de runtime CSS.
3. **Canvas de Ligações:** `@xyflow/react` (React Flow). Solução padrão da indústria para diagramação de nós com suporte nativo a handles de pinos, drag-and-drop de conexões e cálculo de rotas de cabos em SVG, sem pesar como um canvas WebGL 3D.
4. **Gráficos Temporais:** `chart.js` + `react-chartjs-2`. Gráficos em HTML5 Canvas de alto desempenho para plotar distâncias brutas, distâncias filtradas e volumes com decimação eficiente (LTTB).
5. **Simulador Acústico/Físico:** TypeScript puro executado em Web Worker nativo do navegador. Thread separada que impede que cálculos matemáticos congelem a interface.
6. **Persistência:** IndexedDB através da biblioteca minúscula `idb` (< 2 kB). Projetos, parâmetros e logs salvos localmente no armazenamento do usuário.
7. **Testes:** Vitest para lógica e Web Worker; Playwright para navegação e ponta-a-ponta; `@testing-library/react` para componentes de UI; Pytest para scripts de análise e validação de contratos.
