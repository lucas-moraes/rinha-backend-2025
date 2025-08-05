# Etapa 1: Build
FROM node:22-alpine AS builder

# Instalações necessárias para build
RUN apk add --no-cache git openssh bash

WORKDIR /app

# Somente package.json e lockfile (cache de dependências)
COPY package*.json ./
RUN npm ci

# Copia o resto do código e builda
COPY . .
RUN npm run build && npm run minify

# Etapa 2: Runtime
FROM node:22-alpine AS runner


WORKDIR /app

RUN apk add --no-cache bash

# Cria usuário não‑root
RUN addgroup -S app && adduser -S app -G app

# Copia apenas o necessário da etapa de build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Ajusta permissões e usuário
RUN chown -R app:app /app 

USER app
CMD ["sh", "-c", "node dist/index.js"]

