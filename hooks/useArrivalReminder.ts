import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Arrival } from '../types/translink';
import { scheduleArrivalNotification } from '../services/notifications';
import { useSettingsStore } from '../store/settings';
import { t } from '../locales/i18n';

/**
 * One-tap reminder: schedules a heads-up at the user's saved lead time
 * (changeable in Settings) with a haptic confirmation. Only interrupts with
 * an alert if notifications are turned off — no per-tap chooser.
 */
export function useArrivalReminder() {
  const lead = useSettingsStore((s) => s.notifyLeadMinutes);

  return useCallback(
    async (arrival: Arrival, stopName: string, stopId: string, onScheduled?: () => void) => {
      const ok = await scheduleArrivalNotification(arrival, stopName, stopId, lead);
      if (ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        onScheduled?.();
      } else {
        Alert.alert(t('notif.disabledTitle'), t('notif.disabledBody'));
      }
    },
    [lead],
  );
}
