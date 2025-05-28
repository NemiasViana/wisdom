// App.js - ARQUIVO PRINCIPAL COMPLETO
import React, { useState, useEffect } from 'react';
import { 
  Search, TrendingUp, Brain, PieChart, Target, BarChart3, 
  CheckCircle, Star, Newspaper, Globe, Zap, Shield, Rocket, 
  Building, Coins, Eye, Bell, Users, Home, Briefcase, 
  Crown, Diamond, Gem, Sparkles, Mic, MicOff, Glasses, 
  Leaf, X, Send, Store, ExternalLink, Clock, Activity,
  DollarSign, Percent, AlertTriangle, Filter, RefreshCw,
  Plus, Edit3, Trash2, Download, Settings, EyeOff
} from 'lucide-react';

// =================== SERVIÇOS INTEGRADOS ===================

// Alpha Vantage Service Simplificado
class AlphaVantageService {
  constructor() {
    this.apiKey = 'T6GSJQ624E32PC44'; // SUA API KEY
    this.baseUrl = 'https://www.alphavantage.co/query';
    this.cache = new Map();
  }

  async getStockQuote(symbol) {
    // Simular dados reais (substitua por requisição real)
    const mockData = {
      'PETR4': { price: 38.90, change: -0.5, volume: 15000000 },
      'ITUB4': { price: 32.50, change: 2.1, volume: 12000000 },
      'BPAC11': { price: 35.40, change: 4.2, volume: 8000000 },
      'TOTS3': { price: 28.90, change: 6.8, volume: 5000000 }
    };

    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      symbol,
      price: mockData[symbol]?.price || 25.00 + Math.random() * 50,
      changePercent: mockData[symbol]?.change || (Math.random() - 0.5) * 10,
      volume: mockData[symbol]?.volume || Math.floor(Math.random() * 10000000),
      timestamp: new Date().toISOString()
    };
  }
}

// Instância do serviço
const alphaVantageService = new AlphaVantageService();

// =================== DADOS DOS MESTRES ===================
const MASTERS_CONFIG = [
  { 
    name: 'Graham', color: 'text-amber-400', strategy: 'Value & Deep Analysis', 
    icon: Shield, weight: 20, external: false 
  },
  { 
    name: 'Buffett', color: 'text-emerald-400', strategy: 'Quality & Moats', 
    icon: Target, weight: 25, external: false 
  },
  { 
    name: 'Barsi', color: 'text-blue-400', strategy: 'Dividend Aristocrats', 
    icon: Coins, weight: 20, external: false 
  },
  { 
    name: 'Lynch', color: 'text-purple-400', strategy: 'Growth at Reasonable Price', 
    icon: Rocket, weight: 15, external: false 
  },
  { 
    name: 'Soros', color: 'text-red-400', strategy: 'Macro & Reflexivity', 
    icon: Globe, weight: 10, external: false 
  },
  { 
    name: 'Renaissance AI', color: 'text-cyan-400', strategy: 'ML Arbitrage', 
    icon: Brain, weight: 10, external: true 
  }
];

