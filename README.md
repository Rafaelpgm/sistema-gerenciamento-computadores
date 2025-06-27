# Sistema de Gerenciamento de Computadores

## Visão Geral

Este sistema foi desenvolvido para gerenciar o patrimônio de computadores da empresa, baseado na planilha "LevantamentoGeralMáquinasPGM.xlsx" fornecida. O sistema inclui:

- **Backend**: API REST desenvolvida em Flask com SQLAlchemy
- **Frontend**: Interface web moderna desenvolvida em React com Tailwind CSS
- **Banco de Dados**: SQLite com estrutura normalizada
- **Funcionalidades**: CRUD completo para patrimônios, modelos e gerências

## Estrutura do Banco de Dados

### Tabela `modelo_computador`
- `id` (INTEGER, PRIMARY KEY)
- `processador` (TEXT, NOT NULL)
- `quantidade_ram` (TEXT, NOT NULL)
- `tipo_ram` (TEXT, NOT NULL)
- `sistema_operacional` (TEXT, NOT NULL)
- `ssd` (BOOLEAN, NOT NULL)

### Tabela `gerencia`
- `id` (INTEGER, PRIMARY KEY)
- `nome` (TEXT, NOT NULL, UNIQUE)

### Tabela `patrimonio`
- `id` (INTEGER, PRIMARY KEY)
- `patrimonio` (TEXT, NOT NULL, UNIQUE)
- `nome_servidor_responsavel` (TEXT, NOT NULL)
- `modelo_id` (INTEGER, FOREIGN KEY)
- `gerencia_id` (INTEGER, FOREIGN KEY)

## Funcionalidades do Sistema

### Tela Principal - Patrimônios
- Visualização completa de todos os computadores
- Campos exibidos: Patrimônio, Responsável, Gerência, Modelo, Processador, RAM, SO, SSD
- Botões para adicionar, editar e excluir patrimônios
- Campos selecionáveis para Gerência e Modelo
- Preenchimento automático dos dados do modelo selecionado

### Tela de Modelos
- Gerenciamento dos modelos de computador disponíveis
- Campos: Processador, Quantidade RAM, Tipo RAM, Sistema Operacional, SSD
- Funcionalidades de adicionar, editar e excluir modelos

### Tela de Gerências
- Gerenciamento dos setores e departamentos
- Campo: Nome da gerência
- Funcionalidades de adicionar, editar e excluir gerências

## Como Executar o Sistema

### Pré-requisitos
- Python 3.11+
- Node.js 20+
- pnpm

### Backend (Flask)
```bash
cd gerenciamento-computadores
source venv/bin/activate
python src/main.py
```
O backend estará disponível em: http://localhost:5000

### Frontend (React)
```bash
cd frontend-computadores
pnpm run dev --host
```
O frontend estará disponível em: http://localhost:5173

## API Endpoints

### Patrimônios
- `GET /api/patrimonios` - Listar todos os patrimônios
- `POST /api/patrimonios` - Criar novo patrimônio
- `PUT /api/patrimonios/{id}` - Atualizar patrimônio
- `DELETE /api/patrimonios/{id}` - Excluir patrimônio

### Modelos
- `GET /api/modelos` - Listar todos os modelos
- `POST /api/modelos` - Criar novo modelo
- `PUT /api/modelos/{id}` - Atualizar modelo
- `DELETE /api/modelos/{id}` - Excluir modelo

### Gerências
- `GET /api/gerencias` - Listar todas as gerências
- `POST /api/gerencias` - Criar nova gerência
- `PUT /api/gerencias/{id}` - Atualizar gerência
- `DELETE /api/gerencias/{id}` - Excluir gerência

## Dados Importados

O sistema foi populado com todos os dados da planilha original:
- **5 modelos** de computador únicos
- **35 gerências** diferentes
- **205 patrimônios** com seus respectivos responsáveis

## Tecnologias Utilizadas

### Backend
- Flask (Framework web)
- SQLAlchemy (ORM)
- Flask-CORS (Cross-Origin Resource Sharing)
- SQLite (Banco de dados)

### Frontend
- React (Framework JavaScript)
- Tailwind CSS (Framework CSS)
- shadcn/ui (Componentes UI)
- Lucide React (Ícones)
- Vite (Build tool)

## Arquivos Importantes

- `database_schema.sql` - Script SQL completo para criação e população do banco
- `gerenciamento-computadores/` - Diretório do backend Flask
- `frontend-computadores/` - Diretório do frontend React
- `patrimonios.csv`, `modelos.csv`, `gerencias.csv` - Dados extraídos da planilha

## Observações

1. O sistema utiliza CORS para permitir comunicação entre frontend e backend
2. O banco de dados é criado automaticamente na primeira execução
3. Os dados são populados automaticamente se o banco estiver vazio
4. A interface é responsiva e funciona em dispositivos móveis
5. Validações impedem exclusão de modelos/gerências que possuem patrimônios associados

## Windows

## Back-end

cd C:\Users\Rafael\Documents\sistema-gerenciamento-computadores\backend-gerenciamento-computadores

# Criar ambiente virtual
python -m venv venv

# Ativar o ambiente virtual
.\venv\Scripts\Activate.ps1

# Iniciar o servidor Flask
python src/main.py

## Front-end

cd C:\Users\Rafael\Documents\sistema-gerenciamento-computadores\frontend-gerenciamento-computadores

# Instalar dependências
npm install -g pnpm
pnpm install

# Iniciar o servidor de desenvolvimento
pnpm run dev --host