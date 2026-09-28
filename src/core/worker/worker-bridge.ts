/**
 * FuelGuard Virtual Test Bench — Ponte de Comunicação UI <-> Worker
 * Suporta Web Worker real com fallback transparente para main thread (útil em testes Vitest).
 */

import { WorkerInMessage, WorkerOutMessage, WorkerOutSnapshot } from './worker-messages';
import { SimulationEngine } from '../simulation-engine';
import { CanonicalEvent, UartTxPayload } from '../bus/event-contracts';

export type SnapshotListener = (snapshot: WorkerOutSnapshot) => void;

export class SimulationBridge {
  private worker: Worker | null = null;
  private fallbackEngine: SimulationEngine | null = null;
  private fallbackInterval: any = null;
  private listeners: Set<SnapshotListener> = new Set();
  private latestSnapshot: WorkerOutSnapshot | null = null;
  private isFallbackRunning: boolean = false;
  private fallbackSpeed: number = 1.0;
  private fallbackQueuedEvents: CanonicalEvent[] = [];
  private historicalEvents: CanonicalEvent[] = [];
  private historicalUartLogs: { time: string; level: string; msg: string }[] = [];

  constructor() {
    this.init();
  }

  private init(): void {
    // Tenta instanciar Web Worker se estiver no navegador
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      try {
        this.worker = new Worker(
          new URL('./simulation.worker.ts', import.meta.url),
          { type: 'module' }
        );

        this.worker.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
          if (e.data.type === 'TICK_BATCH') {
            this.handleIncomingSnapshot(e.data.payload);
          }
        };

        this.send({ type: 'INIT' });
        return;
      } catch (err) {
        console.warn('[Bridge] Falha ao iniciar Web Worker nativo, operando em modo fallback na thread principal:', err);
      }
    }

    // Modo Fallback
    this.setupFallback();
  }

  private setupFallback(): void {
    this.fallbackEngine = new SimulationEngine({ seed: 42 });
    this.fallbackEngine.getEventBus().subscribeAll((event) => {
      this.fallbackQueuedEvents.push(event);
    });
    this.emitFallbackSnapshot();
  }

  private handleIncomingSnapshot(snap: WorkerOutSnapshot): void {
    this.latestSnapshot = snap;

    if (snap.newEvents && snap.newEvents.length > 0) {
      this.historicalEvents = [...this.historicalEvents, ...snap.newEvents].slice(-500);

      const newLogs = snap.newEvents
        .filter((e) => e.kind === 'uart.tx')
        .map((e) => {
          const p = e.payload as UartTxPayload;
          const s = Math.floor(e.sim_time_ms / 1000);
          const ms = (e.sim_time_ms % 1000).toString().padStart(3, '0');
          const mm = Math.floor(s / 60).toString().padStart(2, '0');
          const ss = (s % 60).toString().padStart(2, '0');
          return {
            time: `${mm}:${ss}.${ms}`,
            level: p.level,
            msg: p.message,
          };
        });

      if (newLogs.length > 0) {
        this.historicalUartLogs = [...this.historicalUartLogs, ...newLogs].slice(-500);
      }
    }

    this.notify(snap);
  }

  private emitFallbackSnapshot(): void {
    if (!this.fallbackEngine) return;
    const snap: WorkerOutSnapshot = {
      snapshot: this.fallbackEngine.step(0),
      simTimeMs: this.fallbackEngine.getSimTimeMs(),
      isRunning: this.isFallbackRunning,
      isOnline: this.fallbackEngine.getEventBus().isOnline(),
      speed: this.fallbackSpeed,
      seed: this.fallbackEngine.getSeed(),
      newEvents: this.fallbackQueuedEvents.splice(0, this.fallbackQueuedEvents.length),
      activeScenarioId: this.fallbackEngine.getActiveScenarioId(),
    };
    this.handleIncomingSnapshot(snap);
  }

  public getEvents(): CanonicalEvent[] {
    return this.historicalEvents;
  }

  public getUartLogs(): { time: string; level: string; msg: string }[] {
    return this.historicalUartLogs;
  }

  public clearHistory(): void {
    this.historicalEvents = [];
    this.historicalUartLogs = [];
  }

  public subscribe(listener: SnapshotListener): () => void {
    this.listeners.add(listener);
    if (this.latestSnapshot) listener(this.latestSnapshot);
    return () => this.listeners.delete(listener);
  }

  private notify(snapshot: WorkerOutSnapshot): void {
    this.listeners.forEach((l) => l(snapshot));
  }

  public send(msg: WorkerInMessage): void {
    if (this.worker) {
      this.worker.postMessage(msg);
      return;
    }

    // Processamento Fallback
    if (!this.fallbackEngine) return;
    switch (msg.type) {
      case 'START':
        if (this.fallbackInterval === null) {
          this.isFallbackRunning = true;
          this.fallbackInterval = setInterval(() => {
            this.fallbackEngine?.step(20);
            this.emitFallbackSnapshot();
          }, Math.max(4, Math.round(20 / this.fallbackSpeed)));
        }
        break;
      case 'STOP':
        if (this.fallbackInterval !== null) {
          clearInterval(this.fallbackInterval);
          this.fallbackInterval = null;
        }
        this.isFallbackRunning = false;
        this.emitFallbackSnapshot();
        break;
      case 'STEP':
        this.fallbackEngine.step(20);
        this.emitFallbackSnapshot();
        break;
      case 'RESET':
        if (this.fallbackInterval !== null) {
          clearInterval(this.fallbackInterval);
          this.fallbackInterval = null;
        }
        this.isFallbackRunning = false;
        this.fallbackEngine.reset(0);
        this.emitFallbackSnapshot();
        break;
      case 'SET_SPEED':
        this.fallbackSpeed = msg.payload.speed;
        if (this.isFallbackRunning) {
          this.send({ type: 'STOP' });
          this.send({ type: 'START' });
        }
        break;
      case 'LOAD_SCENARIO':
        this.fallbackEngine.loadScenario(msg.payload.scenarioId);
        this.emitFallbackSnapshot();
        break;
      case 'SET_WATER_HEIGHT':
        this.fallbackEngine.setWaterHeight(msg.payload.heightCm);
        this.emitFallbackSnapshot();
        break;
      case 'SET_TEMP':
        this.fallbackEngine.setAmbientTemperature(msg.payload.tempC);
        this.emitFallbackSnapshot();
        break;
      case 'SET_SEED':
        this.fallbackEngine.setSeed(msg.payload.seed);
        this.emitFallbackSnapshot();
        break;
      case 'TRIGGER_SLOSH':
        this.fallbackEngine.triggerSloshImpulse(msg.payload?.amplitudeCm ?? 5.0);
        this.emitFallbackSnapshot();
        break;
      case 'TOGGLE_LID':
        this.fallbackEngine.toggleLid();
        this.emitFallbackSnapshot();
        break;
      case 'PRESENT_NFC':
        this.fallbackEngine.presentNfcTag(msg.payload.uid);
        this.emitFallbackSnapshot();
        break;
      case 'REMOVE_NFC':
        this.fallbackEngine.removeNfcTag();
        this.emitFallbackSnapshot();
        break;
      case 'TOGGLE_TRANSPORT':
        this.fallbackEngine.toggleTransportOnline();
        this.emitFallbackSnapshot();
        break;
      case 'SET_FAULT':
        this.fallbackEngine.setFault(msg.payload.faultId, msg.payload.active);
        this.emitFallbackSnapshot();
        break;
    }
  }

  public destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    if (this.fallbackInterval !== null) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
  }
}

// Instância singleton global para toda a aplicação React
export const globalSimulationBridge = new SimulationBridge();

if (typeof window !== 'undefined') {
  (window as any).__fuelguard_bridge = globalSimulationBridge;
}
