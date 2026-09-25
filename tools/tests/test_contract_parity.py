"""
FuelGuard Virtual Test Bench — Testes de Paridade de Contratos e Algoritmos (Pytest)
Garante que os modelos Pydantic espelham fielmente os esquemas TypeScript canônicos (schema_version: 1).
"""

import pytest
from pydantic import ValidationError
from tools.analytics.models_pydantic import (
    BaseEvent,
    TankLevelPayload,
    LidStatePayload,
    UartTxPayload,
    FuelGuardExportPackage,
    ExportSummary,
    UartLogEntry,
)
from tools.analytics.compare_filters import run_benchmark


class TestContractParity:
    def test_valid_canonical_export_package(self):
        """Valida que o pacote gerado pelo simulador é 100% válido no Pydantic."""
        pkg_data = {
            "schema_version": 1,
            "app": "FuelGuard Virtual Test Bench",
            "version": "0.1.0",
            "exported_at": "2026-09-25T14:00:00Z",
            "summary": {
                "total_events": 2,
                "total_logs": 1,
                "sim_time_ms": 1000,
            },
            "events": [
                {
                    "schema_version": 1,
                    "seq": 1,
                    "sim_time_ms": 0,
                    "kind": "clock.tick",
                    "origin": "system",
                    "payload": {"delta_ms": 20},
                },
                {
                    "schema_version": 1,
                    "seq": 2,
                    "sim_time_ms": 200,
                    "kind": "tank.level_update",
                    "origin": "hardware_model",
                    "payload": {
                        "raw_distance_cm": 42.1,
                        "filtered_distance_cm": 42.1,
                        "water_height_cm": 57.9,
                        "volume_liters": 579,
                        "percentage": 57.9,
                        "in_blind_zone": False,
                        "echo_valid": True,
                        "temperature_c": 24.8,
                        "sound_speed_mps": 346.0,
                    },
                },
            ],
            "uart_logs": [
                {
                    "time": "00:00.200",
                    "level": "INFO",
                    "msg": "[FW] JSN ping: dist=42.1cm h=57.9cm vol=579L",
                }
            ],
        }

        pkg = FuelGuardExportPackage.model_validate(pkg_data)
        assert pkg.schema_version == 1
        assert pkg.app == "FuelGuard Virtual Test Bench"
        assert len(pkg.events) == 2
        assert len(pkg.uart_logs) == 1

    def test_rejection_of_incompatible_schema_version(self):
        """Rejeita esquemas com versão diferente de 1."""
        invalid_data = {
            "schema_version": 2,
            "app": "FuelGuard Virtual Test Bench",
            "version": "0.2.0",
            "exported_at": "2026-09-25T14:00:00Z",
            "summary": {"total_events": 0, "total_logs": 0, "sim_time_ms": 0},
            "events": [],
            "uart_logs": [],
        }

        with pytest.raises(ValidationError):
            FuelGuardExportPackage.model_validate(invalid_data)

    def test_tank_level_payload_types(self):
        """Valida integridade numérica dos campos do payload acústico/tanque."""
        payload_data = {
            "raw_distance_cm": 42.5,
            "filtered_distance_cm": 42.3,
            "water_height_cm": 57.7,
            "volume_liters": 577.0,
            "percentage": 57.7,
            "in_blind_zone": False,
            "echo_valid": True,
            "temperature_c": 25.0,
            "sound_speed_mps": 346.12,
        }

        payload = TankLevelPayload.model_validate(payload_data)
        assert payload.water_height_cm == 57.7
        assert payload.sound_speed_mps == 346.12
        assert payload.in_blind_zone is False

    def test_lid_state_payload_debounce(self):
        """Valida campos do sensor da tampa e contagem de repiques."""
        lid_data = {
            "is_open": False,
            "raw_pin_state": 0,
            "debounce_active": False,
            "bounces_count": 8,
        }

        lid = LidStatePayload.model_validate(lid_data)
        assert lid.is_open is False
        assert lid.bounces_count == 8

    def test_median_filter_benchmark_parity(self):
        """Confirma que o filtro mediano supera a média móvel em presença de outliers."""
        results = run_benchmark()
        raw_mse = results["raw"]["mse"]
        med_mse = results["median"]["mse"]
        ma_mse = results["moving_average"]["mse"]

        assert med_mse < ma_mse
        assert med_mse < raw_mse * 0.05  # Redução superior a 95% do erro quadrático
