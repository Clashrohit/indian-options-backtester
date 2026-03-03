export function generateSampleData(startDate, endDate) {
  const data = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let price = 18000;
  const drift = 0.0001;
  const volatility = 0.015;
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const randomShock = (Math.random() - 0.5) * 2;
    const change = drift + volatility * randomShock;
    price = price * (1 + change);
    
    if (price > 19500) price -= (price - 19500) * 0.1;
    if (price < 16500) price += (16500 - price) * 0.1;
    
    data.push({
      date: new Date(date).toISOString().split('T')[0],
      open: price * 0.998,
      high: price * 1.005,
      low: price * 0.995,
      close: price,
      volume: Math.floor(Math.random() * 1000000) + 500000,
      iv: 0.12 + Math.random() * 0.08
    });
  }
  
  return data;
}