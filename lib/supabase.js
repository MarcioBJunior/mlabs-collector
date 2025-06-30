import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Variáveis de ambiente SUPABASE_URL e SERVICE_ROLE_KEY são obrigatórias');
}

export const supabase = createClient(supabaseUrl, serviceRoleKey);

/**
 * Salva um relatório na tabela mlabs_reports
 * @param {Object} payload - Dados do relatório
 * @returns {Object} Resultado da operação
 */
export async function saveReport(payload) {
  try {
    console.log(`Salvando relatório: ${payload.relatorio} - ${payload.periodo?.inicio}`);
    
    const { data, error } = await supabase
      .from('mlabs_reports')
      .upsert(payload, {
        onConflict: 'relatorio,periodo->>inicio'
      })
      .select();

    if (error) {
      console.error('Erro ao salvar relatório:', error);
      throw error;
    }

    console.log('Relatório salvo com sucesso:', data?.[0]?.id);
    return { success: true, data };
  } catch (error) {
    console.error('Erro na função saveReport:', error);
    throw error;
  }
}

/**
 * Busca relatórios existentes por período
 * @param {string} relatorio - Nome do relatório
 * @param {string} dataInicio - Data de início (YYYY-MM-DD)
 * @returns {Array} Relatórios encontrados
 */
export async function getExistingReports(relatorio, dataInicio) {
  try {
    const { data, error } = await supabase
      .from('mlabs_reports')
      .select('*')
      .eq('relatorio', relatorio)
      .eq('periodo->>inicio', dataInicio);

    if (error) {
      console.error('Erro ao buscar relatórios:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro na função getExistingReports:', error);
    return [];
  }
}

/**
 * Testa a conexão com o Supabase
 * @returns {boolean} Status da conexão
 */
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('mlabs_reports')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Erro na conexão com Supabase:', error);
      return false;
    }

    console.log('Conexão com Supabase OK');
    return true;
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    return false;
  }
}

/**
 * Cria a tabela mlabs_reports se não existir
 * @returns {boolean} Status da criação
 */
export async function ensureTableExists() {
  try {
    console.log('Verificando/criando tabela mlabs_reports...');
    
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

    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (error) {
      console.error('Erro ao criar tabela:', error);
      // Tenta criar usando query direta se RPC falhar
      const { error: directError } = await supabase
        .from('mlabs_reports')
        .select('count')
        .limit(1);
        
      if (directError && directError.code === '42P01') {
        // Tabela não existe, vamos criá-la via SQL direto
        console.log('Criando tabela via SQL direto...');
        // Para Vercel, a tabela deve ser criada manualmente ou via migration
        console.warn('Tabela mlabs_reports deve ser criada manualmente no Supabase');
        return false;
      }
    }

    console.log('✅ Tabela mlabs_reports verificada/criada com sucesso');
    return true;
  } catch (error) {
    console.error('Erro na função ensureTableExists:', error);
    return false;
  }
}

