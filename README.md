# 🐍 Coletor Mlabs Analytics (Python)

Sistema automatizado para coleta de dados do Mlabs Analytics, migrado para **Python** com **Playwright** e **Browserless**.

## ✅ Status do Projeto

- ✅ **Migração para Python** - Concluída com sucesso
- ✅ **Playwright + Browserless** - Resolve problema do Chrome no serverless
- ✅ **API funcionando** - Servidor local rodando sem erros
- ✅ **Variáveis de ambiente** - Configuradas corretamente
- ✅ **Conexão Supabase** - Funcionando
- ❌ **Tabela mlabs_reports** - Precisa ser criada no Supabase

## 🚀 Como Usar

### 1. Instalar Dependências Python

```bash
# Instalar Python 3.9+ (se necessário)
sudo apt update
sudo apt install python3.9 python3.9-pip

# Instalar dependências
pip install -r requirements.txt

# Instalar Playwright e navegadores
bash install-playwright.sh
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure suas variáveis:

```bash
cp env.example .env
# Edite o arquivo .env com suas credenciais
```

### 3. Criar Tabela no Supabase

Acesse o painel do Supabase e execute este SQL no SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS public.mlabs_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_relatorio TEXT NOT NULL,
    dados JSONB NOT NULL,
    status TEXT NOT NULL,
    erro TEXT,
    timestamp_coleta TIMESTAMPTZ NOT NULL,
    ambiente TEXT NOT NULL,
    inserted_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Testar Localmente

```bash
# Iniciar servidor local
python server.py

# Ou testar diretamente
python api/collect.py test
```

Acesse: http://localhost:3000/api/collect

### 5. Deploy na Vercel

```bash
# Deploy via CLI
vercel --prod

# Ou via Git (push para main branch)
git push origin main
```

## 📊 API Endpoints

- `GET /api/collect` - Executa coleta de dados do Mlabs Analytics

## 🔧 Configuração

As variáveis de ambiente já estão configuradas no arquivo `.env`:

- `SUPABASE_URL` - URL do projeto Supabase
- `SERVICE_ROLE_KEY` - Chave de serviço do Supabase
- `MLABS_AUTH_URL` - URL de autenticação do Mlabs Analytics

## 📝 Logs

O sistema mostra logs detalhados durante a execução:
- Status da conexão com Supabase
- Inicialização do browser
- Coleta de relatórios
- Salvamento no banco de dados

## 🎯 Objetivo

Coletar automaticamente indicadores dos 4 relatórios principais:
- **Adenis Facebook**
- **Adenis Instagram** 
- **Facebook Tecnovix**
- **Tecnovix Instagram**

## 🏗️ Arquitetura

```
├── /api
│   └── collect.py        # Função serverless Vercel (Python)
├── server.py             # Servidor local Python
├── requirements.txt      # Dependências Python
├── runtime.txt           # Versão Python
├── install-playwright.sh # Script de instalação
├── test-migration.py     # Script de teste
├── env.example           # Variáveis de ambiente
├── vercel.json           # Configuração cron programado
├── create_table.sql      # Script SQL para criar tabela
└── .env                  # Variáveis de ambiente (não versionado)
```

### 🐍 Tecnologias Utilizadas

- **Python 3.9** - Linguagem principal
- **Playwright** - Automação de browser
- **Browserless** - Serviço de browser remoto
- **Supabase** - Banco de dados
- **Vercel** - Deploy serverless

## 🚀 Deploy na Vercel

### 1. Configurar Variáveis de Ambiente

No painel da Vercel, configure:

| Variável | Valor |
|----------|-------|
| `SUPABASE_URL` | `https://onabaflydjcnnhmfehvs.supabase.co` |
| `SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...tr-ZI` |
| `MLABS_AUTH_URL` | URL completa com JWT do Mlabs Analytics |
| `MLABS_EMAIL` | Seu email do Mlabs Analytics |
| `MLABS_PASSWORD` | Sua senha do Mlabs Analytics |
| `BROWSERLESS_URL` | `https://chrome.browserless.io` (opcional) |
| `BROWSERLESS_API_KEY` | Sua chave API do Browserless (opcional) |

### 2. Deploy

```bash
# Instalar Vercel CLI (se necessário)
npm i -g vercel@latest

# Login na Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Verificar Cron Job

O sistema executa automaticamente todos os dias às 06:00 BRT (09:00 UTC).

## 📊 Estrutura de Dados

### Tabela Supabase: `mlabs_reports`

```sql
CREATE TABLE mlabs_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_relatorio TEXT NOT NULL,
  dados JSONB NOT NULL,
  status TEXT NOT NULL,
  erro TEXT,
  timestamp_coleta TIMESTAMPTZ NOT NULL,
  ambiente TEXT NOT NULL,
  inserted_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Formato JSON dos Dados

```json
{
  "tipo_relatorio": "vendas",
  "dados": [
    ["Produto", "Quantidade", "Valor"],
    ["Produto A", "10", "R$ 1.000,00"],
    ["Produto B", "5", "R$ 500,00"]
  ],
  "status": "sucesso",
  "erro": null,
  "timestamp_coleta": "2024-01-15T10:30:00Z",
  "ambiente": "vercel-python"
}
```

## 🔧 Desenvolvimento Local

### Instalação

```bash
# Instalar dependências Python
pip install -r requirements.txt

# Instalar Playwright
bash install-playwright.sh
```

### Teste Manual

```bash
# Testar migração
python test-migration.py

# Executar coleta única
curl http://localhost:3000/api/collect

# Testar diretamente
python api/collect.py test

# Com Vercel Dev
vercel dev
```

## 📝 Logs e Monitoramento

- **Logs da Vercel**: Painel Vercel > Deployments > Functions
- **Logs do Supabase**: Painel Supabase > Logs
- **Cron Jobs**: Painel Vercel > Cron Jobs

## 🔍 Troubleshooting

### Erro: "Chrome not found"
```bash
# Solução: Usar Browserless
export BROWSERLESS_URL=https://chrome.browserless.io
```

### Erro: "Playwright not installed"
```bash
# Solução: Instalar Playwright
pip install playwright
playwright install chromium
```

### Erro de Autenticação
- Verificar se `MLABS_EMAIL` e `MLABS_PASSWORD` estão corretos
- Credenciais podem expirar, necessário atualizar

### Erro de Timeout
- Função configurada para 5 minutos máximo
- Playwright pode demorar em páginas lentas

### Dados Não Coletados
- Verificar se seletores CSS ainda são válidos
- Interface do Mlabs pode ter mudado
- Verificar logs do Browserless

## 📈 Métricas Coletadas

### Facebook
- Visualizações de página
- Alcance total
- Total de Posts
- Novas curtidas
- Total de Curtidas
- Impressões de página

### Instagram
- Seguidores
- Começaram a Seguir
- Publicações
- Visualizações
- Alcance
- Curtidas
- Comentários
- Total de Interações
- Taxa de engajamento

## 🔄 Execução Automática

O sistema executa automaticamente via cron job configurado no `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/collect",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Horário**: Todos os dias às 09:00 UTC (06:00 BRT)

## 📚 Documentação Adicional

Para mais detalhes sobre o projeto, consulte:
- [Guia de Migração](MIGRATION_GUIDE.md) - Histórico da migração
- [Resumo da Migração](MIGRATION_SUMMARY.md) - Resumo executivo
- [Configuração do Browserless](https://chrome.browserless.io) - Serviço de browser

---

**🎉 Projeto limpo e otimizado!** O projeto agora usa Python com Playwright e Browserless, oferecendo compatibilidade total com ambientes serverless.

