# ADR-0009 — ORM : Prisma

- **Date :** 2026-06-02
- **Statut :** Accepté
- **Décideurs :** Équipe FutureKawa

---

## Contexte

Les backends pays et siège utilisent PostgreSQL + TimescaleDB. Il faut un moyen d'interagir avec la base de données depuis Next.js de façon typée et maintenable. Le choix de l'ORM impacte la productivité de l'équipe, la gestion des migrations et la compatibilité avec TimescaleDB.

---

## Options évaluées

### Option A — SQL brut (node-postgres / `pg`)
Requêtes SQL directement dans le code TypeScript.

**Avantages :** contrôle total, performances maximales, pas de surcoût d'abstraction.

**Inconvénients :** pas de type-safety automatique, migrations manuelles, code répétitif pour les opérations CRUD courantes. Pour une équipe de 4 sur un projet à durée limitée, le coût de maintenance est élevé.

---

### Option B — Drizzle ORM
ORM récent, orienté SQL, excellente type-safety, meilleur support des requêtes complexes.

**Avantages :** très proche du SQL, types inférés précis, léger.

**Inconvénients :** moins mature que Prisma, documentation moins fournie, moins d'exemples disponibles pour Next.js App Router + TimescaleDB. Risque de friction sur des cas limites en projet contraint dans le temps.

---

### Option C — Prisma *(retenu)*
ORM mature, écosystème Next.js natif, Prisma Studio pour l'exploration visuelle de la DB.

**Avantages :**
- Schéma déclaratif (`schema.prisma`) = source de vérité unique pour la structure de la DB
- Migrations versionnées automatiquement (`prisma migrate dev`)
- Client typé généré automatiquement depuis le schéma
- Prisma Studio : interface visuelle pour explorer et modifier les données (utile en démo et debug)
- Documentation exhaustive, nombreux exemples Next.js App Router

**Inconvénients :**
- Les **hypertables TimescaleDB** ne sont pas gérées nativement par Prisma : la création de l'hypertable (`SELECT create_hypertable(...)`) nécessite un script SQL exécuté après la migration initiale
- Les requêtes complexes sur les hypertables (compression, continuous aggregates) nécessitent `prisma.$queryRaw`

---

## Décision retenue

**Option C — Prisma.**

### Gestion de l'hypertable TimescaleDB

La table `measurements` est créée par Prisma (migration normale), puis convertie en hypertable via un script SQL séparé exécuté au démarrage :

```sql
-- scripts/init-timescale.sql
SELECT create_hypertable('measurements', 'recorded_at', if_not_exists => TRUE);
SELECT add_compression_policy('measurements', INTERVAL '7 days');
```

Ce script est exécuté via le `docker-compose.yml` en tant qu'init script PostgreSQL.

---

## Conséquences

- Le fichier `prisma/schema.prisma` est la source de vérité pour le schéma relationnel
- Les migrations sont versionnées dans `prisma/migrations/`
- `scripts/init-timescale.sql` gère la conversion en hypertable (exécuté une seule fois au démarrage Docker)
- Les seeds (`prisma/seed.ts`) incluent des données de test pour les 3 pays, les entrepôts, les lots et les utilisateurs
- Prisma Client est instancié en singleton dans `lib/prisma.ts` (pattern standard Next.js pour éviter les connexions multiples en dev)
