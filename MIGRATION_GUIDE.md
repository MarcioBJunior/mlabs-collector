# 🐍 Migração para Python - Guia Completo

## 📋 Resumo da Migração

Este projeto foi migrado de **JavaScript (Puppeteer)** para **Python (Playwright)** para resolver o problema do Chrome no ambiente serverless da Vercel.

### 🔧 Principais Mudanças

1. **Linguagem**: JavaScript → Python
2. **Browser Automation**: Puppeteer → Playwright
3. **Serviço de Browser**: Browserless (externo)
4. **Runtime**: Node.js → Python 3.9

## 🚀 Configuração Inicial

### 1. Instalar Dependências Python

```bash
# Instalar Python 3.9+ (se necessário)
sudo apt update
sudo apt install python3.9 python3.9-pip

# Instalar dependências
pip install -r requirements.txt

# Instalar Playwright e navegadores
bash install-playwright.sh
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` com as seguintes variáveis:

```env
# Supabase
SUPABASE_URL=sua_url_do_supabase
SERVICE_ROLE_KEY=sua_chave_do_supabase

# Mlabs Analytics
MLABS_AUTH_URL=https://app.mlabs.com.br/login
MLABS_EMAIL=seu_email@exemplo.com
MLABS_PASSWORD=sua_senha

# Browserless (opcional)
BROWSERLESS_URL=https://chrome.browserless.io
BROWSERLESS_API_KEY=sua_chave_api_browserless
```

## 🏃‍♂️ Execução Local

### Desenvolvimento

```bash
# Iniciar servidor local
python server.py

# Ou testar diretamente
python api/collect.py test
```

### Testes

```bash
# Testar conexão com Supabase
python -c "from api.collect import collector; import asyncio; print(asyncio.run(collector.test_supabase_connection()))"

# Testar coleta completa
python api/collect.py test
```

## 🌐 Deploy na Vercel

### 1. Configuração Automática

A Vercel detectará automaticamente que é um projeto Python devido aos arquivos:
- `requirements.txt`
- `runtime.txt`
- `api/collect.py`

### 2. Variáveis de Ambiente na Vercel

Configure as mesmas variáveis de ambiente no painel da Vercel:
- `SUPABASE_URL`
- `SERVICE_ROLE_KEY`
- `MLABS_AUTH_URL`
- `MLABS_EMAIL`
- `MLABS_PASSWORD`
- `BROWSERLESS_URL` (opcional)
- `BROWSERLESS_API_KEY` (opcional)

### 3. Deploy

```bash
# Deploy via CLI
vercel --prod

# Ou via Git (push para main branch)
git push origin main
```

## 🔍 Diferenças Técnicas

### JavaScript (Antigo)
```javascript
// Puppeteer
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox']
});
```

### Python (Novo)
```python
# Playwright + Browserless
browser = await playwright.chromium.connect_over_cdp(
    endpoint_url=f"{self.browserless_url}/devtools/browser"
)
```

## 📊 Vantagens da Migração

### ✅ Resolvidas
- ❌ **Problema do Chrome**: Agora usa Browserless (externo)
- ❌ **Limitações serverless**: Playwright é mais eficiente
- ❌ **Dependências pesadas**: Python tem melhor gerenciamento

### 🚀 Melhorias
- ✅ **Performance**: Playwright é mais rápido que Puppeteer
- ✅ **Confiabilidade**: Browserless é mais estável
- ✅ **Manutenibilidade**: Código Python mais limpo
- ✅ **Escalabilidade**: Melhor para ambientes serverless

## 🔧 Serviços de Browser Externos

### Browserless (Recomendado)
- **URL**: https://chrome.browserless.io
- **Plano Gratuito**: 1000 sessões/mês
- **Configuração**: Automática (sem API key)

### Alternativas
- **Playwright Cloud**: https://playwright.dev/cloud
- **Lambda Test**: https://www.lambdatest.com
- **Sauce Labs**: https://saucelabs.com

## 🐛 Troubleshooting

### Erro: "Chrome not found"
```bash
# Solução: Usar Browserless
export BROWSERLESS_URL=https://chrome.browserless.io
```

### Erro: "Playwright not installed"
```bash
# Solução: Instalar Playwright
pip install playwright
playwright install chromium
```

### Erro: "Supabase connection failed"
```bash
# Verificar variáveis de ambiente
echo $SUPABASE_URL
echo $SERVICE_ROLE_KEY
```

## 📈 Monitoramento

### Logs da Vercel
```bash
# Ver logs em tempo real
vercel logs --follow

# Ver logs de uma função específica
vercel logs api/collect.py
```

### Métricas
- **Tempo de execução**: Monitorado automaticamente
- **Taxa de sucesso**: Via logs da Vercel
- **Uso do Browserless**: Via dashboard do serviço

## 🔄 Rollback (se necessário)

Se precisar voltar para JavaScript:

1. Restaure os arquivos originais:
   - `api/collect.js`
   - `package.json`
   - `vercel.json` (versão JS)

2. Remova arquivos Python:
   - `api/collect.py`
   - `requirements.txt`
   - `runtime.txt`
   - `server.py`

3. Reinstale dependências Node.js:
   ```bash
   npm install
   ```

## 📞 Suporte

Para dúvidas sobre a migração:
1. Verifique os logs da Vercel
2. Teste localmente primeiro
3. Consulte a documentação do Playwright
4. Verifique a configuração do Browserless

---

**🎉 Migração concluída!** O projeto agora usa Python com Playwright e Browserless, resolvendo o problema do Chrome no ambiente serverless da Vercel. 