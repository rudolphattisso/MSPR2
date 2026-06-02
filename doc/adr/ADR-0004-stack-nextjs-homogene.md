# ADR-0004 — Stack Next.js homogène (backend + frontend)

- **Date :** 2026-06-02
- **Statut :** Accepté
- **Décideurs :** Équipe FutureKawa

---

## Contexte

Le projet nécessite deux backends API (pays et siège) et un frontend web. La question est de choisir le ou les frameworks à utiliser pour ces trois applications.

Le cahier des charges ne prescrit pas de framework particulier pour le backend, mais impose TypeScript et une architecture REST.

---

## Options évaluées

### Option A — Express/Fastify (backends) + Next.js (frontend)
Les backends pays et siège sont des APIs Node.js légères (Express ou Fastify), le frontend est en Next.js.

**Avantages :** Express/Fastify sont plus légers et plus adaptés à une API pure (pas de rendu HTML).

**Inconvénients :**
- Deux écosystèmes à maîtriser simultanément
- Configuration différente (routing, middleware, validation) entre backends et frontend
- Pas de partage naturel des conventions de code
- Pour une équipe polyvalente sur un projet court, le coût de context-switching est réel

---

### Option B — Next.js pour tout *(retenu)*
Les trois applications (backend pays, backend siège, frontend) sont des projets Next.js App Router utilisant les **Route Handlers** (`app/api/`) comme API REST.

**Avantages :**
- Un seul framework, une seule documentation, une seule façon de faire le routing
- Les types TypeScript des réponses API sont directement réutilisables dans le frontend
- Prisma + NextAuth.js s'intègrent nativement dans Next.js
- Déploiement identique pour les trois apps (image Docker Node.js standard)
- L'équipe monte en compétence sur un seul outil

**Inconvénients :**
- Next.js embarque le moteur de rendu React même quand on n'en a pas besoin (backend pays/siège sont des API pures) — légère surcharge mémoire
- Les Route Handlers Next.js sont moins documentés qu'Express pour les cas avancés (streaming, WebSockets)

---

## Décision retenue

**Option B — Next.js App Router + TypeScript pour les trois applications.**

Les backends pays et siège n'exposent que des Route Handlers (`app/api/`), sans pages React. Le frontend est une application Next.js complète avec Server Components et Client Components.

```
backend-pays/   → Next.js (API routes uniquement, port 3001)
backend-siege/  → Next.js (API routes uniquement, port 3002)
frontend/       → Next.js (UI complète, port 3000)
```

---

## Conséquences

- Le dossier `app/` des backends pays et siège ne contient que des `route.ts`, pas de composants UI
- Les types des réponses API (ex: `LotResponse`, `MeasurementResponse`) sont définis dans `shared/types/` et importés par le frontend et les backends
- Le `next.config.ts` des backends peut désactiver les optimisations frontend inutiles (`output: 'standalone'` suffit)
