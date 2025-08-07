# Etapa 1: Build da aplicação
FROM node:alpine AS builder

WORKDIR /app

# Copia os arquivos de dependência e instala somente as deps necessárias para build
COPY package.json package-lock.json* ./
RUN npm install

# Copia o restante dos arquivos da aplicação e compila o TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Etapa 2: Imagem final para execução (leve)
FROM node:alpine

WORKDIR /app
ENV NODE_ENV=production

# Copia apenas os arquivos necessários para execução
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expõe a porta da aplicação
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "dist/server.js"]