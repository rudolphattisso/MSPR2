Tu es en mode **test de fin de bloc — FutureKawa**.
Tu valides que ce qui vient d'être implémenté fonctionne correctement
avant de passer au bloc suivant.

## Entrée

Arguments : $ARGUMENTS
→ Si `guidé` (ou `GUIDÉ`) est dans les arguments → Mode GUIDÉ
→ Sinon → Mode AUTO (défaut)

---

## Étape 0 — Lecture du contexte

Avant de tester quoi que ce soit :

1. Lis `doc/journal/SESSION-LOG.md` — identifie le **dernier bloc implémenté**
   et ce qu'il contient (routes créées, services lancés, migrations, etc.)
2. Lis `CLAUDE.md` section "Roadmap" — confirme le périmètre du bloc
3. Annonce en une phrase : "Je vais tester le Bloc X — [description]"

---

## MODE AUTO

> Claude exécute tous les tests, affiche commandes + résultats en temps réel.

### Déroulé

**1. Infrastructure Docker**
- Vérifie que `futurekawa-db` et `futurekawa-mqtt` tournent : `docker ps`
- Vérifie que le port 5432 est publié sur l'hôte : `docker inspect futurekawa-db`
- Si port non publié → `docker-compose up -d --force-recreate db` (demande GO d'abord)
- Vérifie la connexion BDD : `docker exec futurekawa-db pg_isready -U futurekawa`

**2. État de la base de données** (si le bloc touche à la BDD)
- Liste les tables : `docker exec futurekawa-db psql -U futurekawa -d futurekawa -c "\dt"`
- Vérifie les seeds selon le bloc :
  - Countries : 3 lignes (BR, EC, CO)
  - Lots : 9 lignes réparties CONFORME / EN_ALERTE / PERIME

**3. Serveur applicatif** (si le bloc implémente une API)
- Vérifie qu'un processus Next.js écoute sur le port attendu (3000 ou 3001)
- Si le serveur n'est pas démarré → indique la commande à lancer et attends confirmation

**4. Tests des routes API** (adapter selon le bloc)

Pour chaque route implémentée dans le bloc :
- GET → vérifier status 200 + structure de la réponse
- POST → créer un enregistrement de test + vérifier 201 + contenu
- PATCH → modifier l'enregistrement de test + vérifier 200
- DELETE → supprimer l'enregistrement de test + vérifier 204 + 404 après

Données de test à utiliser (IDs stables des seeds) :
- Entrepôt Brésil : `00000000-0000-0000-0000-000000000001`
- Entrepôt Équateur : `00000000-0000-0000-0000-000000000002`
- Entrepôt Colombie : `00000000-0000-0000-0000-000000000003`

**5. Tests des règles métier** (si le bloc implémente des alertes)
- POST une mesure hors seuil pour le Brésil : temp 38°C, humidité 70%
  (seuils Brésil : 29±3°C / 55±2%)
- Vérifier que GET /api/alerts retourne des alertes SEUIL_TEMPERATURE + SEUIL_HUMIDITE
- Vérifier que les lots de l'entrepôt sont passés EN_ALERTE

**6. Test MQTT end-to-end** (si le bloc implémente un worker MQTT)
- Publier un message via mosquitto_pub :
  ```
  docker exec futurekawa-mqtt mosquitto_pub -h localhost -p 1883 \
    -t "futurekawa/mesure" \
    -m '{"warehouseId":"<id_entrepôt>","temperature":<valeur>,"humidity":<valeur>}'
  ```
- Vérifier que la mesure est bien insérée en base et que les alertes sont créées

**7. Nettoyage**
- Supprimer les données de test créées pendant les tests
- Remettre la base dans son état seed d'origine

### Rapport final

Affiche un tableau récapitulatif :

```
## Résultat des tests — Bloc X

| Composant | Test | Résultat |
|-----------|------|----------|
| Infrastructure | Docker containers actifs | ✅ / ❌ |
| BDD | Tables + seeds présents | ✅ / ❌ |
| GET /api/[route] | ... | ✅ / ❌ |
| POST /api/[route] | ... | ✅ / ❌ |
| ...           | ... | ✅ / ❌ |
```

- Si tout est ✅ → "Bloc X validé — prêt pour le Bloc suivant"
- Si un ❌ → analyser la cause, **présenter un plan de correction + attendre GO** avant de toucher au code

---

## MODE GUIDÉ

> Claude génère un protocole numéroté. L'utilisateur exécute et rapporte.

### Format du protocole

```
## Protocole de test — Bloc X
Mode : GUIDÉ — exécute chaque étape et rapporte le résultat.

---

### Étape 1 — [Nom]
**Commande :**
```
[commande exacte à copier-coller]
```
**Résultat attendu :**
[ce que tu dois voir pour que ça soit OK]

**Rapport :** OK / KO + colle le résultat si KO

---

### Étape 2 — ...
```

Génère toutes les étapes adaptées au bloc en cours, en t'appuyant
sur les mêmes vérifications que le Mode AUTO (infrastructure, BDD,
routes API, règles métier, MQTT si applicable).

Termine par :
```
---
Quand tu as exécuté toutes les étapes, colle ici les éventuels KO
et je les analyse.
```

---

## Règles communes aux deux modes

- Ne jamais corriger un bug sans présenter un plan + attendre le GO explicite
- Toujours nettoyer les données de test créées (lot TEST-*, mesures de test)
- Si un service n'est pas démarré et qu'il faut le lancer → indiquer la commande
  et attendre que l'utilisateur confirme avant de continuer
- À la fin des tests : mettre à jour SESSION-LOG.md avec le résultat
  (✅ validé ou ❌ bugs restants à corriger)
