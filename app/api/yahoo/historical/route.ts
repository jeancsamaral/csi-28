import { NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')
  const interval = searchParams.get('interval') || '1d'
  const range = searchParams.get('range') || '3mo'

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    )
  }

  try {
    // Validar intervalos permitidos
    const validIntervals = ['1d', '1wk', '1mo']
    const validRanges = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', 'max']

    if (!validIntervals.includes(interval)) {
      return NextResponse.json(
        { error: 'Invalid interval parameter' },
        { status: 400 }
      )
    }

    if (!validRanges.includes(range)) {
      return NextResponse.json(
        { error: 'Invalid range parameter' },
        { status: 400 }
      )
    }

    // Calcular period1 baseado no range
    const now = new Date()
    const period2 = now.toISOString()
    let period1: Date = new Date()

    switch (range) {
      case '1d':
        period1.setDate(now.getDate() - 1)
        break
      case '5d':
        period1.setDate(now.getDate() - 5)
        break
      case '1mo':
        period1.setMonth(now.getMonth() - 1)
        break
      case '3mo':
        period1.setMonth(now.getMonth() - 3)
        break
      case '6mo':
        period1.setMonth(now.getMonth() - 6)
        break
      case '1y':
        period1.setFullYear(now.getFullYear() - 1)
        break
      case '2y':
        period1.setFullYear(now.getFullYear() - 2)
        break
      case '5y':
        period1.setFullYear(now.getFullYear() - 5)
        break
      case 'max':
        period1 = new Date('1970-01-01')
        break
      default:
        period1.setMonth(now.getMonth() - 3) // default to 3mo
    }

    let result
    try {
      // Tentar Yahoo Finance primeiro
      result = await yahooFinance.historical(symbol, {
        interval: interval as '1d' | '1wk' | '1mo',
        period1: period1.toISOString(),
        period2,
        events: 'history'
      })
    } catch (yahooError) {
      console.warn('Yahoo Finance failed:', yahooError)
      throw yahooError
    }

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'No data available for this symbol' },
        { status: 404 }
      )
    }

    // Transform data for the chart
    const historicalData = result.map(quote => ({
      timestamp: new Date(quote.date).getTime(),
      value: quote.close
    }))

    return NextResponse.json(historicalData)
  } catch (error) {
    console.error('Error fetching historical data:', error)
    
    // Retornar mensagem de erro mais específica
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: `Failed to fetch historical data: ${errorMessage}` },
      { status: 500 }
    )
  }
} 