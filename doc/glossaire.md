# Glossaire technique — FutureKawa

Termes classés par ordre alphabétique.

---

## A

**ADR (Architecture Decision Record)**
Document qui enregistre une décision architecturale : le contexte, les options évaluées, la décision retenue et ses conséquences. Permet de comprendre *pourquoi* le code est structuré d'une certaine façon, pas seulement *comment*.

**Agrégateur (app-siege)**
Logique dans `app-siege/app/api/` qui consolide les données provenant de plusieurs backends pays pour les exposer en une réponse unifiée à l'UI. Implémenté sous forme de Route Handlers Next.js, pas d'un service séparé.

**App Router (Next.js)**
Système de routage de Next.js basé sur la structure de dossiers. Les fichiers `page.tsx` définissent les pages UI, les fichiers `route.ts` définissent les endpoints API (Route Handlers).

---

## B

**Broker MQTT**
Serveur intermédiaire qui reçoit les messages publiés par les clients (ESP32) et les redistribue aux abonnés (backend pays, Node-RED). Dans ce projet : Eclipse Mosquitto.

**Build**
Étape de compilation/optimisation d'une application Next.js (`next build`). Produit un artefact déployable.

---

## C

**CI/CD (Continuous Integration / Continuous Delivery)**
Pratique d'automatisation : chaque modification de code déclenche automatiquement build, tests et packaging. Dans ce projet : Jenkins avec Jenkinsfile.

