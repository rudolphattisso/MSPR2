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
[ESP32 Brésil] → MQTT → [Backend Pays Brésil : 3001]
                              ↓ API REST
                    [app-siege : 3000] ← UI Web + agrégation siège
                              ↑ API REST
[ESP32 Colombie] → MQTT → [Backend Pays Colombie : 3001]
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

**Option B — Architecture distribuée, amendée le 2026-06-03.**

L'agrégation siège est intégrée dans l'application `app-siege/` (Next.js) via ses Route Handlers (`/api/...`). Il n'existe pas de service `backend-siege/` séparé.

```
[ESP32 Brésil] → MQTT → [Backend Pays Brésil : 3001]
                              ↓ API REST
                    [Frontend / Siège : 3000] ← UI + agrégation
                              ↑ API REST
[ESP32 Colombie] → MQTT → [Backend Pays Colombie : 3001]
```

Chaque backend pays expose les routes suivantes (consommées par le siège) :
- `GET /api/lots` — liste des lots avec statuts
- `GET /api/lots/:id/measurements` — historique mesures d'un lot
- `GET /api/alerts` — alertes actives et historique

La logique d'agrégation dans `app-siege/` agit comme un **proxy agrégateur** : elle appelle les backends pays en parallèle et consolide les réponses. En cas d'indisponibilité d'un pays, elle retourne les données disponibles avec un indicateur de statut dégradé.

Toute la logique d'agrégation passe par des Route Handlers (`/api/stocks`, `/api/alertes`, etc.) — jamais directement dans les Server Components — de sorte qu'un client mobile (Expo) pourrait consommer ces endpoints sans modification.

---

## Conséquences

- La configuration des URLs des backends pays est externalisée dans des variables d'environnement (`NEXT_PUBLIC_BACKEND_BRESIL_URL`, etc.) dans `app-siege/`
- Les backends pays sont indépendants : ils peuvent fonctionner sans le siège
- Le frontend ne contacte jamais directement un backend pays depuis le navigateur — uniquement via ses propres Route Handlers côté serveur
- `backend-siege/` n'est pas initialisé comme projet Next.js ; le dossier reste vide
- Pour la démo, un seul pays est déployé (livrable 1 du sujet) ; le siège est configuré pour en agréger plusieurs
