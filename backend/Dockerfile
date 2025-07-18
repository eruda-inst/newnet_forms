# Dockerfile (versão corrigida)

# Use uma imagem base oficial do Python
FROM python:3.10-slim

# Define o diretório de trabalho para o nosso código
WORKDIR /code

# Copia o arquivo de dependências para o diretório de trabalho (/code)
COPY requirements.txt .

# Instala as dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copia a nossa pasta 'app' local para dentro do diretório de trabalho (/code/app)
COPY ./app ./app