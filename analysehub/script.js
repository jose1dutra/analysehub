/**
 * Nicole Forziati - Sistema de Gerenciamento de Campanhas
 * Script principal modularizado para interface hierárquica
 * 
 * @author Nicole Forziati
 * @version 2.0.0
 * @description Interface similar ao Facebook Ads Manager com navegação hierárquica
 */

// ============================================================================
// ESTADO GLOBAL DA APLICAÇÃO
// ============================================================================

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
    dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
    },
    
    // Estados de UI
    isLoading: false,
    errorMessage: null,
    
    // Dados do backend
    backendData: {
        campaigns: [],
        adsets: {},
        ads: {}
    }
};

// ============================================================================
// CONFIGURAÇÕES E CONSTANTES
// ============================================================================

const CONFIG = {
    API_BASE_URL: '/api', // Futuro: endpoint do FastAPI
    DEFAULT_DATE_RANGE: 30,
    METRICS_CATEGORIES: {
        performance: 'Desempenho',
        financial: 'Financeiro',
        audience: 'Audiência',
        conversion: 'Conversão'
    }
};

// ============================================================================
// FUNÇÕES DE CARREGAMENTO DE DADOS (MOCK → FUTURO FASTAPI)
// ============================================================================

/**
 * Carrega dados simulados do backend
 * Futuro: será substituído por chamadas para FastAPI
 */
async function loadBackendData() {
    try {
        AppState.isLoading = true;
        updateLoadingState(true);
        
        console.log('🔄 Carregando dados do backend...');
        
        // Simula chamadas para FastAPI
        const [campaignsResponse, adsetsResponse, adsResponse] = await Promise.all([
            fetch('./data/campaigns.json'),
            fetch('./data/adsets.json'),
            fetch('./data/ads.json')
        ]);

        const campaignsData = await campaignsResponse.json();
        const adsetsData = await adsetsResponse.json();
        const adsData = await adsResponse.json();

        AppState.backendData = {
            campaigns: campaignsData.campaigns,
            adsets: adsetsData.adsets,
            ads: adsData.ads
        };
        
        console.log('✅ Dados carregados:', {
            campaigns: AppState.backendData.campaigns.length,
            adsets: Object.keys(AppState.backendData.adsets).length,
            ads: Object.keys(AppState.backendData.ads).length
        });
        
        // Renderiza os componentes após carregar dados
        renderHierarchy();
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        AppState.errorMessage = 'Erro ao carregar dados. Tente novamente.';
        showErrorMessage();
        loadFallbackData();
    } finally {
        AppState.isLoading = false;
        updateLoadingState(false);
    }
}

/**
 * Carrega dados de fallback caso a API falhe
 */
function loadFallbackData() {
    console.log('🔄 Carregando dados de fallback...');
    AppState.backendData = {
        campaigns: [
            { id: 'camp1', name: 'Campanha Exemplo', status: 'ACTIVE' }
        ],
        adsets: { camp1: [ { id: 'adset1', name: 'Conjunto Exemplo', status: 'ACTIVE' } ] },
        ads: { adset1: [ { id: 'ad1', name: 'Anúncio Exemplo', status: 'ACTIVE' } ] }
    };
    renderHierarchy();
}

/**
 * Futuro: Busca campanhas da API FastAPI
 */
async function fetchCampaigns(filters = {}) {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/campaigns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filters)
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar campanhas:', error);
        throw error;
    }
}

/**
 * Futuro: Busca adsets da API FastAPI
 */
async function fetchAdsets(campaignId, filters = {}) {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/campaigns/${campaignId}/adsets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filters)
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar adsets:', error);
        throw error;
    }
}

/**
 * Futuro: Busca anúncios da API FastAPI
 */
async function fetchAds(adsetId, filters = {}) {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/adsets/${adsetId}/ads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filters)
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar anúncios:', error);
        throw error;
    }
}

// ============================================================================
// SISTEMA DE MÉTRICAS
// ============================================================================

/**
 * Carrega métricas disponíveis
 * Futuro: será carregado via fetch('/api/metrics')
 */
