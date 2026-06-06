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

## Option B — Firmware ESP32 (matériel physique)

### Matériel actuel (à compléter quand fourni)
- [ ] Microcontrôleur : ___________
- [ ] Capteur : ___________
- [ ] Alimentation : ___________

### Bibliothèques Arduino à installer (Gestionnaire de bibliothèques)
- **PubSubClient** (Nick O'Leary) — client MQTT
- **ArduinoJson** (Benoit Blanchon) — sérialisation JSON
- **DHT sensor library** (Adafruit) — si capteur DHT22 ou DHT11
- **Adafruit SHT31 Library** — si capteur SHT31

### Schéma de câblage (DHT22 — à adapter selon matériel reçu)
```
ESP32          DHT22
3.3V    →      VCC (pin 1)
GND     →      GND (pin 4)
GPIO 4  →      DATA (pin 2)
               10kΩ entre VCC et DATA (pull-up)
```

### Configuration avant flash

Ouvrir `iot/esp32/config.h` et modifier :

```c
#define WIFI_SSID       "ton_reseau"
#define WIFI_PASSWORD   "ton_mdp"
#define MQTT_BROKER     "192.168.x.x"   // IP de la machine Docker
#define WAREHOUSE_ID    "00000000-..."  // UUID de l'entrepôt
#define SENSOR_DHT22                    // décommenter selon capteur reçu
```

### Adapter à un nouveau capteur (quand matériel connu)

1. Ajouter `#define SENSOR_MON_CAPTEUR` dans `config.h`
2. Dans `futurekawa_sensor.ino`, ajouter un bloc :
```cpp
#ifdef SENSOR_MON_CAPTEUR
  #include <BibliothequeMonCapteur.h>
  MonCapteur capteur;
#endif
```
3. Ajouter les cas dans `readTemperature()` et `readHumidity()`
4. **Aucune autre modification nécessaire** — le reste du firmware est inchangé

### Flasher

1. Ouvrir `iot/esp32/futurekawa_sensor.ino` dans Arduino IDE
2. Sélectionner la carte : `ESP32 Dev Module`
3. Sélectionner le port COM
4. `Téléverser`
5. Ouvrir le Moniteur Série (115200 baud) pour voir les logs

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
