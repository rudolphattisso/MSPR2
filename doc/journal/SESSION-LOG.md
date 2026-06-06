# SESSION-LOG — FutureKawa

---

## Session 001 — 2026-06-02

### Ce qui a été fait
- Lecture et analyse du cahier des charges MSPR2 (FutureKawa)
- Brainstorming complet de la stack technique (comparaison avec projet TechFarm/Open_Innov)
- Arbitrages validés : monorepo, Next.js homogène, PostgreSQL+TimescaleDB, Node-RED, NextAuth.js, Jenkins
- Décision MongoDB : écarté pour le prototype, cas d'usage documenté comme dette consciente
- Création de 9 ADRs dans `doc/adr/`
- Création `doc/COMMIT_CHARTER.md`
- Rédaction du `CLAUDE.md` final adapté à FutureKawa
- Création `doc/glossaire.md`
- Création `doc/doc_prepa/futurekawa_notes.md`
- Création `doc/journal/SESSION-LOG.md`
- Mise à jour `.gitignore` (`doc/` → `doc/doc_prepa/`)

### Fichiers créés / modifiés
- `CLAUDE.md` (mis à jour)
- `.gitignore` (mis à jour)
- `doc/COMMIT_CHARTER.md`
- `doc/glossaire.md`
- `doc/doc_prepa/futurekawa_notes.md`
- `doc/journal/SESSION-LOG.md`
- `doc/adr/ADR-0001` à `ADR-0009`

### Décisions clés actées
- Stack : Next.js 15 + Prisma + PostgreSQL/TimescaleDB + Mosquitto + Node-RED + NextAuth.js + Jenkins
- Architecture : distribuée (backend pays indépendant + backend siège agrégateur + frontend)
- MongoDB écarté (prototype), réintroduction documentée pour la phase 2
- Roadmap en 11 blocs validée

### Compléments fin de session
- Checklist de clôture ajoutée au format "fin d'étape" dans `CLAUDE.md`
- Fichiers mémoire créés (`memory/user_profile.md`, `project_futurekawa.md`, `feedback_collaboration.md`, `MEMORY.md`)
- `.gitignore` corrigé (`doc/` → `doc/doc_prepa/`)
- `doc/journal/SESSION-LOG.md` créé
- `doc/glossaire.md` créé
- `doc/doc_prepa/futurekawa_notes.md` créé

### Prochain démarrage
**Bloc 1 — Init monorepo (en cours)**
- [x] Structure de dossiers créée
- [x] Initialiser les 2 projets Next.js : `app-siege/` et `backend-pays/`
- [x] Poser le `docker-compose.yml` de base (service PostgreSQL + TimescaleDB + Mosquitto)
- [x] Initialiser Prisma dans `backend-pays/`

---

## Session 002 — 2026-06-03

### Ce qui a été fait
- Décision architecturale : fusion `backend-siege/` dans une app unique nommée `app-siege/` (ADR-0002 et ADR-0004 amendés)
- `app-siege/` = app Next.js combinée : UI Web + agrégation siège via Route Handlers (port 3000)
- `backend-siege/` n'est pas instancié (dossier conservé vide)
- `frontend/` renommé en `app-siege/` (renommage physique effectué)
- Roadmap réduite de 11 à 10 blocs (Blocs 7+8 fusionnés)
- Architecture validée contre le CDC MSPR2.md (tous les livrables couverts)

### Fichiers modifiés
- `app-siege/` (renommé depuis `frontend/`)
- `doc/adr/ADR-0002-architecture-distribuee.md` (amendé + schéma mis à jour)
- `doc/adr/ADR-0004-stack-nextjs-homogene.md` (amendé)
- `CLAUDE.md` (structure, stack, décisions, roadmap, schéma)
- `doc/doc_prepa/futurekawa_notes.md` (architecture, stack, roadmap, schéma)
- `doc/journal/SESSION-LOG.md`

