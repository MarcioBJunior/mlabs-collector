# Mapeamento dos Relatórios Mlabs Analytics

## URL Base
- **Painel Principal**: https://analytics.mlabs.io/home
- **JWT Auth URL**: https://analytics.mlabs.io/auth/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MTYwNjY5OGI5OWJiZTAwMTk5MDQ5MzgiLCJndWVzdCI6dHJ1ZSwiaWF0IjoxNzUxMzE4MjE1LCJleHAiOjE3NTEzMTgyNzV9.ntXn3G8x0F4wE9xE99cxwh8berUwArSwTjzW6ViO4F8

## Relatórios Identificados

### 1. Adenis Facebook
- **Período**: 29/05/2025 - 27/06/2025
- **Conta**: adenisdesa
- **Ícone**: Facebook (azul)

### 2. Adenis Instagram  
- **Período**: 31/05/2025 - 29/06/2025
- **Conta**: adenisdesa
- **Ícone**: Instagram (rosa)

### 3. Facebook Tecnovix
- **Período**: 28/05/2025 - 26/06/2025
- **Conta**: tecnovix
- **Ícone**: Facebook (azul)

### 4. Tecnovix Instagram
- **Período**: 30/05/2025 - 28/06/2025
- **Conta**: tecnovix
- **Ícone**: Instagram (rosa)

## Navegação
- **Botão "Ver todos"** na seção "Meus Relatórios" leva à lista completa
- **Menu lateral** com opções: Marcas, Relatórios, Dashboards, Apresentações, etc.

## Próximos Passos
1. Clicar em "Ver todos" para acessar lista completa
2. Acessar cada relatório individualmente
3. Mapear estrutura de dados de cada relatório
4. Identificar seletores CSS para extração
5. Testar filtro de período (ontem)



## Estrutura de Dados - Adenis Facebook

### URL do Relatório
- **URL**: https://analytics.mlabs.io/report/685edc6e06042600371c10a7
- **ID do Relatório**: 685edc6e06042600371c10a7

### Widget: Visão Geral (Facebook)
**Seletores CSS identificados:**
- Container principal: Widget com ícone do Facebook
- Métricas disponíveis:
  - **Visualizações de página**: 0 (↓ 100.00%)
  - **Alcance total**: 0 (↓ 0.00%)
  - **Total de Posts**: 1
  - **Novas curtidas**: 0 (↓ 0.00%)
  - **Total de Curtidas**: 0 (↓ 0.00%)
  - **Descurtidas de página**: 0

### Widgets Disponíveis no Menu Lateral
1. **Funil** (Novo)
2. **KPI Calculado** (Novo)
3. **Visão Geral** ✓ (ativo)
4. **Tabela**
5. **Gráfico de linhas**
6. **Gráfico de colunas**
7. **Gráfico col. empilhadas**
8. **Gráfico de pizza**

### Configurações de Layout
- **Uma Coluna** (ativo)
- **Duas Colunas**
- **Widgets** (menu lateral)

### Ações Disponíveis
- Configurar PDF
- Personalizar relatório
- Enviar por WhatsApp
- Agendar relatório
- Enviar agora


### Widgets Adicionais Identificados - Facebook

#### 1. Gráfico de Linhas Temporal
- **Métricas**: Alcance total, Impressões de página
- **Eixo X**: Datas (formato: DD/MM/AAAA)
- **Eixo Y**: Valores numéricos
- **Legenda**: Azul = Alcance total, Verde = Impressões de página

#### 2. Principais Cidades
- **Tipo**: Widget geográfico
- **Status**: Sem dados no período atual

#### 3. Evolução das Curtidas na Página
- **Tipo**: Gráfico de linha temporal
- **Métrica**: Total de Curtidas
- **Eixo X**: Datas (formato: DD/MM/AAAA)
- **Eixo Y**: Total de curtidas

#### 4. Visão Geral Publicações
- **Tipo**: Widget de resumo de posts
- **Status**: Visível no final da página

### Estrutura de Dados para JSON
```json
{
  "coletadoEm": "2025-06-30",
  "relatorio": "Adenis Facebook",
  "periodo": {
    "inicio": "2025-05-29",
    "fim": "2025-06-27"
  },
  "indicadores": [
    {
      "titulo": "Visão Geral",
      "nome": "Visualizações de página",
      "valor": 0,
      "variacaoPercentual": -100.00
    },
    {
      "titulo": "Visão Geral", 
      "nome": "Alcance total",
      "valor": 0,
      "variacaoPercentual": 0.00
    },
    {
      "titulo": "Visão Geral",
      "nome": "Total de Posts", 
      "valor": 1
    },
    {
      "titulo": "Evolução das curtidas",
      "nome": "Total de Curtidas",
      "serie": [{"data": "YYYY-MM-DD", "valor": 0}]
    }
  ]
}
```


## Estrutura de Dados - Adenis Instagram

### URL do Relatório
- **URL**: https://analytics.mlabs.io/report/685edc1d06042600371c0778
- **ID do Relatório**: 685edc1d06042600371c0778
- **Período**: 31/05/2025 - 29/06/2025

### Widget: Visão Geral (Instagram)
**Métricas identificadas:**
- **Seguidores**: 719 (↓ 0.00%)
- **Começaram a Seguir**: 26 (↑ 100.00%)
- **Publicações**: 2
- **Visualizações**: 22.563 (↑ 80.07%)
- **Alcance**: 8.050 (↑ 53.83%)
- **Curtidas**: 36
- **Comentários**: 3 (↑ 100.00%)
- **Total de Interações**: 40 (↑ 100.00%)
- **Taxa de engajamento**: 0,50

### Widget: Funil de Engajamento
- **Tipo**: Widget específico do Instagram
- **Localização**: Abaixo da Visão Geral

### Resumo Textual Automático
"Foram feitas 2 publicações durante o período de 31/05/2025 a 29/06/2025 que originaram um total de 36 curtidas e 3 comentários. As curtidas totais tiveram uma diferença de 100,00% em comparação com o período anterior, já os comentários tiveram uma diferença de 100,00% comparados ao mesmo período."

### Diferenças Instagram vs Facebook
1. **Instagram**: Métricas mais ricas (seguidores, visualizações, alcance, interações)
2. **Facebook**: Foco em curtidas de página, impressões
3. **Instagram**: Widget "Funil de Engajamento" específico
4. **Facebook**: Widget "Principais cidades" específico
5. **Instagram**: Taxa de engajamento calculada
6. **Facebook**: Foco em impressões de página

