# ADR-0002 — Architecture distribuée pays ↔ siège

- **Date :** 2026-06-02
- **Statut :** Accepté
- **Décideurs :** Équipe FutureKawa

---

## Contexte

FutureKawa opère dans trois pays (Brésil, Équateur, Colombie). Chaque pays dispose de ses propres entrepôts, capteurs et données. Le siège doit pouvoir consolider et piloter l'ensemble depuis une interface centralisée.

Le cahier des charges impose explicitement une architecture distribuée : chaque pays doit disposer d'un backend local indépendant, et le siège doit agréger via des appels API — sans accès direct aux bases de données pays.

---

## Options évaluées

### Option A — Architecture centralisée
Un seul backend + une seule base de données. Toutes les données (Brésil, Équateur, Colombie) sont dans la même instance. Le frontend interroge directement ce backend central.

**Avantages :** déploiement simple, un seul service à opérer, pas de synchronisation à gérer.

**Inconvénients :**
- Ne reflète pas l'organisation réelle de FutureKawa
- Panne centrale = tout tombe
- Ne prépare pas la montée en charge multi-sites
- Ne répond pas à l'exigence explicite du cahier des charges

---

### Option B — Architecture distribuée *(retenue)*
- Un **backend pays** par déploiement local (un exemple livré pour la démo) : API REST + DB + broker MQTT
- Un **backend siège** (agrégateur) : interroge les backends pays via HTTP, consolide les données
- Un **frontend** hébergé côté siège : UI unique qui consomme le backend siège

```
[ESP32 Brésil] → MQTT → [Backend Pays Brésil]
                              ↓ API REST
                         [Backend Siège] → [Frontend Web]
                              ↑ API REST
[ESP32 Colombie] → MQTT → [Backend Pays Colombie]
```

**Avantages :**
- Conforme à l'exigence du cahier des charges
- Isolation des pannes : un pays hors ligne n'impacte pas les autres
- Reflète l'organisation réelle (entités par pays)
- Prépare une vraie mise en production multi-sites

**Inconvénients :**
- Complexité accrue : plusieurs services à orchestrer
- Le backend siège doit gérer la résilience (pays inaccessible → réponse dégradée, pas d'erreur fatale)
- Pour la démo, tous les services tournent sur la même machine (simulation de distribution)

---

## Décision retenue

**Option B — Architecture distribuée.**

Chaque backend pays expose les routes suivantes (consommées par le siège) :
- `GET /api/lots` — liste des lots avec statuts
- `GET /api/lots/:id/measurements` — historique mesures d'un lot
- `GET /api/alerts` — alertes actives et historique

Le backend siège agit comme un **proxy agrégateur** : il appelle les backends pays en parallèle et consolide les réponses. En cas d'indisponibilité d'un pays, il retourne les données disponibles avec un indicateur de statut dégradé.

---

## Conséquences

- La configuration des URLs des backends pays est externalisée dans des variables d'environnement (`BACKEND_BRESIL_URL`, etc.)
- Les backends pays sont indépendants : ils peuvent fonctionner sans le siège
- Le frontend ne connaît que le backend siège — jamais les backends pays directement
- Pour la démo, un seul pays est déployé (livrable 1 du sujet) ; le siège est configuré pour en agréger plusieurs
