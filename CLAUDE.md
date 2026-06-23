# CLAUDE.md — FutureKawa

Mémoire persistante. À lire au début de chaque session.

---

## Détection nouveau membre — PRIORITÉ ABSOLUE

**Au tout début de chaque session, avant toute autre chose, Claude pose cette question :**

> "Est-ce ta première session sur ce projet ?"

- Si **oui** → lancer immédiatement le tutoriel `/onboarding` avant de faire quoi que ce soit d'autre
- Si **non** → lire `doc/journal/SESSION-LOG.md` et reprendre normalement

Ne jamais supposer que l'utilisateur connaît le workflow. En cas de doute → proposer `/onboarding`.

---

## Mode de travail — RÈGLE FONDAMENTALE

1. Présenter le plan numéroté avant tout développement
2. Attendre le GO explicite avant de commencer
3. Implémenter UNE seule étape à la fois
4. Résumer ce qui a été fait à la fin de chaque étape
5. Demander explicitement la validation avant la suivante
6. Ne jamais enchaîner sans confirmation

### Format plan
```
## Plan d'implémentation
Étape 1 : [description courte]
Étape 2 : [description courte]
On commence par l'étape 1 ?
```

### Format fin d'étape
```
## Étape X/N terminée
- Ce qui a été fait : [résumé]
- Fichiers modifiés : [liste]
- Point d'attention : [si besoin]

## Checklist de clôture
- [ ] SESSION-LOG.md mis à jour (résumé + "Prochain démarrage")
- [ ] glossaire.md complété (nouveaux termes techniques)
- [ ] doc/doc_prepa/futurekawa_notes.md complété (décisions ou points clés nouveaux)
- [ ] README.md mis à jour (si nouveau service Docker, dépendance ou commande)

Prêt pour l'étape suivante ?
```

### Règles supplémentaires
- Si une étape est trop grosse → la découper
- Si un problème détecté → le signaler AVANT de coder
- Toujours expliquer le POURQUOI d'un choix technique
- En cas de doute sur le périmètre → poser la question
- **README.md** : toute addition/modification d'environnement (nouveau service Docker, nouvelle dépendance, nouvelle commande d'init) doit être répercutée dans `README.md` avant de clore l'étape — montrer le diff au user pour validation avant écriture

**Documents à maintenir à chaque session :**
- `README.md` : nouveau service Docker, dépendance, commande d'init
- `doc/journal/SESSION-LOG.md` : résumé de la session + champ "Prochain démarrage"
- `doc/glossaire.md` : tout nouveau terme technique introduit dans la session
- `doc/doc_prepa/futurekawa_notes.md` : toute décision ou point clé nouveau

---

## Tests de fin de bloc — RÈGLE

**À la fin de chaque bloc, Claude teste systématiquement ce qui vient d'être mis en place.**

Deux modes disponibles — le mode actif est indiqué dans le SESSION-LOG. Taper `MODE AUTO` ou `MODE GUIDÉ` à tout moment pour changer.

### Mode AUTO (actif par défaut)
Claude exécute tous les tests et affiche les résultats en temps réel :
- Commandes lancées visibles avec leur sortie
- Bugs détectés et corrigés dans la foulée (avec plan + GO avant correction)
- Rapport final sous forme de tableau ✅/❌

### Mode GUIDÉ
Claude génère un protocole de test que l'utilisateur exécute lui-même, pas à pas :
- Étapes numérotées avec commandes exactes à copier-coller
- Résultat attendu pour chaque étape
- Critères de validation explicites (ce que tu dois voir pour que ça soit OK)
- L'utilisateur rapporte le résultat, Claude analyse et oriente si ça ne passe pas

---

## Projet

**FutureKawa** — Plateforme de suivi des stocks et des conditions de stockage de grains de café, multi-pays, avec intégration IoT.

- **Moi** : backend-pays, app-siege (UI + agrégation), schémas BDD, seeds, Docker, CI/CD
- **Coéquipiers** : répartition à définir (ownership par bloc à préciser en début de sprint)
- **Architecture** : backends pays indépendants (Brésil / Équateur / Colombie) + app-siege (agrégateur siège + UI web)

