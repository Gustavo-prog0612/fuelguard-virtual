# Prompt de melhoria — FuelGuard Virtual Test Bench

## Contexto

Você é um engenheiro sênior de produto, frontend, visualização 3D, eletrônica didática e QA. Trabalhe sobre o repositório atual do FuelGuard Virtual Test Bench. O projeto já possui uma base funcional relevante: React + TypeScript + Vite, simulação em Web Worker, modelos de eventos, persistência IndexedDB, validação elétrica, exportação Circuit JSON/KiCad, componentes 3D em Three.js e testes unitários Vitest.

O problema principal não é falta de código, e sim falta de acabamento, hierarquia e prova de funcionamento. A aplicação está genérica, densa e poluída; muitos textos são vagos; a experiência parece mais um catálogo técnico do que uma bancada de engenharia orientada a tarefas; os renders 3D não atingem qualidade visual convincente; e a área de testes não apresenta claramente o que foi executado, o que passou, o que falhou e quais evidências sustentam cada resultado.

## Evidências encontradas no repositório

- Existem 71 arquivos em `src`, 9 arquivos de teste unitário e aproximadamente 231 asserções.
- O README afirma “59 testes unitários”, mas essa contagem não está apresentada por suíte, categoria, resultado ou evidência reproduzível.
- O `TEST_PLAN.md` descreve uma matriz extensa de testes E2E, acessibilidade, performance e Python, mas o repositório não apresenta uma suíte Playwright estruturada correspondente nem um relatório de execução persistido.
- A navegação expõe Bancada, Sinais, Eventos, Testes e Guia; a área CAD existe no tipo de rota, mas não aparece como item principal equivalente na barra lateral, dificultando descobrir o trabalho 3D.
- O 3D principal é construído manualmente por dezenas de primitivas Three.js em `src/ui/views/cad/Pcb3DCanvas.tsx` e `rp2040-3d-builder.ts`. Isso é uma boa prova de conceito, mas não é ainda um pipeline de assets realistas, consistente e verificável.
- O modal oficial usa `/data/rp2040/3d.png` para a placa RP2040, mas usa `/screenshot_cad_3d.png` para a Carrier Board; esse arquivo não existe em `public`, portanto o fallback visual está quebrado.
- O canvas mede `clientWidth` e `clientHeight` na montagem inicial e só reage a `window.resize`; não há `ResizeObserver` do painel. Em layouts flexíveis, abas, fullscreen ou carregamento tardio, isso pode gerar canvas com tamanho zero, proporção errada ou render cortado.
- Há iluminação forte, muitos materiais, sombras e vários objetos, mas faltam controles de qualidade visual como exposição, tone mapping, color space, enquadramento baseado no bounding box, câmera ortográfica para inspeção, seleção visual consistente, LOD e diagnóstico de WebGL.
- A biblioteca de componentes declara explicitamente itens Classe D/placeholder. Esses elementos precisam ser visualmente rotulados como “representação didática” e não misturados com assets de fabricação.
- Há conteúdo duplicado na raiz e em `docs`, o que aumenta a sensação de volume sem aumentar clareza. Consolidar a fonte de verdade é necessário.
- O build local não pôde ser validado nesta análise porque a instalação disponível em `node_modules` está incompleta e não expõe o binário `tsc`. Corrigir a reprodutibilidade do ambiente faz parte da entrega.

## Objetivo do trabalho

Transforme o produto em uma bancada virtual especializada, visualmente clara e tecnicamente honesta. O resultado deve parecer uma ferramenta de engenharia para investigar um sistema FuelGuard, não um dashboard administrativo genérico nem uma página cheia de cards informativos.

## Regras de execução

1. Antes de alterar a interface, rode uma auditoria do projeto e confirme o estado real do build, testes e assets. Não invente resultados.
2. Preserve a distinção entre `SIMULADO`, `APROXIMADO`, `PENDENTE` e `REQUER HARDWARE`.
3. Não adicione mais informação sem remover, agrupar ou priorizar informação existente.
4. Toda tela deve responder a três perguntas: qual é a tarefa atual, qual é o estado do sistema e qual é a próxima ação recomendada?
5. Evite cards decorativos, métricas sem contexto, ícones repetidos, textos longos e slogans vagos.
6. Não declare “alta fidelidade”, “fotorealista”, “oficial”, “validado” ou “seguro” sem asset, teste ou evidência que sustente o rótulo.
7. Trabalhe em incrementos pequenos, mantendo a aplicação executável depois de cada etapa.

