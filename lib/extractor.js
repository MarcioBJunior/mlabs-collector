import { waitForElement } from './browser.js';

// URLs e configurações baseadas no mapeamento realizado
const MLABS_AUTH_URL = process.env.MLABS_AUTH_URL || 'https://analytics.mlabs.io/auth/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MTYwNjY5OGI5OWJiZTAwMTk5MDQ5MzgiLCJndWVzdCI6dHJ1ZSwiaWF0IjoxNzUxMzE4MjE1LCJleHAiOjE3NTEzMTgyNzV9.ntXn3G8x0F4wE9xE99cxwh8berUwArSwTjzW6ViO4F8';

// Mapeamento dos relatórios conforme identificado na exploração
const RELATORIOS_CONFIG = [
  {
    codigo: 'A',
    nome: 'Adenis Facebook',
    id: '685edc6e06042600371c10a7',
    tipo: 'facebook'
  },
  {
    codigo: 'B', 
    nome: 'Adenis Instagram',
    id: '685edc1d06042600371c0778',
    tipo: 'instagram'
  },
  {
    codigo: 'C',
    nome: 'Facebook Tecnovix',
    id: 'facebook_tecnovix_id', // Será descoberto dinamicamente
    tipo: 'facebook'
  },
  {
    codigo: 'D',
    nome: 'Tecnovix Instagram', 
    id: 'tecnovix_instagram_id', // Será descoberto dinamicamente
    tipo: 'instagram'
  }
];

/**
 * Função principal que coleta dados de todos os relatórios
 * @param {Object} page - Instância da página do Puppeteer
 * @returns {Array} Array com dados de todos os relatórios
 */
export async function coletarTodosRelatorios(page) {
  try {
    console.log('🔐 Iniciando autenticação no Mlabs Analytics...');
    
    // Navega para URL de autenticação
    await page.goto(MLABS_AUTH_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    
    // Verifica se foi redirecionado para o painel principal
    const currentUrl = page.url();
    if (!currentUrl.includes('analytics.mlabs.io')) {
      throw new Error('Falha na autenticação - não foi redirecionado para o painel');
    }
    
    console.log('✅ Autenticação realizada com sucesso');
    
    // Navega para a página de relatórios
    await page.goto('https://analytics.mlabs.io/reports', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    console.log('📋 Acessando lista de relatórios...');
    
    // Descobre IDs dos relatórios dinamicamente
    const relatoriosEncontrados = await descobrirRelatorios(page);
    console.log(`📊 Encontrados ${relatoriosEncontrados.length} relatórios`);
    
    const resultados = [];
    
    // Processa cada relatório
    for (const relatorio of relatoriosEncontrados) {
      try {
        console.log(`🔍 Processando: ${relatorio.nome}`);
        const dados = await extrairDadosRelatorio(page, relatorio);
        resultados.push(dados);
        console.log(`✅ ${relatorio.nome} processado com sucesso`);
      } catch (error) {
        console.error(`❌ Erro ao processar ${relatorio.nome}:`, error.message);
        // Continua com os próximos relatórios mesmo se um falhar
      }
    }
    
    return resultados;
    
  } catch (error) {
    console.error('❌ Erro na coleta de relatórios:', error);
    throw error;
  }
}

/**
 * Descobre dinamicamente os IDs dos relatórios na página
 * @param {Object} page - Instância da página
 * @returns {Array} Lista de relatórios encontrados
 */
async function descobrirRelatorios(page) {
  try {
    // Aguarda a tabela de relatórios carregar
    await waitForElement(page, 'table, [data-testid="reports-table"]', 10000);
    
    // Extrai informações dos relatórios da página
    const relatorios = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/report/"]'));
      return links.map(link => {
        const href = link.getAttribute('href');
        const id = href.split('/report/')[1];
        const nome = link.textContent.trim();
        
        // Determina o tipo baseado no nome
        let tipo = 'unknown';
        if (nome.toLowerCase().includes('facebook')) {
          tipo = 'facebook';
        } else if (nome.toLowerCase().includes('instagram')) {
          tipo = 'instagram';
        }
        
        return { nome, id, tipo, url: `https://analytics.mlabs.io${href}` };
      });
    });
    
    // Filtra apenas os 4 relatórios esperados
    const relatoriosAlvo = relatorios.filter(r => 
      r.nome.includes('Adenis Facebook') ||
      r.nome.includes('Adenis Instagram') ||
      r.nome.includes('Facebook Tecnovix') ||
      r.nome.includes('Tecnovix Instagram')
    );
    
    return relatoriosAlvo;
    
  } catch (error) {
    console.error('Erro ao descobrir relatórios:', error);
    return [];
  }
}

