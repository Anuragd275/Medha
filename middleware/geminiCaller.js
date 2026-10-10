import { GoogleGenAI } from "@google/genai";
import MEDHA_SYSTEM_PROMPT from '../prompt/medhaPrompt.js';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function parseQueryWithMedha(userQuery) {
    const response = await ai.models.generateContent({
        model: process.env.PRIMARY_MODEL,
        contents: userQuery,
        config: {
            systemInstruction: MEDHA_SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            temperature: 0.1,
        },
    });

    return JSON.parse(response.text);
}