## Prioridade P0 — fazer a aplicação funcionar e parar de mentir visualmente

### P0.1 Ambiente e baseline

- Corrigir a instalação determinística de dependências.
- Validar `npm install`, `npm run build` e `npm test` em uma máquina limpa.
- Ajustar scripts para que falhas retornem código de saída correto.
- Registrar no README a versão de Node/npm suportada.
- Separar claramente testes unitários, integração, E2E e análises Python.
- Corrigir a contagem de testes do README ou substituí-la por contagem gerada automaticamente.

### P0.2 Corrigir o render 3D quebrado

- Remover a referência quebrada a `/screenshot_cad_3d.png` ou adicionar um asset real, licenciado e versionado.
- Exibir estado de carregamento, estado de erro e estado “asset não disponível” no modal.
- Nunca mostrar uma área preta vazia sem explicar o problema.
- Adicionar `ResizeObserver` ao container do canvas.
- Proteger contra largura/altura zero e atualizar `camera.aspect`, `renderer.setSize` e pixel ratio.
- Configurar `renderer.outputColorSpace`, tone mapping e exposição de forma consistente.
- Liberar geometrias, materiais, texturas, listeners e WebGL renderer na desmontagem.
- Detectar ausência de WebGL e exibir instrução útil.

### P0.3 Enquadramento e câmera

- Calcular o bounding box da placa/montagem e enquadrar automaticamente todos os objetos.
- Implementar presets confiáveis: isométrica, superior, inferior, frontal, lateral e montagem completa.
- Usar câmera ortográfica em inspeções de PCB e perspectiva apenas na montagem física.
- Limitar zoom, pan e rotação para evitar perder a placa.
- Corrigir a animação de preset para que o alvo de câmera e o alvo de rotação terminem de forma determinística.
- Mostrar uma escala visual e unidade em milímetros.

## Prioridade P1 — redesenhar a experiência para reduzir generalidade e poluição

### P1.1 Nova hierarquia de navegação

Reorganize a aplicação em fluxos orientados a trabalho:

1. **Resumo do ensaio** — estado, cenário, saúde da simulação e próxima ação.
2. **Montagem** — bancada, placas, fiação e validação elétrica.
3. **Sinais** — tanque, eco, ruído, filtros e qualidade da leitura.
4. **Eventos** — timeline, UART e causalidade.
5. **Testes** — catálogo, execução, resultados e evidências.
6. **CAD/3D** — esquemático, PCB, 3D e DRC.
7. **Guia** — documentação contextual, sem competir com a operação.

O CAD/3D deve ser descobrível na navegação principal. A tela inicial deve ter no máximo uma decisão principal e poucos indicadores com contexto.

### P1.2 Redução de conteúdo

- Substituir parágrafos explicativos por microcopy contextual e links “ver critério”.
- Mover detalhes matemáticos e normas para painéis recolhíveis ou documentação.
- Remover textos que apenas repetem o título do painel.
- Trocar “informação vaga” por frases verificáveis: entrada, regra, resultado e consequência.
- Agrupar badges de honestidade em uma legenda única por tela, sem repetir o mesmo badge em todos os blocos.
- Manter uma linguagem visual de instrumento: fundo, grelha, divisórias e tipografia; reduzir sombras, bordas e cartões simultâneos.

### P1.3 Estados claros

Cada tela precisa ter estados explícitos para vazio, carregando, pronto, executando, aprovado, falhou e requer hardware. Cada estado deve indicar ação seguinte. Não usar o mesmo tratamento visual para dado real, simulado, placeholder e dado ausente.

## Prioridade P1 — tornar o 3D realmente bom

### P1.4 Qualidade visual

