import { describe, it, expect } from 'vitest';
import {
  createExportPackage,
  parseAndValidatePackage,
} from '@/persistence/json-exporter';

describe('FuelGuard JSON Exporter & Parser (schema_version: 1)', () => {
  it('cria pacote de exportação válido com schema_version = 1 e sumário correto', () => {
    const pkg = createExportPackage({
      simTimeMs: 5000,
      events: [
        {
          schema_version: 1,
          seq: 1,
          sim_time_ms: 100,
          kind: 'clock.tick',
          origin: 'system',
          payload: { delta_ms: 20, total_seconds: 0.1 },
        },
      ],
      uartLogs: [
        { time: '00:00.100', level: 'INFO', msg: 'ESP32 pronto' },
      ],
    });

    expect(pkg.schema_version).toBe(1);
    expect(pkg.app).toBe('FuelGuard Virtual Test Bench');
    expect(pkg.summary.total_events).toBe(1);
    expect(pkg.summary.total_logs).toBe(1);
    expect(pkg.summary.sim_time_ms).toBe(5000);
    expect(pkg.events).toHaveLength(1);
    expect(pkg.uart_logs).toHaveLength(1);
  });

  it('valida com sucesso um JSON canônico compatível', () => {
    const validJson = JSON.stringify({
      schema_version: 1,
      app: 'FuelGuard Virtual Test Bench',
      version: '0.1.0',
      exported_at: '2026-09-25T12:00:00Z',
      summary: { total_events: 0, total_logs: 0, sim_time_ms: 0 },
      events: [],
      uart_logs: [],
    });

    const parsed = parseAndValidatePackage(validJson);
    expect(parsed.schema_version).toBe(1);
    expect(parsed.app).toContain('FuelGuard');
  });

  it('rejeita arquivo com schema_version incompatível', () => {
    const invalidSchemaJson = JSON.stringify({
      schema_version: 2,
      app: 'FuelGuard Virtual Test Bench',
    });

    expect(() => parseAndValidatePackage(invalidSchemaJson)).toThrow(
      /Incompatibilidade de esquema/
    );
  });

  it('rejeita arquivo corrompido ou mal formatado', () => {
    const corruptedJson = '{ schema_version: 1, app: incomplete...';
    expect(() => parseAndValidatePackage(corruptedJson)).toThrow(
      /Arquivo JSON corrompido/
    );
  });

  it('rejeita JSON de outro aplicativo que não o FuelGuard', () => {
    const thirdPartyJson = JSON.stringify({
      schema_version: 1,
      app: 'Generic Dashboard App',
    });

    expect(() => parseAndValidatePackage(thirdPartyJson)).toThrow(
      /não reconhecido como um pacote de dados do FuelGuard/
    );
  });
});
