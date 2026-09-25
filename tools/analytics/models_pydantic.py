"""
FuelGuard Virtual Test Bench — Modelos Pydantic de Contratos de Eventos (schema_version: 1)
Espelho em Python dos schemas TypeScript para garantia de paridade e interoperabilidade de dados.
"""

from typing import Literal, Optional, List, Dict, Any
from pydantic import BaseModel, Field

SCHEMA_VERSION: Literal[1] = 1

EventOrigin = Literal['firmware', 'hardware_model', 'fault_injector', 'user', 'system']

EventKind = Literal[
    'clock.tick',
    'clock.state_changed',
    'tank.level_update',
    'acoustic.ping_result',
    'nfc.tag_read',
    'nfc.denied',
    'lid.state_change',
    'lid.bounce',
    'circuit.fault_injected',
    'circuit.fault_cleared',
    'transport.status',
    'firmware.state_change',
    'firmware.alert',
    'uart.rx',
    'uart.tx',
]


class BaseEvent(BaseModel):
    schema_version: Literal[1] = Field(default=1, description="Versão imutável do esquema canônico")
    seq: int = Field(ge=0, description="Identificador monotônico estrito")
    sim_time_ms: int = Field(ge=0, description="Tempo virtual da simulação em milissegundos")
    kind: EventKind
    origin: EventOrigin
    payload: Dict[str, Any]


class TankLevelPayload(BaseModel):
    raw_distance_cm: float
    filtered_distance_cm: float
    water_height_cm: float
    volume_liters: float
    percentage: float
    in_blind_zone: bool
    echo_valid: bool
    temperature_c: float
    sound_speed_mps: float


class AcousticPingPayload(BaseModel):
    echo_time_us: int
    measured_cm: float
    quality: float
    attenuation_db: float


class NfcTagPayload(BaseModel):
    uid: str
    card_type: str = "MIFARE Classic 1K"
    authorized: bool
    operator_name: Optional[str] = None


class LidStatePayload(BaseModel):
    is_open: bool
    raw_pin_state: int
    debounce_active: bool
    bounces_count: int


class CircuitFaultPayload(BaseModel):
    fault_id: str
    name: str
    description: str
    safety_violation: bool
    target_pin: str


class TransportStatusPayload(BaseModel):
    is_online: bool
    offline_buffer_count: int
    last_flushed_seq: Optional[int] = None


class UartTxPayload(BaseModel):
    channel: Literal['UART0'] = 'UART0'
    baud: Literal[115200] = 115200
    message: str
    level: Literal['INFO', 'WARN', 'DEBUG', 'ERROR', 'SYSTEM']


class ExportSummary(BaseModel):
    total_events: int
    total_logs: int
    sim_time_ms: int


class UartLogEntry(BaseModel):
    time: str
    level: str
    msg: str


class FuelGuardExportPackage(BaseModel):
    schema_version: Literal[1] = 1
    app: str = "FuelGuard Virtual Test Bench"
    version: str = "0.1.0"
    exported_at: str
    summary: ExportSummary
    project: Optional[Dict[str, Any]] = None
    calibration: Optional[Dict[str, Any]] = None
    session: Optional[Dict[str, Any]] = None
    events: List[BaseEvent] = Field(default_factory=list)
    uart_logs: List[UartLogEntry] = Field(default_factory=list)
