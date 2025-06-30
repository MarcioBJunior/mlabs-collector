import puppeteer from 'puppeteer';

/**
 * Cria uma instância do browser Puppeteer com configurações otimizadas para Vercel
 * @returns {Object} Objeto contendo browser e page
 */
export async function getBrowser() {
  console.log('Iniciando browser Puppeteer...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  });

  const ctx = await browser.createIncognitoBrowserContext();
  const page = await ctx.newPage();

  // Configurações da página
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Tenta reaproveitar sessão de cookies
  try {
    const cookieStore = process.env.COOKIE_STORE;
    if (cookieStore) {
      const cookies = JSON.parse(cookieStore);
      if (cookies && cookies.length > 0) {
        await page.setCookie(...cookies);
        console.log(`Cookies carregados: ${cookies.length} itens`);
      }
    }
  } catch (error) {
    console.log('Primeira execução ou erro ao carregar cookies:', error.message);
  }

  return { browser, page };
}

/**
 * Salva os cookies da sessão atual
 * @param {Object} page - Instância da página do Puppeteer
 * @returns {Array} Array de cookies
 */
export async function saveCookies(page) {
  try {
    const cookies = await page.cookies();
    console.log(`Salvando ${cookies.length} cookies da sessão`);
    return cookies;
  } catch (error) {
    console.error('Erro ao salvar cookies:', error);
    return [];
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

