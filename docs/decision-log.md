# Registro de decisões de engenharia

## 2026-09-28 — baseline real de bancada

- Sensor de nível congelado em DFRobot A02YYUW/SEN0311: UART 9600 8N1, 3,3 V, TX em GPIO16 e RX/MODE em nível alto.
- JSN-SR04T, TRIG/ECHO, buffer AHCT e divisor foram removidos da arquitetura atual.
- Buzzer congelado em Same Sky CMI-1295IC-0385T ativo; CPE-120 e Q1 foram removidos.
- Tampa/tanque congelados como FG-TANK-6L-R1 paramétrico: acrílico 3/5 mm, interno 200×200×160 mm, quatro M3, suporte SEN0311, prensa-cabo e MC-38.
- MC-38 e MB-102 permanecem vendor-lot-specific; não há footprint mecânico final sem unidade comprada.
- PN532 V4 usa SPI e suporte frontal; header, furos, antena e conectores continuam pendentes.

## Política de verdade

Datasheet prova função; não prova que a unidade recebida tem o mesmo envelope, header ou lote. Um item só passa a `APPROVED_BY_MEASUREMENT` quando houver fotos, três leituras, tolerância, evidência e revisão independente.

## CAD e fabricação

`jscad-electronics` é reservado a encapsulamentos genéricos; módulos comerciais usam dados do fabricante e medição. `three-mesh-bvh` serve para detectar colisões do modelo. `circuit-json-to-gltf` só entra após uma PCB KiCad real existir. KiBot, PcbDraw e KiCanvas são gates de revisão/fabricação, não substitutos do esquema KiCad.
