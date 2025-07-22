# --- Estágio 1: Builder ---
# Usamos uma imagem oficial do Node.js como base para construir a aplicação.
FROM node:18-alpine AS builder

# Define o diretório de trabalho dentro do contêiner.
WORKDIR /app

# Copia os arquivos de manifesto de pacotes para aproveitar o cache do Docker.
COPY package.json package-lock.json ./

# Instala as dependências do projeto.
RUN npm install

# Copia o restante do código da sua aplicação para o contêiner.
COPY . .

# Roda o script de build do Next.js para gerar a versão de produção.
RUN npm run build

# --- Estágio 2: Runner ---
# Agora, usamos uma imagem Node.js limpa e enxuta para rodar a aplicação.
FROM node:18-alpine AS runner

WORKDIR /app

# Cria um usuário não-root para rodar a aplicação (boa prática de segurança).
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia apenas os artefatos de build necessários do estágio 'builder'.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Define o usuário que irá executar o processo da aplicação.
USER nextjs

# Expõe a porta que o Next.js usa por padrão.
EXPOSE 3000

# Define o comando para iniciar a aplicação em modo produção.
CMD ["npm", "start"]