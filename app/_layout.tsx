import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'onboarding',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      checkOnboarding();
    }
  }, [fontsLoaded]);

  const checkOnboarding = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

      // Wait a bit to ensure navigation is ready
      setTimeout(() => {
        if (hasSeenOnboarding === 'true') {
          router.replace('/login');
        } else {
          router.replace('/onboarding');
        }
        setIsReady(true);
      }, 100);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      router.replace('/onboarding');
      setIsReady(true);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="plant-recommendation" options={{ headerShown: false }} />
        <Stack.Screen name="plant-recommendations-result" options={{ headerShown: false }} />
        <Stack.Screen name="plant-detail" options={{ headerShown: false }} />
        <Stack.Screen name="missions" options={{ headerShown: false }} />
        <Stack.Screen name="virtual-garden" options={{ headerShown: false }} />
        <Stack.Screen name="chatbot" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
