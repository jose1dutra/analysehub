# Nicole Forziati - Sistema de Gerenciamento de Campanhas

Interface moderna e modular para gerenciamento de campanhas publicitárias, inspirada no Facebook Ads Manager.

## 🚀 Funcionalidades Principais

### 📊 Sistema Hierárquico
- **Navegação em 3 níveis**: Campanhas → Conjuntos → Anúncios
- **Layout lado a lado**: Todos os blocos sempre visíveis
- **Seleção independente**: Checkboxes individuais e "selecionar todos" por nível
- **Busca em tempo real**: Filtro por nome em cada nível
- **Estados visuais**: Seleção, hover e status (ativo/pausado/inativo)

### 🎯 Dropdown de Métricas
- **Categorização**: Desempenho, Financeiro, Audiência, Conversão
- **Busca inteligente**: Filtro por nome e descrição
- **Seleção múltipla**: Checkboxes individuais
- **Ações em lote**: "Selecionar Todas" e "Limpar"
- **Contador dinâmico**: Mostra quantidade de métricas selecionadas

### 📅 Seletor de Datas
- **Presets rápidos**: 7, 30, 90 dias e último ano
- **Período personalizado**: Seleção manual de datas
- **Integração futura**: Preparado para enviar filtros para API

### 🎨 Interface Moderna
- **Design responsivo**: Adaptável para desktop e mobile
- **Tema escuro**: Paleta de cores profissional
- **Feedback visual**: Loading, erros e estados de hover
- **Acessibilidade**: Foco e navegação por teclado

## 🏗️ Estrutura do Projeto

```
front_end/
├── index.html              # Estrutura principal da página
├── styles.css              # Estilos CSS modulares
├── script.js               # Lógica JavaScript modularizada
├── data/                   # Dados simulados (mock)
│   ├── campaigns.json      # Campanhas
│   ├── adsets.json         # Conjuntos de anúncios
│   └── ads.json           # Anúncios
└── README.md              # Documentação
```

## 🔧 Arquitetura do Código

### Estado Global (AppState)
```javascript
const AppState = {
    // Navegação e seleção
    selectedCampaignId: null,
    selectedAdsetId: null,
    selectedCampaigns: new Set(),
    selectedAdsets: new Set(),
    selectedAds: new Set(),
    
    // Métricas e filtros
    metrics: [],
    selectedMetrics: new Set(),
    dateRange: { start: Date, end: Date },
    
    // Estados de UI
    isLoading: false,
    errorMessage: null,
    
    // Dados do backend
    backendData: { campaigns: [], adsets: {}, ads: {} }
};
```

### Módulos Principais
1. **Carregamento de Dados**: Mock atual → Futuro FastAPI
2. **Sistema de Métricas**: Dropdown categorizado com busca
3. **Sistema de Datas**: Presets e seleção personalizada
4. **Sistema Hierárquico**: Renderização e interação dos 3 níveis
5. **Navegação**: Troca entre seções (Home, Métricas, etc.)
6. **Feedback Visual**: Loading, erros e estados

## 🚀 Como Usar

### 1. Iniciar o Projeto
```bash
# Navegar para o diretório
cd front_end

# Iniciar servidor local (necessário para fetch dos dados)
python3 -m http.server 8000

# Acessar no navegador
http://localhost:8000
```

### 2. Navegação
- **Sidebar**: Clique nas abas para trocar entre seções
- **Métricas**: Seção principal com sistema hierárquico
- **Outras seções**: Dashboard, Disparador, Agente J, etc.

### 3. Sistema Hierárquico
1. **Campanhas**: Selecione uma campanha para ver seus conjuntos
2. **Conjuntos**: Selecione um conjunto para ver seus anúncios
3. **Anúncios**: Visualize e selecione anúncios individuais

### 4. Seleção de Métricas
1. Clique em "Selecionar Métricas"
2. Use a busca para filtrar métricas
3. Marque/desmarque checkboxes individuais
4. Use "Selecionar Todas" ou "Limpar" para ações em lote

### 5. Seleção de Datas
1. Clique no seletor de datas
2. Escolha um preset ou período personalizado
3. Clique em "Aplicar" para atualizar os dados

## 🔌 Preparação para FastAPI

