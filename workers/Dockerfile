FROM node:20-alpine

WORKDIR /app

# Single COPY: selective per-path COPYs proved brittle against the
# builder's snapshot (missing workers/, types/). .dockerignore already
# excludes node_modules, .next, .git, .env, logs, etc.
COPY . ./

RUN ls -la /app && echo "--- worker deps ---" && ls /app/workers /app/lib /app/prisma

RUN npm install

RUN npx prisma generate

ENV NODE_ENV=production

CMD ["npm", "run", "worker"]