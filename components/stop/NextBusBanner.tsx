import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Arrival } from '../../types/translink';
import { RouteChip } from '../ui/RouteChip';
import { CountdownBadge } from '../ui/CountdownBadge';
import { useThemeColors, type ThemeColors } from '../../hooks/useThemeColors';
import { isScheduled } from '../../services/notifications';
import { useArrivalReminder } from '../../hooks/useArrivalReminder';

interface Props {
  arrival: Arrival;
  stopName?: string;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    banner: {
      backgroundColor: c.surface,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    label: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 8,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headsign: { flex: 1, fontSize: 15, fontWeight: '600', color: c.text },
    bell: { padding: 4 },
  });

export function NextBusBanner({ arrival, stopName }: Props) {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const [scheduled, setScheduled] = useState(() => isScheduled(arrival.arrivalTime));
  const remind = useArrivalReminder();

  const handleNotify = () => {
    if (scheduled) return;
    remind(arrival, stopName ?? 'this stop', () => setScheduled(true));
  };

  return (
    <View style={styles.banner}>
      <Text style={styles.label}>Next bus</Text>
      <View style={styles.row}>
        <RouteChip
          shortName={arrival.routeShortName}
          color={arrival.routeColor}
          textColor={arrival.routeTextColor}
        />
        <Text style={styles.headsign} numberOfLines={2}>
          {arrival.headsign || 'In service'}
        </Text>
        <TouchableOpacity
          onPress={handleNotify}
          style={styles.bell}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={scheduled ? 'Reminder set' : 'Set a reminder before this bus'}
        >
          <Ionicons
            name={scheduled ? 'notifications' : 'notifications-outline'}
            size={20}
            color={scheduled ? '#005CA9' : c.textSecondary}
          />
        </TouchableOpacity>
        <CountdownBadge arrivalTime={arrival.arrivalTime} size="large" />
      </View>
    </View>
  );
}
