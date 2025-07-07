
"use client";

import { useState, useRef, type ChangeEvent, type KeyboardEvent, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Paperclip, SendHorizonal, XCircle, Mic, Square, FileDown } from 'lucide-react';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (text: string, imageFile?: File) => void;
  onSendAudioMessage: (audioDataUri: string) => void;
  onExportChat: () => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, onSendAudioMessage, onExportChat, isLoading }: ChatInputProps) {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);


  const handleToggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64AudioDataUri = reader.result as string;
            onSendAudioMessage(base64AudioDataUri);
          };
          reader.readAsDataURL(audioBlob);
          // Clean up media stream tracks
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing microphone:", error);
        // Optionally, show a toast to the user
      }
    }
  };


  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; 
    }
  };

  const handleSubmit = () => {
    if (text.trim() === '' && !imageFile) return;
    onSendMessage(text, imageFile || undefined);
    setText('');
    removeImage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };
  
  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 120; 
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [text]);


  return (
    <div className="p-3 sm:p-4 border-t border-border bg-background/95 backdrop-blur-sm sticky bottom-0">
      <div className="bg-card border border-input rounded-xl shadow-lg overflow-hidden">
          {imagePreview && (
            <div className="p-3 border-b border-border bg-muted/30">
                <div className="relative w-28 h-28 border-2 border-dashed border-primary/40 rounded-lg p-1.5 group flex items-center justify-center bg-background/50 shadow-inner">
                <Image src={imagePreview} alt="Preview" layout="fill" objectFit="contain" className="rounded-md" data-ai-hint="medical scan"/>
                <Button
                    variant="destructive" 
                    size="icon"
                    className="absolute -top-3 -right-3 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-destructive/90"
                    onClick={removeImage}
                    aria-label="Remove image"
                >
                    <XCircle className="h-4 w-4" />
                </Button>
                </div>
            </div>
          )}
          <div className="flex items-end space-x-2 p-3">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading || isRecording} aria-label="Attach image" className="text-muted-foreground hover:text-primary flex-shrink-0 h-10 w-10 rounded-lg">
                        <Paperclip className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Attach Image (X-Ray, Scan, etc.)</p>
                </TooltipContent>
            </Tooltip>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,.jpeg,.jpg,.png,.webp,.gif"
              onChange={handleImageChange}
              className="hidden"
              disabled={isRecording}
            />
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Recording audio..." : "Describe the image or ask a question..."}
              className="flex-grow resize-none min-h-[44px] max-h-[120px] self-center border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none bg-transparent px-2 py-2.5 placeholder:text-muted-foreground/70 text-sm"
              rows={1}
              disabled={isLoading || isRecording}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleToggleRecording} 
                  disabled={isLoading} 
                  aria-label={isRecording ? "Stop recording" : "Start recording"} 
                  className={cn(
                    "text-muted-foreground hover:text-primary flex-shrink-0 h-10 w-10 rounded-lg",
                    isRecording && "text-destructive animate-pulse"
                  )}
                >
                  {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isRecording ? "Stop Recording" : "Record Audio"}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={handleSubmit} disabled={isLoading || (text.trim() === '' && !imageFile) || isRecording} size="icon" aria-label="Send message" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg w-10 h-10 flex-shrink-0">
                    <SendHorizonal className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Send</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={onExportChat} disabled={isLoading || isRecording} variant="ghost" size="icon" aria-label="Export chat to PDF" className="text-muted-foreground hover:text-primary flex-shrink-0 h-10 w-10 rounded-lg">
                        <FileDown className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Export Chat to PDF</p>
                </TooltipContent>
            </Tooltip>
          </div>
      </div>
    </div>
  );
}
