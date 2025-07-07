
"use client";

import type { ReactNode } from 'react';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </SettingsProvider>
  );
}
