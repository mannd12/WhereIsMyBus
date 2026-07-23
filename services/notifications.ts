import type { Arrival } from '../types/translink';
import { t } from '../locales/i18n';

// expo-notifications crashes in Expo Go (SDK 53+) due to removed push token support.
// Use require() in a try-catch so it fails silently when running in Expo Go.
let Notifications: typeof import('expo-notifications') | null = null;
try {
  Notifications = require('expo-notifications');
  Notifications?.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {
  // Running in Expo Go — notifications silently disabled
}

// Keyed by route+stop (stable across refreshes) — predicted arrivalTime drifts
// on every refetch, so keying by time would "forget" reminders after 60s.
const scheduled = new Set<string>();
const reminderKey = (routeId: string, stopId: string) => `buspulse-${routeId}-${stopId}`;

async function requestNotificationPermissions(): Promise<boolean> {
  if (!Notifications) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export function isScheduled(routeId: string, stopId: string): boolean {
  return scheduled.has(reminderKey(routeId, stopId));
}

/**
 * Rebuild the in-memory set from the OS's still-pending notifications, so the
 * filled-bell state survives app restarts (the OS keeps the scheduled reminder;
 * our Set didn't). Call once at startup. Notifications keep our `buspulse-*`
 * identifiers, so we just collect the ones that are still ours.
 */
export async function syncScheduledFromOS(): Promise<void> {
  if (!Notifications) return;
  try {
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    scheduled.clear();
    for (const n of pending) {
      if (typeof n.identifier === 'string' && n.identifier.startsWith('buspulse-')) {
        scheduled.add(n.identifier);
      }
    }
  } catch {
    // best effort — leave the set as-is
  }
}

export async function scheduleArrivalNotification(
  arrival: Arrival,
  stopName: string,
  stopId: string,
  leadMinutes = 5,
): Promise<boolean> {
  if (!Notifications) return false;
  const granted = await requestNotificationPermissions();
  if (!granted) return false;

  const triggerMs = arrival.arrivalTime * 1000 - leadMinutes * 60 * 1000;
  const secondsFromNow = Math.round((triggerMs - Date.now()) / 1000);

  const content: import('expo-notifications').NotificationContentInput = {
    title: secondsFromNow <= 0 ? t('notif.arrivingNow') : t('notif.arrivingSoon'),
    body:
      secondsFromNow <= 0
        ? t('notif.bodyNow', { route: arrival.routeShortName, stop: stopName })
        : t('notif.bodySoon', { route: arrival.routeShortName, lead: leadMinutes, stop: stopName }),
    sound: true,
  };

  await Notifications.scheduleNotificationAsync({
    // Stable id per route+stop: re-tapping the bell (even after a restart, once
    // predictions change) replaces the pending reminder instead of stacking a
    // duplicate. stopId, not stopName — paired stops across the street share names.
    identifier: reminderKey(arrival.routeId, stopId),
    content,
    trigger:
      secondsFromNow <= 0
        ? null
        : { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: secondsFromNow },
  });

  scheduled.add(reminderKey(arrival.routeId, stopId));
  return true;
}
