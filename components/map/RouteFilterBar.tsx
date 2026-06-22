import { useMemo } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Colors } from '../../constants/colors';

export type RouteFilter = 'all' | 'bus' | 'bline' | 'rapidbus' | 'night';

interface FilterOption { id: RouteFilter; label: string; color: string; }

// TransLink's public real-time feed only covers buses — SkyTrain, SeaBus and
// WCE have no live data, so they aren't offered as filters.
const FILTERS: FilterOption[] = [
  { id: 'all',      label: 'All',      color: Colors.primary },
  { id: 'bus',      label: 'Bus',      color: Colors.bus },
  { id: 'bline',    label: 'B-Line',   color: Colors.bLine },
  { id: 'rapidbus', label: 'RapidBus', color: '#0085CA' },
  { id: 'night',    label: 'Night',    color: '#1A1A3E' },
];

interface Props { active: RouteFilter; onChange: (f: RouteFilter) => void; }

export function RouteFilterBar({ active, onChange }: Props) {
  const c = useThemeColors();
  const { top } = useSafeAreaInsets();
  const inactiveChipStyle = useMemo(
    () => ({ backgroundColor: c.surface, borderColor: c.border }),
    [c],
  );

  return (
    <View style={[styles.wrapper, { top: top + 8 }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {FILTERS.map((f) => {
          const isActive = active === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              style={[styles.chip, isActive ? { backgroundColor: f.color, borderColor: f.color } : inactiveChipStyle]}
              onPress={() => onChange(f.id)}
              activeOpacity={0.75}
            >
              <Text style={[styles.label, { color: isActive ? '#fff' : c.text }]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  row: { paddingHorizontal: 12, gap: 6 },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  label: { fontSize: 12, fontWeight: '600' },
});
