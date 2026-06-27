import type { Arrival } from '../types/translink';

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

const scheduled = new Set<number>();

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Notifications) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export function isScheduled(arrivalTime: number): boolean {
  return scheduled.has(arrivalTime);
}

export async function scheduleArrivalNotification(
  arrival: Arrival,
  stopName: string,
  leadMinutes = 5,
): Promise<boolean> {
  if (!Notifications) return false;
  const granted = await requestNotificationPermissions();
  if (!granted) return false;

  const triggerMs = arrival.arrivalTime * 1000 - leadMinutes * 60 * 1000;
  const secondsFromNow = Math.round((triggerMs - Date.now()) / 1000);

  const content: import('expo-notifications').NotificationContentInput = {
    title: secondsFromNow <= 0 ? 'Bus arriving now' : 'Bus arriving soon',
    body:
      secondsFromNow <= 0
        ? `Route ${arrival.routeShortName} is arriving at ${stopName}`
        : `Route ${arrival.routeShortName} arrives in ${leadMinutes} min at ${stopName}`,
    sound: true,
  };

  await Notifications.scheduleNotificationAsync({
    content,
    trigger:
      secondsFromNow <= 0
        ? null
        : { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: secondsFromNow },
  });

  scheduled.add(arrival.arrivalTime);
  return true;
}

export function cancelScheduled(arrivalTime: number): void {
  scheduled.delete(arrivalTime);
}
