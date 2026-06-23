# IoT — FutureKawa

Deux modes de fonctionnement : firmware ESP32 réel ou simulateur Python.

---

## Contrat MQTT (ne change jamais)

**Topic :** `futurekawa/mesure`  
**QoS :** 1  
**Payload :**
```json
{
  "warehouseId": "00000000-0000-0000-0000-000000000001",
  "temperature": 29.4,
  "humidity":    54.8
}
```

| Champ | Type | Requis | Description |
|---|---|---|---|
| `warehouseId` | UUID | Oui | Entrepôt surveillé |
| `temperature` | Float | Oui | Température °C |
| `humidity` | Float | Oui | Humidité % |

**IDs entrepôts (seeds) :**
- Brésil → `00000000-0000-0000-0000-000000000001`
- Équateur → `00000000-0000-0000-0000-000000000002`
- Colombie → `00000000-0000-0000-0000-000000000003`

---

## Option A — Simulateur Python (sans matériel)

### Prérequis
```bash
pip install paho-mqtt
```

### Lancer la simulation
```bash
cd iot/simulation

# Scénario nominal — Brésil (valeurs dans les seuils)
python simulate_sensor.py

# Changer de pays
python simulate_sensor.py --country EC
python simulate_sensor.py --country CO

# Déclencher des alertes (valeurs hors seuils)
python simulate_sensor.py --scenario hors-seuil

# Test de cas limite (exactement à la frontière)
python simulate_sensor.py --scenario limite

# Envoyer N messages et s'arrêter
python simulate_sensor.py --count 10

# Changer l'intervalle (secondes)
python simulate_sensor.py --interval 2

# Combinaison
python simulate_sensor.py --country EC --scenario hors-seuil --count 5 --interval 2
```

### Ce que tu verras dans le terminal
```
[MQTT] Connexion à localhost:1883 — OK
[Sim] Entrepôt : BR (warehouseId=00000000-...)
[Sim] Scénario : nominal
[   1] {"warehouseId": "00000000-...", "temperature": 29.1, "humidity": 55.9}
[   2] {"warehouseId": "00000000-...", "temperature": 28.8, "humidity": 55.2}
```

---

## Option B — Firmware ESP8266 (matériel physique)

### Matériel — Kit OSOYOO NodeMCU IoT Kit
- **Microcontrôleur :** NodeMCU v2/v3 (ESP8266)
- **Capteur :** DHT11 (température ±2°C / humidité ±5%)
- **Alimentation :** USB via NodeMCU

### Bibliothèques Arduino à installer (Gestionnaire de bibliothèques)
- **PubSubClient** (Nick O'Leary) — client MQTT
- **ArduinoJson** (Benoit Blanchon) — sérialisation JSON
- **DHT sensor library** (Adafruit) + dépendances Adafruit

### Setup Arduino IDE

1. **Fichier → Préférences → URLs gestionnaire de cartes** :
   ```
   https://arduino.esp8266.com/stable/package_esp8266com_index.json
   ```
2. **Outils → Gestionnaire de cartes** → installer `esp8266 by ESP8266 Community`
3. **Outils → Type de carte** → `NodeMCU 1.0 (ESP-12E Module)`
4. **Outils → Port** → le port COM apparu après branchement USB

### Câblage DHT11 sur NodeMCU

```
DHT11          NodeMCU
VCC     →      3.3V
GND     →      GND
DATA    →      D5  (GPIO14)
               résistance 10kΩ entre DATA et 3.3V (pull-up — incluse dans le kit)
```

> Éviter D3, D4, D8 : pins de boot sensibles. D5 est le choix sûr.

### Configuration avant flash

Ouvrir `iot/esp8266/config.h` et modifier :

```c
#define WIFI_SSID       "ton_reseau"
#define WIFI_PASSWORD   "ton_mdp"
#define MQTT_BROKER     "192.168.x.x"   // IP de la machine Docker
#define WAREHOUSE_ID    "00000000-..."  // UUID de l'entrepôt (voir seeds)
// SENSOR_DHT11 est actif par défaut — ne pas modifier
```

### Flasher

1. Brancher le NodeMCU en USB
2. Ouvrir `iot/esp8266/futurekawa_sensor.ino` dans Arduino IDE
3. Vérifier : **Outils → Type de carte** = `NodeMCU 1.0 (ESP-12E Module)`
4. Vérifier : **Outils → Port** = le bon port COM
5. Cliquer `Téléverser` (flèche →)
6. Ouvrir **Outils → Moniteur Série** à **115200 baud** pour voir les logs

---

## Vérification end-to-end

Après avoir lancé la simulation ou flashé l'ESP32 :

```bash
# Observer les messages MQTT en temps réel
docker exec futurekawa-mqtt mosquitto_sub -h localhost -p 1883 -t "futurekawa/mesure" -v

# Vérifier que les mesures sont bien insérées
curl http://localhost:3000/api/lots/00000000-0000-0000-0000-000000000001

# Vérifier les alertes générées
curl http://localhost:3000/api/alerts
```
