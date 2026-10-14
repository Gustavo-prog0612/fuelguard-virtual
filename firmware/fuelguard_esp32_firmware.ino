/*
 * FuelGuard — Firmware Oficial de Bancada Real (ESP32-S3)
 * Repositório: https://github.com/Gustavo-prog0612/fuelguard-virtual.git
 * 
 * Hardware Canônico:
 *   - Microcontrolador: ESP32-S3 DevKitC-1-N8R8 v1.1 (Dual-Core Xtensa 240MHz, 3.3V CMOS)
 *   - Sensor de Nível: DFRobot SEN0311 / A02YYUW (IP67, UART 9600 8N1)
 *       * Pino 1 VCC -> 3.3V
 *       * Pino 2 GND -> GND
 *       * Pino 3 RX/MODE -> 3.3V (Fixo em nível alto para modo processado contínuo)
 *       * Pino 4 TX -> GPIO16 (ESP32 UART1 RX)
 *   - Leitor RFID/NFC: ELECHOUSE PN532 V4 (Interface SPI 4 fios, DIP: CH1=OFF, CH2=ON)
 *       * SCK  -> GPIO12
 *       * MISO -> GPIO13
 *       * MOSI -> GPIO11
 *       * SS   -> GPIO10
 *       * VCC  -> 3.3V, GND -> GND
 *   - Sensor de Tampa: MC-38 Reed Switch NO (Normalmente Aberto com ímã)
 *       * Sinal -> GPIO7 (com INPUT_PULLUP interno ativado)
 *       * Retorno -> GND
 *   - LED Indicador: Kingbright WP7113GD verde 5mm
 *       * Anodo -> Resistor R3 (220Ω) -> GPIO4
 *       * Catodo -> GND
 *   - Buzzer Ativo: Same Sky CMI-1295IC-0385T (30mA máx.)
 *       * NOTA DE PROTEÇÃO: Acionado via Transistor NPN Q1 (2N2222A) para não exceder
 *         a corrente máxima do pino GPIO do ESP32-S3 (12mA máx. recomendado):
 *         GPIO14 -> R_BASE (1kΩ) -> Base de Q1
 *         Coletor de Q1 -> Terminal (-) do Buzzer
 *         Emissor de Q1 -> GND comum
 *         Terminal (+) do Buzzer -> +3.3V
 *   - Tanque Paramétrico: FG-TANK-5L-CYL-R1 (Cilindro acrílico Ø200mm x 160mm)
 *       * Equação de volume exata: V = π * r² * h (onde r = 100mm)
 */

#include <Arduino.h>
#include <SPI.h>
#include <Adafruit_PN532.h>

// ── Pinos Canônicos ──────────────────────────────────────────────────────────
static constexpr uint8_t PIN_LED_READY      = 4;
static constexpr uint8_t PIN_LID_REED       = 7;
static constexpr uint8_t PIN_PN532_CS       = 10;
static constexpr uint8_t PIN_PN532_MOSI     = 11;
static constexpr uint8_t PIN_PN532_SCK      = 12;
static constexpr uint8_t PIN_PN532_MISO     = 13;
static constexpr uint8_t PIN_BUZZER_ACTIVE  = 14;  // Dirige a Base de Q1 (2N2222A) via 1kΩ
static constexpr uint8_t PIN_LEVEL_UART_RX  = 16;  // RX da UART1 conectado ao TX do SEN0311

// ── Geometria do Tanque Cilíndrico FG-TANK-5L-CYL-R1 ─────────────────────────
static constexpr uint16_t TANK_INTERNAL_DIAMETER_MM = 200;
static constexpr uint16_t TANK_INTERNAL_HEIGHT_MM   = 160;
static constexpr uint16_t SENSOR_BLIND_ZONE_MM      = 30;
static constexpr uint16_t OPERATIONAL_MIN_VOLUME_ML = 1000;
static constexpr uint16_t OPERATIONAL_MAX_VOLUME_ML = 4084;
static constexpr double   TANK_RADIUS_MM            = 100.0;
static constexpr double   PI_CONST                  = 3.14159265358979323846;

