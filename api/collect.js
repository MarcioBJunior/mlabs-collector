import dotenv from 'dotenv';
dotenv.config();
// import { getBrowser, saveCookies } from '../lib/browser.js';
// import { coletarTodosRelatorios } from '../lib/extractor.js';
import { saveReport, supabase } from '../lib/supabase.js';

/**
 * Handler principal da API Vercel para coleta de dados do Mlabs Analytics
 * Endpoint: /api/collect
 * Método: GET/POST
 */
export default async function handler(req, res) {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Iniciando coleta de dados do Mlabs Analytics...');
    
    // Testa conexão com Supabase diretamente
    try {
      const { data, error } = await supabase
        .from('mlabs_reports')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Erro na conexão com Supabase:', error);
        return res.status(500).json({
          success: false,
          error: `Erro na conexão com Supabase: ${error.message}`,
          data: {
            tempoExecucao: `${Date.now() - startTime}ms`,
            timestamp: new Date().toISOString()
          }
        });
      }

      console.log('Conexão com Supabase OK');
    } catch (connectionError) {
      console.error('Erro ao testar conexão:', connectionError);
      return res.status(500).json({
        success: false,
        error: `Falha na conexão com Supabase: ${connectionError.message}`,
        data: {
          tempoExecucao: `${Date.now() - startTime}ms`,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Teste simples sem browser
    const executionTime = Date.now() - startTime;
    const response = {
      success: true,
      message: 'Teste de conexão com Supabase OK - Puppeteer desabilitado',
      data: {
        tempoExecucao: `${executionTime}ms`,
        timestamp: new Date().toISOString(),
        ambiente: process.env.VERCEL ? 'Vercel' : 'Local',
        nodeVersion: process.version,
        puppeteerStatus: 'desabilitado'
      }
    };
    
    console.log('✅ Teste concluído com sucesso', response.data);
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    
    const executionTime = Date.now() - startTime;
    const errorResponse = {
      success: false,
      error: error.message,
      stack: error.stack,
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

