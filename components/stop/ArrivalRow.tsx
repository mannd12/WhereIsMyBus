import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Arrival } from '../../types/translink';
import { RouteChip } from '../ui/RouteChip';
import { CountdownBadge } from '../ui/CountdownBadge';
import { useThemeColors, type ThemeColors } from '../../hooks/useThemeColors';
import { isScheduled } from '../../services/notifications';
import { useArrivalReminder } from '../../hooks/useArrivalReminder';
import { useSettingsStore } from '../../store/settings';
import { useT } from '../../locales/i18n';

interface Props {
  arrival: Arrival;
  stopName?: string;
  stopId?: string;
}

function NotifyButton({ arrival, stopName, stopId }: { arrival: Arrival; stopName?: string; stopId?: string }) {
  const sid = stopId ?? '';
  const [scheduled, setScheduled] = useState(() => isScheduled(arrival.routeId, sid));
  const lead = useSettingsStore((s) => s.notifyLeadMinutes);
  const c = useThemeColors();
  const tf = useT();
  const remind = useArrivalReminder();

  const handlePress = () => {
    if (scheduled) return;
    void remind(arrival, stopName ?? tf('common.thisStop'), sid, () => setScheduled(true));
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={{ padding: 2 }}
      accessibilityRole="button"
      accessibilityLabel={
        scheduled
          ? tf('arrival.reminderSetRoute', { route: arrival.routeShortName })
          : tf('arrival.remindBeforeRoute', { lead, route: arrival.routeShortName })
      }
    >
      <Ionicons
        name={scheduled ? 'notifications' : 'notifications-outline'}
        size={16}
        color={scheduled ? '#005CA9' : c.textSecondary}
      />
    </TouchableOpacity>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
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
    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#00A650',
    },
    headsign: {
      flex: 1,
      fontSize: 14,
      color: c.text,
    },
  });

export function ArrivalRow({ arrival, stopName, stopId }: Props) {
  const tf = useT();
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={tf('arrival.rowA11y', { route: arrival.routeShortName, dest: arrival.headsign || tf('common.destination') })}
      onPress={() =>
        router.push(
          `/trip/${arrival.tripId}?routeId=${arrival.routeId}&routeShortName=${encodeURIComponent(arrival.routeShortName)}&headsign=${encodeURIComponent(arrival.headsign)}&arrivalTime=${arrival.arrivalTime}&stopName=${encodeURIComponent(stopName ?? '')}&stopId=${encodeURIComponent(stopId ?? '')}`,
        )
      }
    >
      <View style={styles.liveDot} />
      <RouteChip
        shortName={arrival.routeShortName}
        color={arrival.routeColor}
        textColor={arrival.routeTextColor}
      />
      <Text style={styles.headsign} numberOfLines={2}>
        {arrival.headsign || tf('arrival.inService')}
      </Text>
      <NotifyButton arrival={arrival} stopName={stopName} stopId={stopId} />
      <CountdownBadge arrivalTime={arrival.arrivalTime} />
    </TouchableOpacity>
  );
}
