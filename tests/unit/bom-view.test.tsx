import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { BomView } from '@/ui/views/cad/BomView';

describe('BOM do Carrier — referências de compra', () => {
  it('renderiza foto local do fornecedor, nome, valor/status e redirecionamento de compra', () => {
    render(<BomView />);

    expect(screen.getByAltText('Placa Espressif ESP32-S3-DevKitC-1-N8R8').getAttribute('src')).toBe('/assets/purchase/ESP32-S3-DevKitC-1-N8R8-digikey.jpg');
    expect(screen.getByAltText('Sensor ultrassônico impermeável DFRobot A02YYUW SEN0311').getAttribute('src')).toBe('/assets/purchase/SEN0311-dfrobot.jpg');
    expect(screen.getByAltText('Adafruit PN532 RFID NFC Breakout v1.6').getAttribute('src')).toBe('/assets/purchase/PN532-Adafruit-v1.6.jpg');
    expect(screen.getAllByText('Preço observado').length).toBeGreaterThan(0);
    expect(screen.getByText('US$ 15,00')).toBeTruthy();
    expect(screen.getByText(/Estimativa BR: R\$ 350,00–R\$ 650,00/)).toBeTruthy();
    expect(screen.queryByText(/R\\\$/)).toBeNull();
    expect(screen.getAllByRole('link', { name: /Comprar/i }).length).toBeGreaterThan(0);
  });

  it('diferencia uma prévia CAD técnica de uma foto comercial', () => {
    render(<BomView />);

    expect(screen.getAllByText('Prévia CAD local · não é foto comercial').length).toBeGreaterThanOrEqual(4);
    expect(screen.getAllByText('Referência visual · variante/lote pendente').length).toBeGreaterThanOrEqual(5);
    expect(screen.getByAltText('LED verde difuso Kingbright WP7113GD de 5 mm').getAttribute('src')).toBe('/assets/cad/carrier/D1/thumbnail.svg');
    expect(screen.getByRole('link', { name: /Abrir fonte da imagem de WP7113GD/i }).getAttribute('href')).toBe('https://gitlab.com/kicad/libraries/kicad-packages3D');
  });

  it('permite concentrar o registro CAD por classe e por estado do asset', () => {
    render(<BomView />);

    expect(screen.getByTestId('carrier-asset-U1')).toBeTruthy();
    expect(screen.getByTestId('carrier-asset-TK1')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Classe A' }));
    expect(screen.getByTestId('carrier-asset-U1')).toBeTruthy();
    expect(screen.queryByTestId('carrier-asset-U2')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Pendentes / aproximações' }));
    expect(screen.getByTestId('carrier-asset-U1')).toBeTruthy();
    expect(screen.getByText('1/11 exibidos')).toBeTruthy();
  });

  it('permite buscar uma peça sem percorrer cartões irrelevantes', () => {
    render(<BomView />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar referências da BOM e do CAD' }), {
      target: { value: 'SN74AHCT125N' },
    });

    expect(screen.getByTestId('carrier-asset-U2')).toBeTruthy();
    expect(screen.queryByTestId('carrier-asset-U1')).toBeNull();
    expect(screen.getByText('SN74AHCT125N')).toBeTruthy();
  });
});
