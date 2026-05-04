// ============================================================
// UniHub Workshop — Root Layout
// Auth provider + Route protection
// ============================================================

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { startSyncWorker, stopSyncWorker } from '@/services/sync-worker';
import { SYNC_INTERVAL_MS } from '@/constants/config';

/** Custom dark theme matching our design system */
const UniHubDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0F0D23',
    card: '#1E1B3A',
    text: '#F1F5F9',
    border: '#2D2A52',
    primary: '#6366F1',
  },
};

const UniHubLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#1E1B4B',
    border: '#E2E8F0',
    primary: '#6366F1',
  },
};

/** Route protection logic */
function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login';

    if (!isAuthenticated && !inAuthGroup) {
      // Chưa đăng nhập → redirect sang login
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Đã đăng nhập → redirect sang tabs
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  // Start/stop sync worker based on auth state
  useEffect(() => {
    if (isAuthenticated) {
      startSyncWorker(SYNC_INTERVAL_MS);
    } else {
      stopSyncWorker();
    }

    return () => stopSyncWorker();
  }, [isAuthenticated]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? UniHubDarkTheme : UniHubLightTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="workshop/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
