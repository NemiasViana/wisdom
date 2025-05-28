// services/alphaVantageService.js
class AlphaVantageService {
  constructor() {
    this.apiKey = 'T6GSJQ624E32PC44';
    this.baseUrl = 'https://www.alphavantage.co/query';
    this.cache = new Map();
    this.rateLimitDelay = 12000; // 12 segundos entre requisições (5 por minuto)
    this.lastRequest = 0;
  }

  // Rate limiting para respeitar limites da API
  async rateLimitedRequest(url) {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: aguardando ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequest = Date.now();
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('🚨 Alpha Vantage API Error:', error);
      throw error;
    }
  }

  // Cache inteligente com TTL
  getCachedData(key, ttlMinutes = 5) {
    const cached = this.cache.get(key);
    if (cached) {
      const isExpired = (Date.now() - cached.timestamp) > (ttlMinutes * 60 * 1000);
      if (!isExpired) {
        console.log(`📦 Cache hit para ${key}`);
        return cached.data;
      } else {
        this.cache.delete(key);
      }
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // 1. DADOS DE AÇÕES BRASILEIRAS
  async getStockQuote(symbol) {
    // Ajustar símbolo para formato Alpha Vantage (ex: PETR4.SAO)
    const formattedSymbol = this.formatBrazilianSymbol(symbol);
    const cacheKey = `quote_${formattedSymbol}`;
    
    // Verificar cache primeiro
    const cached = this.getCachedData(cacheKey, 1); // 1 minuto TTL
    if (cached) return cached;

    const url = `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${formattedSymbol}&apikey=${this.apiKey}`;
    
    try {
      const data = await this.rateLimitedRequest(url);
      
      if (data['Error Message'] || data['Note']) {
        throw new Error(data['Error Message'] || data['Note']);
      }

      const quote = data['Global Quote'];
      if (!quote) {
        throw new Error('Dados não encontrados para o símbolo');
      }

      const result = {
        symbol: symbol,
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: quote['10. change percent'].replace('%', ''),
        volume: parseInt(quote['06. volume']),
        previousClose: parseFloat(quote['08. previous close']),
        open: parseFloat(quote['02. open']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        lastUpdated: quote['07. latest trading day'],
        timestamp: new Date().toISOString()
      };

      this.setCachedData(cacheKey, result);
      console.log(`✅ Quote obtida para ${symbol}:`, result);
      return result;

    } catch (error) {
      console.error(`🚨 Erro ao obter quote para ${symbol}:`, error.message);
      throw error;
    }
  }

  // 2. DADOS FUNDAMENTALISTAS
  async getCompanyOverview(symbol) {
    const formattedSymbol = this.formatBrazilianSymbol(symbol);
    const cacheKey = `overview_${formattedSymbol}`;
    
    const cached = this.getCachedData(cacheKey, 60); // 60 minutos TTL
    if (cached) return cached;

    const url = `${this.baseUrl}?function=OVERVIEW&symbol=${formattedSymbol}&apikey=${this.apiKey}`;
    
    try {
      const data = await this.rateLimitedRequest(url);
      
      if (data['Error Message'] || data['Note']) {
        throw new Error(data['Error Message'] || data['Note']);
      }

      const result = {
        symbol: symbol,
        name: data['Name'],
        sector: data['Sector'],
        industry: data['Industry'],
        marketCap: parseFloat(data['MarketCapitalization']),
        pe: parseFloat(data['PERatio']) || null,
        peg: parseFloat(data['PEGRatio']) || null,
        pb: parseFloat(data['PriceToBookRatio']) || null,
        ev: parseFloat(data['EVToRevenue']) || null,
        roe: parseFloat(data['ReturnOnEquityTTM']) || null,
        roa: parseFloat(data['ReturnOnAssetsTTM']) || null,
        dividendYield: parseFloat(data['DividendYield']) || null,
        beta: parseFloat(data['Beta']) || null,
        eps: parseFloat(data['EPS']) || null,
        revenue: parseFloat(data['RevenueTTM']) || null,
        grossProfit: parseFloat(data['GrossProfitTTM']) || null,
        description: data['Description'],
        timestamp: new Date().toISOString()
      };

      this.setCachedData(cacheKey, result);
      console.log(`✅ Overview obtido para ${symbol}`);
      return result;

    } catch (error) {
      console.error(`🚨 Erro ao obter overview para ${symbol}:`, error.message);
      throw error;
    }
  }

  // 3. HISTÓRICO DE PREÇOS
  async getDailyPrices(symbol, outputSize = 'compact') {
    const formattedSymbol = this.formatBrazilianSymbol(symbol);
    const cacheKey = `daily_${formattedSymbol}_${outputSize}`;
    
    const cached = this.getCachedData(cacheKey, 15); // 15 minutos TTL
    if (cached) return cached;

    const url = `${this.baseUrl}?function=TIME_SERIES_DAILY&symbol=${formattedSymbol}&outputsize=${outputSize}&apikey=${this.apiKey}`;
    
    try {
      const data = await this.rateLimitedRequest(url);
      
      if (data['Error Message'] || data['Note']) {
        throw new Error(data['Error Message'] || data['Note']);
      }

      const timeSeries = data['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error('Dados históricos não encontrados');
      }

      const result = {
        symbol: symbol,
        prices: Object.entries(timeSeries).map(([date, values]) => ({
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume'])
        })).sort((a, b) => new Date(a.date) - new Date(b.date)),
        timestamp: new Date().toISOString()
      };

      this.setCachedData(cacheKey, result);
      console.log(`✅ Histórico obtido para ${symbol}: ${result.prices.length} dias`);
      return result;

    } catch (error) {
      console.error(`🚨 Erro ao obter histórico para ${symbol}:`, error.message);
      throw error;
    }
  }

  // 4. INDICADORES TÉCNICOS
  async getTechnicalIndicator(symbol, indicator, timePeriod = 14, seriesType = 'close') {
    const formattedSymbol = this.formatBrazilianSymbol(symbol);
    const cacheKey = `${indicator}_${formattedSymbol}_${timePeriod}`;
    
    const cached = this.getCachedData(cacheKey, 10); // 10 minutos TTL
    if (cached) return cached;

    const url = `${this.baseUrl}?function=${indicator}&symbol=${formattedSymbol}&interval=daily&time_period=${timePeriod}&series_type=${seriesType}&apikey=${this.apiKey}`;
    
    try {
      const data = await this.rateLimitedRequest(url);
      
      if (data['Error Message'] || data['Note']) {
        throw new Error(data['Error Message'] || data['Note']);
      }

      // Diferentes indicadores têm diferentes chaves de retorno
      const indicatorKey = Object.keys(data).find(key => key.includes('Technical Analysis'));
      if (!indicatorKey) {
        throw new Error('Dados do indicador não encontrados');
      }

      const indicatorData = data[indicatorKey];
      const result = {
        symbol: symbol,
        indicator: indicator,
        timePeriod: timePeriod,
        data: Object.entries(indicatorData).map(([date, values]) => ({
          date,
          value: parseFloat(Object.values(values)[0])
        })).sort((a, b) => new Date(a.date) - new Date(b.date)),
        timestamp: new Date().toISOString()
      };

      this.setCachedData(cacheKey, result);
      console.log(`✅ Indicador ${indicator} obtido para ${symbol}`);
      return result;

    } catch (error) {
      console.error(`🚨 Erro ao obter ${indicator} para ${symbol}:`, error.message);
      throw error;
    }
  }

  // 5. DADOS DE CRIPTOMOEDAS
  async getCryptoQuote(symbol) {
    const cacheKey = `crypto_${symbol}`;
    const cached = this.getCachedData(cacheKey, 2); // 2 minutos TTL
    if (cached) return cached;

    const url = `${this.baseUrl}?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol}&to_currency=USD&apikey=${this.apiKey}`;
    
    try {
      const data = await this.rateLimitedRequest(url);
      
      if (data['Error Message'] || data['Note']) {
        throw new Error(data['Error Message'] || data['Note']);
      }

      const exchangeRate = data['Realtime Currency Exchange Rate'];
      if (!exchangeRate) {
        throw new Error('Dados de crypto não encontrados');
      }

      const result = {
        symbol: symbol,
        price: parseFloat(exchangeRate['5. Exchange Rate']),
        fromCurrency: exchangeRate['1. From_Currency Code'],
        toCurrency: exchangeRate['3. To_Currency Code'],
        lastRefreshed: exchangeRate['6. Last Refreshed'],
        timezone: exchangeRate['7. Time Zone'],
        timestamp: new Date().toISOString()
      };

      this.setCachedData(cacheKey, result);
      console.log(`✅ Crypto quote obtida para ${symbol}:`, result);
      return result;

    } catch (error) {
      console.error(`🚨 Erro ao obter crypto quote para ${symbol}:`, error.message);
      throw error;
    }
  }

  // UTILIDADES
  formatBrazilianSymbol(symbol) {
    // Converter PETR4 para PETR4.SAO (formato Alpha Vantage para B3)
    if (symbol.match(/^[A-Z]{4}[0-9]{1,2}$/)) {
      return `${symbol}.SAO`;
    }
    return symbol;
  }

  // Método para obter múltiplos ativos de uma vez
  async getBatchQuotes(symbols) {
    console.log(`🔄 Obtendo quotes para ${symbols.length} ativos...`);
    const results = {};
    
    for (const symbol of symbols) {
      try {
        results[symbol] = await this.getStockQuote(symbol);
        console.log(`✅ ${symbol} processado`);
      } catch (error) {
        console.error(`❌ Erro em ${symbol}:`, error.message);
        results[symbol] = { error: error.message };
      }
    }
    
    return results;
  }

  // Análise consolidada para os mestres
  async getComprehensiveAnalysis(symbol) {
    console.log(`🧠 Iniciando análise completa para ${symbol}...`);
    
    try {
      const [quote, overview, prices, rsi, sma] = await Promise.allSettled([
        this.getStockQuote(symbol),
        this.getCompanyOverview(symbol),
        this.getDailyPrices(symbol),
        this.getTechnicalIndicator(symbol, 'RSI'),
        this.getTechnicalIndicator(symbol, 'SMA', 20)
      ]);

      const result = {
        symbol: symbol,
        quote: quote.status === 'fulfilled' ? quote.value : null,
        fundamentals: overview.status === 'fulfilled' ? overview.value : null,
        prices: prices.status === 'fulfilled' ? prices.value : null,
        technicals: {
          rsi: rsi.status === 'fulfilled' ? rsi.value : null,
          sma20: sma.status === 'fulfilled' ? sma.value : null
        },
        analysisTimestamp: new Date().toISOString(),
        errors: [quote, overview, prices, rsi, sma]
          .filter(result => result.status === 'rejected')
          .map(result => result.reason.message)
      };

      console.log(`✅ Análise completa finalizada para ${symbol}`);
      return result;

    } catch (error) {
      console.error(`🚨 Erro na análise completa para ${symbol}:`, error.message);
      throw error;
    }
  }

  // Status da API
  getStatus() {
    return {
      cacheSize: this.cache.size,
      lastRequest: new Date(this.lastRequest).toISOString(),
      rateLimitDelay: this.rateLimitDelay,
      apiKey: this.apiKey.slice(0, 8) + '...'
    };
  }

  // Limpar cache
  clearCache() {
    this.cache.clear();
    console.log('🧹 Cache limpo');
  }
}

// Instância singleton
const alphaVantageService = new AlphaVantageService();

// Exemplo de uso:
export default alphaVantageService;

/* 
EXEMPLO DE USO NO COMPONENTE REACT:

import alphaVantageService from '../services/alphaVantageService';

// Em um componente React
const [stockData, setStockData] = useState(null);
const [loading, setLoading] = useState(false);

const fetchStockData = async (symbol) => {
  setLoading(true);
  try {
    const data = await alphaVantageService.getComprehensiveAnalysis(symbol);
    setStockData(data);
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    setLoading(false);
  }
};

// Para múltiplos ativos (portfolio)
const fetchPortfolioData = async () => {
  const symbols = ['PETR4', 'ITUB4', 'BPAC11'];
  const data = await alphaVantageService.getBatchQuotes(symbols);
  return data;
};
*/