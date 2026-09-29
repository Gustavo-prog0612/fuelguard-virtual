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
      // Nenhum módulo maior que a bancada real de referência 500 x 340 mm.
      expect(bb.width).toBeLessThanOrEqual(500);
      expect(bb.depth).toBeLessThanOrEqual(340);
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

  it('deve manter toda a eletrônica na baia seca, fora do envelope do tanque', () => {
    const tank = benchLayout.objects.find((obj) => obj.id === 'TK1');
    expect(tank).toBeDefined();
    if (!tank) return;

    const tankMinX = tank.positionMm[0] - tank.boundingBoxMm.width / 2;
    const tankMaxX = tank.positionMm[0] + tank.boundingBoxMm.width / 2;
    const tankMinZ = tank.positionMm[2] - tank.boundingBoxMm.depth / 2;
    const tankMaxZ = tank.positionMm[2] + tank.boundingBoxMm.depth / 2;

    ['BB1', 'U1', 'D1', 'BZ1', 'RFID1'].forEach((id) => {
      const object = benchLayout.objects.find((obj) => obj.id === id);
      expect(object).toBeDefined();
      if (!object) return;
      const objectMinX = object.positionMm[0] - object.boundingBoxMm.width / 2;
      const objectMaxX = object.positionMm[0] + object.boundingBoxMm.width / 2;
      const objectMinZ = object.positionMm[2] - object.boundingBoxMm.depth / 2;
      const objectMaxZ = object.positionMm[2] + object.boundingBoxMm.depth / 2;
      const overlapsTank = objectMinX < tankMaxX && objectMaxX > tankMinX && objectMinZ < tankMaxZ && objectMaxZ > tankMinZ;
      expect(overlapsTank).toBe(false);
    });
  });
});
