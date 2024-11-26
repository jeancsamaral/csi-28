import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const indicator = searchParams.get('indicator');
  const window = searchParams.get('window');

  if (!symbol || !indicator) {
    return NextResponse.json({ error: 'Symbol and indicator are required' }, { status: 400 });
  }

  try {
    const historicalData = await yahooFinance.historical(symbol, {
      period1: '1y',
    });

    const prices = historicalData.map(item => item.close);

    switch (indicator) {
      case 'sma':
        if (!window) return NextResponse.json({ error: 'Window is required for SMA' }, { status: 400 });
        const sma = calculateSMA(prices, parseInt(window));
        return NextResponse.json({ value: sma });

      case 'ema':
        if (!window) return NextResponse.json({ error: 'Window is required for EMA' }, { status: 400 });
        const ema = calculateEMA(prices, parseInt(window));
        return NextResponse.json({ value: ema });

      case 'rsi':
        const rsi = calculateRSI(prices);
        return NextResponse.json({ value: rsi });

      case 'macd':
        const macd = calculateMACD(prices);
        return NextResponse.json(macd);

      default:
        return NextResponse.json({ error: 'Invalid indicator' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error calculating technical indicator:', error);
    return NextResponse.json({ error: 'Failed to calculate indicator' }, { status: 500 });
  }
}

// Funções auxiliares para cálculos técnicos
function calculateSMA(prices: number[], window: number): number {
  const slice = prices.slice(-window);
  return slice.reduce((a, b) => a + b, 0) / window;
}

function calculateEMA(prices: number[], window: number): number {
  const k = 2 / (window + 1);
  return prices.reduce((ema, price, i) => {
    if (i === 0) return price;
    return price * k + ema * (1 - k);
  }, prices[0]);
}

function calculateRSI(prices: number[]): number {
  const changes = prices.slice(1).map((price, i) => price - prices[i]);
  const gains = changes.map(change => change > 0 ? change : 0);
  const losses = changes.map(change => change < 0 ? -change : 0);
  
  const avgGain = gains.slice(-14).reduce((a, b) => a + b, 0) / 14;
  const avgLoss = losses.slice(-14).reduce((a, b) => a + b, 0) / 14;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateMACD(prices: number[]) {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  const signal = calculateEMA([macd], 9);
  const histogram = macd - signal;
  
  return { macd, signal, histogram };
} 