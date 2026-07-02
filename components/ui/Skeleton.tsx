import { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, type DimensionValue } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useReduceMotion } from '../../hooks/useReduceMotion';

interface BlockProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: object;
}

/** A single shimmering placeholder bar. Pauses the pulse under Reduce Motion. */
export function SkeletonBlock({ width = '100%', height = 12, radius = 6, style }: BlockProps) {
  const c = useThemeColors();
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(0.6);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, opacity]);

  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: c.border, opacity }, style]}
    />
  );
}

/** Placeholder rows shaped like the arrivals list. */
export function ArrivalListSkeleton({ rows = 4 }: { rows?: number }) {
  const c = useThemeColors();
  return (
    <View accessibilityLabel="Loading arrivals">
      {Array.from({ length: rows }).map((_, i) => (
        <View
          key={i}
          style={[styles.row, { backgroundColor: c.surface, borderBottomColor: c.border }]}
        >
          <SkeletonBlock width={6} height={6} radius={3} />
          <SkeletonBlock width={42} height={20} radius={4} />
          <SkeletonBlock height={12} style={{ flex: 1 }} />
          <SkeletonBlock width={48} height={14} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
