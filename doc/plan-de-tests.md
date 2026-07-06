# Plan de tests — FutureKawa

Livrable 4.3 du cahier des charges. Décrit la stratégie de test, la typologie,
les cas de test, les données, les critères de réussite et la gestion des anomalies.

---

## 1. Objectifs

- Vérifier la conformité du code métier au cahier des charges (règles d'alerte,
  FIFO, sécurité des API, ingestion MQTT, agrégation siège).
- Détecter les régressions avant mise en production (intégration continue).
- Garantir un niveau de qualité mesurable : **couverture ≥ 80 %** sur le code métier.

## 2. Stratégie et typologie

| Type | Couvert ? | Outil / approche |
|---|---|---|
| **Unitaires** | ✅ | Vitest — fonctions pures et helpers (guards de rôles, agrégations) |
| **Intégration** | ✅ | Vitest + **base Postgres réelle dédiée** (règles d'alerte, ingestion MQTT → BDD) |
| **API** | ✅ | Vitest — appel direct des route handlers Next.js (GET/POST, codes retour, sécurité `x-api-key`) |
| **Tests de mutation** | ✅ (bonus) | Stryker — mesure la pertinence des tests (mutants tués) |
| **UI (composants)** | ❌ (assumé) | L'interface est validée par **exécution manuelle** (démo). Non couverte en tests unitaires — choix assumé : priorité donnée à la logique métier et aux API. |
| **End-to-end** | ❌ (assumé) | Non automatisé sur le prototype ; scénario de démonstration reproductible à la place. |

**Justification** : le CDC demande un « niveau de qualité projet ». On concentre
l'effort automatisé sur la **logique métier et les API** (le cœur du risque), et on
valide l'UI par démonstration. Une extension possible (phase d'industrialisation) :
tests de composants (React Testing Library) et E2E (Playwright).

## 3. Environnement de test

- **Base dédiée `db-test`** (service docker-compose, port hôte **5433**), isolée de
  la base de démo (5432) → les tests ne détruisent jamais les données de démonstration.
- Schéma + données de référence (pays, entrepôts) préparés automatiquement par le
  `globalSetup` Vitest (`prisma generate` + `migrate deploy` + `db seed`).
- Réinitialisation des tables transactionnelles (lots, mesures, alertes, users)
  avant chaque test (`beforeEach`) → tests indépendants.
- **Dépendances externes mockées** : `nodemailer` (aucun email réel envoyé),
  broker MQTT simulé pour le worker.

## 4. Cas de test

### backend-pays (26 tests)

| Fichier | Cas de test | Critère de réussite |
|---|---|---|
| `alert-rules.test.ts` | Température hors seuil → alerte `SEUIL_TEMPERATURE` + lot `EN_ALERTE` | Alerte créée, statut mis à jour |
| | Mesure dans les seuils → aucune alerte | 0 alerte |
| | Lot > 365 j → alerte `PEREMPTION` + lot `PERIME` | Alerte créée, statut `PERIME` |
| `mqtt-worker.test.ts` | Message MQTT valide → mesure persistée | Enregistrement en BDD |
| | Payload non-JSON / invalide → ignoré | Aucune mesure créée |
| `api-routes.test.ts` | CRUD lots, mesures, alertes (GET/POST) | Codes 200/201/400 conformes |
| `lots-api.test.ts` | Création et lecture de lots | Données cohérentes |
| `auth-api.test.ts` | Login / register / vérification email | Codes conformes, bcrypt |
| `proxy.test.ts` | Clé de service `x-api-key` requise sur `/api/*` | 401 sans clé, 200 avec |

### app-siege (19 tests)

| Fichier | Cas de test | Critère de réussite |
|---|---|---|
| `auth-guards.test.ts` | Helpers de rôles (ADMIN / MANAGER_PAYS / VIEWER) | Autorisations correctes |
| `backend.test.ts` | `backendFetch` envoie l'en-tête M2M `x-api-key` | En-tête présent |
| | `getWarehouses` filtre par pays selon le rôle | Filtrage correct |
| | `getLots` trié **FIFO** (plus ancien d'abord) | Ordre chronologique |
| | `getLotDetail` renvoie `null` si erreur/refus | `null` |
| | `getDashboardStats` (KPIs consolidés) | Totaux corrects |
| | `getMeasurements` trié par date | Ordre croissant |
| | `getLotAlerts`, `getAlerts` | Données consolidées |
| | `getConditionsTrend` (moyennes journalières) | Moyennes correctes, entrepôts filtrés |
| `proxy.test.ts` | Anonyme sur route privée → redirection `/login` | 307 vers /login |
| | Anonyme sur route publique → autorisé | 200 |
| | Connecté sur `/login` → redirection `/` | 307 vers / |
| | Connecté sur route privée → autorisé | 200 |
| `locale-actions.test.ts` | `setLocale` écrit le cookie de langue | Cookie posé (1 an) |

## 5. Données de test

- **Référentiel** : 3 pays (BR/EC/CO avec leurs seuils) + 6 entrepôts, issus du seed.
- **Transactionnel** : créé à la volée par chaque test (lots, mesures, alertes),
  puis nettoyé (`beforeEach`).
- **Mocks** : réponses `fetch` simulées côté siège ; store de cookies mocké.

## 6. Critères de réussite

- **100 % des tests passent** (45 tests : 26 backend + 19 siège).
- **Couverture ≥ 80 %** sur le code métier (lignes / fonctions / statements),
  seuil **enforced** dans `vitest.config.ts` (le run échoue sinon).
  - Actuel : backend ~85 %, logique siège ~97 %.
- Intégration continue verte (Jenkins) : install → lint → tests+couverture → build → packaging.

## 7. Gestion des anomalies (constat → correction → re-test)

Journal des anomalies détectées et traitées lors de la mise en route des tests :

| Constat | Correction | Re-test |
|---|---|---|
| `npm install` échoue (paquets Stryker/`@types/vitest`/`vite-tsconfig-paths` en versions inexistantes) | Versions valides (`@stryker-mutator/*@^8.7.1`, bon paquet `vitest-runner`) ; paquets inutiles retirés | Install OK |
| `prisma generate` échoue (Prisma 7 : `url` interdit dans `schema.prisma`) | URL déplacée dans `prisma.config.ts` uniquement | generate/migrate OK |
| Tests en échec : `AuthenticationFailed` (le client Prisma ciblait la mauvaise base en test) | `lib/prisma.ts` utilise `DATABASE_URL` (base de test 5433) | 26/26 backend ✅ |
| `proxy.test.ts` (siège) : n'importait pas le middleware testé + `require` d'un alias | Réécriture (mock via `vi.hoisted`, import du middleware) | 4/4 ✅ |
| Risque d'écrasement des données de démo par les tests | Base de test **dédiée** (`db-test`, 5433) isolée | Données de démo préservées |

## 8. Exécution

- **Manuelle** : voir `README.md` (section « Tests automatisés et couverture »).
- **CI (Jenkins)** : `Jenkinsfile` — stages *Base de test → Tests + Couverture*,
  avec archivage des rapports de couverture (preuve d'exécution).
