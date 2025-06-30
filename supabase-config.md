# Configuração Supabase - Sync Mlabs

## Informações do Projeto
- **Nome do Projeto**: Sync Mlabs
- **URL**: https://onabaflydjcnnhmfehvs.supabase.co
- **Região**: AWS sa-east-1
- **Plano**: nano (Free)

## Credenciais (conforme prompt)
- **SUPABASE_URL**: https://onabaflydjcnnhmfehvs.supabase.co
- **SERVICE_ROLE_KEY**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...tr-ZI

## Estrutura da Tabela mlabs_reports
```sql
CREATE TABLE mlabs_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coletado_em DATE NOT NULL,
  relatorio TEXT NOT NULL,
  periodo JSONB NOT NULL,
  indicadores JSONB NOT NULL,
  inserted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice único para evitar duplicatas
CREATE UNIQUE INDEX mlabs_reports_uniq
  ON mlabs_reports (relatorio, (periodo->>'inicio'));
```

## Exemplo de Dados
```json
{
  "coletado_em": "2025-06-30",
  "relatorio": "Adenis Facebook",
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
    }
  ]
}
```

## Status
- ✅ Projeto identificado e acessado
- ✅ Credenciais confirmadas
- ✅ Estrutura da tabela definida
- ⚠️ Tabela será criada via código na aplicação