/**
 * Extrai dados de um relatório específico
 * @param {Object} page - Instância da página
 * @param {Object} relatorio - Configuração do relatório
 * @returns {Object} Dados extraídos do relatório
 */
async function extrairDadosRelatorio(page, relatorio) {
  try {
    // Navega para o relatório específico
    await page.goto(relatorio.url, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    
    // Configura período para "ontem"
    await configurarPeriodoOntem(page);
    
    // Aguarda carregamento dos dados
    await page.waitForTimeout(5000);
    
    // Extrai dados baseado no tipo de relatório
    let indicadores = [];
    if (relatorio.tipo === 'facebook') {
      indicadores = await extrairDadosFacebook(page);
    } else if (relatorio.tipo === 'instagram') {
      indicadores = await extrairDadosInstagram(page);
    }
    
    // Extrai período atual do relatório
    const periodo = await extrairPeriodo(page);
    
    return {
      coletadoEm: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      relatorio: relatorio.nome,
      periodo,
      indicadores
    };
    
  } catch (error) {
    console.error(`Erro ao extrair dados de ${relatorio.nome}:`, error);
    throw error;
  }
}

/**
 * Configura o período do relatório para "ontem"
 * @param {Object} page - Instância da página
 */
async function configurarPeriodoOntem(page) {
  try {
    // Procura pelo seletor de período
    const seletorPeriodo = await page.$('[data-testid="date-picker"], .date-picker, button[aria-label*="período"], button[aria-label*="period"]');
    
    if (seletorPeriodo) {
      await seletorPeriodo.click();
      await page.waitForTimeout(1000);
      
      // Procura pela opção "Ontem" ou "Yesterday"
      const opcaoOntem = await page.$('text=Ontem, text=Yesterday, [data-value="yesterday"]');
      if (opcaoOntem) {
        await opcaoOntem.click();
        await page.waitForTimeout(2000);
        console.log('📅 Período configurado para ontem');
      } else {
        console.warn('⚠️ Opção "Ontem" não encontrada, usando período atual');
      }
    } else {
      console.warn('⚠️ Seletor de período não encontrado');
    }
  } catch (error) {
    console.warn('⚠️ Erro ao configurar período:', error.message);
  }
}

/**
 * Extrai dados específicos do Facebook
 * @param {Object} page - Instância da página
 * @returns {Array} Indicadores do Facebook
 */
async function extrairDadosFacebook(page) {
  try {
    const indicadores = await page.evaluate(() => {
      const dados = [];
      
      // Extrai dados do widget "Visão Geral"
      const visaoGeral = document.querySelector('[data-testid="overview"], .overview-widget, .visao-geral');
      if (visaoGeral) {
        // Procura por métricas específicas do Facebook
        const metricas = visaoGeral.querySelectorAll('[data-metric], .metric, .kpi');
        
        metricas.forEach(metrica => {
          const nome = metrica.querySelector('.metric-name, .label, h3, h4')?.textContent?.trim();
          const valorElement = metrica.querySelector('.metric-value, .value, .number');
          const valor = valorElement ? parseFloat(valorElement.textContent.replace(/[^\d.-]/g, '')) || 0 : 0;
          
          if (nome) {
            dados.push({
              titulo: 'Visão Geral',
              nome,
              valor
            });
          }
        });
      }
      
      // Fallback: extrai dados de texto visível
      const textoCompleto = document.body.textContent;
      const patterns = [
        /Visualizações de página[:\s]+(\d+)/i,
        /Alcance total[:\s]+(\d+)/i,
        /Total de Posts[:\s]+(\d+)/i,
        /Novas curtidas[:\s]+(\d+)/i,
        /Total de Curtidas[:\s]+(\d+)/i,
        /Impressões de página[:\s]+(\d+)/i
      ];
      
      patterns.forEach(pattern => {
        const match = textoCompleto.match(pattern);
        if (match) {
          const nome = pattern.source.split('[')[0].replace(/\\/g, '');
          const valor = parseInt(match[1]) || 0;
          dados.push({
            titulo: 'Visão Geral',
            nome,
            valor
          });
        }
      });
      
      return dados;
    });
    
    return indicadores;
    
  } catch (error) {
    console.error('Erro ao extrair dados do Facebook:', error);
    return [];
  }
}

/**
 * Extrai dados específicos do Instagram
 * @param {Object} page - Instância da página
 * @returns {Array} Indicadores do Instagram
 */
async function extrairDadosInstagram(page) {
  try {
    const indicadores = await page.evaluate(() => {
      const dados = [];
      
      // Extrai dados do widget "Visão Geral" do Instagram
      const visaoGeral = document.querySelector('[data-testid="overview"], .overview-widget, .visao-geral');
      if (visaoGeral) {
        const metricas = visaoGeral.querySelectorAll('[data-metric], .metric, .kpi');
        
        metricas.forEach(metrica => {
          const nome = metrica.querySelector('.metric-name, .label, h3, h4')?.textContent?.trim();
          const valorElement = metrica.querySelector('.metric-value, .value, .number');
          const valor = valorElement ? parseFloat(valorElement.textContent.replace(/[^\d.-]/g, '')) || 0 : 0;
          
          if (nome) {
            dados.push({
              titulo: 'Visão Geral',
              nome,
              valor
            });
          }
        });
      }
      
      // Fallback: extrai dados de texto visível específicos do Instagram
      const textoCompleto = document.body.textContent;
      const patterns = [
        /Seguidores[:\s]+(\d+)/i,
        /Começaram a Seguir[:\s]+(\d+)/i,
        /Publicações[:\s]+(\d+)/i,
        /Visualizações[:\s]+(\d+)/i,
        /Alcance[:\s]+(\d+)/i,
        /Curtidas[:\s]+(\d+)/i,
        /Comentários[:\s]+(\d+)/i,
        /Total de Interações[:\s]+(\d+)/i,
        /Taxa de engajamento[:\s]+([\d,]+)/i
      ];
      
      patterns.forEach(pattern => {
        const match = textoCompleto.match(pattern);
        if (match) {
          const nome = pattern.source.split('[')[0].replace(/\\/g, '');
          let valor = parseFloat(match[1].replace(',', '.')) || 0;
          dados.push({
            titulo: 'Visão Geral',
            nome,
            valor
          });
        }
      });
      
      return dados;
    });
    
    return indicadores;
    
  } catch (error) {
    console.error('Erro ao extrair dados do Instagram:', error);
    return [];
  }
}

/**
 * Extrai o período atual do relatório
 * @param {Object} page - Instância da página
 * @returns {Object} Período com início e fim
 */
async function extrairPeriodo(page) {
  try {
    const periodo = await page.evaluate(() => {
      // Procura por elementos que contenham datas
      const dateElements = document.querySelectorAll('[data-testid="date-range"], .date-range, .periodo');
      
      for (const element of dateElements) {
        const texto = element.textContent;
        const match = texto.match(/(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})/);
        if (match) {
          return {
            inicio: match[1].split('/').reverse().join('-'), // DD/MM/YYYY -> YYYY-MM-DD
            fim: match[2].split('/').reverse().join('-')
          };
        }
      }
      
      // Fallback: usa data de ontem
      const ontem = new Date();
      ontem.setDate(ontem.getDate() - 1);
      const dataOntem = ontem.toISOString().split('T')[0];
      
      return {
        inicio: dataOntem,
        fim: dataOntem
      };
    });
    
    return periodo;
    
  } catch (error) {
    console.error('Erro ao extrair período:', error);
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const dataOntem = ontem.toISOString().split('T')[0];
    
    return {
      inicio: dataOntem,
      fim: dataOntem
    };
  }
}

