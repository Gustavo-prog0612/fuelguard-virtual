import React from 'react';
import { 
  BookOpenCheck, 
  CheckSquare, 
  AlertTriangle, 
  Cpu,
  FileCode,
  ShieldAlert
} from 'lucide-react';
import { HonestyBadge } from '@/ui/components/badges/HonestyBadge';

export const GuideView: React.FC = () => {
  const handleDownloadFirmwareIno = () => {
    // Busca o código do firmware ou gera dinamicamente para download
    const firmwareCode = `/**
 * FuelGuard — Firmware Oficial de Bancada Real (ESP32-S3)
 * Microcontrolador: ESP32-S3 DevKitC-1 (Xtensa Dual-Core 240 MHz, 3.3V CMOS)
 *
 * Mapeamento Canônico de Pinos:
 * - D1 (LED Status): GPIO4 (com resistor 220R)
 * - SEN0311 (Ultrassônico): TX -> GPIO16 (UART1 RX), MODE/RX -> +3.3V (Modo Processado contínuo)
 * - BZ1 (Buzzer Ativo): Acionado via transistor Q1 (2N2222A) com base no GPIO14 (resistor 1kΩ)
 * - SW1 (Reed Switch): GPIO7 (com resistor pull-up interno)
 * - PN532 (NFC): SPI (SCK=GPIO12, MISO=GPIO13, MOSI=GPIO11, SS=GPIO10)
 */
#include <Arduino.h>
#include <SPI.h>
#include <Adafruit_PN532.h>

#define PIN_LED_READY      4
#define PIN_LID_REED       7
#define PIN_PN532_CS       10
#define PIN_PN532_MOSI     11
#define PIN_PN532_SCK      12
#define PIN_PN532_MISO     13
#define PIN_BUZZER_ACTIVE  14  // Base de Q1 (2N2222A) via 1kΩ
#define PIN_LEVEL_RX       16  // SEN0311 TX conectado ao GPIO16 (ESP32 UART1_RX)

static constexpr uint16_t TANK_INTERNAL_DIAMETER_MM = 200;
static constexpr uint16_t TANK_INTERNAL_HEIGHT_MM   = 160;
static constexpr uint16_t SENSOR_BLIND_ZONE_MM      = 30;
static constexpr double   TANK_RADIUS_MM            = 100.0;
static constexpr double   PI_CONST                  = 3.14159265358979323846;

HardwareSerial LevelSerial(1);
Adafruit_PN532 nfc(PIN_PN532_SCK, PIN_PN532_MISO, PIN_PN532_MOSI, PIN_PN532_CS);

struct LevelReading {
  bool     valid;
  uint16_t distanceMm;
  uint16_t waterHeightMm;
  uint16_t volumeMl;
};

static bool readSen0311Frame(LevelReading &reading) {
  reading = { false, 0, 0, 0 };
  while (LevelSerial.available() >= 4) {
    if (LevelSerial.peek() != 0xFF) {
      LevelSerial.read();
      continue;
    }
    const uint8_t header   = static_cast<uint8_t>(LevelSerial.read());
    const uint8_t dataHigh = static_cast<uint8_t>(LevelSerial.read());
    const uint8_t dataLow  = static_cast<uint8_t>(LevelSerial.read());
    const uint8_t checksum = static_cast<uint8_t>(LevelSerial.read());

    if (static_cast<uint8_t>(header + dataHigh + dataLow) != checksum) continue;

    const uint16_t distanceMm = (static_cast<uint16_t>(dataHigh) << 8) | dataLow;
    if (distanceMm < SENSOR_BLIND_ZONE_MM || distanceMm > 4500) continue;

    const int32_t heightMm = static_cast<int32_t>(TANK_INTERNAL_HEIGHT_MM) - distanceMm;
    const uint16_t clampedHeightMm = static_cast<uint16_t>(constrain(heightMm, 0, TANK_INTERNAL_HEIGHT_MM));
    const double volumeMlExact = (PI_CONST * TANK_RADIUS_MM * TANK_RADIUS_MM * clampedHeightMm) / 1000.0;

    reading = { true, distanceMm, clampedHeightMm, static_cast<uint16_t>(min<uint32_t>(static_cast<uint32_t>(volumeMlExact + 0.5), 5026)) };
    return true;
  }
  return false;
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED_READY, OUTPUT);
  pinMode(PIN_LID_REED, INPUT_PULLUP);
  pinMode(PIN_BUZZER_ACTIVE, OUTPUT);
  digitalWrite(PIN_LED_READY, LOW);
  digitalWrite(PIN_BUZZER_ACTIVE, LOW);

  LevelSerial.begin(9600, SERIAL_8N1, PIN_LEVEL_RX, -1);
  nfc.begin();
  if (nfc.getFirmwareVersion()) {
    nfc.SAMConfig();
  }
  digitalWrite(PIN_BUZZER_ACTIVE, HIGH);
  delay(80);
  digitalWrite(PIN_BUZZER_ACTIVE, LOW);
  digitalWrite(PIN_LED_READY, HIGH);
}

void loop() {
  static uint32_t lastReportMs = 0;
  static uint32_t lastRfidMs = 0;
  static LevelReading lastReading = { false, 0, 0, 0 };

  LevelReading cur;
  if (readSen0311Frame(cur)) lastReading = cur;

  const bool lidClosed = (digitalRead(PIN_LID_REED) == LOW);

  if (millis() - lastRfidMs >= 400) {
    lastRfidMs = millis();
    uint8_t uid[7];
    uint8_t uidLen;
    if (nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLen, 25)) {
      digitalWrite(PIN_BUZZER_ACTIVE, HIGH); delay(30); digitalWrite(PIN_BUZZER_ACTIVE, LOW);
      Serial.print(F("[RFID] UID: "));
      for (uint8_t i = 0; i < uidLen; i++) Serial.printf("%02X ", uid[i]);
      Serial.println();
    }
  }

  if (millis() - lastReportMs >= 500) {
    lastReportMs = millis();
    Serial.printf("[FW] dist_mm=%u height_mm=%u volume_ml=%u lid=%s\\r\\n",
                  lastReading.distanceMm, lastReading.waterHeightMm, lastReading.volumeMl,
                  lidClosed ? "CLOSED" : "OPEN");
  }
}
`;
    const blob = new Blob([firmwareCode], { type: 'text/x-c' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fuelguard_esp32_firmware.ino';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F5F7] dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-ui overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Topo: Card de Cabeçalho (Permity Style) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <BookOpenCheck className="w-5 h-5 text-sky-500" />
            <h1 className="text-sm font-display font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              Roteiro & Checklist de Transição para Bancada Física
            </h1>
            <HonestyBadge level="requer_hardware" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Orientações de montagem mecatrônica real, medições prévias obrigatórias e firmware para o ESP32-S3 físico. A emulação é apenas auxiliar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadFirmwareIno}
            className="px-4 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-mono font-medium flex items-center gap-2 transition shadow-xs"
            title="Baixar sketch Arduino C++ oficial do firmware"
          >
            <FileCode className="w-3.5 h-3.5 text-[#D4F63D]" />
            <span>firmware.ino (Arduino)</span>
          </button>
        </div>
      </div>

      {/* Grid: Checklist & Alertas Físicos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Lado Esquerdo: Checklist de Montagem Física (7 Colunas) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <h2 className="text-xs font-display font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-500" />
            Checklist de Segurança Antes de Ligar a Fonte USB
          </h2>

          <div className="space-y-3 text-xs">
            {/* Item 1 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-0.5 rounded-xs accent-neutral-900 dark:accent-white" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">1. Verificação da UART do SEN0311 antes de ligar</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Alimente o SEN0311 em 3,3 V, confirme 9600 8N1, RX/MODE ancorado em +3.3V (nível alto para saída processada automática) e TX conectado somente ao GPIO16. Não use divisor resistivo desnecessário.
                  </p>
                </div>
              </label>
            </div>

            {/* Item 2 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-0.5 rounded-xs accent-neutral-900 dark:accent-white" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">2. Conexão Firme do Barramento Comum de Terra (GND)</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Certifique-se de que o GND da fonte 5V externa, do ESP32-S3 e de todos os sensores estejam unidos no mesmo trilho comum da protoboard MB-102.
                  </p>
                </div>
              </label>
            </div>

            {/* Item 3 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-0.5 rounded-xs accent-neutral-900 dark:accent-white" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">3. Conferência de Part-Number e Chaves do PN532</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Configure os jumpers SEL0/SEL1 da Adafruit PN532 v1.6 para o modo SPI documentado; não trate o módulo como uma placa ELECHOUSE V4 com DIP CH1/CH2.
                  </p>
                </div>
              </label>
            </div>

            {/* Item 4 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-0.5 rounded-xs accent-neutral-900 dark:accent-white" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">4. Alívio de Tensão Mecânica e Proteção contra Gotejamento</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    A eletrônica deve permanecer sobre superfície seca. Mantenha os cabos do transdutor com laço de gotejamento (<em>drip loop</em>) para que respingos d'água não alcancem a protoboard.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Limites da validação virtual */}
          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-sky-500" />
                Limites da Validação Virtual
              </h3>
              <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/60">
                Priorizar Ensaio Físico
              </span>
            </div>
            <ol className="list-decimal list-inside text-xs text-sky-900/80 dark:text-sky-300/80 space-y-1 leading-relaxed">
              <li>O visualizador e os testes verificam contratos de software, não o comportamento elétrico da unidade física.</li>
              <li>Não usar um modelo genérico de ultrassom como substituto do A02YYUW/SEN0311 real.</li>
              <li>Grave <code className="text-sky-700 dark:text-sky-200 font-bold">firmware/fuelguard_esp32_firmware.ino</code> apenas após conferir o checklist elétrico.</li>
              <li>Registre fotos, medições e resultados no repositório antes de liberar a PCB para fabricação.</li>
            </ol>
          </div>
        </div>

        {/* Lado Direito: Limitações do Modelo Virtual (5 Colunas) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <h2 className="text-xs font-display font-bold uppercase tracking-wider text-rose-500 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Limitações do Modelo Virtual
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Fenômenos físicos que <strong>exigem validação obrigatória</strong> na bancada real com proveta graduada e osciloscópio:
          </p>

          <ul className="space-y-3 text-xs">
            <li className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 space-y-1">
              <strong className="text-rose-700 dark:text-rose-400 block font-mono">Reflexão em Paredes Laterais:</strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                O cone de detecção documentado do SEN0311 e a posição central devem ser validados no tanque cilíndrico Ø200 mm; não liberar o suporte apenas pelo render.
              </p>
            </li>

            <li className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 space-y-1">
              <strong className="text-rose-700 dark:text-rose-400 block font-mono">Espuma e Menisco de Superfície:</strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Líquidos com bolhas de ar dispersam a onda acústica de 40 kHz, causando perda transitória de eco (timeout) que a simulação geométrica pura não replica.
              </p>
            </li>

            <li className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 space-y-1">
              <strong className="text-rose-700 dark:text-rose-400 block font-mono">Ruído de Chaveamento da Fonte:</strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Picos de consumo de até 350 mA no rádio Wi-Fi do ESP32 podem induzir ruído na linha analógica do transdutor sem desacoplamento adequado (capacitor de 100 nF).
              </p>
            </li>
          </ul>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              Selo Didático:
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60">
              ÁGUA ABERTA DIDÁTICA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
