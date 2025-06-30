# Guia de Deployment - Coletor Mlabs Analytics

## 🎯 Resumo do Projeto

O **Coletor Diário Mlabs Analytics** é um sistema automatizado que:
- Extrai dados de 4 relatórios do Mlabs Analytics diariamente
- Normaliza os dados em formato JSON estruturado
- Armazena no Supabase com índices únicos
- Executa automaticamente às 9h via cron job na Vercel

## 📁 Estrutura do Projeto

```
mlabs-collector/
├── api/
│   └── collect.js          # Handler principal da API
├── lib/
│   ├── browser.js          # Gerenciamento do Puppeteer
│   ├── supabase.js         # Conexão com banco de dados
│   └── extractor.js        # Lógica de extração de dados
├── package.json            # Configuração do projeto
├── vercel.json            # Configuração do cron job
├── .env.example           # Exemplo de variáveis de ambiente
└── README.md              # Documentação do projeto
```

## 🚀 Deploy Realizado

### GitHub
- **Repositório**: `MarcioBJunior/mlabs-collector`
- **Branch**: `main`
- **Status**: Código commitado e pronto

### Vercel
- **Projeto**: `mlabs-collector-v2`
- **Status**: Deploy configurado
- **Cron Job**: Configurado para execução diária às 9h
- **Variáveis de Ambiente**: Configuradas (placeholders)

### Supabase
- **Projeto**: `Sync Mlabs`
- **Tabela**: `mlabs_reports` (estrutura criada)
- **Status**: Banco configurado e pronto

## 🔧 Configuração Necessária

### 1. Variáveis de Ambiente na Vercel
Acesse o painel da Vercel e configure:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
MLABS_EMAIL=seu-email@mlabs.com
MLABS_PASSWORD=sua-senha-mlabs
```

### 2. Credenciais do Supabase
No painel do Supabase (Projeto: Sync Mlabs):
- Copie a URL do projeto
- Copie a chave anônima (anon key)
- Configure as variáveis na Vercel

### 3. Credenciais do Mlabs
- Email e senha da conta Mlabs Analytics
- Configure nas variáveis de ambiente da Vercel

## 📊 Relatórios Mapeados

1. **Adenis Facebook** - Métricas de Facebook Ads
2. **Adenis Instagram** - Métricas de Instagram Ads
3. **Relatório Geral** - Visão consolidada
4. **Relatório Personalizado** - Métricas específicas

### Dados Extraídos
- Impressões, Cliques, CTR
- Alcance, Frequência
- Conversões, CPC, CPM
- ROI, ROAS
- Dados demográficos

## 🔄 Funcionamento

### Execução Automática
- **Horário**: 9h (horário do servidor)
- **Frequência**: Diária
- **Período**: Dados do dia anterior

### Fluxo de Execução
1. Inicializa browser Puppeteer
2. Autentica no Mlabs Analytics
3. Navega pelos 4 relatórios
4. Extrai dados de cada relatório
5. Normaliza em formato JSON
6. Salva no Supabase
7. Finaliza e limpa recursos

## 🧪 Testes

### Teste Manual
```bash
# Acesse a URL do projeto na Vercel
https://mlabs-collector-v2.vercel.app/api/collect

# Ou via curl
curl -X GET https://mlabs-collector-v2.vercel.app/api/collect
```

### Verificação no Supabase
```sql
SELECT * FROM mlabs_reports 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🔍 Monitoramento

### Logs da Vercel
- Acesse o painel da Vercel
- Vá em "Functions" → "collect.js"
- Monitore execuções e erros

### Dados no Supabase
- Verifique a tabela `mlabs_reports`
- Monitore novos registros diários
- Valide integridade dos dados

## 🛠️ Manutenção

### Atualizações de Código
1. Faça alterações no repositório GitHub
2. Push para branch `main`
3. Vercel fará deploy automático

### Troubleshooting Comum
- **Erro de autenticação**: Verificar credenciais Mlabs
- **Erro de conexão**: Verificar credenciais Supabase
- **Timeout**: Ajustar configurações do Puppeteer
- **Dados duplicados**: Verificar índices únicos

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique logs na Vercel
2. Valide dados no Supabase
3. Teste execução manual
4. Consulte documentação técnica

---

**Status**: ✅ Sistema implementado e pronto para uso
**Próximo passo**: Configurar credenciais reais e testar execução

