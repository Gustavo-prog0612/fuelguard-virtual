import * as THREE from 'three';
import { MeshBVH } from 'three-mesh-bvh';

const bvhCache = new WeakMap<THREE.BufferGeometry, MeshBVH>();

function getCachedBvh(geometry: THREE.BufferGeometry): MeshBVH {
  const cached = bvhCache.get(geometry);
  if (cached) return cached;
  const bvh = new MeshBVH(geometry);
  bvhCache.set(geometry, bvh);
  return bvh;
}

/**
 * Consulta de colisão entre duas malhas no espaço de mundo.
 * É deliberadamente uma utilidade de geometria: não decide se uma colisão é
 * aceitável. A regra de folga deve vir do AssemblyDefinition e da revisão de
 * engenharia, não de um booleano visual do viewer.
 */
export function meshesIntersect(
  first: THREE.Mesh<THREE.BufferGeometry>,
  second: THREE.Mesh<THREE.BufferGeometry>,
): boolean {
  first.updateMatrixWorld(true);
  second.updateMatrixWorld(true);

  const bvh = getCachedBvh(first.geometry);
  const firstWorldInverse = new THREE.Matrix4().copy(first.matrixWorld).invert();
  const secondToFirst = new THREE.Matrix4().multiplyMatrices(firstWorldInverse, second.matrixWorld);
  return bvh.intersectsGeometry(second.geometry, secondToFirst);
}

export function meshBounds(mesh: THREE.Mesh<THREE.BufferGeometry>): THREE.Box3 {
  mesh.updateMatrixWorld(true);
  return new THREE.Box3().setFromObject(mesh);
}
