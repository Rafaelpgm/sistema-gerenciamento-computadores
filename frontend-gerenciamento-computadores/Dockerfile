# 1. Usar uma imagem base oficial do Node.js (Alpine é uma versão leve)
FROM node:18-alpine

# 2. Instalar o pnpm globalmente, como nas suas instruções
RUN npm install -g pnpm

# 3. Definir o diretório de trabalho dentro do contêiner
WORKDIR /app

# 4. Copiar os arquivos de manifesto de pacotes para otimizar o cache do Docker
COPY package.json pnpm-lock.yaml ./

# 5. Instalar as dependências do projeto com pnpm
RUN pnpm install

# 6. Copiar o restante do código da aplicação
COPY . .

# 7. Expor a porta do servidor de desenvolvimento (Vite/React geralmente usam 3000 ou 5173)
#    Verifique qual porta seu `pnpm run dev` usa. Vou usar 5173 como exemplo.
EXPOSE 5173

# 8. Comando para iniciar o servidor de desenvolvimento
#    O `--host` é essencial para que o servidor seja acessível de fora do contêiner.
CMD ["pnpm", "run", "dev", "--host"]