// ── Objetos de Hardware ──────────────────────────────────────────────────────
HardwareSerial LevelSerial(1);
Adafruit_PN532 nfc(PIN_PN532_SCK, PIN_PN532_MISO, PIN_PN532_MOSI, PIN_PN532_CS);

// ── Estrutura de Leitura de Nível ────────────────────────────────────────────
struct LevelReading {
  bool     valid;
  uint16_t distanceMm;
  uint16_t waterHeightMm;
  uint16_t volumeMl;
};

// ── Leitura e Validação do Protocolo Binário do DFRobot SEN0311 ──────────────
// Frame de 4 bytes: 0xFF + Data_High + Data_Low + Checksum
static bool readSen0311Frame(LevelReading &reading) {
  reading = { false, 0, 0, 0 };
  while (LevelSerial.available() >= 4) {
    if (LevelSerial.peek() != 0xFF) {
      LevelSerial.read(); // Descarta byte de sincronia corrompido
      continue;
    }

    const uint8_t header   = static_cast<uint8_t>(LevelSerial.read());
    const uint8_t dataHigh = static_cast<uint8_t>(LevelSerial.read());
    const uint8_t dataLow  = static_cast<uint8_t>(LevelSerial.read());
    const uint8_t checksum = static_cast<uint8_t>(LevelSerial.read());

    // Verificação de Checksum: soma dos 3 primeiros bytes truncada em 8 bits
    if (static_cast<uint8_t>(header + dataHigh + dataLow) != checksum) {
      continue;
    }

    const uint16_t distanceMm = (static_cast<uint16_t>(dataHigh) << 8) | dataLow;
    if (distanceMm < SENSOR_BLIND_ZONE_MM || distanceMm > 4500) {
      continue;
    }

    // Altura da coluna d'água = Altura do tanque - distância do sensor
    const int32_t heightMm = static_cast<int32_t>(TANK_INTERNAL_HEIGHT_MM) - distanceMm;
    const uint16_t clampedHeightMm = static_cast<uint16_t>(constrain(heightMm, 0, TANK_INTERNAL_HEIGHT_MM));

    // Fórmula volumétrica para cilindro: V = π * r² * h (em mm³ / 1000 = mL)
    const double volumeMlExact = (PI_CONST * TANK_RADIUS_MM * TANK_RADIUS_MM * clampedHeightMm) / 1000.0;
    const uint32_t volumeMl = static_cast<uint32_t>(volumeMlExact + 0.5);

    reading = {
      true,
      distanceMm,
      clampedHeightMm,
      static_cast<uint16_t>(min<uint32_t>(volumeMl, 5026))
    };
    return true;
  }
  return false;
}

// ── Classificação de Qualidade da Medição ────────────────────────────────────
static const char *qualityFor(const LevelReading &reading) {
  if (!reading.valid) return "TIMEOUT_OR_BAD_CHECKSUM";
  if (reading.volumeMl < OPERATIONAL_MIN_VOLUME_ML || reading.volumeMl > OPERATIONAL_MAX_VOLUME_ML) {
    return "OUTSIDE_OPERATIONAL_1_TO_4L";
  }
  return "VALID_PARAMETRIC_WATER_BASELINE";
}

