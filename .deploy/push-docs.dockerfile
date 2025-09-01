FROM node:22-alpine3.21 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# Build step  
FROM base AS app-installer
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/docs/package.json ./apps/docs/
COPY packages/apis/package.json ./packages/apis/
COPY packages/assets/package.json ./packages/assets/
COPY packages/utils/package.json ./packages/utils/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY . .

# Build step
FROM base AS app-builder
WORKDIR /app

COPY --from=app-installer /app .

RUN cd apps/docs && pnpm build

# Run-time
FROM base AS runner
WORKDIR /app

COPY --from=app-builder /app/apps/docs/.next/standalone .
COPY --from=app-builder /app/apps/docs/public ./apps/docs/public
COPY --from=app-builder /app/apps/docs/.next/static ./apps/docs/.next/static

EXPOSE 3000

CMD ["node", "apps/docs/server.js"]