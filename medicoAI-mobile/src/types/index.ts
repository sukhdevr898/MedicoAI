export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  previewUrl?: string;
  imageUrl?: string;
  userTranscript?: string;
  botAudioResponseUrl?: string;
}

export interface User {
  name: string;
  age: string;
  email: string;
  isFirstTime: boolean;
}

export type ThemeColors = {
  primary: string;
  background: string;
  accent: string;
};

export type FontSize = 'sm' | 'base' | 'lg';

export interface AppSettings {
  themeColors: ThemeColors;
  fontSize: FontSize;
  selectedImageModel: string;
  selectedTextModel: string;
  selectedAiVoice: string;
  user: User | null;
}

// AI Service Types
export interface GenerateTextResponseInput {
  prompt: string;
  model?: string;
  userName?: string;
}

export interface GenerateTextResponseOutput {
  responseText: string;
}

export interface AnalyzeMedicalImageInput {
  photoDataUri: string;
  model?: string;
  description?: string;
  userName?: string;
}

export interface AnalyzeMedicalImageOutput {
  summary: string;
}

export interface TranscribeAndRespondAudioInput {
  audioDataUri: string;
  aiVoice?: string;
  selectedTextModel?: string;
  userName?: string;
}

export interface TranscribeAndRespondAudioOutput {
  transcribedText: string;
  aiTextResponse: string;
  aiAudioResponseUrl?: string;
}

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Setup: undefined;
  Main: undefined;
};

export type BottomTabParamList = {
  Chat: undefined;
  Settings: undefined;
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_DATA: 'medicoAI_user_data',
  SETTINGS: 'medicoAI_settings',
  CHAT_HISTORY: 'medicoAI_chat_history',
  FIRST_TIME: 'medicoAI_first_time',
} as const;

// Available AI Models
export const AI_MODELS = {
  TEXT: {
    'openai': 'OpenAI GPT',
    'mistral': 'Mistral',
    'claude': 'Claude',
  },
  IMAGE: {
    'openai-large': 'OpenAI Vision Large',
    'claude-hybridspace': 'Claude Hybrid',
    'mistral-vision': 'Mistral Vision',
  }
} as const;

// Available Voices
export const AVAILABLE_VOICES = [
  "alloy", "echo", "fable", "onyx", "nova", "shimmer", 
  "coral", "verse", "ballad", "ash", "sage", "amuch", "dan"
] as const;

export type VoiceType = typeof AVAILABLE_VOICES[number];

// Default Settings
export const DEFAULT_SETTINGS: AppSettings = {
  themeColors: {
    primary: '#49c140',
    background: '#f4f8f5',
    accent: '#87e550',
  },
  fontSize: 'base',
  selectedImageModel: 'openai-large',
  selectedTextModel: 'openai',
  selectedAiVoice: 'nova',
  user: null,
};