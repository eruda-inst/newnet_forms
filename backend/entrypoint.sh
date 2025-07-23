#!/bin/sh

# entrypoint.sh

# Lê o nome de usuário do arquivo de segredo
# A variável POSTGRES_USER_FILE é definida no docker-compose para o serviço 'db'
# mas precisamos definir uma para a API também, ou ler diretamente.
# Vamos assumir que a API também terá acesso ao segredo 'db_user'.
DB_USER=$(cat /run/secrets/db_user)

# Aguarda o banco de dados estar pronto
echo "Aguardando o banco de dados ficar disponível..."
# Note que estamos usando a variável DB_USER que lemos do segredo
while ! pg_isready -h "$DB_LOCAL_HOST" -p "$DB_LOCAL_PORT" -U "$DB_USER" > /dev/null 2> /dev/null; do
  echo "Banco de dados indisponível, aguardando..."
  sleep 2
done

echo "Banco de dados está pronto! Iniciando a aplicação..."
# Executa o comando principal do contêiner
exec "$@"
