
"use client";

import { useState, useEffect, useRef } from 'react';
import type { Message } from '@/types/chat';
import { ChatHistory } from './ChatHistory';
import { ChatInput } from './ChatInput';
import { analyzeMedicalImage, type AnalyzeMedicalImageInput } from '@/ai/flows/analyze-medical-image';
import { generateTextResponse, type GenerateTextResponseInput } from '@/ai/flows/generate-text-response';
import { transcribeAndRespondAudio, type TranscribeAndRespondAudioInput } from '@/ai/flows/transcribe-and-respond-audio';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
// Removed top-level jsPDF imports

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { selectedImageModel, selectedTextModel, selectedAiVoice, isMounted: settingsMounted } = useSettings();
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (settingsMounted && messages.length === 0) { 
        setMessages([
        {
            id: uuidv4(),
            text: "Hello! I'm medicoAI. Upload a medical image, type a question, or use the mic to talk. You can change AI models and voice in Settings (top right).",
            sender: 'bot',
            timestamp: new Date(),
        }
        ]);
    }
  }, [settingsMounted, messages.length]);

  useEffect(() => {
    const player = new Audio();
    audioPlayerRef.current = player;
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
      }
    };
  }, []);

  const playAudio = (audioUrl: string) => {
    if (audioPlayerRef.current && audioUrl) {
      audioPlayerRef.current.src = audioUrl;
      audioPlayerRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
        toast({ title: "Audio Playback Error", description: "Could not play AI response.", variant: "destructive"});
      });
    }
  };

  const handleSendMessage = async (text: string, imageFile?: File) => {
    if (!settingsMounted) {
        toast({ title: "Initializing", description: "Please wait, settings are loading.", variant: "default" });
        return;
    }

    const userMessageId = uuidv4();
    let userMessage: Message = {
      id: userMessageId,
      text: text,
      sender: 'user',
      timestamp: new Date(),
    };

    if (imageFile) {
      try {
        const previewUrl = URL.createObjectURL(imageFile);
        userMessage.previewUrl = previewUrl; 
        userMessage.imageUrl = await fileToDataUri(imageFile); 
      } catch (error) {
        console.error("Error processing image for preview:", error);
        toast({ title: "Image Error", description: "Could not process image.", variant: "destructive" });
      }
    }

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      if (userMessage.imageUrl) { 
        const aiInput: AnalyzeMedicalImageInput = {
            photoDataUri: userMessage.imageUrl,
            model: selectedImageModel,
            description: text 
        };
        const result = await analyzeMedicalImage(aiInput);
        const botMessage: Message = { id: uuidv4(), text: result.summary, sender: 'bot', timestamp: new Date() };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      } else if (text.trim() !== '') { 
        const textInput: GenerateTextResponseInput = { prompt: text, model: selectedTextModel };
        const result = await generateTextResponse(textInput);
        const botMessage: Message = { id: uuidv4(), text: result.responseText, sender: 'bot', timestamp: new Date() };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      }
    } catch (error) {
      console.error("Error calling AI or processing message:", error);
      const errorText = error instanceof Error ? error.message : "An unknown error occurred.";
      const errorBotMessage: Message = { id: uuidv4(), text: `Sorry, I encountered an error: ${errorText}`, sender: 'bot', timestamp: new Date() };
      setMessages(prevMessages => [...prevMessages, errorBotMessage]);
      toast({ title: "AI Error", description: `Failed to get a response. ${errorText}`, variant: "destructive" });
    } finally {
      setIsLoading(false);
      if (userMessage.previewUrl && userMessage.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(userMessage.previewUrl); 
      }
    }
  };

  const handleSendAudioMessage = async (audioDataUri: string) => {
    if (!settingsMounted) {
        toast({ title: "Initializing", description: "Please wait, settings are loading.", variant: "default" });
        return;
    }
    const userMessageId = uuidv4();
    const initialUserMessage: Message = {
      id: userMessageId,
      text: "", 
      userTranscript: "🎤 Processing your audio...",
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, initialUserMessage]);
    setIsLoading(true);

    try {
      const audioInput: TranscribeAndRespondAudioInput = {
        audioDataUri,
        aiVoice: selectedAiVoice,
        selectedTextModel: selectedTextModel,
      };
      const result = await transcribeAndRespondAudio(audioInput);

      setMessages(prevMessages => prevMessages.map(msg => 
        msg.id === userMessageId ? { ...msg, userTranscript: `🗣️ "${result.transcribedText}"`, text: result.transcribedText  } : msg
      ));
      
      const botMessage: Message = {
        id: uuidv4(),
        text: result.aiTextResponse,
        botAudioResponseUrl: result.aiAudioResponseUrl,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
      
      if (result.aiAudioResponseUrl) {
        playAudio(result.aiAudioResponseUrl);
      }

    } catch (error) {
      console.error("Error processing audio message:", error);
      const errorText = error instanceof Error ? error.message : "An unknown error occurred processing audio.";
      setMessages(prevMessages => prevMessages.map(msg => 
        msg.id === userMessageId ? { ...msg, userTranscript: `⚠️ Error processing audio.`, text: `Audio processing failed.` } : msg
      ));
      const errorBotMessage: Message = { id: uuidv4(), text: `Sorry, I couldn't process your audio: ${errorText}`, sender: 'bot', timestamp: new Date() };
      setMessages(prevMessages => [...prevMessages, errorBotMessage]);
      toast({ title: "Audio AI Error", description: errorText, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportChat = async () => {
    if (messages.length === 0) {
      toast({ title: "Export Failed", description: "No messages to export.", variant: "destructive" });
      return;
    }

    // Dynamically import jsPDF and its polyfill *inside* the client-side handler
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf/dist/polyfills.es.js');


    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15; 
    const maxLineWidth = pageWidth - margin * 2;
    let yPosition = margin;
    const lineHeight = 7; 
    const imageMaxHeight = 50; 
    const spaceBetweenMessages = 5;

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("MedicoAI Chat Export", pageWidth / 2, yPosition + 10, { align: 'center' });
    yPosition += lineHeight * 4;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Exported on: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight * 2;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Developed By:", pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight * 1.5;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Sukhdev Singh", pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight;
    doc.setTextColor(60, 120, 216); 
    doc.textWithLink("GitHub: sukhdevr898", pageWidth / 2, yPosition, { url: 'https://github.com/sukhdevr898', align: 'center' });
    yPosition += lineHeight;
    doc.textWithLink("Instagram: @sukh_rai898", pageWidth / 2, yPosition, { url: 'https://www.instagram.com/sukh_rai898', align: 'center' });
    doc.setTextColor(0); 
    yPosition += lineHeight * 3;

    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(
      "This document contains a log of a chat session with MedicoAI. MedicoAI is an AI assistant for medical image analysis and queries. Information provided is for informational purposes and not a substitute for professional medical advice.",
      margin, 
      yPosition,
      { maxWidth: maxLineWidth, align: 'center' }
    );

    doc.addPage();
    yPosition = margin;

    messages.forEach((msg, index) => {
      if (index === 0 && msg.text.startsWith("Hello! I'm medicoAI.")) return; 

      const senderPrefix = msg.sender === 'user' ? "User:" : "MedicoAI:";
      const timestamp = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      let messageHeader = `${senderPrefix} (${timestamp})`;
      
      if (yPosition + lineHeight * 3 > pageHeight - margin) { 
        doc.addPage();
        yPosition = margin;
      }
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      if (msg.sender === 'user') {
        doc.setTextColor(33, 150, 243); // User: Blue
      } else {
        doc.setTextColor(76, 175, 80); // Bot: Green
      }
      doc.text(messageHeader, margin, yPosition);
      yPosition += lineHeight * 1.2; 
      doc.setTextColor(0); 
      doc.setFont("helvetica", "normal");


      const contentToPrint = msg.userTranscript || msg.text;

      if (msg.imageUrl && msg.sender === 'user') {
        try {
          const imgData = msg.imageUrl; 
          const imgProps = doc.getImageProperties(imgData);
          
          let imgWidth = imgProps.width;
          let imgHeight = imgProps.height;
          const aspectRatio = imgWidth / imgHeight;

          if (imgWidth > maxLineWidth * 0.8) { 
            imgWidth = maxLineWidth * 0.8;
            imgHeight = imgWidth / aspectRatio;
          }
          if (imgHeight > imageMaxHeight) {
            imgHeight = imageMaxHeight;
            imgWidth = imgHeight * aspectRatio;
          }
          if (imgWidth > maxLineWidth * 0.8) { 
            imgWidth = maxLineWidth * 0.8;
            imgHeight = imgWidth / aspectRatio;
          }
          
          if (yPosition + imgHeight + lineHeight > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.addImage(imgData, imgProps.fileType, margin + 5, yPosition, imgWidth, imgHeight); 
          yPosition += imgHeight + lineHeight * 0.8;
        } catch (e) {
          console.error("Error adding image to PDF:", e);
          const errorText = "[Error: Could not load image for PDF]";
          const splitErrorText = doc.splitTextToSize(errorText, maxLineWidth);
          if (yPosition + splitErrorText.length * lineHeight > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.setTextColor(255, 0, 0); 
          doc.setFontSize(9);
          doc.text(splitErrorText, margin + 5, yPosition);
          yPosition += splitErrorText.length * lineHeight;
          doc.setTextColor(0);
        }
      }

      if (contentToPrint) {
        doc.setFontSize(10);
        const splitText = doc.splitTextToSize(contentToPrint, maxLineWidth - (msg.sender === 'user' ? 5 : 0)); 
        
        const textBlockHeight = splitText.length * lineHeight * 0.9; 
        if (yPosition + textBlockHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        const textXPosition = margin + (msg.sender === 'user' ? 5 : 0);
        doc.text(splitText, textXPosition, yPosition);
        yPosition += textBlockHeight;
      }
      
      yPosition += spaceBetweenMessages; 
      if (yPosition < pageHeight - margin - lineHeight) {
        doc.setDrawColor(220, 220, 220); 
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += lineHeight * 0.5;
      }
    });

    doc.save('medicoAI-chat-export.pdf');
    toast({ title: "Chat Exported", description: "Your chat has been exported to PDF." });
  };


  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 min-h-0 relative overflow-y-auto">
        <ChatHistory messages={messages} isBotTyping={isLoading} />
      </div>
      <ChatInput 
        onSendMessage={handleSendMessage} 
        onSendAudioMessage={handleSendAudioMessage}
        onExportChat={handleExportChat}
        isLoading={isLoading} 
      />
    </div>
  );
}
