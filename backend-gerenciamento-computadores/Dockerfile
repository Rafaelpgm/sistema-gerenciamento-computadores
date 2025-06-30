# 1. Usar uma imagem base oficial do Python
FROM python:3.11-slim

# 2. Definir o diretório de trabalho dentro do contêiner
WORKDIR /app

# 3. Copiar o arquivo de dependências e instalar
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# 4. Copiar o restante do código da aplicação
COPY . .
COPY database_schema.sql .
RUN chmod +x entrypoint.sh

# 5. Expor a porta que o Gunicorn usará
EXPOSE 5000

# 6. Comando para iniciar a aplicação com Gunicorn
ENTRYPOINT ["./entrypoint.sh"]
