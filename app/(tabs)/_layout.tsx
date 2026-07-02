import { useMemo, useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';
import { Colors } from '../../constants/colors';
import { useRelevantAlerts } from '../../hooks/useRelevantAlerts';
import { useAlertsSeenStore, transitDay } from '../../store/alertsSeen';
import { useThemeColors } from '../../hooks/useThemeColors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IoniconName, outlineName: IoniconName) {
  return ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? name : outlineName} size={size} color={color as string} />
  );
}

export default function TabLayout() {
  const { alerts } = useRelevantAlerts();
  const lastSeenDay = useAlertsSeenStore((s) => s.lastSeenDay);

  // Wait for the persisted seen-state to load before showing the badge, so a
  // returning user who already checked alerts today doesn't see it flash "99+"
  // for a frame on cold start (before AsyncStorage rehydrates).
  const [hydrated, setHydrated] = useState(() => useAlertsSeenStore.persist.hasHydrated());
  useEffect(() => useAlertsSeenStore.persist.onFinishHydration(() => setHydrated(true)), []);

  // Badge only shows nearby alerts the user hasn't checked yet today; it clears
  // when they open the tab and reappears for new alerts after 3am.
  const unseen = lastSeenDay !== transitDay();
  const count = alerts.length;
  const alertBadge = hydrated && unseen && count > 0 ? (count > 99 ? '99+' : count) : undefined;
  const c = useThemeColors();

  return (
    <Tabs
      screenOptions={useMemo(() => ({
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: c.textSecondary,
        tabBarStyle: { borderTopColor: c.border, backgroundColor: c.surface },
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        // Smaller badge text + room so "99+" fits instead of clipping to "9…".
        tabBarBadgeStyle: { fontSize: 10, lineHeight: 14, minWidth: 20, paddingHorizontal: 3 },
      }), [c])}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Nearby', tabBarIcon: tabIcon('location', 'location-outline'), headerShown: false }}
      />
      <Tabs.Screen
        name="search"
        options={{ title: 'Search', tabBarIcon: tabIcon('search', 'search-outline'), headerShown: true }}
      />
      <Tabs.Screen
        name="favorites"
        options={{ title: 'Favourites', tabBarIcon: tabIcon('star', 'star-outline'), headerShown: true }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: tabIcon('warning', 'warning-outline'),
          tabBarBadge: alertBadge,
          headerShown: true,
        }}
      />
    </Tabs>
  );
}
