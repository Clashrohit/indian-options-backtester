// Black-Scholes for Option Pricing
class OptionPricer {
  static normalCDF(x) {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - prob : prob;
  }

  static blackScholes(S, K, T, r, sigma, type = 'call') {
    if (T <= 0) return type === 'call' ? Math.max(S - K, 0) : Math.max(K - S, 0);
    
    const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    
    if (type === 'call') {
      return S * this.normalCDF(d1) - K * Math.exp(-r * T) * this.normalCDF(d2);
    } else {
      return K * Math.exp(-r * T) * this.normalCDF(-d2) - S * this.normalCDF(-d1);
    }
  }

  static calculateGreeks(S, K, T, r, sigma, type = 'call') {
    const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    
    const delta = type === 'call' ? this.normalCDF(d1) : this.normalCDF(d1) - 1;
    const gamma = Math.exp(-d1 * d1 / 2) / (S * sigma * Math.sqrt(2 * Math.PI * T));
    const vega = S * Math.sqrt(T) * Math.exp(-d1 * d1 / 2) / Math.sqrt(2 * Math.PI);
    const theta = type === 'call' 
      ? -(S * sigma * Math.exp(-d1 * d1 / 2)) / (2 * Math.sqrt(2 * Math.PI * T)) - r * K * Math.exp(-r * T) * this.normalCDF(d2)
      : -(S * sigma * Math.exp(-d1 * d1 / 2)) / (2 * Math.sqrt(2 * Math.PI * T)) + r * K * Math.exp(-r * T) * this.normalCDF(-d2);
    
    return { delta, gamma, vega: vega / 100, theta: theta / 365 };
  }
}

class BacktestEngine {
  constructor(config) {
    this.config = {
      initialCapital: config.initialCapital || 100000,
      riskFreeRate: config.riskFreeRate || 0.06,
      lotSize: config.lotSize || 50,
      ...config
    };
    this.trades = [];
    this.portfolio = [];
    this.equity = [this.config.initialCapital];
    this.currentCapital = this.config.initialCapital;
  }

  async run(strategy, marketData) {
    const results = {
      trades: [],
      equity: [],
      metrics: {},
      dailyPnL: []
    };

    for (let i = 0; i < marketData.length; i++) {
      const currentBar = marketData[i];
      const historicalData = marketData.slice(0, i + 1);
      
      this.updatePositions(currentBar);
      const signals = strategy.generateSignals(historicalData, currentBar);
      
      if (signals && signals.length > 0) {
        for (const signal of signals) {
          this.executeTrade(signal, currentBar);
        }
      }
      
      this.checkExits(currentBar, strategy);
      
      const currentEquity = this.calculateEquity(currentBar);
      results.equity.push({
        date: currentBar.date,
        value: currentEquity,
        positions: this.portfolio.length
      });
      
      results.dailyPnL.push({
        date: currentBar.date,
        pnl: currentEquity - (results.equity[i - 1]?.value || this.config.initialCapital)
      });
    }

    results.trades = this.trades;
    results.metrics = this.calculateMetrics(results);
    
    return results;
  }

  executeTrade(signal, currentBar) {
    const { type, strike, optionType, action, quantity } = signal;
    
    const timeToExpiry = this.calculateTimeToExpiry(currentBar.date, signal.expiry);
    const iv = currentBar.iv || 0.15;
    
    const optionPrice = OptionPricer.blackScholes(
      currentBar.close,
      strike,
      timeToExpiry,
      this.config.riskFreeRate,
      iv,
      optionType
    );
    
    const greeks = OptionPricer.calculateGreeks(
      currentBar.close,
      strike,
      timeToExpiry,
      this.config.riskFreeRate,
      iv,
      optionType
    );
    
    const lotSize = this.config.lotSize;
    const totalCost = optionPrice * quantity * lotSize;
    
    if (action === 'BUY' && totalCost > this.currentCapital) {
      return;
    }
    
    const trade = {
      id: Date.now() + Math.random(),
      entryDate: currentBar.date,
      entryPrice: optionPrice,
      strike,
      optionType,
      action,
      quantity,
      lotSize,
      underlyingPrice: currentBar.close,
      expiry: signal.expiry,
      greeks,
      status: 'OPEN'
    };
    
    this.portfolio.push(trade);
    this.currentCapital -= action === 'BUY' ? totalCost : -totalCost;
    
    this.trades.push({
      ...trade,
      type: 'ENTRY'
    });
  }

