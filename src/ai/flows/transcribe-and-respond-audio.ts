
'use server';

/**
 * @fileOverview Handles audio input: transcribes, gets AI text response, and converts response to speech.
 *
 * - transcribeAndRespondAudio - Main function for the audio processing pipeline.
 * - TranscribeAndRespondAudioInput - Input type.
 * - TranscribeAndRespondAudioOutput - Output type.
 */

import { z } from 'zod';

const TranscribeAndRespondAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "User's recorded audio as a data URI. Expected format: 'data:audio/<mimetype>;base64,<encoded_data>'."
    ),
  aiVoice: z.string().describe("The voice to use for the AI's spoken response (e.g., 'nova')."),
  selectedTextModel: z.string().optional().describe('The AI model to use for generating the text response.'),
});
export type TranscribeAndRespondAudioInput = z.infer<typeof TranscribeAndRespondAudioInputSchema>;

const TranscribeAndRespondAudioOutputSchema = z.object({
  transcribedText: z.string().describe("The text transcribed from the user's audio."),
  aiTextResponse: z.string().describe("The AI's text-based response."),
  aiAudioResponseUrl: z.string().describe("Data URI of the AI's spoken response."),
});
export type TranscribeAndRespondAudioOutput = z.infer<typeof TranscribeAndRespondAudioOutputSchema>;

const POLLINATIONS_API_URL = "https://text.pollinations.ai/openai";

// Helper function to make API calls to Pollinations
async function callPollinationsApi(payload: object): Promise<any> {
  const response = await fetch(POLLINATIONS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Pollinations API Error:", response.status, errorBody, payload);
    throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
  }
  // If response is audio, it might not be JSON. Handle this.
  const contentType = response.headers.get("content-type");
  if (contentType && (contentType.includes("audio/") || contentType.includes("application/octet-stream"))) {
      const audioBlob = await response.blob();
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string); // Returns data URI
          reader.onerror = reject;
          reader.readAsDataURL(audioBlob);
      });
  }
  return response.json();
}


export async function transcribeAndRespondAudio(
  input: TranscribeAndRespondAudioInput
): Promise<TranscribeAndRespondAudioOutput> {
  const { audioDataUri, aiVoice, selectedTextModel } = input;

  // 1. Speech-to-Text (STT)
  let transcribedText = "";
  try {
    const sttPayload = {
      model: "openai-audio", 
      messages: [
        {
          role: "user",
          content: [
            { type: "input_audio", input_audio: { url: audioDataUri } } 
          ]
        }
      ],
    };
    const sttResult = await callPollinationsApi(sttPayload);
    transcribedText = sttResult.choices?.[0]?.message?.content;
    if (!transcribedText) {
      console.error("STT API did not return valid transcribed text:", sttResult);
      throw new Error("Failed to transcribe audio: No text content in response.");
    }
  } catch (error) {
    console.error("Error during STT:", error);
    throw new Error(`Speech-to-Text failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // 2. Get AI Text Response (using the transcribed text)
  let aiTextResponse = "";
  try {
    const textResponsePayload = {
      model: selectedTextModel || "openai",
      messages: [
        {
          role: "system",
          content: "You are medicoAI, an AI assistant. Your primary expertise is analyzing medical images when provided by the user. If the user asks a general question, answer it helpfully. If their question implies they might benefit from image analysis but they haven't uploaded an image, gently guide them that they can upload one. Keep your responses clear and professional. The admin and developer of this application is Sukhdev Singh (GitHub: sukhdevr898, Instagram: @sukh_rai898)."
        },
        { role: "user", content: transcribedText }
      ],
    };
    const textResult = await callPollinationsApi(textResponsePayload);
    aiTextResponse = textResult.choices?.[0]?.message?.content;
    if (!aiTextResponse) {
      console.error("Text Gen API did not return a valid response:", textResult);
      throw new Error("Failed to generate text response: No text content in response.");
    }
  } catch (error) {
    console.error("Error during Text Generation:", error);
    throw new Error(`Text Generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // 3. Text-to-Speech (TTS)
  let aiAudioResponseUrl = "";
  try {
    const ttsPayload = {
      model: "openai-audio", 
      messages: [{ role: "user", content: aiTextResponse }], // Using user role for content as per general OpenAI chat format
      voice: aiVoice,
      // The API should infer audio output based on the 'openai-audio' model and voice presence.
      // If explicit output modality is needed, it would be: output_modalities: ["audio"]
    };
    const ttsResultAsDataUri = await callPollinationsApi(ttsPayload); // callPollinationsApi handles audio blob to data URI conversion
    
    if (typeof ttsResultAsDataUri === 'string' && ttsResultAsDataUri.startsWith('data:audio/')) {
      aiAudioResponseUrl = ttsResultAsDataUri;
    } else {
      console.error("TTS API did not return a valid audio data URI:", ttsResultAsDataUri);
      // This might happen if the API returns JSON with an error instead of audio
      if (typeof ttsResultAsDataUri === 'object' && ttsResultAsDataUri?.error) {
         throw new Error(`TTS API Error: ${ttsResultAsDataUri.error.message || JSON.stringify(ttsResultAsDataUri.error)}`);
      }
      throw new Error("Failed to convert text to speech: Invalid audio data received or unexpected response format.");
    }
  } catch (error) {
    console.error("Error during TTS:", error);
    // We'll allow the function to proceed without audio if TTS fails, but the client-side will know.
    aiAudioResponseUrl = ""; 
    console.warn(`TTS failed: ${error instanceof Error ? error.message : String(error)}. Proceeding without AI audio response.`);
  }

  return {
    transcribedText,
    aiTextResponse,
    aiAudioResponseUrl,
  };
}
