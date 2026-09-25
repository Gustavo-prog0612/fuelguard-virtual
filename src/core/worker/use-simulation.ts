/**
 * FuelGuard Virtual Test Bench — Hook React para Simulação Determinística
 * Conecta qualquer componente ao Web Worker / Bridge em 60 FPS com reatividade total.
 */

import { useState, useEffect, useCallback } from 'react';
import { globalSimulationBridge } from './worker-bridge';
import { WorkerOutSnapshot } from './worker-messages';
import { CanonicalEvent } from '../bus/event-contracts';
import { McuTelemetrySnapshot } from '../firmware-logic/mcu-state-machine';

export function useSimulation() {
  const [snapshotData, setSnapshotData] = useState<WorkerOutSnapshot | null>(null);
  const [events, setEvents] = useState<CanonicalEvent[]>(() => globalSimulationBridge.getEvents());
  const [uartLogs, setUartLogs] = useState<{ time: string; level: string; msg: string }[]>(() => globalSimulationBridge.getUartLogs());

  useEffect(() => {
    // Sincroniza estado inicial acumulado
    setEvents(globalSimulationBridge.getEvents());
    setUartLogs(globalSimulationBridge.getUartLogs());

    const unsubscribe = globalSimulationBridge.subscribe((data) => {
      setSnapshotData(data);
      if (data.newEvents.length > 0) {
        setEvents(globalSimulationBridge.getEvents());
        setUartLogs(globalSimulationBridge.getUartLogs());
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const formatTime = (simTimeMs: number): string => {
    const totalSeconds = Math.floor(simTimeMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isRunning = snapshotData?.isRunning ?? false;
  const isOnline = snapshotData?.isOnline ?? true;
  const speed = snapshotData?.speed ?? 1.0;
  const seed = snapshotData?.seed ?? 42;
  const simTimeMs = snapshotData?.simTimeMs ?? 0;
  const activeScenarioId = snapshotData?.activeScenarioId ?? 'nominal';

  const snapshot: McuTelemetrySnapshot = snapshotData?.snapshot ?? {
    state: 'IDLE',
    simTimeMs: 0,
    rawDistanceCm: 42.3,
    filteredDistanceCm: 42.3,
    waterHeightCm: 57.7,
    volumeL: 577,
    percentage: 57.7,
    isLidClosed: true,
    isNfcSessionActive: false,
    ledActive: true,
    inBlindZone: false,
    echoValid: true,
    temperatureC: 24.8,
    soundSpeedMps: 346.0,
  };

  const start = useCallback(() => globalSimulationBridge.send({ type: 'START' }), []);
  const stop = useCallback(() => globalSimulationBridge.send({ type: 'STOP' }), []);
  const togglePlay = useCallback(() => {
    if (isRunning) stop();
    else start();
  }, [isRunning, start, stop]);
  const step = useCallback(() => globalSimulationBridge.send({ type: 'STEP' }), []);
  const reset = useCallback(() => globalSimulationBridge.send({ type: 'RESET' }), []);
  const setSpeed = useCallback((s: number) => globalSimulationBridge.send({ type: 'SET_SPEED', payload: { speed: s } }), []);
  const loadScenario = useCallback((id: string) => globalSimulationBridge.send({ type: 'LOAD_SCENARIO', payload: { scenarioId: id } }), []);
  const setWaterHeight = useCallback((h: number) => globalSimulationBridge.send({ type: 'SET_WATER_HEIGHT', payload: { heightCm: h } }), []);
  const setAmbientTemp = useCallback((t: number) => globalSimulationBridge.send({ type: 'SET_TEMP', payload: { tempC: t } }), []);
  const setSeed = useCallback((s: number) => globalSimulationBridge.send({ type: 'SET_SEED', payload: { seed: s } }), []);
  const triggerSlosh = useCallback((amp?: number) => globalSimulationBridge.send({ type: 'TRIGGER_SLOSH', payload: { amplitudeCm: amp } }), []);
  const toggleLid = useCallback(() => globalSimulationBridge.send({ type: 'TOGGLE_LID' }), []);
  const presentNfc = useCallback((uid: string) => globalSimulationBridge.send({ type: 'PRESENT_NFC', payload: { uid } }), []);
  const removeNfc = useCallback(() => globalSimulationBridge.send({ type: 'REMOVE_NFC' }), []);
  const toggleTransport = useCallback(() => globalSimulationBridge.send({ type: 'TOGGLE_TRANSPORT' }), []);
  const setFault = useCallback((faultId: string, active: boolean) => globalSimulationBridge.send({ type: 'SET_FAULT', payload: { faultId, active } }), []);

  return {
    snapshot,
    simTimeMs,
    simTimeFormatted: formatTime(simTimeMs),
    isRunning,
    isOnline,
    speed,
    seed,
    activeScenarioId,
    events,
    uartLogs,
    start,
    stop,
    togglePlay,
    step,
    reset,
    setSpeed,
    loadScenario,
    setWaterHeight,
    setAmbientTemp,
    setSeed,
    triggerSlosh,
    toggleLid,
    presentNfc,
    removeNfc,
    toggleTransport,
    setFault,
  };
}
