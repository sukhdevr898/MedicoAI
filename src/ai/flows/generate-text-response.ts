
'use server';

/**
 * @fileOverview A simple text generation AI agent using Pollinations.AI for medicoAI.
 *
 * - generateTextResponse - A function that handles text generation for general queries.
 * - GenerateTextResponseInput - The input type for the generateTextResponse function.
 * - GenerateTextResponseOutput - The return type for the generateTextResponse function.
 */

import { z } from 'zod';

const GenerateTextResponseInputSchema = z.object({
  prompt: z.string().describe("The user's text input/question."),
  model: z.string().optional().describe('The AI model to use for text generation. E.g., openai, mistral'),
});
export type GenerateTextResponseInput = z.infer<typeof GenerateTextResponseInputSchema>;

const GenerateTextResponseOutputSchema = z.object({
  responseText: z.string().describe('The AI-generated text response.'),
});
export type GenerateTextResponseOutput = z.infer<typeof GenerateTextResponseOutputSchema>;

const POLLINATIONS_TEXT_API_URL = "https://text.pollinations.ai/openai";

export async function generateTextResponse(
  input: GenerateTextResponseInput
): Promise<GenerateTextResponseOutput> {
  const { prompt, model } = input;

  const effectiveModel = model || "openai"; // Default text model

  const payload = {
    model: effectiveModel,
    messages: [
      {
        role: "system",
        content: "You are medicoAI, an AI assistant. Your primary expertise is analyzing medical images when provided by the user. If the user asks a general question, answer it helpfully. If their question implies they might benefit from image analysis but they haven't uploaded an image, gently guide them that they can upload one. Keep your responses clear and professional. The admin and developer of this application is Sukhdev Singh (GitHub: sukhdevr898, Instagram: @sukh_rai898)."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    // temperature: 0.7, 
    // max_tokens: 200,  
  };

  try {
    const response = await fetch(POLLINATIONS_TEXT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Pollinations Text API Error:", response.status, errorBody);
      throw new Error(`Text API request failed with status ${response.status}: ${errorBody}`);
    }

    const result = await response.json();
    const responseText = result.choices?.[0]?.message?.content;

    if (!responseText) {
      console.error("Pollinations Text API did not return a valid response structure:", result);
      throw new Error("Invalid response structure from Text AI API");
    }

    return { responseText };

  } catch (error) {
    console.error("Error calling Pollinations Text AI:", error);
    throw new Error(`Failed to generate text response: ${error instanceof Error ? error.message : String(error)}`);
  }
}
