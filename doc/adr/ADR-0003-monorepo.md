# ADR-0003 — Organisation du dépôt : monorepo

- **Date :** 2026-06-02
- **Statut :** Accepté
- **Décideurs :** Équipe FutureKawa

---

## Contexte

Le projet comporte plusieurs applications distinctes : backend pays, backend siège, frontend, code IoT. La question est de savoir si ces applications vivent dans un seul dépôt Git (monorepo) ou dans des dépôts séparés.

L'équipe est composée de 4 développeurs travaillant en parallèle sur des périmètres qui se chevauchent (types partagés, Docker Compose, CI/CD).

---

## Options évaluées

### Option A — Multi-repos
Un dépôt Git par application (`futurekawa-backend-pays`, `futurekawa-backend-siege`, `futurekawa-frontend`, `futurekawa-iot`).

**Avantages :** isolation stricte, pipelines CI/CD indépendants par app.

**Inconvénients :**
- Synchronisation des types TypeScript partagés entre apps complexe (packages npm privés ou copie manuelle)
- Coordination entre dépôts difficile pour une équipe de 4 en contexte scolaire
- Docker Compose global (qui lance tout) difficile à maintenir en dehors des repos
- Overhead de gestion : 4 repos, 4 pipelines, 4 README

---

### Option B — Monorepo simple *(retenu)*
Un seul dépôt Git avec les applications dans des sous-dossiers :

```
mspr2/
├── backend-pays/
├── backend-siege/
├── frontend/
├── iot/
├── doc/
├── Jenkinsfile
└── docker-compose.yml
```

**Avantages :**
- Un seul `git clone`, un seul pipeline Jenkins à maintenir
- Les types TypeScript partagés sont accessibles par import relatif ou package local
- Le `docker-compose.yml` racine lance toute la stack en une commande
- Vision globale du projet pour le jury
- Coordination simplifiée pour une équipe de 4 en contexte projet école

**Inconvénients :**
- Un seul pipeline : si le backend pays casse, le pipeline global est rouge même si le frontend est stable
- Taille du dépôt plus importante (node_modules multiples si pas de workspace)

### Option C — Monorepo avec Turborepo
Monorepo géré par un outil dédié (Turborepo, Nx) pour le cache de build et l'orchestration des workspaces.

**Inconvénients :** overhead d'apprentissage non justifié pour un projet de cette durée et de cette taille.

---

## Décision retenue

**Option B — Monorepo simple**, sans outil de gestion de monorepo supplémentaire.

Chaque application a son propre `package.json`. Les types partagés (ex: interfaces des réponses API) sont centralisés dans un dossier `shared/` importé localement.

---

## Conséquences

- La charte de commits utilise des scopes pour distinguer les apps (`backend-pays`, `frontend`, etc.)
- Le `docker-compose.yml` racine est la source de vérité pour lancer la stack complète
- Le Jenkinsfile définit des stages par application pour isoler les résultats de build/test
