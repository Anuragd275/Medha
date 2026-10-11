import { GoogleGenAI } from "@google/genai";
import MEDHA_SYSTEM_PROMPT from '../prompt/medhaPrompt.js';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function executeModelQuery(model, userQuery) {
    const response = await ai.models.generateContent({
        model,
        contents: userQuery,
        config: {
            systemInstruction: MEDHA_SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            temperature: 0.1,
        },
    });

    return JSON.parse(response.text);
}

export async function parseQueryWithMedha(userQuery) {
    const primaryModel = process.env.PRIMARY_MODEL;
    const secondaryModel = process.env.SECONDARY_MODEL;

    try {
        return await executeModelQuery(primaryModel, userQuery);
    } catch (primaryError) {
        console.warn(
            `Primary model (${primaryModel}) failed: ${primaryError.message}. Attempting fallback to ${secondaryModel}...`
        );

        if (!secondaryModel) {
            throw new Error(`Primary model failed and SECONDARY_MODEL is not defined in env.`);
        }

        try {
            return await executeModelQuery(secondaryModel, userQuery);
        } catch (secondaryError) {
            console.error(`Secondary model (${secondaryModel}) also failed: ${secondaryError.message}`);
            throw secondaryError;
        }
    }
}