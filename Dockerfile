# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

#Production Stage 
FROM node:20-alpine

WORKDIR /app


RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY backend/ ./backend/
COPY frontend/ ./frontend/

RUN mkdir -p /app/backend/logs && chown -R appuser:appgroup /app

USER appuser

WORKDIR /app/backend

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "server.js"]
