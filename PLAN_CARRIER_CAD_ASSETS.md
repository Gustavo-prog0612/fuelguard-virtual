# Plano e log — substituição dos CADs do Carrier Board FuelGuard

Escopo exclusivo: `fuelguard-carrier`. O `rp2040-motor-controller` não participa deste pipeline e não teve seus modelos, metadados, render ou testes alterados.

## Ordem e estado da execução

| Ordem | Designator | Classe | Estado | Asset local | Observação |
|---:|---|:---:|---|---|---|
| 1 | U1 | A | Pendente | `U1/reference.glb` | GLB local derivado do guia/DXF/desenho oficial, medido em 25,5 × 10,82 × 71,25 mm; a variante N8R8 física e o CAD completo ainda aguardam confirmação. |
| 2 | U2 | B | Substituído | `U2/model.glb` | DIP-14 W7.62 mm convertido do STEP oficial KiCad. |
| 3 | R_DIV | B | Substituído | `R_DIV/model.glb` | Geometria axial KiCad reutilizada duas vezes, mantendo R1=10 kΩ e R2=15 kΩ como dados elétricos distintos. |
| 4 | BB1 | B | Pendente | `BB1/reference.glb` | Referência 3D local detalhada disponível; modelo comunitário ainda não foi aceito sem conferência contra a protoboard física/lote. |
| 5 | D1 | B | Substituído | `D1/model.glb` | LED THT verde de 5 mm do KiCad; resistor limitador permanece separado. |
| 6 | BZ1 | B | Substituído | `BZ1/model.glb` | Buzzer radial `Buzzer_12x9.5RM7.6`; não é declarado como CUI específico. |
| 7 | SEN1 | C | Pendente | `SEN1/reference.glb` | Referência 3D local detalhada disponível; a fonte comunitária não comprova simultaneamente a revisão JSN-SR04T v2.0 e sua geometria mecânica. |
| 8 | RFID1 | C | Pendente | `RFID1/reference-derived.glb` | Envelope 120 × 50 mm, furos, JP4/JP3/CN1, SEL0/SEL1 e antena derivados do Eagle Adafruit v1.6; variante física e conversão industrial completa ainda aguardam validação. |
| 9 | SW1 | C | Aproximação explícita | `SW1/reference.glb` | Referência paramétrica local disponível; fabricante e part number físico ainda não confirmados. |
| 10 | CBL_USB | C | Aproximação explícita | — | Referência comercial USB-C → Micro-USB de 1 m com dados; fabricante, diâmetro e lote ainda não foram fixados para o CAD. |
| 11 | TK1 | D | Aguardando componente físico | — | Recipiente didático permanece placeholder; não apto para fabricação ou gabarito. |

## Arquitetura entregue

- Manifesto Carrier-only em `src/circuit-cad/carrier-assets.ts`, com ordem, status, fonte, licença, revisão, escala, rotação, translação, dimensões, tolerância, checksum e limitações.
- Metadados individuais em `public/assets/cad/carrier/<designator>/asset.json`.
- GLBs locais convertidos dos STEP do KiCad em `U2`, `R_DIV`, `D1` e `BZ1`.
- Referências GLB locais detalhadas em `U1`, `BB1`, `SEN1`, `RFID1` e `SW1`; elas ficam separadas do `assetPath` verificado e não promovem o componente a CAD de fabricação.
- Carregador reutilizável em `src/ui/views/cad/carrier-asset-loader.ts`, usando `GLTFLoader`, centralizando transformação, tags de seleção, medição e descarte. Referências só são carregadas quando a tela pede explicitamente uma inspeção visual.
- O inspetor 360° substitui o fallback procedural pelos GLBs verificados de U2, R_DIV, D1 e BZ1. Entradas pendentes/aproximadas usam a referência GLB local quando existente e exibem a variante física pendente; sem referência, mostram envelope honesto.
- A montagem física usa os GLBs locais verificados de D1 e BZ1 e referências locais rastreáveis para U1, BB1, SEN1, RFID1 e SW1; U2 e R_DIV permanecem como assets de inspeção do Carrier até que o layout da placa seja liberado para fabricação.
- A estação PCB 3D continua bloqueada enquanto não existir uma PCB real e um conjunto de modelos aprovado; isso evita inventar um layout de fabricação.
- O catálogo `6. Registro & Tolerâncias` agora agrupa o Carrier por Classe A/B/C/D e mostra status, origem, asset local, dimensões nominais versus medidas, tolerância e limitações.

## Conversão e proveniência dos assets KiCad

