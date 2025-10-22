FROM node:22-alpine3.21 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# Build step  
FROM base AS app-installer
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/pwa/package.json ./apps/pwa/
COPY packages/apis/package.json ./packages/apis/
COPY packages/assets/package.json ./packages/assets/
COPY packages/utils/package.json ./packages/utils/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY . .

# Build step
FROM base AS app-builder
WORKDIR /app

COPY --from=app-installer /app .

RUN cd apps/pwa && pnpm build
RUN cd apps/pwa && pnpm sourcemaps:upload

# Run-time
FROM base AS runner
WORKDIR /app

COPY --from=app-builder /app/apps/pwa/.next/standalone .
COPY --from=app-builder /app/apps/pwa/public ./apps/pwa/public
COPY --from=app-builder /app/apps/pwa/.next/static ./apps/pwa/.next/static

EXPOSE 3000

CMD ["node", "apps/pwa/server.js"]