import { NextResponse } from 'next/server';
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const functions = [
  {
    name: 'getStockPrice',
    description: 'Gets the latest stock price given the ticker symbol of a company.',
    parameters: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'The stock ticker symbol for a company (for example AAPL for Apple).'
        }
      },
      required: ['ticker']
    }
  },
  {
    name: 'calculateSMA',
    description: 'Calculate the simple moving average for a given stock ticker and a window.',
    parameters: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'The stock ticker symbol for a company (for example AAPL for Apple).'
        },
        window: {
          type: 'integer',
          description: 'The timeframe to consider when calculating the SMA'
        }
      },
      required: ['ticker', 'window']
    }
  },
  {
    name: 'calculateEMA',
    description: 'Calculate the exponential moving average for a given stock ticker and a window.',
    parameters: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'The stock ticker symbol for a company (for example AAPL for Apple).'
        },
        window: {
          type: 'integer',
          description: 'The timeframe to consider when calculating the EMA'
        }
      },
      required: ['ticker', 'window']
    }
  },
  {
    name: 'calculateRSI',
    description: 'Calculate the RSI (Relative Strength Index) for a given stock ticker.',
    parameters: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'The stock ticker symbol for a company (for example AAPL for Apple).'
        }
      },
      required: ['ticker']
    }
  },
  {
    name: 'calculateMACD',
    description: 'Calculate the MACD (Moving Average Convergence Divergence) for a given stock ticker.',
    parameters: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'The stock ticker symbol for a company (for example AAPL for Apple).'
        }
      },
      required: ['ticker']
    }
  },
  {
    name: 'getStockInfo',
    description: 'Get detailed information about a stock including market cap, PE ratio, and dividend yield.',
    parameters: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'The stock ticker symbol for a company (for example AAPL for Apple).'
        }
      },
      required: ['ticker']
    }
  },
  {
    name: 'getHistoricalData',
    description: 'Get historical price data for a stock over a specified period.',
    parameters: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'The stock ticker symbol for a company (for example AAPL for Apple).'
        },
        period: {
          type: 'string',
          description: 'Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)',
          enum: ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max']
        }
      },
      required: ['ticker', 'period']
    }
  },
  {
    name: 'calculateVolatility',
    description: 'Calculate the historical volatility of a stock.',
    parameters: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'The stock ticker symbol for a company (for example AAPL for Apple).'
        },
        window: {
          type: 'integer',
          description: 'The number of days to calculate volatility over'
        }
      },
      required: ['ticker', 'window']
    }
  }
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      functions,
      function_call: 'auto'
    });

    const responseMessage = completion.choices[0].message;

    if (responseMessage.function_call) {
      return NextResponse.json({
        content: responseMessage.content,
        functionCall: {
          name: responseMessage.function_call.name,
          arguments: JSON.parse(responseMessage.function_call.arguments)
        }
      });
    }

    return NextResponse.json({
      content: responseMessage.content
    });

  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message }, 
      { status: 500 }
    );
  }
} 