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
 * FuelGuard — Firmware de Bancada ESP32-S3 (FG-TANK-5L-CYL-R1 com água)
 * Microcontrolador: ESP32-S3 DevKitC-1 (Xtensa Dual-Core 240 MHz, 3.3V CMOS)
 */
#include <Arduino.h>

#define PIN_LED_READY   4
#define PIN_LEVEL_RX    16
#define PIN_LEVEL_MODE  17
#define PIN_BUZZER      14
#define PIN_REED_LID    7

static const float TANK_HREF_CM = 16.0f;
static const float TANK_BASE_M2 = 0.04f;
static const float SENSOR_BLIND_CM = 3.0f;

float calculateSpeedOfSound(float tempC) {
  return 331.3f * sqrtf(1.0f + (tempC / 273.15f));
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED_READY, OUTPUT);
  Serial1.begin(9600, SERIAL_8N1, PIN_LEVEL_RX, -1);
  pinMode(PIN_LEVEL_MODE, OUTPUT);
  digitalWrite(PIN_LEVEL_MODE, HIGH); // saída processada do SEN0311
  pinMode(PIN_REED_LID, INPUT_PULLUP);
  pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_LED_READY, HIGH);
  Serial.println("[SYSTEM] ESP32-S3 FuelGuard inicializado.");
}

