// Simple test to verify our React Native setup
console.log('🚀 Testing medicoAI Mobile App Setup...');

try {
  // Test basic imports
  const React = require('react');
  const { Platform } = require('react-native');
  
  console.log('✅ React import successful');
  console.log('✅ React Native import successful');
  console.log(`📱 Platform: ${Platform.OS || 'unknown'}`);
  
  // Test our custom imports
  const types = require('./src/types');
  console.log('✅ Custom types import successful');
  
  const storageService = require('./src/services/storageService');
  console.log('✅ Storage service import successful');
  
  const aiService = require('./src/services/aiService');
  console.log('✅ AI service import successful');
  
  console.log('\n🎉 All core imports successful!');
  console.log('✨ medicoAI Mobile App is ready for development!');
  
} catch (error) {
  console.error('❌ Setup test failed:', error.message);
  process.exit(1);
}