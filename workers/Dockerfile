FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY lib ./lib/
COPY workers ./workers/
COPY types ./types/

RUN npm install

RUN npx prisma generate

ENV NODE_ENV=production

CMD ["npm", "run", "worker"]