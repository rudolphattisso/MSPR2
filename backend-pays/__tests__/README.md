# Tests automatisés backend-pays

Ce dossier contient les tests unitaires et d'intégration pour `backend-pays`.

## Commandes disponibles

- `npm run test` → exécute les tests Vitest.
- `npm run coverage` → génère le rapport de couverture.
- `npm run mutation` → lance Stryker pour les tests de mutation.

## Fichiers importants

- `vitest.config.ts` → configuration Vitest.
- `stryker.conf.json` → configuration Stryker.
- `__tests__/setup.ts` → initialisation de l'environnement de test.
- `__tests__/alert-rules.test.ts` → tests métier pour les alertes.
- `__tests__/auth-api.test.ts` → tests API d'authentification.
- `__tests__/lots-api.test.ts` → tests API de création et de listing de lots.
