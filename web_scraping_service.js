// services/webScrapingService.js
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');

class WebScrapingService {
  constructor() {
    this.browser = null;
    this.cache = new Map();
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.delay = 2000; // 2 segundos entre requests
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-features=VizDisplayCompositor',
        ],
      });
      console.log('🚀 Browser Puppeteer iniciado');
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('🔚 Browser fechado');
    }
  }

  // Utilitário para delay
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Cache com TTL
  getCachedData(key, ttlMinutes = 30) {
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

  // ===== STATUS INVEST SCRAPING =====
  async scrapeStatusInvest(symbol) {
    const cacheKey = `status_invest_${symbol}`;
    const cached = this.getCachedData(cacheKey, 15); // 15 min cache
    if (cached) return cached;

    console.log(`🔍 Scraping Status Invest para ${symbol}...`);
    
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      // Configurar page
      await page.setUserAgent(this.userAgent);
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Interceptar requests para bloquear ads/imagens
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const resourceType = request.resourceType();
        if (['image', 'stylesheet', 'font'].includes(resourceType)) {
          request.abort();
        } else {
          request.continue();
        }
      });

      const url = `https://statusinvest.com.br/acoes/${symbol.toLowerCase()}`;
      console.log(`📄 Navegando para: ${url}`);
      
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Aguardar carregamento dos dados
      await page.waitForSelector('.top-info', { timeout: 10000 });
      await this.sleep(3000);

      // Extrair dados fundamentalistas
      const data = await page.evaluate(() => {
        const getText = (selector) => {
          const element = document.querySelector(selector);
          return element ? element.textContent.trim() : null;
        };

        const getValue = (selector) => {
          const text = getText(selector);
          if (!text || text === '-') return null;
          
          // Converter percentuais
          if (text.includes('%')) {
            return parseFloat(text.replace('%', '').replace(',', '.'));
          }
          
          // Converter valores monetários
          if (text.includes('R$')) {
            return parseFloat(text.replace('R$', '').replace(/\./g, '').replace(',', '.'));
          }
          
          // Números normais
          return parseFloat(text.replace(',', '.')) || null;
        };

        return {
          // Preço e variação
          currentPrice: getValue('.value'),
          change: getValue('.percentage'),
          
          // Dividend Yield
          dividendYield: getValue('[title="Dividend Yield"]'),
          
          // Múltiplos de avaliação
          pe: getValue('[title="Preço por Lucro"]'),
          pvp: getValue('[title="Preço por Valor Patrimonial por Ação"]'),
          psr: getValue('[title="Preço por Receita"]'),
          pAtivos: getValue('[title="Preço por Ativos"]'),
          pCapGiro: getValue('[title="Preço por Capital de Giro"]'),
          pEbit: getValue('[title="Preço por EBIT"]'),
          pAtivCircLiq: getValue('[title="Preço por Ativo Circulante Líquido"]'),
          evEbit: getValue('[title="Enterprise Value por EBIT"]'),
          evEbitda: getValue('[title="Enterprise Value por EBITDA"]'),
          
          // Indicadores de eficiência
          roe: getValue('[title="Retorno sobre Patrimônio Líquido"]'),
          roa: getValue('[title="Retorno sobre Ativos"]'),
          roic: getValue('[title="Retorno sobre Capital Investido"]'),
          giroAtivos: getValue('[title="Giro dos Ativos"]'),
          
          // Indicadores de endividamento
          divBrPatLiq: getValue('[title="Dívida Bruta/Patrimônio Líquido"]'),
          divLiqPatLiq: getValue('[title="Dívida Líquida/Patrimônio Líquido"]'),
          divLiqEbit: getValue('[title="Dívida Líquida/EBITDA"]'),
          patLiqAtivos: getValue('[title="Patrimônio Líquido/Ativos"]'),
          
          // Indicadores de crescimento
          cagr5Anos: getValue('[title="CAGR Receitas 5 Anos"]'),
          
          // Indicadores de rentabilidade
          margemBruta: getValue('[title="Margem Bruta"]'),
          margemEbitda: getValue('[title="Margem EBITDA"]'),
          margemEbit: getValue('[title="Margem EBIT"]'),
          margemLiquida: getValue('[title="Margem Líquida"]'),
          
          // VPA e LPA
          vpa: getValue('[title="Valor Patrimonial por Ação"]'),
          lpa: getValue('[title="Lucro por Ação"]'),
          
          // Market Cap
          valorMercado: getValue('[title="Valor de Mercado"]'),
          
          // Graham Score (calculado posteriormente)
          grahamScore: null
        };
      });

      await page.close();

      // Calcular Graham Score
      data.grahamScore = this.calculateGrahamScore(data);
      
      // Adicionar metadados
      const result = {
        symbol: symbol.toUpperCase(),
        source: 'Status Invest',
        data: data,
        timestamp: new Date().toISOString(),
        url: url
      };

      this.setCachedData(cacheKey, result);
      console.log(`✅ Status Invest scraping concluído para ${symbol}`);
      return result;

    } catch (error) {
      console.error(`🚨 Erro no scraping Status Invest para ${symbol}:`, error.message);
      throw error;
    }
  }

  // ===== INVESTING.COM SCRAPING =====
  async scrapeInvestingNews(limit = 10) {
    const cacheKey = 'investing_news';
    const cached = this.getCachedData(cacheKey, 5); // 5 min cache
    if (cached) return cached;

    console.log('📰 Scraping notícias do Investing.com...');
    
    try {
      const response = await axios.get('https://br.investing.com/news/stock-market-news', {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.8,en;q=0.5,en-US;q=0.3'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const news = [];

      $('.largeTitle article').slice(0, limit).each((index, element) => {
        const $article = $(element);
        
        const title = $article.find('.title').text().trim();
        const summary = $article.find('.textDiv').text().trim();
        const timeAgo = $article.find('.date').text().trim();
        const link = $article.find('a').attr('href');
        
        if (title && summary) {
          news.push({
            id: `investing_${index}_${Date.now()}`,
            title: title,
            summary: summary.substring(0, 200) + '...',
            source: 'Investing.com',
            timeAgo: timeAgo,
            url: link ? `https://br.investing.com${link}` : null,
            sentiment: this.analyzeSentiment(title + ' ' + summary),
            timestamp: new Date().toISOString()
          });
        }
      });

      const result = {
        news: news,
        totalCount: news.length,
        source: 'Investing.com',
        scrapedAt: new Date().toISOString()
      };

      this.setCachedData(cacheKey, result);
      console.log(`✅ ${news.length} notícias obtidas do Investing.com`);
      return result;

    } catch (error) {
      console.error('🚨 Erro no scraping Investing.com:', error.message);
      throw error;
    }
  }

  // ===== INFOMONEY SCRAPING =====
  async scrapeInfoMoneyNews(limit = 10) {
    const cacheKey = 'infomoney_news';
    const cached = this.getCachedData(cacheKey, 5); // 5 min cache
    if (cached) return cached;

    console.log('📰 Scraping notícias do InfoMoney...');
    
    try {
      const response = await axios.get('https://www.infomoney.com.br/mercados/', {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const news = [];

      $('.IM-widget-post').slice(0, limit).each((index, element) => {
        const $article = $(element);
        
        const title = $article.find('.IM-widget-post-title a').text().trim();
        const summary = $article.find('.IM-widget-post-excerpt').text().trim();
        const link = $article.find('.IM-widget-post-title a').attr('href');
        const category = $article.find('.IM-widget-post-category').text().trim();
        
        if (title) {
          news.push({
            id: `infomoney_${index}_${Date.now()}`,
            title: title,
            summary: summary || 'Resumo não disponível',
            category: category,
            source: 'InfoMoney',
            url: link,
            sentiment: this.analyzeSentiment(title + ' ' + summary),
            timestamp: new Date().toISOString()
          });
        }
      });

      const result = {
        news: news,
        totalCount: news.length,
        source: 'InfoMoney',
        scrapedAt: new Date().toISOString()
      };

      this.setCachedData(cacheKey, result);
      console.log(`✅ ${news.length} notícias obtidas do InfoMoney`);
      return result;

    } catch (error) {
      console.error('🚨 Erro no scraping InfoMoney:', error.message);
      throw error;
    }
  }

  // ===== VALOR ECONÔMICO SCRAPING =====
  async scrapeValorEconomico(limit = 10) {
    const cacheKey = 'valor_economico_news';
    const cached = this.getCachedData(cacheKey, 5); // 5 min cache
    if (cached) return cached;

    console.log('📰 Scraping notícias do Valor Econômico...');
    
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      await page.setUserAgent(this.userAgent);
      await page.goto('https://valor.globo.com/financas/', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      await this.sleep(3000);

      const news = await page.evaluate((limit) => {
        const articles = [];
        const elements = document.querySelectorAll('.feed-post-body');
        
        for (let i = 0; i < Math.min(elements.length, limit); i++) {
          const element = elements[i];
          const titleElement = element.querySelector('.feed-post-link');
          const summaryElement = element.querySelector('.feed-post-summary');
          
          if (titleElement) {
            articles.push({
              title: titleElement.textContent.trim(),
              summary: summaryElement ? summaryElement.textContent.trim() : '',
              url: titleElement.href,
              source: 'Valor Econômico'
            });
          }
        }
        
        return articles;
      }, limit);

      await page.close();

      const result = {
        news: news.map((article, index) => ({
          id: `valor_${index}_${Date.now()}`,
          ...article,
          sentiment: this.analyzeSentiment(article.title + ' ' + article.summary),
          timestamp: new Date().toISOString()
        })),
        totalCount: news.length,
        source: 'Valor Econômico',
        scrapedAt: new Date().toISOString()
      };

      this.setCachedData(cacheKey, result);
      console.log(`✅ ${news.length} notícias obtidas do Valor Econômico`);
      return result;

    } catch (error) {
      console.error('🚨 Erro no scraping Valor Econômico:', error.message);
      throw error;
    }
  }

  // ===== AGREGADOR DE NOTÍCIAS =====
  async getAggregatedNews() {
    console.log('📰 Agregando notícias de múltiplas fontes...');
    
    try {
      const [investing, infomoney, valor] = await Promise.allSettled([
        this.scrapeInvestingNews(5),
        this.scrapeInfoMoneyNews(5),
        this.scrapeValorEconomico(5)
      ]);

      const allNews = [];
      
      if (investing.status === 'fulfilled') {
        allNews.push(...investing.value.news);
      }
      if (infomoney.status === 'fulfilled') {
        allNews.push(...infomoney.value.news);
      }
      if (valor.status === 'fulfilled') {
        allNews.push(...valor.value.news);
      }

      // Ordenar por timestamp (mais recentes primeiro)
      allNews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const result = {
        news: allNews,
        totalCount: allNews.length,
        sources: ['Investing.com', 'InfoMoney', 'Valor Econômico'],
        aggregatedAt: new Date().toISOString()
      };

      console.log(`✅ ${allNews.length} notícias agregadas de ${result.sources.length} fontes`);
      return result;

    } catch (error) {
      console.error('🚨 Erro na agregação de notícias:', error.message);
      throw error;
    }
  }

  // ===== UTILITÁRIOS =====
  
  // Análise de sentimento básica
  analyzeSentiment(text) {
    const positiveWords = [
      'alta', 'subida', 'crescimento', 'lucro', 'ganho', 'melhora', 'positivo',
      'otimismo', 'recuperação', 'expansão', 'valorização', 'boom', 'recorde'
    ];
    
    const negativeWords = [
      'queda', 'baixa', 'crise', 'prejuízo', 'perda', 'declínio', 'negativo',
      'pessimismo', 'recessão', 'desvalorização', 'crash', 'colapso'
    ];

    const lowercaseText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      if (lowercaseText.includes(word)) positiveCount++;
    });

    negativeWords.forEach(word => {
      if (lowercaseText.includes(word)) negativeCount++;
    });

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Calcular Graham Score baseado nos dados do Status Invest
  calculateGrahamScore(data) {
    let score = 0;
    
    // P/L < 15
    if (data.pe && data.pe < 15) score += 15;
    
    // P/VP < 1.5
    if (data.pvp && data.pvp < 1.5) score += 15;
    
    // Dividend Yield > 6%
    if (data.dividendYield && data.dividendYield > 6) score += 15;
    
    // ROE > 15%
    if (data.roe && data.roe > 15) score += 15;
    
    // Margem líquida > 10%
    if (data.margemLiquida && data.margemLiquida > 10) score += 15;
    
    // Dívida líquida/PL < 50%
    if (data.divLiqPatLiq && data.divLiqPatLiq < 50) score += 15;
    
    // Crescimento consistente
    if (data.cagr5Anos && data.cagr5Anos > 5) score += 10;

    return Math.min(score, 100);
  }

  // Status do serviço
  getStatus() {
    return {
      cacheSize: this.cache.size,
      browserActive: !!this.browser,
      lastActivity: new Date().toISOString()
    };
  }

  // Limpeza
  clearCache() {
    this.cache.clear();
    console.log('🧹 Cache do scraping limpo');
  }

  async cleanup() {
    await this.closeBrowser();
    this.clearCache();
    console.log('🧹 Cleanup completo do WebScrapingService');
  }
}

// Instância singleton
const webScrapingService = new WebScrapingService();

// Cleanup no processo exit
process.on('SIGINT', async () => {
  console.log('🔄 Fechando serviços de scraping...');
  await webScrapingService.cleanup();
  process.exit(0);
});

export default webScrapingService;

/*
EXEMPLO DE USO:

import webScrapingService from '../services/webScrapingService';

// Scraping de dados fundamentalistas
const fundamentalData = await webScrapingService.scrapeStatusInvest('PETR4');

// Agregação de notícias
const news = await webScrapingService.getAggregatedNews();

// Dados específicos de uma empresa
const statusData = fundamentalData.data;
console.log('P/L:', statusData.pe);
console.log('Dividend Yield:', statusData.dividendYield);
console.log('Graham Score:', statusData.grahamScore);

// Notícias com sentiment
news.news.forEach(article => {
  console.log(`${article.title} - Sentiment: ${article.sentiment}`);
});
*/