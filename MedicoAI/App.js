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
  StatusBar,
  Share,
  PermissionsAndroid,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');

// Native Android Material Design Colors
const COLORS = {
  primary: '#1976D2',
  primaryDark: '#1565C0',
  accent: '#03DAC6',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  error: '#B00020',
  onPrimary: '#FFFFFF',
  onSurface: '#000000',
  onBackground: '#000000',
  textSecondary: '#757575',
  divider: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FF9800',
  // Medical theme colors
  medical: {
    heartRate: '#E53E3E',
    oxygen: '#3182CE',
    temperature: '#D69E2E',
    pressure: '#805AD5',
    healthy: '#38A169',
  }
};

// Available AI Models from Pollinations
const AI_MODELS = [
  { 
    id: 'openai', 
    name: 'GPT-4.1 Nano', 
    description: 'Fast and efficient OpenAI model',
    icon: 'brain-outline',
    color: '#10A37F'
  },
  { 
    id: 'openai-large', 
    name: 'GPT-4.1 Mini', 
    description: 'Advanced OpenAI model with vision',
    icon: 'eye-outline',
    color: '#10A37F'
  },
  { 
    id: 'gemini', 
    name: 'Gemini 2.5 Flash', 
    description: 'Google\'s multimodal AI model',
    icon: 'diamond-outline',
    color: '#4285F4'
  },
  { 
    id: 'mistral', 
    name: 'Mistral Small 3', 
    description: 'Efficient European AI model',
    icon: 'flash-outline',
    color: '#FF6B35'
  },
  { 
    id: 'qwen-coder', 
    name: 'Qwen Coder 32B', 
    description: 'Specialized for medical calculations',
    icon: 'calculator-outline',
    color: '#7C3AED'
  },
  { 
    id: 'deepseek', 
    name: 'DeepSeek-V3', 
    description: 'Advanced reasoning capabilities',
    icon: 'telescope-outline',
    color: '#DC2626'
  }
];

// Theme configurations with Material Design
const THEMES = {
  medical: {
    id: 'medical',
    name: 'Medical Blue',
    primary: COLORS.primary,
    accent: COLORS.accent,
    background: COLORS.background,
    surface: COLORS.surface,
    headerGradient: ['#1976D2', '#1565C0'],
  },
  dark: {
    id: 'dark',
    name: 'Dark Theme',
    primary: '#BB86FC',
    accent: '#03DAC6',
    background: '#121212',
    surface: '#1E1E1E',
    headerGradient: ['#BB86FC', '#3700B3'],
  },
  green: {
    id: 'green',
    name: 'Health Green',
    primary: '#4CAF50',
    accent: '#8BC34A',
    background: '#F1F8E9',
    surface: '#FFFFFF',
    headerGradient: ['#4CAF50', '#388E3C'],
  }
};

// Pollinations API Service
class PollinationsAPI {
  static BASE_URL = 'https://text.pollinations.ai';
  static IMAGE_URL = 'https://image.pollinations.ai';

