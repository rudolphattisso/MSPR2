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

---

## Session 008 — 2026-06-06

### Ce qui a été fait
- Skill global `/test` créé (`~/.claude/skills/test/SKILL.md`) — validateur de fin de phase,
  auto-détection stack, Mode AUTO / Mode GUIDÉ, applicable à tout projet
- `/test guidé` exécuté sur Bloc 4 → protocole 20 étapes généré (test du skill ✅)
- `doc/glossaire.md` complété : Firmware, Flash, GPIO, Pull-up (résistance)
- `doc/guide-technique.md` mis à jour :
  - Topic MQTT corrigé (`futurekawa/mesure` au lieu de la hiérarchie erronée)
  - ERD corrigé (Alert : champs réels, types FR, onDelete Cascade ; Lot : weightKg supprimé)
  - Séquence flux corrigée (backend-pays crée les alertes, Node-RED = Bloc 8 seulement)
  - Section 5 "Couche IoT" ajoutée (firmware, simulateur, cycle de vie mesure)
  - Roadmap : Blocs 4 et 5 passés en ✅
  - Numérotation sections mise à jour (5 → 6 → 7 → 8 → 9)

### Fichiers créés / modifiés
- `~/.claude/skills/test/SKILL.md` (nouveau — global)
- `doc/glossaire.md` (Firmware, Flash, GPIO, Pull-up)
- `doc/guide-technique.md` (corrections MQTT + ERD + section IoT)

### Décisions clés actées
- Skill `/test` global en `skills/SKILL.md` (format officiel avec frontmatter YAML),
  distinct de `/test-bloc` projet (`.claude/commands/`)
- `guide-technique.md` = source de vérité pédagogique — à corriger dès qu'une implémentation diverge

### Prochain démarrage
**Bloc 5 — DOCS MIS À JOUR ✓**

**Mode de test actif : AUTO**

**Bloc 6 — Auth (NextAuth.js)**
- Installer NextAuth.js v5 dans `backend-pays/` et `app-siege/`
- Provider Credentials (email + password hashé bcrypt en DB)
- Middleware protège toutes les routes `/api/*`
- Rôles : ADMIN (tout) / MANAGER_PAYS (son pays uniquement) / VIEWER (lecture seule)

---

## Session 011 — 2026-06-20

### Ce qui a été fait
- Correction typo SSID dans `config.h.example` : `Futurkawa_26` → `Futurekawa_26`
- Analyse complète du firmware `.ino` par Opus : paradigme Arduino (setup/loop vs main), structure sketch, qualité code — aucun défaut bloquant pour la démo
- Debug long du flash ESP8266 : toutes les pistes Windows épuisées
  - Arduino IDE esptool v3.0 ❌
  - esptool v5.3.0 pip ❌
  - ESP Flash Download Tool (Espressif officiel) ❌
- Root cause identifié : driver CH340 Windows 11 rejette `SetCommState` (`ERROR_GEN_FAILURE` = 31) — spécifique Windows 11
- Solution retenue : flasher depuis un PC **Windows 10** (bug absent sur W10)
- `.bin` déjà compilé et disponible, chemin documenté
- Création `iot/flash.ps1` (script de référence pour futurs flash)

### Fichiers créés / modifiés
- `iot/esp8266/futurekawa_sensor/config.h.example` (typo SSID corrigé)
- `iot/flash.ps1` (nouveau)

### Décisions clés actées
- SSID hotspot de référence : `Futurekawa_26` (corrigé depuis `Rvna_7.0`)
- Flash impossible sur Windows 11 (CH340 driver) → Windows 10 requis pour cette étape
- Firmware compilé = autonome après flash, indépendant de l'OS du laptop

### Prochain démarrage
**Flash ESP8266 sur Windows 10**
1. Cloner le repo sur un PC Windows 10
2. Ouvrir `iot/esp8266/futurekawa_sensor/futurekawa_sensor.ino` dans Arduino IDE
3. Créer `config.h` depuis `config.h.example` — renseigner WiFi password + WAREHOUSE_ID
4. Board : `NodeMCU 1.0 (ESP-12E Module)` → Téléverser
5. Moniteur Série 115200 baud → valider logs WiFi + MQTT
6. Si OK → test end-to-end (MQTT → BDD → alertes)

