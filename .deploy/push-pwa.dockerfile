# Build step  
FROM node:22-alpine AS app-installer
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk add --update \
  git python3 make g++ openssh-client

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/pwa/package.json ./apps/pwa/
COPY packages/apis/package.json ./packages/apis/
COPY packages/assets/package.json ./packages/assets/
COPY packages/utils/package.json ./packages/utils/

RUN pnpm install --frozen-lockfile

COPY . .

# Build step
FROM node:22-alpine AS app-builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk add --update \
  git python3 make g++ openssh-client

COPY --from=app-installer /app .

RUN cd apps/pwa && pnpm build

# Run-time
FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=app-builder /app/apps/pwa/.next/standalone .
COPY --from=app-builder /app/apps/pwa/public ./apps/pwa/public
# COPY --from=app-builder /app/apps/pwa/next.config.ts ./apps/pwa
COPY --from=app-builder /app/apps/pwa/.next/static ./apps/pwa/.next/static

EXPOSE 3000

CMD ["node", "apps/pwa/server.js"]