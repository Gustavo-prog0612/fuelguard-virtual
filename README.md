# FuelGuard — Real Hardware Engineering Reference

> **Referência de engenharia de hardware real & estação de verificação CAD/EDA**  
> Gêmeo digital auditável do FuelGuard, com peças comerciais identificadas, evidência de medidas e gates explícitos para a PCB adaptadora.

[![Vitest Tests](https://img.shields.io/badge/Vitest-83%20Passed%20(16%20Suites)-brightgreen.svg)](#su%C3%ADte-de-testes-automatizados)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Checked-blue.svg)](#tecnologias-e-stack)
[![Three.js](https://img.shields.io/badge/3D%20Graphics-Three.js%20360%C2%B0%20Inspector-orange.svg)](#-inspecionador-360-dedicado--simuladores-interativos)
[![tscircuit](https://img.shields.io/badge/EDA-tscircuit%20Core-purple.svg)](#pipeline-de-engenharia-eletr%C3%B4nica--circuit-json)

---

## 🌟 Visão Geral

O **FuelGuard** é um ambiente profissional de engenharia eletrônica, mecatrônica e computação gráfica voltado à modelagem, validação e auditoria de uma referência de hardware real. A aplicação web continua sendo um modelo digital e um instrumento de revisão; ela não substitui ensaio elétrico, metrologia, KiCad/ERC/DRC ou homologação automotiva.

A aplicação unifica a topologia elétrica de nível-fonte, o cadastro físico de fiação com bitolas e terminações, catálogo de componentes com proveniência A/B/C/D, simulação de sinais e auditorias DRC/ERC de referência. Ela não promove dados nominais ou uma montagem de bancada a uma PCB fabricável.

---

## 📐 Separação Canônica de Escopos do Projeto

Para garantir integridade de engenharia e transparência técnica, o projeto adota uma fronteira estrita entre os três níveis de maturidade:

1. **Nível A — Referência física de engenharia (protótipo em protoboard MB-102):**
   - Microcontrolador **ESP32-S3 DevKitC-1 v1.1** (Espressif).
   - Sensor de nível **DFRobot A02YYUW / SEN0311**, UART TTL 9600 8N1, alimentado em 3,3 V.
   - Módulo leitor NFC/RFID **Elechouse PN532 V4** em SPI, instalado em suporte frontal.
   - Sensor de abertura de tampa **MC-38 com ímã**; variante, gap e estado NO/NC dependem do lote comprado.
   - Sinalização com **LED verde de 5 mm + resistor de 220 Ω** e buzzer ativo **Same Sky CMI-1295IC-0385T**.
   - Chicote com fiação flexível AWG 20/22/24/26 e conectores DuPont / JST-XH.
   - Tanque de bancada **FG-TANK-5L-CYL-R1**, cilíndrico em acrílico de 3 mm, interno Ø200 × 160 mm, tampa circular de 5 mm e quatro fixações M3.

2. **Nível B — Placa adaptadora de engenharia:**
   - Mantida explicitamente em fase de especificação; ainda sem PCB fabricável.
   - A visualização **PCB 2D** exibe o estado real: *referência de engenharia • PCB adaptadora não roteada em cobre físico*.

3. **Nível C — Integração veicular:**
   - Exige veículo, tanque, conectores, ambiente elétrico, EMC, vibração, vedação e compatibilidade química identificados. Não é considerada homologada por este repositório.

---

## 🏛️ As 10 Estações CAD Especializadas (`CadView`)

A suíte de projeto CAD & Eletrônica conta com 10 estações integradas de engenharia:

| Estação | Finalidade Técnica |
| :--- | :--- |
| **1. Visão Geral** | Matriz de escopo (A/B/C), especificações nominais da bancada e atalhos rápidos. |
| **2. Bancada Física** | Montagem 3D de referência com protoboard MB-102, módulos identificados, fiação auditável e tanque bloqueado até evidência física. |
| **3. Esquemático** | Esquemático elétrico vetorial com pinagens reais, redes de sinal e nós de alimentação. |
| **4. PCB 2D** | Estado honesto da placa adaptadora; só desenha cobre/footprints quando há dados reais. |
| **5. PCB 3D** | Gate honesto da PCB FuelGuard; será habilitado após existir geometria fabricável revisada. |
| **6. Conexões** | Tabela completa de fiação (*Wiring Schedule*), waypoints 3D, calibres AWG, cores normalizadas e terminações mecânicas. |
| **7. Sensor & Água** | Estação de metrologia do SEN0311; distância UART, volume, abertura e CAD do recipiente ficam pendentes até lote e medição. |
| **8. BOM & Assets** | Lista oficial de materiais (BOM), part numbers reais de distribuidores (Mouser, Digi-Key, LCSC), tolerâncias e catálogo CAD. |
| **9. Testes** | Painel de verificações com evidência, PASS/PENDING/FAIL e bloqueios de fabricação. |
| **10. Auditoria DRC** | Verificador de regras de projeto elétricas e mecânicas (DRC/ERC) com detecção de falhas e avisos didáticos. |

---

## 🔬 Inspecionador 360° Dedicado & Simuladores Interativos

Ao clicar em qualquer placa ou sensor na montagem 3D da bancada (ou através dos atalhos rápidos da interface), o ambiente de fundo recebe um desfoque óptico profundo (`backdrop-blur-2xl bg-slate-950/80`) e o componente é isolado num **estúdio Three.js fotorealista** com iluminação *Three-Point* (Key, Fill, Rim Light), mesa giratória com anéis concêntricos graduados, sombra de contato de solo e rotação contínua 360° com controles de órbita manual (drag) e aproximação (zoom):

- **ESP32-S3 DevKitC-1 v1.1:**
  - Visualizador dinâmico de carga das tarefas FreeRTOS nos dois núcleos (Core 0 e Core 1 @ 240 MHz).
  - Gatilhos interativos para simular recepção de frame UART de nível (300 mm), autenticação de tag NFC autorizada, alarme de violação de tampa (Reed Switch) e soft reset do microcontrolador.
  - Console serial virtual em tempo real com logs formatados de eventos do firmware.
- **PN532 V4 NFC/RFID:**
  - Slider dinâmico de aproximação de transponder RFID 13.56 MHz (0 a 50 mm).
  - Decodificação de UID ISO/IEC 14443A (`04:E2:89:1A:4C:5B:80`) e identificação de caminhão da frota autorizada ("Caminhão Tanque #402").
  - Sniffer de tráfego de barramento SPI exibindo frames de comando e resposta em hexadecimal.
- **DFRobot SEN0311 / A02YYUW:**
  - Transdutor ultrassônico com controle deslizante de lâmina d'água (15 a 160 mm).
  - Cálculo analítico do pulso acústico *Time-of-Flight* em microssegundos ($t = \frac{2 \cdot d}{v}$), volume útil em mL e alarme de saturação na zona cega (< 30 mm).
  - Montador e gerador de pacotes seriais binários UART de 4 bytes (`0xFF + Data_H + Data_L + Checksum`).
- **MC-38 Reed Switch:**
  - Sensor de intertravamento de segurança magnética com aproximação do ímã da tampa (0 a 25 mm).
  - Leitor analógico de densidade de fluxo magnético em Gauss, chaveamento elétrico (GND vs Pull-up 3.3V) e disparo imediato de alerta de adulteração.
- **Protoboard MB-102:**
  - Inspetor dos barramentos de distribuição de energia (+5V USB, +3.3V LDO e plano de terra equipotencial GND).
  - Medição de continuidade e resistência de contato entre trilhas.

---

## 🗜️ Mecatrônica de Bancada & Cabeamento Realista

Eliminação completa de aproximações visuais, componentes suspensos ou conexões que cruzam materiais sólidos:

1. **Apoio e Fixação Mecânica Estrutural:**
   - **Módulo PN532 V4:** Apoiado sobre base usinada (`48 x 2 x 48 mm`) com **4 pés de borracha de silicone anti-derrapante** diretamente sobre a manta antiestática ESD (`y = 3.0 mm`). A placa de acrílico frontal é ancorada à base por **4 pilares stanchion cilíndricos em alumínio anodizado** ($\varnothing 5 \text{ mm}$, $16.25 \text{ mm}$) com porcas recartilhadas M3.
   - **Protoboard MB-102 e Tanque:** Nivelados rigorosamente no plano de trabalho sem folgas ou penetração.
2. **Chicotes em Curvas Elásticas Catmull-Rom:**
   - Todo o cabeamento utiliza splines centripetais contínuas de 64 segmentos (`CatmullRomCurve3`), reproduzindo o raio mínimo de curvatura e o caimento gravítico elástico de fios flexíveis de cobre 24 AWG.
3. **Terminações DuPont Verticais:**
   - Os conectores DuPont fêmea e pinos macho entram com orientação estritamente perpendicular `(0, 1, 0)` nos orifícios da protoboard e nos pin headers dos módulos, eliminando inclinações espúrias a 45°.
4. **Roteamento por Canaletas e Eletrodutos:**
   - O chicote do sensor ultrassônico SEN0311 sobe pelo topo da sonda, passa pelo clipe da tampa, desce pelo conduíte vertical externo do cilindro até a base e corre pela canaleta de piso até a protoboard, sem atravessar as paredes do tanque acrílico.
   - O chicote SPI do PN532 contorna a coluna traseira do suporte sem colidir com as faces de acrílico.

## 💎 Geometria CAD e evidência de componentes

Os modelos são classificados por proveniência. A/B/C/D indicam a força da evidência, não uma autorização de fabricação. A geometria renderizada sem arquivo CAD ou medição aprovada é apenas referência:

- **ESP32-S3 DevKitC-1 v1.1 (Classe A):** módulo comercial de referência com dimensões nominais e fonte Espressif declarada.
- **SEN0311 (Classe C):** função elétrica e protocolo documentados; envelope do probe, cabo, terminal e prensa-cabo devem ser medidos.
- **PN532 V4 (Classe C):** módulo comercial parametrizado; header, furos, altura e keepout da antena devem ser confirmados.
- **MC-38 (Classe D):** família comercial sem MPN único; corpo, ímã, gap, NO/NC e fixação dependem do lote.
- **MB-102 (Classe C):** envelope de referência; fabricante, trilhos, pés e altura da unidade recebida devem ser confirmados.
- **Buzzer CMI-1295IC-0385T (Classe B):** MPN e envelope documentados; passo, polaridade e corrente real ainda precisam ser medidos.
- **Tanque/tampa FG-TANK-5L-CYL-R1 (Classe C/site-specific):** geometria cilíndrica paramétrica de aproximadamente 5,0265 L, ainda pendente de fabricação, medição e calibração com água.

---

## 🌊 Tanque, tampa e metrologia

A geometria do recipiente, da tampa, do suporte do transdutor e do caminho acústico está bloqueada. O repositório não assume tanque cilíndrico, volume de 5 L, acrílico, altura, fundo ou curva de calibração. Esses dados só entram após identificação do veículo/recipiente, desenho ou CAD do fornecedor e protocolo de medição física.

Os controles de nível são apenas perfis de ensaio sem unidade física; eles não produzem volume, distância, tempo de eco ou aprovação de zona cega. Consulte [`docs/REAL_HARDWARE_COMPONENT_RESEARCH.md`](docs/REAL_HARDWARE_COMPONENT_RESEARCH.md) e [`hardware/measurements/measurement-register.json`](hardware/measurements/measurement-register.json).

---

## ⚡ Pipeline de Engenharia Eletrônica & Circuit JSON

- **Integração com tscircuit Core:** Geração e manipulação canônica de circuitos via `CircuitJsonBuilder`.
- **Exportação KiCad:** Circuit JSON de referência disponível; esquemático e `.kicad_pcb` permanecem bloqueados até existirem medições, footprints e roteamento reais.
- **Validador DRC/ERC em Tempo Real:**
  - `DRC-01`: Detecção fatal de sobretensão no GPIO (teto de 3.60V do ESP32-S3).
  - `DRC-02`: Integridade do retorno GND comum entre ESP32-S3, SEN0311 e periféricos.
  - `DRC-03`: Ausência de condicionamento legado no UART do SEN0311.
  - `DRC-05`: Aviso de referência paramétrica antes de fabricação física.

---

## 🚀 Instalação e Execução

### Pré-requisitos
- **Node.js** (v18+ recomendado)
- **npm** (v9+)

### Instalar Dependências
```bash
npm install
```

### Executar em Desenvolvimento
Inicia a bancada no servidor local com Vite:
```bash
npm run dev
# Servidor disponível em: http://127.0.0.1:5173/
```

### Compilação de Tipos TypeScript
```bash
npx tsc --noEmit
```

### Suíte de Testes Automatizados
Executa a bateria de testes de contrato e mecânica via Vitest:
```bash
npm test
```

### Build de Produção
```bash
npm run build
```

---

## 🧪 Suíte de Testes Automatizados (83 testes em 16 suítes)

O projeto conta com 16 suítes de testes unitários, mecânicos e elétricos executadas pelo Vitest com 100% de aprovação. A interface de CAD não transforma pendências de fabricação em PASS:

- `tests/mechanical/bench-assembly.test.ts` (6 testes) — Ponto de apoio, fixação mecatrônica, pés de silicone e ausência de componentes flutuantes.
- `tests/unit/assembly-auditor.test.ts` (8 testes) — Regras de montagem mecânica da bancada e integridade da fiação.
- `tests/electrical/netlist-consistency.test.ts` (6 testes) — Paridade de netlists e conexões elétricas de pinos.
- `tests/unit/cad-circuit-json.test.ts` (8 testes) — Esquema Circuit JSON, classes A/B/C/D e exportações EDA.
- `tests/assets/model-registry.test.ts` (4 testes) — Integridade do registro de modelos 3D e carregamento de GLBs.
- `tests/assets/asset-manifests.test.ts` (4 testes) — Auditoria de rastreabilidade e integridade dos manifestos CAD 3D.
- `tests/unit/scene-object-registry.test.ts` (2 testes) — Registro e identificação de objetos e componentes da cena 3D.
- `tests/unit/circuit-validator.test.ts` (4 testes) — Proteção contra sobretensão e casamento de impedâncias.
- `tests/hardware/adapter-inputs.test.ts` (3 testes) — Validação de sinais e barramentos da placa adaptadora.
- `tests/unit/persistence.test.ts` (5 testes) — Persistência e exportação de dados em IndexedDB.
- `tests/unit/m4-integration.test.ts` (3 testes) — Integração e interoperabilidade mecatrônica.
- `tests/unit/core-simulation.test.ts` (16 testes) — Motor acústico, física do líquido, filtro de mediana e máquina de estados.
- `tests/fluid/water-sensor-consistency.test.ts` (2 testes) — Consistência física entre nível de água, distância e volume.
- `tests/unit/mesh-collision.test.ts` (2 testes) — Consultas de colisão e proximidade geométrica.
- `tests/unit/engineering-verification.test.ts` (2 testes) — Estados PASS/PENDING e rastreabilidade do painel de engenharia.
- `tests/unit/shell-navigation.test.tsx` (8 testes) — Roteamento das abas principais e das estações CAD.

---

## 📁 Estrutura de Diretórios

```text
bancada_dev/
├── hardware/                      # Contratos canônicos de peças, nets, montagem, BOM e status da PCB
├── fuelguard/                     # Especificações canônicas de engenharia mecânica e elétrica
│   ├── assembly/                  # bench-layout.json, cable-routes.json, collision-rules.json
│   └── assets/                    # Manifestos de assets CAD 3D com proveniência e tolerâncias
│       ├── components/            # ESP32-S3, PN532 V4, SEN0311, MC-38, LED e buzzer
│       └── mechanical/            # Protoboard MB-102 e tanque/tampa paramétricos
├── public/models/                 # Assets GLB oficiais e manifestos de proveniência
├── scripts/                       # Scripts utilitários de captura de evidências e auditoria
├── src/
│   ├── circuit-cad/               # Biblioteca canônica de componentes, Circuit JSON e DRC
│   ├── core/                      # Simulação física acústica, slosh damping e Web Worker
│   ├── electrical/                # Validador de circuitos elétricos e pinagens
│   ├── persistence/               # Armazenamento IndexedDB e exportador JSON
│   └── ui/
│       ├── components/            # Navbar, Sidebar, Badges de honestidade intelectual
│       ├── layout/                # Estrutura principal da interface
│       └── views/
│           ├── bench/             # Estação 1: Bancada Didática Interativa
│           ├── signals/           # Estação 2: Osciloscópio & Sinais em Tempo Real
│           ├── events/            # Estação 3: Linha do Tempo de Eventos de Firmware
│           ├── tests/             # Estação 4: Painel de Testes do Sistema
│           └── cad/               # Estação 5: Projeto CAD, 10 Workspaces e Montagem 3D
├── tests/                         # Testes automatizados e verificações de evidência (Vitest)
└── tools/                         # Utilitários de calibração acústica e analytics (Python)
```

---

## 🔒 Repositório e Controle de Versão

- **Repositório GitHub:** [`https://github.com/Gustavo-prog0612/fuelguard-virtual.git`](https://github.com/Gustavo-prog0612/fuelguard-virtual.git)
- **Branch Principal:** `main`
- **Desenvolvido por:** Gustavo Baptista (`gustavobapt0612@gmail.com`)
