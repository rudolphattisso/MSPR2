// ============================================================
// FUTUREKAWA — Surveillance IoT température / humidité par entrepôt
// NodeMCU ESP8266 (OSOYOO) + DHT11 + LED verte (OK) + LED rouge (alerte)
// Publie les relevés sur un broker MQTT local, format JSON.
// ============================================================

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include "config.h"

// ---- Sélection du type de capteur (cf. config.h) -----------
#if defined(SENSOR_DHT11)
  #define DHT_TYPE DHT11
#elif defined(SENSOR_DHT22)
  #define DHT_TYPE DHT22
#endif

#if defined(SENSOR_DHT11) || defined(SENSOR_DHT22)
  DHT dht(SENSOR_PIN, DHT_TYPE);
#endif

WiFiClient   wifiClient;
PubSubClient mqtt(wifiClient);

// ---- Ordonnancement non-bloquant --------------------------
unsigned long lastMeasure = 0;
unsigned long lastBlink   = 0;
bool          alertState  = false;   // dernière mesure hors tolérance ?
bool          blinkOn     = false;   // état courant de la LED rouge

// ============================================================
// WiFi
// ============================================================

// [DEBUG] Traduit le code WiFi.status() en texte lisible
const char* wifiStatusStr(int s) {
  switch (s) {
    case WL_IDLE_STATUS:   return "IDLE (0)";
    case WL_NO_SSID_AVAIL: return "NO_SSID_AVAIL (1) — SSID introuvable";
    case WL_SCAN_COMPLETED:return "SCAN_COMPLETED (2)";
    case WL_CONNECTED:     return "CONNECTED (3)";
    case WL_CONNECT_FAILED:return "CONNECT_FAILED (4) — mot de passe refusé ?";
    case WL_CONNECTION_LOST:return "CONNECTION_LOST (5)";
    case WL_DISCONNECTED:  return "DISCONNECTED (6)";
    default:               return "INCONNU";
  }
}

// [DEBUG] Liste les réseaux 2,4 GHz vus par l'ESP8266
void scanWifi() {
  Serial.println("\n[DEBUG] Scan des réseaux WiFi...");
  int n = WiFi.scanNetworks();
  if (n == 0) {
    Serial.println("[DEBUG] Aucun réseau détecté !");
    return;
  }
  Serial.printf("[DEBUG] %d réseau(x) trouvé(s) :\n", n);
  bool cible = false;
  for (int i = 0; i < n; i++) {
    bool match = (WiFi.SSID(i) == WIFI_SSID);
    if (match) cible = true;
    Serial.printf("  %2d) %-24s  RSSI=%4d dBm  ch=%2d  %s%s\n",
      i + 1, WiFi.SSID(i).c_str(), WiFi.RSSI(i), WiFi.channel(i),
      (WiFi.encryptionType(i) == ENC_TYPE_NONE) ? "ouvert" : "protégé",
      match ? "  <== CIBLE" : "");
  }
  Serial.printf("[DEBUG] SSID cible \"%s\" %s\n\n",
    WIFI_SSID, cible ? "VISIBLE par l'ESP" : "INTROUVABLE (bande/canal ?)");
  WiFi.scanDelete();
}

void setupWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();          // repart d'un état propre
  delay(100);

  scanWifi();                 // [DEBUG] que voit réellement l'ESP ?

  Serial.printf("Connexion WiFi à %s\n", WIFI_SSID);
  while (WiFi.status() != WL_CONNECTED) {
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    unsigned long start = millis();
    // Tentative de 20 s max en affichant le code d'état
    while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
      delay(1000);
      Serial.printf("  ... status=%s\n", wifiStatusStr(WiFi.status()));
    }
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("[DEBUG] Timeout 20 s — nouveau scan + réessai");
      scanWifi();
    }
  }
  Serial.printf("\nConnecté, IP = %s\n", WiFi.localIP().toString().c_str());
}

// ============================================================
// MQTT — (re)connexion
// ============================================================
void reconnectMqtt() {
  while (!mqtt.connected()) {
    Serial.printf("Connexion MQTT à %s:%d ... ", MQTT_BROKER, MQTT_PORT);
    if (mqtt.connect(MQTT_CLIENT_ID)) {
      Serial.println("OK");
    } else {
      Serial.printf("échec (rc=%d), nouvel essai dans 2 s\n", mqtt.state());
      delay(2000);
    }
  }
}

