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
**Bloc 1 — Init monorepo**
- Créer la structure de dossiers (`backend-pays/`, `backend-siege/`, `frontend/`, `shared/types/`, `iot/`)
- Initialiser les 3 projets Next.js (`npx create-next-app`)
- Poser le `docker-compose.yml` de base (service PostgreSQL + TimescaleDB + Mosquitto)
- Initialiser Prisma dans `backend-pays/`
