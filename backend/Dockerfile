# Use a sua imagem base do Python. A -slim é uma boa opção.
FROM python:3.10-slim

# Defina o diretório de trabalho
WORKDIR /code

# Instala o cliente do PostgreSQL (que inclui o pg_isready) e o netcat para testes
RUN apt-get update && apt-get install -y postgresql-client netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Copia e instala as dependências
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copia todo o código do backend para o contêiner
COPY . /code/

# Copia o script de entrypoint e dá permissão de execução
COPY ./entrypoint.sh /code/entrypoint.sh
RUN chmod +x /code/entrypoint.sh

# Define o novo entrypoint
ENTRYPOINT ["/code/entrypoint.sh"]

# Define o comando padrão que o entrypoint irá executar no final
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
