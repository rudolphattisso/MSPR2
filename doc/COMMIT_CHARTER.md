# Charte de commit — FutureKawa

## Format

```
<type>(<scope>): <description courte>
```

- Description en **français**, impératif présent
- Max **72 caractères** sur la première ligne
- Pas de point final
- Corps optionnel après une ligne vide (expliquer le **POURQUOI**)

---

## Types

| Type | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `chore` | Maintenance (deps, config, tooling) |
| `test` | Ajout ou modification de tests |
| `docs` | Documentation uniquement |
| `refactor` | Refactoring sans changement fonctionnel |
| `ci` | Pipeline Jenkins |

---

## Scopes

| Scope | Périmètre |
|---|---|
| `backend-pays` | API Next.js pays local |
| `app-siege` | UI Next.js + agrégation siège |
| `iot` | Code ESP32 / microcontrôleur |
| `auth` | Authentification NextAuth.js |
| `db` | Schémas Prisma, migrations, seeds |
| `docker` | Docker Compose, Dockerfiles |
| `node-red` | Flows Node-RED alerting |
| `ci` | Jenkinsfile, configuration pipeline |

---

## Exemples

```
feat(backend-pays): ajouter route POST /api/lots
fix(backend-pays): corriger seuil humidité Colombie
feat(auth): mettre en place NextAuth.js avec JWT
feat(db): ajouter hypertable TimescaleDB mesures
ci: ajouter stage package Docker au Jenkinsfile
docs(iot): ajouter schéma câblage DHT22-ESP32
chore(docker): aligner versions services Compose
test(backend-pays): ajouter tests route GET /api/lots
```

---

## Branches

| Branche | Rôle |
|---|---|
| `main` | Stable — livrable jury uniquement |
| `develop` | Intégration continue — base de travail |
| `feature/<nom>` | Nouvelle fonctionnalité (ex: `feature/api-lots`) |
| `fix/<nom>` | Correction (ex: `fix/seuils-colombie`) |

## Règles de merge

- `feature/*` → `develop` : Pull Request avec review (au moins 1 approbation)
- `develop` → `main` : Pull Request, uniquement sur jalon validé
- Jamais de commit direct sur `main`