async function loadMetrics() {
    AppState.metrics = [
        // Desempenho
        { id: 'impressions', label: 'Impressões', category: 'performance', description: 'Número total de impressões' },
        { id: 'clicks', label: 'Cliques', category: 'performance', description: 'Número total de cliques' },
        { id: 'ctr', label: 'CTR', category: 'performance', description: 'Taxa de cliques' },
        { id: 'reach', label: 'Alcance', category: 'performance', description: 'Pessoas únicas alcançadas' },
        { id: 'frequency', label: 'Frequência', category: 'performance', description: 'Média de impressões por pessoa' },
        
        // Financeiro
        { id: 'cpc', label: 'CPC', category: 'financial', description: 'Custo por clique' },
        { id: 'cpm', label: 'CPM', category: 'financial', description: 'Custo por mil impressões' },
        { id: 'cost', label: 'Custo', category: 'financial', description: 'Custo total' },
        { id: 'budget', label: 'Orçamento', category: 'financial', description: 'Orçamento definido' },
        
        // Audiência
        { id: 'age', label: 'Idade', category: 'audience', description: 'Distribuição por idade' },
        { id: 'gender', label: 'Gênero', category: 'audience', description: 'Distribuição por gênero' },
        { id: 'location', label: 'Localização', category: 'audience', description: 'Distribuição geográfica' },
        
        // Conversão
        { id: 'conversions', label: 'Conversões', category: 'conversion', description: 'Número de conversões' },
        { id: 'conversion_rate', label: 'Taxa de Conversão', category: 'conversion', description: 'Taxa de conversão' },
        { id: 'roas', label: 'ROAS', category: 'conversion', description: 'Retorno sobre gastos em anúncios' }
    ];
}

/**
 * Renderiza o dropdown de métricas com categorização e busca
 */
function renderMetricsSelector() {
    const btn = document.getElementById('metrics-dropdown-btn');
    const dropdown = document.getElementById('metrics-dropdown');
    
    if (!btn || !dropdown) return;
    
    dropdown.innerHTML = `
        <div class="metrics-header">
            <div class="metrics-search">
                <input type="text" id="metrics-search" placeholder="Buscar métricas..." />
            </div>
            <div class="metrics-actions">
                <button id="select-all-metrics" class="metrics-action-btn">Selecionar Todas</button>
                <button id="clear-all-metrics" class="metrics-action-btn">Limpar</button>
            </div>
        </div>
        <div class="metrics-categories">
            ${Object.entries(CONFIG.METRICS_CATEGORIES).map(([key, label]) => `
                <div class="metrics-category" data-category="${key}">
                    <h4 class="category-title">${label}</h4>
                    <div class="category-metrics">
                        ${AppState.metrics
                            .filter(metric => metric.category === key)
                            .map(metric => `
                                <label class="metric-option">
                                    <input type="checkbox" value="${metric.id}" 
                                           ${AppState.selectedMetrics.has(metric.id) ? 'checked' : ''}>
                                    <span class="metric-label">${metric.label}</span>
                                    <span class="metric-description">${metric.description}</span>
                                </label>
                            `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Event listeners
    setupMetricsEventListeners();
}

/**
 * Configura event listeners do dropdown de métricas
 */
function setupMetricsEventListeners() {
    const dropdown = document.getElementById('metrics-dropdown');
    const searchInput = document.getElementById('metrics-search');
    const selectAllBtn = document.getElementById('select-all-metrics');
    const clearAllBtn = document.getElementById('clear-all-metrics');
    
    // Busca de métricas
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const metricOptions = dropdown.querySelectorAll('.metric-option');
            
            metricOptions.forEach(option => {
                const label = option.querySelector('.metric-label').textContent.toLowerCase();
                const description = option.querySelector('.metric-description').textContent.toLowerCase();
                const isVisible = label.includes(searchTerm) || description.includes(searchTerm);
                option.style.display = isVisible ? 'flex' : 'none';
            });
        });
    }
    
    // Selecionar todas as métricas
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
            const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
                AppState.selectedMetrics.add(checkbox.value);
            });
            updateMetricsButtonText();
        });
    }
    
    // Limpar todas as métricas
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
                AppState.selectedMetrics.delete(checkbox.value);
            });
            updateMetricsButtonText();
        });
    }
    
    // Checkboxes individuais
    dropdown.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            if (e.target.checked) {
                AppState.selectedMetrics.add(e.target.value);
            } else {
                AppState.selectedMetrics.delete(e.target.value);
            }
            updateMetricsButtonText();
        }
    });
}

