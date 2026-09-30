import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CadConnectionsTab } from '@/ui/views/cad/CadConnectionsTab';

describe('Estação de conexões físicas', () => {
  it('mostra bitolas e comprimento derivados do registro de fiação', () => {
    render(<CadConnectionsTab />);

    expect(screen.getByText(/Rotas calculadas/)).toBeTruthy();
    expect(screen.getByText('AWG24 / AWG26 / AWG28/AWG24')).toBeTruthy();
    expect(screen.getAllByText('AWG AWG24').length).toBeGreaterThan(0);
    expect(screen.getByText('21/21 rotas')).toBeTruthy();
  });

  it('oferece atalhos para testes e peças sem perder o filtro da estação', () => {
    const onSelectTab = vi.fn();
    render(<CadConnectionsTab onSelectTab={onSelectTab} />);

    fireEvent.click(screen.getByRole('button', { name: 'Testar em tempo real' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ver peças' }));

    expect(onSelectTab).toHaveBeenNthCalledWith(1, 'tests');
    expect(onSelectTab).toHaveBeenNthCalledWith(2, 'bom');
  });
});
