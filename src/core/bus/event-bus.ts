/**
 * FuelGuard Virtual Test Bench — Barramento Monotônico de Eventos
 * Garante ordenação sequencial estrita, buffer circular e fila offline-first rastreável.
 */

import { CanonicalEvent, EventKind, EventOrigin, SCHEMA_VERSION } from './event-contracts';

export type EventListener = (event: CanonicalEvent) => void;

export class MonotonicEventBus {
  public static readonly DEFAULT_BUFFER_SIZE = 1000;

  private currentSeq: number = 0;
  private subscribers: Map<string, Set<EventListener>> = new Map();
  private allSubscribers: Set<EventListener> = new Set();
  private circularBuffer: CanonicalEvent[] = [];
  private maxBufferSize: number;

  // Fila de transporte offline (quando sem rede)
  private offlineQueue: CanonicalEvent[] = [];
  private isTransportOnline: boolean = true;

  constructor(maxBufferSize: number = MonotonicEventBus.DEFAULT_BUFFER_SIZE) {
    this.maxBufferSize = maxBufferSize;
  }

  public getNextSeq(): number {
    this.currentSeq += 1;
    return this.currentSeq;
  }

  public getCurrentSeq(): number {
    return this.currentSeq;
  }

  public reset(): void {
    this.currentSeq = 0;
    this.circularBuffer = [];
    this.offlineQueue = [];
  }

  public setTransportOnline(online: boolean): CanonicalEvent[] {
    const wasOffline = !this.isTransportOnline;
    this.isTransportOnline = online;

    // Se acabou de reconectar, descarrega a fila offline
    if (wasOffline && online && this.offlineQueue.length > 0) {
      const flushed = [...this.offlineQueue];
      this.offlineQueue = [];
      return flushed;
    }
    return [];
  }

  public isOnline(): boolean {
    return this.isTransportOnline;
  }

  public getOfflineQueueCount(): number {
    return this.offlineQueue.length;
  }

  public getOfflineQueue(): CanonicalEvent[] {
    return [...this.offlineQueue];
  }

  /**
   * Publica um evento canônico no barramento com garantia de sequência monotônica.
   */
  public emit<K extends EventKind>(
    kind: K,
    simTimeMs: number,
    origin: EventOrigin,
    payload: any
  ): CanonicalEvent {
    const event: CanonicalEvent = {
      schema_version: SCHEMA_VERSION,
      seq: this.getNextSeq(),
      sim_time_ms: Math.round(simTimeMs),
      kind,
      origin,
      payload,
    } as CanonicalEvent;

    // Insere no buffer circular
    if (this.circularBuffer.length >= this.maxBufferSize) {
      this.circularBuffer.shift();
    }
    this.circularBuffer.push(event);

    // Se estiver offline e o evento for de telemetria/negócio, armazena na fila offline
    if (!this.isTransportOnline && kind !== 'clock.tick') {
      this.offlineQueue.push(event);
    }

    // Notifica assinantes específicos do tipo
    const typeSubs = this.subscribers.get(kind);
    if (typeSubs) {
      typeSubs.forEach((sub) => sub(event));
    }

    // Notifica ouvintes globais
    this.allSubscribers.forEach((sub) => sub(event));

    return event;
  }

  public subscribe(kind: EventKind, listener: EventListener): () => void {
    if (!this.subscribers.has(kind)) {
      this.subscribers.set(kind, new Set());
    }
    this.subscribers.get(kind)!.add(listener);

    return () => {
      this.subscribers.get(kind)?.delete(listener);
    };
  }

  public subscribeAll(listener: EventListener): () => void {
    this.allSubscribers.add(listener);
    return () => {
      this.allSubscribers.delete(listener);
    };
  }

  public getRecentEvents(count: number = 50): CanonicalEvent[] {
    return this.circularBuffer.slice(-count);
  }

  public exportLogJson(): string {
    return JSON.stringify(
      {
        exported_at: new Date().toISOString(),
        schema_version: SCHEMA_VERSION,
        total_events: this.circularBuffer.length,
        last_sequence: this.currentSeq,
        events: this.circularBuffer,
      },
      null,
      2
    );
  }
}