/**
 * Atualiza texto do botão de métricas
 */
function updateMetricsButtonText() {
    const btn = document.getElementById('metrics-dropdown-btn');
    if (!btn) return;
    
    const count = AppState.selectedMetrics.size;
    if (count === 0) {
        btn.innerHTML = 'Selecionar Métricas <span class="arrow">▼</span>';
    } else {
        btn.innerHTML = `${count} métrica${count > 1 ? 's' : ''} selecionada${count > 1 ? 's' : ''} <span class="arrow">▼</span>`;
    }
}

// ============================================================================
// SISTEMA DE DATAS
// ============================================================================

/**
 * Renderiza o seletor de datas
 */
function renderDateSelector() {
    const dateSelector = document.querySelector('.date-selector');
    if (!dateSelector) return;
    
    dateSelector.innerHTML = `
        <button class="date-btn" id="date-selector-btn">
            <span class="date-icon">📅</span>
            <span class="date-text" id="date-range-text">${formatDateRange()}</span>
            <span class="date-arrow">▼</span>
        </button>
        <div class="date-dropdown" id="date-dropdown">
            <div class="date-presets">
                <button class="date-preset" data-days="7">Últimos 7 dias</button>
                <button class="date-preset" data-days="30">Últimos 30 dias</button>
                <button class="date-preset" data-days="90">Últimos 90 dias</button>
                <button class="date-preset" data-days="365">Último ano</button>
            </div>
            <div class="date-custom">
                <label>Período personalizado:</label>
                <input type="date" id="date-start" value="${AppState.dateRange.start.toISOString().split('T')[0]}">
                <span>até</span>
                <input type="date" id="date-end" value="${AppState.dateRange.end.toISOString().split('T')[0]}">
                <button id="apply-date">Aplicar</button>
            </div>
        </div>
    `;
    
    setupDateEventListeners();
}

/**
 * Configura event listeners do seletor de datas
 */
function setupDateEventListeners() {
    const dateBtn = document.getElementById('date-selector-btn');
    const dateDropdown = document.getElementById('date-dropdown');
    const presets = document.querySelectorAll('.date-preset');
    const applyBtn = document.getElementById('apply-date');
    
    // Toggle dropdown
    if (dateBtn) {
        dateBtn.addEventListener('click', () => {
            dateDropdown.classList.toggle('open');
        });
    }
    
    // Presets de data
    presets.forEach(preset => {
        preset.addEventListener('click', () => {
            const days = parseInt(preset.dataset.days);
            AppState.dateRange.end = new Date();
            AppState.dateRange.start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            updateDateDisplay();
            refreshData();
        });
    });
    
    // Data personalizada
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const startInput = document.getElementById('date-start');
            const endInput = document.getElementById('date-end');
            
            if (startInput && endInput) {
                AppState.dateRange.start = new Date(startInput.value);
                AppState.dateRange.end = new Date(endInput.value);
                updateDateDisplay();
                refreshData();
            }
        });
    }
    
    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
        if (!dateBtn?.contains(e.target) && !dateDropdown?.contains(e.target)) {
            dateDropdown?.classList.remove('open');
        }
    });
}

/**
 * Formata o intervalo de datas para exibição
 */