**OU** utiliser le `.bin` déjà compilé :
`C:\Users\attis\AppData\Local\arduino\sketches\BA31ADC5B0B753D548BDD9F7AC594FC7\futurekawa_sensor.ino.bin`
→ copier sur clé USB + flasher via `python -m esptool` ou Arduino IDE sur W10

**Mode de test actif : AUTO**

---

## Session 010 — 2026-06-19

### Ce qui a été fait
- Reprise de zéro du process de config Arduino IDE (étapes vérifiées une par une)
- Arduino IDE 2.3.10 déjà installé ✅
- Support carte ESP8266 installé : `esp8266 by ESP8266 Community` ✅
- Bibliothèques installées : PubSubClient, ArduinoJson, DHT sensor library (Adafruit) ✅
- Créé `iot/esp8266/futurekawa_sensor/config.h.example` (protection credentials WiFi)
- `config.h` ajouté au `.gitignore` → ne sera jamais commité
- Décision : Windows Mobile Hotspot (`Rvna_7.0`) comme réseau de référence → IP fixe `192.168.137.1`
- `config.h.example` mis à jour : `MQTT_BROKER = 192.168.137.1`, `WIFI_SSID = Rvna_7.0`
- Câblage DHT11 sur D5 effectué ✅
- Arduino IDE a déplacé le `.ino` dans `futurekawa_sensor/` (convention Arduino sketch)
- Déplacement `config.h` et `config.h.example` dans `futurekawa_sensor/` pour cohérence
- `.gitignore` mis à jour avec le nouveau chemin
- Flash tenté → **compilation OK ✅** — upload KO (PermissionError COM, driver CH340)
- Driver CH340 réinstallé → redémarrage machine en cours

### Fichiers créés / modifiés
- `iot/esp8266/futurekawa_sensor/config.h.example` (créé + déplacé)
- `iot/esp8266/futurekawa_sensor/config.h` (déplacé — gitignore)
- `.gitignore` (chemin config.h mis à jour)

### Décisions clés actées
- Windows Mobile Hotspot comme réseau de référence → IP `192.168.137.1` toujours fixe, peu importe la localisation (maison/école)
- `config.h` gitignore + `config.h.example` commité → protection des credentials WiFi
- Convention Arduino : le `.ino` doit être dans un dossier du même nom → `config.h` doit être dans le même dossier que le `.ino`

### Prochain démarrage
**Étape 6/7 — Flash (reprise après redémarrage machine)**
1. Activer le hotspot Windows `Rvna_7.0`
2. Rebrancher le NodeMCU en USB
3. Arduino IDE → vérifier port COM → **Téléverser**
4. Ouvrir **Moniteur Série à 115200 baud** → valider les logs WiFi + MQTT
5. Si OK → Étape 7/7 : test end-to-end (MQTT → BDD → alertes)

**Mode de test actif : AUTO**

---

## Session 009 — 2026-06-15

### Ce qui a été fait
- Matériel IoT confirmé : Kit OSOYOO NodeMCU IoT Kit (ESP8266 + DHT11)
- Création `iot/esp8266/config.h` — DHT11 actif par défaut, pin D5, client ID `esp8266-br-wh001`
- Création `iot/esp8266/futurekawa_sensor.ino` — adaptation ESP8266 : `#include <ESP8266WiFi.h>` (seul changement vs ESP32), câblage D5 documenté dans les commentaires
- `iot/README.md` mis à jour : section "Option B" remplacée (OSOYOO, DHT11, câblage D5, setup Arduino IDE)
- `doc/guide-technique.md` section 5 mis à jour : matériel retenu, tableau composants, explication pin D5 (boot safety), comparatif ESP8266 vs ESP32

### Fichiers créés / modifiés
- `iot/esp8266/config.h` (nouveau)
- `iot/esp8266/futurekawa_sensor.ino` (nouveau)
- `iot/README.md` (section Option B réécrite)
- `doc/guide-technique.md` (section 5 Couche IoT mise à jour)

