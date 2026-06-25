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

**Bootloader mode**
Mode de démarrage de l'ESP8266 dans lequel il attend qu'un outil extérieur (esptool) lui envoie un nouveau firmware via le port série. Activé en maintenant le bouton FLASH (IO0) enfoncé au moment du reset. Sans auto-reset fonctionnel (DTR/RTS cassés), il faut l'activer manuellement.

**Broker MQTT**
Serveur intermédiaire qui reçoit les messages publiés par les clients (ESP32) et les redistribue aux abonnés (backend pays, Node-RED). Dans ce projet : Eclipse Mosquitto.

**Build**
Étape de compilation/optimisation d'une application Next.js (`next build`). Produit un artefact déployable.

---

## C

**CH340**
Puce USB-Serial intégrée sur la plupart des boards NodeMCU (clones bon marché). Convertit la communication USB du PC en signal série compréhensible par l'ESP8266. Nécessite un driver Windows (`CH341SER.exe`) — sans lui, le port COM apparaît avec une erreur dans le Gestionnaire de périphériques et l'upload Arduino échoue avec `PermissionError`.

**CI/CD (Continuous Integration / Continuous Delivery)**
Pratique d'automatisation : chaque modification de code déclenche automatiquement build, tests et packaging. Dans ce projet : Jenkins avec Jenkinsfile.

**Client MQTT**
Toute application capable de publier ou de s'abonner à des topics via un broker MQTT. Ici : l'ESP32 (publier), le backend Next.js et Node-RED (s'abonner).

---

## D

**DHT11**
Capteur électronique temp/humidité, version économique du DHT22. Précision : ±2°C / ±5% humidité. Même protocole single-wire, même bibliothèque Adafruit. Utilisé dans ce projet (kit OSOYOO). Suffisant pour le prototype ; DHT22 recommandé en production.

**DHT22**
Capteur électronique mesurant température et humidité relative. Précision : ±0.5°C / ±2-5% humidité. Communique via protocole single-wire avec le microcontrôleur.

**Docker Compose**
Outil pour définir et lancer une stack multi-conteneurs via un fichier `docker-compose.yml`. Une commande (`docker compose up`) démarre tous les services (PostgreSQL, Mosquitto, Node-RED, Next.js apps).

**Docker image**
Snapshot immuable d'un environnement d'exécution. Chaque service du projet a sa propre image.

---

## E

**esptool**
Outil Python open-source utilisé en arrière-plan par Arduino IDE pour uploader le firmware compilé sur un ESP8266/ESP32 via le port série. L'erreur `A fatal esptool.py error occurred` indique un problème de communication avec la carte (driver manquant, port occupé, câble data absent).

**ESP32**
Microcontrôleur avec Wi-Fi et Bluetooth intégrés. Supporte Arduino (C++) et MicroPython. Successeur de l'ESP8266 : plus de GPIO, plus puissant. Référence dans `iot/esp32/`.

**ESP8266**
Microcontrôleur WiFi de la famille Espressif, prédécesseur de l'ESP32. 11 GPIO utilisables, un seul canal ADC (A0). Bibliothèque Arduino : `ESP8266WiFi.h` (remplace `WiFi.h` de l'ESP32). Utilisé dans ce projet via la board NodeMCU. Point d'attention : certains pins (D3/D4/D8) influencent le mode de boot — les éviter pour les capteurs.

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

