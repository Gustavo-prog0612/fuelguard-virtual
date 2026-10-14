import { useRef, useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { useModalDialogFocus } from '@/ui/components/accessibility/use-modal-dialog-focus';
import { restoreInspectionScene } from '@/ui/views/cad/inspection-scene';

function TestDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useModalDialogFocus({ dialogRef, initialFocusRef: closeButtonRef, onClose });

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Inspeção 360 graus">
      <button ref={closeButtonRef} onClick={onClose}>Fechar inspeção</button>
      <button type="button">Redefinir câmera</button>
    </div>
  );
}

function InspectorHarness() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>Inspecionar componente</button>
      {isOpen && <TestDialog onClose={() => setIsOpen(false)} />}
    </>
  );
}

describe('foco do modal de inspeção 360°', () => {
  it('fecha com Escape e restaura o foco para o controle que abriu a inspeção', async () => {
    render(<InspectorHarness />);
    const trigger = screen.getByRole('button', { name: 'Inspecionar componente' });

    trigger.focus();
    fireEvent.click(trigger);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Fechar inspeção' }));

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it('restaura a rotação e a visibilidade da bancada ao encerrar a inspeção', () => {
    const inspectedComponent = new THREE.Group();
    const hiddenComponent = new THREE.Group();
    const originalRotation = new THREE.Euler(0.3, -0.7, 0.1);
    inspectedComponent.rotation.set(1.1, 0.8, 0.5);
    hiddenComponent.visible = false;

    const objectRef = { current: inspectedComponent };
    const baseRotationRef = { current: originalRotation };
    const angleRef = { current: 1.5 };
    const visibilityRef = { current: [{ object: hiddenComponent, visible: true }] };

    restoreInspectionScene({ objectRef, baseRotationRef, angleRef, visibilityRef });

    expect(inspectedComponent.rotation.x).toBe(originalRotation.x);
    expect(inspectedComponent.rotation.y).toBe(originalRotation.y);
    expect(inspectedComponent.rotation.z).toBe(originalRotation.z);
    expect(hiddenComponent.visible).toBe(true);
    expect(objectRef.current).toBeNull();
    expect(baseRotationRef.current).toBeNull();
    expect(angleRef.current).toBe(0);
    expect(visibilityRef.current).toEqual([]);
  });
});
