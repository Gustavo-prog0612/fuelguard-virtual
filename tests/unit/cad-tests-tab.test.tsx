import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CadTestsTab } from '@/ui/views/cad/CadTestsTab';

describe('Estação 9 — testes de engenharia em tempo real', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('executa os gates no navegador em ordem e publica o resultado final', () => {
    vi.useFakeTimers();
    render(<CadTestsTab />);

    fireEvent.click(screen.getByRole('button', { name: /Executar verificação/i }));
    expect(screen.getByText('0/9 EXECUTADOS')).toBeTruthy();
    expect(screen.getAllByText('Aguardando execução em tempo real…')).toHaveLength(9);

    act(() => {
      vi.advanceTimersByTime(180 * 9 + 20);
    });

    expect(screen.getByText('Execução concluída — resultados prontos para inspeção.')).toBeTruthy();
    expect(screen.getByText('4 PASS • 0 AVISO • 5 PENDENTE')).toBeTruthy();
    expect(screen.getByText(/PCB-001 PENDING/)).toBeTruthy();
  });

  it('cancela uma execução anterior quando o componente é desmontado', () => {
    vi.useFakeTimers();
    const { unmount } = render(<CadTestsTab />);
    fireEvent.click(screen.getByRole('button', { name: /Executar verificação/i }));

    unmount();
    expect(() => {
      act(() => {
        vi.runAllTimers();
      });
    }).not.toThrow();
  });

  it('exporta um relatório JSON com o escopo Carrier', () => {
    const createObjectUrl = vi.fn(() => 'blob:fuelguard-report');
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectUrl });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    render(<CadTestsTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Exportar evidência JSON' }));

    expect(createObjectUrl).toHaveBeenCalledOnce();
    expect(anchorClick).toHaveBeenCalledOnce();
  });
});