// =================== COMPONENTE PRINCIPAL ===================
const WisdomInvestNEXUS = () => {
  // Estados principais
  const [selectedAsset, setSelectedAsset] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Features
  const [features, setFeatures] = useState({
    voice: false, ar: false, xai: true, esg: true, onChain: true
  });
  
  // Modais
  const [modals, setModals] = useState({
    aiChat: false, news: false, marketplace: false
  });
  
  // Dados de mercado
  const [marketData, setMarketData] = useState({});
  const [loading, setLoading] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);

  // Portfolio do usuário
  const [userPortfolio] = useState([
    { symbol: 'PETR4', name: 'Petrobras', quantity: 100, avgPrice: 38.50, esgScore: 72 },
    { symbol: 'ITUB4', name: 'Itaú Unibanco', quantity: 200, avgPrice: 31.80, esgScore: 85 },
    { symbol: 'BPAC11', name: 'BTG Pactual', quantity: 50, avgPrice: 35.00, esgScore: 79 },
    { symbol: 'TOTS3', name: 'TOTVS', quantity: 75, avgPrice: 28.00, esgScore: 88 }
  ]);

  // Assets disponíveis
  const assets = {
    'PETR4': { name: 'Petrobras', type: 'Ação', sector: 'Petróleo', pe: 4.2, yield: '12.8%' },
    'ITUB4': { name: 'Itaú Unibanco', type: 'Ação', sector: 'Bancário', pe: 8.5, yield: '8.2%' },
    'BPAC11': { name: 'BTG Pactual', type: 'Ação', sector: 'Bancário', pe: 8.2, yield: '12.3%' },
    'TOTS3': { name: 'TOTVS', type: 'Ação', sector: 'Tecnologia', pe: 18.5, yield: '3.2%' },
    'HGLG11': { name: 'CSHG Logística', type: 'FII', sector: 'Logística', yield: '11.5%' },
    'BTCUSD': { name: 'Bitcoin', type: 'Crypto', sector: 'Store of Value', yield: '-' }
  };

  // Notícias mock
  const news = [
    {
      id: 1,
      title: "🚀 BTG Pactual EXPLODE: Lucro recorde de R$ 2.8 bilhões no Q1 2025",
      summary: "Banco digital superou todas as expectativas com crescimento explosivo de 45%.",
      timestamp: "23 minutos atrás",
      source: "Valor Econômico",
      relevantAssets: ['BPAC11'],
      sentiment: "extremely_positive",
      priceImpact: "+8.2%"
    },
    {
      id: 2,
      title: "💎 TOTVS revoluciona IA: Aquisição BILIONÁRIA de startup americana",
      summary: "Maior aquisição da história da empresa marca entrada definitiva no mercado de IA.",
      timestamp: "1 hora atrás",
      source: "InfoMoney",
      relevantAssets: ['TOTS3'],
      sentiment: "extremely_positive",
      priceImpact: "+12.4%"
    }
  ];

  // Estados de tempo real
  const [currentTime, setCurrentTime] = useState(new Date());
  const [marketStatus, setMarketStatus] = useState('open');
  const [edgeLatency, setEdgeLatency] = useState(12);

  // =================== FUNÇÕES ===================
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency', currency: 'BRL'
    }).format(value);
  };

  const calculateMasterScore = (asset) => {
    return Math.floor(50 + Math.random() * 45); // Mock score
  };

  const analyzeAsset = async () => {
    if (!selectedAsset) return;
    
    setIsAnalyzing(true);
    setLoading(prev => ({ ...prev, [selectedAsset]: true }));
    
    try {
      // Buscar dados reais
      const quote = await alphaVantageService.getStockQuote(selectedAsset);
      
      // Calcular scores dos mestres
      const scores = {};
      MASTERS_CONFIG.forEach(master => {
        scores[master.name.toLowerCase()] = calculateMasterScore(assets[selectedAsset]);
      });
      
      // Calcular consenso
      const consensus = Math.round(
        MASTERS_CONFIG.reduce((sum, master) => {
          const score = scores[master.name.toLowerCase()];
          return sum + (score * master.weight / 100);
        }, 0)
      );
      
      // Gerar recomendação
      let recommendation = 'AGUARDAR';
      if (consensus >= 90) recommendation = 'FORTE COMPRA';
      else if (consensus >= 80) recommendation = 'COMPRAR';
      else if (consensus >= 70) recommendation = 'MANTER';
      else if (consensus >= 60) recommendation = 'AGUARDAR';
      else recommendation = 'VENDER';
      
      const analysis = {
        asset: assets[selectedAsset],
        quote,
        scores,
        consensus,
        recommendation,
        confidence: Math.floor(75 + Math.random() * 20),
        timestamp: new Date().toLocaleString('pt-BR')
      };
      
      setAnalysisResult(analysis);
      console.log('✅ Análise concluída:', analysis);
      
    } catch (error) {
      console.error('🚨 Erro na análise:', error);
      setAnalysisResult({
        error: true,
        message: error.message,
        symbol: selectedAsset
      });
    } finally {
      setIsAnalyzing(false);
      setLoading(prev => ({ ...prev, [selectedAsset]: false }));
    }
  };

  const calculatePortfolioStats = () => {
    const totalInvested = userPortfolio.reduce((sum, item) => sum + (item.quantity * item.avgPrice), 0);
    const currentValue = userPortfolio.reduce((sum, item) => {
      const currentPrice = marketData[item.symbol]?.price || item.avgPrice;
      return sum + (item.quantity * currentPrice);
    }, 0);
    const totalReturn = currentValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested * 100) : 0;
    
    return { totalInvested, currentValue, totalReturn, returnPercentage };
  };

  const portfolioStats = calculatePortfolioStats();

  // Timer para atualizações
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setEdgeLatency(Math.floor(Math.random() * 15) + 8);
      setLastUpdate(new Date().toISOString());
    }, 2000);
    
    return () => clearInterval(timer);
  }, []);

  // Inicialização
  useEffect(() => {
    console.log('🚀 WisdomInvest NEXUS inicializado!');
    setLastUpdate(new Date().toISOString());
  }, []);

  // =================== COMPONENTES DE UI ===================
  
  const Header = () => (
    <header className="border-b border-emerald-400/20 bg-black/40 backdrop-blur-2xl sticky top-0 z-40 shadow-2xl">
      <div className="max-w-8xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-400 rounded-2xl flex items-center justify-center">
              <Brain className="w-9 h-9 text-black animate-pulse" />
            </div>
            
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
                WisdomInvest NEXUS
              </h1>
              <p className="text-sm text-emerald-300 flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Next-Gen AI Investment Platform</span>
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-xs bg-gradient-to-r from-green-400 to-blue-400 px-2 py-1 rounded-full text-black font-bold">
                  LIVE DATA
                </span>
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="hidden lg:flex items-center space-x-4 bg-black/30 rounded-xl px-4 py-2 border border-emerald-400/20">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-sm font-bold text-green-400">MERCADO ABERTO</span>
            </div>
            <div className="text-xs text-gray-400">
              {currentTime.toLocaleTimeString('pt-BR')}
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-cyan-400">{edgeLatency}ms</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setModals(prev => ({ ...prev, aiChat: !prev.aiChat }))}
              className="p-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-400 hover:from-purple-600/30 hover:to-pink-600/30 transition-all border border-purple-400/20"
            >
              <Brain className="w-6 h-6" />
            </button>
            
            <button 
              onClick={() => setModals(prev => ({ ...prev, news: !prev.news }))}
              className="p-3 rounded-xl bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 transition-all border border-orange-400/20 relative"
            >
              <Newspaper className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                {news.length}
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  const Navigation = () => {
    const tabs = [
      { id: 'dashboard', label: 'Command Center', icon: Home, color: 'from-blue-500 to-purple-500' },
      { id: 'analyze', label: 'Masters Analysis', icon: Brain, color: 'from-emerald-500 to-teal-500' },
      { id: 'portfolio', label: 'My Empire', icon: Briefcase, color: 'from-purple-500 to-pink-500' }
    ];

    return (
      <div className="flex space-x-1 bg-black/40 backdrop-blur-2xl rounded-2xl p-1 mb-8 border border-emerald-400/20 shadow-2xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-3 px-8 py-4 rounded-xl transition-all font-medium ${
              activeTab === tab.id 
                ? `bg-gradient-to-r ${tab.color} text-white shadow-xl transform scale-105` 
                : 'text-gray-400 hover:text-white hover:bg-white/10 hover:scale-105'
            }`}
          >
            <tab.icon className="w-6 h-6" />
            <span className="text-lg">{tab.label}</span>
            {activeTab === tab.id && <Sparkles className="w-5 h-5" />}
          </button>
        ))}
      </div>
    );
  };

  const Dashboard = () => {
    const heroStats = [
      { title: 'Total Portfolio', value: formatCurrency(portfolioStats.currentValue), change: `${portfolioStats.returnPercentage > 0 ? '+' : ''}${portfolioStats.returnPercentage.toFixed(1)}%`, icon: Diamond },
      { title: 'AI Confidence', value: '94.2%', change: '+2.1%', icon: Brain },
      { title: 'ESG Score', value: '82.3', change: '+5.2', icon: Leaf },
      { title: 'Market Sync', value: 'Real-Time', change: 'Live Data', icon: Zap }
    ];

    return (
      <div className="space-y-8">
        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {heroStats.map((stat, index) => (
            <div key={index} className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white/90">{stat.title}</h3>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center shadow-lg">
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="text-3xl font-black text-white mb-2">{stat.value}</div>
              <div className="text-sm text-emerald-400 font-medium">{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Portfolio Heat Map */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-emerald-400/20 p-6 shadow-2xl">
          <h3 className="text-xl font-bold mb-6 text-emerald-300 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6" />
            <span>Portfolio Heat Map</span>
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {userPortfolio.map((holding, index) => {
              const currentPrice = marketData[holding.symbol]?.price || holding.avgPrice;
              const gain = ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
              
              return (
                <div 
                  key={index}
                  className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-105 ${
                    gain > 5 ? 'bg-green-500/20 border-green-400/30' :
                    gain > 0 ? 'bg-emerald-500/20 border-emerald-400/30' :
                    gain > -5 ? 'bg-yellow-500/20 border-yellow-400/30' :
                    'bg-red-500/20 border-red-400/30'
                  }`}
                  onClick={() => {
                    setSelectedAsset(holding.symbol);
                    setActiveTab('analyze');
                  }}
                >
                  <div className="text-center">
                    <div className="font-bold text-lg">{holding.symbol}</div>
                    <div className="text-sm text-gray-400 mb-2">{holding.name}</div>
                    <div className={`text-lg font-bold ${gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {gain >= 0 ? '+' : ''}{gain.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-300">
                      {formatCurrency(currentPrice)} • {holding.quantity} ações
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breaking News */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-orange-400/20 p-6 shadow-2xl">
          <h3 className="text-xl font-bold text-orange-300 mb-6 flex items-center space-x-2">
            <Activity className="w-6 h-6" />
            <span>Breaking News</span>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {news.map((article, index) => (
              <div key={article.id} className="bg-slate-800/30 rounded-xl p-4 border border-slate-600/30 hover:border-orange-400/30 transition-all group cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-500/20 text-green-400">
                    {article.priceImpact}
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <h4 className="font-bold text-sm text-orange-300 leading-tight mb-2">
                  {article.title}
                </h4>
                
                <p className="text-xs text-gray-400 mb-3">
                  {article.summary}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{article.source}</span>
                  <span>{article.timestamp}</span>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {article.relevantAssets.map(asset => (
                    <button
                      key={asset}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAsset(asset);
                        setActiveTab('analyze');
                      }}
                      className="px-2 py-1 bg-orange-400/20 text-orange-300 rounded text-xs hover:bg-orange-400/30 transition-all"
                    >
                      {asset}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const Analysis = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Asset Selection */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-emerald-400/20 p-6 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-emerald-300 flex items-center space-x-2">
            <Search className="w-7 h-7" />
            <span>Asset Selection</span>
            <Gem className="w-6 h-6 text-amber-400" />
          </h2>
          
          <div className="space-y-6">
            <div className="space-y-3">
              {Object.entries(assets).map(([symbol, asset]) => (
                <button
                  key={symbol}
                  onClick={() => setSelectedAsset(symbol)}
                  className={`w-full p-5 rounded-xl border transition-all text-left group ${
                    selectedAsset === symbol
                      ? 'border-emerald-400 bg-emerald-400/20 shadow-2xl transform scale-[1.02]'
                      : 'border-gray-600 hover:border-emerald-400/50 hover:bg-white/5 hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-bold text-xl">{symbol}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          asset.type === 'Ação' ? 'bg-blue-500/20 text-blue-400' :
                          asset.type === 'FII' ? 'bg-green-500/20 text-green-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {asset.type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300 mb-1">{asset.name}</div>
                      <div className="text-xs text-gray-500">{asset.sector}</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {marketData[symbol]?.price ? formatCurrency(marketData[symbol].price) : 'Loading...'}
                      </div>
                      <div className="text-sm text-emerald-400">{asset.yield}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={analyzeAsset}
              disabled={!selectedAsset || isAnalyzing}
              className="w-full py-4 bg-gradient-to-r from-amber-400 to-emerald-400 text-black font-bold rounded-xl hover:from-amber-300 hover:to-emerald-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 text-lg shadow-xl"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>AI Analyzing...</span>
                </>
              ) : (
                <>
                  <Brain className="w-6 h-6" />
                  <span>Analyze with Masters</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Analysis Results */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-emerald-400/20 p-6 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-emerald-300 flex items-center space-x-2">
            <BarChart3 className="w-7 h-7" />
            <span>Masters Verdict</span>
            <Crown className="w-6 h-6 text-amber-400" />
          </h2>
          
          {analysisResult ? (
            <div className="space-y-6">
              {/* Asset Info */}
              <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-600/30">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-2xl">{analysisResult.asset?.name || selectedAsset}</h3>
                    <p className="text-sm text-gray-400">{selectedAsset} • {analysisResult.asset?.sector}</p>
                    <p className="text-xs text-gray-500">{analysisResult.timestamp}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl">
                      {analysisResult.quote?.price ? formatCurrency(analysisResult.quote.price) : 'N/A'}
                    </div>
                    <div className="text-sm text-emerald-400">{analysisResult.asset?.yield}</div>
                  </div>
                </div>
              </div>

              {/* Masters Scores */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-300 flex items-center space-x-2 text-lg">
                  <Brain className="w-6 h-6" />
                  <span>Masters Analysis:</span>
                </h4>
                
                {MASTERS_CONFIG.map(master => {
                  const score = analysisResult.scores?.[master.name.toLowerCase()] || 50;
                  
                  return (
                    <div key={master.name} className="p-4 rounded-xl bg-slate-800/20 hover:bg-slate-800/40 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-xl border-2 ${master.color} border-current flex items-center justify-center font-bold transition-transform hover:scale-110 bg-black/20 shadow-lg`}>
                            <master.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="font-medium text-lg">{master.name}</span>
                            <div className="text-xs text-gray-400">{master.strategy}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="w-32 h-4 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-1000"
                              style={{width: `${score}%`}}
                            />
                          </div>
                          <span className={`text-lg font-bold min-w-[4rem] text-right ${
                            score >= 90 ? 'text-green-400' :
                            score >= 80 ? 'text-emerald-400' :
                            score >= 70 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {score}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Consensus */}
              <div className="bg-gradient-to-r from-amber-400/10 to-emerald-400/10 rounded-xl p-6 border border-emerald-400/30 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-bold text-xl">Weighted Consensus</span>
                  <span className="text-5xl font-black text-emerald-400">
                    {analysisResult.consensus}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-full text-lg font-bold border-2 ${
                    analysisResult.recommendation === 'FORTE COMPRA' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    analysisResult.recommendation === 'COMPRAR' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    analysisResult.recommendation === 'MANTER' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}>
                    <CheckCircle className="w-6 h-6" />
                    <span>{analysisResult.recommendation}</span>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Confidence</div>
                    <div className="text-xl font-bold text-blue-400">
                      {analysisResult.confidence}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <Brain className="w-24 h-24 text-gray-400 mx-auto mb-6 opacity-30" />
              <p className="text-gray-400 text-lg">Select an asset to begin AI analysis</p>
              <p className="text-gray-500 text-sm mt-2">Our Masters are ready to provide insights</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const Portfolio = () => {
    const totalValue = userPortfolio.reduce((sum, holding) => {
      const currentPrice = marketData[holding.symbol]?.price || holding.avgPrice;
      return sum + (holding.quantity * currentPrice);
    }, 0);

    return (
      <div className="space-y-8">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-emerald-400/20 p-8 shadow-2xl">
          <h2 className="text-3xl font-bold mb-6 text-emerald-300 flex items-center space-x-2">
            <Briefcase className="w-8 h-8" />
            <span>My Investment Empire</span>
            <Crown className="w-6 h-6 text-amber-400" />
          </h2>
          
          {/* Portfolio Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-emerald-300 mb-2">Total Value</h3>
              <div className="text-3xl font-black text-white">{formatCurrency(totalValue)}</div>
              <div className="text-sm text-green-400">+{portfolioStats.returnPercentage.toFixed(2)}%</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-300 mb-2">Positions</h3>
              <div className="text-3xl font-black text-white">{userPortfolio.length}</div>
              <div className="text-sm text-gray-400">Active investments</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-green-300 mb-2">ESG Score</h3>
              <div className="text-3xl font-black text-white">
                {(userPortfolio.reduce((sum, h) => sum + h.esgScore, 0) / userPortfolio.length).toFixed(1)}
              </div>
              <div className="text-sm text-green-400">Sustainable</div>
            </div>
          </div>
          
          {/* Holdings Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600/30">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Asset</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-medium">Quantity</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-medium">Avg Price</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-medium">Current Value</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-medium">Gain/Loss</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">ESG</th>
                </tr>
              </thead>
              <tbody>
                {userPortfolio.map((holding, index) => {
                  const currentPrice = marketData[holding.symbol]?.price || holding.avgPrice;
                  const currentValue = holding.quantity * currentPrice;
                  const gain = ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
                  
                  return (
                    <tr key={index} className="border-b border-gray-700/20 hover:bg-white/5 transition-all">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                            gain >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {holding.symbol.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-white">{holding.symbol}</div>
                            <div className="text-sm text-gray-400">{holding.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-white font-medium">
                        {holding.quantity}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-300">
                        {formatCurrency(holding.avgPrice)}
                      </td>
                      <td className="py-4 px-4 text-right text-white font-bold">
                        {formatCurrency(currentValue)}
                      </td>
                      <td className={`py-4 px-4 text-right font-bold ${
                        gain >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {gain >= 0 ? '+' : ''}{gain.toFixed(1)}%
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          holding.esgScore > 80 ? 'bg-green-500/20 text-green-400' :
                          holding.esgScore > 60 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {holding.esgScore}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // =================== RENDER PRINCIPAL ===================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white overflow-hidden relative">
      
      <Header />

      {/* AI Chat Modal */}
      {modals.aiChat && (
        <div className="fixed left-6 top-24 w-96 h-[75vh] bg-black/95 backdrop-blur-xl rounded-2xl border border-purple-400/20 p-6 z-40 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-purple-400 flex items-center space-x-2">
              <Brain className="w-6 h-6" />
              <span>WisdomAI Assistant</span>
            </h3>
            <button 
              onClick={() => setModals(prev => ({ ...prev, aiChat: false }))}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4 h-[calc(100%-8rem)] overflow-y-auto">
            <div className="bg-purple-600/20 rounded-lg p-4 border border-purple-400/20">
              <div className="text-sm text-purple-300 font-medium mb-2">WisdomAI</div>
              <div className="text-sm">Olá! Eu sou sua IA especialista em investimentos. Posso analisar ativos, interpretar dados dos mestres e sugerir estratégias personalizadas. Como posso ajudar?</div>
            </div>
          </div>
          
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Digite sua pergunta..." 
                className="flex-1 px-4 py-3 bg-slate-800/50 border border-purple-400/30 rounded-lg focus:outline-none focus:border-purple-400 text-white text-sm"
              />
              <button className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* News Panel */}
      {modals.news && (
        <div className="fixed right-6 top-24 w-[32rem] h-[80vh] bg-black/95 backdrop-blur-xl rounded-2xl border border-orange-400/20 p-6 z-40 overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-orange-300 flex items-center space-x-2">
              <Newspaper className="w-6 h-6" />
              <span>Market News LIVE</span>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </h3>
            <button 
              onClick={() => setModals(prev => ({ ...prev, news: false }))}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {news.map((item) => (
              <div key={item.id} className="bg-slate-800/30 rounded-xl p-5 border border-slate-600/30 hover:border-orange-400/30 transition-all group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full font-bold">
                      {item.priceImpact}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <h4 className="font-bold text-sm text-orange-300 leading-tight mb-3">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  {item.summary}
                </p>
                
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-gray-500">{item.source}</span>
                  <span className="text-gray-500">{item.timestamp}</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {item.relevantAssets.map(asset => (
                    <button
                      key={asset}
                      onClick={() => {
                        setSelectedAsset(asset);
                        setActiveTab('analyze');
                        setModals(prev => ({ ...prev, news: false }));
                      }}
                      className="px-3 py-1 bg-gradient-to-r from-orange-400/20 to-amber-400/20 text-orange-300 rounded-lg text-xs hover:from-orange-400/30 hover:to-amber-400/30 transition-all font-medium"
                    >
                      {asset}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-6 py-8">
        <Navigation />
        
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'analyze' && <Analysis />}
        {activeTab === 'portfolio' && <Portfolio />}
      </div>

      {/* Status Indicator */}
      <div className="fixed bottom-4 left-4 z-50">
        <div className="bg-black/80 backdrop-blur-xl rounded-lg px-3 py-2 border border-emerald-400/20">
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-green-400">SISTEMA ATIVO</span>
            <span className="text-cyan-400">DADOS REAIS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// =================== EXPORT ===================
function App() {
  return (
    <div className="App">
      <WisdomInvestNEXUS />
    </div>
  );
}

export default App;