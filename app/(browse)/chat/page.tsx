"use client"
import React, { useState } from 'react'
import { Send } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css'

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const getAIResponse = async (message: string): Promise<string> => {
  try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are an AI assistant specialized in financial markets and stock analysis. Please provide clear, concise answers about market trends, stock analysis, and investment concepts. Use data and technical analysis when appropriate."
          },
          {
            role: "user",
            content: message
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    return data.content;
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
      <div className="h-full max-w-4xl w-full mx-auto bg-blue-900 bg-opacity-5 rounded-lg shadow-lg overflow-hidden flex flex-col backdrop-blur-md z-10 border border-blue-500 border-opacity-30">
        <div className="bg-blue-800 bg-opacity-10 px-3 sm:px-6 py-3 flex justify-between items-center backdrop-blur-lg">
          <div className="flex items-center">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-blue-100">Financial Assistant</h2>
              <p className="text-xs sm:text-sm text-blue-200">Your AI Financial Advisor</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 custom-scrollbar">
          <div className="bg-blue-800 bg-opacity-20 p-3 sm:p-4 rounded-lg backdrop-blur-md mb-4 sm:mb-6">
            <p className="text-blue-100 text-sm sm:text-base">
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
                    ? 'bg-blue-600 bg-opacity-50 text-white rounded-tr-sm'
                    : 'bg-blue-800 bg-opacity-50 text-blue-100 rounded-tl-sm'
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
        </div>

        <div className="bg-blue-800 bg-opacity-20 p-2 sm:p-4 backdrop-blur-lg">
          <div className="flex space-x-2 max-w-3xl mx-auto">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about stocks, market trends, or investment strategies..."
              className="flex-grow bg-blue-700 bg-opacity-50 text-sm sm:text-base text-blue-100 placeholder-blue-300 rounded-full py-2 sm:py-3 px-4 sm:px-6 focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-lg"
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


