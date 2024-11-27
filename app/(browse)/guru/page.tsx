"use client"
import React, { useState, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css'
import OpenAI from 'openai'

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY 

export async function generateAnswer(question: string) {
  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });

  let answer = '';
  
const systemPrompt = `You are a highly specialized AI assistant focused solely on financial markets and stock analysis. 
Your role is to provide precise, data-driven insights with a strong emphasis on numerical data. 
Focus on delivering market trends, stock performance metrics, technical indicators, financial ratios, and quantitative analysis. 
Avoid unrelated topics and ensure your responses include key numbers such as price levels, volume, moving averages, RSI, P/E ratios, and other relevant financial statistics. 
Always prioritize numerical accuracy and clarity in your analysis.`;


  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user", 
          content: question
        }
      ],
      model: "gpt-4-0125-preview",
      temperature: 0.7
    });

    answer = completion.choices[0].message.content || '';

  } catch (e) {
    console.error("Error generating answer:", e);
    return 'Desculpe, ocorreu um erro ao tentar obter a resposta.';
  }

  return answer;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const getAIResponse = async (message: string): Promise<string> => {
  try {
    const response = await generateAnswer(message);
    return response;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return 'Desculpe, ocorreu um erro ao tentar obter a resposta.';
  }
}

export default function FinanceAIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return

    const newMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
    }

    setMessages([...messages, newMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const aiResponse = await getAIResponse(inputMessage);
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai',
      };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-[600px] flex items-center justify-center py-2 px-2 sm:py-4 sm:px-4 lg:px-8 relative">
      <div className="h-full max-w-4xl w-full mx-auto bg-white dark:bg-blue-900 bg-opacity-5 dark:bg-opacity-5 rounded-lg shadow-lg overflow-hidden flex flex-col backdrop-blur-md z-10 border border-gray-200 dark:border-blue-500 border-opacity-30">
        <div className="bg-gray-100 dark:bg-blue-800 bg-opacity-10 dark:bg-opacity-10 px-3 sm:px-6 py-3 flex justify-between items-center backdrop-blur-lg">
          <div className="flex items-center">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-blue-100">Financial Assistant</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-blue-200">Your AI Financial Advisor</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 custom-scrollbar">
          <div className="bg-gray-100 dark:bg-blue-800 bg-opacity-20 dark:bg-opacity-20 p-3 sm:p-4 rounded-lg backdrop-blur-md mb-4 sm:mb-6">
            <p className="text-gray-800 dark:text-blue-100 text-sm sm:text-base">
              Hello! I'm your AI financial assistant. How can I help you with market analysis or investment decisions today?
            </p>
          </div>
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-600 dark:bg-blue-600 bg-opacity-90 dark:bg-opacity-50 text-white rounded-tr-sm'
                    : 'bg-gray-100 dark:bg-blue-800 bg-opacity-90 dark:bg-opacity-50 text-gray-800 dark:text-blue-100 rounded-tl-sm'
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  className="text-sm sm:text-base"
                >
                  {message.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-blue-800 bg-opacity-90 dark:bg-opacity-50 p-4 rounded-2xl rounded-tl-sm flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-800 dark:text-blue-100" />
                <span className="text-gray-800 dark:text-blue-100 text-sm">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-100 dark:bg-blue-800 bg-opacity-20 dark:bg-opacity-20 p-2 sm:p-4 backdrop-blur-lg">
          <div className="flex space-x-2 max-w-3xl mx-auto">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about stocks, market trends, or investment strategies..."
              className="flex-grow bg-white dark:bg-blue-700 bg-opacity-70 dark:bg-opacity-50 text-sm sm:text-base text-gray-800 dark:text-blue-100 placeholder-gray-500 dark:placeholder-blue-300 rounded-full py-2 sm:py-3 px-4 sm:px-6 focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-lg"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-in-out disabled:opacity-50"
            >
              <Send className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


