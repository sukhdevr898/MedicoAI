
import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2 p-3 self-start">
      <Bot className="h-6 w-6 text-primary" />
      <div className="text-sm text-muted-foreground flex items-end">
        <span>medicoAI is typing</span>
        <span className="animate-dot-elastic-main inline-block w-1 h-1 ml-0.5 rounded-full bg-muted-foreground"></span>
        <span className="animate-dot-elastic-before inline-block w-1 h-1 ml-0.5 rounded-full bg-muted-foreground"></span>
        <span className="animate-dot-elastic-after inline-block w-1 h-1 ml-0.5 rounded-full bg-muted-foreground"></span>
      </div>
    </div>
  );
}
