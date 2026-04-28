# syntax=docker/dockerfile:1.7

# Multi-stage build for Next.js (App Router, output: "standalone") on Cloud Run.
# - install/build with Bun (matches bun.lock + trustedDependencies in package.json)
# - run with a slim Node image so `sharp` works without alpine workarounds

ARG BUN_VERSION=1.3.11
ARG NODE_VERSION=22

# ---- deps: install dependencies from bun.lock --------------------------------
FROM oven/bun:${BUN_VERSION}-slim AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---- builder: produce .next/standalone ---------------------------------------
FROM oven/bun:${BUN_VERSION}-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Public, non-secret build args. Pass with `--build-arg NEXT_PUBLIC_FOO=bar`.
# These are inlined into the client bundle, so never pass secrets here.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN bun run build

# ---- runner: minimal runtime image -------------------------------------------
FROM node:${NODE_VERSION}-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080 \
    HOSTNAME=0.0.0.0

# Non-root user (Cloud Run runs containers as the configured UID).
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# Standalone server + static assets. `--chown` so the non-root user can read them.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 8080

# Cloud Run injects PORT; HOSTNAME=0.0.0.0 makes the standalone server bind to it.
CMD ["node", "server.js"]
