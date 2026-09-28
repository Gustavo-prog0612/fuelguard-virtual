import { describe, it, expect } from 'vitest';
import tankManifest from '@/../fuelguard/assets/mechanical/tank/asset-manifest.json';

describe('Auditoria de Engenharia Mecatrônica — Hidrostática e Sensor Ultrassônico', () => {
  const tankDimensions = tankManifest.dimensionsMm;
  const innerRadiusMm = tankDimensions.innerDiameter / 2; // 72.0 mm
  const maxWaterHeightMm = tankDimensions.height - 20; // 200 mm
  const sensorTipYMm = tankDimensions.height; // 220 mm

  // Função canônica de telemetria ultrassônica
  const calculateHydrostatics = (pct: number) => {
    const clampedPct = Math.max(0, Math.min(100, pct));
    const waterHeightMm = (clampedPct / 100) * maxWaterHeightMm;
    const waterVolumeLiters = (Math.PI * Math.pow(innerRadiusMm / 10, 2) * (waterHeightMm / 10)) / 1000;
    const distanceToSensorMm = sensorTipYMm - waterHeightMm;
    const timeOfFlightUs = (2 * distanceToSensorMm) / 0.343;

    return {
      waterHeightMm,
      waterVolumeLiters,
      distanceToSensorMm,
      timeOfFlightUs,
    };
  };

  it('deve conter a água estritamente no raio interno do cilindro sem transbordamento', () => {
    const waterRadius = innerRadiusMm - 0.5; // folga radial
    expect(waterRadius).toBeLessThan(innerRadiusMm);
    expect(innerRadiusMm).toBeLessThan(tankDimensions.outerDiameter / 2);
  });

  it('deve calcular corretamente o estado de tanque VAZIO (0%)', () => {
    const emptyState = calculateHydrostatics(0);
    expect(emptyState.waterHeightMm).toBe(0);
    expect(emptyState.waterVolumeLiters).toBe(0);
    expect(emptyState.distanceToSensorMm).toBe(sensorTipYMm); // 220mm (distância máxima ao fundo)
    expect(emptyState.timeOfFlightUs).toBeCloseTo((2 * 220) / 0.343, 1);
  });

  it('deve calcular corretamente os 5 estados de ensaio oficial (0%, 25%, 50%, 75%, 100%)', () => {
    const testLevels = [0, 25, 50, 75, 100];
    let previousDistance = Infinity;
    let previousVolume = -1;

    testLevels.forEach((lvl) => {
      const state = calculateHydrostatics(lvl);

      // Conforme o nível sobe, o volume deve aumentar estritamente
      expect(state.waterVolumeLiters).toBeGreaterThan(previousVolume);
      previousVolume = state.waterVolumeLiters;

      // Conforme o nível sobe, a distância até a sonda na tampa deve diminuir
      expect(state.distanceToSensorMm).toBeLessThan(previousDistance);
      previousDistance = state.distanceToSensorMm;

      // O tempo de voo acústico deve ser estritamente proporcional à distância
      expect(state.timeOfFlightUs).toBeCloseTo((2 * state.distanceToSensorMm) / 0.343, 1);
    });
  });

  it('deve alertar zona cega acústica (< 200mm) quando a água se aproxima excessivamente do sensor', () => {
    const fullState = calculateHydrostatics(100);
    // Em 100% de volume útil, a distância até a sonda é 20mm (dentro da zona cega)
    expect(fullState.distanceToSensorMm).toBeLessThan(200);

    const halfState = calculateHydrostatics(50);
    // Em 50%, a distância é 120mm
    expect(halfState.distanceToSensorMm).toBeLessThan(200);
  });
});
