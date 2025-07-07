
'use server';

/**
 * @fileOverview A medical image analysis AI agent using Pollinations.AI.
 *
 * - analyzeMedicalImage - A function that handles the medical image analysis process.
 * - AnalyzeMedicalImageInput - The input type for the analyzeMedicalImage function.
 * - AnalyzeMedicalImageOutput - The return type for the analyzeMedicalImage function.
 */

import { z } from 'zod';

const AnalyzeMedicalImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A medical image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  model: z.string().optional().describe('The AI model to use for image analysis. E.g., openai-large, claude-hybridspace'),
  description: z.string().optional().describe('Optional text description to accompany the image analysis.')
});
export type AnalyzeMedicalImageInput = z.infer<typeof AnalyzeMedicalImageInputSchema>;

const AnalyzeMedicalImageOutputSchema = z.object({
  summary: z
    .string()
    .describe('A summary of potential findings in the medical image.'),
});
export type AnalyzeMedicalImageOutput = z.infer<typeof AnalyzeMedicalImageOutputSchema>;

const POLLINATIONS_API_URL = "https://text.pollinations.ai/openai";

export async function analyzeMedicalImage(
  input: AnalyzeMedicalImageInput
): Promise<AnalyzeMedicalImageOutput> {
  const { photoDataUri, model, description } = input;

  const effectiveModel = model || "openai-large"; // Default vision model
  const userText = description || "Please analyze this medical image and provide a summary of potential findings.";

  const payload = {
    model: effectiveModel,
    messages: [
      {
        role: "system",
        content: "You are an expert medical professional specializing in analyzing medical images. Your task is to provide a summary of potential findings in the medical image. If the user provides additional text, consider it in your analysis."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: userText
          },
          {
            type: "image_url",
            image_url: {
              "url": photoDataUri
            }
          }
        ]
      }
    ],
    // temperature: 0.7, 
    // max_tokens: 300, 
  };

  try {
    const response = await fetch(POLLINATIONS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Pollinations API Error (Image Analysis):", response.status, errorBody);
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    const result = await response.json();
    const summary = result.choices?.[0]?.message?.content;

    if (!summary) {
      console.error("Pollinations API did not return a valid summary (Image Analysis):", result);
      throw new Error("Invalid response structure from AI API for image analysis");
    }

    return { summary };

  } catch (error) {
    console.error("Error calling Pollinations AI (Image Analysis):", error);
    throw new Error(`Failed to analyze medical image: ${error instanceof Error ? error.message : String(error)}`);
  }
}
