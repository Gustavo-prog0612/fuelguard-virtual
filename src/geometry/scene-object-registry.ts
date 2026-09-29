import * as THREE from 'three';
import { meshesIntersect } from './mesh-collision';

export type CollisionStatus = 'PASS' | 'WARNING' | 'FAIL' | 'PENDING_PHYSICAL_EVIDENCE';

export interface SceneObjectRecord {
  id: string;
  designator?: string;
  object3D: THREE.Object3D;
  collisionClass: string;
  verified: boolean;
  bounds: THREE.Box3;
}

export interface CollisionCheckResult {
  firstId: string;
  secondId: string;
  status: CollisionStatus;
  reason: string;
}

function meshesOf(object: THREE.Object3D): THREE.Mesh<THREE.BufferGeometry>[] {
  const meshes: THREE.Mesh<THREE.BufferGeometry>[] = [];
  object.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry instanceof THREE.BufferGeometry) {
      meshes.push(child as THREE.Mesh<THREE.BufferGeometry>);
    }
  });
  return meshes;
}

export class SceneObjectRegistry {
  private readonly records = new Map<string, SceneObjectRecord>();

  register(
    id: string,
    object3D: THREE.Object3D,
    options: { designator?: string; collisionClass: string; verified?: boolean },
  ): SceneObjectRecord {
    object3D.updateMatrixWorld(true);
    const record: SceneObjectRecord = {
      id,
      designator: options.designator,
      object3D,
      collisionClass: options.collisionClass,
      verified: options.verified ?? false,
      bounds: new THREE.Box3().setFromObject(object3D),
    };
    this.records.set(id, record);
    return record;
  }

  update(id: string): SceneObjectRecord | undefined {
    const record = this.records.get(id);
    if (!record) return undefined;
    record.object3D.updateMatrixWorld(true);
    record.bounds = new THREE.Box3().setFromObject(record.object3D);
    return record;
  }

  get(id: string): SceneObjectRecord | undefined {
    return this.records.get(id);
  }

  list(): SceneObjectRecord[] {
    return Array.from(this.records.values());
  }

  checkCollision(firstId: string, secondId: string): CollisionCheckResult {
    const first = this.records.get(firstId);
    const second = this.records.get(secondId);
    if (!first || !second) {
      return { firstId, secondId, status: 'WARNING', reason: 'Objeto ainda não está registrado na cena.' };
    }

    this.update(firstId);
    this.update(secondId);
    if (!first.bounds.intersectsBox(second.bounds)) {
      return { firstId, secondId, status: 'PASS', reason: 'Bounds separados.' };
    }

    const firstMeshes = meshesOf(first.object3D);
    const secondMeshes = meshesOf(second.object3D);
    const intersects = firstMeshes.some((firstMesh) =>
      secondMeshes.some((secondMesh) => meshesIntersect(firstMesh, secondMesh)),
    );
    if (!intersects) {
      return { firstId, secondId, status: 'PASS', reason: 'Bounds sobrepostos, mas superfícies não se intersectam.' };
    }

    return {
      firstId,
      secondId,
      status: first.verified && second.verified ? 'FAIL' : 'PENDING_PHYSICAL_EVIDENCE',
      reason: first.verified && second.verified
        ? 'Interseção geométrica detectada.'
        : 'Interseção em asset ainda pendente de evidência física.',
    };
  }

  dispose(): void {
    this.records.clear();
  }
}
