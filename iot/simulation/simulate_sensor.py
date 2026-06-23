"""
FutureKawa — Simulateur de capteur IoT

Simule un ESP8266 + DHT11 sans matériel physique.
Publie des messages MQTT sur futurekawa/mesure à intervalle régulier.

Usage :
  python simulate_sensor.py                        # scénario nominal Brésil
  python simulate_sensor.py --country EC            # Équateur nominal
  python simulate_sensor.py --scenario hors-seuil  # déclenche des alertes
  python simulate_sensor.py --scenario peremption   # lot périmé (storedAt ancien)
  python simulate_sensor.py --count 5               # envoie 5 messages et s'arrête

Dépendances :
  pip install paho-mqtt
"""

import argparse
import json
import random
import time

import paho.mqtt.client as mqtt_client

# ── Configuration ──────────────────────────────────────────────────────────────

BROKER_HOST = "localhost"
BROKER_PORT = 1883
TOPIC       = "futurekawa/mesure"

WAREHOUSES = {
    "BR": {"id": "00000000-0000-0000-0000-000000000001", "ideal_temp": 29, "ideal_hum": 55},
    "EC": {"id": "00000000-0000-0000-0000-000000000002", "ideal_temp": 31, "ideal_hum": 60},
    "CO": {"id": "00000000-0000-0000-0000-000000000003", "ideal_temp": 26, "ideal_hum": 80},
}

# ── Générateurs de valeurs par scénario ───────────────────────────────────────

def values_nominal(country: str) -> tuple[float, float]:
    """Valeurs dans les seuils — aucune alerte attendue."""
    w = WAREHOUSES[country]
    temp = round(w["ideal_temp"] + random.uniform(-1.5, 1.5), 1)
    hum  = round(w["ideal_hum"]  + random.uniform(-1.0, 1.0), 1)
    return temp, hum

def values_hors_seuil(country: str) -> tuple[float, float]:
    """Valeurs hors seuils — doit déclencher des alertes SEUIL_TEMPERATURE + SEUIL_HUMIDITE."""
    w = WAREHOUSES[country]
    # Dépasse la tolérance (±3°C / ±2%) par au moins 2 unités
    temp = round(w["ideal_temp"] + random.choice([-1, 1]) * random.uniform(5, 8), 1)
    hum  = round(w["ideal_hum"]  + random.choice([-1, 1]) * random.uniform(4, 7), 1)
    return temp, hum

def values_limite(country: str) -> tuple[float, float]:
    """Valeurs exactement à la frontière du seuil (test de cas limite)."""
    w = WAREHOUSES[country]
    temp = round(w["ideal_temp"] + 3.0, 1)   # exactement à la limite tolérance ±3
    hum  = round(w["ideal_hum"]  + 2.0, 1)   # exactement à la limite tolérance ±2
    return temp, hum

SCENARIOS = {
    "nominal":     values_nominal,
    "hors-seuil":  values_hors_seuil,
    "limite":      values_limite,
}

# ── MQTT ──────────────────────────────────────────────────────────────────────

def on_connect(client, userdata, flags, rc, properties=None):
    status = "OK" if rc == 0 else f"ÉCHEC (code={rc})"
    print(f"[MQTT] Connexion à {BROKER_HOST}:{BROKER_PORT} — {status}")

def build_payload(warehouse_id: str, temperature: float, humidity: float) -> str:
    return json.dumps({
        "warehouseId": warehouse_id,
        "temperature": temperature,
        "humidity":    humidity,
    })

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="FutureKawa — simulateur capteur IoT")
    parser.add_argument("--country",  default="BR",       choices=["BR", "EC", "CO"],
                        help="Pays de l'entrepôt (défaut : BR)")
    parser.add_argument("--scenario", default="nominal",  choices=list(SCENARIOS.keys()),
                        help="Scénario de simulation (défaut : nominal)")
    parser.add_argument("--interval", default=5, type=int,
                        help="Intervalle entre messages en secondes (défaut : 5)")
    parser.add_argument("--count",    default=0, type=int,
                        help="Nombre de messages à envoyer — 0 = infini (défaut : 0)")
    args = parser.parse_args()

    warehouse   = WAREHOUSES[args.country]
    gen_values  = SCENARIOS[args.scenario]

    client = mqtt_client.Client(mqtt_client.CallbackAPIVersion.VERSION2,
                                client_id=f"futurekawa-sim-{args.country}")
    client.on_connect = on_connect
    client.connect(BROKER_HOST, BROKER_PORT, keepalive=60)
    client.loop_start()

    time.sleep(1)  # attendre la connexion

    print(f"[Sim] Entrepôt : {args.country} (warehouseId={warehouse['id']})")
    print(f"[Sim] Scénario : {args.scenario}")
    print(f"[Sim] Intervalle : {args.interval}s")
    print(f"[Sim] Messages : {'∞' if args.count == 0 else args.count}")
    print(f"[Sim] Topic : {TOPIC}\n")

    sent = 0
    try:
        while args.count == 0 or sent < args.count:
            temp, hum = gen_values(args.country)
            payload   = build_payload(warehouse["id"], temp, hum)

            result = client.publish(TOPIC, payload, qos=1)
            result.wait_for_publish(timeout=3)

            print(f"[{sent + 1:>4}] {payload}")
            sent += 1

            if args.count == 0 or sent < args.count:
                time.sleep(args.interval)

    except KeyboardInterrupt:
        print(f"\n[Sim] Arrêté après {sent} message(s).")
    finally:
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    main()
