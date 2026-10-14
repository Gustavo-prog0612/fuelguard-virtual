import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { FUELGUARD_CAD_LIBRARY } from '@/circuit-cad/component-library';
import { PURCHASE_CATALOG } from '@/circuit-cad/bom';
import {
  CARRIER_ASSET_ORDER,
  CARRIER_CAD_ASSET_MANIFEST,
  getCarrierAssetEntry,
} from '@/circuit-cad/carrier-assets';
import { dimensionsWithinTolerance, loadCarrierAsset } from '@/ui/views/cad/carrier-asset-loader';

const repoRoot = process.cwd();

describe('Carrier CAD asset pipeline', () => {
  it('mantém todos os designators do Carrier na ordem operacional fixada', () => {
    expect(CARRIER_CAD_ASSET_MANIFEST.map((entry) => entry.designator)).toEqual([...CARRIER_ASSET_ORDER]);
    expect(CARRIER_CAD_ASSET_MANIFEST.every((entry) => FUELGUARD_CAD_LIBRARY[entry.componentId])).toBe(true);
    expect(new Set(CARRIER_CAD_ASSET_MANIFEST.map((entry) => entry.componentId)).size).toBe(CARRIER_CAD_ASSET_MANIFEST.length);
  });

  it('não mistura designators ou assets do RP2040 no manifesto do Carrier', () => {
    const serialized = JSON.stringify(CARRIER_CAD_ASSET_MANIFEST).toLowerCase();
    expect(serialized).not.toContain('rp2040');
    expect(serialized).not.toContain('motor-controller');
    expect(serialized).not.toContain('stepper');
  });

  it('possui asset.json rastreável para cada designator Carrier', () => {
    for (const entry of CARRIER_CAD_ASSET_MANIFEST) {
      const metadataPath = path.join(repoRoot, 'public', 'assets', 'cad', 'carrier', entry.designator, 'asset.json');
      expect(fs.existsSync(metadataPath), `${entry.designator} sem asset.json`).toBe(true);

      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8')) as Record<string, unknown>;
      expect(metadata.designator).toBe(entry.designator);
      expect(metadata.componentId).toBe(entry.componentId);
      expect(metadata.assetStatus).toBe(entry.assetStatus);
      expect(metadata.sourceUrl).toBe(entry.sourceUrl);
      expect(metadata.license).toBeTruthy();
      expect(metadata.sourceUnits).toBe('mm');
    }
  });

  it('exige checksum, origem, dimensões e GLB para assets verificados', () => {
    for (const entry of CARRIER_CAD_ASSET_MANIFEST.filter((item) => item.assetStatus === 'verified')) {
      expect(entry.assetPath).toMatch(/^\/assets\/cad\/carrier\/.+\/model\.glb$/);
      expect(entry.assetChecksum).toMatch(/^[a-f0-9]{64}$/);
      expect(entry.sourceUrl).toMatch(/^https?:\/\//);
      expect(entry.assetDimensionsMm).toBeDefined();

      const assetPath = path.join(repoRoot, 'public', entry.assetPath!.replace(/^\//, '').replaceAll('/', path.sep));
      expect(fs.existsSync(assetPath), `${entry.designator} sem GLB local`).toBe(true);
      expect(fs.statSync(assetPath).size).toBeGreaterThan(1000);
    }
  });

  it('mantém pendência explícita quando não há correspondência física suficiente', () => {
    for (const entry of CARRIER_CAD_ASSET_MANIFEST.filter((item) => item.assetStatus === 'pending')) {
      expect(entry.pendingReason, `${entry.designator} sem motivo de pendência`).toBeTruthy();
      expect(entry.assetPath).toBeUndefined();
      expect(entry.assetDimensionsMm).toBeUndefined();
    }
  });

  it('mantém referências GLB locais separadas do status de verificação física', () => {
    for (const entry of CARRIER_CAD_ASSET_MANIFEST.filter((item) => item.referenceAssetPath)) {
      expect(entry.referenceAssetChecksum, `${entry.designator} sem checksum da referência`).toMatch(/^[a-f0-9]{64}$/);
      const referencePath = path.join(repoRoot, 'public', entry.referenceAssetPath!.replace(/^\//, '').replaceAll('/', path.sep));
      expect(fs.existsSync(referencePath), `${entry.designator} sem GLB de referência`).toBe(true);
      expect(fs.statSync(referencePath).size).toBeGreaterThan(1000);

      const metadataPath = path.join(repoRoot, 'public', 'assets', 'cad', 'carrier', entry.designator, 'asset.json');
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8')) as Record<string, unknown>;
      expect(metadata.referenceAssetPath).toBe(entry.referenceAssetPath);
      expect(metadata.referenceAssetChecksum).toBe(entry.referenceAssetChecksum);
    }
    expect(getCarrierAssetEntry('esp32_s3_devkit')?.assetStatus).toBe('pending');
    expect(getCarrierAssetEntry('esp32_s3_devkit')?.assetPath).toBeUndefined();
  });

  it('confirma o GLB derivado do Eagle oficial do RFID1 com envelope rastreável', () => {
    const entry = getCarrierAssetEntry('pn532_breakout');
    expect(entry?.referenceAssetPath).toBe('/assets/cad/carrier/RFID1/reference-derived.glb');
    expect(entry?.referenceAssetDimensionsMm).toEqual({ width: 120, height: 5.3, depth: 50 });
    const referencePath = path.join(repoRoot, 'public', entry!.referenceAssetPath!.replace(/^\//, '').replaceAll('/', path.sep));
    const checksum = createHash('sha256').update(fs.readFileSync(referencePath)).digest('hex');
    expect(checksum).toBe(entry?.referenceAssetChecksum);
  });

  it('confirma o envelope medido e o checksum do GLB de referência do U1', () => {
    const entry = getCarrierAssetEntry('esp32_s3_devkit');
    expect(entry?.assetSourceType).toBe('derived');
    expect(entry?.referenceAssetDimensionsMm).toEqual({ width: 25.5, height: 10.82, depth: 71.25 });
    const referencePath = path.join(repoRoot, 'public', entry!.referenceAssetPath!.replace(/^\//, '').replaceAll('/', path.sep));
    const checksum = createHash('sha256').update(fs.readFileSync(referencePath)).digest('hex');
    expect(checksum).toBe(entry?.referenceAssetChecksum);
  });

  it('aceita as dimensões dos GLBs verificados dentro da tolerância registrada', () => {
    for (const entry of CARRIER_CAD_ASSET_MANIFEST.filter((item) => item.assetStatus === 'verified')) {
      expect(dimensionsWithinTolerance(entry.assetDimensionsMm!, entry.assetDimensionsMm!, entry.toleranceMm)).toBe(true);
    }
  });

  it('mantém U2 e o divisor R1/R2 como referências verificadas do catálogo', () => {
    expect(FUELGUARD_CAD_LIBRARY.sn74ahct125n.assetStatus).toBe('verified');
    expect(FUELGUARD_CAD_LIBRARY.sn74ahct125n.assetPath).toBe('/assets/cad/carrier/U2/model.glb');
    expect(FUELGUARD_CAD_LIBRARY.voltage_divider.assetStatus).toBe('verified');
    expect(FUELGUARD_CAD_LIBRARY.voltage_divider.assetPath).toBe('/assets/cad/carrier/R_DIV/model.glb');
    expect(FUELGUARD_CAD_LIBRARY.voltage_divider.name).toContain('10 kΩ / 15 kΩ');
  });

  it('oferece referência de compra sem inventar preço para itens sem cotação', () => {
    expect(PURCHASE_CATALOG.SN74AHCT125N.buyUrl).toContain('SN74AHCT125N');
    expect(PURCHASE_CATALOG['CFR-25JB-52-10K'].priceStatus).toBe('consult');
    expect(PURCHASE_CATALOG['CFR-25JB-52-15K'].priceStatus).toBe('consult');
    expect(PURCHASE_CATALOG['FG-TANK-5L-CYL-R1'].buyUrl).toBeNull();
  });

  it('mantém o cabo de compra alinhado ao designator e ao conector documentado do U1', () => {
    const cable = PURCHASE_CATALOG['CABLE-USBC-MICROUSB-1M'];
    const entry = CARRIER_CAD_ASSET_MANIFEST.find((item) => item.designator === 'CBL_USB');

    expect(entry?.partNumber).toBe('USB-C macho para Micro-USB, dados, 1 m');
    expect(FUELGUARD_CAD_LIBRARY.usb_cable_assembly.designatorPrefix).toBe('CBL_USB');
    expect(cable.buyUrl).toContain('cabo-usb-c-micro-usb');
    expect(cable.note).toContain('dados');
  });

  it('mantém imagens de fornecedores rastreáveis para os módulos comerciais com foto disponível', () => {
    for (const mpn of ['ESP32-S3-DevKitC-1-N8R8', 'SEN0311', 'PN532-BREAKOUT-V1.6']) {
      const reference = PURCHASE_CATALOG[mpn];
      expect(reference.imageUrl).toBeTruthy();
      expect(reference.imageSourceUrl).toMatch(/^https?:\/\//);
      expect(reference.buyUrl).toMatch(/^https?:\/\//);
      expect(reference.imageChecksum).toMatch(/^[a-f0-9]{64}$/);
      const localImage = path.join(repoRoot, 'public', reference.imageUrl!.replace(/^\//, '').replaceAll('/', path.sep));
      expect(fs.existsSync(localImage), `${mpn} sem foto local`).toBe(true);
      expect(fs.statSync(localImage).size).toBeGreaterThan(1000);
    }
  });

  it('identifica a prévia local do CAD sem apresentá-la como foto comercial', () => {
    for (const mpn of ['SN74AHCT125N', 'CFR-25JB-52-10K', 'WP7113GD', 'CMI-1295IC-0385T']) {
      const reference = PURCHASE_CATALOG[mpn];
      expect(reference.imageKind).toBe('technical_cad');
      expect(reference.imageUrl).toMatch(/^\/assets\/cad\/carrier\//);
      expect(reference.imageSourceUrl).toContain('kicad-packages3D');
    }
  });

  it('oferece uma imagem local para cada referência exibida no catálogo de compra', () => {
    for (const [mpn, reference] of Object.entries(PURCHASE_CATALOG)) {
      expect(reference.imageUrl, `${mpn} sem imagem`).toBeTruthy();
      expect(reference.imageKind, `${mpn} sem tipo de imagem`).toBeTruthy();
      const localImage = path.join(repoRoot, 'public', reference.imageUrl!.replace(/^\//, '').replaceAll('/', path.sep));
      expect(fs.existsSync(localImage), `${mpn} sem arquivo local`).toBe(true);
    }
  });

  it('não tenta buscar rede para um componente pendente e mantém fallback', async () => {
    expect(await loadCarrierAsset('esp32_s3_devkit')).toBeNull();
    expect(getCarrierAssetEntry('esp32_s3_devkit')?.assetStatus).toBe('pending');
  });
});
