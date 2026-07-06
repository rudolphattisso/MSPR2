# FutureKawa — Plateforme de suivi des stocks de café

Plateforme IoT multi-pays de suivi des stocks et conditions de stockage de grains de café (Brésil, Équateur, Colombie).

---

## Prérequis

- [Node.js](https://nodejs.org/) >= 20
- [Docker](https://www.docker.com/) + Docker Compose
- npm >= 10

---

## Démarrage rapide — tout en conteneurs (démo)

Toute la solution (BDD, MQTT, Node-RED, Mailhog, **backend pays** et **app siège**)
démarre avec une seule commande.

```bash
# 1. Copier les variables d'environnement
cp .env.example .env

# 2. Construire et lancer toute la stack (6 services)
docker compose up --build -d

# 3. Charger les données de démonstration (une seule fois)
docker compose exec backend-pays npx prisma db seed
```

Ensuite :
- App siège (UI) : http://localhost:3000
- Backend pays (API) : http://localhost:3001
- Mailhog (emails de dev) : http://localhost:8025

> Les migrations Prisma sont appliquées **automatiquement** au démarrage du conteneur `backend-pays`.
> Compte de démonstration : `admin@futurekawa.com` / `FutureKawa2026!`

---

## Structure

```
backend-pays/   → Next.js API (port 3001) — API locale + ingestion MQTT
app-siege/      → Next.js UI + agrégation siège (port 3000)
shared/types/   → Interfaces TypeScript partagées
iot/            → Firmware ESP8266 + simulateur Python
mosquitto/      → Configuration broker MQTT
doc/            → ADRs, journal de session, glossaire
```

---

## Services Docker

| Service | Image | Port |
|---|---|---|
| PostgreSQL + TimescaleDB | `timescale/timescaledb:latest-pg16` | 5432 |
| MQTT Broker | `eclipse-mosquitto:2` | 1883 / 9001 (WS) |
| Node-RED (alerting) | `nodered/node-red:latest` | 1880 |
| Mailhog (emails dev) | `mailhog/mailhog:latest` | 1025 (SMTP) / 8025 (web) |
| Backend pays (API) | build `./backend-pays` | 3001 |
| App siège (UI + agrégation) | build `./app-siege` | 3000 |

```bash
# Démarrer
docker compose up -d

# Arrêter
docker compose down

# Voir les logs
docker compose logs -f

# Réinitialiser les données
docker compose down -v
```

---

## Développement (mode hot-reload)

Alternative au tout-conteneurs : on ne lance en conteneurs que l'infra, et les
deux apps tournent en local avec rechargement à chaud.

```bash
# Ne démarrer que l'infra (pas les apps)
docker compose up -d db mqtt node-red mailhog

# Installer les dépendances (une fois)
cd backend-pays && npm install && cd ../app-siege && npm install

# (mode conteneurs actif ? arrêter d'abord les apps pour libérer 3000/3001)
docker compose stop backend-pays app-siege
```

```bash
# Backend pays (port 3001)
cd backend-pays && npm run dev

# App siège — UI + agrégation (port 3000)
cd app-siege && npm run dev

# Prisma Studio (visualiser la DB)
cd backend-pays && npx prisma studio

# Appliquer une migration
cd backend-pays && npx prisma migrate dev --name <nom-migration>
```

---

## Variables d'environnement

Copier `.env.example` en `.env` dans chaque app concernée. Les valeurs par défaut fonctionnent avec le `docker-compose.yml` fourni.

| Variable | Usage |
|---|---|
| `DATABASE_URL` | Connexion PostgreSQL (utilisée par Prisma dans `backend-pays/`) |
| `MQTT_BROKER_URL` | URL du broker Mosquitto |
| `COUNTRY_CODE` | Pays déployé (`BR` / `EC` / `CO`) |
| `BACKEND_*_URL` | URLs des backends pays (utilisées par `app-siege/`) |
| `BACKEND_PAYS_URL` | URL du backend pays appelée par Node-RED (défaut : `http://host.docker.internal:3001`) |
| `NEXTAUTH_SECRET` | Secret de session NextAuth.js (à changer en prod) |

---

## CI/CD — Jenkins

Le pipeline est défini dans `Jenkinsfile` à la racine (pipeline as code).

### Prérequis Jenkins

- Plugin **NodeJS** installé dans Jenkins
- Outil `node-20` configuré dans *Manage Jenkins > Tools > NodeJS installations*

> Prérequis supplémentaire : **Docker + Docker Compose** disponibles sur l'agent (base de test + packaging).

### Stages

| Stage | Contenu |
|---|---|
| Install | `npm install` dans `backend-pays/` et `app-siege/` |
| Lint | `npm run lint` dans les deux apps |
| Base de test | `docker compose up -d db-test` (Postgres dédié, port 5433) |
| Tests + Couverture | `npm run coverage` (les deux apps) — **échoue si couverture < 80 %** |
| Build | `npm run build` dans les deux apps |
| Packaging Docker | `docker compose build backend-pays app-siege` (images déployables) |

En fin de pipeline (`post`) : la base de test est arrêtée et les **rapports de couverture** des deux apps sont archivés comme artefacts (preuve d'exécution).

---

## Documentation

- `doc/adr/` — Décisions architecturales (ADR-0001 à ADR-0009)
- `doc/journal/SESSION-LOG.md` — Journal de session
- `doc/glossaire.md` — Termes techniques
- `doc/guide-technique.md` — Guide pédagogique du projet (concepts, schémas, décisions)
- `doc/plan-de-tests.md` — Plan de tests (stratégie, cas, critères, anomalies)
- `doc/COMMIT_CHARTER.md` — Conventions de commit

---

## Tests automatisés et couverture

Les tests s'exécutent contre une **base de test dédiée** (`db-test`, port **5433**),
**isolée des données de démo** (elles ne sont jamais touchées). La base de test est
migrée et seedée automatiquement par le `globalSetup` de Vitest.

```bash
# 1. Démarrer uniquement la base de test
docker compose up -d db-test

# 2. Backend pays — tests + couverture
cd backend-pays
npm install
npm run test        # unitaires + intégration + API (26 tests)
npm run coverage    # + rapport de couverture (échoue si < 80 %)
npm run mutation    # (bonus) tests de mutation — Stryker

# 3. App siège — tests + couverture
cd ../app-siege
npm install
npm run test        # logique agrégateur / guards / proxy (19 tests)
npm run coverage
```

**Couverture actuelle** (code métier — l'UI est validée par l'exécution) :

| App | Lignes | Fonctions |
|---|---|---|
| backend-pays | ~85 % | ~91 % |
| app-siege (logique) | ~97 % | 100 % |

- Rapports HTML : `backend-pays/coverage/` et `app-siege/coverage/`.
- Rapport de mutation : `backend-pays/reports/mutation/`.
- Seuil de **80 %** enforced dans `vitest.config.ts` (échec sinon → utilisé par la CI).
