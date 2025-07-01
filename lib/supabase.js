import dotenv from 'dotenv';
dotenv.config();
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

