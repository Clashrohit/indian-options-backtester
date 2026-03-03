import { useState } from 'react';
import Head from 'next/head';
import BacktestForm from '../components/BacktestForm';
import ResultsChart from '../components/ResultsChart';

export default function Home() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBacktest = async (backtestData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backtestData),
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Backtest failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Indian Options Backtester</title>
        <meta name="description" content="Backtest Indian options strategies" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Indian Options Trading Backtester
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <BacktestForm onSubmit={handleBacktest} loading={loading} />
          </div>
          
          <div className="lg:col-span-2">
            {loading && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Running backtest...</p>
                </div>
              </div>
            )}
            
            {results && !loading && <ResultsChart results={results} />}
            
            {!results && !loading && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                  Welcome to Options Backtester
                </h2>
                <p className="text-gray-600">
                  Configure your strategy and run a backtest
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}