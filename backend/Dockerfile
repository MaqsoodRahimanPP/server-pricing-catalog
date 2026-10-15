FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY db.js server.js ./
COPY routes/ ./routes/
COPY services/ ./services/

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/data/cloudblueprint.db

RUN mkdir -p /app/data \
    && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "server.js"]