void loop() {
  if (Serial1.available() >= 4 && Serial1.read() == 0xFF) {
    const uint8_t high = Serial1.read();
    const uint8_t low = Serial1.read();
    const uint8_t checksum = Serial1.read();
    if ((uint8_t)(0xFF + high + low) == checksum) {
      const float distCm = ((high << 8) | low) / 10.0f;
      const float waterHeightCm = constrain(TANK_HREF_CM - distCm / 10.0f, 0.0f, TANK_HREF_CM);
      const float volumeL = TANK_BASE_M2 * (waterHeightCm / 100.0f) * 1000.0f;
      Serial.printf("[FW] SEN0311 UART dist=%.1fmm h=%.1fcm vol=%.2fL\\r\\n", distCm * 10.0f, waterHeightCm, volumeL);
    }
  }
  delay(200);
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
    <div className="flex flex-col h-full bg-inst-canvas text-inst-primary font-ui overflow-y-auto p-6 space-y-6">
      {/* Topo */}
      <div className="bg-inst-surface border border-inst-border p-4 rounded-md shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <BookOpenCheck className="w-5 h-5 text-sky-500" />
            <h1 className="text-sm font-display font-bold uppercase tracking-wider text-inst-primary">
              Roteiro & Checklist de Transição para Bancada Física
            </h1>
            <HonestyBadge level="requer_hardware" />
          </div>
          <p className="text-xs text-inst-secondary mt-1 max-w-3xl">
            Orientações de montagem mecatrônica real, medições prévias obrigatórias e firmware para o ESP32-S3 físico. A emulação é apenas auxiliar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadFirmwareIno}
            className="px-3 py-1.5 rounded-xs bg-inst-surface border border-inst-border text-inst-primary text-xs font-mono font-medium hover:bg-inst-subtle flex items-center gap-1.5 transition shadow-xs"
            title="Baixar sketch Arduino C++ oficial do firmware"
          >
            <FileCode className="w-3.5 h-3.5 text-fuelguard-green" />
            <span>firmware.ino (Arduino)</span>
          </button>
        </div>
      </div>

      {/* Grid: Checklist & Alertas Físicos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Lado Esquerdo: Checklist de Montagem Física (7 Colunas) */}
        <div className="lg:col-span-7 bg-inst-surface border border-inst-border rounded-md p-5 space-y-4 shadow-xs">
          <h2 className="text-xs font-display font-bold uppercase tracking-wider text-inst-primary flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-fuelguard-green" />
            Checklist de Segurança Antes de Ligar a Fonte USB
          </h2>

          <div className="space-y-3 text-xs">
            {/* Item 1 */}
            <div className="p-3 rounded-xs bg-inst-canvas border border-inst-border space-y-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-0.5 rounded-xs accent-fuelguard-green" />
                <div>
                <span className="font-bold text-inst-primary">1. Verificação da UART do SEN0311 antes de ligar</span>
                  <p className="text-[11px] text-inst-secondary mt-0.5">
                    Alimente o SEN0311 em 3,3 V, confirme 9600 8N1, RX/MODE em nível alto e TX conectado somente ao GPIO16. Não use TRIG/ECHO, divisor ou buffer legado.
                  </p>
                </div>
              </label>
            </div>

            {/* Item 2 */}
            <div className="p-3 rounded-xs bg-inst-canvas border border-inst-border space-y-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-0.5 rounded-xs accent-fuelguard-green" />
                <div>
                  <span className="font-bold text-inst-primary">2. Conexão Firme do Barramento Comum de Terra (GND)</span>
                  <p className="text-[11px] text-inst-secondary mt-0.5">
                    Certifique-se de que o GND da fonte 5V externa, do ESP32-S3 e de todos os sensores estejam unidos no mesmo trilho da protoboard.
                  </p>
                </div>
              </label>
            </div>

            {/* Item 3 */}
            <div className="p-3 rounded-xs bg-inst-canvas border border-inst-border space-y-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-0.5 rounded-xs accent-fuelguard-green" />
                <div>
                  <span className="font-bold text-inst-primary">3. Conferência de Part-Number e Chaves do PN532</span>
                  <p className="text-[11px] text-inst-secondary mt-0.5">
                    Configure os mini-switches do módulo PN532 para o modo SPI documentado no datasheet (em vez de I2C ou HSU UART).
                  </p>
                </div>
              </label>
            </div>

            {/* Item 4 */}
            <div className="p-3 rounded-xs bg-inst-canvas border border-inst-border space-y-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-0.5 rounded-xs accent-fuelguard-green" />
                <div>
                  <span className="font-bold text-inst-primary">4. Alívio de Tensão Mecânica e Proteção contra Gotejamento</span>
                  <p className="text-[11px] text-inst-secondary mt-0.5">
                    A eletrônica deve permanecer sobre superfície seca. Mantenha os cabos do transdutor com laço de gotejamento (*drip loop*) para que respingos d'água não alcancem a protoboard.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Limites da validação virtual */}
          <div className="p-4 rounded-xs bg-sky-950/20 border border-sky-800/40 space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-sky-400 flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                Limites da validação virtual
              </h3>
              <span className="text-[10px] font-mono text-sky-400 flex items-center gap-1">
                <span>Priorizar ensaio físico</span>
              </span>
            </div>
            <ol className="list-decimal list-inside text-xs text-inst-secondary space-y-1">
              <li>O viewer e os testes verificam contratos de software, não o comportamento elétrico da unidade comprada.</li>
              <li>Não usar um modelo genérico de ultrassom como substituto do A02YYUW/SEN0311 real.</li>
              <li>Grave <code className="text-sky-300">firmware/fuelguard_esp32_firmware.ino</code> apenas depois do checklist elétrico.</li>
              <li>Registre fotos, medições e resultados no repositório antes de liberar a PCB.</li>
            </ol>
          </div>
        </div>

        {/* Lado Direito: Limitações do Modelo Virtual (5 Colunas) */}
        <div className="lg:col-span-5 bg-inst-surface border border-inst-border rounded-md p-5 space-y-4 shadow-xs">
          <h2 className="text-xs font-display font-bold uppercase tracking-wider text-rose-500 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Limitações do Modelo Virtual (O Que a Simulação NÃO Pode Provar)
          </h2>

          <p className="text-xs text-inst-secondary">
            Fenômenos físicos que <strong>exigem validação obrigatória</strong> na bancada real com proveta e osciloscópio:
          </p>

          <ul className="space-y-2 text-xs">
            <li className="p-2.5 rounded-xs bg-rose-950/20 border border-rose-900/40 space-y-0.5">
              <strong className="text-rose-400 block font-mono">Reflexão em Paredes Laterais:</strong>
              <p className="text-inst-secondary">
                O cone de detecção documentado do SEN0311 e a posição central devem ser validados no tanque cilíndrico Ø200 mm; não liberar o suporte apenas pelo render.
              </p>
            </li>

            <li className="p-2.5 rounded-xs bg-rose-950/20 border border-rose-900/40 space-y-0.5">
              <strong className="text-rose-400 block font-mono">Espuma e Menisco de Superfície:</strong>
              <p className="text-inst-secondary">
                Líquidos com bolhas de ar dispersam a onda de 40 kHz, causando perda transitória de eco (timeout) que a simulação geométrica pura não replica.
              </p>
            </li>

            <li className="p-2.5 rounded-xs bg-rose-950/20 border border-rose-900/40 space-y-0.5">
              <strong className="text-rose-400 block font-mono">Ruído de Chaveamento da Fonte:</strong>
              <p className="text-inst-secondary">
                Picos de consumo de até 350 mA no rádio do ESP32 podem induzir ruído na linha analógica do transdutor sem desacoplamento adequado (capacitor de 100 nF).
              </p>
            </li>
          </ul>

          <div className="p-3 rounded-xs bg-inst-subtle border border-inst-border text-[11px] font-mono text-inst-secondary flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              Selo Didático:
            </span>
            <span className="text-amber-500 font-bold">ÁGUA ABERTA DIDÁTICA</span>
          </div>
        </div>
      </div>
    </div>
  );
};
