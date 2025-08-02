# Etapa 1: base para instalar dependências
FROM node:alpine AS deps

WORKDIR /app

# Copia arquivos de dependência
COPY package.json package-lock.json* ./

# Instala apenas dependências (sem devDependencies)
RUN npm ci --omit=dev

# Etapa 2: imagem final (executável e leve)
FROM node:alpine

WORKDIR /app

# Copia apenas os arquivos necessários para execução
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY index.js ./
COPY service.js ./
COPY http-client.js ./

# Define o comando de inicialização do worker
CMD ["npm", "start"]
