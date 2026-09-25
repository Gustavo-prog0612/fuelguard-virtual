/**
 * FuelGuard Virtual Test Bench — Tipos de Mensagens do Web Worker
 */

import { CanonicalEvent } from '../bus/event-contracts';
import { McuTelemetrySnapshot } from '../firmware-logic/mcu-state-machine';

export type WorkerInMessage =
  | { type: 'INIT'; payload?: { seed?: number } }
  | { type: 'START' }
  | { type: 'STOP' }
  | { type: 'STEP' }
  | { type: 'RESET' }
  | { type: 'SET_SPEED'; payload: { speed: number } }
  | { type: 'LOAD_SCENARIO'; payload: { scenarioId: string } }
  | { type: 'SET_WATER_HEIGHT'; payload: { heightCm: number } }
  | { type: 'SET_TEMP'; payload: { tempC: number } }
  | { type: 'SET_SEED'; payload: { seed: number } }
  | { type: 'TRIGGER_SLOSH'; payload?: { amplitudeCm?: number } }
  | { type: 'TOGGLE_LID' }
  | { type: 'PRESENT_NFC'; payload: { uid: string } }
  | { type: 'REMOVE_NFC' }
  | { type: 'TOGGLE_TRANSPORT' }
  | { type: 'SET_FAULT'; payload: { faultId: string; active: boolean } };

export interface WorkerOutSnapshot {
  snapshot: McuTelemetrySnapshot;
  simTimeMs: number;
  isRunning: boolean;
  isOnline: boolean;
  speed: number;
  seed: number;
  newEvents: CanonicalEvent[];
  activeScenarioId: string;
}

export type WorkerOutMessage =
  | { type: 'TICK_BATCH'; payload: WorkerOutSnapshot }
  | { type: 'READY' }
  | { type: 'ERROR'; payload: { message: string } };
