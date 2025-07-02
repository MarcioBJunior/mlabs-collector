import os
import json
import time
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv
from playwright.async_api import async_playwright
from supabase import create_client, Client

# Carrega variáveis de ambiente
load_dotenv()

# Força a URL de autenticação para a fornecida pelo usuário
os.environ['MLABS_AUTH_URL'] = 'https://analytics.mlabs.io/auth/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MTYwNjY5OGI5OWJiZTAwMTk5MDQ5MzgiLCJndWVzdCI6dHJ1ZSwiaWF0IjoxNzUxNDE4ODY3LCJleHAiOjE3NTE0MTg5Mjd9.MYEbc_rakPQTn9CuUwJfJgpqbvkAOn8m2IUGmDYPvjQ'

# Configuração do Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL')
SERVICE_ROLE_KEY = os.getenv('SERVICE_ROLE_KEY')
supabase: Client = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)

# Configuração do Browserless (serviço externo)
BROWSERLESS_API_KEY = os.getenv('BROWSERLESS_API_KEY', '')  # Opcional
BROWSERLESS_URL = os.getenv('BROWSERLESS_URL', 'https://chrome.browserless.io')

class MlabsCollector:
    def __init__(self):
        self.browserless_url = BROWSERLESS_URL
        self.browserless_api_key = BROWSERLESS_API_KEY
        
        # Relatórios fixos conforme especificação
        self.relatorios = {
            'A': {
                'codigo': 'A',
                'titulo': 'Adenis Facebook',
                'url': 'https://analytics.mlabs.io/report/685edc6e06042600371c10a7'
            },
            'B': {
                'codigo': 'B', 
                'titulo': 'Adenis Instagram',
                'url': 'https://analytics.mlabs.io/report/685edc1d06042600371c0778'
            },
            'C': {
                'codigo': 'C',
                'titulo': 'Facebook Tecnovix', 
                'url': 'https://analytics.mlabs.io/report/685edb4e06042600371bf224'
            },
            'D': {
                'codigo': 'D',
                'titulo': 'Tecnovix Instagram',
                'url': 'https://analytics.mlabs.io/report/685edabb06042600371bd88a'
            }
        }
        
    async def get_browser(self):
        """Conecta ao Browserless se configurado, senão roda localmente"""
        playwright = await async_playwright().start()
        
        # Configuração para Browserless
        browser_args = [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
        
        if self.browserless_url and self.browserless_api_key:
            # Monta a URL com token para Browserless
            browserless_url = self.browserless_url
            if self.browserless_api_key:
                if '?' in browserless_url:
                    browserless_url += f'&token={self.browserless_api_key}'
                else:
                    browserless_url += f'?token={self.browserless_api_key}'
            browserless_ws_url = browserless_url.replace('https://', 'wss://')
            browser = await playwright.chromium.connect_over_cdp(
                endpoint_url=f"{browserless_ws_url}/devtools/browser",
                args=browser_args
            )
            return playwright, browser
        else:
            # Roda localmente
            browser = await playwright.chromium.launch(headless=True, args=browser_args)
            return playwright, browser
    
    async def login_mlabs(self, page) -> bool:
        """Acessa a URL autenticada do Mlabs Analytics"""
        try:
            print("🔐 Acessando diretamente a URL autenticada do Mlabs Analytics...")
            login_url = os.getenv('MLABS_AUTH_URL')
            await page.goto(login_url, wait_until='networkidle')
            await page.wait_for_load_state('networkidle')
            
            # Aguarda carregamento completo
            await page.wait_for_timeout(8000)
            
            # Loga cookies da sessão
            cookies = await page.context.cookies()
            print(f"🍪 Cookies após login:")
            for c in cookies:
                print(f"  - {c['name']}: {c['value']}")
            
            # Verifica se está autenticado
            current_url = page.url
            print(f"📍 URL após login: {current_url}")
            
            if await page.locator('body').is_visible():
                print("✅ Acesso autenticado com sucesso")
                return True
            else:
                print("❌ Não autenticado")
                return False
        except Exception as e:
            print(f"❌ Erro ao acessar URL autenticada: {str(e)}")
            return False
    
    def get_periodo_ontem(self) -> Dict[str, str]:
        """Retorna o período de ontem (D-1) no formato AAAA-MM-DD"""
        ontem = datetime.now() - timedelta(days=1)
        data_ontem = ontem.strftime('%Y-%m-%d')
        return {
            'inicio': data_ontem,
            'fim': data_ontem
        }
    
    async def analisar_pagina(self, page) -> Dict[str, Any]:
        """Analisa a página e mapeia elementos importantes"""
        try:
            print("🔍 Analisando estrutura da página...")
            
            # Aguarda carregamento completo
            await page.wait_for_timeout(3000)
            
            # Analisa elementos da página
            elementos = await page.evaluate("""
                () => {
                    const resultado = {
                        titulo_pagina: document.title,
                        url_atual: window.location.href,
                        elementos_periodo: [],
                        elementos_kpis: [],
                        elementos_botoes: [],
                        estrutura_geral: {}
                    };
                    
                    // Mapeia elementos de período
                    const elementosPeriodo = document.querySelectorAll('[class*="date"], [class*="period"], [class*="daterange"], [data-testid*="date"], [data-testid*="period"]');
                    elementosPeriodo.forEach(el => {
                        resultado.elementos_periodo.push({
                            tag: el.tagName,
                            classes: el.className,
                            textContent: el.textContent?.trim().substring(0, 100),
                            dataTestId: el.getAttribute('data-testid'),
                            ariaLabel: el.getAttribute('aria-label'),
                            isVisible: el.offsetParent !== null
                        });
                    });
                    
                    // Mapeia elementos de KPIs/métricas
                    const elementosKPIs = document.querySelectorAll('[class*="metric"], [class*="kpi"], [class*="stat"], [class*="value"], [class*="number"], [data-testid*="metric"], [data-testid*="kpi"]');
                    elementosKPIs.forEach(el => {
                        resultado.elementos_kpis.push({
                            tag: el.tagName,
                            classes: el.className,
                            textContent: el.textContent?.trim().substring(0, 100),
                            dataTestId: el.getAttribute('data-testid'),
                            isVisible: el.offsetParent !== null
                        });
                    });
                    
                    // Mapeia botões
                    const botoes = document.querySelectorAll('button, [role="button"], .btn, .button');
                    botoes.forEach(el => {
                        const texto = el.textContent?.trim();
                        if (texto && (texto.includes('Salvar') || texto.includes('Save') || texto.includes('Aplicar') || texto.includes('Apply'))) {
                            resultado.elementos_botoes.push({
                                tag: el.tagName,
                                classes: el.className,
                                textContent: texto,
                                dataTestId: el.getAttribute('data-testid'),
                                isVisible: el.offsetParent !== null
                            });
                        }
                    });
                    
                    // Estrutura geral da página
                    resultado.estrutura_geral = {
                        hasDateRangeDisplay: !!document.querySelector('.dg-daterange-display'),
                        hasPeriodModal: !!document.querySelector('.report-period-modal'),
                        hasSelectInput: !!document.querySelector('.select-input'),
                        hasTables: document.querySelectorAll('table').length,
                        hasCharts: document.querySelectorAll('canvas, svg').length,
                        hasMetrics: document.querySelectorAll('[class*="metric"], [class*="kpi"]').length
                    };
                    
                    return resultado;
                }
            """)
            
            print(f"📋 Análise da página:")
            print(f"   - Título: {elementos['titulo_pagina']}")
            print(f"   - URL: {elementos['url_atual']}")
            print(f"   - Elementos de período: {len(elementos['elementos_periodo'])}")
            print(f"   - Elementos de KPIs: {len(elementos['elementos_kpis'])}")
            print(f"   - Botões de ação: {len(elementos['elementos_botoes'])}")
            print(f"   - Estrutura: {elementos['estrutura_geral']}")
            
            return elementos
            
        except Exception as e:
            print(f"❌ Erro ao analisar página: {str(e)}")
            return {}
    
    async def configurar_filtro_periodo(self, page, periodo: Dict[str, str]) -> bool:
        """Configura o filtro de período para ontem (D-1)"""
        try:
            print(f"📅 Configurando filtro de período: {periodo['inicio']} a {periodo['fim']}")
            
            # Aguarda carregamento da página
            await page.wait_for_timeout(3000)
            
            # 1. Clica no seletor de período específico do Mlabs
            print("🎯 Clicando no seletor de período...")
            await page.wait_for_selector('.dg-daterange-display', timeout=5000)
            await page.click('.dg-daterange-display')
            print("✅ Clicou no seletor de período")
            await page.wait_for_timeout(2000)  # Aguarda popup abrir
            
            # 2. Aguarda o popup do período aparecer
            print("🔄 Aguardando popup do período...")
            await page.wait_for_selector('.report-period-modal__content__item__form', timeout=5000)
            
            # 3. Clica no dropdown de período
            print("📋 Clicando no dropdown de período...")
            await page.click('.select-input__input')
            await page.wait_for_timeout(1000)
            
            # 4. Procura e clica na opção "Ontem"
            print("🔍 Procurando opção 'Ontem'...")
            ontem_selectors = [
                'text=Ontem',
                'text=Yesterday',
                'text=Último dia',
                'text=Last day',
                'text=Ontem (D-1)',
                'text=Yesterday (D-1)',
                'li:has-text("Ontem")',
                'li:has-text("Yesterday")',
                '[data-value="yesterday"]',
                '[data-value="last-day"]'
            ]
            
            for selector in ontem_selectors:
                try:
                    await page.click(selector, timeout=2000)
                    print(f"✅ Selecionou período: {selector}")
                    await page.wait_for_timeout(1000)
                    break
                except:
                    continue
            else:
                print("⚠️ Não foi possível encontrar opção 'Ontem', tentando outras opções...")
                # Tenta clicar em qualquer opção disponível
                try:
                    await page.click('li', timeout=2000)
                    print("✅ Selecionou uma opção de período")
                except:
                    print("⚠️ Não foi possível selecionar período")
            
            # 5. Clica no botão "Salvar"
            print("💾 Clicando em Salvar...")
            await page.click('button:has-text("Salvar")')
            print("✅ Clicou em Salvar")
            await page.wait_for_timeout(2000)  # Aguarda aplicação do filtro
            
            return True
            
        except Exception as e:
            print(f"❌ Erro ao configurar filtro de período: {str(e)}")
            return False
    
    async def extrair_kpis(self, page) -> List[Dict[str, Any]]:
        """Extrai todos os KPIs exibidos na tela"""
        try:
            print("📊 Extraindo KPIs da página...")
            
            # Aguarda carregamento dos dados
            await page.wait_for_timeout(3000)
            
            # Extrai KPIs usando JavaScript com base na análise
            kpis = await page.evaluate("""
                () => {
                    const indicadores = [];
                    
                    // Função para limpar texto
                    const limparTexto = (texto) => {
                        if (!texto) return '';
                        return texto.replace(/\\s+/g, ' ').trim();
                    };
                    
                    // Função para extrair número
                    const extrairNumero = (texto) => {
                        if (!texto) return '0';
                        const match = texto.toString().match(/[0-9,]+/);
                        return match ? match[0].replace(/,/g, '') : '0';
                    };
                    
                    // Função para extrair variação percentual
                    const extrairVariacao = (texto) => {
                        if (!texto) return null;
                        const match = texto.toString().match(/([+-]?[0-9.]+)%/);
                        return match ? parseFloat(match[1]) : null;
                    };
                    
                    // Procura por cards de métricas/KPIs específicos do Mlabs
                    const metricCards = document.querySelectorAll('[data-testid*="metric"], .metric-card, .kpi-card, [class*="metric"], [class*="kpi"], [class*="stat"], [class*="value"], [class*="number"], .dg-metric, .dg-stat');
                    
                    metricCards.forEach(card => {
                        try {
                            const titulo = limparTexto(card.querySelector('[data-testid*="title"], .title, .metric-title, .kpi-title, h3, h4, h5, h6, .dg-metric__title')?.textContent);
                            const nome = limparTexto(card.querySelector('[data-testid*="name"], .name, .metric-name, .kpi-name, .label, .dg-metric__label')?.textContent);
                            const valor = limparTexto(card.querySelector('[data-testid*="value"], .value, .metric-value, .kpi-value, .number, .stat-value, .dg-metric__value')?.textContent);
                            const variacao = limparTexto(card.querySelector('[data-testid*="change"], .change, .variation, .trend, .percentage, .dg-metric__change')?.textContent);
                            
                            if (titulo || nome) {
                                indicadores.push({
                                    titulo: titulo || 'Visão Geral',
                                    nome: nome || titulo,
                                    valor: extrairNumero(valor),
                                    variacaoPercentual: extrairVariacao(variacao)
                                });
                            }
                        } catch (e) {
                            console.log('Erro ao processar card:', e);
                        }
                    });
                    
                    // Procura por tabelas de dados
                    const tabelas = document.querySelectorAll('table');
                    tabelas.forEach(tabela => {
                        const linhas = tabela.querySelectorAll('tr');
                        linhas.forEach(linha => {
                            const colunas = linha.querySelectorAll('td, th');
                            if (colunas.length >= 2) {
                                const nome = limparTexto(colunas[0]?.textContent);
                                const valor = limparTexto(colunas[1]?.textContent);
                                
                                if (nome && valor && !indicadores.some(i => i.nome === nome)) {
                                    indicadores.push({
                                        titulo: 'Visão Geral',
                                        nome: nome,
                                        valor: extrairNumero(valor),
                                        variacaoPercentual: null
                                    });
                                }
                            }
                        });
                    });
                    
                    // Procura por divs com números/métricas específicos do Mlabs
                    const divsMetricas = document.querySelectorAll('div[class*="metric"], div[class*="stat"], div[class*="value"], div[class*="number"], .dg-metric, .dg-stat, .dg-value');
                    divsMetricas.forEach(div => {
                        try {
                            const texto = limparTexto(div.textContent);
                            const numero = extrairNumero(texto);
                            
                            if (numero !== '0' && texto.length < 100) {  // Evita textos muito longos
                                const nome = limparTexto(div.querySelector('span, label, .label, .dg-metric__label')?.textContent) || texto;
                                
                                if (!indicadores.some(i => i.nome === nome)) {
                                    indicadores.push({
                                        titulo: 'Visão Geral',
                                        nome: nome,
                                        valor: numero,
                                        variacaoPercentual: null
                                    });
                                }
                            }
                        } catch (e) {
                            console.log('Erro ao processar div:', e);
                        }
                    });
                    
                    // Procura por séries temporais (gráficos)
                    const graficos = document.querySelectorAll('canvas, svg, [data-testid*="chart"], .chart, .dg-chart');
                    graficos.forEach(grafico => {
                        try {
                            const titulo = limparTexto(grafico.closest('[data-testid*="chart-container"], .chart-container, .dg-chart-container')?.querySelector('[data-testid*="title"], .title, h3, h4, .dg-chart__title')?.textContent);
                            
                            if (titulo && !indicadores.some(i => i.nome === titulo)) {
                                indicadores.push({
                                    titulo: 'Série Temporal',
                                    nome: titulo,
                                    valor: '0',
                                    variacaoPercentual: null,
                                    serie: [] // Será preenchido se possível
                                });
                            }
                        } catch (e) {
                            console.log('Erro ao processar gráfico:', e);
                        }
                    });
                    
                    // Procura por elementos específicos do Mlabs Analytics
                    const mlabsElements = document.querySelectorAll('.dg-analytics, .dg-report, .dg-dashboard');
                    mlabsElements.forEach(element => {
                        try {
                            const metricas = element.querySelectorAll('[class*="metric"], [class*="stat"], [class*="value"]');
                            metricas.forEach(metrica => {
                                const nome = limparTexto(metrica.querySelector('.label, .title, .name')?.textContent);
                                const valor = limparTexto(metrica.querySelector('.value, .number, .stat')?.textContent);
                                
                                if (nome && valor && !indicadores.some(i => i.nome === nome)) {
                                    indicadores.push({
                                        titulo: 'Mlabs Analytics',
                                        nome: nome,
                                        valor: extrairNumero(valor),
                                        variacaoPercentual: null
                                    });
                                }
                            });
                        } catch (e) {
                            console.log('Erro ao processar elemento Mlabs:', e);
                        }
                    });
                    
                    // Remove duplicatas
                    const unicos = [];
                    const nomes = new Set();
                    
                    indicadores.forEach(ind => {
                        if (!nomes.has(ind.nome)) {
                            nomes.add(ind.nome);
                            unicos.push(ind);
                        }
                    });
                    
                    return unicos;
                }
            """)
            
            print(f"✅ Extraídos {len(kpis)} indicadores")
            
            # Log dos indicadores encontrados
            for i, kpi in enumerate(kpis[:5]):  # Mostra apenas os primeiros 5
                print(f"   {i+1}. {kpi['nome']}: {kpi['valor']}")
            
            if len(kpis) > 5:
                print(f"   ... e mais {len(kpis) - 5} indicadores")
            
            return kpis
            
        except Exception as e:
            print(f"❌ Erro ao extrair KPIs: {str(e)}")
            return []
    
    async def coletar_relatorio(self, page, codigo: str, relatorio: Dict[str, str]) -> Dict[str, Any]:
        """Coleta dados de um relatório específico"""
        try:
            print(f"📊 Coletando relatório {codigo}: {relatorio['titulo']}")
            
            # Loga cookies antes de acessar o relatório
            cookies = await page.context.cookies()
            print(f"🍪 Cookies antes de acessar relatório:")
            for c in cookies:
                print(f"  - {c['name']}: {c['value']}")
            
            # Navega para o relatório específico
            print(f"🌐 Navegando para: {relatorio['url']}")
            await page.goto(relatorio['url'], wait_until='networkidle')
            await page.wait_for_load_state('networkidle')
            
            # Aguarda carregamento completo da página do relatório
            await page.wait_for_timeout(8000)
            
            # Verifica se está na página correta
            current_url = page.url
            print(f"📍 URL atual: {current_url}")
            
            # Se foi redirecionado para login, tenta novamente algumas vezes
            tentativas = 0
            while 'login' in current_url.lower() and tentativas < 3:
                print(f"❌ Redirecionado para login (tentativa {tentativas + 1}/3), tentando novamente...")
                await page.goto(relatorio['url'], wait_until='networkidle')
                await page.wait_for_load_state('networkidle')
                await page.wait_for_timeout(5000)
                current_url = page.url
                tentativas += 1
            
            if 'login' in current_url.lower():
                raise Exception("Não foi possível acessar o relatório após 3 tentativas")
            
            # Verifica se está realmente na URL do relatório
            if relatorio['url'] not in current_url:
                raise Exception(f"URL incorreta. Esperado: {relatorio['url']}, Atual: {current_url}")
            
            print(f"✅ Acessou com sucesso o relatório: {current_url}")
            
            # Configura filtro de período para ontem
            periodo = self.get_periodo_ontem()
            await self.configurar_filtro_periodo(page, periodo)
            
            # Extrai KPIs
            indicadores = await self.extrair_kpis(page)
            
            # Estrutura normalizada conforme especificação
            dados_normalizados = {
                'coletadoEm': datetime.now().strftime('%Y-%m-%d'),
                'relatorio': relatorio['titulo'],
                'periodo': periodo,
                'indicadores': indicadores
            }
            
            return {
                'codigo': codigo,
                'titulo': relatorio['titulo'],
                'dados': dados_normalizados,
                'timestamp': datetime.now().isoformat(),
                'status': 'sucesso'
            }
            
        except Exception as e:
            print(f"❌ Erro ao coletar relatório {codigo}: {str(e)}")
            return {
                'codigo': codigo,
                'titulo': relatorio['titulo'],
                'erro': str(e),
                'timestamp': datetime.now().isoformat(),
                'status': 'erro'
            }
    
    async def salvar_dados(self, dados: Dict[str, Any]) -> bool:
        """Salva dados no Supabase"""
        try:
            # Insere dados na tabela mlabs_reports
            result = supabase.table('mlabs_reports').insert({
                'tipo_relatorio': dados.get('titulo'),  # Usa título como tipo
                'dados': json.dumps(dados.get('dados', {}), ensure_ascii=False),
                'status': dados.get('status'),
                'erro': dados.get('erro'),
                'timestamp_coleta': dados.get('timestamp')
            }).execute()
            
            print(f"✅ Dados salvos com sucesso para {dados.get('titulo')}")
            return True
            
        except Exception as e:
            print(f"❌ Erro ao salvar dados: {str(e)}")
            return False
    
    async def executar_coleta(self) -> Dict[str, Any]:
        """Executa a coleta completa de dados dos 4 relatórios fixos"""
        start_time = time.time()
        resultados = []
        
        try:
            print("🚀 Iniciando coleta de dados do Mlabs Analytics...")
            print(f"📋 Relatórios-alvo: {len(self.relatorios)} relatórios fixos")
            
            # Testa conexão com Supabase
            try:
                result = supabase.table('mlabs_reports').select('*').limit(1).execute()
                print("✅ Conexão com Supabase OK")
            except Exception as e:
                raise Exception(f"Falha na conexão com Supabase: {str(e)}")
            
            # Conecta ao browser
            playwright, browser = await self.get_browser()
            page = await browser.new_page()
            
            try:
                # Realiza login
                if not await self.login_mlabs(page):
                    raise Exception("Falha no login do Mlabs")
                
                # Coleta cada relatório fixo
                for codigo, relatorio in self.relatorios.items():
                    print(f"\n--- Relatório {codigo}: {relatorio['titulo']} ---")
                    dados = await self.coletar_relatorio(page, codigo, relatorio)
                    resultados.append(dados)
                    
                    # Salva dados
                    await self.salvar_dados(dados)
                    
                    # Aguarda entre requisições
                    await asyncio.sleep(2)
                
            finally:
                await browser.close()
                await playwright.stop()
            
            execution_time = time.time() - start_time
            
            return {
                'success': True,
                'message': 'Coleta concluída com sucesso',
                'data': {
                    'tempo_execucao': f"{execution_time:.2f}s",
                    'timestamp': datetime.now().isoformat(),
                    'ambiente': 'Vercel Python',
                    'relatorios_coletados': len(resultados),
                    'resultados': resultados
                }
            }
            
        except Exception as e:
            execution_time = time.time() - start_time
            print(f"❌ Erro durante coleta: {str(e)}")
            
            return {
                'success': False,
                'error': str(e),
                'data': {
                    'tempo_execucao': f"{execution_time:.2f}s",
                    'timestamp': datetime.now().isoformat(),
                    'ambiente': 'Vercel Python'
                }
            }

# Instância global do coletor
collector = MlabsCollector()

def handler(request):
    """Handler principal para a API Vercel"""
    try:
        # Executa a coleta de forma assíncrona
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        resultado = loop.run_until_complete(collector.executar_coleta())
        loop.close()
        
        # Retorna resposta
        if resultado['success']:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                'body': json.dumps(resultado, indent=2, ensure_ascii=False)
            }
        else:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                'body': json.dumps(resultado, indent=2, ensure_ascii=False)
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({
                'success': False,
                'error': str(e),
                'data': {
                    'timestamp': datetime.now().isoformat(),
                    'ambiente': 'Vercel Python'
                }
            }, indent=2, ensure_ascii=False)
        }

# Para compatibilidade com Vercel
def lambda_handler(event, context):
    """Handler para AWS Lambda (compatibilidade)"""
    return handler(event)

# Para desenvolvimento local
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        resultado = asyncio.run(collector.executar_coleta())
        print(json.dumps(resultado, indent=2, ensure_ascii=False)) 