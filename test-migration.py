#!/usr/bin/env python3
"""
Script de teste para verificar a migração Python
"""

import os
import sys
import asyncio
from datetime import datetime
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

def test_environment():
    """Testa se o ambiente está configurado corretamente"""
    print("🔍 Testando ambiente Python...")
    
    # Verifica Python
    print(f"✅ Python {sys.version}")
    
    # Verifica variáveis de ambiente
    required_vars = [
        'SUPABASE_URL',
        'SERVICE_ROLE_KEY',
        'MLABS_EMAIL',
        'MLABS_PASSWORD'
    ]
    
    optional_vars = [
        'BROWSERLESS_URL',
        'BROWSERLESS_API_KEY'
    ]
    
    print("\n📋 Variáveis de ambiente:")
    
    for var in required_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: {'*' * len(value)}")
        else:
            print(f"❌ {var}: Não configurada")
            return False
    
    for var in optional_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: {'*' * len(value)}")
        else:
            print(f"⚠️  {var}: Não configurada (opcional)")
    
    return True

def test_dependencies():
    """Testa se as dependências estão instaladas"""
    print("\n🔍 Testando dependências...")
    
    try:
        import playwright
        print("✅ Playwright instalado")
    except ImportError:
        print("❌ Playwright não instalado")
        return False
    
    try:
        from supabase import create_client
        print("✅ Supabase instalado")
    except ImportError:
        print("❌ Supabase não instalado")
        return False
    
    try:
        import requests
        print("✅ Requests instalado")
    except ImportError:
        print("❌ Requests não instalado")
        return False
    
    try:
        from bs4 import BeautifulSoup
        print("✅ BeautifulSoup instalado")
    except ImportError:
        print("❌ BeautifulSoup não instalado")
        return False
    
    return True

async def test_supabase_connection():
    """Testa conexão com Supabase"""
    print("\n🔍 Testando conexão com Supabase...")
    
    try:
        from supabase import create_client
        
        supabase_url = os.getenv('SUPABASE_URL')
        service_role_key = os.getenv('SERVICE_ROLE_KEY')
        
        if not supabase_url or not service_role_key:
            print("❌ Variáveis do Supabase não configuradas")
            return False
        
        supabase = create_client(supabase_url, service_role_key)
        
        # Testa conexão
        result = supabase.table('mlabs_reports').select('*').limit(1).execute()
        
        # A nova API do Supabase não tem .error, apenas verifica se não há exceção
        print("✅ Conexão com Supabase OK")
        return True
        
        print("✅ Conexão com Supabase OK")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao conectar com Supabase: {str(e)}")
        return False

async def test_browserless():
    """Testa conexão com Browserless"""
    print("\n🔍 Testando Browserless...")
    
    try:
        from playwright.async_api import async_playwright
        
        browserless_url = os.getenv('BROWSERLESS_URL', '')
        browserless_api_key = os.getenv('BROWSERLESS_API_KEY', '')
        playwright = await async_playwright().start()
        
        if browserless_url and browserless_api_key:
            if browserless_api_key:
                if '?' in browserless_url:
                    browserless_url += f'&token={browserless_api_key}'
                else:
                    browserless_url += f'?token={browserless_api_key}'
            print(f"🌐 Tentando conectar com: {browserless_url}")
            browserless_ws_url = browserless_url.replace('https://', 'wss://')
            browser = await playwright.chromium.connect_over_cdp(
                endpoint_url=f"{browserless_ws_url}/devtools/browser"
            )
        else:
            print("🌐 Rodando Playwright localmente (sem Browserless)...")
            browser = await playwright.chromium.launch(headless=True)
        
        page = await browser.new_page()
        await page.goto('https://example.com')
        title = await page.title()
        
        await browser.close()
        await playwright.stop()
        
        print(f"✅ Browser funcionando - Título: {title}")
        return True
            
    except Exception as e:
        print(f"❌ Erro ao testar Browserless: {str(e)}")
        return False

async def test_collector():
    """Testa o coletor principal"""
    print("\n🔍 Testando coletor principal...")
    
    try:
        from api.collect import collector
        
        # Testa apenas a conexão com Supabase (sem fazer scraping)
        result = await collector.test_supabase_connection()
        
        if result:
            print("✅ Coletor funcionando")
            return True
        else:
            print("❌ Coletor com problemas")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao testar coletor: {str(e)}")
        return False

def main():
    """Função principal de teste"""
    print("🚀 Iniciando testes da migração Python...")
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)
    
    # Testa ambiente
    if not test_environment():
        print("\n❌ Ambiente não configurado corretamente")
        return False
    
    # Testa dependências
    if not test_dependencies():
        print("\n❌ Dependências não instaladas")
        print("💡 Execute: pip install -r requirements.txt")
        return False
    
    # Executa testes assíncronos
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        # Testa Supabase
        supabase_ok = loop.run_until_complete(test_supabase_connection())
        
        # Testa Browserless
        browserless_ok = loop.run_until_complete(test_browserless())
        
        # Testa coletor
        collector_ok = loop.run_until_complete(test_collector())
        
    finally:
        loop.close()
    
    # Resultado final
    print("\n" + "=" * 50)
    print("📊 Resultado dos Testes:")
    print(f"✅ Ambiente: {'OK' if test_environment() else 'ERRO'}")
    print(f"✅ Dependências: {'OK' if test_dependencies() else 'ERRO'}")
    print(f"✅ Supabase: {'OK' if supabase_ok else 'ERRO'}")
    print(f"✅ Browserless: {'OK' if browserless_ok else 'ERRO'}")
    print(f"✅ Coletor: {'OK' if collector_ok else 'ERRO'}")
    
    all_ok = test_environment() and test_dependencies() and supabase_ok and browserless_ok and collector_ok
    
    if all_ok:
        print("\n🎉 Todos os testes passaram! Migração Python funcionando.")
        print("💡 Você pode agora executar: python server.py")
        return True
    else:
        print("\n❌ Alguns testes falharam. Verifique a configuração.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 