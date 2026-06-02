# ADR-0006 — CI/CD avec Jenkins

- **Date :** 2026-06-02
- **Statut :** Accepté
- **Décideurs :** Équipe FutureKawa

---

## Contexte

Le cahier des charges impose des pipelines CI/CD et cite explicitement Jenkins dans les livrables attendus (livrable 5 : "Jenkinsfile ou configuration Jenkins documentée + preuve d'exécution").

La question n'est pas de choisir entre Jenkins et autre chose — Jenkins est une exigence — mais de définir comment l'intégrer dans le projet.

---

## Options évaluées

### Option A — GitHub Actions
CI/CD via GitHub Actions, plus moderne, YAML natif, intégration GitHub directe.

**Pourquoi écarté :** le cahier des charges exige explicitement Jenkins. GitHub Actions peut coexister (ex : lint rapide sur PR) mais ne remplace pas le Jenkinsfile attendu par le jury.

---

### Option B — Jenkins seul *(retenu)*
Pipeline défini dans un `Jenkinsfile` à la racine du monorepo, exécuté sur une instance Jenkins (locale ou serveur).

**Avantages :**
- Répond directement à l'exigence du sujet
- Jenkinsfile versionné dans le repo = pipeline as code
- Stages clairement identifiables pour la démo jury

---

## Décision retenue

**Jenkins avec Jenkinsfile déclaratif** à la racine du monorepo.

### Structure du pipeline

```groovy
pipeline {
  stages {
    stage('Install')   { /* npm ci pour chaque app */ }
    stage('Lint')      { /* ESLint TypeScript */ }
    stage('Test')      { /* Jest unitaires + intégration */ }
    stage('Build')     { /* next build pour chaque app */ }
    stage('Package')   { /* docker build images */ }
    stage('Archive')   { /* archiver artefacts */ }
  }
}
```

### Stratégie d'évolution

Le pipeline est posé **tôt (Bloc 3)** avec des stages minimalistes (install + lint), puis enrichi au fil des blocs :
- Bloc 4 → ajout stage Test (backend pays)
- Bloc 8 → ajout stage Package Docker
- Bloc 10 → ajout stage rapport de couverture

---

## Conséquences

- Un `Jenkinsfile` unique à la racine gère les trois apps (backend-pays, backend-siege, frontend)
- Chaque stage est paramétré par `dir('backend-pays') { ... }` pour isoler les apps
- La preuve d'exécution (capture ou log) est conservée dans `doc/ci/`
- Les images Docker produites par le pipeline sont nommées `futurekawa/<app>:<build-number>`
