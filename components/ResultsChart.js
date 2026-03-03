import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function ResultsChart({ results }) {
  if (!results) return null;

  const { metrics, equity, trades, dailyPnL } = results;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Return" value={`${metrics.totalReturn.toFixed(2)}%`} positive={metrics.totalReturn > 0} />
        <MetricCard title="Win Rate" value={`${metrics.winRate.toFixed(1)}%`} />
        <MetricCard title="Total P&L" value={`₹${metrics.totalPnL.toFixed(0)}`} positive={metrics.totalPnL > 0} />
        <MetricCard title="Max Drawdown" value={`${metrics.maxDrawdown.toFixed(2)}%`} negative />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Sharpe Ratio" value={metrics.sharpeRatio.toFixed(2)} />
        <MetricCard title="Total Trades" value={metrics.totalTrades} />
        <MetricCard title="Profit Factor" value={metrics.profitFactor.toFixed(2)} />
        <MetricCard title="Avg Win" value={`₹${metrics.avgWin.toFixed(0)}`} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Equity Curve</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={equity}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN')}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => `₹${value.toFixed(0)}`}
              labelFormatter={(date) => new Date(date).toLocaleDateString('en-IN')}
            />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#2563eb" name="Portfolio Value" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Daily P&L</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dailyPnL}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN')}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => `₹${value.toFixed(0)}`}
              labelFormatter={(date) => new Date(date).toLocaleDateString('en-IN')}
            />
            <Bar dataKey="pnl" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Recent Trades</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Strike</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">P&L</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trades.filter(t => t.type === 'EXIT').slice(-10).reverse().map((trade, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {new Date(trade.entryDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{trade.strike}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{trade.optionType}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">₹{trade.entryPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">₹{trade.exitPrice.toFixed(2)}</td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${trade.pnl > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{trade.pnl.toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, positive, negative }) {
  const colorClass = positive 
    ? 'text-green-600' 
    : negative 
    ? 'text-red-600' 
    : 'text-gray-900';

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );
}