### Décisions clés actées
- Matériel retenu : ESP8266 (NodeMCU) + DHT11 — capteur inclus dans le kit OSOYOO
- Pin D5 (GPIO14) pour le DHT11 — évite les pins de boot (D3/D4/D8) sensibles sur ESP8266
- Seule différence firmware ESP8266 vs ESP32 : `#include <ESP8266WiFi.h>` — architecture découplée validée
- Dossier `iot/esp32/` conservé comme référence

### Prochain démarrage
**Bloc 5 — FIRMWARE ESP8266 PRÊT ✓**

**Mode de test actif : AUTO**

**Avant de flasher le NodeMCU :**
1. Renseigner `iot/esp8266/config.h` : `WIFI_SSID`, `WIFI_PASSWORD`, `MQTT_BROKER` (IP machine Docker), `WAREHOUSE_ID`
2. Câbler DHT11 sur D5 avec résistance 10kΩ pull-up
3. Brancher USB → Arduino IDE → sélectionner `NodeMCU 1.0 (ESP-12E Module)` + port COM → Téléverser
4. Moniteur Série 115200 baud pour valider les logs

**Bloc 6 — Auth (NextAuth.js)**
- Installer NextAuth.js v5 dans `backend-pays/` et `app-siege/`
- Provider Credentials (email + password hashé bcrypt en DB)
- Middleware protège toutes les routes `/api/*`
- Rôles : ADMIN (tout) / MANAGER_PAYS (son pays uniquement) / VIEWER (lecture seule)

---

## Session 012 — 2026-06-23

### Ce qui a été fait
- Flash ESP8266 confirmé KO sur Windows 10 également (KO W10 + W11) → décision définitive : simulateur Python = fallback IoT officiel
- Simulation IoT testée et validée end-to-end en Mode AUTO :
  - Scénario nominal Brésil : 3 messages MQTT → 3 mesures en base ✅
  - Scénario hors-seuil Brésil : 3 messages → 12 alertes (2 types × 2 lots actifs × 3 messages) ✅
  - Chaîne complète MQTT → TimescaleDB → alertes confirmée fonctionnelle
- `CLAUDE.md` mis à jour : section "Onboarding équipe" ajoutée
- `.claude/commands/onboarding.md` créé : tutoriel interactif 5 étapes pour nouveaux membres

### Fichiers créés / modifiés
- `CLAUDE.md` (section Onboarding équipe)
- `.claude/commands/onboarding.md` (nouveau)
- `doc/journal/SESSION-LOG.md`
- `doc/doc_prepa/futurekawa_notes.md` (décision flash + commande démo simulateur)

### Décisions clés actées
- Flash ESP8266 abandonné définitivement — simulateur Python = mode IoT officiel démo jury
- Onboarding via `/onboarding` : chaque nouveau membre passe par ce tutoriel avant de coder

### Prochain démarrage
**Bloc 5 — SIMULATEUR VALIDÉ ✓**

**Mode de test actif : AUTO**

**Bloc 6 — Auth (NextAuth.js)**
- Installer NextAuth.js v5 dans `backend-pays/` et `app-siege/`
- Provider Credentials (email + password hashé bcrypt en DB)
- Middleware protège toutes les routes `/api/*`
- Rôles : ADMIN (tout) / MANAGER_PAYS (son pays uniquement) / VIEWER (lecture seule)

---

## Session 013 — 2026-06-24

### Ce qui a été fait
- Bloc 8 — Alerting Node-RED : étapes 1 et 2 implémentées
- `POST /api/alerts` ajouté dans `backend-pays/app/api/alerts/route.ts`
  → validation des champs requis (lotId, type, message)
  → vérification que le type est un AlertType connu
  → vérification que le lot existe en base
  → création alerte + mise à jour statut lot dans une transaction atomique
  → protection : si lot déjà PERIME, son statut n'est pas écrasé
- Service `node-red` ajouté dans `docker-compose.yml`
  → image `nodered/node-red:latest`, port 1880
  → volume `./backend-pays/node-red:/data` pour versionner les flows
  → `extra_hosts: host.docker.internal:host-gateway` (cross-plateforme Windows + Linux)
  → variable `BACKEND_PAYS_URL` pour appeler le backend depuis le conteneur
