import { Stack, router, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import * as Location from 'expo-location';
import { useSettingsStore } from '../store/settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 10_000 },
  },
});

function AuthGuard() {
  const apiKey = useSettingsStore((s) => s.apiKey);
  const segments = useSegments();

  useEffect(() => {
    const inSetup = segments[0] === 'setup';
    if (!apiKey && !inSetup) {
      router.replace('/setup');
    } else if (apiKey && inSetup) {
      router.replace('/(tabs)');
    }
  }, [apiKey, segments]);

  return null;
}

export default function RootLayout() {
  // Ask for location permission up front, as soon as the app launches.
  useEffect(() => {
    Location.requestForegroundPermissionsAsync().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthGuard />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="stop/[stopId]"
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Stop Arrivals',
              headerStyle: { backgroundColor: '#005CA9' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: '700' },
            }}
          />
          <Stack.Screen
            name="route/[routeId]"
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Route',
              headerStyle: { backgroundColor: '#005CA9' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: '700' },
            }}
          />
          <Stack.Screen name="setup" options={{ headerShown: false }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
