/**
 * FuelGuard Virtual Test Bench — Web Worker de Simulação
 * Executa o motor em thread de background sem bloquear a UI do navegador.
 */

import { SimulationEngine } from '../simulation-engine';
import { CanonicalEvent } from '../bus/event-contracts';
import { WorkerInMessage, WorkerOutMessage, WorkerOutSnapshot } from './worker-messages';

const engine = new SimulationEngine({ seed: 42 });
let intervalId: any = null;
let isRunning = false;
let speed = 1.0;
const queuedEvents: CanonicalEvent[] = [];

// Assina o barramento do motor para acumular eventos entre dispatches
engine.getEventBus().subscribeAll((event) => {
  queuedEvents.push(event);
});

function sendSnapshot(): void {
  const snapshot: WorkerOutSnapshot = {
    snapshot: engine.step(0), // obtém snapshot sem avançar tempo extra
    simTimeMs: engine.getSimTimeMs(),
    isRunning,
    isOnline: engine.getEventBus().isOnline(),
    speed,
    seed: engine.getSeed(),
    newEvents: queuedEvents.splice(0, queuedEvents.length),
    activeScenarioId: engine.getActiveScenarioId(),
  };

  self.postMessage({
    type: 'TICK_BATCH',
    payload: snapshot,
  } as WorkerOutMessage);
}

function startLoop(): void {
  if (intervalId !== null) return;
  isRunning = true;

  // Intervalo nominal de 20 ms ajustado pela velocidade
  const tickIntervalMs = Math.max(4, Math.round(20 / speed));

  intervalId = setInterval(() => {
    engine.step(20);
    sendSnapshot();
  }, tickIntervalMs);
}

function stopLoop(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  isRunning = false;
  sendSnapshot();
}

self.onmessage = (e: MessageEvent<WorkerInMessage>) => {
  const msg = e.data;

  switch (msg.type) {
    case 'INIT':
      if (msg.payload?.seed) engine.setSeed(msg.payload.seed);
      sendSnapshot();
      self.postMessage({ type: 'READY' } as WorkerOutMessage);
      break;

    case 'START':
      startLoop();
      break;

    case 'STOP':
      stopLoop();
      break;

    case 'STEP':
      engine.step(20);
      sendSnapshot();
      break;

    case 'RESET':
      stopLoop();
      engine.reset(0);
      sendSnapshot();
      break;

    case 'SET_SPEED':
      speed = msg.payload.speed;
      if (isRunning) {
        stopLoop();
        startLoop();
      }
      break;

    case 'LOAD_SCENARIO':
      engine.loadScenario(msg.payload.scenarioId);
      sendSnapshot();
      break;

    case 'SET_WATER_HEIGHT':
      engine.setWaterHeight(msg.payload.heightCm);
      sendSnapshot();
      break;

    case 'SET_TEMP':
      engine.setAmbientTemperature(msg.payload.tempC);
      sendSnapshot();
      break;

    case 'SET_SEED':
      engine.setSeed(msg.payload.seed);
      sendSnapshot();
      break;

    case 'TRIGGER_SLOSH':
      engine.triggerSloshImpulse(msg.payload?.amplitudeCm ?? 5.0);
      sendSnapshot();
      break;

    case 'TOGGLE_LID':
      engine.toggleLid();
      sendSnapshot();
      break;

    case 'PRESENT_NFC':
      engine.presentNfcTag(msg.payload.uid);
      sendSnapshot();
      break;

    case 'REMOVE_NFC':
      engine.removeNfcTag();
      sendSnapshot();
      break;

    case 'TOGGLE_TRANSPORT':
      engine.toggleTransportOnline();
      sendSnapshot();
      break;

    case 'SET_FAULT':
      engine.setFault(msg.payload.faultId, msg.payload.active);
      sendSnapshot();
      break;
  }
};
