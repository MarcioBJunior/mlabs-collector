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