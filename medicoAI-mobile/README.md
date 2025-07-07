# medicoAI Mobile App

A professional React Native Android app built with Expo that provides AI-powered medical image analysis and intelligent health assistance.

## 🌟 Features

### Core Functionality
- **Medical Image Analysis**: Upload and analyze medical images using AI-powered insights
- **Smart Chat Interface**: Ask medical questions and receive intelligent responses
- **Voice Interaction**: Use voice commands for hands-free communication (coming soon)
- **Personalized Experience**: User setup with name, age, and email for customized interactions

### UI/UX Features
- **Beautiful Modern Design**: Stunning UI with smooth animations and transitions
- **Gradient Backgrounds**: Professional green-themed gradient design
- **Smooth Animations**: Fluid animations throughout the app
- **Responsive Layout**: Optimized for different screen sizes
- **Rounded Corners**: Modern design with smooth rounded corners
- **Vector Icons**: Professional iconography using Ionicons

### Technical Features
- **TypeScript**: Full TypeScript support for type safety
- **Local Storage**: Persistent data storage using AsyncStorage
- **Settings Management**: Customizable app settings and preferences
- **Navigation**: Smooth navigation between screens
- **Error Handling**: Comprehensive error handling and user feedback

## 🚀 App Flow

1. **Splash Screen**: Beautiful animated introduction with medicoAI branding
2. **Welcome Screen** (First-time users): Feature overview and onboarding
3. **Setup Screen** (First-time users): Collect user information (name, age, email)
4. **Main App**: Chat interface for medical consultations and image analysis

For returning users: Splash Screen → Main App

## 🛠 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Expo Go app (for testing on physical device)

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone [repository-url]
   cd medicoAI-mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**:
   - **Android**: `npx expo run:android`
   - **Expo Go**: Scan QR code with Expo Go app
   - **Web**: `npx expo start --web`

## 📱 Supported Platforms

- ✅ Android
- ✅ Expo Go (iOS/Android)
- ✅ Web (for testing)
- 🔄 iOS (requires Mac for full native build)

## 🔧 Configuration

### Environment Setup
The app uses Pollinations AI for backend services. No additional API keys required for basic functionality.

### Permissions
The app requests the following permissions:
- **Camera**: For capturing medical images
- **Photo Library**: For selecting images from gallery
- **Microphone**: For voice interactions (future feature)

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
│   └── AppContext.tsx  # Main app state management
├── screens/            # Screen components
│   ├── SplashScreen.tsx
│   ├── WelcomeScreen.tsx
│   └── SetupScreen.tsx
├── services/           # API and storage services
│   ├── aiService.ts    # AI integration
│   └── storageService.ts # Local storage
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🎨 Design System

### Colors
- **Primary**: #49c140 (Forest Green)
- **Background**: #f4f8f5 (Very Light Green)
- **Accent**: #87e550 (Lime Green)
- **Text**: Various shades of gray for hierarchy

### Typography
- **Primary Font**: Inter (system fallback)
- **Code Font**: Source Code Pro (monospace)

### Components
- Rounded corners (8px, 12px, 16px, 24px)
- Soft shadows for depth
- Smooth animations and transitions
- Gradient backgrounds for visual appeal

## 🔐 Privacy & Security

- All user data is stored locally on the device
- No personal information is transmitted to external servers
- Medical images are processed through secure AI services
- User can reset all data at any time

## 🤖 AI Integration

The app integrates with Pollinations AI for:
- **Text Generation**: Intelligent responses to medical questions
- **Image Analysis**: Medical image interpretation and insights
- **Audio Processing**: Speech-to-text and text-to-speech (planned)

## 📱 User Experience

### First-Time Users
1. Animated splash screen with branding
2. Welcome screen showcasing features
3. Setup form for personalization
4. Guided introduction to main features

### Returning Users
1. Quick splash screen
2. Direct access to main chat interface
3. Preserved chat history and settings
4. Personalized greetings

## 🔮 Future Enhancements

- [ ] Voice message recording and playback
- [ ] Audio transcription integration
- [ ] Text-to-speech responses
- [ ] Advanced settings and themes
- [ ] Chat export functionality
- [ ] Offline mode capabilities
- [ ] Push notifications
- [ ] Multi-language support

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**:
   ```bash
   npx expo start --clear
   ```

2. **Node modules issues**:
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **TypeScript errors**:
   - Restart TypeScript language server in your IDE
   - Check for missing type definitions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software developed by Sukhdev Singh.

## 👨‍💻 Developer

**Sukhdev Singh**
- GitHub: [@sukhdevr898](https://github.com/sukhdevr898)
- Instagram: [@sukh_rai898](https://instagram.com/sukh_rai898)

## ⚠️ Disclaimer

This application is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers with questions about medical conditions.

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
  - Splash screen and onboarding flow
  - User setup and data persistence
  - AI integration foundation
  - Modern UI design system

---

*Built with ❤️ using React Native and Expo*