import { describe, it, expect } from 'vitest';
import tankManifest from '@/../fuelguard/assets/mechanical/tank/asset-manifest.json';

const INTERNAL_WIDTH_MM = 200;
const INTERNAL_LENGTH_MM = 200;
const INTERNAL_HEIGHT_MM = 160;

function stateForVolume(volumeL: number) {
  const heightMm = (volumeL * 1_000_000) / (INTERNAL_WIDTH_MM * INTERNAL_LENGTH_MM);
  return { volumeL, heightMm, distanceToSensorMm: INTERNAL_HEIGHT_MM - heightMm };
}

describe('Gate de geometria do tanque FG-TANK-6L-R1 e sensor SEN0311', () => {
  it('mantém a baseline paramétrica retangular declarada pelo projeto', () => {
    expect(tankManifest.model).toBe('FG-TANK-6L-R1');
    expect(tankManifest.internalDimensionsMm).toEqual({ width: 200, length: 200, height: 160 });
    expect(tankManifest.dimensionsMm).toMatchObject({ outerWidth: 206, outerLength: 206, height: 168, wallThickness: 3, lidThickness: 5 });
    expect(tankManifest.fluidPhysics.volumeCalculationFormula).toContain('200mm*200mm');
    expect(tankManifest.verificationStatus).toBe('PENDING_PHYSICAL_EVIDENCE');
  });

  it('mantém o intervalo operacional de 1–5 L dentro da janela acústica de 35–135 mm', () => {
    const low = stateForVolume(1);
    const high = stateForVolume(5);
    expect(low.heightMm).toBe(25);
    expect(high.heightMm).toBe(125);
    expect(low.distanceToSensorMm).toBe(135);
    expect(high.distanceToSensorMm).toBe(35);
    expect(low.distanceToSensorMm).toBeGreaterThan(30);
    expect(high.distanceToSensorMm).toBeGreaterThan(30);
  });
});
