FROM node:22-alpine3.21 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install Packages
FROM base AS builder-installer
WORKDIR /app

COPY package.json ./package.json
COPY pnpm-lock.yaml ./pnpm-lock.yaml

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Built-time
FROM base AS builder
WORKDIR /app

COPY . .
COPY --from=builder-installer /app/node_modules ./node_modules

RUN pnpm build

# Install production packages
FROM base AS production-installer
WORKDIR /app

COPY package.json ./package.json
COPY pnpm-lock.yaml ./pnpm-lock.yaml

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Run-time
FROM base
WORKDIR /app

RUN apk add --no-cache ffmpeg

COPY . .
COPY --from=production-installer /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD [ "pnpm", "start" ]