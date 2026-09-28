# FuelGuard — plano de execução da bancada real

## Baseline congelada

Esta é a configuração de referência para desenhar bancada, chicote, suporte e gêmeo digital:

| Ref. | Peça | Estado de engenharia |
|---|---|---|
| U1 | ESP32-S3-DevKitC-1-N8R8, revisão v1.1 | Arquivos oficiais Espressif registrados; confirmar unidade comprada |
| RFID1 | ELECHOUSE PN532 V4 | SPI; envelope nominal registrado; header, furos e keepout pendentes |
| SEN1 | DFRobot A02YYUW / SEN0311 | UART TTL 9600 8N1, 3,3 V, IP67, 30–4500 mm, zona cega nominal 30 mm |
| SW1 | MC-38 + ímã | fornecedor, variante NO/NC, gap e dimensões pendentes |
| D1/R3 | LED verde 5 mm + 220 Ω | valor do resistor congelado; pacote de R3 será definido com a PCB |
| BZ1 | Same Sky CMI-1295IC-0385T | buzzer ativo 2–5 V, 30 mA máx.; passo/polaridade a confirmar |
| BB1 | MB-102, 830 pontos | provisório; medir o exemplar recebido |
| TK1/LID1 | FG-TANK-6L-R1 | acrílico 3 mm, tampa 5 mm, interno 200×200×160 mm, 1–5 L operacional |
| PS1 | USB-C 5 V/3 A certificada | fornecedor ainda não selecionado; somente baixa tensão |

## Topologia elétrica canônica

```text
SEN0311 TX ───────────────> ESP32 GPIO16 / UART1_RX (3,3 V)
SEN0311 RX/MODE ──────────> 3V3 (saída processada)
SEN0311 VCC/GND ──────────> 3V3 / GND
PN532 V4 SCK/MISO/MOSI/SS -> GPIO12/13/11/10 (SPI, 3,3 V)
MC-38 + ímã ──────────────> GPIO7 + pull-up interno / GND
GPIO4 ── R3 220 Ω ────────> LED verde ──> GND
GPIO14 ───────────────────> BZ1 ativo ──> GND
```

Não fazem parte desta montagem: JSN-SR04T, TRIG/ECHO, SN74AHCT125, divisor 10 kΩ/15 kΩ, CPE-120 e MOSFET Q1. Qualquer fornecedor alternativo exige nova revisão do contrato.

## Ordem de execução

1. Comprar exatamente os MPNs acima e registrar fabricante, lote, revisão, fotos frente/trás/laterais e escala.
2. Medir U1, PN532 V4, probe/cabo SEN0311, MC-38/ímã, MB-102, tanque fabricado, tampa, M3, prensa-cabo e terminais.
3. Atualizar `hardware/measurements/measurement-register.json` somente com três leituras, tolerância, evidência e revisor.
4. Congelar conectores mating, polaridade, NO/NC, gap, altura dos headers, furação e keepouts em `design-inputs.json`.
5. Criar o esquemático KiCad da adaptadora com alimentação, UART, SPI, interlock, LED, buzzer, pontos de teste e desacoplamento.
6. Selecionar footprints pelos MPNs reais, desenhar contorno, furos, keepouts e conectores; então rotear a PCB.
7. Executar ERC, DRC, revisão visual independente, KiBot, PcbDraw, KiCanvas e gerar Gerbers, drill, BOM e posição.
8. Só depois de existir uma PCB KiCad real e revisada, converter Circuit JSON para GLTF/GLB e publicar o asset no viewer.

## Gates de liberação

- **Gate físico:** todas as dimensões de alto impacto aprovadas e evidências em `hardware/evidence/`.
- **Gate elétrico:** ERC sem erros críticos; nenhum 5 V em GPIO; corrente do buzzer medida; UART e SPI testados.
- **Gate mecânico:** tanque sem vazamento, tampa com 4×M3, sensor perpendicular e prensa-cabo com drip loop.
- **Gate de fabricação:** esquemático, PCB, footprints, regras, Gerbers e BOM gerados pela mesma revisão KiCad.
- **Gate de calibração:** água em volumes conhecidos de 1–5 L, curva distância/volume, repetibilidade, tampa aberta/fechada e ruído documentados.

Até esses gates, o repositório é uma referência de engenharia de bancada. Ele não é uma PCB fabricável nem produto automotivo homologado.
