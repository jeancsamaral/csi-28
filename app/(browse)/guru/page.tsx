"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StockAnalysis {
  price?: string;
  sma?: string;
  ema?: string;
  rsi?: string;
  macd?: string;
}

export default function Page() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalysis = async () => {
    if (!userInput) return;

    setLoading(true);
    try {
      // Adicionar a mensagem do usuário ao histórico primeiro
      const newMessages = [
        ...messages,
        { role: 'user', content: userInput }
      ];
      setMessages(newMessages);

      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Se houver uma chamada de função
      if (data.functionCall) {
        const { name, arguments: args } = data.functionCall;
        let functionResponse;

        try {
          switch (name) {
            case 'getStockPrice':
              const priceResponse = await fetch(`/api/yahoo?symbol=${args.ticker}`);
              const priceData = await priceResponse.json();
              functionResponse = priceData.regularMarketPrice.toString();
              break;

            case 'calculateSMA':
              const smaResponse = await fetch(`/api/technical?symbol=${args.ticker}&indicator=sma&window=${args.window}`);
              const smaData = await smaResponse.json();
              functionResponse = smaData.value.toString();
              break;

            case 'calculateEMA':
              const emaResponse = await fetch(`/api/technical?symbol=${args.ticker}&indicator=ema&window=${args.window}`);
              const emaData = await emaResponse.json();
              functionResponse = emaData.value.toString();
              break;

            case 'calculateRSI':
              const rsiResponse = await fetch(`/api/technical?symbol=${args.ticker}&indicator=rsi`);
              const rsiData = await rsiResponse.json();
              functionResponse = rsiData.value.toString();
              break;

            case 'calculateMACD':
              const macdResponse = await fetch(`/api/technical?symbol=${args.ticker}&indicator=macd`);
              const macdData = await macdResponse.json();
              functionResponse = `MACD: ${macdData.macd.toFixed(2)}, Signal: ${macdData.signal.toFixed(2)}, Histogram: ${macdData.histogram.toFixed(2)}`;
              break;

            default:
              throw new Error(`Unknown function: ${name}`);
          }

          // Adicionar a resposta da função ao histórico
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: data.content || '' },
            { role: 'function', content: functionResponse }
          ]);

          // Fazer uma segunda chamada à API com o resultado da função
          const secondResponse = await fetch('/api/openai', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [
                ...newMessages,
                { role: 'assistant', content: data.content || '' },
                { role: 'function', name, content: functionResponse }
              ]
            }),
          });

          const secondData = await secondResponse.json();
          
          if (secondData.content) {
            setMessages(prev => [
              ...prev,
              { role: 'assistant', content: secondData.content }
            ]);
          }

        } catch (functionError) {
          console.error('Function execution error:', functionError);
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: 'Sorry, I encountered an error while processing the data.' }
          ]);
        }
      } else {
        // Se não houver chamada de função, apenas adicione a resposta
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: data.content }
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error processing your request.' }
      ]);
    } finally {
      setLoading(false);
      setUserInput('');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>StockSage: Stock Analysis Assistant</CardTitle>
          <CardDescription>
            Ask questions about stocks and get technical analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about a stock..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalysis()}
              />
              <Button onClick={handleAnalysis} disabled={loading}>
                {loading ? 'Analyzing...' : 'Ask'}
              </Button>
            </div>
            
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-primary/10 ml-auto' 
                      : message.role === 'function'
                      ? 'bg-secondary/20'
                      : 'bg-secondary/10'
                  }`}
                >
                  <p className="text-sm font-medium">{message.role}</p>
                  <p>{message.content}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}