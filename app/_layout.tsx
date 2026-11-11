import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { GardenProvider, useGarden } from '@/lib/garden-store';
import { SessionProvider, useSession } from '@/lib/session';

// Splash tetap tampil sampai font, sesi, dan progres kebun selesai dimuat.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SessionProvider>
      <GardenProvider>
        <RootNavigator />
      </GardenProvider>
    </SessionProvider>
  );
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const session = useSession();
  const garden = useGarden();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const isReady = fontsLoaded && session.ready && garden.ready;

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync();
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  // Pengalihan ke onboarding/login ditangani oleh app/index.tsx.
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="plant-recommendation" />
        <Stack.Screen name="plant-recommendations-result" />
        <Stack.Screen name="plant-detail" />
        <Stack.Screen name="missions" />
        <Stack.Screen name="virtual-garden" />
        <Stack.Screen name="chatbot" />
        <Stack.Screen name="profile" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
