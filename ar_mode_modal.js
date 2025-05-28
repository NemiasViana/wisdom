// components/modals/ARMode.jsx
import React, { useState, useEffect } from 'react';
import { 
  Glasses, X, RotateCw, ZoomIn, ZoomOut, Move3D, Eye,
  BarChart3, PieChart, Activity, Zap, Target, Globe,
  Brain, Sparkles, Crown, Diamond, Gem, Star,
  TrendingUp, TrendingDown, DollarSign
} from 'lucide-react';

const ARMode = ({ portfolioStats, onClose }) => {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [activeView, setActiveView] = useState('portfolio'); // portfolio, analytics, prediction
  const [isAnimating, setIsAnimating] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState(null);

  // Mock data para demonstração
  const holographicData = {
    portfolio: {
      totalValue: portfolioStats?.currentValue || 250000,
      totalReturn: portfolioStats?.returnPercentage || 15.3,
      positions: [
        { symbol: 'PETR4', allocation: 25, value: 62500, gain: 18.5, color: '#10b981' },
        { symbol: 'ITUB4', allocation: 20, value: 50000, gain: 12.3, color: '#3b82f6' },
        { symbol: 'BPAC11', allocation: 15, value: 37500, gain: 22.1, color: '#8b5cf6' },
        { symbol: 'HGLG11', allocation: 12, value: 30000, gain: 8.7, color: '#f59e0b' },
        { symbol: 'BTCUSD', allocation: 10, value: 25000, gain: 45.2, color: '#ef4444' },
        { symbol: 'TOTS3', allocation: 8, value: 20000, gain: 28.9, color: '#06b6d4' },
        { symbol: 'Others', allocation: 10, value: 25000, gain: 5.1, color: '#6b7280' }
      ]
    },
    analytics: {
      aiConfidence: 94.2,
      riskScore: 7.8,
      diversificationIndex: 8.5,
      esgScore: 82.3,
      volatility: 14.2,
      sharpeRatio: 1.67
    },
    predictions: {
      nextMonth: '+3.2%',
      nextQuarter: '+8.7%',
      nextYear: '+18.4%',
      confidence: 87.3
    }
  };

  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setRotation(prev => (prev + 1) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAnimating]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const HolographicCircle = ({ data, centerContent }) => (
    <div className="relative w-80 h-80 mx-auto">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-full blur-xl animate-pulse"></div>
      
      {/* Main circle */}
      <div 
        className="relative w-full h-full rounded-full border-2 border-cyan-400/50 backdrop-blur-md"
        style={{ 
          transform: `rotateY(${rotation}deg) scale(${zoom})`,
          background: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.1), rgba(139, 92, 246, 0.1))'
        }}
      >
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {centerContent}
          </div>
        </div>
        
        {/* Floating data points */}
        {data.map((item, index) => {
          const angle = (360 / data.length) * index;
          const radius = 120;
          const x = Math.cos(angle * Math.PI / 180) * radius;
          const y = Math.sin(angle * Math.PI / 180) * radius;
          
          return (
            <div
              key={index}
              className="absolute w-20 h-20 -ml-10 -mt-10 cursor-pointer transform hover:scale-125 transition-all duration-300"
              style={{ 
                left: '50%', 
                top: '50%',
                transform: `translate(${x}px, ${y}px) rotateY(${-rotation}deg)`
              }}
              onClick={() => setSelectedMetric(item)}
            >
              <div 
                className="w-full h-full rounded-full border border-white/30 flex flex-col items-center justify-center text-center relative group"
                style={{ backgroundColor: `${item.color}20` }}
              >
                {/* Glow effect */}
                <div 
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-50 transition-opacity"
                  style={{ backgroundColor: item.color, filter: 'blur(8px)' }}
                ></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="text-xs font-bold text-white mb-1">{item.symbol}</div>
                  <div className="text-xs" style={{ color: item.color }}>
                    {typeof item.value === 'number' ? formatCurrency(item.value) : item.value}
                  </div>
                  {item.gain && (
                    <div className={`text-xs font-bold ${item.gain > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {item.gain > 0 ? '+' : ''}{item.gain}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const MetricCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-black/30 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer group">
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-6 h-6" style={{ color }} />
        <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform">
          {value}
        </div>
      </div>
      <div className="text-sm font-medium text-gray-300">{title}</div>
      {description && (
        <div className="text-xs text-gray-400 mt-1">{description}</div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-cyan-900/95 rounded-3xl p-10 border border-white/20 shadow-2xl max-w-6xl w-full mx-4 relative overflow-hidden">
        
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #06b6d4 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, #8b5cf6 2px, transparent 2px)`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        {/* Header */}
        <div className="relative z-10 text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Glasses className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                AR Investment Vision
              </h2>
              <p className="text-white/80 text-lg">Visualização holográfica dos seus investimentos</p>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-0 right-0 p-3 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="relative z-10 flex items-center justify-center space-x-4 mb-8">
          <div className="flex bg-black/30 rounded-xl p-1">
            {[
              { id: 'portfolio', label: 'Portfolio', icon: PieChart },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'prediction', label: 'Prediction', icon: Brain }
            ].map(view => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                  activeView === view.id
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <view.icon className="w-4 h-4" />
                <span>{view.label}</span>
              </button>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`p-2 rounded-lg transition-all ${
                isAnimating 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-gray-500/20 text-gray-400 hover:text-white'
              }`}
              title={isAnimating ? "Pause animation" : "Start animation"}
            >
              <RotateCw className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-2 rounded-lg bg-black/30 text-white/60 hover:text-white transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
              className="p-2 rounded-lg bg-black/30 text-white/60 hover:text-white transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          {activeView === 'portfolio' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Holographic Portfolio */}
              <div className="lg:col-span-2">
                <HolographicCircle 
                  data={holographicData.portfolio.positions}
                  centerContent={
                    <div>
                      <div className="text-4xl font-black text-cyan-400 mb-2">
                        {formatCurrency(holographicData.portfolio.totalValue)}
                      </div>
                      <div className="text-lg text-white/80 mb-1">Portfolio Total</div>
                      <div className="text-2xl font-bold text-green-400">
                        +{holographicData.portfolio.totalReturn}%
                      </div>
                      <div className="flex items-center justify-center space-x-2 mt-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-sm text-amber-400">AI Optimized</span>
                      </div>
                    </div>
                  }
                />
              </div>
              
              {/* Stats */}
              <div className="space-y-4">
                <MetricCard
                  title="AI Confidence"
                  value="94.2%"
                  icon={Brain}
                  color="#06b6d4"
                  description="Alto nível de confiança"
                />
                <MetricCard
                  title="Total Positions"
                  value={holographicData.portfolio.positions.length - 1}
                  icon={Target}
                  color="#8b5cf6"
                  description="Diversificação ativa"
                />
                <MetricCard
                  title="Best Performer"
                  value="BTCUSD"
                  icon={Crown}
                  color="#eab308"
                  description="+45.2% de retorno"
                />
                <MetricCard
                  title="Risk Score"
                  value="7.8/10"
                  icon={Shield}
                  color="#ef4444"
                  description="Risco controlado"
                />
              </div>
            </div>
          )}

          {activeView === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <HolographicCircle 
                  data={[
                    { symbol: 'AI Confidence', value: '94.2%', color: '#06b6d4' },
                    { symbol: 'Risk Score', value: '7.8', color: '#ef4444' },
                    { symbol: 'Diversification', value: '8.5', color: '#10b981' },
                    { symbol: 'ESG Score', value: '82.3', color: '#22c55e' },
                    { symbol: 'Volatility', value: '14.2%', color: '#f59e0b' },
                    { symbol: 'Sharpe Ratio', value: '1.67', color: '#8b5cf6' }
                  ]}
                  centerContent={
                    <div>
                      <div className="text-3xl font-black text-purple-400 mb-2">
                        ANALYTICS
                      </div>
                      <div className="text-lg text-white/80 mb-1">Real-time Insights</div>
                      <div className="flex items-center justify-center space-x-2">
                        <Activity className="w-5 h-5 text-green-400" />
                        <span className="text-green-400">All Systems Optimal</span>
                      </div>
                    </div>
                  }
                />
              </div>
              
              <div className="space-y-4">
                <MetricCard
                  title="Performance Score"
                  value="A+"
                  icon={Star}
                  color="#eab308"
                  description="Excelente performance"
                />
                <MetricCard
                  title="Optimization Level"
                  value="97%"
                  icon={Zap}
                  color="#06b6d4"
                  description="Altamente otimizado"
                />
                <MetricCard
                  title="Market Sync"
                  value="Real-time"
                  icon={Globe}
                  color="#10b981"
                  description="Dados ao vivo"
                />
                <MetricCard
                  title="Predictive Power"
                  value="92.1%"
                  icon={Eye}
                  color="#8b5cf6"
                  description="Alta precisão"
                />
              </div>
            </div>
          )}

          {activeView === 'prediction' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <HolographicCircle 
                  data={[
                    { symbol: 'Next Month', value: '+3.2%', color: '#10b981', gain: 3.2 },
                    { symbol: 'Next Quarter', value: '+8.7%', color: '#06b6d4', gain: 8.7 },
                    { symbol: 'Next Year', value: '+18.4%', color: '#8b5cf6', gain: 18.4 },
                    { symbol: 'Confidence', value: '87.3%', color: '#eab308' }
                  ]}
                  centerContent={
                    <div>
                      <div className="text-3xl font-black text-emerald-400 mb-2">
                        PREDICTIONS
                      </div>
                      <div className="text-lg text-white/80 mb-1">AI Forecasting</div>
                      <div className="text-xl font-bold text-green-400">
                        High Growth Expected
                      </div>
                      <div className="flex items-center justify-center space-x-2 mt-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">Bullish Trend</span>
                      </div>
                    </div>
                  }
                />
              </div>
              
              <div className="space-y-4">
                <MetricCard
                  title="Prediction Accuracy"
                  value="87.3%"
                  icon={Target}
                  color="#06b6d4"
                  description="Alta precisão histórica"
                />
                <MetricCard
                  title="Market Sentiment"
                  value="Bullish"
                  icon={TrendingUp}
                  color="#10b981"
                  description="Tendência positiva"
                />
                <MetricCard
                  title="Risk Forecast"
                  value="Low"
                  icon={Shield}
                  color="#22c55e"
                  description="Baixo risco projetado"
                />
                <MetricCard
                  title="AI Consensus"
                  value="Buy"
                  icon={CheckCircle}
                  color="#eab308"
                  description="Recomendação forte"
                />
              </div>
            </div>
          )}
        </div>

        {/* Selected Metric Detail */}
        {selectedMetric && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white">{selectedMetric.symbol}</h4>
              <button
                onClick={() => setSelectedMetric(null)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Value:</span>
                <span className="text-white font-medium">{selectedMetric.value}</span>
              </div>
              {selectedMetric.gain && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Performance:</span>
                  <span className={`font-medium ${selectedMetric.gain > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedMetric.gain > 0 ? '+' : ''}{selectedMetric.gain}%
                  </span>
                </div>
              )}
              {selectedMetric.allocation && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Allocation:</span>
                  <span className="text-blue-400 font-medium">{selectedMetric.allocation}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="relative z-10 text-center mt-8 pt-6 border-t border-white/10">
          <p className="text-white/60 text-sm">
            🥽 AR Mode ativo • Dados em tempo real • Powered by WisdomAI
          </p>
        </div>
      </div>
    </div>
  );
};

export default ARMode;