**Client MQTT**
Toute application capable de publier ou de s'abonner à des topics via un broker MQTT. Ici : l'ESP32 (publier), le backend Next.js et Node-RED (s'abonner).

---

## D

**DHT22**
Capteur électronique mesurant température et humidité relative. Précision : ±0.5°C / ±2-5% humidité. Communique via protocole single-wire avec le microcontrôleur.

**Docker Compose**
Outil pour définir et lancer une stack multi-conteneurs via un fichier `docker-compose.yml`. Une commande (`docker compose up`) démarre tous les services (PostgreSQL, Mosquitto, Node-RED, Next.js apps).

**Docker image**
Snapshot immuable d'un environnement d'exécution. Chaque service du projet a sa propre image.

---

## E

**ESP32**
Microcontrôleur avec Wi-Fi et Bluetooth intégrés. Supporte Arduino (C++) et MicroPython. Utilisé ici pour lire le capteur DHT22 et publier les mesures via MQTT.

---

## F

**Firmware**
Code embarqué dans un microcontrôleur (ESP32, Arduino…), stocké en mémoire flash interne. Contrairement à un programme classique, il tourne directement sur le matériel sans système d'exploitation. Dans ce projet : `futurekawa_sensor.ino` — lit le capteur et publie sur MQTT. Modifié uniquement quand le matériel change ; le backend n'en a aucune connaissance.

**Flash (flasher)**
Action de téléverser le firmware compilé dans la mémoire interne du microcontrôleur via USB. Dans Arduino IDE : bouton "Téléverser" (→). Une fois flashé, l'ESP32 exécute le firmware à chaque mise sous tension, sans intervention extérieure.

**Fire-and-forget**
Pattern d'exécution asynchrone où une tâche est déclenchée sans attendre sa complétion. Dans ce projet : `checkMeasurementAlerts()` est appelée sans `await` depuis la route `POST /api/measurements` et depuis le worker MQTT. Avantage : l'ingestion répond immédiatement à l'ESP32. Risque : si la vérification d'alerte échoue, l'erreur est loggée mais non propagée. Acceptable en prototype ; en production, remplacer par une job queue.

**FIFO (First In, First Out)**
Principe de rotation des stocks : les lots entrés en premier doivent être expédiés en premier. Dans l'UI, les lots sont triés par `stored_at` croissant.

**Flow (Node-RED)**
Programme visuel composé de nœuds connectés représentant un traitement de données. Dans ce projet : `[MQTT in] → [règles seuils] → [email] → [POST /api/alerts]`.

---

## G

**GPIO (General Purpose Input/Output)**
Broches programmables d'un microcontrôleur (ESP32 : 30+ broches). Chaque broche peut être configurée en entrée (lire un capteur) ou en sortie (allumer une LED, piloter un relais). Dans ce projet : GPIO 4 est la broche de données du capteur DHT22 par défaut (configurable dans `config.h`).

---

## H

**Hypertable (TimescaleDB)**
Table PostgreSQL transformée par TimescaleDB pour optimiser les données temporelles. Elle est automatiquement partitionnée en **chunks** (intervalles de temps), rendant les requêtes `WHERE recorded_at BETWEEN ...` très efficaces.

---

## I

**instrumentation.ts (Next.js)**
Fichier à la racine d'une app Next.js qui exporte une fonction `register()`. Celle-ci est appelée une seule fois au démarrage du serveur, avant que les routes soient prêtes. Utilisée dans ce projet pour lancer le worker MQTT et vérifier les péremptions au boot. La garde `NEXT_RUNTIME === "nodejs"` empêche le code Node.js de s'exécuter dans le runtime Edge.

---

## J

**Jenkinsfile**
Fichier texte versionné dans le repo qui décrit le pipeline CI/CD Jenkins en syntaxe déclarative Groovy. Principe de *pipeline as code*.

**JWT (JSON Web Token)**
Standard de token d'authentification signé. Contient les informations de session (user id, rôle) encodées en base64. Utilisé par NextAuth.js pour maintenir la session sans état serveur.

---

## M

**Migration (Prisma)**
Fichier SQL généré automatiquement par Prisma (`prisma migrate dev`) qui décrit l'évolution du schéma de base de données. Versionné dans `prisma/migrations/`.

**Monorepo**
Organisation où plusieurs applications (backend-pays, app-siege, iot) coexistent dans un seul dépôt Git.

**MQTT (Message Queuing Telemetry Transport)**
Protocole de messagerie publish/subscribe léger, conçu pour les réseaux contraints et les appareils IoT. Standard OASIS. Entête de 2 octets minimum.

---

## N

**NextAuth.js**
Bibliothèque d'authentification native Next.js. Gère sessions, JWT, providers (Credentials, OAuth). Intégration via `auth()` côté serveur et `useSession()` côté client.

**Node-RED**
Outil de programmation visuelle par flux pour connecter des appareils, APIs et services. Utilisé ici pour l'alerting : souscription MQTT → détection seuil → envoi email.

**npm ci**
Commande npm optimisée pour les environnements CI/CD (`npm clean install`). Contrairement à `npm install`, elle supprime `node_modules` et réinstalle exactement ce qui est décrit dans `package-lock.json`, sans jamais modifier ce fichier. Garantit des builds reproductibles : deux exécutions sur la même base de code produisent exactement le même résultat.

---

## O

**onDelete: Cascade (Prisma / SQL)**
Directive de relation qui indique que lorsqu'un enregistrement parent est supprimé, tous les enregistrements enfants liés sont automatiquement supprimés par la base de données. Sans cette directive, PostgreSQL refuse la suppression du parent si des enfants existent (erreur FK constraint → HTTP 500). Dans ce projet : `Alert` est enfant de `Lot` — supprimer un lot doit supprimer ses alertes. Ajouté en session 006 après détection du bug.

**ORM (Object-Relational Mapping)**
Couche logicielle qui permet d'interagir avec une base SQL en TypeScript (objets, fonctions) sans écrire de SQL brut. Dans ce projet : Prisma.

---

## P

**Payload MQTT**
Contenu du message MQTT, généralement en JSON. Exemple : `{"temp": 29.4, "humidity": 54.8, "recorded_at": "..."}`.

**Pipeline (Jenkins)**
Séquence de stages automatisés : Install → Lint → Test → Build → Package. Défini dans le Jenkinsfile.

**Pipeline as code**
Principe consistant à versionner la définition du pipeline CI/CD dans le dépôt Git (via un `Jenkinsfile`, `.github/workflows/`, etc.) plutôt que de le configurer manuellement dans l'interface Jenkins. Avantage : le pipeline évolue avec le code, est reviewable comme n'importe quel fichier, et est reproductible sur n'importe quel serveur Jenkins.

**Prisma**
ORM TypeScript. Le fichier `schema.prisma` décrit les modèles de données, `prisma migrate` gère les migrations SQL, le Prisma Client généré offre un accès typé à la DB. Version utilisée dans ce projet : Prisma 6.

**prisma.config.ts**
Fichier de configuration introduit par Prisma 6/7. Centralise la config datasource (URL, migrations, seed). La propriété `url` dans `schema.prisma` a été **supprimée en Prisma 7** — toute la config de connexion passe par ce fichier.

**Prisma Driver Adapter (`@prisma/adapter-pg`)**
En Prisma 7, le `PrismaClient` ne peut plus se connecter directement à la DB via une URL dans le constructeur. Il faut lui passer un **adapter** qui encapsule le driver natif. Pour PostgreSQL : `@prisma/adapter-pg` + `pg.Pool`. Pattern utilisé dans ce projet pour les routes API et le seed :
```typescript
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

**Pull-up (résistance)**
Résistance placée entre la broche de données d'un capteur et l'alimentation (VCC). Elle force le signal à l'état haut (1) quand aucun appareil ne tire le signal vers le bas. Requise par le protocole du DHT22 : sans elle, la ligne reste flottante et les lectures sont aléatoires. Valeur standard : 10 kΩ.

**Prisma Studio**
Interface web fournie par Prisma pour visualiser et modifier les données de la base de données. Utile en développement et en démo.

**Pub/Sub (Publish/Subscribe)**
Modèle de messagerie où les émetteurs (publishers) envoient des messages sur des canaux (topics) sans connaître les récepteurs (subscribers). Le broker fait l'intermédiaire.

---

## Q

**QoS (Quality of Service) — MQTT**
Niveau de garantie de livraison des messages MQTT.
- QoS 0 : au plus une fois (pas de garantie)
- QoS 1 : au moins une fois (peut dupliquer)
- QoS 2 : exactement une fois (plus lent)

Dans ce projet : QoS 1 pour les mesures (doublon acceptable, perte non acceptable).

---

## R

**Route Handler (Next.js)**
Fichier `route.ts` dans `app/api/` qui définit un endpoint REST (GET, POST, PUT, DELETE). Équivalent d'une route Express dans l'écosystème Next.js.

---

## S

**Singleton (pattern)**
Pattern de conception garantissant qu'une classe n'a qu'une seule instance dans toute l'application. Dans ce projet : `lib/prisma.ts` exporte un `PrismaClient` unique. Sans ce pattern, chaque hot-reload en développement créerait une nouvelle instance et épuiserait le pool de connexions PostgreSQL. Implémenté via une variable globale (`globalThis`) qui survit aux rechargements de modules.

**Squelette de pipeline**
Structure complète d'un pipeline CI/CD où tous les stages sont présents et fonctionnels, mais certains ne contiennent pas encore leur implémentation réelle (remplacés par un `echo` ou un commentaire). Le pipeline passe au vert dès le premier lancement. Avantage : la structure est posée tôt, chaque bloc du projet vient simplement remplir le stage correspondant sans restructurer le pipeline. Dans ce projet : le stage `Test` est un squelette jusqu'au Bloc 9.

**Schema.prisma**
Fichier de définition des modèles de données Prisma. Source de vérité unique pour la structure de la base de données.

**Seed**
Script qui peuple la base de données avec des données initiales de test (`prisma db seed`). Dans ce projet : données des 3 pays, entrepôts, lots d'exemple, utilisateurs.

**Session (NextAuth.js)**
Objet contenant les informations de l'utilisateur connecté (id, email, rôle, pays), disponible dans les Route Handlers via `auth()` et dans les composants React via `useSession()`.

**Stage (Jenkins)**
Étape nommée dans un pipeline Jenkins. Ex : `stage('Test') { ... }`. Permet de visualiser l'avancement du pipeline et d'identifier où un échec se produit.

---

## T

**TimescaleDB**
Extension open-source de PostgreSQL optimisée pour les données temporelles (timeseries). Ajoute les hypertables, la compression automatique et les agrégats continus. Même SQL, même driver, même image Docker que PostgreSQL.

**Topic (MQTT)**
Chaîne de caractères hiérarchique qui catégorise les messages. Format : `futurekawa/<pays>/<entrepôt>/sensors/<capteur>/measurements`. Les clients s'abonnent à un topic ou à un pattern (`futurekawa/BR/#` = tous les messages Brésil).

**TypeScript**
Sur-ensemble typé de JavaScript. Détecte les erreurs à la compilation plutôt qu'à l'exécution. Utilisé dans toutes les applications Next.js du projet.

---

## U

**UUID (Universally Unique Identifier)**
Identifiant de 128 bits généré aléatoirement (version 4). Nombre de valeurs possibles : 2^122 ≈ 5,3 × 10^36. Pour atteindre 50% de probabilité de collision il faudrait générer 2,7 × 10^18 UUIDs — soit 86 ans à raison d'un milliard par seconde. Traité comme impossible en pratique.

Dans ce projet, les UUIDs sont générés par PostgreSQL (`gen_random_uuid()`) et stockés en type natif `UUID` (16 octets) plutôt qu'en `TEXT` (36 octets). Cela garantit l'unicité globale des IDs entre les backends pays sans coordination — un lot Brésil et un lot Colombie ne pourront jamais avoir le même ID. Alternative écartée : `SERIAL` (entier auto-incrémenté) génère des collisions certaines en architecture distribuée (deux pays produiraient les IDs 1, 2, 3... en parallèle).

---

## W

**Worker MQTT (backend pays)**
Processus dans le backend Next.js qui se connecte au broker Mosquitto, s'abonne aux topics de mesures, et insère les données reçues dans TimescaleDB.
