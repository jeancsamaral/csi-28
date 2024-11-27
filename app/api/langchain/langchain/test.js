import { generateAnswer } from './app/api/langchain/langtest.js';

async function test() {
    const question = "What is the schedule for Monday?";
    const answer = await generateAnswer(question);
    console.log("Answer:", answer);
}

test();