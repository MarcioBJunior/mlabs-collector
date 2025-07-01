import puppeteer from 'puppeteer-core';

let browser = null;
let page = null;

/**
 * Importa chrome-aws-lambda condicionalmente
 */
async function getChromeAwsLambda() {
  try {
    const chrome = await import('chrome-aws-lambda');
    return chrome.default;
  } catch (error) {
    console.warn('chrome-aws-lambda não disponível:', error.message);
    return null;
  }
}

/**
 * Detecta o caminho do Chrome no ambiente
 */
function getChromePath() {
  // Lista de possíveis caminhos do Chrome
  const chromePaths = [
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/snap/bin/chromium',
    process.env.CHROME_BIN,
    process.env.CHROME_PATH
  ].filter(Boolean);

  // Para ambiente Vercel, vamos tentar usar o Chrome que vem com o Puppeteer
  if (process.env.VERCEL) {
    return null; // Deixa o Puppeteer Core detectar automaticamente
  }

  return chromePaths[0] || null;
}

/**
 * Inicializa o browser Puppeteer Core com chrome-aws-lambda no ambiente serverless
 */
export async function getBrowser() {
  if (browser && page) {
    return { browser, page };
  }

  let launchOptions = {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-extensions',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection'
    ],
    headless: true
  };

  // Se estiver em ambiente serverless (Vercel/AWS), tentar usar chrome-aws-lambda
  if (process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.VERCEL) {
    try {
      const chrome = await getChromeAwsLambda();
      if (chrome) {
        launchOptions = {
          ...launchOptions,
          executablePath: await chrome.executablePath,
          args: chrome.args,
          headless: chrome.headless,
          defaultViewport: chrome.defaultViewport
        };
        console.log('✅ Usando chrome-aws-lambda');
      } else {
        console.log('⚠️ chrome-aws-lambda não disponível, usando configuração padrão');
      }
    } catch (error) {
      console.warn('Erro ao carregar chrome-aws-lambda:', error.message);
    }
  } else {
    // Ambiente local: tenta usar o Chrome do sistema
    launchOptions.executablePath = '/usr/bin/google-chrome';
  }

  try {
    browser = await puppeteer.launch(launchOptions);
    page = await browser.newPage();
    // Configura viewport e user agent
    await page.setViewport({ width: 1280, height: 720 });
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    return { browser, page };
  } catch (error) {
    console.error('Erro ao inicializar browser:', error.message);
    throw new Error(`Falha ao inicializar browser: ${error.message}`);
  }
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

