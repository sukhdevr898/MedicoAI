
import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-medical-image.ts';
import '@/ai/flows/generate-text-response.ts';
import '@/ai/flows/transcribe-and-respond-audio.ts';