// ── Rotina de Inicialização ──────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(200);

  Serial.println(F("=================================================="));
  Serial.println(F("  FuelGuard — Central de Controle ESP32-S3"));
  Serial.println(F("  Firmware Canônico de Bancada Real v2.0"));
  Serial.println(F("=================================================="));

  // 1. Configuração dos GPIOs de sinal e controle
  pinMode(PIN_LED_READY, OUTPUT);
  pinMode(PIN_LID_REED, INPUT_PULLUP);
  pinMode(PIN_BUZZER_ACTIVE, OUTPUT);

  digitalWrite(PIN_LED_READY, LOW);
  digitalWrite(PIN_BUZZER_ACTIVE, LOW);

  // 2. Inicialização da UART1 para o sensor SEN0311 (RX no GPIO16)
  // O pino RX do sensor está fixo em +3.3V no hardware para modo processado.
  LevelSerial.begin(9600, SERIAL_8N1, PIN_LEVEL_UART_RX, -1);
  Serial.println(F("[INIT] UART1 SEN0311 iniciada a 9600 baud (RX=GPIO16)."));

  // 3. Inicialização do Leitor RFID PN532 via SPI
  nfc.begin();
  uint32_t versiondata = nfc.getFirmwareVersion();
  if (!versiondata) {
    Serial.println(F("[WARN] PN532 não detectado no barramento SPI. Verifique DIP (CH1=OFF, CH2=ON)."));
  } else {
    Serial.printf("[INIT] PN532 detectado! Chip: PN5%02X, Firmware rev: %d.%d\r\n",
                  (versiondata >> 24) & 0xFF,
                  (versiondata >> 16) & 0xFF,
                  (versiondata >> 8) & 0xFF);
    // Configura o módulo para ler tags ISO14443A (Mifare)
    nfc.SAMConfig();
    Serial.println(F("[INIT] PN532 configurado e pronto para leitura de tags Mifare."));
  }

  // 4. Sinalização de Inicialização Bem-Sucedida (Beep curto + LED ON)
  digitalWrite(PIN_BUZZER_ACTIVE, HIGH);
  delay(80);
  digitalWrite(PIN_BUZZER_ACTIVE, LOW);
  digitalWrite(PIN_LED_READY, HIGH);

  Serial.println(F("[STATUS] Sistema pronto e monitorando em tempo real."));
}

// ── Loop de Execução Contínua ────────────────────────────────────────────────
void loop() {
  static uint32_t lastReportMs = 0;
  static uint32_t lastBeepMs   = 0;
  static uint32_t lastRfidMs   = 0;
  static LevelReading lastReading = { false, 0, 0, 0 };

  // 1. Processa frames UART do sensor ultrassônico
  LevelReading current;
  if (readSen0311Frame(current)) {
    lastReading = current;
  }

  // 2. Monitora estado do sensor magnético de tampa (MC-38 NO)
  // Com o ímã alinhado (tampa fechada), o contato fecha para GND -> LOW
  const bool lidClosed = (digitalRead(PIN_LID_REED) == LOW);

  // Alarme sonoro intermitente caso a tampa seja aberta
  if (!lidClosed && (millis() - lastBeepMs > 1200)) {
    digitalWrite(PIN_BUZZER_ACTIVE, HIGH);
    delay(40);
    digitalWrite(PIN_BUZZER_ACTIVE, LOW);
    lastBeepMs = millis();
  }

  // 3. Varredura não bloqueante de tags RFID a cada 400ms
  if (millis() - lastRfidMs >= 400) {
    lastRfidMs = millis();
    uint8_t uid[7];
    uint8_t uidLength;
    // Timeout curto de 25ms para não travar a leitura do sensor
    if (nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLength, 25)) {
      digitalWrite(PIN_BUZZER_ACTIVE, HIGH);
      delay(30);
      digitalWrite(PIN_BUZZER_ACTIVE, LOW);

      Serial.print(F("[RFID] Tag detectada! UID: "));
      for (uint8_t i = 0; i < uidLength; i++) {
        Serial.printf("%02X ", uid[i]);
      }
      Serial.printf("(Tam: %d bytes)\r\n", uidLength);
    }
  }

  // 4. Emissão periódica de telemetria a cada 500ms
  if (millis() - lastReportMs >= 500) {
    lastReportMs = millis();
    Serial.printf("[FW] SEN0311 dist_mm=%u height_mm=%u volume_ml=%u quality=%s lid=%s\r\n",
                  lastReading.distanceMm,
                  lastReading.waterHeightMm,
                  lastReading.volumeMl,
                  qualityFor(lastReading),
                  lidClosed ? "CLOSED" : "OPEN");
  }
}
