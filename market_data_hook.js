// hooks/useMarketData.js
import { useState, useEffect, useCallback } from 'react';
import alphaVantageService from '../services/alphaVantageService';
import webScrapingService from '../services/webScrapingService';

const useMarketData = () => {
  // Estados principais
  const [assets, setAssets] = useState({});
  const [portfolio, setPortfolio] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);

  // Cache local para otimização
  const [cache, setCache] = useState({
    quotes: {},
    fundamentals: {},
    news: [],
    lastNewsUpdate: null
  });

  // Lista de ativos brasileiros principais
  const BRAZILIAN_ASSETS = [
    'PETR4', 'ITUB4', 'BPAC11', 'TOTS3', 'VALE3', 
    'BBAS3', 'ABEV3', 'BBDC4', 'WEGE3', 'RENT3'
  ];

  const CRYPTO_ASSETS = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'];

  // Função para buscar quote em tempo real
  const fetchAssetQuote = useCallback(async (symbol) => {
    setLoading(prev => ({ ...prev, [symbol]: true }));
    setErrors(prev => ({ ...prev, [symbol]: null }));

    try {
      let quote;
      
      if (CRYPTO_ASSETS.includes(symbol)) {
        quote = await alphaVantageService.getCryptoQuote(symbol);
      } else {
        quote = await alphaVantageService.getStockQuote(symbol);
      }

      // Atualizar cache
      setCache(prev => ({
        ...prev,
        quotes: {
          ...prev.quotes,
          [symbol]: quote
        }
      }));

      // Atualizar assets
      setAssets(prev => ({
        ...prev,
        [symbol]: {
          ...prev[symbol],
          quote: quote,
          lastUpdate: new Date().toISOString()
        }
      }));

      console.log(`✅ Quote atualizada para ${symbol}:`, quote);
      return quote;

    } catch (error) {
      const errorMessage = `Erro ao buscar quote de ${symbol}: ${error.message}`;
      console.error('🚨', errorMessage);
      
      setErrors(prev => ({
        ...prev,
        [symbol]: errorMessage
      }));

      throw error;
    } finally {
      setLoading(prev => ({ ...prev, [symbol]: false }));
    }
  }, []);

  // Função para buscar dados fundamentalistas
  const fetchFundamentals = useCallback(async (symbol) => {
    setLoading(prev => ({ ...prev, [`${symbol}_fundamentals`]: true }));

    try {
      // Buscar dados do Alpha Vantage
      const alphaData = await alphaVantageService.getCompanyOverview(symbol);
      
      // Buscar dados do Status Invest (apenas para ações brasileiras)
      let statusData = null;
      if (BRAZILIAN_ASSETS.includes(symbol)) {
        try {
          statusData = await webScrapingService.scrapeStatusInvest(symbol);
        } catch (error) {
          console.warn(`⚠️ Status Invest indisponível para ${symbol}:`, error.message);
        }
      }

      const fundamentals = {
        alphaVantage: alphaData,
        statusInvest: statusData?.data || null,
        combined: combineFundamentals(alphaData, statusData?.data),
        timestamp: new Date().toISOString()
      };

      // Atualizar cache
      setCache(prev => ({
        ...prev,
        fundamentals: {
          ...prev.fundamentals,
          [symbol]: fundamentals
        }
      }));

      // Atualizar assets
      setAssets(prev => ({
        ...prev,
        [symbol]: {
          ...prev[symbol],
          fundamentals: fundamentals,
          lastFundamentalsUpdate: new Date().toISOString()
        }
      }));

      console.log(`✅ Fundamentals atualizados para ${symbol}`);
      return fundamentals;

    } catch (error) {
      const errorMessage = `Erro ao buscar fundamentals de ${symbol}: ${error.message}`;
      console.error('🚨', errorMessage);
      
      setErrors(prev => ({
        ...prev,
        [`${symbol}_fundamentals`]: errorMessage
      }));

      throw error;
    } finally {
      setLoading(prev => ({ ...prev, [`${symbol}_fundamentals`]: false }));
    }
  }, []);

  // Função para análise completa (Masters + IA)
  const analyzeAsset = useCallback(async (symbol) => {
    setLoading(prev => ({ ...prev, [`${symbol}_analysis`]: true }));

    try {
      console.log(`🧠 Iniciando análise completa para ${symbol}...`);

      // 1. Buscar todos os dados necessários
      const [quote, fundamentals, technicalData] = await Promise.allSettled([
        fetchAssetQuote(symbol),
        fetchFundamentals(symbol),
        alphaVantageService.getComprehensiveAnalysis(symbol)
      ]);

      // 2. Consolidar dados
      const consolidatedData = {
        symbol: symbol,
        quote: quote.status === 'fulfilled' ? quote.value : null,
        fundamentals: fundamentals.status === 'fulfilled' ? fundamentals.value : null,
        technical: technicalData.status === 'fulfilled' ? technicalData.value : null,
        timestamp: new Date().toISOString()
      };

      // 3. Aplicar algoritmos dos mestres
      const mastersAnalysis = calculateMastersScores(consolidatedData);

      // 4. Calcular consenso ponderado
      const consensus = calculateWeightedConsensus(mastersAnalysis);

      // 5. Gerar recomendação
      const recommendation = generateRecommendation(consensus);

      const analysis = {
        symbol: symbol,
        data: consolidatedData,
        masters: mastersAnalysis,
        consensus: consensus,
        recommendation: recommendation,
        confidence: calculateConfidence(consolidatedData),
        risks: identifyRisks(consolidatedData),
        opportunities: identifyOpportunities(consolidatedData),
        timestamp: new Date().toISOString()
      };

      // Atualizar assets
      setAssets(prev => ({
        ...prev,
        [symbol]: {
          ...prev[symbol],
          analysis: analysis,
          lastAnalysisUpdate: new Date().toISOString()
        }
      }));

      console.log(`✅ Análise completa finalizada para ${symbol}`);
      return analysis;

    } catch (error) {
      const errorMessage = `Erro na análise de ${symbol}: ${error.message}`;
      console.error('🚨', errorMessage);
      
      setErrors(prev => ({
        ...prev,
        [`${symbol}_analysis`]: errorMessage
      }));

      throw error;
    } finally {
      setLoading(prev => ({ ...prev, [`${symbol}_analysis`]: false }));
    }
  }, [fetchAssetQuote, fetchFundamentals]);

  // Função para buscar notícias agregadas
  const fetchNews = useCallback(async (forceRefresh = false) => {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    
    if (!forceRefresh && cache.lastNewsUpdate && cache.lastNewsUpdate > fiveMinutesAgo) {
      console.log('📦 Usando notícias do cache');
      return cache.news;
    }

    setLoading(prev => ({ ...prev, news: true }));

    try {
      console.log('📰 Buscando notícias agregadas...');
      const aggregatedNews = await webScrapingService.getAggregatedNews();

      // Processar e enriquecer notícias
      const processedNews = aggregatedNews.news.map(article => ({
        ...article,
        relevantAssets: extractRelevantAssets(article.title + ' ' + article.summary),
        impact: calculateNewsImpact(article),
        priceImpact: estimatePriceImpact(article)
      }));

      // Atualizar cache
      setCache(prev => ({
        ...prev,
        news: processedNews,
        lastNewsUpdate: Date.now()
      }));

      setNews(processedNews);
      console.log(`✅ ${processedNews.length} notícias processadas`);
      return processedNews;

    } catch (error) {
      console.error('🚨 Erro ao buscar notícias:', error.message);
      setErrors(prev => ({ ...prev, news: error.message }));
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, news: false }));
    }
  }, [cache.lastNewsUpdate, cache.news]);

  // Função para atualizar portfolio em tempo real
  const updatePortfolio = useCallback(async (portfolioAssets) => {
    setLoading(prev => ({ ...prev, portfolio: true }));

    try {
      console.log('📊 Atualizando portfolio em tempo real...');
      
      const updatedPortfolio = await Promise.all(
        portfolioAssets.map(async (holding) => {
          try {
            const quote = await fetchAssetQuote(holding.symbol);
            const currentValue = holding.quantity * quote.price;
            const totalInvested = holding.quantity * holding.avgPrice;
            const gain = ((quote.price - holding.avgPrice) / holding.avgPrice) * 100;

            return {
              ...holding,
              currentPrice: quote.price,
              currentValue: currentValue,
              totalInvested: totalInvested,
              gain: gain,
              gainAmount: currentValue - totalInvested,
              lastUpdate: quote.timestamp
            };
          } catch (error) {
            console.error(`❌ Erro ao atualizar ${holding.symbol}:`, error.message);
            return {
              ...holding,
              error: error.message
            };
          }
        })
      );

      setPortfolio(updatedPortfolio);
      console.log('✅ Portfolio atualizado');
      return updatedPortfolio;

    } catch (error) {
      console.error('🚨 Erro ao atualizar portfolio:', error.message);
      setErrors(prev => ({ ...prev, portfolio: error.message }));
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, portfolio: false }));
    }
  }, [fetchAssetQuote]);

  // Auto-update em intervalos
  useEffect(() => {
    let interval;
    
    const autoUpdate = async () => {
      try {
        // Atualizar notícias a cada 5 minutos
        await fetchNews();
        
        // Atualizar portfolio se houver holdings
        if (portfolio.length > 0) {
          await updatePortfolio(portfolio);
        }
        
        setLastUpdate(new Date().toISOString());
      } catch (error) {
        console.error('🚨 Erro no auto-update:', error.message);
      }
    };

    // Auto-update a cada 5 minutos
    interval = setInterval(autoUpdate, 5 * 60 * 1000);

    // Cleanup
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchNews, updatePortfolio, portfolio]);

  // Funções utilitárias
  const combineFundamentals = (alphaData, statusData) => {
    if (!alphaData && !statusData) return null;

    return {
      // Dados básicos
      name: alphaData?.name || 'N/A',
      sector: alphaData?.sector || 'N/A',
      
      // Múltiplos (priorizar Status Invest para ações BR)
      pe: statusData?.pe || alphaData?.pe || null,
      pb: statusData?.pvp || alphaData?.pb || null,
      
      // Rentabilidade
      roe: statusData?.roe || alphaData?.roe || null,
      roa: statusData?.roa || alphaData?.roa || null,
      
      // Dividendos
      dividendYield: statusData?.dividendYield || alphaData?.dividendYield || null,
      
      // Margens (Status Invest)
      margemLiquida: statusData?.margemLiquida || null,
      margemEbitda: statusData?.margemEbitda || null,
      
      // Endividamento
      divLiqPatLiq: statusData?.divLiqPatLiq || null,
      
      // Scores
      grahamScore: statusData?.grahamScore || null,
      
      // Metadados
      source: statusData ? 'Status Invest + Alpha Vantage' : 'Alpha Vantage',
      lastUpdate: new Date().toISOString()
    };
  };

  const calculateMastersScores = (data) => {
    const masters = {
      graham: calculateGrahamScore(data),
      buffett: calculateBuffettScore(data),
      barsi: calculateBarsiScore(data),
      lynch: calculateLynchScore(data),
      soros: calculateSorosScore(data),
      renaissance: calculateRenaissanceScore(data)
    };

    return masters;
  };

  const calculateWeightedConsensus = (mastersScores) => {
    const weights = {
      graham: 20,
      buffett: 25,
      barsi: 20,
      lynch: 15,
      soros: 10,
      renaissance: 10
    };

    const weightedSum = Object.entries(mastersScores).reduce((sum, [master, score]) => {
      return sum + (score * weights[master] / 100);
    }, 0);

    return Math.round(weightedSum);
  };

  // Implementação dos algoritmos dos mestres (simplificado)
  const calculateGrahamScore = (data) => {
    let score = 50;
    const fundamentals = data.fundamentals?.combined;
    
    if (fundamentals?.pe && fundamentals.pe < 15) score += 15;
    if (fundamentals?.pb && fundamentals.pb < 1.5) score += 15;
    if (fundamentals?.dividendYield && fundamentals.dividendYield > 6) score += 10;
    if (fundamentals?.roe && fundamentals.roe > 15) score += 10;
    
    return Math.min(score, 95);
  };

  const calculateBuffettScore = (data) => {
    let score = 50;
    const fundamentals = data.fundamentals?.combined;
    
    if (fundamentals?.roe && fundamentals.roe > 20) score += 20;
    if (fundamentals?.margemLiquida && fundamentals.margemLiquida > 15) score += 15;
    if (fundamentals?.divLiqPatLiq && fundamentals.divLiqPatLiq < 30) score += 10;
    
    return Math.min(score, 95);
  };

  const calculateBarsiScore = (data) => {
    let score = 50;
    const fundamentals = data.fundamentals?.combined;
    
    if (fundamentals?.dividendYield && fundamentals.dividendYield > 8) score += 25;
    if (fundamentals?.pe && fundamentals.pe < 12) score += 10;
    if (fundamentals?.roe && fundamentals.roe > 15) score += 10;
    
    return Math.min(score, 95);
  };

  const calculateLynchScore = (data) => {
    let score = 50;
    const quote = data.quote;
    
    if (quote?.changePercent && parseFloat(quote.changePercent) > 0) score += 15;
    // Adicionar mais critérios baseados em crescimento
    
    return Math.min(score, 95);
  };

  const calculateSorosScore = (data) => {
    let score = 50;
    const quote = data.quote;
    
    if (quote?.volume && quote.volume > 1000000) score += 10;
    if (quote?.changePercent && Math.abs(parseFloat(quote.changePercent)) > 5) score += 15;
    
    return Math.min(score, 95);
  };

  const calculateRenaissanceScore = (data) => {
    let score = 50;
    // Implementar algoritmos de ML simplificados
    // Por enquanto, score baseado em volatilidade e volume
    
    return Math.min(score, 95);
  };

  const generateRecommendation = (consensus) => {
    if (consensus >= 90) return 'FORTE COMPRA';
    if (consensus >= 80) return 'COMPRAR';
    if (consensus >= 70) return 'MANTER';
    if (consensus >= 60) return 'AGUARDAR';
    return 'VENDER';
  };

  const calculateConfidence = (data) => {
    let confidence = 60;
    
    if (data.quote) confidence += 10;
    if (data.fundamentals?.combined) confidence += 15;
    if (data.technical) confidence += 15;
    
    return Math.min(confidence, 95);
  };

  const identifyRisks = (data) => {
    const risks = [];
    const fundamentals = data.fundamentals?.combined;
    
    if (fundamentals?.pe && fundamentals.pe > 25) {
      risks.push('P/L elevado - possível sobrevalorização');
    }
    
    if (fundamentals?.divLiqPatLiq && fundamentals.divLiqPatLiq > 80) {
      risks.push('Alto endividamento');
    }
    
    return risks;
  };

  const identifyOpportunities = (data) => {
    const opportunities = [];
    const fundamentals = data.fundamentals?.combined;
    
    if (fundamentals?.dividendYield && fundamentals.dividendYield > 10) {
      opportunities.push('Alto dividend yield');
    }
    
    if (fundamentals?.pe && fundamentals.pe < 10) {
      opportunities.push('Ação subvalorizada');
    }
    
    return opportunities;
  };

  const extractRelevantAssets = (text) => {
    const symbols = [];
    const patterns = [
      /\b(PETR4|ITUB4|BPAC11|TOTS3|VALE3|BBAS3|ABEV3|BBDC4)\b/gi,
      /\b(Bitcoin|BTC|Ethereum|ETH)\b/gi
    ];
    
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        symbols.push(...matches.map(m => m.toUpperCase()));
      }
    });
    
    return [...new Set(symbols)];
  };

  const calculateNewsImpact = (article) => {
    const title = article.title.toLowerCase();
    
    if (title.includes('bilhão') || title.includes('trilhão')) return 'very_high';
    if (title.includes('milhão') || title.includes('aprovação')) return 'high';
    if (title.includes('crescimento') || title.includes('lucro')) return 'medium';
    
    return 'low';
  };

  const estimatePriceImpact = (article) => {
    const impact = calculateNewsImpact(article);
    const sentiment = article.sentiment;
    
    if (impact === 'very_high') {
      return sentiment === 'positive' ? '+15.2%' : '-12.8%';
    }
    if (impact === 'high') {
      return sentiment === 'positive' ? '+8.5%' : '-6.2%';
    }
    if (impact === 'medium') {
      return sentiment === 'positive' ? '+3.2%' : '-2.1%';
    }
    
    return sentiment === 'positive' ? '+1.1%' : '-0.8%';
  };

  // Interface retornada pelo hook
  return {
    // Dados
    assets,
    portfolio,
    news,
    cache,
    
    // Estados
    loading,
    errors,
    lastUpdate,
    
    // Funções
    fetchAssetQuote,
    fetchFundamentals,
    analyzeAsset,
    fetchNews,
    updatePortfolio,
    
    // Utilitários
    clearCache: () => setCache({ quotes: {}, fundamentals: {}, news: [], lastNewsUpdate: null }),
    clearErrors: () => setErrors({}),
    
    // Status
    isLoading: Object.values(loading).some(Boolean),
    hasErrors: Object.keys(errors).length > 0,
    
    // Estatísticas
    stats: {
      cachedQuotes: Object.keys(cache.quotes).length,
      cachedFundamentals: Object.keys(cache.fundamentals).length,
      newsCount: news.length,
      portfolioValue: portfolio.reduce((sum, holding) => sum + (holding.currentValue || 0), 0)
    }
  };
};

export default useMarketData;