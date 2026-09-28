import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { meshBounds, meshesIntersect } from '@/geometry/mesh-collision';

describe('Consultas geométricas de malha para auditoria da bancada', () => {
  it('detecta interseção entre sólidos transformados', () => {
    const first = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10));
    const second = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2));
    second.position.x = 4;
    expect(meshesIntersect(first, second)).toBe(true);
  });

  it('mantém a colisão separada da regra de folga', () => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10));
    const bounds = meshBounds(mesh);
    expect(bounds.getSize(new THREE.Vector3()).x).toBe(10);
  });
});
