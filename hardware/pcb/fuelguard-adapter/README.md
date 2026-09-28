# FuelGuard Adapter PCB — fonte KiCad futura

Esta pasta é o ponto de entrada da placa adaptadora de bancada. Ela ainda **não** contém um projeto KiCad: o ambiente atual não possui `kicad-cli` e, mais importante, as medidas e os conectores físicos ainda não foram aprovados.

`design-inputs.json` e `../../measurements/measurement-register.json` são os contratos que devem ser fechados antes de criar `fuelguard-adapter.kicad_pro` e `fuelguard-adapter.kicad_sch`.

## Ordem obrigatória

1. Registrar fotos e as três leituras de cada cota pendente em `hardware/evidence/<component-id>/`.
2. Atualizar os registros para `APPROVED_BY_MEASUREMENT` somente após revisão independente.
3. Definir MPN, conector compatível, pinagem e orientação em `design-inputs.json`.
4. Criar no KiCad as folhas de alimentação, carrier ESP32, UART SEN0311, SPI PN532 V4, interlock/indicadores e pontos de teste.
5. Executar ERC antes de qualquer contorno ou arquivo `.kicad_pcb`.

Não introduza um contorno nominal, footprint genérico ou Gerber nesta pasta para “desbloquear” a interface. Esses artefatos só existem após o gate de evidência e são derivados da fonte KiCad revisada.