### Décisions clés actées
- `app-siege/` = agrégateur siège + UI Web dans une seule app Next.js (port 3000)
- Aucune app mobile requise par le CDC (confirmé après relecture MSPR2.md)
- Règle : logique d'agrégation dans `app-siege/app/api/...` uniquement, jamais dans les Server Components
- Architecture validée CDC : backend-pays + app-siege + IoT + Node-RED + Jenkins + Docker Compose

### Prochain démarrage
**Bloc 1 — TERMINÉ ✓**

**Bloc 2 — Socle BDD (en cours)**
- [x] Modèles Prisma définis : Country, Warehouse, Lot, Measurement, Alert, User
- [x] UUID natif PostgreSQL (`@db.Uuid` + `gen_random_uuid()`) sur tous les IDs auto-générés
- [x] PK composite `(id, recordedAt)` sur Measurement (contrainte TimescaleDB)
- [x] Migration créée + TimescaleDB activé (`CREATE EXTENSION` + `create_hypertable`)
- [x] Migration appliquée — 7 tables en base dont `measurements` en hypertable
- [x] Seeds : 3 pays, 3 entrepôts, 9 lots (CONFORME/EN_ALERTE/PERIME), 5 users
- [x] Prisma 7 adapter pattern documenté (`@prisma/adapter-pg` + `Pool`)

---

## Session 003 — 2026-06-04

### Ce qui a été fait
- Nouveau protocole de validation : 4 options sur chaque choix technique (Oui / Oui pour session / Non / Autre)
- Schéma Prisma complet écrit et validé (`prisma validate` ✓)
- Décision UUID : type natif `@db.Uuid` + `gen_random_uuid()` (vs TEXT ou SERIAL)
- Décision PK composite sur Measurement : requis par TimescaleDB (partitionnement par chunks)
- Justifications historisées : glossaire + futurekawa_notes section 4b

### Fichiers modifiés
- `backend-pays/prisma/schema.prisma`
- `doc/glossaire.md` (entrée UUID)
- `doc/doc_prepa/futurekawa_notes.md` (section 4b décisions schéma BDD)
- `memory/feedback_choix_implementation.md` (nouveau)

### Décisions clés actées
- UUID natif PostgreSQL sur tous les IDs — unicité inter-pays garantie sans coordination
- `Country.id` = code pays explicite ("BR"/"EC"/"CO"), pas UUID
- `Measurement` : PK composite `(id, recordedAt)` — contrainte fondamentale TimescaleDB
- Measurements liées à Warehouse (pas au Lot) — le capteur est dans l'entrepôt

### Prochain démarrage
**Bloc 2 — TERMINÉ ✓**

**Bloc 3 — CI Jenkins (squelette)**
- Créer `Jenkinsfile` à la racine (pipeline déclaratif)
- Stages : Install → Lint → Test (placeholder) → Build
- Vérifier que le pipeline est lisible et exécutable

---

## Session 004 — 2026-06-04

### Ce qui a été fait
- Création du skill global `/cadrage` (`~/.claude/commands/cadrage.md`) — cadrage interactif de projet, portée globale
- Bloc 3 — CI Jenkins : `Jenkinsfile` déclaratif créé à la racine
- Stages séquentiels : Install → Lint → Test (placeholder) → Build
- Choix séquentiel vs parallèle documenté : parallèle reporté au Bloc 9 (tests réels)
- Création de `doc/guide-technique.md` (document pédagogique évolutif)

### Fichiers créés / modifiés
- `~/.claude/commands/cadrage.md` (nouveau skill global Claude Code)
- `Jenkinsfile` (nouveau)
- `doc/guide-technique.md` (nouveau)
- `doc/glossaire.md` (entrées : npm ci, Pipeline as code, Squelette de pipeline)
- `doc/doc_prepa/futurekawa_notes.md` (Bloc 3 terminé + section CI/CD)
- `README.md` (section CI/CD ajoutée)
- `doc/journal/SESSION-LOG.md`