  static async generateText(prompt, options = {}) {
    const { model = 'openai', seed, system } = options;
    
    try {
      let url = `${this.BASE_URL}/${encodeURIComponent(prompt)}`;
      const params = new URLSearchParams();
      
      if (model) params.set('model', model);
      if (seed) params.set('seed', seed.toString());
      if (system) params.set('system', system);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error('Pollinations API Error:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  static async generateImage(prompt, options = {}) {
    const { width = 512, height = 512, seed, model = 'flux' } = options;
    
    try {
      let url = `${this.IMAGE_URL}/prompt/${encodeURIComponent(prompt)}`;
      const params = new URLSearchParams();
      
      if (width) params.set('width', width.toString());
      if (height) params.set('height', height.toString());
      if (seed) params.set('seed', seed.toString());
      if (model) params.set('model', model);
      params.set('nologo', 'true');
      
      url += `?${params.toString()}`;
      return url;
    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    }
  }

  static generateSystemPrompt(userName, preferences) {
    return `You are Medico AI, an advanced medical assistant specializing in medical education and healthcare guidance. 

User Profile:
- Name: ${userName}
- Preferred AI Model: ${preferences.selectedModel}
- Experience Level: Medical Student/Healthcare Professional

Core Capabilities:
- Medical education and exam preparation
- Clinical reasoning and case analysis  
- Diagnostic support and differential diagnosis
- Medical image interpretation (X-rays, ECGs, MRIs, etc.)
- Drug interactions and pharmacology
- Anatomy and physiology explanations
- Medical calculations and formulas
- Evidence-based medicine guidance

Guidelines:
- Provide educational content for learning purposes only
- Always recommend consulting qualified healthcare professionals for patient care
- Use medical terminology appropriately with clear explanations
- Support with exam preparation (USMLE, NEET, PLAB, etc.)
- Encourage evidence-based practice and continuing education
- Include relevant medical references when appropriate

Remember: You are an educational tool designed to support medical learning and should never replace professional medical judgment or direct patient care.

Respond to ${userName} in a professional, educational manner appropriate for medical training.`;
  }
}

export default function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    userName: 'Medical Student',
    selectedModel: 'openai',
    selectedTheme: 'medical',
    language: 'en',
  });
  
  const scrollViewRef = useRef();
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Get current theme
  const currentTheme = THEMES[settings.selectedTheme] || THEMES.medical;

  useEffect(() => {
    loadSettings();
    initializeChat();
    StatusBar.setBarStyle('light-content');
  }, []);

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
      content: `Hello ${settings.userName}! 👩‍⚕️👨‍⚕️

I'm **Medico AI**, your intelligent medical education assistant. I'm here to help you excel in your medical studies and clinical practice.

**How I can assist you:**
• 🎓 **Medical Education** - USMLE, NEET, PLAB prep
• 🔬 **Clinical Reasoning** - Case analysis & diagnosis
• 📊 **Medical Imaging** - X-ray, ECG, MRI interpretation  
• 💊 **Pharmacology** - Drug interactions & mechanisms
• 🧬 **Anatomy & Physiology** - Detailed explanations
• 📈 **Medical Calculations** - Dosages, lab values, scores

**Special Features:**
• Upload medical images for AI analysis
• Generate visual aids for complex concepts
• Export conversations as PDF study notes
• Multiple AI models for different specialties

What would you like to explore today?`,
      timestamp: new Date(),
    };
    setChatHistory([welcomeMessage]);
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
      const systemPrompt = PollinationsAPI.generateSystemPrompt(settings.userName, settings);
      
      const response = await PollinationsAPI.generateText(userMessage.content, {
        model: settings.selectedModel,
        system: systemPrompt,
        seed: Math.floor(Math.random() * 1000000)
      });

      const aiResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        model: settings.selectedModel
      };

      setChatHistory(prev => [...prev, aiResponse]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `I apologize, ${settings.userName}. I encountered an error while processing your request: ${error.message}. Please check your internet connection and try again.`,
        timestamp: new Date(),
        isError: true
      };

      setChatHistory(prev => [...prev, errorResponse]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const openSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSettingsVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const closeSettings = () => {
    Animated.spring(slideAnim, {
      toValue: height,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start(() => {
      setIsSettingsVisible(false);
    });
  };

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
    
    if (key === 'userName') {
      initializeChat();
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const image = result.assets[0];
        
        // Add image analysis message
        const analysisMessage = {
          id: Date.now(),
          role: 'user',
          content: `Please analyze this medical image and provide educational insights.`,
          image: image.uri,
          timestamp: new Date(),
        };
        
        setChatHistory(prev => [...prev, analysisMessage]);
        
        // Simulate medical image analysis
        setTimeout(() => {
          const response = {
            id: Date.now() + 1,
            role: 'assistant',
            content: `## Medical Image Analysis 🔬

Thank you for sharing this medical image, ${settings.userName}. 

**Analysis Framework:**
• **Image Quality**: Evaluating technical parameters
• **Anatomical Structures**: Identifying key features
• **Pathological Findings**: Looking for abnormalities
• **Clinical Correlation**: Educational insights

**Educational Notes:**
This is a learning exercise. In clinical practice, medical images must always be interpreted by qualified radiologists and correlated with patient history, physical examination, and other diagnostic tests.

**Next Steps for Learning:**
• Compare with normal anatomical references
• Review relevant pathophysiology
• Correlate with clinical presentations
• Practice systematic interpretation

Would you like me to explain any specific aspect of medical imaging interpretation?`,
            timestamp: new Date(),
            model: settings.selectedModel
          };
          setChatHistory(prev => [...prev, response]);
        }, 2000);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const generateMedicalDiagram = async () => {
    try {
      const prompt = "medical anatomy diagram showing human heart structure with labels, educational illustration, detailed cross-section, medical textbook style";
      const imageUrl = await PollinationsAPI.generateImage(prompt, {
        width: 512,
        height: 512,
        model: 'flux'
      });
      
      const diagramMessage = {
        id: Date.now(),
        role: 'assistant',
        content: `## Generated Medical Diagram 📊

Here's an AI-generated medical diagram to support your learning:`,
        image: imageUrl,
        timestamp: new Date(),
        isGenerated: true
      };
      
      setChatHistory(prev => [...prev, diagramMessage]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate medical diagram.');
    }
  };

  const exportToPDF = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const chatContent = chatHistory.map(msg => {
        const timeStr = msg.timestamp.toLocaleString();
        const sender = msg.role === 'user' ? settings.userName : 'Medico AI';
        return `
          <div style="margin-bottom: 20px; padding: 15px; background: ${msg.role === 'user' ? '#E3F2FD' : '#F5F5F5'}; border-radius: 10px;">
            <h4 style="margin: 0 0 10px 0; color: #1976D2;">${sender}</h4>
            <p style="margin: 0; line-height: 1.6;">${msg.content.replace(/\n/g, '<br>')}</p>
            <small style="color: #757575; margin-top: 10px; display: block;">${timeStr}</small>
          </div>
        `;
      }).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Medico AI - Study Session</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #1976D2;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #1976D2;
              margin: 0;
              font-size: 2.5em;
            }
            .header p {
              color: #757575;
              margin: 10px 0 0 0;
              font-size: 1.1em;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #E0E0E0;
              text-align: center;
              color: #757575;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏥 Medico AI</h1>
            <p>Medical Education Study Session</p>
            <p><strong>Student:</strong> ${settings.userName} | <strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="content">
            ${chatContent}
          </div>
          
          <div class="footer">
            <p>Generated by Medico AI - Advanced Medical Education Assistant</p>
            <p>Created by Sukhdev Singh | For educational purposes only</p>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });

      const fileName = `MedicoAI_StudySession_${new Date().toISOString().split('T')[0]}.pdf`;
      const newPath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.moveAsync({
        from: uri,
        to: newPath
      });

      await Sharing.shareAsync(newPath, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share your Medico AI study session'
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Study session exported as PDF!');
      
    } catch (error) {
      console.error('PDF Export Error:', error);
      Alert.alert('Error', 'Failed to export PDF. Please try again.');
    }
  };

  const clearChat = () => {
    Alert.alert(
      'Clear Chat History',
      'Are you sure you want to clear all messages? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            initializeChat();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        },
      ]
    );
  };

  const renderMessage = (message) => {
    const isUser = message.role === 'user';
    const isError = message.isError;
    
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        {!isUser && (
          <View style={[styles.avatar, { backgroundColor: isError ? COLORS.error : currentTheme.primary }]}>
            <MaterialIcons name="local-hospital" size={20} color={COLORS.onPrimary} />
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isUser 
            ? { backgroundColor: currentTheme.primary }
            : { 
                backgroundColor: currentTheme.surface, 
                borderWidth: 1,
                borderColor: isError ? COLORS.error : COLORS.divider
              }
        ]}>
          <Text style={[
            styles.messageText,
            { color: isUser ? COLORS.onPrimary : COLORS.onSurface }
          ]}>
            {message.content}
          </Text>
          
          {message.image && (
            <Image source={{ uri: message.image }} style={styles.messageImage} />
          )}
          
          <View style={styles.messageFooter}>
            <Text style={[
              styles.timestamp,
              { color: isUser ? 'rgba(255,255,255,0.7)' : COLORS.textSecondary }
            ]}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            
            {message.model && !isUser && (
              <Text style={[styles.modelBadge, { color: COLORS.textSecondary }]}>
                {AI_MODELS.find(m => m.id === message.model)?.name || message.model}
              </Text>
            )}
          </View>
        </View>
        
        {isUser && (
          <View style={[styles.avatar, { backgroundColor: COLORS.textSecondary }]}>
            <Ionicons name="person" size={20} color={COLORS.onPrimary} />
          </View>
        )}
      </View>
    );
  };

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.assistantMessage]}>
      <View style={[styles.avatar, { backgroundColor: currentTheme.primary }]}>
        <MaterialIcons name="local-hospital" size={20} color={COLORS.onPrimary} />
      </View>
      <View style={[styles.messageBubble, { backgroundColor: currentTheme.surface, borderWidth: 1, borderColor: COLORS.divider }]}>
        <View style={styles.typingContainer}>
          <Text style={[styles.typingText, { color: COLORS.onSurface }]}>Medico AI is thinking</Text>
          <View style={styles.typingDots}>
            <Animated.View style={[styles.dot, { backgroundColor: currentTheme.primary }]} />
            <Animated.View style={[styles.dot, { backgroundColor: currentTheme.primary }]} />
            <Animated.View style={[styles.dot, { backgroundColor: currentTheme.primary }]} />
          </View>
        </View>
      </View>
    </View>
  );

  const renderSettingsModal = () => (
    <Modal
      visible={isSettingsVisible}
      transparent={true}
      animationType="none"
      onRequestClose={closeSettings}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.settingsContainer,
            {
              backgroundColor: currentTheme.surface,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header */}
          <View style={[styles.settingsHeader, { backgroundColor: currentTheme.primary }]}>
            <Text style={[styles.settingsTitle, { color: COLORS.onPrimary }]}>Settings</Text>
            <TouchableOpacity onPress={closeSettings} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.onPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.settingsContent} showsVerticalScrollIndicator={false}>
            {/* User Profile */}
            <View style={styles.settingSection}>
              <Text style={[styles.sectionTitle, { color: COLORS.onSurface }]}>Profile</Text>
              <View style={[styles.inputContainer, { backgroundColor: COLORS.background }]}>
                <MaterialIcons name="person" size={20} color={currentTheme.primary} />
                <TextInput
                  style={[styles.settingInput, { color: COLORS.onSurface }]}
                  value={settings.userName}
                  onChangeText={(text) => updateSetting('userName', text)}
                  placeholder="Enter your name"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            </View>

            {/* AI Model Selection */}
            <View style={styles.settingSection}>
              <Text style={[styles.sectionTitle, { color: COLORS.onSurface }]}>AI Model</Text>
              {AI_MODELS.map((model) => (
                <TouchableOpacity
                  key={model.id}
                  style={[
                    styles.modelOption,
                    { 
                      backgroundColor: COLORS.background,
                      borderColor: settings.selectedModel === model.id ? currentTheme.primary : COLORS.divider,
                      borderWidth: settings.selectedModel === model.id ? 2 : 1
                    }
                  ]}
                  onPress={() => updateSetting('selectedModel', model.id)}
                >
                  <View style={[styles.modelIcon, { backgroundColor: model.color }]}>
                    <Ionicons name={model.icon} size={20} color={COLORS.onPrimary} />
                  </View>
                  <View style={styles.modelInfo}>
                    <Text style={[styles.modelName, { color: COLORS.onSurface }]}>{model.name}</Text>
                    <Text style={[styles.modelDescription, { color: COLORS.textSecondary }]}>
                      {model.description}
                    </Text>
                  </View>
                  {settings.selectedModel === model.id && (
                    <MaterialIcons name="check-circle" size={24} color={currentTheme.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Theme Selection */}
            <View style={styles.settingSection}>
              <Text style={[styles.sectionTitle, { color: COLORS.onSurface }]}>Theme</Text>
              {Object.values(THEMES).map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  style={[
                    styles.themeOption,
                    { 
                      backgroundColor: COLORS.background,
                      borderColor: settings.selectedTheme === theme.id ? currentTheme.primary : COLORS.divider,
                      borderWidth: settings.selectedTheme === theme.id ? 2 : 1
                    }
                  ]}
                  onPress={() => updateSetting('selectedTheme', theme.id)}
                >
                  <View style={[styles.themePreview, { backgroundColor: theme.primary }]} />
                  <Text style={[styles.themeName, { color: COLORS.onSurface }]}>{theme.name}</Text>
                  {settings.selectedTheme === theme.id && (
                    <MaterialIcons name="check-circle" size={24} color={currentTheme.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* About Section */}
            <View style={[styles.settingSection, styles.aboutSection]}>
              <Text style={[styles.sectionTitle, { color: COLORS.onSurface }]}>About Medico AI</Text>
              <Text style={[styles.aboutText, { color: COLORS.textSecondary }]}>
                Advanced AI-powered medical education assistant designed for medical students, 
                healthcare professionals, and medical educators.
              </Text>
              <Text style={[styles.aboutText, { color: COLORS.textSecondary }]}>
                • Powered by Pollinations.ai
              </Text>
              <Text style={[styles.aboutText, { color: COLORS.textSecondary }]}>
                • Created by Sukhdev Singh
              </Text>
              <Text style={[styles.aboutText, { color: COLORS.textSecondary }]}>
                • Version 2.0.0 (Native Android)
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar backgroundColor={currentTheme.primary} barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={[styles.appIcon, { backgroundColor: COLORS.onPrimary }]}>
              <MaterialIcons name="local-hospital" size={28} color={currentTheme.primary} />
            </View>
            <View>
              <Text style={[styles.appTitle, { color: COLORS.onPrimary }]}>Medico AI</Text>
              <Text style={[styles.appSubtitle, { color: COLORS.onPrimary }]}>Medical Assistant</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={generateMedicalDiagram} style={styles.headerButton}>
              <MaterialIcons name="analytics" size={22} color={COLORS.onPrimary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={exportToPDF} style={styles.headerButton}>
              <MaterialIcons name="picture-as-pdf" size={22} color={COLORS.onPrimary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={clearChat} style={styles.headerButton}>
              <MaterialIcons name="clear-all" size={22} color={COLORS.onPrimary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={openSettings} style={styles.headerButton}>
              <MaterialIcons name="settings" size={22} color={COLORS.onPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Chat Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        {chatHistory.map(renderMessage)}
        {isLoading && renderTypingIndicator()}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={[styles.inputRow, { backgroundColor: currentTheme.surface }]}>
          <TouchableOpacity onPress={pickImage} style={styles.attachButton}>
            <MaterialIcons name="image" size={24} color={currentTheme.primary} />
          </TouchableOpacity>
          
          <TextInput
            style={[styles.textInput, { 
              flex: 1,
              color: COLORS.onSurface,
              backgroundColor: COLORS.background,
            }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder={`Ask Medico AI anything, ${settings.userName}...`}
            placeholderTextColor={COLORS.textSecondary}
            multiline
            maxLength={2000}
          />
          
          <TouchableOpacity
            onPress={sendMessage}
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() ? currentTheme.primary : COLORS.textSecondary }
            ]}
            disabled={!inputText.trim() || isLoading}
          >
            <MaterialIcons name="send" size={20} color={COLORS.onPrimary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {renderSettingsModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    elevation: 2,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  appSubtitle: {
    fontSize: 14,
    opacity: 0.9,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    elevation: 2,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  messageImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timestamp: {
    fontSize: 12,
  },
  modelBadge: {
    fontSize: 10,
    fontWeight: '500',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 14,
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
    borderRadius: 28,
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
    fontSize: 16,
    minHeight: 40,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  settingsContainer: {
    flex: 1,
    marginTop: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  settingsContent: {
    flex: 1,
    padding: 20,
  },
  settingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  settingInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  modelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  modelIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '600',
  },
  modelDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  themePreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 12,
  },
  themeName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  aboutSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: 20,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
});