// ============================================================
// Lecture capteur — renvoie true si lecture valide
// ============================================================
bool readSensor(float &temp, float &hum) {
#if defined(SENSOR_SIMULATION)
  // Bruite légèrement autour de la consigne pour tester la logique
  temp = TARGET_TEMP_C + random(-500, 500) / 100.0;
  hum  = TARGET_HUM_PCT + random(-400, 400) / 100.0;
  return true;
#else
  hum  = dht.readHumidity();
  temp = dht.readTemperature();
  if (isnan(hum) || isnan(temp)) {
    Serial.println("Erreur : lecture DHT invalide");
    return false;
  }
  return true;
#endif
}

// ============================================================
// Évaluation des seuils — true si DANS la tolérance
// ============================================================
bool isWithinTolerance(float temp, float hum) {
  bool tempOk = fabs(temp - TARGET_TEMP_C) <= TOLERANCE_TEMP_C;
  bool humOk  = fabs(hum  - TARGET_HUM_PCT) <= TOLERANCE_HUM_PCT;
  return tempOk && humOk;
}

// ============================================================
// Pilotage des LED d'état
// ============================================================
void applyStatusLeds(bool ok) {
  alertState = !ok;
  if (ok) {
    digitalWrite(LED_OK_PIN, HIGH);     // verte fixe
    digitalWrite(LED_ALERT_PIN, LOW);   // rouge éteinte
    blinkOn = false;
  } else {
    digitalWrite(LED_OK_PIN, LOW);      // verte éteinte
    // la rouge clignote dans updateBlink()
  }
}

// Clignotement non-bloquant de la LED rouge
void updateBlink() {
  if (!alertState) return;
  if (millis() - lastBlink >= LED_BLINK_MS) {
    lastBlink = millis();
    blinkOn = !blinkOn;
    digitalWrite(LED_ALERT_PIN, blinkOn ? HIGH : LOW);
  }
}

// ============================================================
// Publication MQTT (JSON)
// ============================================================
void publishMeasure(float temp, float hum, bool ok) {
  char payload[256];
  snprintf(payload, sizeof(payload),
    "{\"warehouseId\":\"%s\",\"client_id\":\"%s\","
    "\"temperature\":%.1f,\"humidity\":%.1f,\"within_tolerance\":%s}",
    WAREHOUSE_ID, MQTT_CLIENT_ID, temp, hum, ok ? "true" : "false");

  if (mqtt.publish(MQTT_TOPIC, payload)) {
    Serial.printf("Publié → %s : %s\n", MQTT_TOPIC, payload);
  } else {
    Serial.println("Erreur : publication MQTT échouée");
  }
}

// ============================================================
// setup
// ============================================================
void setup() {
  Serial.begin(115200);
  delay(100);

  pinMode(LED_OK_PIN, OUTPUT);
  pinMode(LED_ALERT_PIN, OUTPUT);
  digitalWrite(LED_OK_PIN, LOW);
  digitalWrite(LED_ALERT_PIN, LOW);

#if defined(SENSOR_DHT11) || defined(SENSOR_DHT22)
  dht.begin();
#endif
#if defined(SENSOR_SIMULATION)
  randomSeed(analogRead(A0));
#endif

  setupWifi();
  mqtt.setServer(MQTT_BROKER, MQTT_PORT);

  lastMeasure = millis() - MEASURE_INTERVAL_MS;  // 1re mesure immédiate
}

// ============================================================
// loop
// ============================================================
void loop() {
  if (!mqtt.connected()) reconnectMqtt();
  mqtt.loop();

  if (millis() - lastMeasure >= MEASURE_INTERVAL_MS) {
    lastMeasure = millis();

    float temp, hum;
    if (readSensor(temp, hum)) {
      bool ok = isWithinTolerance(temp, hum);
      Serial.printf("T=%.1f°C  H=%.1f%%  → %s\n",
                    temp, hum, ok ? "OK" : "DERIVE");
      applyStatusLeds(ok);
      publishMeasure(temp, hum, ok);
    } else {
      // Lecture ratée : on force l'état d'alerte (rouge clignotante)
      applyStatusLeds(false);
    }
  }

  updateBlink();   // gère le clignotement rouge sans bloquer la boucle
}