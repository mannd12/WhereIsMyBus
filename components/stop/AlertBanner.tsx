import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ServiceAlert } from '../../types/translink';
import { useThemeColors, type ThemeColors } from '../../hooks/useThemeColors';

interface Props {
  alert: ServiceAlert;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    banner: {
      flexDirection: 'row',
      backgroundColor: c.surface,
      borderLeftWidth: 4,
      borderLeftColor: '#E4002B',
      padding: 12,
      marginHorizontal: 16,
      marginVertical: 6,
      borderRadius: 6,
      gap: 8,
    },
    icon: { marginTop: 1 },
    text: { flex: 1 },
    header: { fontWeight: '600', fontSize: 13, color: c.text },
    desc: { fontSize: 12, color: c.textSecondary, marginTop: 2 },
  });

export function AlertBanner({ alert }: Props) {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <View style={styles.banner}>
      <Ionicons name="warning" size={16} color="#E4002B" style={styles.icon} />
      <View style={styles.text}>
        <Text style={styles.header} numberOfLines={2}>{alert.headerText}</Text>
        {alert.descriptionText ? (
          <Text style={styles.desc} numberOfLines={3}>{alert.descriptionText}</Text>
        ) : null}
      </View>
    </View>
  );
}
