# FuelGuard Virtual Test Bench — Plano de Testes Automatizados e Validação

> **Documento:** TEST_PLAN.md  
> **Versão:** 1.1.0  
> **Status:** Proposta de Engenharia para Revisão  
> **Referência:** Brief de Produto e Simulação FuelGuard (Seção 11: Critérios de Aceite) & Requisitos de Performance

---

## 1. Visão Geral da Pirâmide de Testes e Garantia de Performance

A estratégia de testes do FuelGuard Virtual Test Bench é estruturada em 4 níveis complementares para garantir precisão matemática determinística, conformidade com os requisitos do briefing e **fluidez absoluta sem engasgos (60 FPS)**:

```text
        ▲
       / \        Nível 4: Testes E2E, Visuais e A11y (Playwright)
      /   \       [Cenários do Briefing, Interação com Fiação, Responsividade, 60 FPS]
     /─────\
    /       \     Nível 3: Testes de Integração e Barramento (Vitest)
   /         \    [Web Worker, Event Bus, Fila Offline, Persistência IndexedDB]
  /───────────\
 /             \  Nível 2: Testes Unitários de Modelos Puros (Vitest)
/───────────────\ [Acústica, Geometria, Filtro Mediano, Debounce, Regras Elétricas]
       │
       ▼
 Nível 1: Validação Analítica & Espelho de Contratos em Python (Pytest)
 [Pydantic Schemas vs JSON Fixtures, Benchmark Mediana vs Kalman, Calibração NumPy/SciPy]
```

---

## 2. Nível 2: Testes Unitários do Núcleo Matemático e Elétrico (Vitest)

Executados instantaneamente no ambiente de desenvolvimento Node/Vite sem dependência de DOM:

### 2.1. Modelagem Acústica e Sensor JSN-SR04T (`tests/unit/acoustic.test.ts`)
- **UT-AC-01 (Velocidade do Som vs Temperatura):**
  - Asserção: $c(20^\circ\text{C}) \approx 343.21\text{ m/s} \pm 0.05\text{ m/s}$.
  - Asserção: $c(0^\circ\text{C}) \approx 331.30\text{ m/s} \pm 0.05\text{ m/s}$.
  - Asserção: $c(35^\circ\text{C}) \approx 351.88\text{ m/s} \pm 0.05\text{ m/s}$.
- **UT-AC-02 (Tempo de Trânsito Ultrassônico):**
  - Asserção: Para $d = 1.0\text{ m}$ e $T = 20^\circ\text{C}$, $t_{echo} = \frac{2 \cdot 1.0}{343.21} \approx 5.827\text{ ms} \pm 0.005\text{ ms}$.
- **UT-AC-03 (Zona Cega do JSN-SR04T):**
  - Asserção: Para distâncias $d < 20\text{ cm}$, o sensor emite flag `out_of_range` e saturação em limite mínimo, simulando o anelamento piezoelétrico real.
- **UT-AC-04 (Timeout de Eco):**
  - Asserção: Para $d > 450\text{ cm}$ ou ausência de superfície refletora, o sensor atinge timeout ($30\text{ ms}$) e emite flag `timeout`.
- **UT-AC-05 (Determinismo do Ruído com Semente PRNG):**
  - Asserção: Rodando 100 amostras com a semente Mulberry32 `seed = 42`, os valores de ruído obtidos são 100% idênticos entre execuções sucessivas.

