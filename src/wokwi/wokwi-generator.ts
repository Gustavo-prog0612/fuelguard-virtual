/**
 * FuelGuard Virtual Test Bench — Gerador de diagram.json para Wokwi ESP32-S3
 * Permite exportar a topologia física da bancada para emulação direta no simulador Wokwi.
 */

export interface WokwiDiagramPart {
  type: string;
  id: string;
  top: number;
  left: number;
  attrs?: Record<string, string | number>;
}

export type WokwiConnection = [string, string, string, string[]];

export interface WokwiDiagram {
  version: 1;
  author: 'FuelGuard Mechatronics Virtual Bench';
  editor: 'wokwi';
  parts: WokwiDiagramPart[];
  connections: WokwiConnection[];
}

export function generateWokwiDiagram(): WokwiDiagram {
  const parts: WokwiDiagramPart[] = [
    {
      type: 'board-esp32-s3-devkitc-1',
      id: 'esp',
      top: 0,
      left: 0,
      attrs: {},
    },
    {
      type: 'wokwi-hc-sr04',
      id: 'ultrasonic',
      top: -120,
      left: 320,
      attrs: { distance: '42' },
    },
    {
      type: 'wokwi-resistor',
      id: 'r1_10k',
      top: 60,
      left: 340,
      attrs: { value: '10000' },
    },
    {
      type: 'wokwi-resistor',
      id: 'r2_15k',
      top: 110,
      left: 340,
      attrs: { value: '15000' },
    },
    {
      type: 'wokwi-slide-switch',
      id: 'reed_switch',
      top: -60,
      left: -200,
      attrs: {},
    },
    {
      type: 'wokwi-led',
      id: 'led_ready',
      top: 180,
      left: -180,
      attrs: { color: 'green' },
    },
    {
      type: 'wokwi-resistor',
      id: 'r_led_1k',
      top: 180,
      left: -90,
      attrs: { value: '1000' },
    },
  ];

  // Ligações equivalentes em conformidade com as regras elétricas
  const connections: WokwiConnection[] = [
    // Alimentação 5V e GND do sensor ultrassônico
    ['esp:5V', 'ultrasonic:VCC', 'red', ['v0']],
    ['esp:GND.1', 'ultrasonic:GND', 'black', ['v0']],

    // Disparo TRIG (GPIO5 -> TRIG)
    ['esp:5', 'ultrasonic:TRIG', 'purple', ['v0']],

    // Atenuador Divisor de Tensão do ECHO (ECHO 5V -> R1(10k) -> Nó Divisor -> R2(15k) -> GND)
    ['ultrasonic:ECHO', 'r1_10k:1', 'cyan', ['v0']],
    ['r1_10k:2', 'r2_15k:1', 'cyan', ['v0']],
    ['r1_10k:2', 'esp:6', 'cyan', ['v0']], // Tensão segura atenuada para 3.00V no GPIO6
    ['r2_15k:2', 'esp:GND.2', 'black', ['v0']],

    // Sensor de Tampa (Reed Switch no GPIO7 com pull-up interno e GND)
    ['esp:7', 'reed_switch:2', 'orange', ['v0']],
    ['esp:GND.1', 'reed_switch:1', 'black', ['v0']],

    // LED de Autorização (GPIO4 -> Resistor 1k -> Anodo LED -> Catodo -> GND)
    ['esp:4', 'r_led_1k:1', 'green', ['v0']],
    ['r_led_1k:2', 'led_ready:A', 'green', ['v0']],
    ['led_ready:C', 'esp:GND.1', 'black', ['v0']],
  ];

  return {
    version: 1,
    author: 'FuelGuard Mechatronics Virtual Bench',
    editor: 'wokwi',
    parts,
    connections,
  };
}

export function downloadWokwiDiagramJson(filename: string = 'diagram.json'): void {
  const diagram = generateWokwiDiagram();
  const jsonStr = JSON.stringify(diagram, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
