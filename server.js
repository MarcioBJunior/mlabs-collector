import dotenv from 'dotenv';

// Carrega variáveis de ambiente ANTES de qualquer import
dotenv.config();

import { createServer } from 'http';
import { URL } from 'url';

// Importa o handler da API
import handler from './api/collect.js';

const server = createServer(async (req, res) => {
  // Configura CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Simula o objeto req e res da Vercel
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  const vercelReq = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: Object.fromEntries(url.searchParams)
  };

  // Cria um wrapper para a resposta que evita headers duplicados
  let responseSent = false;
  
  const vercelRes = {
    status: (code) => {
      if (!responseSent) {
        res.statusCode = code;
      }
      return vercelRes;
    },
    json: (data) => {
      if (!responseSent) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data, null, 2));
        responseSent = true;
      }
    }
  };

  try {
    await handler(vercelReq, vercelRes);
  } catch (error) {
    console.error('Erro no servidor:', error);
    if (!responseSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: error.message }));
      responseSent = true;
    }
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api/collect`);
  console.log('📋 Variáveis de ambiente:');
  console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? '✅' : '❌');
  console.log('- SERVICE_ROLE_KEY:', process.env.SERVICE_ROLE_KEY ? '✅' : '❌');
  console.log('- MLABS_AUTH_URL:', process.env.MLABS_AUTH_URL ? '✅' : '❌');
}); 