**Hotspot Windows (Point d'accès mobile)**
Fonctionnalité Windows qui transforme le laptop en point d'accès WiFi. L'IP du laptop sur ce réseau virtuel est toujours `192.168.137.1` — fixe, peu importe la connexion amont (WiFi école, WiFi maison, USB-tethering 5G). Dans ce projet : utilisé pour que l'ESP8266 trouve toujours le broker MQTT à la même adresse sans modifier `config.h`.

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

**NodeMCU**
Board de développement basée sur l'ESP8266 (module ESP-12E). Intègre un port USB (via CH340/CP2102), un régulateur 3.3V et expose les GPIO sous forme de pins étiquetés D0–D8. Les labels sérigraphiés (D5) ne correspondent pas aux numéros GPIO internes (D5 = GPIO14) — utiliser les constantes Arduino (`D5`) plutôt que les numéros bruts pour éviter les erreurs.

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

**SMTP (Simple Mail Transfer Protocol)**
Protocole standard d'envoi d'emails. Un serveur SMTP (ex: `smtp.gmail.com`) prend en charge l'acheminement du message de l'expéditeur vers le destinataire. Dans ce projet : Node-RED utilise le module `node-red-node-email` pour envoyer les alertes via SMTP. Les identifiants (login/mot de passe) sont configurés dans l'interface Node-RED et stockés dans `credentials.json` — jamais dans le code source.

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

**Test d'intégration**
Test qui vérifie que plusieurs composants fonctionnent correctement ensemble (ex : MQTT + Node-RED + backend + base de données). Contrairement au test unitaire qui isole une fonction, le test d'intégration teste le flux bout en bout sur une infrastructure réelle (Docker, réseau, DB). Dans ce projet : prévu au Bloc 9 pour valider le flow Node-RED complet.

**Test E2E (End-to-End)**
Test qui simule un scénario utilisateur complet depuis le début jusqu'à la fin, en passant par tous les composants réels. Exemple : publier un message MQTT hors seuil → attendre → vérifier qu'une alerte existe en base → nettoyer. Avantage : aucune donnée ne reste en base après le test (nettoyage automatique). Prévu au Bloc 9 sur une base de test dédiée.

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

---

## Authentification (Bloc 6)

**NextAuth v5 (Auth.js)**
Bibliothèque d'authentification native Next.js App Router. Gère login/logout, sessions, callbacks. Installée dans `app-siege` (`next-auth@beta`). Config centrale dans `auth.ts`, exposée au réseau par le route handler `app/api/auth/[...nextauth]/route.ts`.

**Credentials Provider**
Mode d'auth NextAuth par email + mot de passe (vs OAuth Google/GitHub). Sa fonction `authorize()` valide les identifiants — ici en appelant le backend pays (`POST /api/auth/login`), jamais la DB directement.

**Session JWT**
Stratégie où la session est un jeton signé (JWT) stocké en cookie (`authjs.session-token`), pas en base. Le callback `jwt` y place `role` + `countryId` ; le callback `session` les réexpose à l'app. Évite une requête DB à chaque page.

**RBAC (Role-Based Access Control)**
Contrôle d'accès par rôle. Trois rôles : `ADMIN` (tout), `MANAGER_PAYS` (son pays), `VIEWER` (lecture seule). Appliqué via les helpers `lib/auth-guards.ts`.

**Middleware / proxy.ts**
Code exécuté avant chaque requête pour protéger les routes. En Next.js 16 le fichier `middleware.ts` est renommé `proxy.ts`. Côté app-siege : redirige vers `/login` si non connecté. Côté backend pays : exige la clé de service.

**Clé de service (M2M, x-api-key)**
Secret partagé entre app-siege et le backend pays (`SERVICE_API_KEY`), envoyé dans l'en-tête HTTP `x-api-key`. Le `proxy.ts` du backend rejette (401) tout appel `/api/*` sans la bonne clé. Authentification machine-à-machine (M2M) — empêche l'accès direct à l'API pays (OWASP API Security).

**Server Action**
Fonction serveur (`"use server"`) appelée directement depuis un formulaire React, sans écrire de route API. Utilisée pour le login, le register et le logout dans `app-siege`.

**bcrypt**
Algorithme de hachage de mots de passe (lent par conception, résistant au brute-force). `bcrypt.hash()` au register, `bcrypt.compare()` au login. Les mots de passe ne sont jamais stockés en clair ni renvoyés par l'API.

**Vérification d'email**
Confirmation que l'adresse appartient bien à l'utilisateur. À l'inscription, le compte est créé non vérifié (`emailVerified` = null) ; un lien à usage unique (token, 24 h) est envoyé par mail ; le clic active le compte. La connexion est refusée (403) tant que l'email n'est pas vérifié.

**nodemailer**
Bibliothèque Node.js d'envoi d'emails via SMTP. Configurée par variables d'env (`SMTP_HOST/PORT/USER/PASS/FROM`) → un seul code pour Mailhog (dev) ou Gmail/Resend (prod).

**Mailhog**
Faux serveur SMTP de développement : capture tous les emails sans rien envoyer sur Internet, et les affiche dans une interface web (http://localhost:8025). Permet de tester les envois sans vrai compte mail. Conteneur Docker.

**SMTP (Simple Mail Transfer Protocol)**
Protocole standard d'envoi d'emails. Port 1025 pour Mailhog (sans TLS), 587 pour Gmail (STARTTLS).

**Quoted-printable**
Encodage du corps des emails où les caractères spéciaux deviennent `=XX` (ex. `=` → `=3D`). À décoder avant d'extraire un contenu (ex. le token d'un lien) d'un email brut.
