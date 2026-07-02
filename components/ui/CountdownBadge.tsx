import { useState, useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useReduceMotion } from '../../hooks/useReduceMotion';

interface Props {
  arrivalTime: number; // epoch seconds
  size?: 'normal' | 'large';
}

/** Live label: "Due" ≤30s, m:ss under 10 min (winds down by the second), else "N min". */
function formatCountdown(seconds: number): string {
  if (seconds <= 30) return 'Due';
  if (seconds < 600) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
  return `${Math.round(seconds / 60)} min`;
}

export function CountdownBadge({ arrivalTime, size = 'normal' }: Props) {
  const [seconds, setSeconds] = useState(() =>
    Math.max(0, arrivalTime - Math.floor(Date.now() / 1000)),
  );
  const hasPulsed = useRef(false);
  const c = useThemeColors();
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(1)).current;

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

  const isDue = seconds <= 30;

  // Gentle opacity pulse while "Due" so it draws the eye — skipped under Reduce Motion.
  useEffect(() => {
    if (!isDue || reduceMotion) {
      opacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.35, duration: 550, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 550, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      opacity.setValue(1);
    };
  }, [isDue, reduceMotion, opacity]);

  const color =
    seconds <= 60 ? c.due : seconds <= 300 ? c.arriving : c.scheduled;

  return (
    <Animated.Text style={[size === 'large' ? styles.large : styles.text, { color, opacity }]}>
      {formatCountdown(seconds)}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 58,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  large: {
    fontSize: 30,
    fontWeight: '800',
    minWidth: 96,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
