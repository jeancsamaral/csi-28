import yahooFinance from 'yahoo-finance2';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    const quote = await yahooFinance.quote(symbol);
    return NextResponse.json(quote);
  } catch (error) {
    console.error('Yahoo Finance API error:', error);
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
  }
} 