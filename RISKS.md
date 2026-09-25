# FuelGuard Virtual Test Bench — Gestão de Riscos, Limitações e Conformidade

> **Documento:** RISKS.md  
> **Versão:** 1.1.0  
> **Status:** Proposta de Engenharia para Revisão  
> **Referência:** Brief de Produto e Simulação FuelGuard (Seções 4, 10, 12 e 13) e Requisitos de Performance

---

## 1. Matriz de Riscos do Projeto

| ID | Categoria | Descrição do Risco | Probabilidade | Impacto | Estratégia de Mitigação |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **RSK-01** | **Segurança Física** | Usuário tentar replicar o projeto conectando o circuito a combustível real, tanque automotivo ou ignição do veículo. | Baixa | **Catastrófico** | **Banners permanentes e bloqueios no software** afirmando que o FuelGuard de bancada foi projetado e modelado **estritamente para água**. O software recusa qualquer parametrização com hidrocarbonetos e não possui saídas de controle de relé, bomba ou atuador veicular. |
| **RSK-02** | **Elétrica / Hardware** | Queima do ESP32-S3 físico ao ligar o pino ECHO (5 V) diretamente ao GPIO (máx 3,3 V) por descuido na transição ao físico. | Alta | Alto | O simulador bloqueia o funcionamento virtual e destaca em alerta crítico vermelho a ausência do divisor 10 kΩ / 15 kΩ. O guia físico contém esquemático detalhado e procedimento obrigatório de medição prévia com multímetro no nó central. |
| **RSK-03** | **Performance & Fluidez (Anti-Jank)** | A aplicação ficar pesada, apresentar lentidão (*lag*), engasgos na fiação ou travamentos no navegador devido a simulações concorrentes. | Média | Alto | **Arquitetura ultraleve:** Todo o loop matemático de simulação (50 Hz) roda em **Web Worker isolado**, sem consumir a thread principal da UI. A interface React consome eventos decapitados (*throttling/batching* sincronizado ao `requestAnimationFrame`), garantindo **60 FPS fluidos**. Rejeição de motores pesados de física 3D/WASM no MVP. |
| **RSK-04** | **Propriedade Intelectual** | Cópia acidental de layout, marcas, CSS ou artefatos proprietários do HeyPCB. | Baixa | Alto | A aplicação possui **identidade visual original**, terminologia própria ("FuelGuard Virtual Test Bench"), biblioteca de componentes didáticos desenhados do zero em SVG e fluxos adaptados ao contexto de sensoriamento de bancada. |
| **RSK-05** | **Licenças de Software (GPL Viral)** | Contaminação por licença GPL (ex: CircuitJS1, OpenFOAM, Fino) em código-fonte MIT/Apache do projeto. | Média | Alto | Nenhuma linha de código de bibliotecas GPL será importada, bundlada ou derivada no repositório. O validador de regras elétricas do FuelGuard é original em TypeScript puro. Ferramentas GPL são tratadas apenas como links externos isolados. |
| **RSK-06** | **Dependência Externa / Offline-First** | Falha da aplicação se serviços externos (Wokwi, broker MQTT ou servidor Python) estiverem offline ou sem token (`WOKWI_CLI_TOKEN`). | Alta | Médio | O modo nativo determinístico em Web Worker é **100% autônomo, offline-first e local no browser**. Wokwi, Mosquitto e backend FastAPI são conectores opcionais; o sistema possui fallback gracioso automático caso não estejam presentes. |
| **RSK-07** | **Falsa Sensação de Validação** | Usuário presumir que a simulação geométrica garante o funcionamento acústico do sensor no galão real. | Alta | Alto | Aplicação estrita da **Regra de Honestidade Visual**: Badges semânticos `[SIMULADO]`, `[APROXIMADO]` e `[REQUER HARDWARE]` em todos os widgets. Seção formal explicando zonas de reflexão parasita em recipientes cônicos/estreitos. |
| **RSK-08** | **Superficialidade / Overfitting com ML** | Utilizar Machine Learning (scikit-learn ou River) prematuramente para "inventar" leituras de nível ou mascarar incertezas de medição. | Média | Alto | **Proibição de ML no MVP**. O sensoriamento apoia-se em leis físicas e estatística determinística básica (filtro mediano de 5 amostras e desvio padrão). Modelos de ML só serão considerados em fases futuras mediante datasets reais rotulados. |
| **RSK-09** | **Complexidade Desnecessária de Filtros** | Implementar Filtro de Kalman (FilterPy) no browser sem evidência prática, aumentando o consumo de CPU e dificultando a calibragem didática. | Alta | Médio | O filtro mediano com histerese temporal e limiares de desvio padrão resolve os ruídos impulsivos típicos do JSN-SR04T com complexidade computacional mínima. O Kalman é mantido para estudo analítico comparativo em scripts Python offline. |
| **RSK-10** | **Incompatibilidade de Browsers & GPU** | Dependência de recursos experimentais (como WebGPU) impedir a execução em computadores didáticos modestos. | Alta | Médio | Rejeição de WebGPU e Three.js obrigatório no MVP. Utilização de **HTML5 Canvas 2D puro e SVG**, suportados em 100% dos navegadores modernos (Chromium, Firefox, Safari, Edge em Windows/Linux/macOS) sem exigir GPU dedicada. |

