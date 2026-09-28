# FuelGuard Virtual Test Bench — Third Party Notices & License Audit

> **Documento:** THIRD_PARTY_NOTICES.md  
> **Versão:** 1.1.0  
> **Status:** Auditoria Integral de Licenças e Dependências (Frontend Web & Ferramental Python)  
> **Data:** 25 de Setembro de 2026

Este documento registra todas as bibliotecas de terceiros, ferramentas e referências técnicas avaliadas ou planejadas para uso no projeto **FuelGuard Virtual Test Bench**, com suas respectivas licenças, escopo de utilização, limitações e obrigações legais.

---

## 1. Dependências da aplicação Web (Frontend & Núcleo Leve no Browser)

As tecnologias abaixo possuem licenças permissivas e foram selecionadas especificamente por serem ultraleves, garantindo que o bundle seja enxuto, sem travamentos e com execução fluida a 60 FPS:

| Pacote / Ferramenta | Versão Alvo | Licença | Repositório / Fonte Oficial | Finalidade no Projeto | Obrigações Legais |
| :--- | :---: | :---: | :--- | :--- | :--- |
| **React & React-DOM** | `^19.0.0` | MIT | [facebook/react](https://github.com/facebook/react) | Renderização declarativa e reativa da UI. | Manter aviso de copyright e licença MIT. |
| **TypeScript** | `^5.7.0` | Apache-2.0 | [microsoft/TypeScript](https://github.com/microsoft/TypeScript) | Tipagem estrita de contratos de eventos e modelos. | Incluir licença Apache 2.0 e avisos de copyright. |
| **Vite** | `^6.0.0` | MIT | [vitejs/vite](https://github.com/vitejs/vite) | Build tool, empacotador ultrarrápido com HMR nativo. | Manter aviso de licença MIT. |
| **Tailwind CSS** | `^3.4.0` | MIT | [tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss) | Estilização utilitária industrial sem peso de runtime CSS. | Manter aviso de licença MIT. |
| **Lucide React** | `^0.460.0` | ISC | [lucide-icons/lucide](https://github.com/lucide-icons/lucide) | Ícones vetoriais em SVG estático (tree-shakeable). | Manter aviso de copyright e licença ISC. |
| **@xyflow/react** (React Flow) | `^12.0.0` | MIT | [xyflow/xyflow](https://github.com/xyflow/xyflow) | Canvas de montagem interativa da bancada e fiação. | Manter aviso de licença MIT (versão core open-source). |
| **Chart.js** & **react-chartjs-2** | `^4.4.0` / `^5.2.0` | MIT | [chartjs/Chart.js](https://github.com/chartjs/Chart.js) | Gráficos Canvas 2D de alta performance com decimação. | Manter aviso de licença MIT. |
| **idb** | `^8.0.0` | ISC | [jakearchibald/idb](https://github.com/jakearchibald/idb) | Wrapper Promise-based minúsculo (< 2 kB) para IndexedDB. | Manter aviso de copyright e licença ISC. |
| **Vitest** | `^2.1.0` | MIT | [vitest-dev/vitest](https://github.com/vitest-dev/vitest) | Suíte de testes unitários ultrarrápida (threads isoladas). | Ferramenta de dev, licença MIT. |
| **Playwright** | `^1.49.0` | Apache-2.0 | [microsoft/playwright](https://github.com/microsoft/playwright) | Testes E2E, acessibilidade (A11y) e evidências visuais. | Ferramenta de teste, licença Apache 2.0. |

---

## 2. Ferramental Analítico & Suporte Python (Desacoplado do Navegador)

Para manter a aplicação web livre de sobrecargas (sem WebAssembly pesado ou Pyodide no navegador), as bibliotecas Python são organizadas como ferramental de engenharia analítica offline ou gateway opcional:

| Pacote / Ferramenta | Licença | Repositório Oficial | Finalidade Específica | Decisão de Arquitetura |
| :--- | :---: | :--- | :--- | :--- |
| **FastAPI** | MIT | [fastapi/fastapi](https://github.com/fastapi/fastapi) | Servidor assíncrono opcional para telemetria local e ponte HIL. | **Opcional / Backend de suporte**. A web app funciona offline sem ele. |
| **Pydantic** | MIT | [pydantic/pydantic](https://github.com/pydantic/pydantic) | Validação estrita de contratos e schemas de eventos em Python. | **Usar como espelho de contrato** (`schema_version: 1`) entre TS e Python. |
| **SimPy** | MIT | [simpx/simpy](https://github.com/simpx/simpy) | Simulação baseada em eventos discretos (DES) para filas e falhas. | **Usar em scripts analíticos de benchmark**; o browser roda clock próprio em TS. |
| **FilterPy** | MIT | [rlabbe/filterpy](https://github.com/rlabbe/filterpy) | Implementação de referência de filtros de Kalman e estimadores. | **Usar em estudo comparativo offline**. No browser, o filtro mediano é mais fluido. |
| **NumPy** | BSD-3-Clause | [numpy/numpy](https://github.com/numpy/numpy) | Processamento matricial e cálculo de erro residual em calibrações. | **Usar em scripts de calibração empírica** offline para geração de tabelas $V(h)$. |
| **SciPy** | BSD-3-Clause | [scipy/scipy](https://github.com/scipy/scipy) | Interpolação cúbica (PCHIP) e regressão não linear para tanques. | **Usar em scripts de ajuste de curvas** para alimentar o JSON do simulador. |
| **Pandas** | BSD-3-Clause | [pandas-dev/pandas](https://github.com/pandas-dev/pandas) | Manipulação de logs de telemetria, exportação CSV e relatórios. | **Usar em scripts de pós-processamento** de ensaios de longa duração. |
| **Pytest** | MIT | [pytest-dev/pytest](https://github.com/pytest-dev/pytest) | Suíte de testes unitários para os scripts analíticos e validação Pydantic. | **Usar no pipeline de testes do ferramental Python**. |
| **Paho MQTT Python** | EPL-2.0 / EDL-1.0 | [eclipse-paho/paho.mqtt.python](https://github.com/eclipse-paho/paho.mqtt.python) | Cliente MQTT para scripts de integração e teste de mensageria. | **Opcional**; usado para testar publicação em broker local. |
| **aiomqtt** | BSD-3-Clause | [empicano/aiomqtt](https://github.com/empicano/aiomqtt) | Cliente MQTT assíncrono compatível com `asyncio` e FastAPI. | **Avaliar em fase futura** caso o gateway FastAPI seja ativado. |
| **scikit-learn** | BSD-3-Clause | [scikit-learn/scikit-learn](https://github.com/scikit-learn/scikit-learn) | Algoritmos de aprendizado de máquina supervisionado e clustering. | **Não usar antes de haver dados reais rotulados**. Proibido usar ML para inventar leituras. |
| **River** | BSD-3-Clause | [online-ml/river](https://github.com/online-ml/river) | Aprendizado contínuo em streaming (*online machine learning*). | **Não usar antes de haver dados reais** de bancada física. |
| **Eclipse Mosquitto** | EPL-2.0 / EDL-1.0 | [eclipse-mosquitto/mosquitto](https://github.com/eclipse-mosquitto/mosquitto) | Broker MQTT leve executável em máquina local para ensaios. | **Opcional / Testes de rede**. O simulador nativo opera sem broker externo. |

---

## 3. Repositórios e Ferramentas Usados Apenas como Referência Técnica (Sem Inclusão de Código)

| Repositório / Fonte | Licença Upstream | Link Oficial | Motivo de Consulta | Política Adotada no FuelGuard |
| :--- | :---: | :--- | :--- | :--- |
| **Arduino-ESP32** | LGPL-2.1 | [espressif/arduino-esp32](https://github.com/espressif/arduino-esp32) | Consulta de APIs do ESP32-S3 (GPIO, SPI, timers). | Apenas referência de arquitetura para firmware de demonstração C++. |
| **Elechouse / Adafruit PN532** | BSD-3-Clause | [elechouse/PN532](https://github.com/elechouse/PN532) | Consulta de comandos SPI (`SAMConfig`, leitura de UID). | Reimplementação limpa da máquina de estados lógica em TypeScript. |
| **Wokwi Elements** | MIT | [wokwi/wokwi-elements](https://github.com/wokwi/wokwi-elements) | Consulta de convenções visuais de pinagem 2D. | Os componentes do FuelGuard usam nós e SVGs próprios integrados ao Tailwind. |
| **Wokwi CLI / Docs** | Apache-2.0 / Docs | [wokwi/wokwi-docs](https://github.com/wokwi/wokwi-docs) | Estrutura do `diagram.json` para ESP32-S3. | Usado no Marco M5 para exportação opcional; não é dependência de runtime. |
| **CircuitJS1** | **GPL-2.0** | [pfalstad/circuitjs1](https://github.com/pfalstad/circuitjs1) | Estudo visual de correntes e animações de circuito. | **PROIBIDA** incorporação de código para evitar contaminação por GPL viral. O motor elétrico do FuelGuard é original em TypeScript. |
| **gpu-io / gl-water2d** | MIT | [amandaghassaei/gpu-io](https://github.com/amandaghassaei/gpu-io) | Estudo de equações de ondas e shaders WebGL. | A aplicação adota modelo harmônico amortecido ultraleve em 2D; gpu-io permanece como estudo futuro. |
| **OpenFOAM / Fino** | **GPL-3.0** | [openfoam/openfoam](https://github.com/openfoam) | Consulta teórica de equações acústicas e térmicas. | Fora do escopo web; o FuelGuard adota formulação analítica direta $c(T)$. |
| **Node-RED / ThingsBoard** | Apache-2.0 | [node-red/node-red](https://github.com/node-red) | Referência conceitual de dashboards e telemetria IoT. | Apenas inspiração de design para os widgets da central de comando. |

---

## 4. Famílias Tipográficas Locais (Auditoria e Licenciamento)

Todas as fontes tipográficas avaliadas e utilizadas no **Design System** são distribuídas sob a licença livre **SIL Open Font License 1.1 (OFL-1.1)**, hospedadas e servidas 100% localmente no projeto (sem requisições externas para Google Fonts ou CDNs):

| Família Tipográfica | Autor / Origem | Versão Alvo | Licença | Arquivos e Formato | Uso no FuelGuard |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **IBM Plex Sans** | Mike Abbink / Bold Monday / IBM | `5.3.0` | [SIL OFL-1.1](https://scripts.sil.org/OFL) | WOFF2 local (`@fontsource/ibm-plex-sans`) | Fonte principal de interface, botões, rótulos e instruções didáticas. |
| **IBM Plex Mono** | Mike Abbink / Bold Monday / IBM | `5.3.0` | [SIL OFL-1.1](https://scripts.sil.org/OFL) | WOFF2 local (`@fontsource/ibm-plex-mono`) | Dados técnicos, GPIOs, grandezas (cm, L, °C), buffers e console serial. |
| **Space Grotesk** | Florian Karsten | `5.3.0` | [SIL OFL-1.1](https://scripts.sil.org/OFL) | WOFF2 local (`@fontsource/space-grotesk`) | Títulos display e cabeçalhos principais da bancada (Combinação A). |
| **Bricolage Grotesque** | Mathieu Triay | `5.3.0` | [SIL OFL-1.1](https://scripts.sil.org/OFL) | WOFF2 local (`@fontsource/bricolage-grotesque`) | Títulos expressivos para laboratório comparativo (Combinação B). |
| **Instrument Sans** | Rodrigo Fuenzalida / Instrument | `5.3.0` | [SIL OFL-1.1](https://scripts.sil.org/OFL) | WOFF2 local (`@fontsource/instrument-sans`) | Interface humanista técnica para laboratório comparativo (Combinação B). |
| **Sora** | Jonathan Barnbrook & Julián Moncada | `5.3.0` | [SIL OFL-1.1](https://scripts.sil.org/OFL) | WOFF2 local (`@fontsource/sora`) | Títulos de geometria moderna para laboratório comparativo (Combinação C). |
| **Azeret Mono** | Martin Vácha / Displaay Type Foundry | `5.3.0` | [SIL OFL-1.1](https://scripts.sil.org/OFL) | WOFF2 local (`@fontsource/azeret-mono`) | Dados monoespaçados com visual denso (Combinação C). |
| **Archivo** | Héctor Gatti / Omnibus-Type | `5.3.0` | [SIL OFL-1.1](https://scripts.sil.org/OFL) | WOFF2 local (`@fontsource/archivo`) | Tipografia grotesca neutra unificada para títulos e corpo (Combinação D). |

---

## 5. Política de Propriedade Intelectual e HeyPCB

A aplicação **FuelGuard Virtual Test Bench** é concebida de forma 100% original:
1. **Identidade Própria:** Nenhuma marca, logo, imagem, texto ou trecho de folha de estilo do HeyPCB foi ou será copiado.
2. **Abordagem Didática Específica:** O produto foca no ensaio acústico e eletrônico de nível de líquidos em galão didático, enquanto o HeyPCB é um designer genérico de placas de circuito impresso.
3. **Imagens Conceituais do Briefing:** As figuras 1 a 3 do PDF foram geradas por inteligência artificial para ilustrar o conceito e não devem ser usadas como decalque, esquemático mecânico ou instrução de fabricação. Todos os elementos gráficos da aplicação são vetores e componentes originais.