- Dossier `backend-pays/node-red/` créé (`.gitkeep` — flows à venir étape 3)
- `.env.example` mis à jour : `BACKEND_PAYS_URL` documentée
- `README.md` mis à jour : Node-RED dans le tableau des services, variable BACKEND_PAYS_URL, ESP32 → ESP8266/simulateur
- Branche `feat(alerting)` créée depuis `develop` — commits poussés sur cette branche

### Fichiers créés / modifiés
- `backend-pays/app/api/alerts/route.ts` (POST ajouté)
- `docker-compose.yml` (service node-red ajouté)
- `backend-pays/node-red/.gitkeep` (nouveau)
- `.env.example` (BACKEND_PAYS_URL ajoutée)
- `README.md` (Node-RED + BACKEND_PAYS_URL + ESP8266)
- `doc/journal/SESSION-LOG.md`

### Décisions clés actées
- Node-RED appelle `POST /api/alerts` (pas d'accès direct DB) — conforme ADR-0007
- `extra_hosts: host.docker.internal:host-gateway` = solution cross-plateforme Docker officielle
- Branche `feat(alerting)` isolée de `develop` — PR en fin de bloc

### Prochain démarrage
**Bloc 8 — Étapes 1 et 2 terminées ✓**

**Mode de test actif : AUTO**

**Étape 3/5 — Créer le flow Node-RED (`backend-pays/node-red/flows.json`)**
- Flow 1 : MQTT in (`futurekawa/mesure`) → vérification seuils par pays → POST /api/alerts → email
- Flow 2 : cron péremption → interroger GET /api/lots → POST /api/alerts si lot > 365 jours

---

## Session 014 — 2026-06-25

### Ce qui a été fait
- Bloc 8 — Alerting Node-RED : étape 3 implémentée
- `backend-pays/lib/mqtt-worker.ts` : suppression de l'appel à `checkMeasurementAlerts`
  → Le backend ne crée plus d'alertes lui-même — Node-RED est le seul responsable (ADR-0007)
- `backend-pays/instrumentation.ts` : suppression de l'appel à `checkAllLotExpirations`
  → La vérification de péremption au démarrage est remplacée par le cron quotidien Node-RED
- `backend-pays/node-red/package.json` : créé pour installer `node-red-node-email` automatiquement
- `backend-pays/node-red/flows.json` : créé avec deux flows complets
  → Flow 1 : MQTT mesure → vérification seuils → GET lots actifs → POST /api/alerts × lot → email
  → Flow 2 : cron quotidien → GET tous lots → filtrer > 365 jours → POST /api/alerts → email
- `.env.example` : variables SMTP ajoutées (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `ALERT_EMAIL_TO`)
- Test E2E reporté au Bloc 9 (décision : pas de données en base pour un test manuel)
- Node-RED vérifié visuellement : flows chargés et visibles sur `http://localhost:1880`

### Fichiers créés / modifiés
- `backend-pays/lib/mqtt-worker.ts` (suppression checkMeasurementAlerts)
- `backend-pays/instrumentation.ts` (suppression checkAllLotExpirations)
- `backend-pays/node-red/package.json` (nouveau)
- `backend-pays/node-red/flows.json` (nouveau)
- `.env.example` (variables SMTP)

### Décisions clés actées
- Suppression de la logique d'alerte du backend → zéro doublon possible
- Test E2E = Bloc 9 (base de test dédiée, nettoyage automatique après chaque test)
- SMTP credentials configurés via l'UI Node-RED (`http://localhost:1880`) — jamais en clair dans le code

### Prochain démarrage
**Bloc 8 — TERMINÉ ✓ (tests E2E au Bloc 9)**

**Mode de test actif : AUTO**

**Bloc 6 — Auth (NextAuth.js)**
- Installer NextAuth.js v5 dans `backend-pays/` et `app-siege/`
- Provider Credentials (email + password hashé bcrypt)
- Middleware protège toutes les routes `/api/*`
- Rôles : ADMIN / MANAGER_PAYS / VIEWER
