# ADR-0005 — Authentification avec NextAuth.js

- **Date :** 2026-06-02
- **Statut :** Accepté
- **Décideurs :** Équipe FutureKawa

---

## Contexte

Le cahier des charges ne mentionne pas explicitement d'authentification. Cependant, la solution expose des données métier sensibles (stocks, conditions de stockage, alertes qualité) via une interface web multi-pays. Sans auth, n'importe qui ayant l'URL peut consulter et modifier les données.

La question est : implémente-t-on l'auth dès le départ ou on la reporte ?

---

## Analyse de la dette technique

Reporter l'authentification génère une dette technique forte :

- Chaque **Route Handler** déjà écrit devra être modifié pour ajouter un check de session
- Le **middleware Next.js** (`middleware.ts`) devra être ajouté pour protéger toutes les routes — ce qui impose de revoir le routing
- La table **users** en base de données devra être ajoutée via migration Prisma, ce qui peut impacter les seeds existants
- Le **frontend** devra gérer l'état de session dans chaque composant déjà construit
- Coût estimé d'un retrofit complet : 1 à 2 jours de travail supplémentaire en fin de projet, au pire moment (avant la soutenance)

---

## Options évaluées

### Option A — Pas d'authentification
Prototype accessible sans login, avec une note "authentification non implémentée" dans la doc.

**Inconvénients :** présenter une application sans auth à un jury d'experts en informatique expose une lacune évidente. Risque de question difficile en entretien.

---

### Option B — JWT custom avec `jose`
Implémentation manuelle : génération des tokens, middleware de vérification, refresh token.

**Avantages :** contrôle total, léger.

**Inconvénients :** code boilerplate important, gestion des cas d'erreur à écrire from scratch, plus long à implémenter correctement.

---

### Option C — NextAuth.js *(retenu)*
Bibliothèque d'authentification native Next.js App Router. Gère le cycle complet : session, JWT, providers, callbacks.

**Avantages :**
- Intégration native avec Next.js App Router (`auth()`, `middleware.ts`)
- Provider Credentials (login/password) simple à configurer avec Prisma
- Session disponible côté serveur et client sans plomberie manuelle
- Ajout futur de SSO (OAuth, LDAP) sans refactoring
- Documentation exhaustive, maintenu activement

**Inconvénients :**
- Dépendance externe supplémentaire
- Configuration initiale (~2-3h) mais ne bloque pas les autres blocs si posée tôt

---

## Décision retenue

**Option C — NextAuth.js v5**, posé dès le **Bloc 6** (après le socle BDD et le backend pays, avant le frontend).

### Rôles utilisateurs

| Rôle | Accès |
|---|---|
| `ADMIN` | Tout (siège) — lecture + écriture tous pays |
| `MANAGER_PAYS` | Lecture + écriture pour son pays uniquement |
| `VIEWER` | Lecture seule |

Le champ `role` et `country` sont stockés dans la table `users` (Prisma).

---

## Conséquences

- Le `middleware.ts` racine de chaque Next.js app protège toutes les routes `/api` et les pages UI
- La session NextAuth.js expose `user.role` et `user.country` pour les contrôles d'accès dans les Route Handlers
- La table `users` est ajoutée au schéma Prisma dès le Bloc 2 (schéma BDD), même si NextAuth.js n'est configuré qu'au Bloc 6
- Les seeds incluent des utilisateurs de test par rôle
