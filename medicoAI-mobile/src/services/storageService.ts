import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, User, Message, STORAGE_KEYS, DEFAULT_SETTINGS } from '../types';

/**
 * Storage service for handling app data persistence
 */
export class StorageService {
  /**
   * Save user data to storage
   */
  static async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw new Error('Failed to save user data');
    }
  }

  /**
   * Get user data from storage
   */
  static async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Error loading user data:', error);
      return null;
    }
  }

  /**
   * Save app settings to storage
   */
  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  /**
   * Get app settings from storage
   */
  static async getSettings(): Promise<AppSettings> {
    try {
      const settingsData = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (settingsData) {
        const parsed = JSON.parse(settingsData);
        // Merge with defaults to ensure all properties exist
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save chat history to storage
   */
  static async saveChatHistory(messages: Message[]): Promise<void> {
    try {
      const serializedMessages = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      }));
      await AsyncStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(serializedMessages));
    } catch (error) {
      console.error('Error saving chat history:', error);
      throw new Error('Failed to save chat history');
    }
  }

  /**
   * Get chat history from storage
   */
  static async getChatHistory(): Promise<Message[]> {
    try {
      const historyData = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
      if (historyData) {
        const parsed = JSON.parse(historyData);
        // Convert timestamp strings back to Date objects
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }

  /**
   * Clear chat history
   */
  static async clearChatHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw new Error('Failed to clear chat history');
    }
  }

  /**
   * Check if this is the user's first time using the app
   */
  static async isFirstTime(): Promise<boolean> {
    try {
      const firstTime = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_TIME);
      return firstTime === null;
    } catch (error) {
      console.error('Error checking first time status:', error);
      return true;
    }
  }

  /**
   * Mark that the user has completed the first-time setup
   */
  static async setNotFirstTime(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_TIME, 'false');
    } catch (error) {
      console.error('Error setting first time status:', error);
      throw new Error('Failed to update first time status');
    }
  }

  /**
   * Reset all app data (for debugging or user logout)
   */
  static async resetAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.SETTINGS,
        STORAGE_KEYS.CHAT_HISTORY,
        STORAGE_KEYS.FIRST_TIME,
      ]);
    } catch (error) {
      console.error('Error resetting app data:', error);
      throw new Error('Failed to reset app data');
    }
  }

  /**
   * Get all storage keys for debugging
   */
  static async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  /**
   * Get storage usage information
   */
  static async getStorageInfo(): Promise<{ keys: readonly string[]; totalSize: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        if (key.startsWith('medicoAI_')) {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            totalSize += value.length;
          }
        }
      }
      
      return { keys, totalSize };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { keys: [], totalSize: 0 };
    }
  }
}