import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Pcb3DCanvas } from '@/ui/views/cad/Pcb3DCanvas';

describe('Estação PCB 3D — gate honesto do Carrier', () => {
  it('mostra o inventário Carrier sem importar assets do RP2040', () => {
    render(<Pcb3DCanvas />);

    expect(screen.getByText('Gate de placa fabricável')).toBeTruthy();
    expect(screen.getAllByTestId(/^pcb3d-asset-/)).toHaveLength(11);
    expect(screen.queryByText(/RP2040|motor-controller/i)).toBeNull();
    expect(screen.getByText('4/11')).toBeTruthy();
  });

  it('oferece rotas claras para registro e montagem física', () => {
    const onSelectTab = vi.fn();
    render(<Pcb3DCanvas onSelectTab={onSelectTab} />);

    fireEvent.click(screen.getByRole('button', { name: /Abrir registro/i }));
    fireEvent.click(screen.getByRole('button', { name: /Abrir montagem 3D/i }));

    expect(onSelectTab).toHaveBeenNthCalledWith(1, 'catalog');
    expect(onSelectTab).toHaveBeenNthCalledWith(2, 'assembly');
  });
});
