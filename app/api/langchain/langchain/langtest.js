import { OpenAI } from "@langchain/openai";
import { readFileSync } from 'fs';
import { resolve } from 'path';
import 'dotenv/config';

const OPENAI_APIKEY = process.env.OPENAI_APIKEY;

async function loadData() {
  try {
    // Load the diary content from data.txt using modern file path handling
    const dataFilePath = resolve(process.cwd(), 'data/data.txt');
    const diaryContent = readFileSync(dataFilePath, 'utf-8');
    return diaryContent;
  } catch (error) {
    console.error("Error loading data.txt:", error);
    return '';
  }
}

export async function generateAnswer(question) {
  const model = new OpenAI({
    openAIApiKey: OPENAI_APIKEY,
    model: "gpt-3.5-turbo-instruct",
    temperature: 0.7
  });

  let answer = '';
  
  // Load data from data.txt
  const diaryContent = await loadData();
  
  // Use template literals for better string handling
  const latexPrompt = `
    Use the following diary context to answer the question in LaTeX format:

    Diary Context: ${diaryContent}

    Question: ${question}

    Answer: `;

  try {
    answer = await model.invoke(latexPrompt);
    
    // Use template literals instead of string concatenation
    if (!answer.startsWith('$$')) {
      answer = `${answer}`;
    }
  } catch (e) {
    console.error("Error generating answer:", e);
    return 'Something went wrong';
  }

  return answer;
}