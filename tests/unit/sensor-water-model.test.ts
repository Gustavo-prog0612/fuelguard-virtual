import { describe, expect, it } from 'vitest';
import { TANK_SPEC } from '@/circuit-cad/assembly-source';
import { getSensorWaterSnapshot, SEN0311_SENSOR_SPEC } from '@/circuit-cad/sensor-water-model';

describe('Contrato físico do SEN0311 e tanque de bancada', () => {
  it('deriva volume, altura e distância a partir do mesmo tanque paramétrico', () => {
    const snapshot = getSensorWaterSnapshot(50);

    expect(snapshot.levelPct).toBe(50);
    expect(snapshot.volumeLiters).toBeCloseTo(TANK_SPEC.operationalMaxLiters / 2, 6);
    expect(snapshot.waterHeightMm).toBeCloseTo(65, 1);
    expect(snapshot.distanceMm).toBeCloseTo(95, 1);
    expect(snapshot.zone).toBe('nominal');
  });

  it('mantém o tanque dentro do envelope operacional e marca a zona cega', () => {
    const empty = getSensorWaterSnapshot(0);
    const fullOperational = getSensorWaterSnapshot(100);

    expect(empty.distanceMm).toBeCloseTo(TANK_SPEC.innerHeightMm, 1);
    expect(fullOperational.volumeLiters).toBeCloseTo(TANK_SPEC.operationalMaxLiters, 6);
    expect(fullOperational.distanceMm).toBeCloseTo(SEN0311_SENSOR_SPEC.blindZoneMm, 1);
    expect(fullOperational.zone).toBe('blind-zone');
  });

  it('clampa presets inválidos e não declara calibração física liberada', () => {
    expect(getSensorWaterSnapshot(-20).levelPct).toBe(0);
    expect(getSensorWaterSnapshot(140).levelPct).toBe(100);
    expect(getSensorWaterSnapshot(50).calibrationStatus).toBe('physical-release-pending');
  });
});
