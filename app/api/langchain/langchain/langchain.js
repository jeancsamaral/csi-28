import { OpenAI } from "@langchain/openai";
import 'dotenv/config';

require('dotenv').config();


const OPENAI_APIKEY = "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"


export async function generateAnswer(question) {
    const model = new OpenAI({
        openAIApiKey: OPENAI_APIKEY,
        model: "gpt-3.5-turbo-instruct",
        temperature: 0.7 // lower temperature = less deterministic
    });

    let answer = '';
    
    const latexPrompt = `Por favor, formate sua resposta em LaTeX para a seguinte pergunta: ${question}`;

    try {
        answer = await model.invoke(latexPrompt);
        
        if (!answer.startsWith('$$')) {
            answer = `${answer}`;
        }
    } catch (e) {
        console.error("Error generating answer:", e);
        return 'Something went wrong';
    }

    return answer;
}