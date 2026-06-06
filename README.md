# FutureKawa — Plateforme de suivi des stocks de café

Plateforme IoT multi-pays de suivi des stocks et conditions de stockage de grains de café (Brésil, Équateur, Colombie).

---

## Prérequis

- [Node.js](https://nodejs.org/) >= 20
- [Docker](https://www.docker.com/) + Docker Compose
- npm >= 10

---

## Démarrage rapide

```bash
# 1. Copier les variables d'environnement
cp .env.example .env

# 2. Démarrer les services (PostgreSQL/TimescaleDB + Mosquitto)
docker compose up -d

# 3. Installer les dépendances de chaque app
cd backend-pays && npm install
cd ../app-siege && npm install

# 4. Appliquer le schéma BDD (après avoir défini les modèles Prisma)
cd backend-pays && npx prisma migrate dev
```

---

## Structure

```
backend-pays/   → Next.js API (port 3001) — API locale + ingestion MQTT
app-siege/      → Next.js UI + agrégation siège (port 3000)
shared/types/   → Interfaces TypeScript partagées
iot/            → Firmware ESP32
mosquitto/      → Configuration broker MQTT
doc/            → ADRs, journal de session, glossaire
```

---

## Services Docker

| Service | Image | Port |
|---|---|---|
| PostgreSQL + TimescaleDB | `timescale/timescaledb:latest-pg16` | 5432 |
| MQTT Broker | `eclipse-mosquitto:2` | 1883 / 9001 (WS) |

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

## Développement

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
| `NEXTAUTH_SECRET` | Secret de session NextAuth.js (à changer en prod) |

---

## CI/CD — Jenkins

Le pipeline est défini dans `Jenkinsfile` à la racine (pipeline as code).

### Prérequis Jenkins

- Plugin **NodeJS** installé dans Jenkins
- Outil `node-20` configuré dans *Manage Jenkins > Tools > NodeJS installations*

### Stages

| Stage | Contenu |
|---|---|
| Install | `npm ci` dans `backend-pays/` et `app-siege/` |
| Lint | `npm run lint` dans les deux apps |
| Test | Placeholder — tests réels au Bloc 9 |
| Build | `npm run build` dans les deux apps |

---

## Documentation

- `doc/adr/` — Décisions architecturales (ADR-0001 à ADR-0009)
- `doc/journal/SESSION-LOG.md` — Journal de session
- `doc/glossaire.md` — Termes techniques
- `doc/guide-technique.md` — Guide pédagogique du projet (concepts, schémas, décisions)
- `doc/COMMIT_CHARTER.md` — Conventions de commit
