# Pesquisa de hardware real — FuelGuard

## Fontes primárias usadas

- [Espressif ESP32-S3-DevKitC-1](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-devkitc-1/user_guide_v1.0.html) e arquivos oficiais v1.1: esquemático, PCB e DXF.
- [DFRobot SEN0311](https://wiki.dfrobot.com/sen0311/) e [protocolo UART](https://wiki.dfrobot.com/sen0311/docs/21651).
- [ELECHOUSE PN532 V4](https://www.elechouse.com/docs/pn532-v4/) e [página do produto](https://www.elechouse.com/product/pn532-nfc-rfid-module-v4/).
- [Same Sky CMI-1295IC-0385T](https://jp.sameskydevices.com/product/resource/cmi-1295ic-0385t.pdf).
- [Referência MC-38](https://robu.in/wp-content/uploads/2017/04/Datasheet-MC-38-final-1.pdf), tratada apenas como evidência de família comercial.
- [MB-102/830 pontos](https://handsontec.com/dataspecs/m102-830-bread-board.pdf), tratada como referência de envelope sujeita ao lote.

## Fatos liberados para a bancada

| Item | Dado documentado | O que ainda não pode ser inventado |
|---|---|---|
| ESP32-S3 | DevKitC-1-N8R8, v1.1, duas fileiras 2×22 | altura dos headers, tolerância e posição efetiva na unidade |
| SEN0311 | UART TTL 9600 8N1, 3,3–5 V, IP67, 30–4500 mm, zona cega aproximada 30 mm | envelope do probe, cabo, terminal e prensa-cabo |
| PN532 V4 | SPI disponível, header 1×8, envelope nominal 42,7×40,4×4,0 mm | gênero/altura do header, furos e keepout da antena |
| BZ1 | CMI-1295IC-0385T ativo, 2–5 V, até 30 mA, Ø12×9,5 mm | passo, polaridade e corrente efetiva da unidade |
| MC-38 | contato magnético comercial com variantes diferentes | MPN, NO/NC, dimensões, ímã, gap e cabo |
| MB-102 | protoboard 830 pontos, envelope nominal de referência | medidas da unidade que será usada na bancada |
| Tanque R1 | baseline própria: externo 206×206×168; interno 200×200×160; 6,4 L geométricos | tolerância da fabricação, vazamento e curva de calibração |

## Decisões de engenharia

1. O SEN0311 substitui o JSN-SR04T porque a zona cega nominal de 30 mm é compatível com a bancada de 160 mm úteis; 1–5 L produz aproximadamente 35–135 mm de distância sensor-água.
2. A operação elétrica do SEN0311 será em 3,3 V, com RX/MODE em nível alto. Isso elimina o caminho TRIG/ECHO, divisor e buffer.
3. O buzzer é um modelo ativo internamente acionado. CPE-120 e Q1 não pertencem à BOM atual.
4. “MC-38” continua bloqueado como família: comprar uma variante concreta antes de fabricar o suporte.
5. A geometria do tanque é uma baseline paramétrica aprovada pelo usuário, não uma medição física. A capacidade 6,4 L é cálculo geométrico até a aferição.

## Registro de evidência

As fontes e estados ficam em `hardware/real-hardware-catalog.json`, `hardware/measurements/measurement-register.json` e `hardware/pcb/fuelguard-adapter/design-inputs.json`. Uma dimensão sem foto/medição da unidade continua pendente, mesmo quando há datasheet.
