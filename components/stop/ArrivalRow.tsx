import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Arrival } from '../../types/translink';
import { RouteChip } from '../ui/RouteChip';
import { CountdownBadge } from '../ui/CountdownBadge';
import { useThemeColors, type ThemeColors } from '../../hooks/useThemeColors';
import { scheduleArrivalNotification, isScheduled } from '../../services/notifications';

interface Props {
  arrival: Arrival;
  stopName?: string;
  stopId?: string;
}

function NotifyButton({ arrival, stopName }: { arrival: Arrival; stopName?: string }) {
  const [scheduled, setScheduled] = useState(() => isScheduled(arrival.arrivalTime));
  const c = useThemeColors();

  const handlePress = async () => {
    if (scheduled) return;
    const ok = await scheduleArrivalNotification(arrival, stopName ?? 'this stop');
    if (ok) {
      setScheduled(true);
    } else {
      Alert.alert('Notifications disabled', 'Enable notifications in Settings to get bus alerts.');
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={{ padding: 2 }}
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
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
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
        {arrival.headsign || 'In service'}
      </Text>
      <NotifyButton arrival={arrival} stopName={stopName} />
      <CountdownBadge arrivalTime={arrival.arrivalTime} />
    </TouchableOpacity>
  );
}
