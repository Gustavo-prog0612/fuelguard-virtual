# Plano de testes real

## Software

- Parser SEN0311: frame `FF DATA_H DATA_L checksum`, UART 9600 8N1.
- Zona cega: distância menor que 30 mm deve ser inválida; acima dela deve ser válida até 4500 mm.
- Tanque: `h = 160 mm - d`; volume geométrico `0,04 m² × h`; operação nominal 1–5 L.
- Segurança: linha de 5 V injetada em GPIO16 gera DRC fatal.
- SPI: CS/MOSI/SCK/MISO do PN532 permanecem em GPIO10–13.
- Interlock: MC-38 e debounce de 50 ms.

## Bancada física

1. Continuidade e polaridade sem energia.
2. 3,3 V, 5 V e GND medidos.
3. SEN0311 lido em ar e em distâncias conhecidas.
4. PN532 V4 testado em SPI.
5. MC-38 testado em tampa aberta/fechada e gap registrado.
6. LED e buzzer medidos sob comando.
7. Ensaio de vazamento e calibração em 1, 2, 3, 4 e 5 L.

## Fabricação futura

Somente após o esquemático e PCB KiCad reais: ERC, DRC, revisão de footprints, KiBot, PcbDraw, KiCanvas, Gerbers, drill, BOM e montagem piloto.
