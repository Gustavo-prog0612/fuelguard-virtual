# Arquitetura do FuelGuard

## Escopo

O projeto é uma bancada de engenharia para água, não um módulo instalado em veículo. O software representa e verifica a montagem real: ESP32-S3-DevKitC-1-N8R8 v1.1, PN532 V4, SEN0311, MC-38, indicadores, MB-102 e tanque FG-TANK-5L-CYL-R1.

## Fluxo de dados

```text
SEN0311 UART 9600 8N1 → parser 0xFF/DATA_H/DATA_L/checksum → filtro mediano
→ distância sensor-água → h = 160 mm - distância → volume geométrico/calibrado
ESP32-S3 ── SPI ── PN532 V4
ESP32-S3 ── GPIO7 ── MC-38
ESP32-S3 ── GPIO4/14 ── LED 220 Ω / buzzer ativo
```

## Verdade e limites

- `hardware/real-hardware-catalog.json` contém MPNs, fontes e gates.
- `hardware/measurements/measurement-register.json` contém o que ainda exige medição.
- `hardware/pcb/fuelguard-adapter/design-inputs.json` é o contrato de entrada da PCB.
- O Circuit JSON descreve topologia nominal e falha controlada; não é uma PCB fabricável.
- O viewer 3D é paramétrico e não libera corte, furação ou calibração.

## Gates

1. Metrologia e conectores.
2. Esquemático KiCad e footprints exatos.
3. PCB roteada, ERC/DRC e revisão independente.
4. KiBot/PcbDraw/KiCanvas/Gerbers.
5. Montagem, ensaio de água e calibração.

Enquanto qualquer gate estiver pendente, o estado correto da interface é `ENGINEERING_REFERENCE_NOT_RELEASED`.