  updatePositions(currentBar) {
    this.portfolio = this.portfolio.map(position => {
      const timeToExpiry = this.calculateTimeToExpiry(currentBar.date, position.expiry);
      const iv = currentBar.iv || 0.15;
      
      const currentPrice = OptionPricer.blackScholes(
        currentBar.close,
        position.strike,
        timeToExpiry,
        this.config.riskFreeRate,
        iv,
        position.optionType
      );
      
      const greeks = OptionPricer.calculateGreeks(
        currentBar.close,
        position.strike,
        timeToExpiry,
        this.config.riskFreeRate,
        iv,
        position.optionType
      );
      
      return {
        ...position,
        currentPrice,
        greeks,
        pnl: (currentPrice - position.entryPrice) * position.quantity * position.lotSize * (position.action === 'BUY' ? 1 : -1)
      };
    });
  }

  checkExits(currentBar, strategy) {
    this.portfolio = this.portfolio.filter(position => {
      const shouldExit = strategy.checkExit(position, currentBar);
      
      if (shouldExit || this.calculateTimeToExpiry(currentBar.date, position.expiry) <= 0) {
        const exitPrice = position.currentPrice;
        const pnl = (exitPrice - position.entryPrice) * position.quantity * position.lotSize * (position.action === 'BUY' ? 1 : -1);
        
        this.currentCapital += position.action === 'BUY' 
          ? exitPrice * position.quantity * position.lotSize
          : -exitPrice * position.quantity * position.lotSize;
        
        this.trades.push({
          ...position,
          type: 'EXIT',
          exitDate: currentBar.date,
          exitPrice,
          pnl,
          returns: (pnl / (position.entryPrice * position.quantity * position.lotSize)) * 100
        });
        
        return false;
      }
      
      return true;
    });
  }

  calculateEquity(currentBar) {
    const positionsValue = this.portfolio.reduce((sum, pos) => {
      return sum + (pos.currentPrice * pos.quantity * pos.lotSize * (pos.action === 'BUY' ? 1 : -1));
    }, 0);
    
    return this.currentCapital + positionsValue;
  }

  calculateTimeToExpiry(currentDate, expiryDate) {
    const current = new Date(currentDate);
    const expiry = new Date(expiryDate);
    const diffTime = expiry - current;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return Math.max(diffDays / 365, 0);
  }

  calculateMetrics(results) {
    const trades = this.trades.filter(t => t.type === 'EXIT');
    const winningTrades = trades.filter(t => t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl < 0);
    
    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
    const totalReturn = ((results.equity[results.equity.length - 1].value - this.config.initialCapital) / this.config.initialCapital) * 100;
    
    const equityValues = results.equity.map(e => e.value);
    const maxDrawdown = Math.min(...equityValues.map((val, i) => {
      const runningPeak = Math.max(...equityValues.slice(0, i + 1));
      return ((val - runningPeak) / runningPeak) * 100;
    }));
    
    const dailyReturns = results.dailyPnL.map(d => d.pnl / this.config.initialCapital);
    const avgDailyReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const stdDev = Math.sqrt(dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgDailyReturn, 2), 0) / dailyReturns.length);
    const sharpeRatio = (avgDailyReturn * 252) / (stdDev * Math.sqrt(252));
    
    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: (winningTrades.length / trades.length) * 100 || 0,
      totalPnL,
      totalReturn,
      maxDrawdown,
      sharpeRatio,
      avgWin: winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0,
      avgLoss: losingTrades.length > 0 ? losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length : 0,
      profitFactor: losingTrades.length > 0 
        ? Math.abs(winningTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.reduce((sum, t) => sum + t.pnl, 0))
        : Infinity
    };
  }
}

export { BacktestEngine, OptionPricer };