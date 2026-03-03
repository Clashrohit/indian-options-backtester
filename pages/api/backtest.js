import { BacktestEngine } from '../../lib/backtestEngine';
import { ShortStraddleStrategy, IronCondorStrategy, BullCallSpreadStrategy } from '../../lib/strategies';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { strategy, params, marketData, config } = req.body;

    let strategyInstance;
    switch (strategy) {
      case 'SHORT_STRADDLE':
        strategyInstance = new ShortStraddleStrategy(params);
        break;
      case 'IRON_CONDOR':
        strategyInstance = new IronCondorStrategy(params);
        break;
      case 'BULL_CALL_SPREAD':
        strategyInstance = new BullCallSpreadStrategy(params);
        break;
      default:
        return res.status(400).json({ error: 'Invalid strategy' });
    }

    const engine = new BacktestEngine(config);
    const results = await engine.run(strategyInstance, marketData);

    res.status(200).json(results);
  } catch (error) {
    console.error('Backtest error:', error);
    res.status(500).json({ error: error.message });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};