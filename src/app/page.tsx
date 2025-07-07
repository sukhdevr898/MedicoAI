
"use client";

import { AppHeader } from '@/components/layout/Header';
import { SplashScreen } from '@/components/layout/SplashScreen';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useEffect, useState } from 'react';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAppMounted, setIsAppMounted] = useState(false);

  useEffect(() => {
    setIsAppMounted(true); 
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1800); 
    return () => clearTimeout(timer);
  }, []);

  // This logic helps prevent FOUC by ensuring splash screen or null is rendered until everything is ready.
  if (showSplash) { 
    return <SplashScreen />;
  }
  if (!isAppMounted && !showSplash) { 
    return null;
  }


  return (
    <>
      {/* SplashScreen is handled above to prevent appearing over loaded content */}
      <div className={`flex flex-col min-h-screen bg-background ${showSplash ? 'opacity-0' : 'opacity-100 transition-opacity duration-300 ease-in-out'}`}>
        <AppHeader />
        <main className="flex-grow flex flex-col overflow-hidden"> 
          <ChatInterface />
        </main>
      </div>
    </>
  );
}
