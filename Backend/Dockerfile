# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN npm install -g pnpm && pnpm install

# Copy source code and prisma schema
COPY . .

# Generate Prisma Client
RUN DATABASE_URL="postgresql://dummy:5432/db" npx prisma generate

# Build the application
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/smartcontract ./smartcontract

# Expose port (assuming 8080 or similar, checking code next to confirm)
EXPOSE 8080

# Start command
# Start command
CMD ["node", "dist/server.js"]