- Criar uma cena de laboratório coerente: iluminação de três pontos controlada, chão discreto, sombra de contato suave e fundo sem ruído excessivo.
- Usar materiais por categoria: FR-4, máscara, cobre, solda, plástico, metal, serigrafia e água.
- Reduzir aparência de caixas coloridas substituindo primitivas genéricas por geometrias com chanfro/bevel, conectores coerentes, headers, pinos, pads, parafusos e cabos.
- Adicionar serigrafia legível baseada em textura/SDF ou labels HTML posicionados, em vez de planos brancos sem conteúdo.
- Criar um modelo 3D de cada placa com origem, orientação, escala e bounding box documentados.
- Separar visualização de placa, montagem física e vista explodida; cada modo deve ter propósito e composição própria.
- Usar cores de destaque somente para seleção, erro DRC, sinal ativo e componente em inspeção.
- Implementar seleção com outline/halo e painel de propriedades objetivo: referência, part number, função, origem do asset, classe de fidelidade e limitações.
- Adicionar controles de qualidade visual, não apenas “tema verde/obsidiana”: luz, modo de inspeção, wireframe opcional, transparência da placa e mostrar/ocultar serigrafia.
- Garantir que a vista 3D continue útil em 1280x720, 1920x1080 e viewport estreito.

### P1.5 Honestidade dos assets

- Identificar no catálogo quais componentes têm modelo real, aproximação geométrica ou placeholder.
- Mostrar uma legenda de fidelidade na cena e no painel de inspeção.
- Remover a palavra “fotorealista” quando o resultado for uma aproximação por caixas e cilindros.
- Se um asset oficial externo for usado, registrar fonte, versão, licença e data no catálogo.

## Prioridade P1 — reformular a área de testes

A tela atual mistura catálogo de cenários, semente PRNG e injeção manual numa grade de botões. Transforme-a em uma estação de execução e evidência:

- Coluna esquerda: catálogo de testes agrupado por objetivo — aquisição, filtro, tampa, NFC, elétrica, persistência, conectividade e falhas.
- Centro: teste selecionado com pré-condições, estímulo, parâmetros editáveis e botão “Executar”.
- Direita: resultado atual com status, duração, seed, entradas, saídas, eventos gerados e evidência visual.
- Resumo superior: total, aprovados, falhos, não executados e requer hardware.
- Cada teste deve possuir ID estável, descrição curta, pré-condições, passos, resultado esperado, resultado observado, timestamp e seed.
- Diferenciar “carregar cenário” de “executar teste”; clicar num card não deve aparentar que o teste passou.
- Permitir executar novamente, comparar duas execuções e exportar um relatório JSON/Markdown.
- Mostrar falhas como diagnóstico acionável: causa provável, regra violada, arquivo/módulo relacionado e próxima ação.
- Criar filtros por categoria, status e nível de fidelidade.
- Organizar a apresentação por suítes, não apenas por arquivos físicos.

## Prioridade P2 — testes que faltam e evidências

- Criar uma suíte E2E real em Playwright para os dez cenários definidos no `TEST_PLAN.md`.
- Criar fixtures determinísticas para seeds, cenários, eventos, IndexedDB e assets 3D.
- Adicionar smoke test de cada rota e de cada preset 3D.
- Adicionar teste para modal oficial com asset existente e asset ausente.
- Adicionar teste de resize, fullscreen e viewport mobile do canvas 3D.
- Adicionar teste de teclado, foco visível e contraste nos controles principais.
- Adicionar teste de importação/exportação JSON com validação de schema e migração de versão.
- Adicionar teste de lifecycle do Web Worker, cancelamento e desmontagem de tela.
- Adicionar teste de performance com critério explícito: FPS, Long Tasks, número de objetos, memória e tempo de inicialização.
- Gerar um relatório HTML/JSON por execução com data, commit, ambiente, suíte e resultado.
- Fazer a tela de testes consumir o mesmo modelo de resultados que o CI, evitando uma tela ilustrativa desconectada dos testes reais.

## Prioridade P2 — arquitetura e manutenção

- Consolidar documentos duplicados entre raiz e `docs`, deixando uma fonte de verdade.
- Criar módulos separados para cena, câmera, iluminação, materiais, interação, assets e telemetria 3D.
- Eliminar `any` em pontos de render e eventos.
- Criar contratos tipados para resultado de teste e evidência.
- Centralizar constantes de unidades, escala, cores de estado e limites de câmera.
- Adicionar logging de diagnóstico controlável por ambiente, sem poluir a UI.
- Revisar acessibilidade: semântica de tabs, nomes acessíveis, foco, navegação por teclado, contraste e redução de movimento.

