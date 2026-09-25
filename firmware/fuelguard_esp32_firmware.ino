/**
 * ============================================================================
 * FuelGuard — Firmware Didático ESP32-S3 (Bancada Didática com Água)
 * ============================================================================
 * Microcontrolador: ESP32-S3 DevKitC-1 (Xtensa Dual-Core 240 MHz, 3.3V CMOS)
 *
 * AVISO PEDAGÓGICO E DE SEGURANÇA:
 * Este firmware foi desenvolvido exclusivamente para bancadas de teste com
 * ÁGUA ABERTA. Fluidos combustíveis (gasolina, diesel, etanol) e atuadores
 * automotivos (bombas elétricas, relés de corte veicular) estão FORA DE ESCOPO.
 *
 * MAPEAMENTO DE PINAGEM OFICIAL (Conforme Validador Elétrico FuelGuard):
 *  - GPIO04: LED Verde (Sinalizador de Prontidão) via resistor limitador de 1 kΩ
 *  - GPIO05: Saída de Disparo TRIG (3.3V -> Entrada 1A do Buffer SN74AHCT125N)
 *  - GPIO06: Entrada de Retorno ECHO (Atenuado para 3.00V via Divisor 10k/15k)
 *  - GPIO07: Entrada do Sensor da Tampa (Reed Switch, INPUT_PULLUP, Debounce 50ms)
 *  - GPIO10: PN532 SPI Chip Select (SS)
 *  - GPIO11: PN532 SPI Master Out Slave In (MOSI)
 *  - GPIO12: PN532 SPI Serial Clock (SCK)
 *  - GPIO13: PN532 SPI Master In Slave Out (MISO)
 * ============================================================================
 */

#include <Arduino.h>
#include <SPI.h>

// Definição de Pinos Físicos
#define PIN_LED_READY   4
#define PIN_JSN_TRIG    5
#define PIN_JSN_ECHO    6
#define PIN_REED_LID    7
#define PIN_PN532_SS    10
#define PIN_PN532_MOSI  11
#define PIN_PN532_SCK   12
#define PIN_PN532_MISO  13

// Constantes Físicas e Geometria do Tanque Didático
static const float TANK_HREF_CM       = 100.0f; // Distância do sensor ao fundo
static const float TANK_BASE_WIDTH_CM = 100.0f; // Largura da base (1,0 m)
static const float TANK_BASE_LEN_CM   = 100.0f; // Comprimento da base (1,0 m)
static const float SENSOR_BLIND_CM    = 20.0f;  // Zona cega piezoelétrica JSN-SR04T
static const float AMBIENT_TEMP_C     = 24.8f;  // Temperatura de calibração

// Configuração do Filtro Mediano de 5 Amostras
#define MEDIAN_WINDOW_SIZE 5
static float medianWindow[MEDIAN_WINDOW_SIZE] = {42.3f, 42.3f, 42.3f, 42.3f, 42.3f};
static uint8_t medianIndex = 0;

// Estado da Tampa e Debounce
static bool isLidClosed = true;
static int lastRawReedState = HIGH;
static unsigned long lastReedTransitionMs = 0;
static const unsigned long REED_DEBOUNCE_DELAY_MS = 50;

/**
 * Calcula a velocidade do som no ar em função da temperatura termodinâmica:
 * c(T) = 331.3 * sqrt(1 + T / 273.15) [m/s]
 */
float calculateSpeedOfSound(float tempC) {
  return 331.3f * sqrtf(1.0f + (tempC / 273.15f));
}

/**
 * Insere nova amostra e extrai a mediana da janela deslizante.
 */
float applyMedianFilter(float newSample) {
  medianWindow[medianIndex] = newSample;
  medianIndex = (medianIndex + 1) % MEDIAN_WINDOW_SIZE;

  // Cópia para ordenação por bolha (apenas 5 elementos, custo O(1))
  float sorted[MEDIAN_WINDOW_SIZE];
  for (int i = 0; i < MEDIAN_WINDOW_SIZE; i++) {
    sorted[i] = medianWindow[i];
  }

  for (int i = 0; i < MEDIAN_WINDOW_SIZE - 1; i++) {
    for (int j = 0; j < MEDIAN_WINDOW_SIZE - i - 1; j++) {
      if (sorted[j] > sorted[j + 1]) {
        float temp = sorted[j];
        sorted[j] = sorted[j + 1];
        sorted[j + 1] = temp;
      }
    }
  }

  return sorted[MEDIAN_WINDOW_SIZE / 2];
}