### Endpoints Preparados
```javascript
// Configuração base
const CONFIG = {
    API_BASE_URL: '/api', // Endpoint do FastAPI
    DEFAULT_DATE_RANGE: 30
};

// Funções de fetch já implementadas
async function fetchCampaigns(filters = {})
async function fetchAdsets(campaignId, filters = {})
async function fetchAds(adsetId, filters = {})
```

### Estrutura de Filtros
```javascript
const filters = {
    dateRange: {
        start: Date,
        end: Date
    },
    selectedMetrics: ['impressions', 'clicks', 'ctr'],
    selectedCampaigns: ['camp1', 'camp2'],
    selectedAdsets: ['adset1'],
    selectedAds: ['ad1', 'ad2']
};
```

### Pontos de Integração
1. **loadBackendData()**: Substituir fetch dos arquivos JSON por chamadas à API
2. **loadMetrics()**: Carregar métricas via `fetch('/api/metrics')`
3. **refreshData()**: Enviar filtros para API e atualizar dados
4. **Error handling**: Tratamento de erros de API já implementado

## 📱 Responsividade

### Breakpoints
- **Desktop**: 3 colunas lado a lado
- **Tablet (1200px)**: 2 colunas + 1 coluna larga
- **Mobile (768px)**: 1 coluna empilhada
- **Mobile pequeno (480px)**: Otimizações específicas

### Adaptações Mobile
- Dropdowns em tela cheia
- Botões e inputs redimensionados
- Scrollbars personalizadas
- Touch-friendly interactions

## 🎨 Personalização

### Cores e Tema
```css
/* Cores principais */
--primary-color: #D4AF37;      /* Dourado Nicole Forziati */
--secondary-color: #B8860B;    /* Dourado escuro */
--background-dark: #1a1a2e;    /* Fundo escuro */
--background-light: #2C2C2C;   /* Fundo claro */
--text-primary: #FFFFFF;       /* Texto principal */
--text-secondary: #AAAAAA;     /* Texto secundário */
```

### Métricas Personalizáveis
```javascript
// Adicionar novas métricas
AppState.metrics.push({
    id: 'nova_metrica',
    label: 'Nova Métrica',
    category: 'performance',
    description: 'Descrição da nova métrica'
});
```

## 🐛 Debug e Desenvolvimento

### Console Logs
O sistema inclui logs detalhados para debug:
- `🔄` Carregamento de dados
- `✅` Operações bem-sucedidas
- `❌` Erros
- `📊` Atualizações de estado
- `🖱️` Interações do usuário

### Estados de Loading
- Overlay de carregamento global
- Indicadores por bloco
- Feedback visual durante operações

### Tratamento de Erros
- Mensagens de erro visuais
- Fallback para dados mock
- Auto-remoção de erros após 5s

## 🔮 Próximos Passos

### Funcionalidades Sugeridas
1. **Expandir/Colapsar**: Botões para minimizar blocos
2. **Pesquisa avançada**: Filtros por status, data, etc.
3. **Persistência**: Salvar seleções no LocalStorage
4. **Exportação**: Exportar dados selecionados
5. **Gráficos**: Visualizações de métricas

### Integração Backend
1. **FastAPI**: Implementar endpoints REST
2. **Autenticação**: Sistema de login
3. **Cache**: Otimizar requisições
4. **WebSockets**: Atualizações em tempo real

## 📄 Licença

Projeto desenvolvido para Nicole Forziati. Todos os direitos reservados.

## 👨‍💻 Desenvolvimento

### Estrutura Modular
- **Estado Global**: Centralizado em AppState
- **Funções Puras**: Sem efeitos colaterais
- **Event Listeners**: Delegados e otimizados
- **Renderização**: Componentes independentes

### Boas Práticas
- **Performance**: Evita re-renderizações desnecessárias
- **Acessibilidade**: Suporte a navegação por teclado
- **Manutenibilidade**: Código bem documentado
- **Escalabilidade**: Preparado para crescimento

### Comandos Úteis
```bash
# Verificar estrutura
ls -la

# Iniciar servidor
python3 -m http.server 8000

# Abrir no navegador
open http://localhost:8000
```

---

**Desenvolvido com ❤️ para Nicole Forziati**