## Critérios de aceite

Considere o trabalho concluído somente quando:

1. A aplicação instala, compila e executa em ambiente limpo.
2. O modal 3D não possui asset quebrado nem canvas vazio sem diagnóstico.
3. A placa aparece enquadrada, com escala, presets, resize e seleção funcionais.
4. A diferença entre modelo real, aproximação, simulação e placeholder é visível e compreensível.
5. A navegação apresenta o CAD/3D como fluxo principal e cada tela tem uma tarefa clara.
6. A tela de testes mostra resultados reais por suíte, e não apenas botões de cenário.
7. Os testes unitários, integração, E2E e Python têm categorias, comandos e relatórios separados.
8. Os dez cenários E2E do plano estão implementados ou marcados explicitamente como pendentes, sem serem apresentados como concluídos.
9. Há evidência automatizada para build, testes, acessibilidade, resize/fullscreen 3D e performance.
10. A documentação é menor, mais objetiva e coerente com o que o código realmente faz.

## Entrega esperada

Entregue em etapas, com uma tabela final contendo: item, prioridade, arquivos alterados, evidência de validação, limitações restantes e próximo passo. Inclua capturas das telas principais antes/depois quando possível. Não encerre com uma lista genérica de intenções: cada item deve apontar para uma mudança observável no produto ou para um teste que prove o comportamento.
Crie o projeto eletrônico do hardware do FuelGuard MVP de bancada, um protótipo educacional para testar identificação de operador, detecção de tampa e medição de nível de água. O sistema NÃO deve controlar motor, ignição, relé, válvula ou imobilizador, e NÃO será instalado em veículo nesta fase.

OBJETIVO DO PROJETO

Desenvolver uma placa de interface (carrier/interface board) para conectar módulos comerciais a uma placa ESP32-S3 DevKitC-1 compatível. Priorize baixo custo, montagem simples, componentes disponíveis e segurança elétrica. Não crie um ESP32 ou módulo celular do zero: o microcontrolador será uma placa de desenvolvimento encaixada ou conectada à placa de interface.

BLOCOS DO SISTEMA

1. Microcontrolador
- ESP32-S3 DevKitC-1 compatível, alimentado e programado por USB.
- Confirmar revisão, dimensões, pinagem e posição dos conectores da placa real antes de desenhar footprints ou soquetes.
- Se o modelo exato não puder ser confirmado, usar conectores passantes genéricos identificados como “footprint provisório — validar com a placa física”.

2. Leitor NFC
- Módulo PN532 comercial, usando SPI.
- SPI em lógica de 3,3 V.
- Expor no conector: 3V3, GND, SCK, MOSI, MISO, SS/CS e, opcionalmente, RST/IRQ.
- Não assumir a pinagem física do módulo sem selecionar uma revisão documentada. Identificar o conector como dependente do modelo do PN532.
- NFC serve apenas para iniciar uma sessão demonstrativa. Nenhuma tag deve comandar atuadores ou sistemas do veículo.

3. Sensor ultrassônico de bancada
- Sensor JSN-SR04T versão 2.0, com placa eletrônica e transdutor correspondentes.
- Usar saída TRIG acionada por buffer SN74AHCT125N, alimentado em 5 V:
  - ESP32 GPIO5 → entrada A1 do SN74AHCT125N.
  - /OE1 aterrado.
  - Saída Y1 → TRIG do JSN-SR04T.
  - Pino 14 do CI → +5 V; pino 7 → GND.
  - Entrada A1 com resistor pull-down de 10 kΩ.
  - Desabilitar canais não usados: /OE em nível alto, entradas definidas em nível baixo e saídas sem conexão.
- Nunca substituir automaticamente SN74AHCT125 por 74HC125; manter o requisito AHCT.
- Tratar ECHO como potencialmente 5 V até confirmar a revisão do sensor:
  - ECHO → resistor 10 kΩ → nó de entrada GPIO6.
  - Nó → resistor 15 kΩ → GND.
  - O divisor deve produzir aproximadamente 3 V a partir de 5 V.
- Incluir footprint para resistores e pontos de teste acessíveis.
- Não inventar características do sensor além do que estiver confirmado no datasheet da revisão escolhida.

