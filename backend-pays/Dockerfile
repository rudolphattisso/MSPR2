# Backend pays (Next.js API + ingestion MQTT + Prisma/PostgreSQL)
FROM node:20-slim

WORKDIR /app

# openssl requis par le moteur Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Dépendances (avec devDeps : nécessaires au build et à prisma/next au runtime)
# npm install (et non ci) : tolère l'écart de résolution entre npm 11 (poste dev)
# et npm 10 (image node:20). npm 10 exécute bien les scripts d'install (prisma…).
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund

# Code source + génération client Prisma + build Next
COPY . .
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
EXPOSE 3001

# Au démarrage : applique les migrations puis lance l'API
CMD ["sh", "-c", "npx prisma migrate deploy && npx next start -p 3001"]
