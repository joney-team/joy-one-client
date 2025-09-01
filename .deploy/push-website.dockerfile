FROM node:22-alpine3.21 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# Build step  
FROM node:22-alpine AS app-installer
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/website/package.json ./apps/website/
COPY packages/apis/package.json ./packages/apis/
COPY packages/assets/package.json ./packages/assets/
COPY packages/utils/package.json ./packages/utils/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY . .

# Build step
FROM node:22-alpine AS app-builder
WORKDIR /app

COPY --from=app-installer /app .

RUN cd apps/website && pnpm build

# Run-time
FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=app-builder /app/apps/website/.next/standalone .
COPY --from=app-builder /app/apps/website/public ./apps/website/public
COPY --from=app-builder /app/apps/website/.next/static ./apps/website/.next/static

EXPOSE 3000

CMD ["node", "apps/website/server.js"]