Os modelos foram obtidos da biblioteca oficial [KiCad Packages3D](https://gitlab.com/kicad/libraries/kicad-packages3D) e convertidos localmente de STEP para GLB. Os arquivos originais, commits/revisões, licença, dimensões medidas e SHA-256 estão registrados no manifesto e nos `asset.json`.

O asset de `R_DIV` é uma malha de encapsulamento axial, não uma representação visual do valor ôhmico. A cena cria duas instâncias, uma para cada resistor, sem alterar a topologia elétrica.

## Validações executadas

- Testes unitários para ordem dos designators, isolamento do RP2040, presença dos `asset.json`, checksum/dimensões dos GLBs verificados, referências GLB locais e pendências explícitas.
- TypeScript em modo de build sem emissão.
- Verificação de carregamento assíncrono com fallback para componentes sem GLB.
- Raycasting preservado: meshes carregadas recebem `componentId`/`designator` e continuam selecionáveis.
- Catálogo de compra ampliado para U2, R1/R2, R3, R_BASE, SW1, CBL_USB e TK1; preço fica `Consultar` quando não há cotação rastreável.
- Inspetor 360° deixa de exibir painel vazio em componentes sem simulador dedicado e apresenta ficha de engenharia, footprint, nets e próxima ação.

## Log de execução — 2026-09-30

- Corrigida a fonte única do catálogo: `sn74ahct125n` e `voltage_divider` agora existem em `FUELGUARD_CAD_LIBRARY`; BZ1 e SEN1 usam IDs compatíveis com o catálogo real.
- Conectado `CARRIER_CAD_ASSET_MANIFEST` ao catálogo BOM e ao inspetor 360°, incluindo links de fonte, status, dimensões e limitações.
- U1, BB1, SEN1, RFID1 e TK1 continuam pendentes; SW1 e CBL_USB continuam aproximações explícitas. Nenhum desses estados é apresentado como asset oficial.
- D1 e BZ1 passaram a carregar os GLBs locais versionados na montagem física, com fallback somente em erro de carregamento.
- A bancada agora declara a proveniência sem termos enganosos: D1/BZ1 são GLBs locais validados; U1, RFID1 e SEN1 são referências sob aferição; o tanque é um envelope Classe D, não uma peça liberada para fabricação.
- Em telas médias, a cena 3D ganhou área útil: o validador detalhado fica disponível em telas largas, a legenda de fios só aparece na topologia 2D e os controles 3D passam a priorizar ícones essenciais.
- Os cartões de compra distinguem `Preço observado`, `Consultar preço` e `Fornecedor pendente`; quando não existe imagem rastreável, o cartão declara a ausência em vez de usar foto de anúncio não verificada.
- Fotos de produto do ESP32-S3, SEN0311 e Adafruit PN532 v1.6 foram copiadas para `public/assets/purchase/` com fonte original e SHA-256 em `manifest.json`; U2, R_DIV, D1 e BZ1 receberam prévias SVG técnicas derivadas dos assets KiCad verificados.
- RFID1 foi corrigido para a variante oficial Adafruit v1.6: o Eagle `.brd/.sch` foi inspecionado, o envelope 120 × 50 mm, quatro furos, JP4/JP3/CN1, SEL0/SEL1 e antena foram convertidos em `reference-derived.glb`, e o mapeamento SPI passou a usar JP4.1/2/3/4/5/8. O status permanece `pending_physical_evidence` porque a placa recebida e a conversão industrial completa ainda não foram conferidas.
- U1 deixou de depender de um envelope procedural: o `reference.glb` detalhado foi medido com o envelope completo da placa e dos dois Micro-USB, recebeu checksum validado no teste e passou a ser identificado como `derived`, mantendo `pending` somente pela ausência de CAD 3D oficial liberado e pela necessidade de conferência física da variante N8R8.
- Os demais itens receberam referências visuais locais rotuladas como `variante/lote pendente`; os cards usam fallback explícito quando uma imagem falha e têm teste de interface para foto local, status/preço, prévia CAD e link de compra.
- As referências GLB que estavam dispersas em `public/models/reference` foram centralizadas sob `public/assets/cad/carrier/<designator>/reference.glb`, com checksum no manifesto e nos `asset.json`; o status continua pendente/aproximado até a validação da variante física.
- A montagem e o inspetor passaram a consumir esses caminhos do manifesto, mantendo seleção por designator e fallback explícito em caso de falha de carregamento.
- O inspetor passou a usar a classe, part number e revisão do manifesto Carrier como fonte de verdade; a classificação antiga da biblioteca não pode mais contradizer o registro `6. Registro & Tolerâncias`.
- A Estação 9 passou a exibir progresso real por gate, cronômetro, log com ícones coerentes com PASS/WARN/PENDING/FAIL e cancelamento seguro de timers ao desmontar a tela.
- O gate `ASSET-001` agora consulta diretamente `CARRIER_CAD_ASSET_MANIFEST`, portanto o resultado em tempo real usa os mesmos estados, fontes e pendências exibidos no registro de tolerâncias.
- O Registro CAD ganhou filtros operacionais por Classe A/B/C/D e por asset verificado versus pendente/aproximado, com contagem visível e teste de interface para evitar cartões fora do recorte selecionado.
- A Estação 9 agora permite exportar a evidência da execução em JSON local, com escopo `fuelguard-carrier`, timestamp, duração, resumo e resultado de cada gate.
- Os cards de compra passaram a formatar os valores na moeda real do fornecedor (`US$ 15,00`, por exemplo), mantendo `Consultar` quando não há cotação rastreável.
- O TK1 continua visível como envelope didático de água, mas a cena agora usa um contrato central `TANK_PHYSICAL_RELEASED = false` e registra o objeto como placeholder Classe D não liberado para fabricação.
- CBL_USB e SW1 agora entram no `SceneObjectRegistry` com designator, classe de colisão e `verified: false`, mantendo seleção/auditoria alinhadas ao manifesto mesmo quando a geometria é aproximação.
- A Estação PCB 3D deixou de ser uma área vazia: agora funciona como gate de fabricação com métricas do Carrier, inventário dos 11 assets, pendências por classe, próximos critérios de liberação e rotas para montagem/registro.
- A tela Sensor & Água passou a consumir `TANK_SPEC`, `TANK_PHYSICAL_RELEASED` e o manifesto do SEN1 por meio de `sensor-water-model.ts`; volume, altura, distância, zona cega e status de calibração não ficam mais duplicados como números soltos na interface. Os botões levam diretamente aos testes em tempo real e à ficha de compra do SEN1.
- O CBL_USB foi alinhado entre BOM, biblioteca, manifesto e cena: a referência de compra agora é USB-C → Micro-USB de dados, 1 m, coerente com as duas portas Micro-USB documentadas no DevKitC-1 v1.1; continua Classe C até o lote físico e o CAD do cabo serem confirmados.
- A PCB 2D passou a resolver corretamente o net a partir de `source_trace.connected_source_net_ids`, sinalizar quando a camada inferior não possui trilhas na proposta e permitir hover por courtyard para localizar o designator sob o cursor.
- Adicionado teste de integridade da proposta PCB 2D: cada `pcb_trace` precisa apontar para `source_trace` e `source_net` existentes, mantendo dimensões e número de camadas explícitos sem promover a visualização a fabricação liberada.
- A Estação 6 passou a derivar tensão, bitolas e metragem diretamente do `PHYSICAL_WIRING_REGISTRY`, mostrar a quantidade de rotas filtradas e oferecer atalhos para testes em tempo real e referências de compra; o estado continua “calculado”, não “medido”.
- A fonte oficial da Espressif foi atualizada no registro U1 para a documentação específica da revisão v1.1; ela confirma a variante N8R8, as duas portas Micro-USB e a necessidade de cabo de dados, mas não promove o GLB local a CAD oficial.
- O enquadramento da bancada 3D foi recalibrado: presets de montagem, fiação e explosão usam distâncias menores e o viewport mantém os objetos legíveis sem o vazio excessivo anterior; o limite de zoom continua protegido para evitar corte acidental.
- A moldura da Estação CAD foi compactada sem remover metadados: cabeçalho, faixa de sub-abas e padding agora liberam mais altura para 3D, BOM e testes, reduzindo áreas mortas em telas médias.
- A BOM ganhou busca unificada por designator, MPN, nome e descrição; a mesma consulta filtra tabela, referências de compra e registro CAD, com contagem separada por seção e mensagem explícita quando não há correspondência.
- Verificações direcionadas executadas: Estação 9 (3 testes), BOM (4 testes, incluindo busca), gate PCB 3D (2 testes) e contrato sensor/tanque (3 testes).
- Verificações executadas: `npm run typecheck`, `npm test -- --reporter=dot --maxWorkers=1 --minWorkers=1` (23 arquivos / 114 testes) e `npm run build`.
- O único aviso esperado da suíte é a tentativa de criar WebGL em JSDOM durante o teste de navegação; o teste passa e a aplicação possui mensagem de fallback no viewer.

## Pendências de próxima rodada

1. Obter o CAD 3D exato do U1 DevKitC-1 v1.1 e confirmar N8R8, headers, duas portas Micro-USB, botões e orientação.
2. Definir o fabricante/lote da BB1 e medir canaleta, barramentos e dimensões externas.
3. Conferir fisicamente o RFID1 Adafruit v1.6 e completar a conversão de cobre/serigrafia antes de mudar o status para verificado.
4. Confirmar fisicamente SEN1, SW1, CBL_USB e TK1 antes de gerar qualquer gabarito mecânico.
