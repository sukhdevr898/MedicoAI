
"use client";

import { Settings, Stethoscope, Info } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { AboutModal } from './AboutModal';
import { useState } from 'react';

export function AppHeader() {
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <Stethoscope className="h-7 w-7 sm:h-8 sm:w-8 text-primary" /> 
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">medicoAI</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="About medicoAI" 
              className="text-muted-foreground hover:text-primary rounded-full"
              onClick={() => setIsAboutModalOpen(true)}
            >
              <Info className="h-5 w-5" />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open settings" className="text-muted-foreground hover:text-primary rounded-full">
                  <Settings className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full max-w-md sm:max-w-lg p-0 flex flex-col">
                <SheetHeader className="p-6 pb-4 border-b">
                  <SheetTitle className="text-xl font-semibold">Settings</SheetTitle>
                  <SheetDescription className="text-sm">
                    Customize appearance and AI models.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-grow p-6 overflow-y-auto">
                  <SettingsForm />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <AboutModal isOpen={isAboutModalOpen} onOpenChange={setIsAboutModalOpen} />
    </>
  );
}
