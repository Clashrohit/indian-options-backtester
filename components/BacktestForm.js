import { useState } from 'react';
import { generateSampleData } from '../utils/helpers';

export default function BacktestForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    strategy: 'SHORT_STRADDLE',
    initialCapital: 100000,
    riskFreeRate: 0.06,
    lotSize: 50,
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    targetProfit: 0.5,
    stopLoss: 1.5,
    wingWidth: 200,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const marketData = generateSampleData(formData.startDate, formData.endDate);

    const backtestData = {
      strategy: formData.strategy,
      params: {
        targetProfit: parseFloat(formData.targetProfit),
        stopLoss: parseFloat(formData.stopLoss),
        wingWidth: parseInt(formData.wingWidth),
      },
      config: {
        initialCapital: parseFloat(formData.initialCapital),
        riskFreeRate: parseFloat(formData.riskFreeRate),
        lotSize: parseInt(formData.lotSize),
      },
      marketData
    };

    onSubmit(backtestData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Backtest Configuration</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Strategy
          </label>
          <select
            name="strategy"
            value={formData.strategy}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="SHORT_STRADDLE">Short Straddle</option>
            <option value="IRON_CONDOR">Iron Condor</option>
            <option value="BULL_CALL_SPREAD">Bull Call Spread</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Initial Capital (₹)
          </label>
          <input
            type="number"
            name="initialCapital"
            value={formData.initialCapital}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lot Size
          </label>
          <input
            type="number"
            name="lotSize"
            value={formData.lotSize}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Profit (%)
            </label>
            <input
              type="number"
              step="0.1"
              name="targetProfit"
              value={formData.targetProfit}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stop Loss (%)
            </label>
            <input
              type="number"
              step="0.1"
              name="stopLoss"
              value={formData.stopLoss}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {formData.strategy === 'IRON_CONDOR' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wing Width (points)
            </label>
            <input
              type="number"
              name="wingWidth"
              value={formData.wingWidth}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? 'Running...' : 'Run Backtest'}
        </button>
      </form>
    </div>
  );
}