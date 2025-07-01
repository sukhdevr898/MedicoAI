import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import ApiService from './services/ApiService';

const { width, height } = Dimensions.get('window');

// Available AI Models
const AI_MODELS = [
  { id: 'openai', name: 'GPT-4.1-mini', description: 'OpenAI GPT-4.1-mini' },
  { id: 'mistral', name: 'Mistral Small 3.1', description: 'Mistral Small 3.1 24B' },
  { id: 'deepseek', name: 'DeepSeek-V3', description: 'DeepSeek-V3' },
  { id: 'grok', name: 'Grok-3 Mini', description: 'xAi Grok-3 Mini' },
  { id: 'phi', name: 'Phi-4 Instruct', description: 'Phi-4 Instruct' },
  { id: 'qwen-coder', name: 'Qwen 2.5 Coder', description: 'Qwen 2.5 Coder 32B' },
];

// Theme configurations
const THEMES = {
  default: {
    id: 'default',
    name: 'Medical Blue',
    primary: '#0c7ff2',
    secondary: '#e0f2fe',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#111827',
    textSecondary: '#49739c',
    gradient: ['#0c7ff2', '#3b82f6'],
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Blue',
    primary: '#0ea5e9',
    secondary: '#bae6fd',
    background: '#f0f9ff',
    surface: '#ffffff',
    text: '#0c4a6e',
    textSecondary: '#0369a1',
    gradient: ['#0ea5e9', '#0284c7'],
  },
  forest: {
    id: 'forest',
    name: 'Forest Green',
    primary: '#059669',
    secondary: '#bbf7d0',
    background: '#f0fdf4',
    surface: '#ffffff',
    text: '#064e3b',
    textSecondary: '#047857',
    gradient: ['#059669', '#10b981'],
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Orange',
    primary: '#f59e42',
    secondary: '#fed7aa',
    background: '#fff7ed',
    surface: '#ffffff',
    text: '#9a3412',
    textSecondary: '#ea580c',
    gradient: ['#f59e42', '#fb923c'],
  },
  dark: {
    id: 'dark',
    name: 'Dark Mode',
    primary: '#3b82f6',
    secondary: '#1e40af',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    gradient: ['#3b82f6', '#1d4ed8'],
  },
};

