# FuelGuard — pipeline de assets reais e gêmeo digital

Este documento congela a regra de que o visualizador deve representar o hardware FuelGuard, não um conjunto genérico de peças bonitas.

## Critérios do plano

1. **Registro de proveniência** — `public/models/model-manifest.json` relaciona cada asset à fonte, formato, confiança, validação e dimensões.
2. **Asset real em runtime** — o PN532 ELECHOUSE V4 usa o STEP oficial do fabricante convertido para GLB com `occt-import-js`; o viewer carrega `/models/official/elechouse-pn532-v4.glb`.
3. **Fallback controlado** — geometrias nominais só permanecem visíveis quando o asset real não carrega e são tratadas como referência, nunca como CAD de fabricação.
4. **Fonte canônica de montagem** — objetos, dimensões, designators e cabos são carregados pelos contratos tipados em `src/circuit-cad/assembly-source.ts`, com `fuelguard/assembly/bench-layout.json` como fonte de dados.
5. **Interação e inspeção** — seleção de componentes, modos montagem/explodida/conexões/sensores, presets de câmera, réguas e auditoria permanecem na bancada 3D.
6. **Colisão mecânica** — `three-mesh-bvh` é reutilizado pelo `SceneObjectRegistry`, que mantém bounds, designators e estados `PASS`, `WARNING`, `FAIL` ou `PENDING_PHYSICAL_EVIDENCE`.
7. **Estado sincronizado** — nível da água e estados da simulação alimentam o twin; objetos carregados são registrados por designator e os cabos preservam origem, destino e net compartilhados.
8. **Performance** — o GLB é binário e carregado sob demanda pela estação de montagem; a estação PCB 3D não importa Three.js adicional nem cria uma placa fictícia.
9. **Gates de engenharia** — a placa adaptadora só poderá receber GLB de PCB depois de esquemático KiCad, footprints, roteamento, ERC/DRC e Gerbers revisados.

## Estado atual

- **Concluído:** asset oficial do PN532 V4, conversão auditável, manifest com provenance/licença, registry TypeScript, fonte canônica de montagem, registry de colisões, lazy loading, teste de proveniência, estação PCB 3D honesta e remoção do RP2040 do produto.
- **Referência documentada:** ESP32-S3 DevKitC-1 v1.1 agora possui GLB detalhado reconstruído pelo script `scripts/generate-esp32-devkit-glb.mjs` a partir das referências oficiais, com duas portas Micro-USB, WROOM, headers 2×22 e componentes de superfície.
- **Pacote de componentes:** MB-102, LED WP7113GD, buzzer CMI-1295IC-0385T, SEN0311/A02YYUW e MC-38 agora têm GLBs de referência gerados por `scripts/generate-reference-component-glbs.mjs` e carregados sob demanda. Permanecem Classe B/C porque são reconstruções documentadas e a geometria do lote ainda não foi medida.
- **Ainda sem CAD mecânico liberável:** nenhum dos GLBs reconstruídos é promovido a CAD exato. O SEN0311 usa o desenho mecânico publicado; o MC-38 usa uma referência comercial de família. O tanque continua como geometria paramétrica própria até fabricação/calibração.
- **Ainda bloqueado:** PCB adaptadora, tanque fabricado, medidas da unidade comprada, footprint/conector final e pipeline KiCad/KiBot/PcbDraw.

## Fontes de hardware usadas

- ELECHOUSE PN532 V4: https://www.elechouse.com/docs/pn532-v4/
- DFRobot SEN0311: https://wiki.dfrobot.com/sen0311/
- DFRobot/Mouser A02YYUW mechanical drawing: https://www.mouser.com/pdfDocs/ProductOverview-DFRobotA02YYUWWaterproofUltrasonicSensor.pdf
- Espressif ESP32-S3-DevKitC-1: https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-devkitc-1/user_guide_v1.1.html
- MB-102: https://handsontec.com/dataspecs/m102-830-bread-board.pdf
- MC-38 vendor reference: https://www.tinytronics.nl/en/switches/magnetic-switches/door-switch-reed-relay-with-magnet
