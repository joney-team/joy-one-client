FROM node:22-alpine3.21 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install Packages
# Build context: monorepo root (joy-one/)
FROM base AS builder-installer
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter joy-one-server...

# Built-time
FROM base AS builder
WORKDIR /app

COPY . .
COPY --from=builder-installer /app/node_modules ./node_modules
COPY --from=builder-installer /app/apps/server/node_modules ./apps/server/node_modules

RUN pnpm --filter joy-one-server build

# Install production packages
FROM base AS production-installer
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile --filter joy-one-server...

# Run-time
FROM base
WORKDIR /app

RUN apk add --no-cache ffmpeg

COPY apps/server ./apps/server
COPY --from=production-installer /app/node_modules ./node_modules
COPY --from=production-installer /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=builder /app/apps/server/dist ./apps/server/dist

WORKDIR /app/apps/server
EXPOSE 4000

CMD [ "node", "dist/src/main" ]
