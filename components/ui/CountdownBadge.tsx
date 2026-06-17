import { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '../../hooks/useThemeColors';

interface Props {
  arrivalTime: number; // epoch seconds
}

export function CountdownBadge({ arrivalTime }: Props) {
  const [seconds, setSeconds] = useState(() =>
    Math.max(0, arrivalTime - Math.floor(Date.now() / 1000)),
  );
  const hasPulsed = useRef(false);
  const c = useThemeColors();

  useEffect(() => {
    const tick = () => {
      const s = Math.max(0, arrivalTime - Math.floor(Date.now() / 1000));
      setSeconds(s);
      // Haptic pulse once when bus goes "Due"
      if (s <= 30 && !hasPulsed.current) {
        hasPulsed.current = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [arrivalTime]);

  const color =
    seconds <= 60 ? c.due : seconds <= 300 ? c.arriving : c.scheduled;

  let label: string;
  if (seconds <= 30) label = 'Due';
  else if (seconds < 60) label = '< 1 min';
  else label = `${Math.round(seconds / 60)} min`;

  return <Text style={[styles.text, { color }]}>{label}</Text>;
}

const styles = StyleSheet.create({
  text: { fontSize: 14, fontWeight: '700', minWidth: 48, textAlign: 'right' },
});
