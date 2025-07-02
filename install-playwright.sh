#!/bin/bash

# Script para instalar Playwright e navegadores
echo "🔧 Instalando Playwright..."

# Instala dependências Python
pip install -r requirements.txt

# Instala navegadores do Playwright
playwright install chromium

echo "✅ Playwright instalado com sucesso!"
echo "📝 Para usar com Browserless, configure as variáveis de ambiente:"
echo "   - BROWSERLESS_URL (opcional, padrão: https://chrome.browserless.io)"
echo "   - BROWSERLESS_API_KEY (opcional, para versão paga)" 