import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { SceneObjectRegistry } from '@/geometry/scene-object-registry';

describe('SceneObjectRegistry', () => {
  it('reutiliza o registro para detectar colisões entre objetos móveis', () => {
    const registry = new SceneObjectRegistry();
    const first = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10));
    const second = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2));
    second.position.x = 4;
    registry.register('A', first, { collisionClass: 'SOLID', verified: true });
    registry.register('B', second, { collisionClass: 'SOLID', verified: true });
    expect(registry.checkCollision('A', 'B').status).toBe('FAIL');
    second.position.x = 20;
    expect(registry.checkCollision('A', 'B').status).toBe('PASS');
  });

  it('classifica interseção de assets não validados como pendência física', () => {
    const registry = new SceneObjectRegistry();
    registry.register('A', new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10)), { collisionClass: 'TANK' });
    const probe = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2));
    probe.position.x = 4;
    registry.register('B', probe, { collisionClass: 'PROBE' });
    expect(registry.checkCollision('A', 'B').status).toBe('PENDING_PHYSICAL_EVIDENCE');
  });
});
