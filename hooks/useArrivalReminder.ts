import { useCallback } from 'react';
import { Alert } from 'react-native';
import type { Arrival } from '../types/translink';
import { scheduleArrivalNotification } from '../services/notifications';
import { useSettingsStore } from '../store/settings';

/**
 * Returns a function that asks how far ahead to remind (2/5/10 min),
 * schedules the notification, and remembers the choice as the default.
 */
export function useArrivalReminder() {
  const setLead = useSettingsStore((s) => s.setNotifyLeadMinutes);

  return useCallback(
    (arrival: Arrival, stopName: string, onScheduled?: () => void) => {
      const schedule = async (mins: number) => {
        setLead(mins);
        const ok = await scheduleArrivalNotification(arrival, stopName, mins);
        if (ok) onScheduled?.();
        else
          Alert.alert(
            'Notifications disabled',
            'Enable notifications in Settings to get a heads-up before your bus arrives.',
          );
      };
      Alert.alert('Remind me before the bus', 'How far ahead?', [
        { text: '2 min', onPress: () => schedule(2) },
        { text: '5 min', onPress: () => schedule(5) },
        { text: '10 min', onPress: () => schedule(10) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [setLead],
  );
}
