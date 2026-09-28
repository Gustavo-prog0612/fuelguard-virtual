import { describe, it, expect } from 'vitest';
import esp32Manifest from '@/../fuelguard/assets/components/esp32-s3-devkitc-1/asset-manifest.json';
import pn532Manifest from '@/../fuelguard/assets/components/pn532-v4/asset-manifest.json';
import jsnManifest from '@/../fuelguard/assets/components/jsn-sr04t-v2/asset-manifest.json';
import sn74Manifest from '@/../fuelguard/assets/components/sn74ahct125n/asset-manifest.json';
import rDivManifest from '@/../fuelguard/assets/components/voltage-divider/asset-manifest.json';
import reedManifest from '@/../fuelguard/assets/components/reed-switch/asset-manifest.json';
import buzzerManifest from '@/../fuelguard/assets/components/buzzer/asset-manifest.json';
import ledManifest from '@/../fuelguard/assets/components/led-indicator/asset-manifest.json';
import bbManifest from '@/../fuelguard/assets/mechanical/breadboard/asset-manifest.json';
import tankManifest from '@/../fuelguard/assets/mechanical/tank/asset-manifest.json';

const ALL_MANIFESTS = [
  esp32Manifest,
  pn532Manifest,
  jsnManifest,
  sn74Manifest,
  rDivManifest,
  reedManifest,
  buzzerManifest,
  ledManifest,
  bbManifest,
  tankManifest,
];

describe('Auditoria de Assets CAD 3D — Rastreabilidade e Classes de Fidelidade', () => {
  it('deve conter todos os campos obrigatórios em cada asset-manifest.json', () => {
    ALL_MANIFESTS.forEach((m) => {
      expect(m.reference).toBeDefined();
      expect(m.name).toBeDefined();
      expect(m.manufacturer).toBeDefined();
      expect(m.model).toBeDefined();
      expect(m.revision).toBeDefined();
      expect(m.sourceUrl).toBeDefined();
      expect(m.license).toBeDefined();
      expect(m.format).toBeDefined();
      expect(m.sourceUnit).toBe('mm');
      expect(m.scale).toEqual([1.0, 1.0, 1.0]);
      expect(m.transforms).toBeDefined();
      expect(m.fidelityClass).toMatch(/^[ABCD]$/);
      expect(m.verificationDate).toBeDefined();
    });
  });

  it('deve certificar que componentes Classe A possuem modelo oficial verificado', () => {
    const classA = ALL_MANIFESTS.filter((m) => m.fidelityClass === 'A');
    expect(classA.length).toBeGreaterThanOrEqual(4); // ESP32, Divisor, Buzzer, LED

    classA.forEach((m) => {
      expect(m.confidenceRationale.toLowerCase()).toMatch(/oficia/);
    });
  });

  it('deve exigir notas de isenção ou medições pendentes para componentes Classe C e D', () => {
    const classCAndD = ALL_MANIFESTS.filter((m) => m.fidelityClass === 'C' || m.fidelityClass === 'D');
    expect(classCAndD.length).toBeGreaterThanOrEqual(2); // JSN e Tanque

    classCAndD.forEach((m) => {
      // Nunca deve prometer precisão idêntica ao real sem modelo oficial
      expect(m.confidenceRationale.toLowerCase()).not.toContain('idêntico ao real');
      expect((m as any).disclaimerNote).toBeDefined();
    });
  });

  it('deve conter dimensões em milímetros coerentes com tolerâncias de encapsulamento', () => {
    ALL_MANIFESTS.forEach((m) => {
      const dim = (m as any).dimensionsMm;
      expect(dim).toBeDefined();
      if (dim.width) expect(dim.width).toBeGreaterThan(0);
      if (dim.height) expect(dim.height).toBeGreaterThan(0);
      if (dim.depth) expect(dim.depth).toBeGreaterThan(0);
    });
  });
});
