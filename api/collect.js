import dotenv from 'dotenv';
dotenv.config();
import { getBrowser, saveCookies } from '../lib/browser.js';
import { coletarTodosRelatorios } from '../lib/extractor.js';
import { saveReport, testConnection } from '../lib/supabase.js';

/**
 * Handler principal da API Vercel para coleta de dados do Mlabs Analytics
 * Endpoint: /api/collect
 * Método: GET/POST
 */
export default async function handler(req, res) {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Iniciando coleta de dados do Mlabs Analytics...');
    
    // Testa conexão com Supabase
    const supabaseOk = await testConnection();
    if (!supabaseOk) {
      return res.status(500).json({
        success: false,
        error: 'Falha na conexão com Supabase - Tabela não existe. Execute o SQL manualmente no painel do Supabase.',
        data: {
          tempoExecucao: `${Date.now() - startTime}ms`,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    console.log('Conexão com Supabase OK');
    
    // Inicializa browser
    console.log('🌐 Inicializando browser Puppeteer...');
    const { browser, page } = await getBrowser();
    console.log('✅ Browser inicializado com sucesso');
    
    try {
      // Executa coleta de todos os relatórios
      const resultados = await coletarTodosRelatorios(page);
      console.log(`📊 Coletados ${resultados.length} relatórios`);
      
      // Salva cookies da sessão para reutilização
      const cookies = await saveCookies(page);
      if (cookies.length > 0) {
        console.log(`🍪 ${cookies.length} cookies salvos para próxima execução`);
      }
      
      // Salva todos os relatórios no Supabase
      const savePromises = resultados.map(relatorio => saveReport(relatorio));
      await Promise.all(savePromises);
      console.log('💾 Todos os relatórios salvos no Supabase');
      
      const executionTime = Date.now() - startTime;
      const response = {
        success: true,
        message: 'Coleta concluída com sucesso',
        data: {
          relatoriosColetados: resultados.length,
          tempoExecucao: `${executionTime}ms`,
          timestamp: new Date().toISOString(),
          relatórios: resultados.map(r => ({
            nome: r.relatorio,
            periodo: r.periodo,
            indicadores: r.indicadores.length
          }))
        }
      };
      
      console.log('✅ Coleta concluída com sucesso', response.data);
      return res.status(200).json(response);
      
    } finally {
      // Sempre fecha o browser
      if (browser) {
        await browser.close();
        console.log('🔒 Browser fechado');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro durante a coleta:', error);
    
    const executionTime = Date.now() - startTime;
    const errorResponse = {
      success: false,
      error: error.message,
      data: {
        tempoExecucao: `${executionTime}ms`,
        timestamp: new Date().toISOString()
      }
    };
    
    return res.status(500).json(errorResponse);
  }
}

/**
 * Configuração para Vercel
 * Aumenta timeout para 5 minutos devido ao scraping
 */
export const config = {
  maxDuration: 300
};

