# FuelGuard Virtual Test Bench

> **Bancada Didática Virtual & Estação de Projeto CAD/EDA de Alta Fidelidade**  
> Simulação física e elétrica em tempo real para ESP32-WROOM-32E e RP2040 Dual Stepper Motor Controller (`tscircuit` Core).

---

## 🌟 Visão Geral

O **FuelGuard Virtual Test Bench** é um ambiente profissional de engenharia mecatrônica, eletrônica e de computação desenvolvido para simular, auditar e projetar o sistema de telemetria e intertravamento de nível para recipientes de teste (galão didático de 5L com água).

### Destaques do Projeto
- **Arquitetura Dual-Board CAD:**
  - **Carrier Board FuelGuard (ESP32-WROOM-32E):** Placa didática principal (140 × 100 mm), com condicionamento de sinal, conversor de nível SN74AHCT125N, divisor resistivo 10k/15k e conectores JST-XH.
  - **RP2040 Dual Stepper Motor Controller (imrishabh18):** Módulo de potência NEMA 17 Cap (42.3 × 42.3 mm, 4 camadas), driver Texas Instruments DRV8847, shunts de corrente TI INA241A1, monitor térmico I2C TI TMP102, USB-C PD 12V e 270 vias de costura (via stitching).
- **Pipeline Canônico Circuit JSON (tscircuit Core):**
  - Exportação e importação nativa de esquemáticos e layouts PCB em formato universal `Circuit JSON v1`.
  - Exportação direta para esquemático KiCad 8/9 (`.kicad_sch`) e layout PCB KiCad 8/9 (`.kicad_pcb`).
- **Gêmeos 3D em Escala 1:1 (WebGL / Three.js PBR):**
  - Materiais fisicamente realistas (FR-4, cobre ENIG, filetes de solda SAC305, serigrafia nítida, portas USB-C em aço inox).
  - Visualizador de montagem física de bancada com protoboard BB-830, tapete ESD, galão didático com água translúcida e chicote tubular de cabos.
  - Vistas dedicadas: Montagem Geral, Fiação e Conexões, Vista Explodida com guias axiais e Simulação de Sensores (5 níveis oficiais).
- **Verificação de Regras DRC/ERC em Tempo Real:**
  - Detecção imediata de sobretensão no GPIO (ex: 5V direto no pino sem atenuação).
  - Conformidade IPC-2221 para espaçamento dielétrico de 0,15 mm (6 mil) e continuidade do plano de terra unificado.

---

## 🚀 Instalação e Execução

### Pré-requisitos
- **Node.js** (v18+ recomendado)
- **npm** (v9+)

### Instalar Dependências
```bash
npm install
```

### Modo de Desenvolvimento
Inicia o servidor de desenvolvimento com Hot Module Replacement (HMR):
```bash
npm run dev
```

### Construção de Produção
Gera o bundle otimizado na pasta `dist/`:
```bash
npm run build
```

### Visualização do Build de Produção
```bash
npm run preview -- --port 5174
```

### Suíte de Testes Automatizados
Executa todos os 59 testes unitários com Vitest:
```bash
npm test
```

---

## 📁 Estrutura do Repositório

```text
bancada_dev/
├── firmware/                  # Firmware de referência Arduino/C++ para ESP32
├── public/data/rp2040/        # Assets oficiais tscircuit (circuit.json, SVGs, 3D render)
├── src/
│   ├── circuit-cad/           # Núcleo CAD, Circuit JSON builder, provedor RP2040 e DRC
│   ├── core/                  # Motores de simulação física acústica, slosh e Web Worker
│   ├── electrical/            # Validador de circuitos elétricos e pinagens
│   ├── persistence/           # Armazenamento local e exportador JSON
│   └── ui/
│       ├── layout/            # Estrutura de navegação e shell da aplicação
│       └── views/
│           ├── bench/         # Estação 1: Bancada Didática
│           ├── signals/       # Estação 2: Sinais & Osciloscópio
│           ├── events/        # Estação 3: Linha do Tempo de Eventos
│           ├── tests/         # Estação 4: Painel de Testes
│           ├── guide/         # Estação 5: Guia & Especificações
│           └── cad/           # Estação 6: Projeto CAD, EDA 2D, Gêmeo 3D e Montagem
├── tests/unit/                # 59 testes unitários automatizados (Vitest)
└── tools/                     # Scripts de calibração acústica e analytics (Python)
```

---

## 🔒 Licença e Confidencialidade
Repositório privado mantido para fins de validação didática e prototipagem do FuelGuard.
