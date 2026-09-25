/**
 * FuelGuard Virtual Test Bench — Contratos de Eventos Canônicos (schema_version: 1)
 * Estruturas imutáveis e versionadas para registro monotônico e telemetria.
 */

export const SCHEMA_VERSION = 1;

export type EventKind =
  | 'clock.tick'
  | 'clock.state_changed'
  | 'tank.level_update'
  | 'acoustic.ping_result'
  | 'nfc.tag_read'
  | 'nfc.denied'
  | 'lid.state_change'
  | 'lid.bounce'
  | 'circuit.fault_injected'
  | 'circuit.fault_cleared'
  | 'transport.status'
  | 'firmware.state_change'
  | 'firmware.alert'
  | 'uart.rx'
  | 'uart.tx';

export type EventOrigin = 'firmware' | 'hardware_model' | 'fault_injector' | 'user' | 'system';

export interface BaseEvent<TKind extends EventKind, TPayload> {
  schema_version: 1;
  seq: number;
  sim_time_ms: number;
  kind: TKind;
  origin: EventOrigin;
  payload: TPayload;
}

// Payloads tipados
export interface ClockTickPayload {
  delta_ms: number;
  total_seconds: number;
}

export interface TankLevelPayload {
  raw_distance_cm: number;
  filtered_distance_cm: number;
  water_height_cm: number;
  volume_liters: number;
  percentage: number;
  in_blind_zone: boolean;
  echo_valid: boolean;
  temperature_c: number;
  sound_speed_mps: number;
}

export interface AcousticPingPayload {
  echo_time_us: number;
  measured_cm: number;
  quality: number;
  attenuation_db: number;
}

export interface NfcTagPayload {
  uid: string;
  card_type: string;
  authorized: boolean;
  operator_name?: string;
}

export interface LidStatePayload {
  is_open: boolean;
  raw_pin_state: number;
  debounce_active: boolean;
  bounces_count: number;
}

export interface CircuitFaultPayload {
  fault_id: string;
  name: string;
  description: string;
  safety_violation: boolean;
  target_pin: string;
}

export interface TransportStatusPayload {
  is_online: boolean;
  offline_buffer_count: number;
  last_flushed_seq?: number;
}

export interface FirmwareStatePayload {
  previous_state: string;
  new_state: string;
  reason: string;
}

export interface UartTxPayload {
  channel: 'UART0';
  baud: 115200;
  message: string;
  level: 'INFO' | 'WARN' | 'DEBUG' | 'ERROR' | 'SYSTEM';
}

// União de todos os eventos
export type CanonicalEvent =
  | BaseEvent<'clock.tick', ClockTickPayload>
  | BaseEvent<'tank.level_update', TankLevelPayload>
  | BaseEvent<'acoustic.ping_result', AcousticPingPayload>
  | BaseEvent<'nfc.tag_read', NfcTagPayload>
  | BaseEvent<'nfc.denied', NfcTagPayload>
  | BaseEvent<'lid.state_change', LidStatePayload>
  | BaseEvent<'lid.bounce', { bounce_number: number }>
  | BaseEvent<'circuit.fault_injected', CircuitFaultPayload>
  | BaseEvent<'circuit.fault_cleared', { fault_id: string }>
  | BaseEvent<'transport.status', TransportStatusPayload>
  | BaseEvent<'firmware.state_change', FirmwareStatePayload>
  | BaseEvent<'uart.tx', UartTxPayload>;
