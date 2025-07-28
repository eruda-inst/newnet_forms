# Estágio 1: Base - Define a imagem base Node.js
FROM node:20-alpine AS base

# Estágio 2: Builder - Instala dependências e constrói o projeto
FROM base AS builder
WORKDIR /app

# Copia os arquivos de gerenciamento de pacotes
COPY package.json package-lock.json ./

# Instala TODAS as dependências (incluindo devDependencies) para o build
RUN npm install

# Copia todo o código-fonte da aplicação
COPY . .

# Constrói a aplicação Next.js
# Isso irá gerar as pastas .next e public
RUN npm run build

# ---

# Estágio 3: Runner - Prepara a imagem final de produção
FROM base AS runner
WORKDIR /app

# Define o ambiente para produção, o que desabilita funcionalidades de desenvolvimento
ENV NODE_ENV=production

# Copia os arquivos de build do estágio 'builder' de forma otimizada
# Graças ao output: 'standalone', não precisamos copiar o node_modules inteiro
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expõe a porta que o Next.js usa por padrão
EXPOSE 3000

# Comando para iniciar o servidor Next.js em produção
# O 'server.js' é gerado automaticamente pelo output 'standalone'
CMD ["node", "server.js"]