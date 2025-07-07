
export interface Message {
  id: string;
  text: string; // For bot text responses or user's typed text
  sender: 'user' | 'bot';
  imageUrl?: string; // For user-uploaded images before sending to AI
  previewUrl?: string; // For local preview of user-uploaded images
  timestamp: Date;
  isTyping?: boolean; // For bot typing indicator message
  userTranscript?: string; // For displaying the transcript of user's recorded audio
  botAudioResponseUrl?: string; // URL for the AI's spoken audio response
}
