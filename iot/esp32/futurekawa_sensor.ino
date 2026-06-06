/*
 * FutureKawa — Firmware capteur IoT
 *
 * Lit température + humidité et publie sur MQTT toutes les N secondes.
 * Topic  : futurekawa/mesure
 * Payload: {"warehouseId":"<uuid>","temperature":29.4,"humidity":54.8}
 *
 * Bibliothèques Arduino requises (Gestionnaire de bibliothèques) :
 *   - PubSubClient   (Nick O'Leary)     — client MQTT
 *   - DHT sensor library (Adafruit)     — si SENSOR_DHT22 ou SENSOR_DHT11
 *   - Adafruit SHT31 Library            — si SENSOR_SHT31
 *
 * Adaptations selon matériel reçu :
 *   1. Modifier config.h : SENSOR_*, SENSOR_PIN, WAREHOUSE_ID, MQTT_BROKER
 *   2. Si nouveau type de capteur → ajouter un bloc #ifdef et ses 2 fonctions
 *      readTemperature() / readHumidity() ci-dessous
 *   3. Recompiler et flasher — le reste du code ne change pas
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "config.h"

// ── Inclusion conditionnelle selon le capteur configuré ──────────────────────

#ifdef SENSOR_DHT22
  #include <DHT.h>
  DHT dht(SENSOR_PIN, DHT22);
#endif

#ifdef SENSOR_DHT11
  #include <DHT.h>
  DHT dht(SENSOR_PIN, DHT11);
#endif

#ifdef SENSOR_SHT31
  #include <Adafruit_SHT31.h>
  Adafruit_SHT31 sht31;
#endif

// ── Variables globales ────────────────────────────────────────────────────────

WiFiClient   wifiClient;
PubSubClient mqtt(wifiClient);
unsigned long lastMeasureAt = 0;

// ── Lecture capteur — adapter ici si nouveau matériel ────────────────────────

float readTemperature() {
#ifdef SENSOR_DHT22
  return dht.readTemperature();
#elif defined(SENSOR_DHT11)
  return dht.readTemperature();
#elif defined(SENSOR_SHT31)
  return sht31.readTemperature();
#elif defined(SENSOR_SIMULATION)
  // Valeur simulée : oscille autour de 29°C ±4°C
  return 29.0 + (random(-40, 40) / 10.0);
#else
  return NAN;
#endif
}

float readHumidity() {
#ifdef SENSOR_DHT22
  return dht.readHumidity();
#elif defined(SENSOR_DHT11)
  return dht.readHumidity();
#elif defined(SENSOR_SHT31)
  return sht31.readHumidity();
#elif defined(SENSOR_SIMULATION)
  // Valeur simulée : oscille autour de 55% ±5%
  return 55.0 + (random(-50, 50) / 10.0);
#else
  return NAN;
#endif
}

// ── WiFi ──────────────────────────────────────────────────────────────────────

void connectWifi() {
  Serial.printf("[WiFi] Connexion à %s", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\n[WiFi] Connecté — IP : %s\n", WiFi.localIP().toString().c_str());
}

// ── MQTT ──────────────────────────────────────────────────────────────────────

void connectMqtt() {
  while (!mqtt.connected()) {
    Serial.printf("[MQTT] Connexion à %s:%d...", MQTT_BROKER, MQTT_PORT);
    if (mqtt.connect(MQTT_CLIENT_ID)) {
      Serial.println(" OK");
    } else {
      Serial.printf(" Échec (état=%d) — retry dans 5s\n", mqtt.state());
      delay(5000);
    }
  }
}

void publishMeasure(float temperature, float humidity) {
  StaticJsonDocument<128> doc;
  doc["warehouseId"] = WAREHOUSE_ID;
  doc["temperature"] = serialized(String(temperature, 1));
  doc["humidity"]    = serialized(String(humidity, 1));

  char payload[128];
  serializeJson(doc, payload);

  bool ok = mqtt.publish(MQTT_TOPIC, payload, /*retain=*/false);
  Serial.printf("[MQTT] %s → %s  [%s]\n",
    MQTT_TOPIC, payload, ok ? "OK" : "ÉCHEC");
}

// ── Setup / Loop ──────────────────────────────────────────────────────────────

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n=== FutureKawa Sensor Boot ===");

#ifdef SENSOR_DHT22
  dht.begin();
  Serial.println("[Capteur] DHT22 initialisé");
#elif defined(SENSOR_DHT11)
  dht.begin();
  Serial.println("[Capteur] DHT11 initialisé");
#elif defined(SENSOR_SHT31)
  if (!sht31.begin(0x44)) {
    Serial.println("[Capteur] ERREUR : SHT31 non détecté sur I2C 0x44");
    while (1) delay(1000);
  }
  Serial.println("[Capteur] SHT31 initialisé");
#elif defined(SENSOR_SIMULATION)
  randomSeed(analogRead(0));
  Serial.println("[Capteur] Mode simulation activé");
#endif

  connectWifi();
  mqtt.setServer(MQTT_BROKER, MQTT_PORT);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) connectWifi();
  if (!mqtt.connected())             connectMqtt();
  mqtt.loop();

  unsigned long now = millis();
  if (now - lastMeasureAt >= MEASURE_INTERVAL_MS) {
    lastMeasureAt = now;

    float temp = readTemperature();
    float hum  = readHumidity();

    if (isnan(temp) || isnan(hum)) {
      Serial.println("[Capteur] Lecture invalide — message ignoré");
      return;
    }

    publishMeasure(temp, hum);
  }
}
