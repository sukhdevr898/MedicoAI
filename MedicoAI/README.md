# 🏥 Medico AI - React Native Mobile App

> AI-powered medical assistant for students and healthcare professionals

![Medico AI](https://img.shields.io/badge/Platform-React%20Native-blue?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Built%20with-Expo-black?style=for-the-badge&logo=expo)
![Medical AI](https://img.shields.io/badge/Medical-AI%20Assistant-green?style=for-the-badge&logo=medical)

## 📱 Features

### 🎯 Core Functionality
- **Intelligent Medical Chat**: AI-powered conversations for medical education
- **Multi-Modal Support**: Text and image analysis (ECGs, X-rays, medical images)
- **Model Selection**: Choose from multiple AI models (GPT-4.1, Mistral, DeepSeek, etc.)
- **Conversation Memory**: Context-aware responses with chat history
- **Real-time Responses**: Fast and accurate medical information

### 🎨 Beautiful UI/UX
- **Modern Design**: Stunning gradient-based medical theme
- **Multiple Themes**: 5 gorgeous themes (Medical Blue, Ocean, Forest, Sunset, Dark)
- **Smooth Animations**: Entrance animations, typing indicators, haptic feedback
- **Responsive Layout**: Optimized for Android devices
- **Accessibility**: High contrast colors and readable typography

### ⚙️ Advanced Settings
- **Personalization**: Custom user name integration
- **Theme Customization**: 5 beautiful themes with gradient designs
- **Language Support**: Multi-language interface (EN, ES, FR, DE, IT, PT)
- **Model Configuration**: Easy AI model switching
- **Local Storage**: Settings persistence across app sessions

### 🔧 Technical Features
- **MCP Server Integration**: Full compatibility with existing PHP backend
- **Fallback API**: Automatic failover to Pollinations.ai
- **Image Processing**: Vision capabilities for medical image analysis
- **Error Handling**: Robust error management with user feedback
- **Performance Optimized**: Smooth scrolling and efficient rendering

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Expo CLI
- Android Studio (for Android development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sukhdevr898/medico-ai-mobile.git
   cd MedicoAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure MCP Server**
   
   Update the server URL in `services/ApiService.js`:
   ```javascript
   const MCP_SERVER_URL = 'https://your-domain.com/mcp-server.php';
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on Android**
   ```bash
   npm run android
   ```

## 🔌 MCP Server Integration

### Server Requirements
The app is designed to work with the existing PHP MCP server from the original medico.html implementation.

### API Endpoints
- **Primary**: `mcp-server.php` - Main MCP protocol endpoint
- **Fallback**: `https://text.pollinations.ai` - Backup API service

### Request Format
```json
{
  "prompt": "User's medical question",
  "images": ["base64_encoded_image_data"],
  "system_prompt": "Generated system prompt with user context",
  "language": "en",
  "model": "mistral",
  "memory": [
    {
      "role": "user|assistant",
      "content": "Previous conversation",
      "images": []
    }
  ]
}
```

### Response Format
```json
{
  "content": "AI response content",
  "success": true,
  "source": "mcp|fallback|error"
}
```

## 🎨 Themes & Customization

### Available Themes
1. **Medical Blue** - Classic medical interface
2. **Ocean Blue** - Calm ocean-inspired colors
3. **Forest Green** - Natural healing theme
4. **Sunset Orange** - Warm and energetic
5. **Dark Mode** - Modern dark interface

### Color System
Each theme includes:
- Primary colors for buttons and accents
- Gradient combinations for headers
- Background and surface colors
- Text color variations
- Semantic color mappings

## 📋 Models & AI Integration

### Supported AI Models
- **OpenAI**: GPT-4.1-mini, GPT-4.1-nano, GPT-4.1 (full)
- **Mistral**: Small 3.1 24B
- **DeepSeek**: V3, R1-0528 (reasoning)
- **xAI**: Grok-3 Mini
- **Microsoft**: Phi-4 Instruct
- **Qwen**: 2.5 Coder 32B

### Model Features
- Vision capabilities for medical image analysis
- Reasoning models for complex medical problems
- Specialized coding models for medical calculations
- Multi-modal support (text + images)

## 🌐 Localization

### Supported Languages
- 🇺🇸 **English** - Primary language
- 🇪🇸 **Español** - Spanish
- 🇫🇷 **Français** - French
- 🇩🇪 **Deutsch** - German
- 🇮🇹 **Italiano** - Italian
- 🇧🇷 **Português** - Portuguese

### Adding New Languages
1. Update language list in `App.js`
2. Add language code to `ApiService.js`
3. Update UI text translations (future enhancement)

## 🏗️ Architecture

### Project Structure
```
MedicoAI/
├── components/          # Reusable UI components
│   └── TypingIndicator.js
├── services/           # API and business logic
│   └── ApiService.js
├── assets/            # Images and static files
├── App.js            # Main application component
├── app.json          # Expo configuration
└── package.json      # Dependencies
```

### Key Components
- **App.js**: Main application with chat interface and settings
- **ApiService.js**: MCP server integration and API handling
- **TypingIndicator.js**: Animated typing feedback component

### State Management
- React Hooks for local state
- AsyncStorage for persistent settings
- Real-time chat history management

## 🔧 Configuration

### Environment Variables
Create a `.env` file for production:
```env
MCP_SERVER_URL=https://your-production-server.com/mcp-server.php
FALLBACK_API_URL=https://text.pollinations.ai
API_TIMEOUT=30000
```

### Build Configuration
Update `app.json` for production:
- Bundle identifiers
- API keys
- Permission descriptions
- App store metadata

## 📱 Building for Production

### Android APK
```bash
expo build:android
```

### Android App Bundle (AAB)
```bash
expo build:android --type app-bundle
```

### Development Build
```bash
npx create-expo-app --template
expo install expo-dev-client
expo run:android
```

## 🤝 Contributing

### Development Guidelines
1. Follow React Native best practices
2. Use TypeScript for new features (migration planned)
3. Maintain consistent code formatting
4. Add proper error handling
5. Include comprehensive testing

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Add tests if applicable
4. Update documentation
5. Submit pull request

## 📄 License

Created by **Sukhdev Singh** for medical education and training.

### Contact
- 🐙 **GitHub**: [@sukhdevr898](https://github.com/sukhdevr898)
- 📧 **Email**: sukhdevr898@gmail.com
- 📱 **Instagram**: [@sukh_rai898](https://instagram.com/sukh_rai898)

### Projects by Sukhdev Singh
- Medico AI (Web & Mobile)
- AI-898 Dashboard
- Vision Model
- AI Deep Research
- Medical Advisor for Women's Health
- Timeline 898 (Students)
- AI-898 Chatbot (Google Collaboration)

## 🙏 Acknowledgments

Special thanks to **Chhaya Rathod**, MBBS student, for inspiring this medical education tool.

### Technology Stack
- **React Native** - Mobile framework
- **Expo** - Development platform
- **AsyncStorage** - Local storage
- **Linear Gradient** - Beautiful UI effects
- **Vector Icons** - Comprehensive icon set
- **Image Picker** - Media handling
- **Haptics** - Tactile feedback

---

<div align="center">

**Made with ❤️ for Medical Education**

*Empowering the next generation of healthcare professionals with AI*

</div>