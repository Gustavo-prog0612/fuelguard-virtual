import { describe, it, expect } from 'vitest';
import benchLayout from '@/../fuelguard/assembly/bench-layout.json';
import cableRoutes from '@/../fuelguard/assembly/cable-routes.json';
import collisionRules from '@/../fuelguard/assembly/collision-rules.json';

describe('Auditoria de Engenharia Mecânica — Layout, Ponto de Apoio e Cabos', () => {
  it('deve garantir que nenhum componente está flutuando (contato e suporte definidos)', () => {
    benchLayout.objects.forEach((obj) => {
      expect(obj.supportPoint).toBeDefined();
      expect(obj.supportPoint.type).toBeDefined();
      expect(typeof obj.supportPoint.contactY).toBe('number');
      expect(obj.supportPoint.contactY).toBeGreaterThanOrEqual(0.0);
      expect(obj.fasteningMethod).toBeDefined();
    });
  });

  it('deve validar escala em milímetros para todos os objetos da montagem física', () => {
    benchLayout.objects.forEach((obj) => {
      const bb = obj.boundingBoxMm;
      expect(bb.width).toBeGreaterThan(0);
      expect(bb.height).toBeGreaterThan(0);
      expect(bb.depth).toBeGreaterThan(0);
      // Nenhum módulo menor que 2mm ou maior que a bancada de 420mm
      expect(bb.width).toBeLessThanOrEqual(420);
      expect(bb.depth).toBeLessThanOrEqual(300);
    });
  });

  it('deve garantir que todos os cabos externos possuem duas terminações mecânicas reais', () => {
    cableRoutes.cables.forEach((cable) => {
      expect(cable.id).toBeDefined();
      expect(cable.origin.component).toBeDefined();
      expect(cable.origin.pin).toBeDefined();
      expect(cable.destination.component).toBeDefined();
      expect(cable.destination.pin).toBeDefined();

      expect(cable.terminals.start).toBeDefined();
      expect(cable.terminals.start.length).toBeGreaterThan(0);
      expect(cable.terminals.end).toBeDefined();
      expect(cable.terminals.end.length).toBeGreaterThan(0);
    });
  });

  it('deve garantir que cada cabo possui pelo menos 3 waypoints para curva suave TubeGeometry', () => {
    cableRoutes.cables.forEach((cable) => {
      expect(cable.waypoints.length).toBeGreaterThanOrEqual(3);
      expect(cable.visualDiameterMm).toBeGreaterThan(0.5);
      expect(cable.estimatedLengthMm).toBeGreaterThan(20.0);
    });
  });

  it('deve conter regras de colisão e folgas mecânicas mínimas documentadas', () => {
    expect(collisionRules.collisionChecks.length).toBeGreaterThanOrEqual(4);
    const zeroPenetration = collisionRules.collisionChecks.find((c) => c.ruleId === 'COL-01');
    expect(zeroPenetration).toBeDefined();
    expect(zeroPenetration?.minClearanceMm).toBeGreaterThanOrEqual(1.0);
  });
});
