# Simulateur capteur IoT — FutureKawa

Simule un ESP8266 + DHT11 sans matériel. Publie des mesures MQTT sur
`futurekawa/mesure` (QoS 1) vers le broker Mosquitto local.

## Prérequis
- Broker Mosquitto démarré (`docker compose up -d mqtt`) sur `localhost:1883`
- `pip install paho-mqtt`

## Lancement — se placer dans le dossier
    cd iot/simulation

## Scénario NOMINAL (aucune alerte)
    python simulate_sensor.py                 # Brésil (défaut)
    python simulate_sensor.py --country EC    # Équateur
    python simulate_sensor.py --country CO    # Colombie

## Scénario HORS-SEUIL (déclenche alertes temp + humidité)
    python simulate_sensor.py --scenario hors-seuil
    python simulate_sensor.py --scenario hors-seuil --country EC
    python simulate_sensor.py --scenario hors-seuil --country CO

## Scénario LIMITE (cas frontière ±3°C / ±2%)
    python simulate_sensor.py --scenario limite
    python simulate_sensor.py --scenario limite --country EC
    python simulate_sensor.py --scenario limite --country CO

## Exemples combinés
    python simulate_sensor.py --count 5                          # 5 msgs puis stop
    python simulate_sensor.py --scenario hors-seuil --interval 2 # 1 msg / 2 s
    python simulate_sensor.py --scenario hors-seuil --country EC --interval 2 --count 10

## Options
| Option | Valeurs | Défaut | Rôle |
|---|---|---|---|
| `--country` | `BR` / `EC` / `CO` | `BR` | Entrepôt/pays simulé |
| `--scenario` | `nominal` / `hors-seuil` / `limite` | `nominal` | Type de valeurs générées |
| `--interval` | entier (secondes) | `5` | Délai entre 2 messages |
| `--count` | entier (`0` = infini) | `0` | Nombre de messages |

## Arrêt
`Ctrl+C` → arrêt propre (« Arrêté après N message(s). »).
