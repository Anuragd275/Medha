import { GoogleGenAI } from "@google/genai";
import { readFile } from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function loadPrompt() {
    try {
        const prompt = await readFile('./prompt/geminiPrompt.txt', 'utf-8');
        return prompt;
    } catch (error) {
        console.error('Error reading file:', error);
    }
}


export async function parseQueryWithMedha(userQuery) {
    const response = await ai.models.generateContent({
        model: process.env.PRIMARY_MODEL,
        contents: userQuery,
        config: {
            systemInstruction: await loadPrompt(),
            responseMimeType: 'application/json',
            temperature: 0.1,
        },
    });

    return JSON.parse(response.text);
}