export default function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    userName: 'Student',
    selectedModel: 'mistral',
    selectedTheme: 'default',
    language: 'en',
  });
  
  const scrollViewRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Typing indicator animation
  const typingDot1 = useRef(new Animated.Value(0.3)).current;
  const typingDot2 = useRef(new Animated.Value(0.3)).current;
  const typingDot3 = useRef(new Animated.Value(0.3)).current;

  // Get current theme
  const currentTheme = THEMES[settings.selectedTheme];

  useEffect(() => {
    loadSettings();
    initializeChat();
    
    // Animate app entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animate typing indicator when loading
  useEffect(() => {
    if (isLoading) {
      const animateTyping = () => {
        Animated.sequence([
          Animated.timing(typingDot1, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(typingDot2, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(typingDot3, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(typingDot1, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.timing(typingDot2, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.timing(typingDot3, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]).start(() => {
          if (isLoading) animateTyping();
        });
      };
      animateTyping();
    } else {
      // Reset typing dots
      typingDot1.setValue(0.3);
      typingDot2.setValue(0.3);
      typingDot3.setValue(0.3);
    }
  }, [isLoading]);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('medicoAI_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('medicoAI_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const initializeChat = () => {
    const welcomeMessage = {
      id: Date.now(),
      role: 'assistant',
      content: `Hi ${settings.userName}! 👋\n\nI'm **Medico AI**, your specialized medical assistant. I'm here to help you with:\n\n• Medical studies & exam preparation\n• Clinical reasoning & case discussions\n• Medical research & explanations\n• Image analysis (ECGs, X-rays, etc.)\n• MCQs and OSCE preparation\n\nHow can I assist you today?`,
      timestamp: new Date(),
    };
    setChatHistory([welcomeMessage]);
  };

  const generateSystemPrompt = () => {
    return `You are Medico AI, a cutting-edge medical assistant designed to support medical students in studying, clinical reasoning, exam preparation, and medical research. You deliver detailed, evidence-based, and current medical knowledge, always citing authoritative sources and providing clear, comprehensive explanations.

User Information:
- Name: ${settings.userName}
- Preferred AI Model: ${AI_MODELS.find(m => m.id === settings.selectedModel)?.name || 'Mistral Small 3.1'}

You excel in analyzing images, illustrating concepts visually, and simulating clinical scenarios to enhance learning. You offer assistance with multiple-choice questions (MCQs), Objective Structured Clinical Examinations (OSCEs), case discussions, and more. Always ensure clarity by acknowledging uncertainties and strictly refrain from providing real patient care advice.

Respond in a helpful, educational manner appropriate for medical students and healthcare professionals in training. Address the user by name when appropriate and maintain a professional yet approachable tone.`;
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setChatHistory(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Call API service with current settings and chat history
      const response = await ApiService.sendToMCP(userMessage.content, {
        userName: settings.userName,
        selectedModel: settings.selectedModel,
        chatHistory: chatHistory,
        language: settings.language,
        images: [] // Will be populated when image feature is implemented
      });

      const aiResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        source: response.source
      };

      setChatHistory(prev => [...prev, aiResponse]);
      
      // Provide haptic feedback for successful response
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `I apologize, ${settings.userName}. I encountered an error while processing your request. Please check your internet connection and try again.`,
        timestamp: new Date(),
        source: 'error'
      };

      setChatHistory(prev => [...prev, errorResponse]);
      
      // Provide haptic feedback for error
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const openSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSettingsVisible(true);
  };

  const closeSettings = () => {
    setIsSettingsVisible(false);
  };

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
    
    if (key === 'userName') {
      // Refresh chat with new name
      initializeChat();
    }
  };

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      Alert.alert('Image Selected', 'Image analysis feature will be implemented with MCP server integration.');
    }
  };

  const clearChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: initializeChat 
        },
      ]
    );
  };

  const renderMessage = (message) => {
    const isUser = message.role === 'user';
    
    return (
      <Animated.View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        {!isUser && (
          <View style={[styles.avatar, { backgroundColor: currentTheme.primary }]}>
            <Ionicons name="medical" size={20} color="white" />
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isUser 
            ? { backgroundColor: currentTheme.primary }
            : { backgroundColor: currentTheme.surface, borderColor: currentTheme.secondary }
        ]}>
          <Text style={[
            styles.messageText,
            { color: isUser ? 'white' : currentTheme.text }
          ]}>
            {message.content}
          </Text>
          <Text style={[
            styles.timestamp,
            { color: isUser ? 'rgba(255,255,255,0.7)' : currentTheme.textSecondary }
          ]}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        
        {isUser && (
          <View style={[styles.avatar, { backgroundColor: currentTheme.textSecondary }]}>
            <Ionicons name="person" size={20} color="white" />
          </View>
        )}
      </Animated.View>
    );
  };

  const renderSettingsModal = () => (
    <Modal
      visible={isSettingsVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: currentTheme.background }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: currentTheme.text }]}>Settings</Text>
          <TouchableOpacity onPress={closeSettings} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={currentTheme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* User Name Section */}
          <View style={styles.settingSection}>
            <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Your Name</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: currentTheme.surface,
                borderColor: currentTheme.secondary,
                color: currentTheme.text 
              }]}
              value={settings.userName}
              onChangeText={(text) => updateSetting('userName', text)}
              placeholder="Enter your name"
              placeholderTextColor={currentTheme.textSecondary}
            />
          </View>

          {/* AI Model Selection */}
          <View style={styles.settingSection}>
            <Text style={[styles.settingLabel, { color: currentTheme.text }]}>AI Model</Text>
            <View style={styles.optionsList}>
              {AI_MODELS.map((model) => (
                <TouchableOpacity
                  key={model.id}
                  style={[
                    styles.optionItem,
                    { 
                      backgroundColor: currentTheme.surface,
                      borderColor: settings.selectedModel === model.id ? currentTheme.primary : currentTheme.secondary 
                    }
                  ]}
                  onPress={() => updateSetting('selectedModel', model.id)}
                >
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, { color: currentTheme.text }]}>{model.name}</Text>
                    <Text style={[styles.optionDescription, { color: currentTheme.textSecondary }]}>
                      {model.description}
                    </Text>
                  </View>
                  {settings.selectedModel === model.id && (
                    <Ionicons name="checkmark-circle" size={24} color={currentTheme.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Theme Selection */}
          <View style={styles.settingSection}>
            <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Theme</Text>
            <View style={styles.optionsList}>
              {Object.values(THEMES).map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  style={[
                    styles.optionItem,
                    { 
                      backgroundColor: currentTheme.surface,
                      borderColor: settings.selectedTheme === theme.id ? currentTheme.primary : currentTheme.secondary 
                    }
                  ]}
                  onPress={() => updateSetting('selectedTheme', theme.id)}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.themePreview}>
                      <LinearGradient
                        colors={theme.gradient}
                        style={styles.themeGradient}
                      />
                      <Text style={[styles.optionTitle, { color: currentTheme.text }]}>{theme.name}</Text>
                    </View>
                  </View>
                  {settings.selectedTheme === theme.id && (
                    <Ionicons name="checkmark-circle" size={24} color={currentTheme.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Language Selection */}
          <View style={styles.settingSection}>
            <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Language</Text>
            <View style={styles.optionsList}>
              {[
                { code: 'en', name: 'English', flag: '🇺🇸' },
                { code: 'es', name: 'Español', flag: '🇪🇸' },
                { code: 'fr', name: 'Français', flag: '🇫🇷' },
                { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
                { code: 'it', name: 'Italiano', flag: '🇮🇹' },
                { code: 'pt', name: 'Português', flag: '🇧🇷' },
              ].map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.optionItem,
                    { 
                      backgroundColor: currentTheme.surface,
                      borderColor: settings.language === lang.code ? currentTheme.primary : currentTheme.secondary 
                    }
                  ]}
                  onPress={() => updateSetting('language', lang.code)}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.languageOption}>
                      <Text style={styles.flagEmoji}>{lang.flag}</Text>
                      <Text style={[styles.optionTitle, { color: currentTheme.text }]}>{lang.name}</Text>
                    </View>
                  </View>
                  {settings.language === lang.code && (
                    <Ionicons name="checkmark-circle" size={24} color={currentTheme.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* About Section */}
          <View style={[styles.settingSection, styles.aboutSection]}>
            <Text style={[styles.settingLabel, { color: currentTheme.text }]}>About Medico AI</Text>
            <Text style={[styles.aboutText, { color: currentTheme.textSecondary }]}>
              Created by Sukhdev Singh for medical education and training. This app integrates with MCP servers to provide intelligent medical assistance.
            </Text>
            <Text style={[styles.aboutText, { color: currentTheme.textSecondary }]}>
              Version 1.0.0 • Built with React Native & Expo
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar style={settings.selectedTheme === 'dark' ? 'light' : 'dark'} />
      
      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Header */}
        <LinearGradient
          colors={currentTheme.gradient}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.appIcon}>
                <Ionicons name="medical" size={28} color="white" />
              </View>
              <View>
                <Text style={styles.appTitle}>Medico AI</Text>
                <Text style={styles.appSubtitle}>Medical Assistant</Text>
              </View>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={clearChat} style={styles.headerButton}>
                <Ionicons name="trash-outline" size={22} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={openSettings} style={styles.headerButton}>
                <Ionicons name="settings-outline" size={22} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Chat Area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {chatHistory.map(renderMessage)}
          
          {isLoading && (
            <View style={[styles.messageContainer, styles.assistantMessage]}>
              <View style={[styles.avatar, { backgroundColor: currentTheme.primary }]}>
                <Ionicons name="medical" size={20} color="white" />
              </View>
              <View style={[styles.messageBubble, { 
                backgroundColor: currentTheme.surface,
                borderColor: currentTheme.secondary 
              }]}>
                <View style={styles.typingIndicator}>
                  <Animated.View 
                    style={[
                      styles.typingDot, 
                      { 
                        backgroundColor: currentTheme.primary,
                        opacity: typingDot1
                      }
                    ]} 
                  />
                  <Animated.View 
                    style={[
                      styles.typingDot, 
                      { 
                        backgroundColor: currentTheme.primary,
                        opacity: typingDot2
                      }
                    ]} 
                  />
                  <Animated.View 
                    style={[
                      styles.typingDot, 
                      { 
                        backgroundColor: currentTheme.primary,
                        opacity: typingDot3
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <View style={[styles.inputRow, { backgroundColor: currentTheme.surface }]}>
            <TouchableOpacity onPress={pickImage} style={styles.attachButton}>
              <Ionicons name="camera" size={24} color={currentTheme.primary} />
            </TouchableOpacity>
            
            <TextInput
              style={[styles.textInput, { 
                flex: 1,
                color: currentTheme.text,
                backgroundColor: currentTheme.background,
                borderColor: currentTheme.secondary 
              }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder={`Ask Medico AI anything, ${settings.userName}...`}
              placeholderTextColor={currentTheme.textSecondary}
              multiline
              maxLength={1000}
            />
            
            <TouchableOpacity
              onPress={sendMessage}
              style={[
                styles.sendButton,
                { backgroundColor: inputText.trim() ? currentTheme.primary : currentTheme.textSecondary }
              ]}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>

      {renderSettingsModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  appSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  textInput: {
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  settingSection: {
    marginBottom: 32,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsList: {
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  themePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeGradient: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  aboutSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 24,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
});
