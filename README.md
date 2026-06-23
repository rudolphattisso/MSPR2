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
| Mailhog (boîte mail de test) | `mailhog/mailhog` | 1025 (SMTP) / 8025 (web) |

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
| `AUTH_SECRET` | Secret NextAuth v5 — signe les JWT de session (`app-siege/`) |
| `AUTH_API_URL` | Backend pays qui vérifie les identifiants (`app-siege/`) |
| `SERVICE_API_KEY` | Clé de service M2M `x-api-key` — **identique** dans les deux apps |
| `SMTP_*` | Envoi des emails de vérification (`backend-pays/`) — Mailhog par défaut |
| `APP_PUBLIC_URL` | URL d'app-siege, pour le lien de vérification dans l'email (`backend-pays/`) |

---

## Authentification (Bloc 6)

Auth à **2 couches** :
1. **Utilisateur** — NextAuth v5 dans `app-siege` (login / register / logout), sessions JWT, rôles `ADMIN` / `MANAGER_PAYS` / `VIEWER`. La vérification des identifiants est déléguée au backend pays (`POST /api/auth/login`, bcrypt).
2. **Service (M2M)** — toutes les routes `/api/*` du backend pays exigent l'en-tête `x-api-key` (`SERVICE_API_KEY`). Seul `app-siege` la détient → l'API pays n'est pas accessible directement (OWASP API Security).

Routes ajoutées (backend) : `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/verify`.
Pages (app-siege) : `/login`, `/register`, `/verify`. Le reste est protégé par `app-siege/proxy.ts`.

### Vérification d'email à l'inscription

À l'inscription, le compte est créé **non vérifié** : un email contenant un lien d'activation est envoyé, et la connexion est refusée (`403`) tant que l'email n'est pas confirmé.

- **Par défaut (dev/démo)** : les emails sont capturés par **Mailhog** → les consulter sur **http://localhost:8025** (rien n'est envoyé sur Internet). Cliquer le lien dans le mail Mailhog active le compte.
- **Envois réels (Gmail)** : renseigner dans `backend-pays/.env` :

  ```bash
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=ton.adresse@gmail.com
  SMTP_PASS=mot_de_passe_application   # myaccount.google.com/apppasswords (2FA requise)
  SMTP_FROM=FutureKawa <ton.adresse@gmail.com>
  ```

  Aucun changement de code — uniquement ces variables. Le mail part alors vers la vraie adresse saisie.

> Les comptes **seedés** (admin/managers/viewer) sont déjà marqués vérifiés.
> Le même canal SMTP servira aux **emails d'alerte** (Bloc 8).

### Comptes de test (seed)

Mot de passe commun : `FutureKawa2026!`

| Email | Rôle | Pays |
|---|---|---|
| `admin@futurekawa.com` | ADMIN | — (siège) |
| `manager.br@futurekawa.com` | MANAGER_PAYS | BR |
| `manager.ec@futurekawa.com` | MANAGER_PAYS | EC |
| `manager.co@futurekawa.com` | MANAGER_PAYS | CO |
| `viewer@futurekawa.com` | VIEWER | — |

> L'inscription via `/register` crée toujours un compte **VIEWER** (rôle non choisissable côté client).

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
