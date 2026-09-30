import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  CarrierCadAssetManifestEntry,
  getCarrierAssetEntry,
} from '@/circuit-cad/carrier-assets';

export interface CarrierLoadedAsset {
  root: THREE.Group;
  source: CarrierCadAssetManifestEntry;
  measuredDimensionsMm: { width: number; height: number; depth: number };
}

const loader = new GLTFLoader();

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function measureObject(object: THREE.Object3D): { width: number; height: number; depth: number } {
  object.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(object);
  const size = bounds.getSize(new THREE.Vector3());
  return {
    width: Number(size.x.toFixed(3)),
    height: Number(size.y.toFixed(3)),
    depth: Number(size.z.toFixed(3)),
  };
}

function tagObjectTree(root: THREE.Object3D, entry: CarrierCadAssetManifestEntry): void {
  root.traverse((object) => {
    object.userData.componentId = entry.componentId;
    object.userData.designator = entry.designator;
    object.userData.assetStatus = entry.assetStatus;
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
}

/**
 * Carrega o asset do manifesto. Por padrão, somente o GLB verificado entra no
 * fluxo; `includeReference` permite abrir uma referência local pendente para
 * inspeção visual, mantendo o status e o aviso de variante no objeto.
 */
export async function loadCarrierAsset(
  componentId: string,
  options: { includeReference?: boolean } = {},
): Promise<CarrierLoadedAsset | null> {
  const entry = getCarrierAssetEntry(componentId);
  if (!entry) return null;

  const assetPath = entry.assetStatus === 'verified'
    ? entry.assetPath
    : options.includeReference
      ? entry.referenceAssetPath
      : undefined;
  if (!assetPath) return null;

  const gltf: GLTF = await loader.loadAsync(assetPath);
  const sourceModel = gltf.scene;
  const sourceBounds = new THREE.Box3().setFromObject(sourceModel);
  const sourceCenter = sourceBounds.getCenter(new THREE.Vector3());
  sourceModel.position.sub(sourceCenter);

  const root = new THREE.Group();
  root.name = `${entry.designator}-${entry.assetStatus === 'verified' ? 'carrier-cad-asset' : 'carrier-reference-asset'}`;
  root.userData.componentId = entry.componentId;
  root.userData.designator = entry.designator;
  root.userData.assetStatus = entry.assetStatus;
  root.userData.assetSourceType = entry.assetSourceType;
  root.userData.assetPath = assetPath;
  root.add(sourceModel);

  root.scale.set(
    entry.assetTransform.scale.x,
    entry.assetTransform.scale.y,
    entry.assetTransform.scale.z,
  );
  root.rotation.set(
    toRadians(entry.assetTransform.rotationDeg.x),
    toRadians(entry.assetTransform.rotationDeg.y),
    toRadians(entry.assetTransform.rotationDeg.z),
  );
  root.position.set(
    entry.assetTransform.translationMm.x,
    entry.assetTransform.translationMm.y,
    entry.assetTransform.translationMm.z,
  );

  tagObjectTree(root, entry);
  return {
    root,
    source: entry,
    measuredDimensionsMm: measureObject(root),
  };
}

export function addCarrierAssetToScene(
  scene: THREE.Object3D,
  loadedAsset: CarrierLoadedAsset,
  position: THREE.Vector3,
): void {
  loadedAsset.root.position.add(position);
  scene.add(loadedAsset.root);
}

export function disposeCarrierAsset(root: THREE.Object3D): void {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material.dispose());
  });
  root.parent?.remove(root);
}

export function dimensionsWithinTolerance(
  actual: { width: number; height: number; depth: number },
  expected: { width: number; height: number; depth: number },
  toleranceMm: number,
): boolean {
  return (
    Math.abs(actual.width - expected.width) <= toleranceMm &&
    Math.abs(actual.height - expected.height) <= toleranceMm &&
    Math.abs(actual.depth - expected.depth) <= toleranceMm
  );
}
