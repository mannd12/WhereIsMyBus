import { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';
import { Colors } from '../../constants/colors';
import { useServiceAlerts } from '../../hooks/useServiceAlerts';
import { useThemeColors } from '../../hooks/useThemeColors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IoniconName, outlineName: IoniconName) {
  return ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? name : outlineName} size={size} color={color as string} />
  );
}

export default function TabLayout() {
  const { data: alerts } = useServiceAlerts();
  const alertCount = alerts?.length ?? 0;
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
        options={{ title: 'Favorites', tabBarIcon: tabIcon('star', 'star-outline'), headerShown: true }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: tabIcon('warning', 'warning-outline'),
          tabBarBadge: alertCount > 0 ? alertCount : undefined,
          headerShown: true,
        }}
      />
    </Tabs>
  );
}
