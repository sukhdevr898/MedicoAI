
"use client";

import type { Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Copy, User, BotIcon, PlayCircle } from 'lucide-react'; 
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import Image from 'next/image';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { toast } = useToast();
  const isUser = message.sender === 'user';

  const handleCopy = () => {
    const textToCopy = message.userTranscript || message.text;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast({ title: "Copied to clipboard!", description: "Message content copied." });
      })
      .catch(err => {
        console.error("Failed to copy text: ", err);
        toast({ title: "Copy failed", description: "Could not copy message to clipboard.", variant: "destructive" });
      });
  };

  const handlePlayAudio = () => {
    if (message.botAudioResponseUrl) {
      const audio = new Audio(message.botAudioResponseUrl);
      audio.play().catch(e => {
        console.error("Error replaying audio:", e);
        toast({title: "Playback Error", description: "Could not replay audio.", variant: "destructive"});
      });
    }
  };

  if (message.isTyping) {
      return null; 
  }

  return (
    <div className={cn("flex items-start space-x-3 py-2", isUser ? "justify-end pl-8 sm:pl-12" : "justify-start pr-8 sm:pr-12")}>
      {!isUser && (
        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 self-start flex-shrink-0 mt-1">
          <AvatarFallback className="bg-primary/10 text-primary"><BotIcon className="h-4 w-4 sm:h-5 sm:w-5" /></AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[80%] md:max-w-[75%] rounded-xl p-3 shadow-md", 
          isUser 
            ? "bg-primary text-primary-foreground rounded-br-lg" 
            : "bg-card text-card-foreground border border-border rounded-bl-lg" 
        )}
      >
        {message.previewUrl && (
          <div className="mb-2 relative overflow-hidden rounded-lg border border-border/50 shadow-inner bg-muted/20">
            <Image 
              src={message.previewUrl} 
              alt="Uploaded preview" 
              width={300}
              height={300} 
              className="object-contain max-h-[280px] sm:max-h-[320px] w-auto rounded-md"
              data-ai-hint="medical scan"
            />
          </div>
        )}
        
        {message.userTranscript && (
          <div className="italic text-sm mb-1 opacity-90">{message.userTranscript}</div>
        )}

        {/* Display text only if it's not effectively duplicated by userTranscript for user messages */}
        {message.text && (!isUser || !message.userTranscript || message.text !== message.userTranscript.replace(/^🗣️\s*"/, '').replace(/"$/, '')) && (
            <div className={cn("min-w-0 w-full text-sm leading-relaxed break-words prose prose-sm dark:prose-invert max-w-none overflow-x-auto", 
                            !isUser && "prose-p:text-card-foreground prose-strong:text-card-foreground prose-headings:text-card-foreground prose-a:text-primary prose-code:text-accent-foreground prose-blockquote:text-muted-foreground",
                            isUser && "prose-p:text-primary-foreground prose-strong:text-primary-foreground prose-headings:text-primary-foreground prose-a:text-accent prose-a:hover:text-accent/80 prose-code:text-primary-foreground/80 prose-blockquote:text-primary-foreground/70"
                          )}>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    components={{
                        code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                            <pre className={cn("font-code p-3 rounded-md overflow-x-auto my-2 text-xs shadow-sm", isUser ? "bg-primary/80 text-primary-foreground" : "bg-muted/70 dark:bg-muted/40")} {...props}>
                                <code className={className}>{children}</code>
                            </pre>
                        ) : (
                            <code className={cn(className, "font-code px-1 py-0.5 rounded text-xs", isUser ? "bg-primary/70" : "bg-muted/60 dark:bg-muted/40")} {...props}>
                            {children}
                            </code>
                        )
                        },
                        p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside my-1 pl-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside my-1 pl-1" {...props} />,
                        a: ({node, ...props}) => <a className={cn("hover:underline", isUser ? "text-primary-foreground font-medium" : "text-primary font-medium")} {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className={cn("border-l-4 pl-3 italic my-1", isUser ? "border-primary-foreground/50" : "border-border")} {...props} />,
                    }}
                >
                    {message.text}
                </ReactMarkdown>
            </div>
        )}


        <div className="mt-1.5 flex items-center justify-between">
          <p className={cn("text-xs", isUser ? "text-primary-foreground/60" : "text-muted-foreground/80")}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <div className="flex items-center space-x-1">
            {message.botAudioResponseUrl && !isUser && (
                <Button variant="ghost" size="icon" className="h-6 w-6 text-accent hover:text-accent/80 opacity-70 hover:opacity-100" onClick={handlePlayAudio} aria-label="Play audio response">
                <PlayCircle className="h-3.5 w-3.5" />
                </Button>
            )}
            {(message.text || message.userTranscript) && (
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-accent-foreground opacity-50 hover:opacity-100" onClick={handleCopy} aria-label="Copy message">
                <Copy className="h-3 w-3" />
                </Button>
            )}
          </div>
        </div>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 self-start flex-shrink-0 mt-1"> 
          <AvatarFallback className="bg-accent/30 dark:bg-accent/20 text-accent-foreground"><User className="h-4 w-4 sm:h-5 sm:w-5" /></AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
