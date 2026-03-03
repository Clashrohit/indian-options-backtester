export class StrategyBase {
  constructor(params = {}) {
    this.params = params;
  }

  generateSignals(historicalData, currentBar) {
    throw new Error('generateSignals must be implemented');
  }

  checkExit(position, currentBar) {
    throw new Error('checkExit must be implemented');
  }

  getNextExpiry(currentDate) {
    const date = new Date(currentDate);
    const daysUntilThursday = (4 - date.getDay() + 7) % 7 || 7;
    date.setDate(date.getDate() + daysUntilThursday);
    return date.toISOString().split('T')[0];
  }
}

export class ShortStraddleStrategy extends StrategyBase {
  constructor(params = {}) {
    super({
      targetProfit: params.targetProfit || 0.5,
      stopLoss: params.stopLoss || 1.5,
      ...params
    });
    this.positionEntered = false;
  }

  generateSignals(historicalData, currentBar) {
    if (this.positionEntered) return [];
    
    const currentPrice = currentBar.close;
    const strike = Math.round(currentPrice / 50) * 50;
    const expiry = this.getNextExpiry(currentBar.date);
    
    const signals = [
      {
        type: 'SHORT_STRADDLE',
        strike,
        optionType: 'call',
        action: 'SELL',
        quantity: 1,
        expiry
      },
      {
        type: 'SHORT_STRADDLE',
        strike,
        optionType: 'put',
        action: 'SELL',
        quantity: 1,
        expiry
      }
    ];
    
    this.positionEntered = true;
    return signals;
  }

  checkExit(position, currentBar) {
    const profitPercent = (position.pnl / (position.entryPrice * position.quantity * position.lotSize)) * 100;
    
    if (profitPercent >= this.params.targetProfit * 100) return true;
    if (profitPercent <= -this.params.stopLoss * 100) return true;
    
    return false;
  }
}

export class IronCondorStrategy extends StrategyBase {
  constructor(params = {}) {
    super({
      wingWidth: params.wingWidth || 200,
      targetProfit: params.targetProfit || 0.5,
      stopLoss: params.stopLoss || 1.5,
      ...params
    });
    this.positionEntered = false;
  }

  generateSignals(historicalData, currentBar) {
    if (this.positionEntered) return [];
    
    const currentPrice = currentBar.close;
    const atmStrike = Math.round(currentPrice / 50) * 50;
    const expiry = this.getNextExpiry(currentBar.date);
    
    const signals = [
      {
        type: 'IRON_CONDOR',
        strike: atmStrike + this.params.wingWidth,
        optionType: 'call',
        action: 'SELL',
        quantity: 1,
        expiry
      },
      {
        type: 'IRON_CONDOR',
        strike: atmStrike + this.params.wingWidth + 100,
        optionType: 'call',
        action: 'BUY',
        quantity: 1,
        expiry
      },
      {
        type: 'IRON_CONDOR',
        strike: atmStrike - this.params.wingWidth,
        optionType: 'put',
        action: 'SELL',
        quantity: 1,
        expiry
      },
      {
        type: 'IRON_CONDOR',
        strike: atmStrike - this.params.wingWidth - 100,
        optionType: 'put',
        action: 'BUY',
        quantity: 1,
        expiry
      }
    ];
    
    this.positionEntered = true;
    return signals;
  }

  checkExit(position, currentBar) {
    const profitPercent = (position.pnl / (position.entryPrice * position.quantity * position.lotSize)) * 100;
    
    if (profitPercent >= this.params.targetProfit * 100) return true;
    if (profitPercent <= -this.params.stopLoss * 100) return true;
    
    return false;
  }
}

export class BullCallSpreadStrategy extends StrategyBase {
  constructor(params = {}) {
    super({
      lowerStrikeOffset: params.lowerStrikeOffset || -100,
      upperStrikeOffset: params.upperStrikeOffset || 100,
      targetProfit: params.targetProfit || 0.5,
      stopLoss: params.stopLoss || 0.8,
      ...params
    });
    this.positionEntered = false;
  }

  generateSignals(historicalData, currentBar) {
    if (this.positionEntered || historicalData.length < 20) return [];
    
    const sma20 = historicalData.slice(-20).reduce((sum, bar) => sum + bar.close, 0) / 20;
    
    if (currentBar.close > sma20) {
      const currentPrice = currentBar.close;
      const atmStrike = Math.round(currentPrice / 50) * 50;
      const expiry = this.getNextExpiry(currentBar.date);
      
      const signals = [
        {
          type: 'BULL_CALL_SPREAD',
          strike: atmStrike + this.params.lowerStrikeOffset,
          optionType: 'call',
          action: 'BUY',
          quantity: 1,
          expiry
        },
        {
          type: 'BULL_CALL_SPREAD',
          strike: atmStrike + this.params.upperStrikeOffset,
          optionType: 'call',
          action: 'SELL',
          quantity: 1,
          expiry
        }
      ];
      
      this.positionEntered = true;
      return signals;
    }
    
    return [];
  }

  checkExit(position, currentBar) {
    const profitPercent = (position.pnl / (position.entryPrice * position.quantity * position.lotSize)) * 100;
    
    if (profitPercent >= this.params.targetProfit * 100) return true;
    if (profitPercent <= -this.params.stopLoss * 100) return true;
    
    return false;
  }
}