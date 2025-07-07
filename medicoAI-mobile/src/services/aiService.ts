import {
  GenerateTextResponseInput,
  GenerateTextResponseOutput,
  AnalyzeMedicalImageInput,
  AnalyzeMedicalImageOutput,
  TranscribeAndRespondAudioInput,
  TranscribeAndRespondAudioOutput,
} from '../types';

const POLLINATIONS_TEXT_API_URL = 'https://text.pollinations.ai/openai';

/**
 * Generate text response using Pollinations AI
 */
export async function generateTextResponse(
  input: GenerateTextResponseInput
): Promise<GenerateTextResponseOutput> {
  const { prompt, model, userName } = input;
  const effectiveModel = model || 'openai';

  const systemPrompt = userName 
    ? `You are medicoAI, an AI assistant. Your primary expertise is analyzing medical images when provided by the user. If the user asks a general question, answer it helpfully. If their question implies they might benefit from image analysis but they haven't uploaded an image, gently guide them that they can upload one. Keep your responses clear and professional. The user's name is ${userName}. The admin and developer of this application is Sukhdev Singh (GitHub: sukhdevr898, Instagram: @sukh_rai898).`
    : `You are medicoAI, an AI assistant. Your primary expertise is analyzing medical images when provided by the user. If the user asks a general question, answer it helpfully. If their question implies they might benefit from image analysis but they haven't uploaded an image, gently guide them that they can upload one. Keep your responses clear and professional. The admin and developer of this application is Sukhdev Singh (GitHub: sukhdevr898, Instagram: @sukh_rai898).`;

  const payload = {
    model: effectiveModel,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
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
      console.error('Pollinations Text API Error:', response.status, errorBody);
      throw new Error(`Text API request failed with status ${response.status}: ${errorBody}`);
    }

    const result = await response.json();
    const responseText = result.choices?.[0]?.message?.content;

    if (!responseText) {
      console.error('Pollinations Text API did not return a valid response structure:', result);
      throw new Error('Invalid response structure from Text AI API');
    }

    return { responseText };
  } catch (error) {
    console.error('Error calling Pollinations Text AI:', error);
    throw new Error(`Failed to generate text response: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Analyze medical image using Pollinations AI
 */
export async function analyzeMedicalImage(
  input: AnalyzeMedicalImageInput
): Promise<AnalyzeMedicalImageOutput> {
  const { photoDataUri, model, description, userName } = input;
  const effectiveModel = model || 'openai-large';
  const userText = description || 'Please analyze this medical image and provide a summary of potential findings.';

  const systemPrompt = userName
    ? `You are an expert medical professional specializing in analyzing medical images. Your task is to provide a summary of potential findings in the medical image. If the user provides additional text, consider it in your analysis. The user's name is ${userName}.`
    : `You are an expert medical professional specializing in analyzing medical images. Your task is to provide a summary of potential findings in the medical image. If the user provides additional text, consider it in your analysis.`;

  const payload = {
    model: effectiveModel,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: userText,
          },
          {
            type: 'image_url',
            image_url: {
              url: photoDataUri,
            },
          },
        ],
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
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
      console.error('Pollinations API Error (Image Analysis):', response.status, errorBody);
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    const result = await response.json();
    const summary = result.choices?.[0]?.message?.content;

    if (!summary) {
      console.error('Pollinations API did not return a valid summary (Image Analysis):', result);
      throw new Error('Invalid response structure from AI API for image analysis');
    }

    return { summary };
  } catch (error) {
    console.error('Error calling Pollinations AI (Image Analysis):', error);
    throw new Error(`Failed to analyze medical image: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Transcribe audio and generate response (simplified version for mobile)
 * Note: This is a simplified implementation. In a full production app,
 * you would integrate with speech-to-text and text-to-speech services.
 */
export async function transcribeAndRespondAudio(
  input: TranscribeAndRespondAudioInput
): Promise<TranscribeAndRespondAudioOutput> {
  const { audioDataUri, aiVoice, selectedTextModel, userName } = input;

  try {
    // For this implementation, we'll simulate audio transcription
    // In a real app, you would use services like OpenAI Whisper or Google Speech-to-Text
    const transcribedText = 'Audio transcription not yet implemented in mobile version. Please type your message.';
    
    // Generate text response based on the transcribed text
    const textResponse = await generateTextResponse({
      prompt: transcribedText,
      model: selectedTextModel,
      userName,
    });

    // For TTS, you would use services like OpenAI TTS or Google Text-to-Speech
    // For now, we'll return without audio URL
    return {
      transcribedText,
      aiTextResponse: textResponse.responseText,
      aiAudioResponseUrl: undefined, // Audio not implemented yet
    };
  } catch (error) {
    console.error('Error processing audio message:', error);
    throw new Error(`Failed to process audio: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Health check for AI services
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(POLLINATIONS_TEXT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai',
        messages: [
          {
            role: 'user',
            content: 'Hello',
          },
        ],
        max_tokens: 10,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('AI Service health check failed:', error);
    return false;
  }
}