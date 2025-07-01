# Instruções de Configuração - Supabase

## 1. Criar Tabela no Supabase

Acesse o painel do Supabase (https://supabase.com/dashboard) e execute o seguinte SQL no SQL Editor:

```sql
-- Criar tabela mlabs_reports
CREATE TABLE IF NOT EXISTS public.mlabs_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coletado_em DATE NOT NULL,
    relatorio TEXT NOT NULL,
    periodo JSONB NOT NULL,
    indicadores JSONB NOT NULL,
    inserted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índice único para evitar duplicatas
CREATE UNIQUE INDEX IF NOT EXISTS mlabs_reports_uniq
    ON public.mlabs_reports (relatorio, (periodo->>'inicio'));

-- Adicionar comentários na tabela
COMMENT ON TABLE public.mlabs_reports IS 'Tabela para armazenar relatórios coletados do Mlabs Analytics';
COMMENT ON COLUMN public.mlabs_reports.coletado_em IS 'Data em que os dados foram coletados';
COMMENT ON COLUMN public.mlabs_reports.relatorio IS 'Nome do relatório (ex: Adenis Facebook, Adenis Instagram)';
COMMENT ON COLUMN public.mlabs_reports.periodo IS 'Período do relatório em formato JSON (inicio, fim)';
COMMENT ON COLUMN public.mlabs_reports.indicadores IS 'Indicadores e métricas do relatório em formato JSON';
```

## 2. Configurar Variáveis de Ambiente na Vercel

Após criar a tabela, configure as variáveis de ambiente no painel da Vercel:

- `SUPABASE_URL`: https://onabaflydjcnnhmfehvs.supabase.co
- `SERVICE_ROLE_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYWJhZmx5ZGpjbm5obWZlaHZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMxNTMzOCwiZXhwIjoyMDY2ODkxMzM4fQ.gvnd5dIVIhM_yKADVHnd8xLv8jgG2MUpo_QaTdtr-ZI
- `MLABS_AUTH_URL`: https://analytics.mlabs.io/auth/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MTYwNjY5OGI5OWJiZTAwMTk5MDQ5MzgiLCJndWVzdCI6dHJ1ZSwiaWF0IjoxNzUxMzE4MjE1LCJleHAiOjE3NTEzMTgyNzV9.ntXn3G8x0F4wE9xE99cxwh8berUwArSwTjzW6ViO4F8

## 3. Testar Localmente

```bash
node index.js
```

## 4. Deploy na Vercel

```bash
./node_modules/.bin/vercel --prod --yes
``` 