---

## Structure du dépôt

```
mspr2/                          ← monorepo
├── backend-pays/               ← Next.js API (port 3001) — API locale + ingestion MQTT
├── backend-siege/              ← dossier vide (fusionné dans app-siege — voir ADR-0002)
├── app-siege/                  ← Next.js UI + agrégateur siège (port 3000)
├── shared/
│   └── types/                  ← interfaces TypeScript partagées entre apps
├── iot/                        ← code microcontrôleur (à préciser selon matériel fourni)
├── doc/
│   ├── adr/                    ← décisions architecturales (ADR-0001 à ADR-0009)
│   ├── journal/                ← SESSION-LOG.md
│   └── COMMIT_CHARTER.md
├── Jenkinsfile                 ← pipeline CI/CD
├── docker-compose.yml          ← stack complète démarrable
└── README.md
```

---

## Stack technique

| Composant | Technologie |
|---|---|
| backend-pays (API locale) + app-siege (UI + agrégation siège) | Next.js 15 App Router + TypeScript |
| ORM | Prisma |
| BDD relationnelle + timeseries | PostgreSQL 16 + TimescaleDB |
| Broker MQTT | Eclipse Mosquitto (Docker) |
| Alerting email | Node-RED (Docker) |
| Authentification | NextAuth.js v5 |
| IoT | ESP32 + capteur temp/humidité (protocole à préciser selon matériel) |
| CI/CD | Jenkins (Jenkinsfile déclaratif) |
| Conteneurisation | Docker Compose |

**Seuils métier par pays :**

| Pays | Temp. idéale | Tolérance | Humidité idéale | Tolérance |
|---|---|---|---|---|
| Brésil | 29°C | ±3°C | 55% | ±2% |
| Équateur | 31°C | ±3°C | 60% | ±2% |
| Colombie | 26°C | ±3°C | 80% | ±2% |

Lot dépassant **365 jours** de stockage → alerte péremption automatique.

---

## Décisions actives

| ADR | Décision |
|---|---|
| ADR-0001 | PostgreSQL + TimescaleDB — MongoDB écarté (prototype), dette documentée |
| ADR-0002 | Architecture distribuée pays ↔ siège — backends pays indépendants, agrégation dans app-siege/ |
| ADR-0003 | Monorepo simple — un seul repo, pas de Turborepo |
| ADR-0004 | Next.js homogène pour deux apps — backend-pays (API) + app-siege (UI + agrégation siège) |
| ADR-0005 | NextAuth.js posé dès Bloc 6 — dette technique trop lourde si reporté |
| ADR-0006 | Jenkins + Jenkinsfile — exigence explicite du cahier des charges |
| ADR-0007 | Node-RED pour l'alerting — recommandé par le sujet, découplé, réversible |
| ADR-0008 | MQTT v3.1.1 + Mosquitto — standard IoT, QoS 1 pour les mesures |
| ADR-0009 | Prisma ORM — maturité, migrations versionnées, Prisma Studio |

Détail dans `doc/adr/`.

---

## Roadmap (état macro)

```
[x] Bloc 1  — Init monorepo
              Structure dossiers, docker-compose.yml de base,
              Prisma init, service Mosquitto

[x] Bloc 2  — Socle BDD
              Schémas Prisma (pays, entrepôts, lots, mesures, alertes, users)
              TimescaleDB hypertable, seeds 3 pays

[x] Bloc 3  — CI Jenkins (squelette)
              Jenkinsfile : install + lint + placeholder tests

[x] Bloc 4  — Backend pays
              API REST CRUD lots, ingestion MQTT → TimescaleDB
              Règles d'alerte seuils + péremption
              ↳ Testé session 006 — onDelete: Cascade corrigé

[x] Bloc 5  — IoT
              Firmware ESP32 (config.h isolé, extensible tout capteur)
              Simulateur Python 3 scénarios (nominal / hors-seuil / limite)
              Testé session 007 ✓

[ ] Bloc 6  — Auth
              NextAuth.js, login, middleware protège-routes, rôles

[ ] Bloc 7  — Frontend + Agrégateur siège  ← fusion anciens Blocs 7 & 8
              API agrégateur dans frontend/app/api/ (stocks, mesures, alertes)
              UI lots triés FIFO, courbes temp/humidité
              Statuts alertes, sélection pays/entrepôt

[ ] Bloc 8  — Alerting Node-RED
              Flow MQTT → règles → email responsable
              Service Node-RED dans docker-compose

[ ] Bloc 9  — Tests (consolidation)
              Couverture unitaire + intégration + API
              Plan de tests livrable MSPR

[ ] Bloc 10 — Livrables MSPR finaux
              Schéma proto automatisation phase 2
              Questionnaire interview client
              Documentation utilisateur métier
```

