import benchLayout from '@/../fuelguard/assembly/bench-layout.json';
import { PHYSICAL_WIRING_REGISTRY } from './wiring-registry';

export type CollisionClass =
  | 'SOLID_BASE'
  | 'ACTIVE_MODULE'
  | 'PASSIVE_COMPONENT'
  | 'STANDALONE_MODULE'
  | 'TRANSPARENT_FLUID_CONTAINER'
  | 'LID_ASSEMBLY'
  | 'SENSOR_PROBE'
  | 'LID_INTERLOCK';

export type SceneZone = 'dry' | 'wet' | 'boundary';

export interface SceneObjectDefinition {
  id: string;
  assetRef: string;
  name: string;
  positionMm: [number, number, number];
  rotationDeg: [number, number, number];
  dimensionsMm: { width: number; height: number; depth: number };
  collisionClass: CollisionClass;
  zone: SceneZone;
  pickable: boolean;
  verificationStatus?: string;
}

export interface CableRouteDefinition {
  id: string;
  fromComponent: string;
  toComponent: string;
  fromPin: string;
  toPin: string;
  waypoints: [number, number, number][];
  diameterMm: number;
  estimatedLengthMm: number;
  netName: string;
  fromTerminal?: string;
  toTerminal?: string;
}

export const TANK_SPEC = {
  id: 'FG-TANK-5L-CYL-R1',
  shape: 'cylinder' as const,
  innerDiameterMm: 200,
  innerHeightMm: 160,
  wallMm: 3,
  outerDiameterMm: 206,
  outerHeightMm: 168,
  lidDiameterMm: 206,
  lidThicknessMm: 5,
  sensorBlindZoneMm: 30,
  geometricCapacityLiters: Math.PI * 100 * 100 * 160 / 1_000_000,
  operationalMaxLiters: Math.PI * 100 * 100 * 130 / 1_000_000,
} as const;

const rawObjects = benchLayout.objects as Array<{
  id: string;
  assetRef: string;
  name: string;
  positionMm: number[];
  rotationDeg: number[];
  boundingBoxMm: { width: number; height: number; depth: number };
  collisionClass: CollisionClass;
  verificationStatus?: string;
}>;

export const SCENE_OBJECTS: SceneObjectDefinition[] = rawObjects.map((object) => ({
  id: object.id,
  assetRef: object.assetRef,
  name: object.name,
  positionMm: [object.positionMm[0], object.positionMm[1], object.positionMm[2]],
  rotationDeg: [object.rotationDeg[0], object.rotationDeg[1], object.rotationDeg[2]],
  dimensionsMm: object.boundingBoxMm,
  collisionClass: object.collisionClass,
  zone: object.id === 'TK1' ? 'wet' : object.id === 'LID1' || object.id === 'SEN1_PROBE' || object.id === 'SW1' ? 'boundary' : 'dry',
  pickable: true,
  verificationStatus: object.verificationStatus,
}));

export const CABLE_ROUTES: CableRouteDefinition[] = PHYSICAL_WIRING_REGISTRY.map((cable) => ({
  id: cable.id,
  fromComponent: cable.fromComponent,
  toComponent: cable.toComponent,
  fromPin: cable.fromPin,
  toPin: cable.toPin,
  waypoints: cable.waypoints,
  diameterMm: cable.diameterMm,
  estimatedLengthMm: cable.estimatedLengthMm,
  netName: cable.netName,
  fromTerminal: cable.fromTerminal,
  toTerminal: cable.toTerminal,
}));

export const FUELGUARD_ASSEMBLY = {
  bench: benchLayout.bench,
  tank: TANK_SPEC,
  objects: SCENE_OBJECTS,
  cables: CABLE_ROUTES,
} as const;

export function getSceneObject(id: string): SceneObjectDefinition | undefined {
  return SCENE_OBJECTS.find((object) => object.id === id || object.assetRef === id);
}

export function isElectronicsInDryBay(id: string): boolean {
  const object = getSceneObject(id);
  return object?.zone === 'dry' && ['BB1', 'U1', 'D1', 'BZ1', 'RFID1'].includes(object.id);
}

export function getTankWaterHeightMm(volumeLiters: number): number {
  const clampedVolume = Math.max(0, Math.min(volumeLiters, TANK_SPEC.operationalMaxLiters));
  return clampedVolume * 1_000_000 / (Math.PI * (TANK_SPEC.innerDiameterMm / 2) ** 2);
}
