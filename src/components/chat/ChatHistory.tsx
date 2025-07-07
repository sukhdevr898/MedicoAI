
"use client";

import type { Message } from '@/types/chat';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ChatHistoryProps {
  messages: Message[];
  isBotTyping: boolean;
}

export function ChatHistory({ messages, isBotTyping }: ChatHistoryProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      if (viewportRef.current) {
        viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
      }
    };

    // Scroll immediately
    scrollToBottom();

    // And again after a short delay to catch any final layout shifts or content loading
    const timer = setTimeout(scrollToBottom, 300); 

    return () => clearTimeout(timer);
  }, [messages, isBotTyping]);

  return (
    <ScrollArea className="h-full" viewportRef={viewportRef}>
      <div className="p-3 sm:p-4 md:p-6 space-y-3">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isBotTyping && <TypingIndicator />}
      </div>
    </ScrollArea>
  );
}
