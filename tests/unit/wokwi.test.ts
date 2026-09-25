import { describe, it, expect } from 'vitest';
import { generateWokwiDiagram } from '@/wokwi/wokwi-generator';

describe('Wokwi ESP32-S3 diagram.json Generator', () => {
  it('gera objeto diagram.json com versão canônica e editor wokwi', () => {
    const diagram = generateWokwiDiagram();
    expect(diagram.version).toBe(1);
    expect(diagram.editor).toBe('wokwi');
    expect(diagram.parts.length).toBeGreaterThanOrEqual(6);
    expect(diagram.connections.length).toBeGreaterThanOrEqual(8);
  });

  it('inclui a placa ESP32-S3 DevKitC-1 e periféricos essenciais da bancada didática', () => {
    const diagram = generateWokwiDiagram();
    const partTypes = diagram.parts.map((p) => p.type);

    expect(partTypes).toContain('board-esp32-s3-devkitc-1');
    expect(partTypes).toContain('wokwi-hc-sr04');
    expect(partTypes).toContain('wokwi-resistor');
    expect(partTypes).toContain('wokwi-slide-switch');
    expect(partTypes).toContain('wokwi-led');
  });

  it('valida mapeamento elétrico correto de pinos no Wokwi', () => {
    const diagram = generateWokwiDiagram();
    const conns = diagram.connections;

    // Disparo TRIG no GPIO5
    const trigConn = conns.find((c) => c[0] === 'esp:5' && c[1] === 'ultrasonic:TRIG');
    expect(trigConn).toBeDefined();

    // Retorno atenuado no GPIO6
    const echoConn = conns.find((c) => c[0] === 'r1_10k:2' && c[1] === 'esp:6');
    expect(echoConn).toBeDefined();

    // Sensor de tampa no GPIO7
    const reedConn = conns.find((c) => c[0] === 'esp:7');
    expect(reedConn).toBeDefined();

    // LED no GPIO4
    const ledConn = conns.find((c) => c[0] === 'esp:4');
    expect(ledConn).toBeDefined();
  });
});
