# FuelGuard — Real Hardware Engineering Reference

> **Referência de engenharia de hardware real & estação de verificação CAD/EDA**  
> Gêmeo digital auditável do FuelGuard, com peças comerciais identificadas, evidência de medidas e gates explícitos para a PCB adaptadora.

[![Vitest Tests](https://img.shields.io/badge/Vitest-79%20Passed%20(15%20Suites)-brightgreen.svg)](#su%C3%ADte-de-testes-automatizados)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Checked-blue.svg)](#tecnologias-e-stack)
[![Three.js](https://img.shields.io/badge/3D%20Graphics-Three.js%20engineering%20reference-orange.svg)](#tanque-tampa-e-metrologia)
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
   - Tanque de bancada **FG-TANK-6L-R1**, acrílico de 3 mm, interno 200 × 200 × 160 mm, tampa de 5 mm e quatro fixações M3.

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
| **5. PCB 3D** | Viewer da PCB RP2040 importada; FuelGuard fica bloqueado até existir geometria revisada. |
| **6. Conexões** | Tabela completa de fiação (*Wiring Schedule*), waypoints 3D, calibres AWG, cores normalizadas e terminações mecânicas. |
| **7. Sensor & Água** | Estação de metrologia do SEN0311; distância UART, volume, abertura e CAD do recipiente ficam pendentes até lote e medição. |
| **8. BOM & Assets** | Lista oficial de materiais (BOM), part numbers reais de distribuidores (Mouser, Digi-Key, LCSC), tolerâncias e catálogo CAD. |
| **9. Testes** | Painel de verificações com evidência, PASS/PENDING/FAIL e bloqueios de fabricação. |
| **10. Auditoria DRC** | Verificador de regras de projeto elétricas e mecânicas (DRC/ERC) com detecção de falhas e avisos didáticos. |

---

## 💎 Geometria CAD e evidência de componentes

Os modelos são classificados por proveniência. A/B/C/D indicam a força da evidência, não uma autorização de fabricação. A geometria renderizada sem arquivo CAD ou medição aprovada é apenas referência:

- **ESP32-S3 DevKitC-1 v1.1 (Classe A):** módulo comercial de referência com dimensões nominais e fonte Espressif declarada.
- **SEN0311 (Classe C):** função elétrica e protocolo documentados; envelope do probe, cabo, terminal e prensa-cabo devem ser medidos.
- **PN532 V4 (Classe C):** módulo comercial parametrizado; header, furos, altura e keepout da antena devem ser confirmados.
- **MC-38 (Classe D):** família comercial sem MPN único; corpo, ímã, gap, NO/NC e fixação dependem do lote.
- **MB-102 (Classe C):** envelope de referência; fabricante, trilhos, pés e altura da unidade recebida devem ser confirmados.
- **Buzzer CMI-1295IC-0385T (Classe B):** MPN e envelope documentados; passo, polaridade e corrente real ainda precisam ser medidos.
- **Tanque/tampa FG-TANK-6L-R1 (Classe C/site-specific):** geometria paramétrica aprovada, ainda pendente de fabricação, medição e calibração com água.

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

## 🧪 Suíte de Testes Automatizados (79 testes)

O projeto conta com 15 suítes de testes unitários, mecânicos e elétricos. A interface de CAD não transforma pendências de fabricação em PASS:

- `tests/unit/circuit-validator.test.ts` (5 testes) — Proteção contra sobretensão e casamento de impedâncias.
- `tests/unit/persistence.test.ts` (5 testes) — Persistência e exportação de dados em IndexedDB.
- `tests/mechanical/bench-assembly.test.ts` (5 testes) — Ponto de apoio, ausência de componentes flutuantes e regras de folga mecânica.
- `tests/unit/assembly-auditor.test.ts` (8 testes) — Regras de montagem mecânica da bancada.
- `tests/electrical/netlist-consistency.test.ts` (6 testes) — Paridade de netlists e conexões elétricas.
- `tests/unit/rp2040-integration.test.ts` (5 testes) — Integração e telemetria do controlador RP2040.
- `tests/unit/cad-circuit-json.test.ts` (6 testes) — Esquema Circuit JSON, classes A/B/C/D e exportações EDA.
- `tests/assets/asset-manifests.test.ts` (4 testes) — Auditoria de rastreabilidade e integridade dos manifestos CAD 3D.
- `tests/unit/m4-integration.test.ts` (3 testes) — Integração mecatrônica.
- `tests/unit/core-simulation.test.ts` (16 testes) — Motor acústico, física do líquido, filtro de mediana e máquina de estados.
- `tests/fluid/water-sensor-consistency.test.ts` (2 testes) — Consistência física entre nível de água, distância e volume.
- `tests/unit/shell-navigation.test.tsx` (8 testes) — Roteamento das abas principais e das estações CAD.
- `tests/unit/mesh-collision.test.ts` (2 testes) — Consultas de interseção com `three-mesh-bvh`.
- `tests/unit/engineering-verification.test.ts` (2 testes) — Estados PASS/PENDING e rastreabilidade do painel de engenharia.

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
├── public/data/                   # Assets públicos e diagramas SVG/GLB
├── rp2040-motor-controller/       # Módulo tscircuit RP2040 Dual Stepper Motor Controller
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
