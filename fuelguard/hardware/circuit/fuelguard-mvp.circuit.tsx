/**
 * FuelGuard Virtual Test Bench — Código Eletrônico Canônico tscircuit
 * Fonte de verdade para esquemático, pinagem, netlist e layout eletrônico.
 * 
 * NÍVEIS DE PROJETO:
 * A. Bancada MVP: Implementação física em Protoboard BB-830 com fiação DuPont/JST.
 * B. Placa Adaptadora Futura: Em especificação técnica formal (não roteada em cobre físico de produção).
 */

import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        [elemName: string]: any;
      }
    }
  }
}

export interface FuelguardCircuitProps {
  showUnroutedWarning?: boolean;
}

/**
 * Definição JSX do Circuito Canônico FuelGuard MVP (tscircuit-compatible)
 */
export const FuelguardMvpCircuit: React.FC<FuelguardCircuitProps> = ({
  showUnroutedWarning = true,
}) => {
  return (
    <board width="120mm" height="90mm">
      {/* Aviso de Engenharia: A bancada física atual é montada em protoboard.
          A PCB adaptadora dedicada está em fase de projeto/especificação. */}
      {showUnroutedWarning && (
        <silkscreentext
          text="FUELGUARD MVP BENCH - ADAPTER PCB: UNDER SPECIFICATION (UNROUTED)"
          pcbX={0}
          pcbY={40}
          fontSize="1.5mm"
          layer="top"
        />
      )}

      {/* U1: Soquete / Barramento ESP32-S3 DevKitC-1 v1.1 */}
      <chip
        name="U1"
        footprint="dip44_w22.86mm"
        pcbX={-32}
        pcbY={0}
        pinLabels={{
          pin1: '3V3',
          pin2: '5V',
          pin3: 'GND',
          pin4: 'IO4_LED',
          pin5: 'IO5_TRIG',
          pin6: 'IO6_ECHO',
          pin7: 'IO7_LID',
          pin10: 'IO10_CS',
          pin11: 'IO11_MOSI',
          pin12: 'IO12_SCK',
          pin13: 'IO13_MISO',
          pin14: 'IO14_BUZZER',
        }}
      />

      {/* U2: Buffer TTL Quádruplo SN74AHCT125N */}
      <chip
        name="U2"
        footprint="dip14_w7.62mm"
        pcbX={12}
        pcbY={-22}
        pinLabels={{
          pin1: '/1OE',
          pin2: '1A',
          pin3: '1Y',
          pin7: 'GND',
          pin14: 'VCC',
        }}
      />

      {/* R1: Resistor do Divisor Resistivo (10 kΩ 1% DO-41) */}
      <resistor
        name="R1"
        resistance="10k"
        footprint="axial_do41_p7.62mm"
        pcbX={12}
        pcbY={-4}
      />

      {/* R2: Resistor do Divisor Resistivo (15 kΩ 1% DO-41) */}
      <resistor
        name="R2"
        resistance="15k"
        footprint="axial_do41_p7.62mm"
        pcbX={12}
        pcbY={4}
      />

      {/* R3: Resistor Limitador de Corrente do LED (1 kΩ 5% 0805/Axial) */}
      <resistor
        name="R3"
        resistance="1k"
        footprint="res0805"
        pcbX={12}
        pcbY={18}
      />

      {/* D1: LED Verde Indicador de Telemetria (5mm Radial) */}
      <led
        name="D1"
        color="green"
        footprint="led_radial_d5mm_p2.54mm"
        pcbX={12}
        pcbY={28}
      />

      {/* BZ1: Buzzer Piezoelétrico CUI Devices CPE-1200 (12mm THT) */}
      <chip
        name="BZ1"
        footprint="buzzer_d12mm_p7.62mm"
        pcbX={46}
        pcbY={-24}
        pinLabels={{
          pin1: 'POS',
          pin2: 'NEG',
        }}
      />

      {/* J1: Conector Chicote Sonda Ultrassônica JSN-SR04T (JST-XH 4P) */}
      <chip
        name="J1"
        footprint="jst_xh_4p_p2.50mm"
        pcbX={50}
        pcbY={-4}
        pinLabels={{
          pin1: '5V',
          pin2: 'TRIG',
          pin3: 'ECHO',
          pin4: 'GND',
        }}
      />

      {/* J2: Conector Chicote Módulo Leitor RFID/NFC PN532 (JST-XH 6P) */}
      <chip
        name="J2"
        footprint="jst_xh_6p_p2.50mm"
        pcbX={50}
        pcbY={20}
        pinLabels={{
          pin1: '3V3',
          pin2: 'GND',
          pin3: 'CS',
          pin4: 'MOSI',
          pin5: 'SCK',
          pin6: 'MISO',
        }}
      />

      {/* J3: Conector Chicote Sensor Magnético Reed Switch Tampa (JST-XH 2P) */}
      <chip
        name="J3"
        footprint="jst_xh_2p_p2.50mm"
        pcbX={24}
        pcbY={38}
        pinLabels={{
          pin1: 'LID_SENSE',
          pin2: 'GND',
        }}
      />

      {/* C1 & C2: Capacitores de Desacoplamento */}
      <capacitor
        name="C1"
        capacitance="100nF"
        footprint="cap0805"
        pcbX={20}
        pcbY={-28}
      />
      <capacitor
        name="C2"
        capacitance="10uF"
        footprint="cap_radial_d5mm"
        pcbX={28}
        pcbY={-28}
      />
    </board>
  );
};

export default FuelguardMvpCircuit;
