import dotenv from 'dotenv';
import { testConnection } from './lib/supabase.js';

// Carrega variáveis de ambiente
dotenv.config();

console.log('🧪 Testando conexão com Supabase...');
console.log('📋 Variáveis carregadas:');
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Configurado' : '❌ Não configurado');
console.log('- SERVICE_ROLE_KEY:', process.env.SERVICE_ROLE_KEY ? '✅ Configurado' : '❌ Não configurado');

try {
  const result = await testConnection();
  console.log('✅ Teste de conexão:', result ? 'SUCESSO' : 'FALHA');
} catch (error) {
  console.log('❌ Erro no teste:', error.message);
} 