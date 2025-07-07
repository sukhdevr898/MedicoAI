const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions if needed
config.resolver.sourceExts.push('cjs');

// Enable hermes for better performance
config.transformer.hermesCommand = 'hermes';

module.exports = config;