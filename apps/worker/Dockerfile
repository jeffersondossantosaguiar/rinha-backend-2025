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


# Etapa 2: imagem final (executável e leve)
FROM node:alpine

WORKDIR /app

# Copia apenas os arquivos necessários para execução
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Define o comando de inicialização do worker
CMD ["node", "dist/index.js"]
