# ADR-0007 — Alerting avec Node-RED

- **Date :** 2026-06-02
- **Statut :** Accepté
- **Décideurs :** Équipe FutureKawa

---

## Contexte

Le cahier des charges exige un mécanisme d'alertes automatiques dans deux cas :
1. Conditions hors plage acceptable (température/humidité)
2. Lot dépassant 365 jours de stockage

En cas d'alerte, un email doit être envoyé au responsable d'exploitation du pays concerné.

Node-RED est cité dans la webographie officielle du sujet (section "Node-RED (alerting, orchestration)").

---

## Options évaluées

### Option A — Nodemailer dans Next.js (cron job)
Un job planifié dans le backend pays vérifie périodiquement les seuils et envoie les emails via Nodemailer.

**Avantages :** pas de service supplémentaire, tout dans Next.js, cohérent avec la stack homogène.

**Inconvénients :**
- Les cron jobs dans Next.js App Router nécessitent une Route Handler avec appel externe (ex: Vercel Cron) ou un mécanisme maison peu standard
- Moins adapté à une logique événementielle (MQTT → règle → action)
- Moins visuel pour la démo jury

---

### Option B — Node-RED *(retenu)*
Service Docker indépendant. Un flow Node-RED :
1. Souscrit aux topics MQTT du broker Mosquitto local
2. Applique les règles de seuil (temp/humidité par pays)
3. Interroge la DB pour détecter les lots périmés (cron interne Node-RED)
4. Envoie les emails via le nœud `node-red-node-email`
5. Écrit l'alerte dans la table `alerts` PostgreSQL via un nœud HTTP vers l'API du backend pays

**Avantages :**
- Cité explicitement dans le sujet — réponse directe à l'attendu
- Interface graphique des flows = outil de démonstration puissant en soutenance
- Découplé du code Next.js : switchable sans toucher aux backends
- Logique événementielle naturelle (MQTT in → traitement → email out)
- Les flows sont exportables en JSON et versionnés dans le repo

**Inconvénients :**
- Un service Docker supplémentaire dans le Compose
- Courbe d'apprentissage si aucun membre de l'équipe ne connaît Node-RED
- Les flows doivent être configurés manuellement au premier démarrage (ou importés via l'API)

---

## Décision retenue

**Option B — Node-RED**, dockerisé, intégré au `docker-compose.yml` du backend pays.

### Règles implémentées dans Node-RED

| Règle | Condition | Destinataire |
|---|---|---|
| Alerte température | Mesure hors `temp_ideal ± 3°C` du pays | Responsable exploitation pays |
| Alerte humidité | Mesure hors `humidity_ideal ± 2%` du pays | Responsable exploitation pays |
| Alerte péremption | Lot avec `stored_at < NOW() - 365 jours` | Responsable exploitation pays |

### Réversibilité

Si le projet évolue vers un alerting entièrement dans Next.js (phase 2, ou simplification), le flow Node-RED peut être remplacé par un service de jobs planifiés (ex: BullMQ + Nodemailer) sans toucher aux backends ni au frontend. L'interface (`alerts` table + routes API) reste identique.

---

## Conséquences

- Le `docker-compose.yml` du backend pays inclut un service `node-red` (image `nodered/node-red`)
- Les flows Node-RED sont versionnés dans `backend-pays/node-red/flows.json`
- Node-RED écrit les alertes via `POST /api/alerts` sur le backend pays (pas accès direct DB)
- Les seuils par pays sont configurés dans le flow Node-RED via des nœuds de configuration (modifiables sans redéploiement)
