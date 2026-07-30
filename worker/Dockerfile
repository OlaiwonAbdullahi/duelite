# Deploys the always-on WhatsApp worker (worker/whatsapp-bot.ts) as its own
# service, separate from the Next.js app on Vercel — Vercel's serverless
# functions can't hold the persistent connection this process needs.
#
# Build from the repo root, e.g.:
#   docker build -f worker/Dockerfile -t duelite-whatsapp-worker .
#
# Required env vars at runtime: DATABASE_URL, AI_API_KEY, KEY_ENCRYPTION_SECRET,
# BMONI_BASE_URL, BMONI_API_KEY, WHATSAPP_WORKER_SECRET. Optional: PORT (default 8787).

FROM node:20-slim AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml tsconfig.json ./
COPY prisma ./prisma
RUN pnpm exec prisma generate
COPY lib ./lib
COPY worker ./worker

ENV NODE_ENV=production
EXPOSE 8787
CMD ["pnpm", "exec", "tsx", "worker/whatsapp-bot.ts"]
