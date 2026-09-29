import { describe, it, expect } from 'vitest';
import tankManifest from '@/../fuelguard/assets/mechanical/tank/asset-manifest.json';
import { TANK_SPEC } from '@/circuit-cad/assembly-source';

const INTERNAL_RADIUS_MM = 100;
const INTERNAL_HEIGHT_MM = 160;

function stateForVolume(volumeL: number) {
  const heightMm = (volumeL * 1_000_000) / (Math.PI * INTERNAL_RADIUS_MM ** 2);
  return { volumeL, heightMm, distanceToSensorMm: INTERNAL_HEIGHT_MM - heightMm };
}

describe('Gate de geometria do tanque FG-TANK-5L-CYL-R1 e sensor SEN0311', () => {
  it('mantém a baseline paramétrica cilíndrica declarada pelo projeto', () => {
    expect(tankManifest.model).toBe('FG-TANK-5L-CYL-R1');
    expect(tankManifest.internalDimensionsMm).toEqual({ diameter: 200, height: 160 });
    expect(tankManifest.dimensionsMm).toMatchObject({ outerDiameter: 206, height: 168, wallThickness: 3, lidDiameter: 206, lidThickness: 5 });
    expect(tankManifest.fluidPhysics.volumeCalculationFormula).toContain('PI');
    expect(TANK_SPEC.geometricCapacityLiters).toBeCloseTo(5.0265, 3);
    expect(TANK_SPEC.operationalMaxLiters).toBeCloseTo(4.084, 3);
    expect(tankManifest.verificationStatus).toBe('PENDING_PHYSICAL_EVIDENCE');
  });

  it('mantém o intervalo operacional dentro da janela acústica de 30–130 mm', () => {
    const low = stateForVolume(1);
    const high = stateForVolume(TANK_SPEC.operationalMaxLiters);
    expect(low.heightMm).toBeCloseTo(31.83, 2);
    expect(high.heightMm).toBeCloseTo(130, 2);
    expect(low.distanceToSensorMm).toBeCloseTo(128.17, 2);
    expect(high.distanceToSensorMm).toBeCloseTo(30, 2);
    expect(low.distanceToSensorMm).toBeGreaterThan(TANK_SPEC.sensorBlindZoneMm);
    expect(high.distanceToSensorMm).toBeGreaterThanOrEqual(TANK_SPEC.sensorBlindZoneMm);
  });
});
