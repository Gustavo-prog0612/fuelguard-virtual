# ADR-0002 — Congelamento da entrada da bancada e da PCB adaptadora

## Status

Aceita para a bancada de engenharia; PCB ainda não desenhada.

## Decisão

Adotar ESP32-S3-DevKitC-1-N8R8 v1.1, ELECHOUSE PN532 V4 em SPI, DFRobot A02YYUW/SEN0311 em UART 9600 8N1, MC-38 com ímã, LED verde + 220 Ω, buzzer ativo CMI-1295IC-0385T, MB-102 e tanque cilíndrico acrílico paramétrico FG-TANK-5L-CYL-R1.

## Consequências

- A topologia deixa de usar TRIG/ECHO, JSN-SR04T, SN74AHCT125, divisor, CPE-120 e Q1.
- O suporte do SEN0311, o MC-38, o PN532 V4, MB-102, conectores e tanque seguem pendentes de evidência física.
- O esquemático KiCad só deve ser criado após MPNs, footprints e medidas serem aprovados.
- A conversão Circuit JSON → GLTF/GLB fica depois da PCB real, não antes.

## Critério de encerramento

Fotos, medições repetidas, fornecedor/lote, conectores, esquema, ERC/DRC, KiBot, PcbDraw, KiCanvas e Gerbers precisam estar associados à mesma revisão.
