FROM node:22-bookworm AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma7.config.ts ./
RUN npm ci

COPY . .
RUN npx prisma generate --schema prisma/schema.prisma \
    && npm run build \
    && test -f dist/generated/prisma/client.js

FROM node:22-bookworm AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

EXPOSE 3000
USER node

CMD ["node", "dist/src/main.js"]