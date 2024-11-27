import { NextResponse } from 'next/server';
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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
      temperature: 0.7,
    });

    const responseMessage = completion.choices[0].message;

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