import { getCarrierAssetEntryByDesignator } from './carrier-assets';
import { getTankWaterHeightMm, TANK_PHYSICAL_RELEASED, TANK_SPEC } from './assembly-source';

export const SEN0311_SENSOR_SPEC = {
  designator: 'SEN1',
  model: 'DFRobot A02YYUW / SEN0311',
  protocol: 'UART TTL 9600 8N1',
  blindZoneMm: 30,
  maximumRangeMm: 4500,
  nominalCableMm: 300,
} as const;

export type SensorWaterZone = 'nominal' | 'blind-zone' | 'physical-pending';

export interface SensorWaterSnapshot {
  levelPct: number;
  volumeLiters: number;
  waterHeightMm: number;
  distanceMm: number;
  zone: SensorWaterZone;
  calibrationStatus: 'not-calibrated' | 'physical-release-pending';
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

/**
 * Derives the bench preset from the shared tank contract. The slider represents
 * the recommended operational envelope, not the unverified geometric volume.
 */
export function getSensorWaterSnapshot(levelPct: number): SensorWaterSnapshot {
  const normalizedLevel = clampPercent(levelPct);
  const volumeLiters = (TANK_SPEC.operationalMaxLiters * normalizedLevel) / 100;
  const waterHeightMm = getTankWaterHeightMm(volumeLiters);
  const distanceMm = Math.max(0, TANK_SPEC.innerHeightMm - waterHeightMm);
  const isBlindZone = distanceMm <= SEN0311_SENSOR_SPEC.blindZoneMm;

  return {
    levelPct: normalizedLevel,
    volumeLiters,
    waterHeightMm,
    distanceMm,
    zone: isBlindZone ? 'blind-zone' : 'nominal',
    calibrationStatus: TANK_PHYSICAL_RELEASED ? 'not-calibrated' : 'physical-release-pending',
  };
}

export function getSensorAssetStatus() {
  return getCarrierAssetEntryByDesignator(SEN0311_SENSOR_SPEC.designator);
}
