import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

async function createTable() {
  try {
    console.log('🔧 Criando tabela mlabs_reports no Supabase...');
    
    const sqlContent = fs.readFileSync('./create_table.sql', 'utf8');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        sql: sqlContent
      })
    });

    if (response.ok) {
      console.log('✅ Tabela criada com sucesso!');
    } else {
      console.log('⚠️  Erro ao criar tabela via RPC, tentando método alternativo...');
      
      // Tenta criar a tabela diretamente via query
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.mlabs_reports (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          coletado_em DATE NOT NULL,
          relatorio TEXT NOT NULL,
          periodo JSONB NOT NULL,
          indicadores JSONB NOT NULL,
          inserted_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
      
      const response2 = await fetch(`${SUPABASE_URL}/rest/v1/mlabs_reports?select=count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY
        }
      });
      
      if (response2.status === 404) {
        console.log('❌ Tabela não existe. Execute o SQL manualmente no painel do Supabase:');
        console.log('📋 SQL para executar:');
        console.log(sqlContent);
      } else {
        console.log('✅ Tabela já existe ou foi criada com sucesso!');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error.message);
    console.log('📋 Execute o SQL manualmente no painel do Supabase:');
    console.log(fs.readFileSync('./create_table.sql', 'utf8'));
  }
}

createTable(); 