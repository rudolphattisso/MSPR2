# ADR-0008 — Protocole IoT : MQTT + Mosquitto

- **Date :** 2026-06-02
- **Statut :** Accepté
- **Décideurs :** Équipe FutureKawa

---

## Contexte

Les capteurs ESP32 (température + humidité) dans les entrepôts doivent remonter leurs données vers le backend pays. Le choix du protocole de communication impacte la robustesse face aux contraintes terrain : réseau instable, matériel limité, faible bande passante.

Le cahier des charges impose explicitement MQTT comme protocole de transport.

---

## Options évaluées (pour information)

### Option A — HTTP polling
L'ESP32 envoie des requêtes HTTP POST périodiques au backend.

**Pourquoi écarté :**
- Overhead HTTP (headers, handshake TLS) disproportionné pour de petits messages
- Pas adapté aux réseaux instables : chaque envoi est une connexion complète
- Non adapté au modèle pub/sub (plusieurs consommateurs du même flux)

### Option B — WebSockets
Connexion persistante bidirectionnelle entre l'ESP32 et le backend.

**Pourquoi écarté :**
- Complexité de gestion de la reconnexion sur microcontrôleur
- Bibliothèques WebSocket moins matures sur ESP32 que MQTT
- Bidirectionnel inutile pour un simple flux de mesures

### Option C — MQTT + Mosquitto *(retenu)*
Protocole publish/subscribe léger, conçu pour l'IoT sur réseaux contraints (RFC 9431, norme OASIS).

---

## Décision retenue

**MQTT v3.1.1 avec broker Eclipse Mosquitto**, dockerisé dans le backend pays.

### Justification

- MQTT est le protocole standard de l'industrie IoT — bibliothèques disponibles sur toutes les plateformes (ESP32 Arduino, MicroPython, Node.js)
- Overhead minimal : entête fixe de 2 octets, pas de connexion par message
- QoS configurable : QoS 1 (at least once) retient les messages si la connexion est temporairement perdue
- Le modèle pub/sub permet à Node-RED et au backend Next.js de s'abonner simultanément au même flux sans modification de l'ESP32

### Topics définis

```
futurekawa/<country_code>/<warehouse_id>/sensors/<sensor_id>/measurements
```

Exemple :
```
futurekawa/BR/wh-001/sensors/esp32-01/measurements
```

### Format payload (JSON)

```json
{
  "sensor_id": "esp32-br-01",
  "temp": 29.4,
  "humidity": 54.8,
  "recorded_at": "2026-06-02T10:30:00Z"
}
```

### QoS

- **QoS 1** (at least once) pour les mesures — acceptable pour des séries temporelles (un doublon est préférable à une perte)
- **QoS 0** pour les heartbeats de disponibilité capteur

---

## Conséquences

- Le broker Mosquitto est un service Docker dans le `docker-compose.yml` du backend pays
- Le backend Next.js (backend-pays) inclut un client MQTT (`mqtt` npm package) qui souscrit aux topics et insère en TimescaleDB
- Node-RED souscrit aux mêmes topics pour l'alerting — sans modifier le code ESP32
- La configuration des topics est externalisée dans les variables d'environnement
- **Hardware :** le choix du microcontrôleur (Arduino C++ vs MicroPython) est documenté dans `iot/README.md` une fois le matériel fourni. Les deux supportent MQTT nativement.
