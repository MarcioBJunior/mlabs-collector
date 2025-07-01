# Coletor Mlabs Analytics

Sistema automatizado para coleta de dados do Mlabs Analytics.

## ✅ Status do Projeto

- ✅ **API funcionando** - Servidor local rodando sem erros
- ✅ **Variáveis de ambiente** - Configuradas corretamente
- ✅ **Conexão Supabase** - Funcionando
- ❌ **Tabela mlabs_reports** - Precisa ser criada no Supabase

## 🚀 Como Usar

### 1. Criar Tabela no Supabase

Acesse o painel do Supabase e execute este SQL no SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS public.mlabs_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coletado_em DATE NOT NULL,
    relatorio TEXT NOT NULL,
    periodo JSONB NOT NULL,
    indicadores JSONB NOT NULL,
    inserted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS mlabs_reports_uniq
    ON public.mlabs_reports (relatorio, (periodo->>'inicio'));
```

### 2. Testar Localmente

```bash
node index.js
```

Acesse: http://localhost:3000/api/collect

### 3. Deploy na Vercel

```bash
./node_modules/.bin/vercel --prod --yes
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
│   └── collect.js        # Função serverless Vercel
├── /lib
│   ├── browser.js        # Instância Puppeteer headless-chrome
│   ├── extractor.js      # Lógica de scraping / mapeamento DOM→JSON
│   └── supabase.js       # Client & persistência
├── .env.example          # Variáveis de ambiente
├── vercel.json           # Configuração cron programado
└── package.json
```

## 🚀 Deploy na Vercel

### 1. Configurar Variáveis de Ambiente

No painel da Vercel, configure:

| Variável | Valor |
|----------|-------|
| `SUPABASE_URL` | `https://onabaflydjcnnhmfehvs.supabase.co` |
| `SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...tr-ZI` |
| `MLABS_AUTH_URL` | URL completa com JWT do Mlabs Analytics |
| `COOKIE_STORE` | `[]` (será preenchido automaticamente) |

### 2. Deploy

```bash
npm i -g vercel@latest
vercel login --token OXgRb4xhaJQS2SaN7P5BG4E9
vercel --prod
```

### 3. Verificar Cron Job

O sistema executa automaticamente todos os dias às 06:00 BRT (09:00 UTC).

## 📊 Estrutura de Dados

### Tabela Supabase: `mlabs_reports`

```sql
CREATE TABLE mlabs_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coletado_em DATE NOT NULL,
  relatorio TEXT NOT NULL,
  periodo JSONB NOT NULL,
  indicadores JSONB NOT NULL,
  inserted_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Formato JSON dos Dados

```json
{
  "coletadoEm": "2025-06-30",
  "relatorio": "Adenis Instagram",
  "periodo": {
    "inicio": "2025-06-29",
    "fim": "2025-06-29"
  },
  "indicadores": [
    {
      "titulo": "Visão Geral",
      "nome": "Seguidores",
      "valor": 719,
      "variacaoPercentual": 0.00
    },
    {
      "titulo": "Visão Geral",
      "nome": "Curtidas",
      "valor": 36
    }
  ]
}
```

## 🔧 Desenvolvimento Local

### Instalação

```bash
npm install
```

### Teste Manual

```bash
# Executar coleta única
curl http://localhost:3000/api/collect

# Com Vercel Dev
vercel dev
```

## 📝 Logs e Monitoramento

- **Logs da Vercel**: Painel Vercel > Deployments > Functions
- **Logs do Supabase**: Painel Supabase > Logs
- **Cron Jobs**: Painel Vercel > Cron Jobs

## 🔍 Troubleshooting

### Erro de Autenticação
- Verificar se `MLABS_AUTH_URL` está atualizada
- JWT pode expirar, necessário gerar nova URL

### Erro de Timeout
- Função configurada para 5 minutos máximo
- Puppeteer pode demorar em páginas lentas

### Dados Não Coletados
- Verificar se seletores CSS ainda são válidos
- Interface do Mlabs pode ter mudado

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

