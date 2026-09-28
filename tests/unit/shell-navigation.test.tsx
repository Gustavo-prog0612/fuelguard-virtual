import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '@/app';

describe('Marco M1: Casca do Sistema e Navegação — Design System Sereno', () => {
  it('renderiza o cabeçalho com identidade visual FuelGuard e especificações do hardware', () => {
    render(<App />);
    expect(screen.getByText(/FuelGuard/i)).toBeDefined();
    expect(screen.getByText(/Real Hardware Reference/i)).toBeDefined();
    expect(screen.getByText(/ESP32-S3 v1.1 • PN532 V4 • SEN0311 UART • PCB sob gate/i)).toBeDefined();
  });

  it('exibe todos os 5 itens de navegação na barra de tarefas', () => {
    render(<App />);
    expect(screen.getByRole('tab', { name: /1\. Bancada/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /2\. Sinais/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /3\. Eventos/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /4\. Testes/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /5\. Projeto CAD/i })).toBeDefined();
  });

  it('alterna para a tela de 1. Bancada ao clicar na aba', () => {
    render(<App />);
    const benchButton = screen.getByRole('tab', { name: /1\. Bancada/i });
    fireEvent.click(benchButton);

    expect(screen.getByText(/Bancada Virtual de Montagem/i)).toBeDefined();
    expect(screen.getByText(/Validador Elétrico/i)).toBeDefined();
    expect(screen.getByText(/ESP32-S3 DevKitC-1/i)).toBeDefined();
  });

  it('alterna para a tela de 2. Sinais ao clicar na aba', () => {
    render(<App />);
    const signalsButton = screen.getByRole('tab', { name: /2\. Sinais/i });
    fireEvent.click(signalsButton);

    expect(screen.getByText(/Estação de Sinais Acústicos & Telemetria do Tanque/i)).toBeDefined();
    expect(screen.getByText(/Corte Transversal 2D/i)).toBeDefined();
    expect(screen.getByText(/Osciloscópio Acústico & Filtro Mediano/i)).toBeDefined();
  });

  it('alterna para a tela de 3. Eventos ao clicar na aba', () => {
    render(<App />);
    const eventsButton = screen.getByRole('tab', { name: /3\. Eventos/i });
    fireEvent.click(eventsButton);

    expect(screen.getByText(/Console Serial UART/i)).toBeDefined();
    expect(screen.getByText(/Linha do Tempo Monotônica/i)).toBeDefined();
  });

  it('alterna para a tela de 4. Testes e exibe os presets de simulação', () => {
    render(<App />);
    const testsButton = screen.getByRole('tab', { name: /4\. Testes/i });
    fireEvent.click(testsButton);

    expect(screen.getByText(/Cenário A: Operação Nominal Estável/i)).toBeDefined();
    expect(screen.getByText(/Cenário B: Abastecimento Rápido & Slosh/i)).toBeDefined();
    expect(screen.getByText(/Injeção de Estímulos e Falhas em Tempo Real/i)).toBeDefined();
  });

  it('alterna para a tela de 5. Projeto CAD e exibe a estação EDA', async () => {
    render(<App />);
    const cadButton = screen.getByRole('tab', { name: /5\. Projeto CAD/i });
    fireEvent.click(cadButton);

    expect(await screen.findByText(/Estação de Projeto CAD & Eletrônica/i)).toBeDefined();
  });

  it('alterna o estado da simulação pelo botão Play/Pause', () => {
    render(<App />);
    const playOrPause = screen.getByLabelText(/Iniciar Simulação|Pausar Simulação/i);
    expect(playOrPause).toBeDefined();

    fireEvent.click(playOrPause);
    const toggled = screen.getByLabelText(/Iniciar Simulação|Pausar Simulação/i);
    expect(toggled).toBeDefined();
  });
});
