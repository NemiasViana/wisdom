// pages/WisdomInvestNEXUS.jsx
import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, PieChart, Target, BarChart3, Home, Briefcase, Crown, Sparkles } from 'lucide-react';

// Components
import Header from '../components/layout/Header';
import Navigation from '../components/layout/Navigation';
import Dashboard from '../components/pages/Dashboard';
import Analysis from '../components/pages/Analysis';
import Portfolio from '../components/pages/Portfolio';
import AIChat from '../components/modals/AIChat';
import NewsPanel from '../components/modals/NewsPanel';
import ARMode from '../components/modals/ARMode';

// Hooks
import useMarketData from '../hooks/useMarketData';
import usePortfolio from '../hooks/usePortfolio';

// Constants
import { MASTERS_CONFIG } from '../data/masters';

const WisdomInvestNEXUS = () => {
  // =================== ESTADOS PRINCIPAIS ===================
  const [selectedAsset, setSelectedAsset] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeAssetType, setActiveAssetType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // =================== FEATURES ===================
  const [features, setFeatures] = useState({
    voice: false,
    ar: false,
    xai: true,
    esg: true,
    onChain: true
  });
  
  // =================== MODAIS ===================
  const [modals, setModals] = useState({
    aiChat: false,
    news: false,
    marketplace: false
  });
  
  // =================== HOOKS CUSTOMIZADOS ===================
  const {
    assets,
    portfolio: marketPortfolio,
    news,
    loading,
    errors,
    lastUpdate,
    fetchAssetQuote,
    fetchFundamentals,
    analyzeAsset,
    fetchNews,
    updatePortfolio,
    isLoading,
    hasErrors,
    stats
  } = useMarketData();

  const {
    userPortfolio,
    addHolding,
    removeHolding,
    updateHolding,
    calculatePortfolioStats,
    portfolioStats
  } = usePortfolio();

  // =================== MARKET STATUS ===================
  const [marketStatus, setMarketStatus] = useState('open');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [edgeLatency, setEdgeLatency] = useState(12);

  // =================== ANÁLISE ===================
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // =================== EFEITOS ===================
  useEffect(() => {
    // Timer para atualizar tempo e status do mercado
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setEdgeLatency(Math.floor(Math.random() * 15) + 8);
      
      // Determinar status do mercado baseado no horário
      const now = new Date();
      const hour = now.getHours();
      const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
      const isMarketHours = hour >= 10 && hour < 18;
      
      setMarketStatus(isWeekday && isMarketHours ? 'open' : 'closed');
    }, 2000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Inicializar dados quando o componente monta
    const initializeData = async () => {
      try {
        console.log('🚀 Inicializando WisdomInvest NEXUS...');
        
        // Buscar notícias iniciais
        await fetchNews();
        
        // Buscar dados do portfolio padrão
        const defaultAssets = ['PETR4', 'ITUB4', 'BPAC11', 'BTCUSD'];
        await Promise.all(
          defaultAssets.map(symbol => fetchAssetQuote(symbol).catch(console.warn))
        );
        
        console.log('✅ Inicialização completa');
      } catch (error) {
        console.error('🚨 Erro na inicialização:', error);
      }
    };

    initializeData();
  }, [fetchNews, fetchAssetQuote]);

  // =================== FUNÇÕES ===================
  const handleAnalyzeAsset = async () => {
    if (!selectedAsset) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      console.log(`🧠 Analisando ${selectedAsset} com dados reais...`);
      
      const analysis = await analyzeAsset(selectedAsset);
      setAnalysisResult(analysis);
      
      console.log('✅ Análise concluída:', analysis);
    } catch (error) {
      console.error('🚨 Erro na análise:', error);
      // Mostrar erro para o usuário
      setAnalysisResult({
        error: true,
        message: error.message,
        symbol: selectedAsset
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleFeature = (feature) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const toggleModal = (modal) => {
    setModals(prev => ({
      ...prev,
      [modal]: !prev[modal]
    }));
  };

  const getMarketStatusColor = () => {
    return marketStatus === 'open' ? 'text-green-400' : 'text-red-400';
  };

  const getMarketStatusText = () => {
    return marketStatus === 'open' ? 'MERCADO ABERTO' : 'MERCADO FECHADO';
  };

  // =================== DADOS PROCESSADOS ===================
  const availableAssets = React.useMemo(() => {
    // Combinar assets do hook com dados mockados se necessário
    const baseAssets = {
      'ITUB4': { name: 'Itaú Unibanco', type: 'Ação', sector: 'Bancário' },
      'PETR4': { name: 'Petrobras', type: 'Ação', sector: 'Petróleo' },
      'BPAC11': { name: 'BTG Pactual', type: 'Ação', sector: 'Bancário' },
      'TOTS3': { name: 'TOTVS', type: 'Ação', sector: 'Tecnologia' },
      'HGLG11': { name: 'CSHG Logística', type: 'FII', sector: 'Logística' },
      'HCRI11': { name: 'Hospital Care REIT', type: 'FII', sector: 'Saúde' },
      'BTCUSD': { name: 'Bitcoin', type: 'Crypto', sector: 'Store of Value' },
      'ETHUSD': { name: 'Ethereum', type: 'Crypto', sector: 'Smart Contracts' },
      'SOLUSD': { name: 'Solana', type: 'Crypto', sector: 'Smart Contracts' }
    };

    // Enriquecer com dados reais quando disponíveis
    Object.keys(baseAssets).forEach(symbol => {
      if (assets[symbol]) {
        baseAssets[symbol] = {
          ...baseAssets[symbol],
          ...assets[symbol],
          // Dados de quote em tempo real
          price: assets[symbol].quote?.price || 'N/A',
          change: assets[symbol].quote?.changePercent || '0',
          // Dados fundamentalistas
          pe: assets[symbol].fundamentals?.combined?.pe || null,
          roe: assets[symbol].fundamentals?.combined?.roe || null,
          dividendYield: assets[symbol].fundamentals?.combined?.dividendYield || null,
          // Última atualização
          lastUpdate: assets[symbol].lastUpdate || null
        };
      }
    });

    return baseAssets;
  }, [assets]);

  const filteredAssets = React.useMemo(() => {
    return Object.entries(availableAssets).filter(([symbol, asset]) => {
      const matchesType = 
        (activeAssetType === 'acoes' && asset.type === 'Ação') ||
        (activeAssetType === 'fiis' && asset.type === 'FII') ||
        (activeAssetType === 'crypto' && asset.type === 'Crypto') ||
        activeAssetType === 'all';
      
      const matchesSearch = 
        symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesSearch;
    });
  }, [availableAssets, activeAssetType, searchTerm]);

  // =================== TABS CONFIGURATION ===================
  const tabs = [
    { 
      id: 'dashboard', 
      label: 'Command Center', 
      icon: Home, 
      color: 'from-blue-500 to-purple-500',
      badge: stats.newsCount > 0 ? stats.newsCount : null
    },
    { 
      id: 'analyze', 
      label: 'Masters Analysis', 
      icon: Brain, 
      color: 'from-emerald-500 to-teal-500',
      badge: isLoading ? '🔄' : null
    },
    { 
      id: 'portfolio', 
      label: 'My Empire', 
      icon: Briefcase, 
      color: 'from-purple-500 to-pink-500',
      badge: userPortfolio.length > 0 ? userPortfolio.length : null
    }
  ];

  // =================== RENDER ===================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white overflow-hidden relative">
      
      {/* AR Mode Overlay */}
      {features.ar && (
        <ARMode 
          portfolioStats={portfolioStats}
          onClose={() => toggleFeature('ar')}
        />
      )}

      {/* Header */}
      <Header 
        marketStatus={marketStatus}
        currentTime={currentTime}
        edgeLatency={edgeLatency}
        features={features}
        onToggleFeature={toggleFeature}
        onToggleModal={toggleModal}
        newsCount={news.length}
        masters={MASTERS_CONFIG}
        getMarketStatusColor={getMarketStatusColor}
        getMarketStatusText={getMarketStatusText}
      />

      {/* AI Chat Sidebar */}
      {modals.aiChat && (
        <AIChat 
          onClose={() => toggleModal('aiChat')}
          selectedAsset={selectedAsset}
          portfolioStats={portfolioStats}
        />
      )}

      {/* News Panel */}
      {modals.news && (
        <NewsPanel 
          news={news}
          loading={loading.news}
          onClose={() => toggleModal('news')}
          onSelectAsset={(symbol) => {
            setSelectedAsset(symbol);
            setActiveTab('analyze');
            toggleModal('news');
          }}
        />
      )}

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-6 py-8">
        
        {/* Navigation */}
        <Navigation 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Error Display */}
        {hasErrors && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
            <h3 className="font-bold text-red-300 mb-2">⚠️ Avisos do Sistema:</h3>
            <ul className="text-sm text-red-200 space-y-1">
              {Object.entries(errors).map(([key, error]) => (
                <li key={key}>• {key}: {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* System Status */}
        {isLoading && (
          <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-300">Sistema processando dados em tempo real...</span>
              <span className="text-xs text-blue-400">
                {Object.entries(loading).filter(([_, isLoading]) => isLoading).map(([key]) => key).join(', ')}
              </span>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'dashboard' && (
            <Dashboard 
              portfolioStats={portfolioStats}
              userPortfolio={userPortfolio}
              availableAssets={availableAssets}
              news={news}
              features={features}
              onSelectAsset={(symbol) => {
                setSelectedAsset(symbol);
                setActiveTab('analyze');
              }}
            />
          )}
          
          {activeTab === 'analyze' && (
            <Analysis 
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
              activeAssetType={activeAssetType}
              setActiveAssetType={setActiveAssetType}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filteredAssets={filteredAssets}
              analysisResult={analysisResult}
              isAnalyzing={isAnalyzing}
              onAnalyzeAsset={handleAnalyzeAsset}
              masters={MASTERS_CONFIG}
              features={features}
            />
          )}
          
          {activeTab === 'portfolio' && (
            <Portfolio 
              userPortfolio={userPortfolio}
              portfolioStats={portfolioStats}
              onAddHolding={addHolding}
              onRemoveHolding={removeHolding}
              onUpdateHolding={updateHolding}
              availableAssets={availableAssets}
              features={features}
            />
          )}
        </div>

        {/* Footer with System Info */}
        <div className="mt-12 pt-6 border-t border-emerald-400/20 text-center">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
            <span>📊 {stats.cachedQuotes} ativos em cache</span>
            <span>📰 {stats.newsCount} notícias carregadas</span>
            <span>⚡ {edgeLatency}ms latência</span>
            {lastUpdate && (
              <span>🕒 Última atualização: {new Date(lastUpdate).toLocaleTimeString('pt-BR')}</span>
            )}
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <p>WisdomInvest NEXUS v2.0 • Powered by Alpha Vantage & Real-Time Web Scraping</p>
            <p>🚀 Next-Gen AI Investment Platform • Made with ❤️ in Brazil</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WisdomInvestNEXUS;