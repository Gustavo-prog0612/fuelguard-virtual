/**
 * FuelGuard Virtual Test Bench — Exportador e Importador de Dossiês JSON (schema_version: 1)
 * Garante portabilidade offline, auditoria didática e restauração fiel de projetos e ensaios.
 */

import { SCHEMA_VERSION, BaseEvent } from '@/core/bus/event-contracts';
import { BenchProject, CalibrationProfile, TelemetrySession } from './idb-storage';

export interface FuelGuardExportPackage {
  schema_version: 1;
  app: 'FuelGuard Virtual Test Bench';
  version: string;
  exported_at: string;
  summary: {
    total_events: number;
    total_logs: number;
    sim_time_ms: number;
  };
  project?: BenchProject;
  calibration?: CalibrationProfile;
  session?: TelemetrySession;
  events?: BaseEvent<any, any>[];
  uart_logs?: Array<{ time: string; level: string; msg: string }>;
}

export function createExportPackage(data: {
  project?: BenchProject;
  calibration?: CalibrationProfile;
  session?: TelemetrySession;
  events?: BaseEvent<any, any>[];
  uartLogs?: Array<{ time: string; level: string; msg: string }>;
  simTimeMs?: number;
}): FuelGuardExportPackage {
  const events = data.events || data.session?.events || [];
  const logs = data.uartLogs || data.session?.uartLogs || [];
  const simTimeMs = data.simTimeMs ?? data.session?.durationMs ?? 0;

  return {
    schema_version: SCHEMA_VERSION,
    app: 'FuelGuard Virtual Test Bench',
    version: '0.1.0',
    exported_at: new Date().toISOString(),
    summary: {
      total_events: events.length,
      total_logs: logs.length,
      sim_time_ms: simTimeMs,
    },
    project: data.project,
    calibration: data.calibration,
    session: data.session,
    events,
    uart_logs: logs,
  };
}

export function downloadExportPackage(pkg: FuelGuardExportPackage, filename?: string): void {
  const jsonStr = JSON.stringify(pkg, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `fuelguard_export_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseAndValidatePackage(jsonStr: string): FuelGuardExportPackage {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err: any) {
    throw new Error(`Arquivo JSON corrompido ou inválido: ${err.message}`);
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Conteúdo do arquivo não é um objeto JSON válido.');
  }

  if (parsed.schema_version !== 1) {
    throw new Error(
      `Incompatibilidade de esquema: versão recebida=${parsed.schema_version}, esperada=${SCHEMA_VERSION}`
    );
  }

  if (!parsed.app || !parsed.app.includes('FuelGuard')) {
    throw new Error('Arquivo não reconhecido como um pacote de dados do FuelGuard.');
  }

  return parsed as FuelGuardExportPackage;
}
