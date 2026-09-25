/**
 * FuelGuard Virtual Test Bench — Exportador Demonstrativo KiCad 8/9
 * Gera arquivos de projeto KiCad (.kicad_sch e .kicad_pcb) em formato S-Expression canônico.
 */

import { CircuitJsonPackage } from './circuit-json-builder';

export class KiCadExporter {
  /**
   * Gera o arquivo de esquemático KiCad 8 (.kicad_sch)
   */
  public static generateKiCadSchematic(_pkg: CircuitJsonPackage): string {
    const lines: string[] = [
      '(kicad_sch (version 20231120) (generator "FuelGuard Virtual Test Bench tscircuit Bridge")',
      '  (uuid "317ce3f1-c779-4db8-b333-1bfe89db9a91")',
      '  (paper "A4")',
      '  (title_block',
      '    (title "FuelGuard Didactic Bench — Schematic")',
      '    (date "2026-09-25")',
      '    (rev "1.0.0")',
      '    (company "FuelGuard Open Mechatronics Project")',
      '    (comment 1 "AVISO: Projeto gerado por simulador de bancada. Requer validação manual antes de fabricação.")',
      '    (comment 2 "Líquido de ensaio: Água em recipiente aberto. Não utilizar com hidrocarbonetos.")',
      '  )',
      '',
      '  ;; Símbolos de Alimentação e Terra',
      '  (power_symbol "GND" (at 50 180 0) (unit 1))',
      '  (power_symbol "+5V" (at 50 40 0) (unit 1))',
      '  (power_symbol "+3V3" (at 50 80 0) (unit 1))',
      '',
      '  ;; Componentes da Bancada',
      '  (symbol (lib_id "Espressif:ESP32-S3-DevKitC-1") (at 90 100 0) (unit 1)',
      '    (property "Reference" "U1" (at 90 60 0))',
      '    (property "Value" "ESP32-S3-DevKitC-1-N8R8" (at 90 65 0))',
      '    (property "Footprint" "Espressif:ESP32-S3-DevKitC-1" (at 90 70 0))',
      '  )',
      '',
      '  (symbol (lib_id "74xx:74AHCT125") (at 150 70 0) (unit 1)',
      '    (property "Reference" "U2" (at 150 50 0))',
      '    (property "Value" "SN74AHCT125N" (at 150 55 0))',
      '    (property "Footprint" "Package_DIP:DIP-14_W7.62mm" (at 150 60 0))',
      '  )',
      '',
      '  (symbol (lib_id "Device:R_Divider") (at 150 130 0) (unit 1)',
      '    (property "Reference" "R_DIV1" (at 150 115 0))',
      '    (property "Value" "10k / 15k (3.0V Out)" (at 150 120 0))',
      '    (property "Footprint" "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal" (at 150 125 0))',
      '  )',
      '',
      '  (symbol (lib_id "Sensor:JSN-SR04T") (at 210 70 0) (unit 1)',
      '    (property "Reference" "SEN1" (at 210 45 0))',
      '    (property "Value" "JSN-SR04T v2.0" (at 210 50 0))',
      '    (property "Footprint" "Connector_PinHeader_2.54mm:PinHeader_1x04_P2.54mm_Vertical" (at 210 55 0))',
      '  )',
      '',
      '  (symbol (lib_id "RF_Module:PN532_Breakout") (at 210 130 0) (unit 1)',
      '    (property "Reference" "RFID1" (at 210 110 0))',
      '    (property "Value" "PN532 NFC SPI" (at 210 115 0))',
      '    (property "Footprint" "Connector_PinHeader_2.54mm:PinHeader_1x06_P2.54mm_Vertical" (at 210 120 0))',
      '  )',
      '',
      '  (symbol (lib_id "Switch:SW_Reed") (at 210 170 0) (unit 1)',
      '    (property "Reference" "SW1" (at 210 160 0))',
      '    (property "Value" "Reed Switch N.A." (at 210 165 0))',
      '  )',
      '',
      '  (symbol (lib_id "Device:LED") (at 150 170 0) (unit 1)',
      '    (property "Reference" "D1" (at 150 160 0))',
      '    (property "Value" "LED Verde + 1k" (at 150 165 0))',
      '  )',
      ')',
    ];

    return lines.join('\n');
  }

  /**
   * Gera o arquivo de layout de PCB KiCad 8 (.kicad_pcb)
   */
  public static generateKiCadPcb(_pkg: CircuitJsonPackage): string {
    const lines: string[] = [
      '(kicad_pcb (version 20231120) (generator "FuelGuard Virtual Test Bench tscircuit Bridge")',
      '  (general',
      '    (thickness 1.6)',
      '  )',
      '  (paper "A4")',
      '  (layers',
      '    (0 "F.Cu" signal)',
      '    (31 "B.Cu" signal)',
      '    (36 "B.SilkS" user "B.Silkscreen")',
      '    (37 "F.SilkS" user "F.Silkscreen")',
      '    (38 "B.Mask" user)',
      '    (39 "F.Mask" user)',
      '    (44 "Edge.Cuts" user)',
      '  )',
      '',
      '  ;; Contorno da Placa de Bancada 180mm x 120mm',
      '  (gr_rect (start -90 -60) (end 90 60) (layer "Edge.Cuts") (stroke (width 0.2) (type solid)))',
      '',
      '  ;; Texto Informativo na Serigrafia',
      '  (gr_text "FuelGuard Virtual Test Bench — Didactic Carrier Board"',
      '    (at 0 -52 0) (layer "F.SilkS") (effects (font (size 2 2) (thickness 0.3))))',
      '  (gr_text "ATENÇÃO: Protótipo didático para testes com água. Não conectar a circuitos de injeção ou ignição veicular."',
      '    (at 0 52 0) (layer "F.SilkS") (effects (font (size 1.4 1.4) (thickness 0.25))))',
      '',
      '  ;; Redes Lógicas Principais',
      '  (net 0 "")',
      '  (net 1 "GND")',
      '  (net 2 "+5V")',
      '  (net 3 "+3V3")',
      '  (net 4 "TRIG_5V0")',
      '  (net 5 "ECHO_5V")',
      '  (net 6 "ECHO_3V0_SAFE")',
      '  (net 7 "SPI_SCK")',
      '  (net 8 "SPI_MOSI")',
      '  (net 9 "SPI_MISO")',
      '  (net 10 "SPI_CS")',
      '  (net 11 "REED_LID")',
      '  (net 12 "LED_STATUS")',
      ')',
    ];

    return lines.join('\n');
  }

  /**
   * Baixa um arquivo no navegador
   */
  public static triggerDownload(filename: string, content: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
