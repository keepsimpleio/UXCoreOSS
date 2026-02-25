FROM node:20.19.0-alpine AS deps

WORKDIR /app

# Install dependencies (use lockfile if present for reproducible builds)
COPY package.json yarn.lock* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else yarn install; fi

FROM node:20.19.0-alpine AS builder

WORKDIR /app
ENV NODE_ENV=production

COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN yarn run build:staging

FROM node:20.19.0-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3005

# Copy only the minimal standalone output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.env ./.env

EXPOSE 3005

CMD ["node", "server.js"]

