/**
 * FuelGuard Virtual Test Bench — Tipos e Interfaces de Cenários de Teste
 */

export interface SimulationScenario {
  id: string;
  name: string;
  badge: string;
  description: string;
  initialWaterHeightCm: number;
  temperatureC: number;
  noiseStdDevCm: number;
  initialLidClosed: boolean;
  initialNfcUid?: string;
  initialSloshAmplitudeCm?: number;
  transportOnline: boolean;
  stepDescription: string[];
}
