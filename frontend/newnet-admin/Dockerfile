# frontend/newnet-admin/Dockerfile

# --- Estágio 1: Builder (Node.js) ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Gera os arquivos estáticos na pasta /app/dist
RUN npm run build

# --- Estágio 2: Runner (Nginx) ---
FROM nginx:alpine
# Copia os arquivos estáticos gerados para a pasta padrão do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Expõe a porta 80, que o Nginx usa por padrão
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]