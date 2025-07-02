#!/usr/bin/env python3
"""
Servidor local para desenvolvimento e testes do coletor Mlabs
"""

import os
import json
import asyncio
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv
from api.collect import collector

# Carrega variáveis de ambiente
load_dotenv()

class MlabsHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        self.handle_request()
    
    def do_POST(self):
        """Handle POST requests"""
        self.handle_request()
    
    def handle_request(self):
        """Processa requisições"""
        try:
            # Configura CORS
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            
            # Simula o objeto request da Vercel
            parsed_url = urlparse(self.path)
            request = {
                'method': self.command,
                'url': self.path,
                'headers': dict(self.headers),
                'query': parse_qs(parsed_url.query)
            }
            
            # Executa a coleta
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            resultado = loop.run_until_complete(collector.executar_coleta())
            loop.close()
            
            # Retorna resposta
            if resultado['success']:
                self.send_response(200)
            else:
                self.send_response(500)
            
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response_body = json.dumps(resultado, indent=2, ensure_ascii=False)
            self.wfile.write(response_body.encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            error_response = {
                'success': False,
                'error': str(e),
                'data': {
                    'timestamp': datetime.now().isoformat(),
                    'ambiente': 'Local Python'
                }
            }
            
            response_body = json.dumps(error_response, indent=2, ensure_ascii=False)
            self.wfile.write(response_body.encode('utf-8'))

def run_server(port=3000):
    """Inicia o servidor local"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, MlabsHandler)
    
    print(f"🚀 Servidor Python rodando em http://localhost:{port}")
    print(f"📊 API disponível em http://localhost:{port}/api/collect")
    print("📋 Variáveis de ambiente:")
    print(f"- SUPABASE_URL: {'✅' if os.getenv('SUPABASE_URL') else '❌'}")
    print(f"- SERVICE_ROLE_KEY: {'✅' if os.getenv('SERVICE_ROLE_KEY') else '❌'}")
    print(f"- MLABS_AUTH_URL: {'✅' if os.getenv('MLABS_AUTH_URL') else '❌'}")
    print(f"- MLABS_EMAIL: {'✅' if os.getenv('MLABS_EMAIL') else '❌'}")
    print(f"- MLABS_PASSWORD: {'✅' if os.getenv('MLABS_PASSWORD') else '❌'}")
    print(f"- BROWSERLESS_URL: {'✅' if os.getenv('BROWSERLESS_URL') else '❌ (usando padrão)'}")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Servidor parado pelo usuário")
        httpd.server_close()

if __name__ == "__main__":
    PORT = int(os.getenv('PORT', 3000))
    run_server(PORT) 