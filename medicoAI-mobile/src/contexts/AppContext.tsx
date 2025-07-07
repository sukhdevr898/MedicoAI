import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppSettings, User, Message, DEFAULT_SETTINGS } from '../types';
import { StorageService } from '../services/storageService';

interface AppContextType {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Settings state
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Chat state
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  
  // App state
  isLoading: boolean;
  isFirstTime: boolean;
  
  // Functions
  saveUserData: (userData: User) => Promise<void>;
  completeSetup: () => Promise<void>;
  resetApp: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [user, setUserState] = useState<User | null>(null);
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [messages, setMessagesState] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(true);

  // Initialize app data on mount
  useEffect(() => {
    initializeApp();
  }, []);

  // Save chat history whenever messages change
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      StorageService.saveChatHistory(messages).catch(console.error);
    }
  }, [messages, isLoading]);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      
      // Check if first time
      const firstTime = await StorageService.isFirstTime();
      setIsFirstTime(firstTime);
      
      // Load user data
      const userData = await StorageService.getUser();
      setUserState(userData);
      
      // Load settings
      const settingsData = await StorageService.getSettings();
      setSettingsState(settingsData);
      
      // Load chat history if not first time
      if (!firstTime) {
        const chatHistory = await StorageService.getChatHistory();
        setMessagesState(chatHistory);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUser = (userData: User | null) => {
    setUserState(userData);
    if (userData) {
      StorageService.saveUser(userData).catch(console.error);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettingsState(updatedSettings);
    try {
      await StorageService.saveSettings(updatedSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const setMessages = (newMessages: Message[]) => {
    setMessagesState(newMessages);
  };

  const addMessage = (message: Message) => {
    setMessagesState(prev => [...prev, message]);
  };

  const clearMessages = async () => {
    setMessagesState([]);
    try {
      await StorageService.clearChatHistory();
    } catch (error) {
      console.error('Error clearing messages:', error);
    }
  };

  const saveUserData = async (userData: User) => {
    try {
      await StorageService.saveUser(userData);
      setUserState(userData);
      
      // Update settings with user data
      const updatedSettings = { ...settings, user: userData };
      await StorageService.saveSettings(updatedSettings);
      setSettingsState(updatedSettings);
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  };

  const completeSetup = async () => {
    try {
      await StorageService.setNotFirstTime();
      setIsFirstTime(false);
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: user 
          ? `Hello ${user.name}! I'm medicoAI. Upload a medical image, type a question, or use the mic to talk. You can change AI models and voice in Settings.`
          : `Hello! I'm medicoAI. Upload a medical image, type a question, or use the mic to talk. You can change AI models and voice in Settings.`,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessagesState([welcomeMessage]);
    } catch (error) {
      console.error('Error completing setup:', error);
      throw error;
    }
  };

  const resetApp = async () => {
    try {
      await StorageService.resetAllData();
      setUserState(null);
      setSettingsState(DEFAULT_SETTINGS);
      setMessagesState([]);
      setIsFirstTime(true);
    } catch (error) {
      console.error('Error resetting app:', error);
      throw error;
    }
  };

  const contextValue: AppContextType = {
    user,
    setUser,
    settings,
    updateSettings,
    messages,
    setMessages,
    addMessage,
    clearMessages,
    isLoading,
    isFirstTime,
    saveUserData,
    completeSetup,
    resetApp,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}