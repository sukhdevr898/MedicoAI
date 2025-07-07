
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Stethoscope } from 'lucide-react'; // Or a custom SVG logo

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2800); // Animation duration is 3s, hide slightly before to avoid flicker
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-background animate-splash-fade-out">
      <div className="relative">
        <Stethoscope className="h-24 w-24 text-primary animate-pulse" /> 
        {/* Replace with Image for custom logo if available */}
        {/* <Image src="/logo.svg" alt="medicoAI Logo" width={150} height={150} className="animate-pulse" data-ai-hint="medical logo" /> */}
      </div>
      <h1 className="mt-6 text-4xl font-headline font-bold text-primary">medicoAI</h1>
      <p className="mt-2 text-lg text-muted-foreground">Analyzing Medical Images with AI</p>
    </div>
  );
}
