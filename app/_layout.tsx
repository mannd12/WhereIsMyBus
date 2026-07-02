import { Stack, router, useSegments, type ErrorBoundaryProps } from 'expo-router';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { AppState, type AppStateStatus, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSettingsStore } from '../store/settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 10_000, refetchOnWindowFocus: true },
  },
});

// Tell react-query when the app is foregrounded. This pauses the arrival/vehicle
// polling while backgrounded — saving battery and staying well under TransLink's
// daily request cap — and refetches fresh times the moment the rider returns.
function onAppStateChange(status: AppStateStatus) {
  focusManager.setFocused(status === 'active');
}

// Catches any render error under the root so a single bad component degrades to
// a recoverable screen instead of crashing the whole app. Self-contained styles
// (no theme hook) in case theming itself is what threw.
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={eb.container}>
      <Ionicons name="bus" size={48} color="#005CA9" />
      <Text style={eb.title}>Something went wrong</Text>
      <Text style={eb.body}>BusPulse hit an unexpected error. Try again — your favourites are safe.</Text>
      {__DEV__ ? <Text style={eb.detail}>{error.message}</Text> : null}
      <TouchableOpacity style={eb.button} onPress={() => retry()} accessibilityRole="button" accessibilityLabel="Try again">
        <Text style={eb.buttonText}>Try again</Text>
      </TouchableOpacity>
    </View>
  );
}

const eb = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32, backgroundColor: '#F5F5F5' },
  title: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  body: { fontSize: 14, color: '#6B6B6B', textAlign: 'center', lineHeight: 20 },
  detail: { fontSize: 12, color: '#999', textAlign: 'center' },
  button: { marginTop: 8, backgroundColor: '#005CA9', borderRadius: 12, paddingVertical: 13, paddingHorizontal: 28 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
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

  // Pause/resume polling with app foreground state (battery + request-cap saver).
  useEffect(() => {
    const sub = AppState.addEventListener('change', onAppStateChange);
    return () => sub.remove();
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
          <Stack.Screen
            name="settings"
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Settings',
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
