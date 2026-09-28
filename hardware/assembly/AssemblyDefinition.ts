export interface Vector3Mm { x: number; y: number; z: number; }
export interface BoundingBoxMm { width: number; height: number; depth: number; }

export interface AssemblyObjectDefinition {
  id: string;
  name: string;
  assetRef: string;
  positionMm: [number, number, number];
  rotationDeg: [number, number, number];
  boundingBoxMm: BoundingBoxMm;
  supportPoint: { type: string; contactY: number };
  fasteningMethod: string;
  collisionClass: string;
}

export interface CableRouteDefinition {
  id: string;
  netName: string;
  origin: { component: string; pin: string; posMm: [number, number, number] };
  destination: { component: string; pin: string; posMm: [number, number, number] };
  waypoints: [number, number, number][];
  terminals: { start: string; end: string };
  visualDiameterMm: number;
  estimatedLengthMm: number;
  color: string;
  signalType: string;
}

export interface AssemblyDefinition {
  revision: string;
  units: 'mm';
  bench: { dimensionsMm: BoundingBoxMm; surface: string };
  objects: AssemblyObjectDefinition[];
  cables: CableRouteDefinition[];
}