---

## 2. O que a Simulação Virtual PODE e NÃO PODE Provar

Para manter a integridade científica e de engenharia do projeto, estabelecemos formalmente os limites de validade da simulação:

### O que a Simulação PODE Provar com Rigor:
1. **Lógica de Estados e Fluxos do Firmware:** A máquina de estados virtual lida corretamente com sequências de eventos (NFC autorizado $\rightarrow$ tampa aberta $\rightarrow$ nível subindo $\rightarrow$ tampa fechada $\rightarrow$ envio de telemetria).
2. **Eficácia de Filtros Digitais:** O filtro mediano de 5 amostras com histerese temporal elimina ruídos de pico isolados (outliers) sem gerar defasagem inaceitável.
3. **Resiliência a Quedas de Rede:** A fila local acumula eventos offline e executa o descarregamento ordenado sem perdas ou duplicações ao reconectar o transporte.
4. **Consistência Topológica da Bancada:** A pinagem proposta não gera conflitos de periféricos no ESP32-S3 e respeita a necessidade de adaptação de níveis lógicos entre 3,3 V e 5 V.
5. **Calibração Matemática:** O algoritmo de interpolação converte com precisão cotas de altura d'água ($h = H_{ref} - d$) em volume ($V$) segundo os pontos da tabela de referência.

### O que a Simulação NÃO PODE Provar (Exige Ensaio em Bancada Física):
1. **Padrão de Radiação Acústica e Ecos Parasitas:** O sensor JSN-SR04T possui um cone de emissão real de $\approx 45^\circ$ a $75^\circ$. Se o galão for estreito ou tiver nervuras plásticas laterais, o som refletirá nas paredes antes de atingir a água. Isso **só pode ser medido fisicamente**.
2. **Efeito de Espuma e Agitação Violenta:** A água em movimento rápido ou com detergente/espuma absorve ou dispersa o feixe ultrassônico, gerando perda total de eco que um modelo estático não reproduz fielmente.
3. **Comportamento Térmico e Deriva do Transdutor:** O aquecimento do invólucro do sensor e variações de umidade relativa do ar alteram a impedância piezoelétrica e a constante acústica de forma não-linear.
4. **Ruído Elétrico na Linha de Alimentação:** O rádio Wi-Fi do ESP32-S3 consome picos de corrente de até $350\text{ mA}$ durante a transmissão, podendo causar *brownout* ou ruído na alimentação analógica do JSN-SR04T se não houver capacitores de desacoplamento adequados.
5. **Autenticidade de Tags NFC:** O simulador verifica apenas strings de UID. No mundo real, tags baratas possuem UIDs regraváveis e podem ser clonadas sem criptografia de chave privada.

---

## 3. Política de Conformidade Jurídica e Licenças

1. **Repositórios com Licença GPL (Ex: CircuitJS1, OpenFOAM, Fino):**
   - **Diretriz:** Proibida a inclusão de código-fonte, módulos npm ou derivação desses projetos no repositório do FuelGuard. Caso sejam citados na aplicação, devem figurar exclusivamente como referências conceituais ou links hipertexto externos para uso em aba separada.
2. **Repositórios com Licenças Permissivas (MIT, Apache-2.0, BSD, ISC):**
   - **Diretriz:** Todas as bibliotecas de terceiros incorporadas (React, Vite, Tailwind, xyflow, Chart.js, idb, Vitest, Playwright) devem ser catalogadas com versão, link oficial do repositório e texto integral da licença no documento `THIRD_PARTY_NOTICES.md`.
3. **Ferramental Python:**
   - Mantido como scripts independentes de suporte analítico, sem inclusão no bundle do navegador, preservando a leveza absoluta da interface do usuário.
