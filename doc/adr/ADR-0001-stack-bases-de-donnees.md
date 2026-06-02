# ADR-0001 — Choix de la stack base de données

- **Date :** 2026-06-02
- **Statut :** Accepté
- **Décideurs :** Équipe FutureKawa

---

## Contexte

Le projet FutureKawa nécessite de persister trois familles de données aux natures très différentes :

1. **Données structurées métier** — lots, entrepôts, pays, utilisateurs, alertes : relations claires, transactions, intégrité référentielle.
2. **Données timeseries IoT** — mesures de température et d'humidité émises en continu par les capteurs ESP32, requêtées par plage de temps pour construire les courbes historiques.
3. **Logs d'ingestion bruts** — payloads MQTT tels que reçus par le backend, avant traitement, utiles pour l'audit et le rejeu en cas d'erreur d'ingestion.

Le cahier des charges impose explicitement une base SQL comme socle de persistance. L'architecture est distribuée : chaque backend pays dispose de sa propre instance, le siège agrège via les API REST (sans accès direct aux DB pays).

---

## Options évaluées

### Option A — PostgreSQL seul
Tout en PostgreSQL : données métier + mesures IoT dans la même instance, tables classiques.

**Avantages :** stack minimaliste, un seul moteur à opérer, Prisma couvre tout.

**Inconvénients :** les requêtes sur des tables de mesures avec des millions de lignes se dégradent sans partitionnement. Nécessite une gestion manuelle des index temporels. Pas adapté à l'ingestion haute fréquence à long terme.

---

### Option B — PostgreSQL + TimescaleDB + MongoDB *(considérée)*
- PostgreSQL pour les données métier
- TimescaleDB (extension PostgreSQL) pour les mesures IoT
- MongoDB pour les payloads MQTT bruts (buffer d'ingestion, audit trail)

**Avantages :** chaque base fait ce pour quoi elle est conçue. MongoDB absorbe les payloads sans schéma fixe, permettant de rejouer l'ingestion si le format évolue entre versions firmware.

**Inconvénients :**
- Trois moteurs à conteneuriser, opérer et monitorer
- MongoDB n'est pas exigé par le sujet
- Pour un prototype avec un nombre limité de capteurs et une durée courte, le volume de payloads bruts est faible — le bénéfice ne justifie pas la complexité opérationnelle
- Risque pour la démo : plus de services = plus de points de défaillance

**Décision :** option retenue partiellement. MongoDB est écarté pour ce prototype. Le cas d'usage (buffer d'ingestion, audit trail IoT) est documenté ici comme dette technique consciente. En phase production ou dès que le volume de capteurs croît significativement, MongoDB (ou une solution équivalente comme InfluxDB) devrait être réintroduit pour ce rôle.

---

### Option C — PostgreSQL + TimescaleDB *(retenue)*
- PostgreSQL pour les données métier et les alertes
- TimescaleDB (extension de la même instance PostgreSQL) pour les mesures IoT

**Avantages :**
- Un seul moteur (PostgreSQL avec extension) — même image Docker, même connexion Prisma, même CLI
- TimescaleDB partitionne automatiquement les mesures par intervalle de temps (hypertable), rendant les requêtes historiques efficaces même à fort volume
- Compression native des données anciennes
- Pas de service supplémentaire à opérer
- Réponse directe aux exigences SQL du cahier des charges

**Inconvénients :**
- Les opérations sur les hypertables (création, rétention) nécessitent du SQL brut — Prisma ne les gère pas nativement
- Pas de stockage des payloads bruts : si le format MQTT change, les données antérieures au changement ne sont pas rejouables

---

## Décision retenue

**Option C — PostgreSQL 16 + TimescaleDB.**

Un seul moteur, deux rôles distincts (schéma relationnel + hypertable timeseries), opéré via Docker Compose. Les alertes sont persistées dans le schéma relationnel PostgreSQL standard.

### Schéma de responsabilité

| Données | Table / Schéma | Moteur |
|---|---|---|
| Pays, entrepôts, lots, users | Tables Prisma standard | PostgreSQL |
| Alertes (seuils, péremption) | Table `alerts` Prisma | PostgreSQL |
| Mesures IoT (temp, humidité) | Hypertable `measurements` | TimescaleDB |

---

## Conséquences

- La migration d'initialisation doit inclure `CREATE EXTENSION IF NOT EXISTS timescaledb` et la conversion de la table `measurements` en hypertable via `SELECT create_hypertable(...)`.
- Prisma gère toutes les tables sauf la création de l'hypertable, qui est faite dans un script SQL de migration séparé.
- **Dette technique documentée :** l'absence de stockage des payloads MQTT bruts est un choix conscient de simplification pour le prototype. En phase 2, un composant de buffering (MongoDB, InfluxDB, ou un broker de messages type Kafka) devra être évalué si le nombre de capteurs et la variabilité des formats firmware augmentent.
