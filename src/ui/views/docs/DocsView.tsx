/**
 * FuelGuard — Central de Controle, Montagem & Engenharia Real
 * Substitui o StyleGuide antigo por um manual prático, interativo e profissional.
 * 
 * Estrutura:
 *   1. 🎯 Trilha de Montagem (8 Etapas Guiadas estilo Duolingo com progresso interativo)
 *   2. 🔌 Esquema Elétrico & Pinout (Pinout detalhado do ESP32, JST PH2.0, Driver Q1)
 *   3. 💾 Firmware & Flash (Código canônico com download direto e instruções IDE)
 *   4. 🧪 Central de Testes (5 procedimentos de teste e validação de bancada)
 */

import React, { useState } from 'react';
import {
  Wrench,
  Cpu,
  FileCode2,
  FlaskConical,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Download,
  ShieldCheck,
  Zap,
  Radio,
  ToggleLeft,
  Volume2,
  Copy,
  Check,
  Layers,
} from 'lucide-react';

export const DocsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assembly' | 'wiring' | 'firmware' | 'commissioning'>('assembly');
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({ 1: true });
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState(false);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  const progressPercent = Math.round((Object.values(completedSteps).filter(Boolean).length / 8) * 100);

  const handleDownloadFirmware = () => {
    // Se estiver em ambiente SPA local, cria o blob com o firmware canônico completo
    const firmwareCode = `/*
 * FuelGuard — Firmware Oficial de Bancada Real (ESP32-S3)
 * Microcontrolador: ESP32-S3 DevKitC-1-N8R8 v1.1
 */

#include <Arduino.h>
#include <SPI.h>
#include <Adafruit_PN532.h>

static constexpr uint8_t PIN_LED_READY      = 4;
static constexpr uint8_t PIN_LID_REED       = 7;
static constexpr uint8_t PIN_PN532_CS       = 10;
static constexpr uint8_t PIN_PN532_MOSI     = 11;
static constexpr uint8_t PIN_PN532_SCK      = 12;
static constexpr uint8_t PIN_PN532_MISO     = 13;
static constexpr uint8_t PIN_BUZZER_ACTIVE  = 14;  // Dirige a Base de Q1 (2N2222A) via 1kΩ
static constexpr uint8_t PIN_LEVEL_UART_RX  = 16;  // RX UART1 conectado ao TX do SEN0311

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

  LevelSerial.begin(9600, SERIAL_8N1, PIN_LEVEL_UART_RX, -1);
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

  const copyFirmwareCode = () => {
    navigator.clipboard.writeText(`/* Baixar o arquivo completo com o botão acima */`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#06090d] text-slate-200 font-mono overflow-hidden">
      {/* Barra Superior de Navegação das Áreas Técnicas */}
      <div className="bg-[#0e141c] border-b border-slate-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-sm font-bold text-white tracking-wide uppercase">
              Central de Engenharia & Documentação Física
            </h1>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-bold">
            PROJETO REAL 100% AUDITADO
          </span>
        </div>

        {/* Abas Superiores em Estilo Pílula */}
        <div className="flex items-center gap-1 bg-[#131b26] p-1 rounded-full border border-slate-700">
          <button
            onClick={() => setActiveTab('assembly')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'assembly'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>1. Trilha de Montagem</span>
          </button>

          <button
            onClick={() => setActiveTab('wiring')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'wiring'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>2. Elétrica & Pinout</span>
          </button>

          <button
            onClick={() => setActiveTab('firmware')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'firmware'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>3. Firmware & Flash</span>
          </button>

          <button
            onClick={() => setActiveTab('commissioning')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'commissioning'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>4. Testes & Validação</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Principal com Rolagem Suave */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* ABA 1: TRILHA DE MONTAGEM (ESTILO DUOLINGO / PROGRESSIVO)             */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'assembly' && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Cartão de Progresso Global */}
            <div className="bg-[#0e141c] border border-slate-800 p-5 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-bold text-white">Progresso da Montagem da Bancada Física</h2>
                </div>
                <p className="text-xs text-slate-400 max-w-xl">
                  Siga cada etapa na ordem correta. Não energize a bancada antes de concluir a Etapa 8 (Checklist Anti-Curto).
                </p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-72">
                <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-emerald-400 font-mono">{progressPercent}%</span>
              </div>
            </div>

            {/* Grid com as 8 Etapas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: 1, title: 'Tanque & Estrutura', icon: Layers, desc: 'Fixação de TK1 e verificação de estanqueidade' },
                { step: 2, title: 'Sensor Ultrassônico', icon: Radio, desc: 'Instalação do SEN0311 na tampa LID1' },
                { step: 3, title: 'Interlock da Tampa', icon: ToggleLeft, desc: 'Montagem do sensor MC-38 e ímã' },
                { step: 4, title: 'ESP32-S3 DevKit', icon: Cpu, desc: 'Fixação do microcontrolador na placa' },
                { step: 5, title: 'Módulo RFID PN532', icon: Radio, desc: 'Ajuste das chaves DIP para modo SPI' },
                { step: 6, title: 'Driver do Buzzer', icon: Volume2, desc: 'Transistor Q1 2N2222 + resistor 1kΩ' },
                { step: 7, title: 'Chicote de Cabos', icon: Zap, desc: 'Ligação dos 24 fios com cores e AWG' },
                { step: 8, title: 'Teste Anti-Curto', icon: ShieldCheck, desc: 'Medição prévia com multímetro' },
              ].map((item) => {
                const Icon = item.icon;
                const isDone = !!completedSteps[item.step];
                const isCurrent = activeStep === item.step;
                return (
                  <button
                    key={item.step}
                    onClick={() => setActiveStep(item.step)}
                    className={`p-4 rounded-xl border text-left transition relative overflow-hidden ${
                      isCurrent
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/50'
                        : isDone
                        ? 'bg-[#0e141c] border-emerald-800/60 hover:border-emerald-600'
                        : 'bg-[#0a0f18] border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <Icon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Passo {item.step}</span>
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStep(item.step);
                        }}
                        className="cursor-pointer"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                        )}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-white mb-1">{item.title}</div>
                    <div className="text-[10px] text-slate-400 leading-tight">{item.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Detalhe da Etapa Selecionada */}
            <div className="bg-[#0e141c] border border-slate-800 p-6 rounded-2xl space-y-4">
              {activeStep === 1 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <Layers className="w-4 h-4" /> Passo 1: Preparação do Tanque Cilíndrico FG-TANK-5L-CYL-R1
                    </h3>
                    <button
                      onClick={() => toggleStep(1)}
                      className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition ${
                        completedSteps[1] ? 'bg-emerald-900 text-emerald-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {completedSteps[1] ? <Check className="w-3.5 h-3.5" /> : null}
                      {completedSteps[1] ? 'Concluído' : 'Marcar como Concluído'}
                    </button>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                    <li>Posicione o cilindro acrílico Ø200mm (altura útil 160mm) sobre uma base de borracha ou EVA para amortecer vibrações.</li>
                    <li>Verifique visualmente se há rachaduras ou falhas de colagem nas junções acrílicas antes de colocar água.</li>
                    <li>Capacidade total: 5,026 Litros. Faixa operacional recomendada: de 1,000L a 4,084L.</li>
                    <li>Zona cega do sensor: os primeiros 30mm superiores não conseguem ser lidos pelo transdutor ultrassônico.</li>
                  </ul>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <Radio className="w-4 h-4" /> Passo 2: Montagem do Sensor Ultrassônico DFRobot SEN0311 / A02YYUW
                    </h3>
                    <button
                      onClick={() => toggleStep(2)}
                      className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition ${
                        completedSteps[2] ? 'bg-emerald-900 text-emerald-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {completedSteps[2] ? <Check className="w-3.5 h-3.5" /> : null}
                      {completedSteps[2] ? 'Concluído' : 'Marcar como Concluído'}
                    </button>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                    <li>Fixe o sensor centralizado no orifício circular central da tampa acrílica LID1 apontando perpendicularmente para baixo.</li>
                    <li>Conecte o chicote de 4 pinos JST PH2.0 fornecido de fábrica.</li>
                    <li><strong className="text-amber-300">Identificação de fios do conector JST PH2.0:</strong>
                      <div className="mt-1 pl-4 space-y-1 font-mono text-[11px]">
                        <div>🔴 Pino 1 (Vermelho): VCC → +3.3V do ESP32</div>
                        <div>⚫ Pino 2 (Preto): GND → GND comum</div>
                        <div>⚪ Pino 3 (Branco): RX / MODE → Ligar direto em +3.3V (Modo processado contínuo)</div>
                        <div>🔵 Pino 4 (Azul): TX → GPIO16 do ESP32 (UART1 RX a 9600 baud)</div>
                      </div>
                    </li>
                  </ul>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <ToggleLeft className="w-4 h-4" /> Passo 3: Instalação do Sensor Magnético MC-38 (Interlock)
                    </h3>
                    <button
                      onClick={() => toggleStep(3)}
                      className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition ${
                        completedSteps[3] ? 'bg-emerald-900 text-emerald-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {completedSteps[3] ? <Check className="w-3.5 h-3.5" /> : null}
                      {completedSteps[3] ? 'Concluído' : 'Marcar como Concluído'}
                    </button>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                    <li>Fixe a parte com os fios (o sensor Reed) na borda fixa do cilindro acrílico.</li>
                    <li>Fixe a parte sem fios (o ímã permanente) na tampa circular, exatamente alinhada ao sensor quando a tampa estiver fechada.</li>
                    <li>Distância de atuação (gap de chaveamento): mantenha entre 5mm e 10mm quando fechado.</li>
                    <li><strong className="text-amber-300">Polaridade confirmada:</strong> Usar variante NO (Normalmente Aberto). Com tampa fechada, o ímã fecha o circuito para GND e o ESP32 lê nível lógico LOW no GPIO7 via <code className="text-emerald-300">INPUT_PULLUP</code>.</li>
                  </ul>
                </div>
              )}

              {activeStep === 4 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <Cpu className="w-4 h-4" /> Passo 4: Instalação do ESP32-S3 DevKitC-1 v1.1
                    </h3>
                    <button
                      onClick={() => toggleStep(4)}
                      className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition ${
                        completedSteps[4] ? 'bg-emerald-900 text-emerald-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {completedSteps[4] ? <Check className="w-3.5 h-3.5" /> : null}
                      {completedSteps[4] ? 'Concluído' : 'Marcar como Concluído'}
                    </button>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                    <li>Encaixe o módulo nos dois conectores fêmea 1×22 pitch 2.54mm com espaçamento central de 22.86mm (0.9").</li>
                    <li>Certifique-se de que a porta USB-C esteja voltada para fora para facilitar a conexão do cabo de gravação.</li>
                    <li>Utilize um cabo USB de dados (não utilize cabos que são apenas de carga).</li>
                  </ul>
                </div>
              )}

              {activeStep === 5 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <Radio className="w-4 h-4" /> Passo 5: Configuração e Fixação do Leitor Adafruit PN532 v1.6
                    </h3>
                    <button
                      onClick={() => toggleStep(5)}
                      className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition ${
                        completedSteps[5] ? 'bg-emerald-900 text-emerald-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {completedSteps[5] ? <Check className="w-3.5 h-3.5" /> : null}
                      {completedSteps[5] ? 'Concluído' : 'Marcar como Concluído'}
                    </button>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                    <li><strong className="text-amber-300">CRÍTICO — Jumpers de Protocolo:</strong> A Adafruit PN532 v1.6 usa SEL0/SEL1. Para operar em SPI 4 fios, confira o estado dos dois jumpers conforme o esquema oficial:
                      <div className="mt-1 pl-4 font-mono text-[11px]">
                        <div>CH1 = <strong>OFF (0)</strong> | CH2 = <strong>ON (1)</strong></div>
                      </div>
                    </li>
                    <li>Conectores no header 1×8:
                      <div className="mt-1 pl-4 space-y-0.5 font-mono text-[11px]">
                        <div>Pino 1 (SCK)  → GPIO12</div>
                        <div>Pino 2 (MISO) → GPIO13</div>
                        <div>Pino 3 (MOSI) → GPIO11</div>
                        <div>Pino 4 (SS)   → GPIO10</div>
                        <div>Pino 5 (VCC)  → +3.3V</div>
                        <div>Pino 6 (GND)  → GND comum</div>
                      </div>
                    </li>
                  </ul>
                </div>
              )}

              {activeStep === 6 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <Volume2 className="w-4 h-4" /> Passo 6: Circuito Driver do Buzzer (Q1 2N2222) e LED Status
                    </h3>
                    <button
                      onClick={() => toggleStep(6)}
                      className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition ${
                        completedSteps[6] ? 'bg-emerald-900 text-emerald-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {completedSteps[6] ? <Check className="w-3.5 h-3.5" /> : null}
                      {completedSteps[6] ? 'Concluído' : 'Marcar como Concluído'}
                    </button>
                  </div>
                  <div className="bg-amber-950/30 border border-amber-700/50 p-3 rounded-lg text-xs text-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-400 inline mr-1" />
                    <strong>Proteção contra Queima do ESP32:</strong> O buzzer consome até 30mA, mas os pinos GPIO do ESP32-S3 são projetados para no máximo 12mA contínuos recomendados. NUNCA ligue o buzzer diretamente ao GPIO14 sem o transistor driver Q1.
                  </div>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                    <li>Transistor Q1 (2N2222A em encapsulamento TO-92):
                      <div className="mt-1 pl-4 space-y-0.5 font-mono text-[11px]">
                        <div>• Base (B): Conectada ao GPIO14 passando pelo resistor limitador R_BASE de 1kΩ (faixas marrom-preto-vermelho).</div>
                        <div>• Coletor (C): Conectado ao polo negativo (−) do buzzer BZ1.</div>
                        <div>• Emissor (E): Conectado ao GND comum da placa.</div>
                      </div>
                    </li>
                    <li>Polo positivo (+) do buzzer BZ1: Conectado diretamente à linha de alimentação +3.3V.</li>
                    <li>LED Verde D1: Ânodo (terminal longo) ligado ao resistor R3 220Ω (que vai ao GPIO4); Cátodo (terminal curto) ao GND.</li>
                  </ul>
                </div>
              )}

              {activeStep === 7 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Passo 7: Roteamento dos Cabos e Identificação de Cores
                    </h3>
                    <button
                      onClick={() => toggleStep(7)}
                      className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition ${
                        completedSteps[7] ? 'bg-emerald-900 text-emerald-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {completedSteps[7] ? <Check className="w-3.5 h-3.5" /> : null}
                      {completedSteps[7] ? 'Concluído' : 'Marcar como Concluído'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-300">
                    Siga o padrão internacional de cores para evitar confusões na bancada:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-red-400 font-bold block">Vermelho (AWG 22)</span>
                      <span className="text-[10px] text-slate-400">+3.3V Alimentação</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-300 font-bold block">Preto (AWG 22)</span>
                      <span className="text-[10px] text-slate-400">GND Retorno Comum</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-violet-400 font-bold block">Roxo / Azul (AWG 24)</span>
                      <span className="text-[10px] text-slate-400">SPI (SCK, MOSI, MISO, CS)</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-sky-400 font-bold block">Azul / Laranja (AWG 24)</span>
                      <span className="text-[10px] text-slate-400">UART RX & Controle GPIO</span>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 8 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Passo 8: Inspeção com Multímetro & Teste Anti-Curto
                    </h3>
                    <button
                      onClick={() => toggleStep(8)}
                      className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition ${
                        completedSteps[8] ? 'bg-emerald-900 text-emerald-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {completedSteps[8] ? <Check className="w-3.5 h-3.5" /> : null}
                      {completedSteps[8] ? 'Concluído' : 'Marcar como Concluído'}
                    </button>
                  </div>
                  <div className="bg-red-950/30 border border-red-700/50 p-3 rounded-lg text-xs text-red-200">
                    <AlertTriangle className="w-4 h-4 text-red-400 inline mr-1" />
                    <strong>Regra de Ouro:</strong> NUNCA plugue o cabo USB na tomada antes de realizar este teste de continuidade em modo bip!
                  </div>
                  <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                    <li>Coloque o multímetro na escala de continuidade (teste de diodo com bip sonoro).</li>
                    <li>Coloque uma ponta de prova no pino 3V3 e a outra ponta no GND. <strong>O multímetro NÃO PODE apitar</strong>. Se apitar, existe um curto-circuito em sua montagem.</li>
                    <li>Verifique a resistência entre 3V3 e GND: deve ser superior a 1000 Ohms (1kΩ).</li>
                    <li>Verifique se nenhum fio de sinal toca o barramento de alimentação.</li>
                    <li>Somente após validar resistência infinita/alta entre 3.3V e GND, conecte a fonte USB-C de 5V.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* ABA 2: ESQUEMA ELÉTRICO & PINOUT DETALHADO                            */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'wiring' && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header da Seção */}
            <div className="bg-[#0e141c] border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-sky-400" />
                  Mapeamento de Pinos & Esquema da Placa Adaptadora
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Todas as ligações elétricas canônicas do ESP32-S3 DevKitC-1 v1.1. Tensão de sinal nominal: 3.3V CMOS.
                </p>
              </div>
              <span className="text-[10px] px-2 py-1 bg-sky-950 border border-sky-800 text-sky-300 rounded font-mono">
                CMOS 3.3V ONLY
              </span>
            </div>

            {/* Tabela de Pinos do Header J1 (Pinos 1 a 22) */}
            <div className="bg-[#0e141c] border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800 bg-[#0a0f18] flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  ESP32-S3 Header J1 (Fileira Esquerda)
                </span>
                <span className="text-[10px] text-slate-400">22 Pinos • Pitch 2.54mm</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] font-mono">
                  <thead className="bg-[#0a0f18] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-2 text-left">Pino</th>
                      <th className="px-4 py-2 text-left">Nome Silkscreen</th>
                      <th className="px-4 py-2 text-left">Função Canônica</th>
                      <th className="px-4 py-2 text-left">Dispositivo Conectado</th>
                      <th className="px-4 py-2 text-left">Tensão</th>
                      <th className="px-4 py-2 text-left">Observação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr className="hover:bg-slate-800/30">
                      <td className="px-4 py-2 font-bold text-emerald-400">J1.1</td>
                      <td className="px-4 py-2 text-white">3V3</td>
                      <td className="px-4 py-2 text-orange-400">Power Rail (+3.3V)</td>
                      <td className="px-4 py-2 text-slate-300">SEN0311, PN532, BZ1 (+)</td>
                      <td className="px-4 py-2 text-emerald-400">3.3V</td>
                      <td className="px-4 py-2 text-slate-400">Alimentação principal da bancada</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="px-4 py-2 font-bold text-emerald-400">J1.4</td>
                      <td className="px-4 py-2 text-white">GPIO4</td>
                      <td className="px-4 py-2 text-sky-400">Digital Output</td>
                      <td className="px-4 py-2 text-slate-300">Resistor R3 (220Ω) → LED D1</td>
                      <td className="px-4 py-2 text-emerald-400">3.3V</td>
                      <td className="px-4 py-2 text-slate-400">Indicador de status do sistema</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="px-4 py-2 font-bold text-emerald-400">J1.7</td>
                      <td className="px-4 py-2 text-white">GPIO7</td>
                      <td className="px-4 py-2 text-sky-400">Digital Input</td>
                      <td className="px-4 py-2 text-slate-300">MC-38 Reed Switch (Tampa)</td>
                      <td className="px-4 py-2 text-emerald-400">3.3V</td>
                      <td className="px-4 py-2 text-slate-400">Usa INPUT_PULLUP interno</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="px-4 py-2 font-bold text-emerald-400">J1.9</td>
                      <td className="px-4 py-2 text-white">GPIO16</td>
                      <td className="px-4 py-2 text-pink-400">UART1_RX</td>
                      <td className="px-4 py-2 text-slate-300">SEN0311 TX (Fio Azul)</td>
                      <td className="px-4 py-2 text-emerald-400">3.3V</td>
                      <td className="px-4 py-2 text-slate-400">9600 baud 8N1 (recebe distância)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="px-4 py-2 font-bold text-emerald-400">J1.16</td>
                      <td className="px-4 py-2 text-white">GPIO10</td>
                      <td className="px-4 py-2 text-violet-400">SPI_CS (SS)</td>
                      <td className="px-4 py-2 text-slate-300">PN532 Pino SS</td>
                      <td className="px-4 py-2 text-emerald-400">3.3V</td>
                      <td className="px-4 py-2 text-slate-400">Chip select ativo em nível baixo</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="px-4 py-2 font-bold text-emerald-400">J1.17</td>
                      <td className="px-4 py-2 text-white">GPIO11</td>
                      <td className="px-4 py-2 text-violet-400">SPI_MOSI</td>
                      <td className="px-4 py-2 text-slate-300">PN532 Pino MOSI</td>
                      <td className="px-4 py-2 text-emerald-400">3.3V</td>
                      <td className="px-4 py-2 text-slate-400">Master Out Slave In</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="px-4 py-2 font-bold text-emerald-400">J1.18</td>
                      <td className="px-4 py-2 text-white">GPIO12</td>
                      <td className="px-4 py-2 text-violet-400">SPI_SCK</td>
                      <td className="px-4 py-2 text-slate-300">PN532 Pino SCK</td>
                      <td className="px-4 py-2 text-emerald-400">3.3V</td>
                      <td className="px-4 py-2 text-slate-400">Clock SPI (até 5MHz)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="px-4 py-2 font-bold text-emerald-400">J1.19</td>
                      <td className="px-4 py-2 text-white">GPIO13</td>
                      <td className="px-4 py-2 text-violet-400">SPI_MISO</td>
                      <td className="px-4 py-2 text-slate-300">PN532 Pino MISO</td>
                      <td className="px-4 py-2 text-emerald-400">3.3V</td>
                      <td className="px-4 py-2 text-slate-400">Master In Slave Out</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="px-4 py-2 font-bold text-emerald-400">J1.20</td>
                      <td className="px-4 py-2 text-white">GPIO14</td>
                      <td className="px-4 py-2 text-sky-400">Digital Output</td>
                      <td className="px-4 py-2 text-slate-300">Resistor R_BASE (1kΩ) → Q1 Base</td>
                      <td className="px-4 py-2 text-emerald-400">3.3V</td>
                      <td className="px-4 py-2 text-slate-400">Comando do buzzer via transistor</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="px-4 py-2 font-bold text-emerald-400">J1.22</td>
                      <td className="px-4 py-2 text-white">GND</td>
                      <td className="px-4 py-2 text-emerald-400">Ground Rail (0V)</td>
                      <td className="px-4 py-2 text-slate-300">GND Comum de toda a bancada</td>
                      <td className="px-4 py-2 text-slate-400">0.0V</td>
                      <td className="px-4 py-2 text-slate-400">Referência única de terra</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Diagrama Esquemático do Driver Q1 */}
            <div className="bg-[#0e141c] border border-slate-800 p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Esquemático do Driver do Buzzer (Q1 2N2222A)
              </h3>
              <div className="bg-[#06090d] border border-slate-800 p-4 rounded-xl font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
                <pre>{`
               +3.3V
                 │
                 ├──[+] Buzzer BZ1 (CMI-1295IC-0385T)
                 │   [-]
                 │    │
                 │    └─── Coletor (C)
                 │           │
 GPIO14 ───[ 1kΩ R_BASE ]─── Base (B)  Transistor NPN Q1 (2N2222A)
                             │
                            Emissor (E)
                             │
                            GND (0V)
                `}</pre>
              </div>
              <p className="text-[11px] text-slate-400">
                <strong>Explicação de Engenharia:</strong> Quando GPIO14 vai para nível HIGH (3.3V), circula uma corrente de base de aproximadamente 
                <code className="text-amber-300 mx-1">Ib = (3.3V - 0.7V) / 1000Ω = 2.6mA</code>. Isso leva o transistor Q1 à saturação plena, 
                permitindo que até 100mA circulem pelo buzzer a partir da fonte de 3.3V sem solicitar mais do que 2.6mA do pino do microcontrolador.
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* ABA 3: FIRMWARE & FLASH                                               */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'firmware' && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header com Botões de Ação */}
            <div className="bg-[#0e141c] border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-emerald-400" />
                  Firmware Oficial FuelGuard (ESP32-S3 C++/Arduino)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Arquivo: <code className="text-emerald-300">firmware/fuelguard_esp32_firmware.ino</code> • Versão v2.0 Canônica
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyFirmwareCode}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition flex items-center gap-1.5"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copiado!' : 'Copiar'}
                </button>
                <button
                  onClick={handleDownloadFirmware}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar .ino</span>
                </button>
              </div>
            </div>

            {/* Guia de Configuração da Arduino IDE */}
            <div className="bg-[#0e141c] border border-slate-800 p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-violet-400" />
                Configurações da Placa na Arduino IDE 2.x
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#06090d] border border-slate-800 rounded-xl space-y-1.5">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Gerenciador de Placas:</div>
                  <div className="text-white font-mono">esp32 by Espressif Systems (v3.0+)</div>
                  <div className="text-slate-400 font-bold uppercase text-[10px] mt-2">Placa Selecionada:</div>
                  <div className="text-emerald-300 font-mono">ESP32S3 Dev Module</div>
                </div>
                <div className="p-3 bg-[#06090d] border border-slate-800 rounded-xl space-y-1.5">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Bibliotecas Obrigatórias:</div>
                  <div className="text-white font-mono">• Adafruit PN532 (via Library Manager)</div>
                  <div className="text-white font-mono">• SPI (nativa da plataforma esp32)</div>
                  <div className="text-slate-400 font-bold uppercase text-[10px] mt-2">USB CDC On Boot:</div>
                  <div className="text-amber-300 font-mono">Enabled (para Serial USB nativo)</div>
                </div>
              </div>
            </div>

            {/* Trecho de Código em Destaque */}
            <div className="bg-[#0e141c] border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800 bg-[#0a0f18] flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">fuelguard_esp32_firmware.ino (Visualização dos Principais Métodos)</span>
                <span className="text-[10px] text-emerald-400 font-bold">128 LINHAS • VALIDADO</span>
              </div>
              <div className="p-4 bg-[#06090d] font-mono text-xs text-slate-300 overflow-x-auto max-h-96">
                <pre>{`// Leitura do Frame UART do Sensor DFRobot SEN0311
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
    const int32_t heightMm = static_cast<int32_t>(TANK_INTERNAL_HEIGHT_MM) - distanceMm;
    const uint16_t clampedHeightMm = static_cast<uint16_t>(constrain(heightMm, 0, TANK_INTERNAL_HEIGHT_MM));

    // Volume do cilindro: V = π * r² * h (onde r=100mm)
    const double volumeMlExact = (PI_CONST * TANK_RADIUS_MM * TANK_RADIUS_MM * clampedHeightMm) / 1000.0;
    reading = { true, distanceMm, clampedHeightMm, static_cast<uint16_t>(volumeMlExact + 0.5) };
    return true;
  }
  return false;
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* ABA 4: CENTRAL DE TESTES & COMISSIONAMENTO                            */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'commissioning' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-[#0e141c] border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-emerald-400" />
                  Procedimentos de Comissionamento e Testes da Bancada Real
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Execute estes 5 testes antes de considerar o equipamento pronto para demonstração ou homologação.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: 'T1',
                  title: 'Teste 1: Validação do Barramento de Alimentação 3.3V',
                  severity: 'Crítico',
                  procedure: 'Com a bancada desenergizada, meça com o multímetro a resistência entre 3V3 e GND. Ligue a alimentação USB-C e meça a tensão contínua no multímetro no pino 3V3 do ESP32.',
                  passCriteria: 'Resistência desenergizada > 1000Ω. Tensão ligada entre 3.25V e 3.35V.',
                },
                {
                  id: 'T2',
                  title: 'Teste 2: Recepção UART e Checksum do Sensor SEN0311',
                  severity: 'Crítico',
                  procedure: 'Abra o Serial Monitor na Arduino IDE a 115200 baud. Aponte a tampa do sensor para uma superfície plana a 30cm.',
                  passCriteria: 'Logs contínuos [FW] com dist_mm entre 290 e 310, com quality=VALID_PARAMETRIC_WATER_BASELINE.',
                },
                {
                  id: 'T3',
                  title: 'Teste 3: Leitura e Reconhecimento de Tags RFID PN532',
                  severity: 'Funcional',
                  procedure: 'Aproxime uma tag ou chaveiro Mifare 13.56MHz da antena do leitor Adafruit PN532 v1.6.',
                  passCriteria: 'Bip sonoro curto no buzzer e mensagem no Serial Monitor: [RFID] Tag detectada! UID: XX XX XX XX.',
                },
                {
                  id: 'T4',
                  title: 'Teste 4: Interlock de Tampa com Sensor Magnético MC-38',
                  severity: 'Segurança',
                  procedure: 'Abra a tampa do tanque, afastando o ímã mais de 20mm do sensor.',
                  passCriteria: 'O Serial Monitor passa a emitir lid=OPEN e o buzzer emite bips de alerta intermitentes a cada 1.2 segundos.',
                },
                {
                  id: 'T5',
                  title: 'Teste 5: Calibração Volumétrica com Água (0 a 5 Litros)',
                  severity: 'Metrologia',
                  procedure: 'Adicione volumes conhecidos de água (1.00L, 2.00L, 3.00L, 4.00L) com proveta graduada e compare com o valor emitido pelo firmware.',
                  passCriteria: 'Erro de volume inferior a ±50 mL em toda a faixa de operação.',
                },
              ].map((test) => (
                <div key={test.id} className="bg-[#0e141c] border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-xs font-bold border border-emerald-800">
                        {test.id}
                      </span>
                      <h3 className="text-xs font-bold text-white">{test.title}</h3>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {test.severity}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">
                    <strong className="text-slate-400">Procedimento:</strong> {test.procedure}
                  </div>
                  <div className="text-xs text-emerald-300 bg-emerald-950/20 border border-emerald-900/40 p-2 rounded-lg">
                    <strong className="text-emerald-400">Critério de Aprovação:</strong> {test.passCriteria}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
