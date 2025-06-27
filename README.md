# Sistema de Gerenciamento de Computadores

### Visão Geral###

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

1) Instalar o Docker
## Comando com build
2) docker-compose up -d --build
## Comando sem build
3) docker-compose up -d
## Popular o Banco (Somente primeira vez)
4) docker-compose exec backend python src/seed.py 

