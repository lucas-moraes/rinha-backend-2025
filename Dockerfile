# Etapa 1: Build
FROM node:22-alpine AS builder

# Instalações necessárias para build
RUN apk add --no-cache git openssh

WORKDIR /app

# Somente package.json e lockfile (cache de dependências)
COPY package*.json ./
RUN npm ci

# Copia o resto do código e builda
COPY . .
RUN npm run build

# Etapa 2: Runtime
FROM node:22-alpine AS runner

WORKDIR /app

# Cria usuário não‑root
RUN addgroup -S app && adduser -S app -G app

# Copia apenas o necessário da etapa de build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/entrypoint.sh ./

# Ajusta permissões e usuário
RUN chown -R app:app /app \
 && chmod +x entrypoint.sh

USER app

EXPOSE 9999
ENTRYPOINT ["./entrypoint.sh"]

