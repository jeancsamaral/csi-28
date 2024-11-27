import 'server-only'
import { generateText } from 'ai'
import type { Message as AIMessage } from 'ai'
import {
  createAI,
  getMutableAIState,
  streamUI,
  createStreamableValue
} from 'ai/rsc'
import { createOpenAI } from '@ai-sdk/openai'
import type { Message } from '@/lib/types'

// Import components
import { BotCard, BotMessage } from '@/components/stocks/message'
import { SpinnerMessage } from '@/components/stocks/message'
import { StockChart } from '@/components/tradingview/stock-chart'
import { StockPrice } from '@/components/tradingview/stock-price'
import { StockNews } from '@/components/tradingview/stock-news'
import { StockFinancials } from '@/components/tradingview/stock-financials'
import { StockScreener } from '@/components/tradingview/stock-screener'
import { MarketOverview } from '@/components/tradingview/market-overview'
import { MarketHeatmap } from '@/components/tradingview/market-heatmap'
import { MarketTrending } from '@/components/tradingview/market-trending'
import { ETFHeatmap } from '@/components/tradingview/etf-heatmap'

import { z } from 'zod'
import { nanoid } from '@/lib/utils'

// Types
export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

interface MutableAIState {
  update: (newState: AIState) => void
  done: (newState: AIState) => void
  get: () => AIState
}

type ComparisonSymbolObject = {
  symbol: string;
  position: "SameScale";
};

// Constants
const MODEL = 'llama3-70b-8192'
const TOOL_MODEL = 'llama3-70b-8192'
const GROQ_API_KEY_ENV = process.env.GROQ_API_KEY

// System prompts
const captionSystemMessage = `You are a stock market conversation bot...` // Add your full system message here
const systemPrompt = `You are a stock market conversation bot...` // Add your full system prompt here

// Helper function to create Groq client
const createGroqClient = () => {
  if (!GROQ_API_KEY_ENV) {
    throw new Error('GROQ_API_KEY environment variable is not set')
  }
  
  return createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: GROQ_API_KEY_ENV
  })
}

// Message mapping function
const mapMessages = (messages: Message[]): AIMessage[] => {
  return messages.map(message => ({
    id: message.id,
    role: message.role === 'function' ? 'assistant' : message.role,
    content: message.content,
    ...(message.name && { name: message.name })
  })) as AIMessage[]
}

async function generateCaption(
  symbol: string,
  comparisonSymbols: ComparisonSymbolObject[],
  toolName: string,
  aiState: MutableAIState
): Promise<string> {
  const groq = createGroqClient()
  
  const stockString = comparisonSymbols.length === 0
    ? symbol
    : [symbol, ...comparisonSymbols.map(obj => obj.symbol)].join(', ')

  try {
    const response = await generateText({
      model: groq(MODEL),
      messages: [
        {
          id: nanoid(),
          role: 'system' as const,
          content: captionSystemMessage
        },
        ...mapMessages(aiState.get().messages)
      ]
    })
    return response.text || ''
  } catch (err) {
    console.error('Error generating caption:', err)
    return ''
  }
}

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()
  const groq = createGroqClient()

  // Add user message
  const userMessage: Message = {
    id: nanoid(),
    role: 'user',
    content
  }

  aiState.update({
    ...aiState.get(),
    messages: [...aiState.get().messages, userMessage]
  })

  let textStream = createStreamableValue('')

  try {
    const result = await streamUI({
      model: groq(TOOL_MODEL),
      initial: <SpinnerMessage />,
      maxRetries: 1,
      system: systemPrompt,
      messages: mapMessages(aiState.get().messages),
      text: ({ content, done, delta }) => {
        if (done) {
          textStream.done()
          const assistantMessage: Message = {
            id: nanoid(),
            role: 'assistant',
            content
          }
          aiState.done({
            ...aiState.get(),
            messages: [...aiState.get().messages, assistantMessage]
          })
        } else {
          textStream.update(delta)
        }

        return <BotMessage content={textStream.value} />
      },
      tools: {
        // Tool implementations remain the same
      }
    })

    return {
      id: nanoid(),
      display: result.value
    }

  } catch (err: any) {
    const errorMessage = err.message?.includes('OpenAI API key is missing')
      ? 'Groq API key is missing. Pass it using the GROQ_API_KEY environment variable.'
      : err.message || 'An error occurred'

    return {
      id: nanoid(),
      display: <ErrorDisplay message={errorMessage} />
    }
  }
}

// Error display component
function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="border p-4">
      <div className="text-red-700 font-medium">Error: {message}</div>
      <a
        href="https://github.com/bklieger-groq/stockbot-on-groq/issues"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-sm text-red-800 hover:text-red-900"
      >
        If you think something has gone wrong, create an
        <span className="ml-1" style={{ textDecoration: 'underline' }}>
          {' '}
          issue on Github.
        </span>
      </a>
    </div>
  )
}

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] }
})
