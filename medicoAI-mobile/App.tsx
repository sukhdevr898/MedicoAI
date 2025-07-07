import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Contexts
import { AppProvider, useApp } from './src/contexts/AppContext';

// Screens
import { SplashScreen as CustomSplashScreen } from './src/screens/SplashScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { SetupScreen } from './src/screens/SetupScreen';
// import { MainApp } from './src/screens/MainApp'; // We'll create this next

// Types
import { RootStackParamList } from './src/types';

const Stack = createStackNavigator<RootStackParamList>();

// Prevent the native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function AppNavigator() {
  const { isLoading, isFirstTime, user } = useApp();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // Wait for app to initialize
        while (isLoading) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Hide native splash screen
        await SplashScreen.hideAsync();
      } catch (error) {
        console.warn('Error during app initialization:', error);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [isLoading]);

  if (isLoading || showSplash) {
    return (
      <CustomSplashScreen
        onFinish={() => setShowSplash(false)}
      />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        {isFirstTime ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreenWrapper} />
            <Stack.Screen name="Setup" component={SetupScreenWrapper} />
          </>
        ) : (
          <Stack.Screen name="Main" component={MainAppPlaceholder} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function WelcomeScreenWrapper({ navigation }: any) {
  return (
    <WelcomeScreen
      onGetStarted={() => navigation.navigate('Setup')}
    />
  );
}

function SetupScreenWrapper({ navigation }: any) {
  return (
    <SetupScreen
      onComplete={() => navigation.navigate('Main')}
    />
  );
}

// Placeholder for MainApp component (we'll create this next)
function MainAppPlaceholder() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f8f5' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#49c140', marginBottom: 10 }}>
        Main App - Coming Soon!
      </Text>
      <Text style={{ fontSize: 16, color: '#6b7280' }}>
        This will be the main chat interface
      </Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}
