import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ScheduledArrival } from '../../types/translink';
import { RouteChip } from '../ui/RouteChip';
import { getRouteByShortName } from '../../services/gtfsStatic';
import { useThemeColors, type ThemeColors } from '../../hooks/useThemeColors';

const clockTime = (epoch: number) =>
  new Date(epoch * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

/** Timetable fallback shown when a stop has no live bus. Clearly not real-time. */
export function ScheduledList({ items }: { items: ScheduledArrival[] }) {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Ionicons name="calendar-outline" size={15} color={c.textSecondary} />
        <Text style={styles.headerText}>Scheduled departures</Text>
      </View>
      <Text style={styles.note}>Timetable — no live tracking for this stop right now.</Text>
      {items.map((a, i) => {
        const r = getRouteByShortName(a.routeShortName);
        const time = clockTime(a.arrivalTime);
        return (
          <View
            key={`${a.routeShortName}-${a.arrivalTime}-${i}`}
            style={styles.row}
            accessibilityLabel={`Route ${a.routeShortName} to ${a.headsign || 'destination'}, scheduled ${time}`}
          >
            <RouteChip
              shortName={a.routeShortName}
              color={r?.route_color ?? '005CA9'}
              textColor={r?.route_text_color ?? 'FFFFFF'}
            />
            <Text style={styles.headsign} numberOfLines={2}>
              {a.headsign || 'Scheduled'}
            </Text>
            <Text style={styles.time}>{time}</Text>
          </View>
        );
      })}
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    wrap: { paddingBottom: 16 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 2,
    },
    headerText: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    note: { fontSize: 12, color: c.textSecondary, paddingHorizontal: 16, paddingBottom: 8 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
      backgroundColor: c.surface,
    },
    headsign: { flex: 1, fontSize: 14, color: c.text },
    time: { fontSize: 14, fontWeight: '700', color: c.textSecondary, fontVariant: ['tabular-nums'] },
  });
