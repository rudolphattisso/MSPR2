# App siège (Next.js — UI + agrégateur siège)
FROM node:20-slim

WORKDIR /app

# npm install (et non ci) : tolère l'écart de résolution npm 11 (dev) / npm 10 (image)
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npx", "next", "start", "-p", "3000"]
