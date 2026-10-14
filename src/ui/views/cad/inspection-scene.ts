import * as THREE from 'three';

type RefLike<T> = { current: T };

interface InspectionVisibilityEntry {
  object: THREE.Object3D;
  visible: boolean;
}

interface RestoreInspectionSceneOptions {
  objectRef: RefLike<THREE.Object3D | null>;
  baseRotationRef: RefLike<THREE.Euler | null>;
  angleRef: RefLike<number>;
  visibilityRef: RefLike<InspectionVisibilityEntry[]>;
}

/** Restitui a cena principal depois de encerrar a inspeção isolada de um componente. */
export function restoreInspectionScene({
  objectRef,
  baseRotationRef,
  angleRef,
  visibilityRef,
}: RestoreInspectionSceneOptions): void {
  if (objectRef.current && baseRotationRef.current) {
    objectRef.current.rotation.copy(baseRotationRef.current);
  }

  visibilityRef.current.forEach(({ object, visible }) => {
    object.visible = visible;
  });

  visibilityRef.current = [];
  angleRef.current = 0;
  objectRef.current = null;
  baseRotationRef.current = null;
}