4. Sensor da tampa
- Reed switch passivo com ímã, ligado entre GPIO7 e GND.
- Pull-up externo de 10 kΩ para 3V3.
- Incluir opção para capacitor de 100 nF entre sinal e GND para filtragem de ruído.
- Conector de 2 vias para o reed, com polaridade/terminais identificados.

5. Indicador local
- LED verde ligado ao GPIO4 por resistor em série de 1 kΩ.
- O LED é apenas indicação visual; não é saída de controle.

6. Alimentação e proteção para bancada
- Alimentação principal pela USB da placa ESP32-S3.
- Prever barramento de 5 V para JSN-SR04T e SN74AHCT125N e barramento de 3V3 para lógica PN532, conforme a placa e revisão dos módulos.
- Todas as interfaces devem compartilhar GND.
- Não permitir que uma fonte externa de 5 V e o USB alimentem simultaneamente o mesmo barramento sem isolamento/prevenção de retorno.
- Incluir capacitores de desacoplamento próximos aos módulos: 100 nF e provisão para 100 µF no barramento periférico.
- Adicionar proteção contra ligação invertida somente se compatível com alimentação USB da DevKit; explicar claramente qualquer impacto de queda de tensão.
- Não projetar entrada automotiva 9–36 V nesta placa MVP.
- Não incluir bateria, carregador, relés ou circuitos de acionamento.

PINAGEM PROPOSTA DO ESP32-S3

- GPIO4: LED verde
- GPIO5: entrada do buffer SN74AHCT125N para TRIG
- GPIO6: ECHO após divisor resistivo
- GPIO7: reed switch
- GPIO10: PN532 SS/CS
- GPIO11: PN532 MOSI
- GPIO12: PN532 SCK
- GPIO13: PN532 MISO
- GPIO8/GPIO9: reservados, sem conexão nesta revisão

Antes de fixar essa pinagem, verifique se esses GPIOs estão expostos e livres na variante física exata da DevKit. Se houver conflito, não remapeie silenciosamente: liste o conflito e proponha uma tabela alternativa para aprovação.

CONECTORES E MONTAGEM

- Usar conectores de bancada claramente rotulados e com chaveamento quando possível.
- Prever conectores para: PN532, JSN-SR04T, reed switch e alimentação/periféricos.
- Indicar tensão e GND em serigrafia.
- Incluir pontos de teste para 5 V, 3V3, GND, TRIG, ECHO_dividido, SPI e reed.
- Preferir componentes through-hole onde isso reduzir dificuldade de soldagem.
- A placa não precisa ser à prova d’água; manter a eletrônica afastada do recipiente com água.
- Não especificar caixa final ou dimensões mecânicas definitivas sem medir os módulos reais.
- Separar fisicamente as conexões de alimentação dos sinais e permitir substituição simples dos módulos.

ENTREGÁVEIS

Gere, se a plataforma suportar:
1. Diagrama de blocos.
2. Esquemático completo e legível, com referências, valores e conectores identificados.
3. PCB de interface com footprints provisórios claramente marcados quando dimensões não forem verificadas.
4. BOM com fabricante, código de peça, quantidade, encapsulamento e alternativa equivalente.
5. Tabela de pinagem/conectores e instruções de montagem.
6. Arquivos-fonte editáveis do esquemático e PCB, além de PDF/PNG de visualização.
7. Relatório de verificações elétricas/DRC e uma lista de questões ainda dependentes de inspeção física ou datasheet.

REGRAS DE CONFIABILIDADE

- Não invente dimensões de placas, posições de furos, pinagens de módulos, footprints ou características elétricas.
- Diferencie explicitamente “confirmado por datasheet”, “provisório” e “precisa ser verificado no componente comprado”.
- Se não houver dados suficientes para um footprint ou conector, use footprint provisório ou peça confirmação; não declare o projeto pronto para fabricação.
- Execute checagens de ERC/DRC e sinalize erros e avisos. Não esconda conflitos de alimentação ou níveis lógicos.
- Identifique o projeto como “FuelGuard MVP de bancada — uso somente com água”.
- Não inclua no escopo a versão de campo, combustível, 4G, GNSS, RS-485 ou alimentação automotiva.