/*
 * FuelGuard — firmware de bancada real
 *
 * Baseline elétrica:
 *   U1 ESP32-S3-DevKitC-1-N8R8 v1.1
 *   SEN1 DFRobot A02YYUW / SEN0311 alimentado em 3,3 V
 *   SEN1 TX -> GPIO16, UART TTL 9600 8N1
 *   SEN1 RX -> 3,3 V (modo processado; não é dirigido pelo ESP32)
 *   RFID1 ELECHOUSE PN532 V4 via SPI: CS=10, MOSI=11, SCK=12, MISO=13
 *   SW1 MC-38 -> GPIO7 com INPUT_PULLUP
 *   D1 WP7113GD -> GPIO4 através de R3 220 ohms
 *   BZ1 Same Sky CMI-1295IC-0385T -> GPIO14; confirmar corrente/polaridade
 *
 * Este firmware mede somente água na bancada. Não é firmware automotivo,
 * não controla combustível e não substitui validação elétrica da unidade.
 */

#include <Arduino.h>
#include <SPI.h>

static constexpr uint8_t PIN_LED_READY = 4;
static constexpr uint8_t PIN_LID_REED = 7;
static constexpr uint8_t PIN_PN532_CS = 10;
static constexpr uint8_t PIN_PN532_MOSI = 11;
static constexpr uint8_t PIN_PN532_SCK = 12;
static constexpr uint8_t PIN_PN532_MISO = 13;
static constexpr uint8_t PIN_BUZZER_ACTIVE = 14;
static constexpr uint8_t PIN_LEVEL_UART_RX = 16;

static constexpr uint16_t TANK_INTERNAL_WIDTH_MM = 200;
static constexpr uint16_t TANK_INTERNAL_LENGTH_MM = 200;
static constexpr uint16_t TANK_INTERNAL_HEIGHT_MM = 160;
static constexpr uint16_t SENSOR_BLIND_ZONE_MM = 30;
static constexpr uint16_t OPERATIONAL_MIN_VOLUME_ML = 1000;
static constexpr uint16_t OPERATIONAL_MAX_VOLUME_ML = 5000;

HardwareSerial LevelSerial(1);

struct LevelReading {
  bool valid;
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

    const uint8_t header = static_cast<uint8_t>(LevelSerial.read());
    const uint8_t dataHigh = static_cast<uint8_t>(LevelSerial.read());
    const uint8_t dataLow = static_cast<uint8_t>(LevelSerial.read());
    const uint8_t checksum = static_cast<uint8_t>(LevelSerial.read());
    if (static_cast<uint8_t>(header + dataHigh + dataLow) != checksum) continue;

    const uint16_t distanceMm = (static_cast<uint16_t>(dataHigh) << 8) | dataLow;
    if (distanceMm < SENSOR_BLIND_ZONE_MM || distanceMm > 4500) continue;

    const int32_t heightMm = static_cast<int32_t>(TANK_INTERNAL_HEIGHT_MM) - distanceMm;
    const uint16_t clampedHeightMm = static_cast<uint16_t>(constrain(heightMm, 0, TANK_INTERNAL_HEIGHT_MM));
    const uint32_t volumeMl = (static_cast<uint32_t>(TANK_INTERNAL_WIDTH_MM) * TANK_INTERNAL_LENGTH_MM * clampedHeightMm) / 1000;

    reading = { true, distanceMm, clampedHeightMm, static_cast<uint16_t>(min<uint32_t>(volumeMl, 6400)) };
    return true;
  }
  return false;
}

static const char *qualityFor(const LevelReading &reading) {
  if (!reading.valid) return "TIMEOUT_OR_BAD_CHECKSUM";
  if (reading.volumeMl < OPERATIONAL_MIN_VOLUME_ML || reading.volumeMl > OPERATIONAL_MAX_VOLUME_ML) return "OUTSIDE_OPERATIONAL_1_TO_5L";
  return "VALID_PARAMETRIC_WATER_BASELINE";
}

void setup() {
  Serial.begin(115200);
  delay(150);

  pinMode(PIN_LED_READY, OUTPUT);
  pinMode(PIN_LID_REED, INPUT_PULLUP);
  pinMode(PIN_BUZZER_ACTIVE, OUTPUT);
  digitalWrite(PIN_LED_READY, LOW);
  digitalWrite(PIN_BUZZER_ACTIVE, LOW);

  SPI.begin(PIN_PN532_SCK, PIN_PN532_MISO, PIN_PN532_MOSI, PIN_PN532_CS);
  pinMode(PIN_PN532_CS, OUTPUT);
  digitalWrite(PIN_PN532_CS, HIGH);

  // O pino RX do SEN0311 fica fisicamente em 3,3 V para selecionar o valor processado.
  // A saída TX chega ao GPIO16; não dirigimos o RX do sensor pelo firmware.
  LevelSerial.begin(9600, SERIAL_8N1, PIN_LEVEL_UART_RX, -1);

  digitalWrite(PIN_LED_READY, HIGH);
  Serial.println(F("[FW] FuelGuard real bench baseline iniciada"));
  Serial.println(F("[FW] SEN0311 UART=9600 8N1 TX->GPIO16 RX_MODE=HIGH"));
  Serial.println(F("[FW] PN532 V4 SPI CS=10 MOSI=11 SCK=12 MISO=13"));
  Serial.println(F("[FW] Tanque FG-TANK-6L-R1: interno 200x200x160 mm; operacao 1-5 L"));
}

void loop() {
  static uint32_t lastReportMs = 0;
  static uint32_t lastBeepMs = 0;
  static LevelReading lastReading = { false, 0, 0, 0 };

  LevelReading current;
  if (readSen0311Frame(current)) lastReading = current;

  const bool lidClosed = digitalRead(PIN_LID_REED) == LOW;
  if (!lidClosed && millis() - lastBeepMs > 1000) {
    digitalWrite(PIN_BUZZER_ACTIVE, HIGH);
    delay(40);
    digitalWrite(PIN_BUZZER_ACTIVE, LOW);
    lastBeepMs = millis();
  }

  if (millis() - lastReportMs >= 500) {
    lastReportMs = millis();
    Serial.printf("[FW] SEN0311 dist_mm=%u height_mm=%u volume_ml=%u quality=%s lid=%s\r\n", lastReading.distanceMm, lastReading.waterHeightMm, lastReading.volumeMl, qualityFor(lastReading), lidClosed ? "CLOSED" : "OPEN");
  }
}