function formatDateRange() {
    const start = AppState.dateRange.start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    const end = AppState.dateRange.end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${start} - ${end}`;
}

/**
 * Atualiza exibição da data
 */
function updateDateDisplay() {
    const dateText = document.getElementById('date-range-text');
    if (dateText) {
        dateText.textContent = formatDateRange();
    }
}

// ============================================================================
// SISTEMA HIERÁRQUICO (CAMPANHAS → ADSETS → ADS)
// ============================================================================

/**
 * Renderiza toda a hierarquia
 */
function renderHierarchy() {
    renderCampaigns();
    renderAdsets();
    renderAds();
    updateSelectionCounts();
}

/**
 * Renderiza lista de campanhas
 */
function renderCampaigns() {
    const container = document.getElementById('campaigns-list');
    if (!container) return;
    
    container.innerHTML = `
        <div class="hierarchy-header">
            <div class="select-all-container">
                <input type="checkbox" id="select-all-campaigns" 
                       ${AppState.selectedCampaigns.size === AppState.backendData.campaigns.length ? 'checked' : ''}>
                <label for="select-all-campaigns">Selecionar Todas</label>
            </div>
            <div class="search-container">
                <input type="text" id="campaigns-search" placeholder="Buscar campanhas...">
            </div>
        </div>
        <div class="hierarchy-items">
            ${AppState.backendData.campaigns.map(campaign => `
                <div class="hierarchy-item ${AppState.selectedCampaignId === campaign.id ? 'selected' : ''}" 
                     data-id="${campaign.id}">
                    <div class="item-checkbox">
                        <input type="checkbox" value="${campaign.id}" 
                               ${AppState.selectedCampaigns.has(campaign.id) ? 'checked' : ''}>
                    </div>
                    <div class="item-content" onclick="selectCampaign('${campaign.id}')">
                        <div class="item-name">${campaign.name}</div>
                        <div class="item-status ${campaign.status.toLowerCase()}">${campaign.status}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    setupCampaignsEventListeners();
}

/**
 * Renderiza lista de adsets
 */
function renderAdsets() {
    const container = document.getElementById('adsets-list');
    if (!container) return;
    
    const campaignId = AppState.selectedCampaignId;
    const adsets = campaignId && AppState.backendData.adsets[campaignId] ? AppState.backendData.adsets[campaignId] : [];
    
    container.innerHTML = `
        <div class="hierarchy-header">
            <div class="select-all-container">
                <input type="checkbox" id="select-all-adsets" 
                       ${adsets.length > 0 && AppState.selectedAdsets.size === adsets.length ? 'checked' : ''}>
                <label for="select-all-adsets">Selecionar Todos</label>
            </div>
            <div class="search-container">
                <input type="text" id="adsets-search" placeholder="Buscar conjuntos...">
            </div>
        </div>
        <div class="hierarchy-items">
            ${adsets.map(adset => `
                <div class="hierarchy-item ${AppState.selectedAdsetId === adset.id ? 'selected' : ''}" 
                     data-id="${adset.id}">
                    <div class="item-checkbox">
                        <input type="checkbox" value="${adset.id}" 
                               ${AppState.selectedAdsets.has(adset.id) ? 'checked' : ''}>
                    </div>
                    <div class="item-content" onclick="selectAdset('${adset.id}')">
                        <div class="item-name">${adset.name}</div>
                        <div class="item-status ${adset.status.toLowerCase()}">${adset.status}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    setupAdsetsEventListeners();
}

/**
 * Renderiza lista de anúncios
 */
function renderAds() {
    const container = document.getElementById('ads-list');
    if (!container) return;
    
    const adsetId = AppState.selectedAdsetId;
    const ads = adsetId && AppState.backendData.ads[adsetId] ? AppState.backendData.ads[adsetId] : [];
    
    container.innerHTML = `
        <div class="hierarchy-header">
            <div class="select-all-container">
                <input type="checkbox" id="select-all-ads" 
                       ${ads.length > 0 && AppState.selectedAds.size === ads.length ? 'checked' : ''}>
                <label for="select-all-ads">Selecionar Todos</label>
            </div>
            <div class="search-container">
                <input type="text" id="ads-search" placeholder="Buscar anúncios...">
            </div>
        </div>
        <div class="hierarchy-items">
            ${ads.map(ad => `
                <div class="hierarchy-item" data-id="${ad.id}">
                    <div class="item-checkbox">
                        <input type="checkbox" value="${ad.id}" 
                               ${AppState.selectedAds.has(ad.id) ? 'checked' : ''}>
                    </div>
                    <div class="item-content">
                        <div class="item-name">${ad.name}</div>
                        <div class="item-status ${ad.status.toLowerCase()}">${ad.status}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    setupAdsEventListeners();
}

// ============================================================================
// EVENT LISTENERS DA HIERARQUIA
// ============================================================================

/**
 * Configura event listeners das campanhas
 */
function setupCampaignsEventListeners() {
    const selectAllCheckbox = document.getElementById('select-all-campaigns');
    const searchInput = document.getElementById('campaigns-search');
    
    // Selecionar todas as campanhas
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('#campaigns-list input[type="checkbox"]:not(#select-all-campaigns)');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
                if (e.target.checked) {
                    AppState.selectedCampaigns.add(checkbox.value);
                } else {
                    AppState.selectedCampaigns.delete(checkbox.value);
                }
            });
            updateSelectionCounts();
        });
    }
    
    // Busca de campanhas
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const items = document.querySelectorAll('#campaigns-list .hierarchy-item');
            
            items.forEach(item => {
                const name = item.querySelector('.item-name').textContent.toLowerCase();
                item.style.display = name.includes(searchTerm) ? 'flex' : 'none';
            });
        });
    }
    
    // Checkboxes individuais
    document.querySelectorAll('#campaigns-list input[type="checkbox"]:not(#select-all-campaigns)').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                AppState.selectedCampaigns.add(e.target.value);
            } else {
                AppState.selectedCampaigns.delete(e.target.value);
            }
            updateSelectionCounts();
        });
    });
}

/**
 * Configura event listeners dos adsets
 */
function setupAdsetsEventListeners() {
    const selectAllCheckbox = document.getElementById('select-all-adsets');
    const searchInput = document.getElementById('adsets-search');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('#adsets-list input[type="checkbox"]:not(#select-all-adsets)');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
                if (e.target.checked) {
                    AppState.selectedAdsets.add(checkbox.value);
                } else {
                    AppState.selectedAdsets.delete(checkbox.value);
                }
            });
            updateSelectionCounts();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const items = document.querySelectorAll('#adsets-list .hierarchy-item');
            
            items.forEach(item => {
                const name = item.querySelector('.item-name').textContent.toLowerCase();
                item.style.display = name.includes(searchTerm) ? 'flex' : 'none';
            });
        });
    }
    
    document.querySelectorAll('#adsets-list input[type="checkbox"]:not(#select-all-adsets)').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                AppState.selectedAdsets.add(e.target.value);
            } else {
                AppState.selectedAdsets.delete(e.target.value);
            }
            updateSelectionCounts();
        });
    });
}

/**
 * Configura event listeners dos anúncios
 */
function setupAdsEventListeners() {
    const selectAllCheckbox = document.getElementById('select-all-ads');
    const searchInput = document.getElementById('ads-search');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('#ads-list input[type="checkbox"]:not(#select-all-ads)');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
                if (e.target.checked) {
                    AppState.selectedAds.add(checkbox.value);
                } else {
                    AppState.selectedAds.delete(checkbox.value);
                }
            });
            updateSelectionCounts();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const items = document.querySelectorAll('#ads-list .hierarchy-item');
            
            items.forEach(item => {
                const name = item.querySelector('.item-name').textContent.toLowerCase();
                item.style.display = name.includes(searchTerm) ? 'flex' : 'none';
            });
        });
    }
    
    document.querySelectorAll('#ads-list input[type="checkbox"]:not(#select-all-ads)').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                AppState.selectedAds.add(e.target.value);
            } else {
                AppState.selectedAds.delete(e.target.value);
            }
            updateSelectionCounts();
        });
    });
}

// ============================================================================
// FUNÇÕES DE SELEÇÃO
// ============================================================================

/**
 * Seleciona uma campanha
 */
function selectCampaign(campaignId) {
    AppState.selectedCampaignId = campaignId;
    AppState.selectedAdsetId = null; // Reset adset selection
    
    // Limpa seleções de adsets e ads quando muda campanha
    AppState.selectedAdsets.clear();
    AppState.selectedAds.clear();
    
    renderHierarchy();
    console.log('✅ Campanha selecionada:', campaignId);
}

/**
 * Seleciona um adset
 */
function selectAdset(adsetId) {
    AppState.selectedAdsetId = adsetId;
    AppState.selectedAds.clear(); // Reset ads selection
    
    renderAds();
    console.log('✅ Adset selecionado:', adsetId);
}

/**
 * Atualiza contadores de seleção
 */
function updateSelectionCounts() {
    const campaignCount = AppState.selectedCampaigns.size;
    const adsetCount = AppState.selectedAdsets.size;
    const adCount = AppState.selectedAds.size;
    
    console.log('📊 Seleções atualizadas:', { campaignCount, adsetCount, adCount });
    
    // Futuro: atualizar UI com contadores
}

// ============================================================================
// NAVEGAÇÃO ENTRE SEÇÕES
// ============================================================================

/**
 * Configura navegação entre seções principais
 */
function setupNavigation() {
    console.log('🔧 Configurando navegação...');
    
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    console.log('Links encontrados:', navLinks.length);
    console.log('Seções encontradas:', contentSections.length);

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetTab = this.getAttribute('data-tab');
            console.log('🖱️ Navegando para:', targetTab);
            
            // Remove active de todos os links e seções
            navLinks.forEach(l => l.classList.remove('active'));
            contentSections.forEach(s => s.classList.remove('active'));
            
            // Adiciona active ao link clicado
            this.classList.add('active');
            
            // Mostra a seção correspondente
            const targetSection = document.getElementById(targetTab);
            if (targetSection) {
                targetSection.classList.add('active');
                console.log('✅ Seção ativada:', targetTab);
                
                // Se for a seção de métricas, renderiza a hierarquia
                if (targetTab === 'metricas') {
                    renderHierarchy();
                }
            } else {
                console.error('❌ Seção não encontrada:', targetTab);
            }
        });
    });
    
    console.log('✅ Navegação configurada');
}

// ============================================================================
// FEEDBACK VISUAL E ESTADOS
// ============================================================================

/**
 * Atualiza estado de loading
 */
function updateLoadingState(isLoading) {
    const loadingEl = document.querySelector('.loading-overlay');
    
    if (isLoading) {
        if (!loadingEl) {
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-spinner"></div>
                <p>Carregando dados...</p>
            `;
            document.body.appendChild(overlay);
        }
    } else {
        if (loadingEl) {
            loadingEl.remove();
        }
    }
}

/**
 * Mostra mensagem de erro
 */
function showErrorMessage() {
    if (!AppState.errorMessage) return;
    
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.innerHTML = `
        <span class="error-icon">⚠️</span>
        <span class="error-text">${AppState.errorMessage}</span>
        <button class="error-close">×</button>
    `;
    
    document.body.appendChild(errorEl);
    
    // Auto-remove após 5 segundos
    setTimeout(() => {
        errorEl.remove();
        AppState.errorMessage = null;
    }, 5000);
    
    // Botão de fechar
    errorEl.querySelector('.error-close').addEventListener('click', () => {
        errorEl.remove();
        AppState.errorMessage = null;
    });
}

// ============================================================================
// FUNÇÕES DE ATUALIZAÇÃO DE DADOS
// ============================================================================

/**
 * Atualiza dados baseado nos filtros atuais
 */
async function refreshData() {
    console.log('🔄 Atualizando dados...');
    
    // Futuro: enviar filtros para API
    const filters = {
        dateRange: AppState.dateRange,
        selectedMetrics: Array.from(AppState.selectedMetrics),
        selectedCampaigns: Array.from(AppState.selectedCampaigns),
        selectedAdsets: Array.from(AppState.selectedAdsets),
        selectedAds: Array.from(AppState.selectedAds)
    };
    
    console.log('📊 Filtros aplicados:', filters);
    
    // Por enquanto, apenas re-renderiza
    renderHierarchy();
}

// ============================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ============================================================================

/**
 * Inicializa toda a aplicação
 */
async function initializeApp() {
    console.log('🚀 Iniciando aplicação Nicole Forziati...');
    
    try {
        // Configura navegação PRIMEIRO
        setupNavigation();
        
        // Carrega dados e métricas
        await Promise.all([
            loadBackendData(),
            loadMetrics()
        ]);
        
        // Renderiza componentes
        renderMetricsSelector();
        renderDateSelector();
        renderHierarchy();
        
        // Configura dropdown de métricas
        const metricsBtn = document.getElementById('metrics-dropdown-btn');
        if (metricsBtn) {
            metricsBtn.addEventListener('click', () => {
                const dropdown = document.getElementById('metrics-dropdown');
                dropdown.classList.toggle('open');
            });
        }
        
        console.log('✅ Aplicação inicializada com sucesso!');
        console.log('📊 Estado inicial:', {
            campaigns: AppState.backendData.campaigns.length,
            selectedMetrics: AppState.selectedMetrics.size,
            dateRange: formatDateRange()
        });
        
    } catch (error) {
        console.error('❌ Erro ao inicializar aplicação:', error);
        AppState.errorMessage = 'Erro ao inicializar aplicação. Recarregue a página.';
        showErrorMessage();
    }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializeApp); 