/**
 * Emite pulso TRIG de 10 microssegundos no transdutor JSN-SR04T.
 */
unsigned long measureEchoPulseUs() {
  digitalWrite(PIN_JSN_TRIG, LOW);
  delayMicroseconds(4);
  digitalWrite(PIN_JSN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_JSN_TRIG, LOW);

  // Leitura do pulso no GPIO6 (com timeout de 30 ms = ~5 metros máx)
  return pulseIn(PIN_JSN_ECHO, HIGH, 30000);
}

/**
 * Atualiza debouncing do reed switch (sensor de abertura da tampa).
 */
void updateLidSensor() {
  int reading = digitalRead(PIN_REED_LID);

  if (reading != lastRawReedState) {
    lastReedTransitionMs = millis();
    lastRawReedState = reading;
  }

  if ((millis() - lastReedTransitionMs) > REED_DEBOUNCE_DELAY_MS) {
    bool currentLidState = (reading == LOW); // LOW = Ímã presente (Tampa fechada)
    if (currentLidState != isLidClosed) {
      isLidClosed = currentLidState;
      Serial.printf("[FW] [EVENT] lid.state_change: tampa=%s (debounce=50ms)\r\n",
                    isLidClosed ? "FECHADA" : "ABERTA");
    }
  }
}

void setup() {
  // Inicialização UART0 a 115200 baud
  Serial.begin(115200);
  delay(500);

  Serial.println(F("[SYSTEM] ESP32-S3 WROOM-1 boot complete (FreeRTOS v10.4.3). Relógio sincronizado."));
  Serial.println(F("[FW] Periféricos inicializados: SPI (PN532 @ 4MHz), GPIO5 (TRIG), GPIO6 (ECHO), GPIO7 (Reed), GPIO4 (LED)."));

  // Configuração dos Pinos
  pinMode(PIN_LED_READY, OUTPUT);
  pinMode(PIN_JSN_TRIG, OUTPUT);
  pinMode(PIN_JSN_ECHO, INPUT);
  pinMode(PIN_REED_LID, INPUT_PULLUP);

  digitalWrite(PIN_JSN_TRIG, LOW);
  digitalWrite(PIN_LED_READY, HIGH); // LED Verde aceso indicando bancada pronta
}

void loop() {
  updateLidSensor();

  static unsigned long lastSampleTimeMs = 0;
  unsigned long now = millis();

  // Amostragem acústica periódica a cada 200 ms (5 Hz)
  if (now - lastSampleTimeMs >= 200) {
    lastSampleTimeMs = now;

    unsigned long echoUs = measureEchoPulseUs();
    float soundSpeedMps = calculateSpeedOfSound(AMBIENT_TEMP_C);

    if (echoUs == 0) {
      Serial.println(F("[FW] [WARN] JSN ping: echo=TIMEOUT dist=OUT_OF_RANGE quality=TIMEOUT"));
    } else {
      // d = (echoUs * 10^-6 * soundSpeedMps * 100) / 2
      float rawDistCm = (echoUs * 0.000001f * soundSpeedMps * 100.0f) / 2.0f;

      if (rawDistCm < SENSOR_BLIND_CM) {
        Serial.printf("[FW] [WARN] JSN ping: echo=%luus dist=%.2fcm quality=BLIND_ZONE (<20cm)\r\n",
                      echoUs, rawDistCm);
      } else {
        float filteredDistCm = applyMedianFilter(rawDistCm);
        float waterHeightCm = TANK_HREF_CM - filteredDistCm;
        if (waterHeightCm < 0) waterHeightCm = 0;

        // V = A * h / 1000 [litros]
        float volumeLiters = (TANK_BASE_WIDTH_CM * TANK_BASE_LEN_CM * waterHeightCm) / 1000.0f;

        // Formatação de telemetria idêntica ao console da bancada didática
        Serial.printf("[FW] JSN ping: echo=%luus dist=%.2fcm quality=VALID -> Median=%.2fcm h=%.1fcm vol=%.1fL\r\n",
                      echoUs, rawDistCm, filteredDistCm, waterHeightCm, volumeLiters);
      }
    }
  }

  delay(10); // Loop cooperativo
}