### 2.2. Geometria do Recipiente e Calibração (`tests/unit/tank-geometry.test.ts`)
- **UT-GEO-01 (Cálculo de Altura d'Água):**
  - Asserção: Para $H_{ref} = 100.0\text{ cm}$ e $d = 42.0\text{ cm}$, a altura calculada deve ser $h = 58.0\text{ cm}$.
  - Asserção: Se $d > H_{ref}$, altura $h = 0.0\text{ cm}$ (tanque vazio), nunca negativa.
- **UT-GEO-02 (Volume Prismático):**
  - Asserção: Para base retangular $50\text{ cm} \times 40\text{ cm}$ ($A = 2000\text{ cm}^2 = 0.2\text{ m}^2$) e $h = 50\text{ cm}$, volume calculado $V = 100.0\text{ L}$.
- **UT-GEO-03 (Interpolação de Tabela de Calibração Empírica):**
  - Asserção: Dada tabela $[ (10\text{ cm}, 5.0\text{ L}), (20\text{ cm}, 12.0\text{ L}), (30\text{ cm}, 21.0\text{ L}) ]$, para $h = 15\text{ cm}$, a interpolação monotônica retorna $8.5\text{ L} \pm 0.1\text{ L}$.

### 2.3. Filtros de Firmware e Máquinas de Estado (`tests/unit/firmware.test.ts`)
- **UT-FW-01 (Filtro Mediano de 5 Amostras):**
  - Entrada: Sequência $[42.1, 42.0, 99.9\text{ (ruído espúrio)}, 42.2, 42.1]$.
  - Asserção: Saída do filtro mediano rejeita perfeitamente o outlier $99.9$ e retorna $42.1\text{ cm}$ com status `valid`.
- **UT-FW-02 (Debounce do Reed Switch da Tampa):**
  - Entrada: Rajada de 10 transições oscilatórias em $15\text{ ms}$ (ruído de contato mecânico), estabilizando em nível fechado.
  - Asserção: Apenas um único evento `lid.changed` é disparado, exatamente $50\text{ ms}$ após a estabilização final do sinal.
- **UT-FW-03 (Máquina de Estados NFC PN532):**
  - Asserção: Tag cadastrada `04:3A:7F:2C:5D` dispara `session.started` com flag de operador didático.
  - Asserção: Tag desconhecida `04:9B:11:3E:8A` dispara `nfc.denied` sem iniciar sessão e sem alterar estados de outros componentes.

### 2.4. Validação de Conexões Elétricas (`tests/unit/circuit-validator.test.ts`)
- **UT-ELEC-01 (Detecção de Sobretensão no GPIO6):**
  - Entrada: Conexão direta do pino ECHO (5V) no GPIO6 do ESP32 sem divisor.
  - Asserção: O validador retorna erro crítico `RULE-ELEC-01` e desativa o sensor virtual para simular proteção contra queima.
- **UT-ELEC-02 (Validação do Divisor 10k/15k):**
  - Entrada: ECHO -> Resistor 10 kΩ -> Nó GPIO6 -> Resistor 15 kΩ -> GND.
  - Asserção: O validador calcula tensão nominal $V_{in} = 3.00\text{ V}$ e aprova o circuito como válido (`RULE-OK`).
- **UT-ELEC-03 (Detecção de Falta de Buffer AHCT125 no TRIG):**
  - Entrada: GPIO5 ligado diretamente ao TRIG do JSN alimentado em 5V.
  - Asserção: O validador retorna aviso didático `RULE-ELEC-02` informando nível marginal de disparo TTL/CMOS.

---

## 3. Nível 3: Testes de Integração e Barramento (Vitest)

- **IT-01 (Ciclo de Vida do Web Worker e Clock):**
  - Enviar comandos `START`, `PAUSE`, `SET_SPEED(2.0)`, `STEP` via `postMessage`.
  - Asserção: O relógio virtual avança proporcionalmente ao clock configurado e emite ticks sem perda de sincronia.
- **IT-02 (Ordenação e Idempotência de Eventos):**
  - Asserção: Todos os eventos despachados pelo barramento possuem sequência monotônica estrita: `seq[n+1] = seq[n] + 1` e `sim_time_ms[n+1] >= sim_time_ms[n]`.
- **IT-03 (Fila Offline e Replay de Conectividade):**
  - Estimular 20 eventos com `network = offline`.
  - Asserção: Os 20 eventos permanecem na fila local (`pending_queue.length == 20`).
  - Alternar rede para `network = online`.
  - Asserção: A fila descarrega totalmente para os consumidores sem duplicação de `event_id` e restaura a integridade das séries temporais.
- **IT-04 (Persistência IndexedDB e Reabertura de Sessão):**
  - Criar um projeto com parâmetros customizados ($H_{ref} = 85\text{ cm}$, calibração empírica de 6 pontos).
  - Salvar no IndexedDB, reiniciar o contexto de teste e recarregar os dados.
  - Asserção: Todos os parâmetros e históricos de gráficos são restaurados com fidelidade bit a bit.

---

## 4. Nível 4: Testes End-to-End e Critérios de Aceite (Playwright)

Matriz formal de validação rastreada diretamente à **Seção 11 do Briefing**:

| ID Teste | Estímulo no Sistema | Resultado Esperado e Asserção |
| :--- | :--- | :--- |
| **E2E-01** | **NFC Permitido:** Selecionar tag autorizada no painel de controle. | Sessão de teste demonstrativa é iniciada; badge de operador exibe nome didático; **sem** acionamento de qualquer atuador veicular. |
| **E2E-02** | **NFC Recusado:** Selecionar tag desconhecida. | Recusa explícita; banner de alerta didático; evento `nfc.denied` registrado na timeline; dados do tanque continuam sendo lidos normalmente sem autorização de sessão. |
| **E2E-03** | **Tampa com Debounce:** Pressionar botão de abertura/fechamento da tampa repetidas vezes em menos de 50 ms. | Oscilações transitórias visíveis no monitor bruto, mas apenas um único evento `lid.changed` consolidado na timeline após a estabilização mecânica. |
| **E2E-04** | **Nível Crescente / Decrescente:** Alterar volume d'água em degraus graduais (adicionar 5 L, retirar 10 L). | Distância acústica medida varia em sentido exatamente inverso à coluna d'água ($d$ diminui quando nível sobe); volume calculado em litros converge conforme a curva $V(h)$. |
| **E2E-05** | **Eco Ruim / Fora de Faixa:** Injetar ruído severo ou aproximar a água para menos de 20 cm do sensor. | Indicador de qualidade muda para `unstable` ou `out_of_range`; display não mascara o erro e impede a declaração de volume como "garantido". |
| **E2E-06** | **Calibração de Bancada:** Inserir 4 pontos de medição física na tabela e aplicar calibração. | Curva interpolada é atualizada visualmente no gráfico; `calibration_id` associado aos eventos futuros reflete a nova curva salva. |
| **E2E-07** | **Conectividade Offline:** Desligar transporte virtual, injetar 5 amostras e reconectar. | Contador de fila pendente incrementa no badge de rede; após reconexão, replay ocorre ordenadamente e a timeline é atualizada sem falhas. |
| **E2E-08** | **Exportação e Importação JSON:** Exportar cenário executado para arquivo `.json`, limpar a aplicação e importar o arquivo. | Todos os parâmetros do tanque, tabela de calibração, eventos e configurações restauram perfeitamente com `schema_version: 1`. |
| **E2E-09** | **Acessibilidade e Responsividade:** Executar todas as rotas e controles com teclado (`Tab`, `Enter`, `Espaço`) em resoluções mobile (375px) e desktop (1920px). | Foco visível em todos os elementos interativos; contraste de cores em conformidade com WCAG AA; gráficos e tabelas adaptáveis sem quebras. |
| **E2E-10** | **Fluidez e Anti-Jank (60 FPS):** Monitorar taxa de quadros e tempo de resposta durante simulação acelerada (2x) com animação do tanque. | Média mantida acima de 58 FPS; thread principal sem bloqueios (*Long Tasks* > 50 ms zeradas). |

---

## 5. Nível 1: Testes Analíticos em Python (`pytest`)

Mantidos no diretório `tools/analytics/` para suporte analítico e validação de contratos:

- **PY-01 (Validação de Paridade de Schemas Pydantic vs TypeScript):**
  - Exportar fixtures JSON gerados pelo simulador web.
  - Carregar nos modelos `SimulationEvent` do Pydantic.
  - Asserção: Todos os campos, enums (`TankQuality`), identificadores de seq e timestamps validam com 100% de conformidade.
- **PY-02 (Estudo Comparativo: Filtro Mediano vs Filtro de Kalman / FilterPy):**
  - Gerar série temporal com ruído gaussiano ($\sigma = 0.5\text{ cm}$) e 5% de outliers impulsivos ($+50\text{ cm}$).
  - Comparar a saída do Filtro Mediano de 5 amostras com um Filtro de Kalman 1D calibrado.
  - Asserção: O Filtro Mediano apresenta rejeição superior a 98% dos outliers sem complexidade de sintonia de matrizes $Q$ e $R$, comprovando a escolha de engenharia leve no browser.
- **PY-03 (Ajuste de Curva Volumétrica com NumPy/SciPy):**
  - Dada tabela empírica com ruído de medição humana, ajustar polinômio cúbico e spline PCHIP monotônica.
  - Asserção: O modelo PCHIP garante não-negatividade e monotonicidade estrita de volume em relação à altura.
