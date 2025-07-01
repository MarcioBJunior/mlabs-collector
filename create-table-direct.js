import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

async function createTableDirect() {
  try {
    console.log('🔧 Tentando criar tabela via SQL direto...');
    
    // SQL para criar a tabela
    const createTableSQL = `
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
    `;

    // Tenta executar via SQL direto (pode não funcionar em todos os projetos)
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        query: createTableSQL
      })
    });

    if (response.ok) {
      console.log('✅ Tabela criada com sucesso!');
      return true;
    } else {
      console.log('⚠️  Não foi possível criar a tabela automaticamente.');
      console.log('📋 Execute o SQL manualmente no painel do Supabase:');
      console.log('\n' + createTableSQL + '\n');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error.message);
    console.log('📋 Execute o SQL manualmente no painel do Supabase:');
    console.log(`
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
    `);
    return false;
  }
}

createTableDirect(); 