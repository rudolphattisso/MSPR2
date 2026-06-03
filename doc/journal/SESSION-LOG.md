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
- [x] Structure de dossiers créée (`backend-pays/`, `backend-siege/`, `frontend/`, `shared/types/`, `iot/`)
- [ ] Initialiser les 2 projets Next.js : `frontend/` et `backend-pays/`
- [ ] Poser le `docker-compose.yml` de base (service PostgreSQL + TimescaleDB + Mosquitto)
- [ ] Initialiser Prisma dans `backend-pays/`

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
**Bloc 1 — Init monorepo (suite)**
- [x] Initialiser `app-siege/` — Next.js 15, TypeScript, App Router, Tailwind, ESLint
- [x] Initialiser `backend-pays/` — Next.js 15, TypeScript, App Router, sans Tailwind, ESLint
- [x] `.gitignore` racine mis à jour (node_modules, .next, .env, logs)
- [ ] Poser le `docker-compose.yml` de base (PostgreSQL/TimescaleDB + Mosquitto)
- [ ] Initialiser Prisma dans `backend-pays/`
