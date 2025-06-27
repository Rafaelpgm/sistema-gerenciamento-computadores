# 1. Usar uma imagem base oficial do Python
FROM python:3.11-slim

# 2. Definir o diretório de trabalho dentro do contêiner
WORKDIR /app

# 3. Copiar o arquivo de dependências e instalar
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copiar o restante do código da aplicação
COPY . .

# 5. Expor a porta que o Flask usa (padrão é 5000)
EXPOSE 5000

# 6. Comando para iniciar a aplicação
CMD ["python", "src/main.py"]