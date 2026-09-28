# Plano atual do FuelGuard

## Fase concluída no software

- Contratos canônicos de peças, nets, BOM, bancada, chicote, medições e testes.
- Modelo de água do tanque FG-TANK-6L-R1 e leitura SEN0311 com zona cega de 3 cm.
- Validação de UART 5 V no GPIO16, SPI PN532, interlock MC-38, LED 220 Ω e buzzer ativo.
- Viewer 3D paramétrico, esquemático visual e auditoria de montagem sem declarar fabricação.

## Fase física pendente

1. Comprar os MPNs congelados e registrar as unidades.
2. Medir placas, probe, cabos, conectores, MB-102, MC-38, tanque e tampa.
3. Fechar footprints, mating connectors e design inputs.
4. Criar/rotear PCB KiCad e executar ERC/DRC.
5. Gerar KiBot, PcbDraw, KiCanvas, Gerbers e montagem piloto.
6. Calibrar 1–5 L de água e anexar evidências.

## Não objetivos

Não criar números fictícios para suportes, não chamar o render de CAD de fabricação, não converter Circuit JSON em GLTF/GLB antes da PCB real e não declarar homologação automotiva.
