# Interfaces elétricas da configuração real

## Alimentação

- Fonte externa: USB-C 5 V / 3 A certificada, somente baixa tensão na bancada.
- ESP32-S3 recebe VBUS/USB-C e fornece 3,3 V regulados aos periféricos conforme a capacidade real da placa.
- GND de U1, SEN0311, PN532, MC-38, LED e BZ1 é comum.
- Confirmar corrente, queda de tensão e comportamento de back-power na unidade antes da PCB.

## Nível

- SEN0311: VCC em 3,3 V, GND comum, TX → GPIO16/UART1_RX.
- RX/MODE do SEN0311 em nível alto → saída processada.
- UART: 9600 baud, 8 data bits, sem paridade, 1 stop bit.
- Frame: `0xFF`, byte alto, byte baixo, checksum `(0xFF + DATA_H + DATA_L) & 0xFF`.
- GPIO17 fica reservado; não existe TRIG/ECHO na topologia atual.

## PN532

- ELECHOUSE V4 configurado para SPI.
- GPIO10 = SS/CS, GPIO11 = MOSI, GPIO12 = SCK, GPIO13 = MISO.
- VCC e sinais em 3,3 V; IRQ e RSTO ficam disponíveis no header mas não são usados no contrato inicial.

## Tampa e indicadores

- MC-38 em GPIO7 com pull-up interno; estado NO/NC e polaridade só após comprar a variante.
- GPIO4 → R3 220 Ω → LED verde → GND.
- GPIO14 → buzzer ativo CMI-1295IC-0385T → GND, confirmando polaridade e corrente.

## Verificação

O `circuit-validator`, `drc-checker` e os testes unitários detectam injeção de uma linha UART de 5 V no GPIO16. Nenhum relatório virtual substitui osciloscópio/multímetro e teste de continuidade na bancada física.
