/**
 * FuelGuard Virtual Test Bench — Driver de Persistência Local IndexedDB (Offline-First)
 * Permite salvar configurações de bancada, tabelas empíricas de calibração e sessões de telemetria
 * sem dependência de nuvem ou servidor externo.
 */

import { openDB, IDBPDatabase } from 'idb';
import { CircuitConnection } from '@/electrical/circuit-validator';
import { BaseEvent } from '@/core/bus/event-contracts';

export const DB_NAME = 'fuelguard_bench_db';
export const DB_VERSION = 1;

export interface BenchProject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  wiring: CircuitConnection[];
  tankConfig: {
    hrefCm: number;
    baseWidthCm: number;
    baseLengthCm: number;
    initialWaterHeightCm: number;
    ambientTempC: number;
  };
}

export interface CalibrationPoint {
  waterHeightCm: number;
  volumeLiters: number;
}

export interface CalibrationProfile {
  id: string;
  name: string;
  description: string;
  points: CalibrationPoint[];
  method: 'prismatic' | 'pchip' | 'linear';
  createdAt: string;
}

export interface TelemetrySession {
  id: string;
  title: string;
  startTime: string;
  durationMs: number;
  totalEvents: number;
  events: BaseEvent<any, any>[];
  uartLogs: Array<{ time: string; level: string; msg: string }>;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('calibrations')) {
          db.createObjectStore('calibrations', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('telemetry_sessions')) {
          db.createObjectStore('telemetry_sessions', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export const idbStorage = {
  // Projetos de Bancada
  async saveProject(project: BenchProject): Promise<void> {
    const db = await getDb();
    await db.put('projects', project);
  },

  async getProject(id: string): Promise<BenchProject | undefined> {
    const db = await getDb();
    return db.get('projects', id);
  },

  async listProjects(): Promise<BenchProject[]> {
    const db = await getDb();
    return db.getAll('projects');
  },

  async deleteProject(id: string): Promise<void> {
    const db = await getDb();
    await db.delete('projects', id);
  },

  // Perfis de Calibração Volumétrica
  async saveCalibration(profile: CalibrationProfile): Promise<void> {
    const db = await getDb();
    await db.put('calibrations', profile);
  },

  async getCalibration(id: string): Promise<CalibrationProfile | undefined> {
    const db = await getDb();
    return db.get('calibrations', id);
  },

  async listCalibrations(): Promise<CalibrationProfile[]> {
    const db = await getDb();
    return db.getAll('calibrations');
  },

  // Sessões de Telemetria Gravadas
  async saveSession(session: TelemetrySession): Promise<void> {
    const db = await getDb();
    await db.put('telemetry_sessions', session);
  },

  async getSession(id: string): Promise<TelemetrySession | undefined> {
    const db = await getDb();
    return db.get('telemetry_sessions', id);
  },

  async listSessions(): Promise<TelemetrySession[]> {
    const db = await getDb();
    return db.getAll('telemetry_sessions');
  },

  async deleteSession(id: string): Promise<void> {
    const db = await getDb();
    await db.delete('telemetry_sessions', id);
  },
};
