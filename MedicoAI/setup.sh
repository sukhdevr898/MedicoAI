#!/bin/bash

# Medico AI - Setup Script
# Created by Sukhdev Singh

echo "🏥 Setting up Medico AI React Native App..."
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available. Please install npm first."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo "✅ npm $(npm --version) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Install Expo CLI globally if not present
if ! command -v expo &> /dev/null; then
    echo ""
    echo "🔧 Installing Expo CLI globally..."
    npm install -g @expo/cli
    
    if [ $? -eq 0 ]; then
        echo "✅ Expo CLI installed successfully"
    else
        echo "❌ Failed to install Expo CLI"
        exit 1
    fi
else
    echo "✅ Expo CLI $(expo --version) detected"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "⚙️ Creating environment configuration..."
    cat > .env << EOL
# Medico AI Configuration
MCP_SERVER_URL=https://your-server.com/mcp-server.php
FALLBACK_API_URL=https://text.pollinations.ai
API_TIMEOUT=30000
EOL
    echo "✅ .env file created. Please update MCP_SERVER_URL with your server endpoint."
else
    echo "✅ .env file already exists"
fi

# Create services directory if it doesn't exist
if [ ! -d "services" ]; then
    mkdir -p services
    echo "✅ Services directory created"
fi

# Create components directory if it doesn't exist
if [ ! -d "components" ]; then
    mkdir -p components
    echo "✅ Components directory created"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update the MCP_SERVER_URL in .env file with your server endpoint"
echo "2. Start the development server: npm start"
echo "3. Run on Android: npm run android"
echo "4. Run on iOS: npm run ios (macOS required)"
echo ""
echo "📖 For detailed documentation, see README.md"
echo "🐙 GitHub: https://github.com/sukhdevr898"
echo "📧 Contact: sukhdevr898@gmail.com"
echo ""
echo "Made with ❤️ for Medical Education by Sukhdev Singh"