import puppeteer from 'puppeteer';

let browser = null;
let page = null;

/**
 * Inicializa o browser Puppeteer
 */
export async function getBrowser() {
  if (browser && page) {
    return { browser, page };
  }

  browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-extensions'
    ]
  });

  page = await browser.newPage();
  return { browser, page };
}

/**
 * Autentica no Mlabs Analytics
 */
export async function authenticate(page) {
  console.log('🔐 Iniciando autenticação no Mlabs Analytics...');
  
  const email = process.env.MLABS_EMAIL;
  const password = process.env.MLABS_PASSWORD;
  
  if (!email || !password) {
    throw new Error('Credenciais do Mlabs não configuradas nas variáveis de ambiente');
  }

  try {
    // Navega para a página de login
    await page.goto('https://app.mlabs.com.br/login', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Aguarda o formulário de login
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });

    // Preenche credenciais
    await page.type('input[type="email"]', email);
    await page.type('input[type="password"]', password);

    // Clica no botão de login
    await page.click('button[type="submit"]');

    // Aguarda redirecionamento e verifica se está logado
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    
    // Verifica se está na dashboard
    const isLoggedIn = await page.evaluate(() => {
      return !window.location.href.includes('/login');
    });

    if (!isLoggedIn) {
      throw new Error('Falha na autenticação - ainda na página de login');
    }

    console.log('✅ Autenticação realizada com sucesso');
    return true;

  } catch (error) {
    console.error('❌ Erro durante autenticação:', error.message);
    throw new Error(`Falha na autenticação: ${error.message}`);
  }
}

/**
 * Salva cookies da sessão
 */
export async function saveCookies(page) {
  try {
    const cookies = await page.cookies();
    return cookies;
  } catch (error) {
    console.error('Erro ao salvar cookies:', error);
    return [];
  }
}

/**
 * Carrega cookies salvos
 */
export async function loadCookies(page, cookies) {
  if (!cookies || cookies.length === 0) {
    return false;
  }

  try {
    await page.setCookie(...cookies);
    return true;
  } catch (error) {
    console.error('Erro ao carregar cookies:', error);
    return false;
  }
}

/**
 * Fecha o browser
 */
export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
    console.log('🔒 Browser fechado');
  }
}

/**
 * Aguarda elemento aparecer na página
 * @param {Object} page - Instância da página
 * @param {string} selector - Seletor CSS
 * @param {number} timeout - Timeout em ms (padrão: 30000)
 */
export async function waitForElement(page, selector, timeout = 30000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    console.warn(`Elemento não encontrado: ${selector}`);
    return false;
  }
}

