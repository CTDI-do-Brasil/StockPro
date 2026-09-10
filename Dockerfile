# ==========================================
# DOCKERFILE PARA DEPLOY NO CAPROVER
# ==========================================

# Estágio 1: Build da aplicação
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Compila o frontend React (Vite)
RUN npm run build

# Estágio 2: Ambiente de Execução de Produção
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80

# Configurações padrão para conexão com PostgreSQL no CapRover
ENV DATABASE_URL=postgresql://postgres:postgres@srv-captain--db-postgres:5432/StockPro
ENV PGHOST=srv-captain--db-postgres
ENV PGPORT=5432
ENV PGUSER=postgres
ENV PGPASSWORD=postgres
ENV PGDATABASE=StockPro

COPY package*.json ./
# Instala dependências de produção e tsx para executar o backend TypeScript
RUN npm ci --omit=dev && npm install -g tsx

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

# Diretório para persistência local de fallback
RUN mkdir -p /app/data

# CapRover encaminha para a porta 80 por padrão
EXPOSE 80

CMD ["tsx", "server/index.ts"]
