
"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeColors = {
  primary: string;
  background: string;
  accent: string;
};

type FontSize = 'sm' | 'base' | 'lg';

const defaultThemeColors: ThemeColors = {
  primary: '142 57% 48%', // Forest Green
  background: '150 17% 96%', // Very light green
  accent: '112 51% 53%', // Lime green
};

const defaultFontSize: FontSize = 'base';
const defaultImageModel: string = 'openai-large';
const defaultTextModel: string = 'openai';
const defaultAiVoice: string = 'nova'; // Default voice for TTS

export const availableVoices = ["alloy","echo","fable","onyx","nova","shimmer","coral","verse","ballad","ash","sage","amuch","dan"];


interface SettingsContextProps {
  themeColors: ThemeColors;
  setThemeColors: Dispatch<SetStateAction<ThemeColors>>;
  fontSize: FontSize;
  setFontSize: Dispatch<SetStateAction<FontSize>>;
  selectedImageModel: string;
  setSelectedImageModel: Dispatch<SetStateAction<string>>;
  selectedTextModel: string;
  setSelectedTextModel: Dispatch<SetStateAction<string>>;
  selectedAiVoice: string;
  setSelectedAiVoice: Dispatch<SetStateAction<string>>;
  isMounted: boolean;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [themeColors, setThemeColors] = useState<ThemeColors>(defaultThemeColors);
  const [fontSize, setFontSize] = useState<FontSize>(defaultFontSize);
  const [selectedImageModel, setSelectedImageModel] = useState<string>(defaultImageModel);
  const [selectedTextModel, setSelectedTextModel] = useState<string>(defaultTextModel);
  const [selectedAiVoice, setSelectedAiVoice] = useState<string>(defaultAiVoice);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Load theme colors
    const storedColors = localStorage.getItem('medicoAI-themeColors');
    if (storedColors) {
      try {
        setThemeColors(JSON.parse(storedColors));
      } catch (error) {
        console.error("Failed to parse stored theme colors", error);
        localStorage.removeItem('medicoAI-themeColors');
      }
    }

    // Load font size
    const storedFontSize = localStorage.getItem('medicoAI-fontSize') as FontSize | null;
    if (storedFontSize && ['sm', 'base', 'lg'].includes(storedFontSize)) {
      setFontSize(storedFontSize);
    }

    // Load selected image model
    const storedImageModel = localStorage.getItem('medicoAI-imageModel');
    if (storedImageModel) {
      setSelectedImageModel(storedImageModel);
    } else {
      setSelectedImageModel(defaultImageModel);
    }

    // Load selected text model
    const storedTextModel = localStorage.getItem('medicoAI-textModel');
    if (storedTextModel) {
      setSelectedTextModel(storedTextModel);
    } else {
      setSelectedTextModel(defaultTextModel);
    }

    // Load selected AI voice
    const storedAiVoice = localStorage.getItem('medicoAI-aiVoice');
    if (storedAiVoice && availableVoices.includes(storedAiVoice)) {
      setSelectedAiVoice(storedAiVoice);
    } else {
      setSelectedAiVoice(defaultAiVoice);
    }
    
    setIsMounted(true);
  }, []);

  // Effect for theme colors
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('medicoAI-themeColors', JSON.stringify(themeColors));
    const root = document.documentElement;
    root.style.setProperty('--primary', themeColors.primary);
    root.style.setProperty('--background', themeColors.background);
    root.style.setProperty('--accent', themeColors.accent);
    root.style.setProperty('--card', themeColors.background);
    root.style.setProperty('--popover', themeColors.background);
  }, [themeColors, isMounted]);

  // Effect for font size
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('medicoAI-fontSize', fontSize);
    document.body.classList.remove('text-sm', 'text-base', 'text-lg');
    document.body.classList.add(`text-${fontSize}`);
  }, [fontSize, isMounted]);

  // Effect for selected image model
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('medicoAI-imageModel', selectedImageModel);
  }, [selectedImageModel, isMounted]);

  // Effect for selected text model
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('medicoAI-textModel', selectedTextModel);
  }, [selectedTextModel, isMounted]);

  // Effect for selected AI voice
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('medicoAI-aiVoice', selectedAiVoice);
  }, [selectedAiVoice, isMounted]);

  return (
    <SettingsContext.Provider value={{ 
      themeColors, setThemeColors, 
      fontSize, setFontSize, 
      selectedImageModel, setSelectedImageModel,
      selectedTextModel, setSelectedTextModel,
      selectedAiVoice, setSelectedAiVoice,
      isMounted 
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
