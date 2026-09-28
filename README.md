# FuelGuard Virtual Test Bench

> **Bancada Didática Virtual & Estação de Projeto CAD/EDA de Alta Fidelidade**  
> Gêmeo digital verificável do FuelGuard MVP com modelos CAD 1:1, simulação física de nível e telemetria acústica.

[![Vitest Tests](https://img.shields.io/badge/Vitest-78%20Passed%20(13%20Suites)-brightgreen.svg)](#su%C3%ADte-de-testes-automatizados)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Checked-blue.svg)](#tecnologias-e-stack)
[![Three.js](https://img.shields.io/badge/3D%20Graphics-Three.js%20PBR%201%3A1-orange.svg)](#g%C3%AAmeos-digitais-cad-3d-em-escala-11)
[![tscircuit](https://img.shields.io/badge/EDA-tscircuit%20Core-purple.svg)](#pipeline-de-engenharia-eletr%C3%B4nica--circuit-json)

---

## 🌟 Visão Geral

O **FuelGuard Virtual Test Bench** é um ambiente profissional de engenharia eletrônica, mecatrônica e computação gráfica voltado à modelagem, validação e auditoria do MVP de bancada do FuelGuard.

A aplicação unifica o esquemático elétrico real, cadastro físico de fiação com bitolas e terminações, catálogo de componentes com modelos CAD 1:1 oficiais, simulação óptica PBR de fluidos com refração/menisco e um motor de auditoria DRC/ERC em tempo real.

---

## 📐 Separação Canônica de Escopos do Projeto

Para garantir integridade de engenharia e transparência técnica, o projeto adota uma fronteira estrita entre os três níveis de maturidade:

1. **Nível A — Bancada MVP Física (Prototipada em Protoboard BB-830):**
   - Microcontrolador **ESP32-S3 DevKitC-1 v1.1** (Espressif).
   - Conversor de nível lógico rápido **SN74AHCT125N DIP-14** (Texas Instruments).
   - Divisor resistivo de precisão **10 kΩ / 15 kΩ DO-41** (Yageo, IEC 60062).
   - Sensor ultrassônico estanque **JSN-SR04T v2.0** (placa azul + transdutor M20 com rosca e O-Ring).
   - Módulo Leitor NFC/RFID **PN532 v4.0** em barramento de alta velocidade SPI.
   - Sensor de abertura de tampa **Reed Switch 14 mm** + ímã de neodímio N35 com polos identificados.
   - Sinalização com **LED radial 5 mm verde óptico** e **Buzzer piezoelétrico 12 mm**.
   - Chicote com fiação flexível AWG 20/22/24/26 e conectores DuPont / JST-XH.
   - Recipiente didático PBR de dupla parede acrílica (Ø110 mm, 5L) com água potável.

2. **Nível B — Placa Adaptadora Futura (Carrier Board Dedicada):**
   - Mantida explicitamente em fase de especificação e esquemático elétrico.
   - A visualização **PCB 2D** exibe disclaimer formal de engenharia: *Bancada MVP Prototipada em Protoboard BB-830 • PCB Adaptadora em Especificação / Não Roteada em Cobre Físico*.

3. **Nível C — Produto Final Automotivo:**
   - Tanques veiculares reais de combustível (diesel/gasolina) e chassis automotivos são explicitamente demarcados como fora de escopo para esta bancada de laboratório didática.

---

## 🏛️ As 10 Estações CAD Especializadas (`CadView`)

A suíte de projeto CAD & Eletrônica conta com 10 estações integradas de engenharia:

| Estação | Finalidade Técnica |
| :--- | :--- |
| **1. Visão Geral** | Matriz de escopo (A/B/C), especificações nominais da bancada e atalhos rápidos. |
| **2. Bancada Física** | Gêmeo digital 3D PBR com protoboard BB-830, dentes em cauda de andorinha, módulos detalhados, fiação spline e tanque óptico. |
| **3. Esquemático** | Esquemático elétrico vetorial com pinagens reais, redes de sinal e nós de alimentação. |
| **4. PCB 2D** | Visualização do layout da placa adaptadora com disclaimer técnico de engenharia (sem trilhas cosméticas falsas). |
| **5. PCB 3D** | Inspeção 3D multicamadas da placa adaptadora e do controlador RP2040 Dual Stepper. |
| **6. Conexões** | Tabela completa de fiação (*Wiring Schedule*), waypoints 3D, calibres AWG, cores normalizadas e terminações mecânicas. |
| **7. Sensor & Água** | Estação de telemetria ultrassônica, ângulo de abertura acústica (15° cônico), cálculo de ToF e pipeline óptico de 6 camadas. |
| **8. BOM & Assets** | Lista oficial de materiais (BOM), part numbers reais de distribuidores (Mouser, Digi-Key, LCSC), tolerâncias e catálogo CAD. |
| **9. Testes** | Painel de validação ao vivo com execução de 78 testes de contrato e mecânica. |
| **10. Auditoria DRC** | Verificador de regras de projeto elétricas e mecânicas (DRC/ERC) com detecção de falhas e avisos didáticos. |

---

## 💎 Gêmeos Digitais CAD 3D em Escala 1:1

Todos os modelos utilizam geometria baseada em especificações públicas, datasheets oficiais e medições calibradas com paquímetro digital (0,02 mm):

- **ESP32-S3 DevKitC-1 v1.1 (Classe A):** Blindagem WROOM-1 em alumínio gravada a laser, antena MIFA serpentina em ouro ENIG, duas portas USB-C em aço inox, botões táteis e duas barras de 22 pinos headers.
- **SN74AHCT125N DIP-14 (Classe B):** Encapsulamento preto JEDEC MS-001 BA, chanfro longitudinal, chanfro do pino 1, ponto dimple e 14 pernas estanhadas com filetes de solda SAC305.
- **Divisor Resistivo DO-41 (Classe A):** Código cromático oficial IEC 60062 (10k: Marrom-Preto-Laranja-Ouro; 15k: Marrom-Verde-Laranja-Ouro) e terminais axiais estanhados conformados em 90°.
- **JSN-SR04T v2.0 (Classe C):** Placa FR-4 azul marinho com 2 furos de fixação M3 e anéis ENIG dourados (37.5 mm entre centros), CI LM324 SOIC-14 com 14 pernas *gull-wing*, transformador com braçadeira metálica aterrada, cristal HC-49/S, conector RCA fêmea dourado com dielétrico e barra de 4 pinos angulados em 90°.
- **Sonda Estanque M20:** Flange usinado Ø25 mm, anel O-Ring de vedação estanque em borracha nitrílica, 4 nervuras de rosca métrica M20x1.5 usinadas no corpo, cavidade piezoelétrica frontal rebaixada e prensa-cabo traseiro com cabo coaxial flexível.
- **PN532 v4.0 (Classe B):** PCB FR-4 roxa Adafruit Open Hardware, 4 furos M3 com ilhós metalizados ENIG nos vértices (36x34 mm), antena planar impressa de 4 espiras concêntricas em ouro ENIG, chip NXP PN532 QFN-40 central com indicador de pino 1, chave seletora DIP vermelha com cursores brancos para modo SPI (SEL0=0, SEL1=1), regulador LDO SOT-223 com aba de solda metálica e cristal cerâmico 27.12 MHz.
- **Reed Switch 14 mm (Classe B):** Ampola de vidro borossilicato selada termicamente com extremidades hemisféricas, duas lâminas ferromagnéticas (Fe-Ni) sobrepostas com gap de 0.2 mm, terminais axiais estanhados em 90° e ímã de neodímio N35 bipartido com indicação polar (Norte vermelho, Sul azul).
- **Protoboard BB-830 (Classe B):** Carcaça em ABS marfim com dentes de encaixe em cauda de andorinha (*dovetail interlocking tabs*) para montagem modular, canaleta central de 7.62 mm (300 mil), 4 barramentos com serigrafia vermelha (+) e azul (-) e matriz de pontos de conexão passo 2.54 mm.
- **Recipiente Didático de Água 5L (Classe D):** Dupla parede cilíndrica em PMMA óptico com espessura de 3.2 mm, graduação serigrafada frontal 1L a 5L, tampa de encaixe com bocal central roscado M20 e suporte elevado para antena NFC.

---

## 🌊 Pipeline Óptico PBR de 6 Camadas (Água & Tanque)

Para eliminar artefatos visuais de *depth-fighting*, cintilação de transparência e vazamento de polígonos, a renderização do tanque e fluido emprega uma passagem ordenada estrita em WebGL (`renderOrder` 1 a 6):

1. **Camada 1 (`renderOrder: 1`):** Parede posterior do cilindro externo em acrílico cristal PMMA ($\eta = 1.491$).
2. **Camada 2 (`renderOrder: 2`):** Parede posterior do cilindro interno em acrílico cristal PMMA.
3. **Camada 3 (`renderOrder: 3`):** Volume de água física com absorção ciano, transmissão óptica (88%) e índice de refração ($\eta = 1.333$).
4. **Camada 4 (`renderOrder: 4`):** Superfície líquida superior com disco elíptico e anel de tensão superficial (menisco acrílico/água).
5. **Camada 5 (`renderOrder: 5`):** Parede anterior do cilindro interno em PMMA + escala serigrafada graduada (1L a 5L).
6. **Camada 6 (`renderOrder: 6`):** Parede anterior do cilindro externo em PMMA com brilho especular e reflexão ambiental.

O controle de nível conta com 5 níveis oficiais calibrados: `[0% (Vazio), 25%, 50%, 75%, 100% (Cheio)]`. No nível 0%, a malha de água é ocultada e a distância acústica é calculada diretamente contra o fundo do tanque ($d = 141.5\text{ mm}$, $t_{eco} = 0.825\text{ ms}$).

---

## ⚡ Pipeline de Engenharia Eletrônica & Circuit JSON

- **Integração com tscircuit Core:** Geração e manipulação canônica de circuitos via `CircuitJsonBuilder`.
- **Exportação KiCad:** Exportação direta para esquemático KiCad (`.kicad_sch`) e placa de circuito impresso (`.kicad_pcb`).
- **Validador DRC/ERC em Tempo Real:**
  - `DRC-01`: Detecção fatal de sobretensão no GPIO (teto de 3.60V do ESP32-S3).
  - `DRC-02`: Presença e aterramento do pino de habilitação `/1OE` do buffer TTL.
  - `DRC-03`: Integridade do plano e nó de terra unificado (*common ground*).
  - `DRC-04`: Barramento de alimentação de 5.0V regulada para sensores industriais.
  - `DRC-05`: Aviso didático de uso de protoboard antes de fabricação física.

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
Executa a bateria de 78 testes de contrato e mecânica via Vitest:
```bash
npm test
```

### Build de Produção
```bash
npm run build
```

---

## 🧪 Suíte de Testes Automatizados (78/78 Aprovados)

O projeto conta com 13 suítes de testes unitários, mecânicos e elétricos:

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
- `tests/unit/wokwi.test.ts` (3 testes) — Integração com simulação de firmware Wokwi.
- `tests/fluid/water-sensor-consistency.test.ts` (4 testes) — Consistência física entre nível de água e leitura ultrassônica.
- `tests/unit/shell-navigation.test.tsx` (8 testes) — Roteamento das 5 abas principais e das 10 estações CAD.

---

## 📁 Estrutura de Diretórios

```text
bancada_dev/
├── fuelguard/                     # Especificações canônicas de engenharia mecânica e elétrica
│   ├── assembly/                  # bench-layout.json, cable-routes.json, collision-rules.json
│   └── assets/                    # Manifestos de assets CAD 3D com proveniência e tolerâncias
│       ├── components/            # ESP32-S3, PN532, JSN-SR04T, SN74AHCT125N, Divisor, etc.
│       └── mechanical/            # Protoboard BB-830, Tanque Didático 5L PBR
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
├── tests/                         # 78 testes automatizados em 13 suítes (Vitest)
└── tools/                         # Utilitários de calibração acústica e analytics (Python)
```

---

## 🔒 Repositório e Controle de Versão

- **Repositório GitHub:** [`https://github.com/Gustavo-prog0612/fuelguard-virtual.git`](https://github.com/Gustavo-prog0612/fuelguard-virtual.git)
- **Branch Principal:** `main`
- **Desenvolvido por:** Gustavo Baptista (`gustavobapt0612@gmail.com`)
