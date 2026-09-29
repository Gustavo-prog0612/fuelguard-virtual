import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { getRegisteredModel, MODEL_REGISTRY, RUNTIME_MODEL_REGISTRY } from '@/circuit-cad/model-registry';

describe('Registro runtime de modelos 3D', () => {
  it('mantém a origem oficial e as dimensões convertidas do PN532', () => {
    const pn532 = getRegisteredModel('pn532-elechouse-v4');
    expect(pn532?.validation).toBe('exact_verified');
    expect(pn532?.path).toBe('/models/official/elechouse-pn532-v4.glb');
    expect(pn532?.sourceStep).toContain('.step');
    expect(pn532?.sourceUrl).toContain('elechouse.com');
    expect(pn532?.dimensionsMm?.width).toBeCloseTo(42.68, 1);
  });

  it('expõe o ESP32 detalhado como referência rastreada de runtime', () => {
    expect(MODEL_REGISTRY.length).toBeGreaterThanOrEqual(5);
    expect(RUNTIME_MODEL_REGISTRY.map((asset) => asset.id)).toEqual([
      'pn532-elechouse-v4',
      'esp32-s3-devkitc-1-v1-1',
      'sen0311-a02yyuw',
      'mc-38-reed-switch',
      'mb102-830',
      'led-kingbright-wp7113gd',
      'buzzer-samesky-cmi-1295ic-0385t',
    ]);
    expect(getRegisteredModel('sen0311-a02yyuw')?.validation).toBe('documented_reference');
    expect(getRegisteredModel('fg-tank-5l-cyl-r1')?.confidence).toBe('C');
    expect(getRegisteredModel('esp32-s3-devkitc-1-v1-1')?.format).toBe('glb');
    expect(getRegisteredModel('esp32-s3-devkitc-1-v1-1')?.path).toContain('espressif-esp32-s3-devkitc-1-v1.1.glb');
    expect(getRegisteredModel('esp32-s3-devkitc-1-v1-1')?.confidence).toBe('B');
    expect(getRegisteredModel('esp32-s3-devkitc-1-v1-1')?.validation).toBe('documented_reference');
    expect(getRegisteredModel('sen0311-a02yyuw')?.path).toContain('dfrobot-sen0311-a02yyuw-reference.glb');
    expect(getRegisteredModel('sen0311-a02yyuw')?.dimensionsMm?.width).toBeCloseTo(84.6, 1);
    expect(getRegisteredModel('mc-38-reed-switch')?.path).toContain('mc-38-reed-switch-magnet-reference.glb');
    expect(getRegisteredModel('mc-38-reed-switch')?.confidence).toBe('C');
    expect(getRegisteredModel('mb102-830')?.format).toBe('glb');
    expect(getRegisteredModel('led-kingbright-wp7113gd')?.path).toContain('kingbright-wp7113gd-reference.glb');
    expect(getRegisteredModel('buzzer-samesky-cmi-1295ic-0385t')?.path).toContain('samesky-cmi-1295ic-0385t-reference.glb');
  });

  it('mantém o GLB detalhado do ESP32 presente e com provenance coerente', () => {
    const esp32 = getRegisteredModel('esp32-s3-devkitc-1-v1-1');
    const glbPath = path.resolve(process.cwd(), 'public/models/official/espressif-esp32-s3-devkitc-1-v1.1.glb');

    expect(esp32?.notes).toMatch(/Micro-USB/i);
    expect(fs.existsSync(glbPath)).toBe(true);
    expect(fs.statSync(glbPath).size).toBeGreaterThan(100_000);
  });

  it('mantém os GLBs de referência dos componentes auxiliares presentes', () => {
    for (const id of ['mb102-830', 'led-kingbright-wp7113gd', 'buzzer-samesky-cmi-1295ic-0385t', 'sen0311-a02yyuw', 'mc-38-reed-switch']) {
      const asset = getRegisteredModel(id);
      expect(asset?.path).toBeDefined();
      const relativePath = asset!.path!.replace(/^\//, '');
      const assetPath = path.resolve(process.cwd(), 'public', relativePath);
      expect(fs.existsSync(assetPath)).toBe(true);
      expect(fs.statSync(assetPath).size).toBeGreaterThan(10_000);
    }
  });
});
