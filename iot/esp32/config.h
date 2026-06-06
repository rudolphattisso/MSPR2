#pragma once

// ============================================================
// CONFIGURATION — à modifier selon le déploiement
// ============================================================

// WiFi
#define WIFI_SSID       "ton_reseau_wifi"
#define WIFI_PASSWORD   "ton_mot_de_passe"

// Broker MQTT (adresse IP du serveur qui fait tourner Docker)
#define MQTT_BROKER     "192.168.1.100"
#define MQTT_PORT       1883
#define MQTT_CLIENT_ID  "esp32-br-wh001"   // unique par appareil

// Topic de publication (ne pas modifier)
#define MQTT_TOPIC      "futurekawa/mesure"

// Identifiant de l'entrepôt surveillé par cet appareil
// Brésil     : "00000000-0000-0000-0000-000000000001"
// Équateur   : "00000000-0000-0000-0000-000000000002"
// Colombie   : "00000000-0000-0000-0000-000000000003"
#define WAREHOUSE_ID    "00000000-0000-0000-0000-000000000001"

// Intervalle de mesure en millisecondes (30 secondes par défaut)
#define MEASURE_INTERVAL_MS  30000

// ============================================================
// CONFIGURATION CAPTEUR — adapter selon le matériel reçu
// ============================================================

// Capteur actif : décommenter UNE seule ligne
#define SENSOR_DHT22          // ESP32 + capteur DHT22 sur GPIO 4
// #define SENSOR_DHT11       // variante DHT11 (moins précis)
// #define SENSOR_SHT31       // capteur SHT31 via I2C
// #define SENSOR_SIMULATION  // simulation logicielle (pas de capteur physique)

// Broche GPIO du capteur (pour DHT22/DHT11)
#define SENSOR_PIN  4