Détail complet dans `ROADMAP.md` (à créer).

---

## Reprendre une session (30 secondes)

1. Lire `doc/journal/SESSION-LOG.md` — dernière entrée
2. Champ **"Prochain démarrage"** = première action à faire
3. Coder

---

## Onboarding équipe — Première fois sur ce projet

### 1. Installer Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

Ouvrir un terminal **à la racine de ce repo** et lancer `claude`.

### 2. Démarrer sa première session

Dire à Claude :
> "Je suis [prénom], je rejoins le projet FutureKawa. Présente-moi l'état du projet et dis-moi où en est l'équipe."

Claude lira ce fichier + `doc/journal/SESSION-LOG.md` et donnera le contexte complet sans qu'on ait à tout ré-expliquer.

### 3. Règles absolues — à ne jamais contourner

> Ces règles s'appliquent à tous les membres de l'équipe, sans exception.

**Règle 1 — Aucun code sans plan validé.**
Claude présente toujours un plan numéroté avant d'écrire la moindre ligne de code.
Tu dois répondre explicitement **"oui"** ou **"go"** pour déclencher l'implémentation.
Si Claude commence à coder sans plan → l'arrêter immédiatement et lui demander le plan.

**Règle 2 — Une étape à la fois.**
Claude n'enchaîne jamais deux étapes sans confirmation entre les deux.
Même si une tâche semble triviale, le GO est obligatoire à chaque étape.

**Règle 3 — Expliquer avant de choisir.**
Pour chaque choix technique, Claude explique le POURQUOI avant de l'implémenter.
Si tu ne comprends pas un choix → poser la question avant le GO.

**Règle 4 — Tester à la fin de chaque bloc.**
Claude teste systématiquement ce qui vient d'être implémenté.
Mode par défaut : AUTO (Claude exécute + affiche les résultats).
Taper `MODE GUIDÉ` si tu préfères exécuter toi-même les commandes.

**Règle 5 — Toujours fermer la session proprement.**
Avant de fermer, demander à Claude de mettre à jour :
- `doc/journal/SESSION-LOG.md` (résumé + champ "Prochain démarrage")
- `doc/glossaire.md` (nouveaux termes introduits dans la session)
- `README.md` (si nouveau service Docker, nouvelle dépendance ou commande)

### 4. Commandes utiles en session

| Ce que tu tapes | Ce que Claude fait |
|---|---|
| `reprends la session` | Lit SESSION-LOG et repart du bon endroit |
| `où en est-on ?` | Résume l'état du projet et le prochain bloc |
| `MODE GUIDÉ` | Tests pas à pas — toi tu exécutes, Claude analyse |
| `MODE AUTO` | Tests automatiques — Claude exécute et affiche |
| `/save-session` | Clôture propre de la session (met à jour tous les docs) |

### 5. Lire avant de toucher à quoi que ce soit

| Document | Contenu |
|---|---|
| `doc/journal/SESSION-LOG.md` | Historique des sessions + état actuel + prochain démarrage |
| `doc/guide-technique.md` | Architecture détaillée, ERD, flux MQTT, stack |
| `doc/adr/` | Toutes les décisions techniques et leur justification |
| `README.md` | Commandes de démarrage de la stack Docker |
| `doc/glossaire.md` | Définitions des termes techniques du projet |