### Décisions clés actées
- Stages séquentiels pour le squelette — lisibilité + débogage > vitesse sur un prototype
- Stage Test = `echo` placeholder jusqu'au Bloc 9 (tests consolidation)
- `tools { nodejs 'node-20' }` requiert le plugin NodeJS Jenkins configuré sur le serveur
- Parallélisation prévue au Bloc 9 quand les tests seront réels et le temps de pipeline mesurable

### Prochain démarrage
**Bloc 3 — TERMINÉ ✓**

**Bloc 4 — Backend pays**
- Routes API REST CRUD : lots (`/api/lots`), entrepôts (`/api/warehouses`), mesures (`/api/measurements`)
- Worker MQTT : connexion Mosquitto → parsing payload → insert TimescaleDB
- Règles d'alerte : seuils température/humidité par pays + péremption 365 jours

---

## Session 005 — 2026-06-05

### Ce qui a été fait
- Bloc 4 — Backend pays : implémentation complète
- `lib/prisma.ts` — singleton Prisma 7 avec adaptateur `PrismaPg` + `pg.Pool`
- `lib/alert-rules.ts` — logique seuils temp/humidité par pays + péremption 365 jours (transactions lot par lot)
- 6 routes API REST : GET/POST `/api/lots`, GET/PATCH/DELETE `/api/lots/:id`, GET `/api/lots/:id/measurements`, POST `/api/measurements`, GET `/api/alerts`, GET `/api/warehouses`
- `lib/mqtt-worker.ts` — connexion Mosquitto, subscribe `futurekawa/mesure` QoS 1, validation payload JSON, insert mesure, `checkMeasurementAlerts` fire-and-forget
- `instrumentation.ts` — démarre le worker MQTT + `checkAllLotExpirations` au boot Next.js (protégé `NEXT_RUNTIME === "nodejs"`)
- Correction imports Prisma 7 : `@/app/generated/prisma/client` (pas d'`index.ts` généré)

### Fichiers créés / modifiés
- `backend-pays/lib/prisma.ts` (nouveau)
- `backend-pays/lib/alert-rules.ts` (nouveau)
- `backend-pays/app/api/warehouses/route.ts` (nouveau)
- `backend-pays/app/api/lots/route.ts` (nouveau)
- `backend-pays/app/api/lots/[id]/route.ts` (nouveau)
- `backend-pays/app/api/lots/[id]/measurements/route.ts` (nouveau)
- `backend-pays/app/api/measurements/route.ts` (nouveau)
- `backend-pays/app/api/alerts/route.ts` (nouveau)
- `backend-pays/lib/mqtt-worker.ts` (nouveau)
- `backend-pays/instrumentation.ts` (nouveau)
- `backend-pays/.env` (`MQTT_BROKER_URL` ajouté)
- `backend-pays/package.json` (dépendance `mqtt` ajoutée)

### Décisions clés actées
- `checkMeasurementAlerts` fire-and-forget dans POST `/api/measurements` ET dans le worker MQTT : l'ingestion ne bloque pas sur la vérification des seuils
- Transactions lot par lot (pas un batch) : un échec sur un lot n'impacte pas les autres
- Prisma 7 singleton : `PrismaPg` + `pg.Pool` encapsulés dans `createClient()`, pattern identique au seed
- `instrumentation.ts` protégé par `NEXT_RUNTIME === "nodejs"` : le worker MQTT ne démarre pas sur Edge

### Prochain démarrage
**Bloc 4 — TERMINÉ ✓**

**Bloc 5 — IoT**
- Firmware ESP32 (Arduino C++) : lecture DHT22 → publication sur `futurekawa/mesure` en JSON
- Format payload attendu par le worker : `{"warehouseId": "...", "temperature": 29.4, "humidity": 54.8}`
- Démo fallback : simulation via `mosquitto_pub` ou script Python si ESP32 non disponible

---

## Session 006 — 2026-06-06

### Ce qui a été fait
- Test complet des Blocs 1 à 4 en Mode AUTO (Claude exécute + affiche)
- Infrastructure : port DB non publié détecté → `docker-compose up --force-recreate db` corrigé
- Toutes les routes API testées : GET/POST/PATCH/DELETE lots, measurements, alerts, warehouses
- Règles d'alerte validées : mesure 38°C/70% → 6 alertes générées sur les 3 lots Brésil actifs
- Worker MQTT validé end-to-end : `mosquitto_pub` → 4 alertes Équateur créées
- **Bug détecté et corrigé** : `DELETE /api/lots/:id` retournait 500 si le lot avait des alertes → `onDelete: Cascade` manquant sur `Alert.lot` dans `schema.prisma`
- Migration `20260606063341_alert_cascade_delete` générée et appliquée
- Nouvelle règle de fonctionnement ajoutée : tests systématiques à chaque fin de bloc (Mode AUTO / Mode GUIDÉ)

### Fichiers créés / modifiés
- `backend-pays/prisma/schema.prisma` (onDelete: Cascade ligne 94)
- `backend-pays/prisma/migrations/20260606063341_alert_cascade_delete/migration.sql` (nouveau)
- `CLAUDE.md` (section "Tests de fin de bloc", roadmap Blocs 1-4 marqués ✓)
- `doc/journal/SESSION-LOG.md`
- `doc/glossaire.md` (entrée onDelete: Cascade)
- `doc/doc_prepa/futurekawa_notes.md` (section 4d bug fix)
- `memory/feedback_collaboration.md` (Règle 6)

### Décisions clés actées
- `onDelete: Cascade` sur `Alert.lot` : suppression d'un lot supprime toutes ses alertes en cascade — comportement attendu (pas de données orphelines)
- Mode AUTO activé par défaut pour les tests de fin de bloc — peut être changé à tout moment avec `MODE GUIDÉ`

### Prochain démarrage
**Bloc 4 — TESTÉ ET CORRIGÉ ✓**

**Mode de test actif : AUTO**

**Bloc 5 — IoT**
- Firmware ESP32 (Arduino C++) : lecture DHT22 → publication sur `futurekawa/mesure` en JSON
- Format payload : `{"warehouseId": "...", "temperature": 29.4, "humidity": 54.8}`
- Fallback si pas d'ESP32 : simulation via `mosquitto_pub` ou script Python

---

## Session 007 — 2026-06-06

### Ce qui a été fait
- Bloc 5 — IoT : firmware ESP32 + simulateur Python
- `iot/esp32/config.h` — configuration isolée (WiFi, MQTT, warehouseId, type capteur)
- `iot/esp32/futurekawa_sensor.ino` — firmware Arduino C++ : WiFi + MQTT + DHT22 (extensible via #ifdef)
- `iot/simulation/simulate_sensor.py` — simulateur Python : 3 scénarios (nominal, hors-seuil, limite), configurable par CLI
- `iot/README.md` — doc câblage, flash ESP32, usage simulateur
- Simulation testée : 3 messages nominaux Brésil + 2 messages hors-seuil Colombie → alertes générées en BDD ✅
- `paho-mqtt` installé globalement sur le poste

### Fichiers créés
- `iot/esp32/config.h`
- `iot/esp32/futurekawa_sensor.ino`
- `iot/simulation/simulate_sensor.py`
- `iot/README.md`

### Décisions clés actées
- Firmware découplé du backend via contrat MQTT fixe — adaptation matériel = modifier `config.h` + 10 lignes max dans le `.ino`
- Simulateur Python couvre les 3 scénarios de démo jury : nominal / hors-seuil / cas limite
- Matériel réel non connu → `config.h` documente les variantes supportées (DHT22, DHT11, SHT31, simulation)

### Prochain démarrage
**Bloc 5 — TERMINÉ ✓**

**Bloc 6 — Auth (NextAuth.js)**
- Installer NextAuth.js v5 dans `backend-pays/` et `app-siege/`
- Provider Credentials (email + password hashé bcrypt en DB)
- Middleware protège toutes les routes `/api/*`
- Rôles : ADMIN (tout) / MANAGER_PAYS (son pays uniquement) / VIEWER (lecture seule)
