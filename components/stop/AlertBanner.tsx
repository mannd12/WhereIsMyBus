import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ServiceAlert } from '../../types/translink';
import { useThemeColors, type ThemeColors } from '../../hooks/useThemeColors';
import { timeAgo } from '../../constants/format';
import { getRoute } from '../../services/gtfsStatic';

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
    desc: { fontSize: 12, color: c.textSecondary, marginTop: 2, lineHeight: 17 },
    routes: { fontSize: 11, color: c.textSecondary, marginTop: 6, fontWeight: '600' },
    more: { fontSize: 12, color: '#005CA9', fontWeight: '600', marginTop: 6 },
    time: { fontSize: 11, color: c.textSecondary, marginTop: 4 },
  });

export function AlertBanner({ alert }: Props) {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const [expanded, setExpanded] = useState(false);

  // Affected routes come through as internal route IDs (e.g. "6630"); show riders
  // the route numbers they actually know (e.g. "28"). Dedupe + drop unknowns.
  const affectedNames = useMemo(() => {
    const names = alert.affectedRoutes
      .map((id) => getRoute(id)?.route_short_name)
      .filter((n): n is string => !!n);
    return Array.from(new Set(names));
  }, [alert.affectedRoutes]);

  // Show "posted Xh ago" only when the alert started within the last day —
  // older timestamps aren't useful and stale/zero values look wrong.
  const ageSeconds = alert.timestamp ? Math.floor(Date.now() / 1000) - alert.timestamp : 0;
  const showTime = alert.timestamp > 0 && ageSeconds >= 0 && ageSeconds < 86400;

  // Only offer expand/collapse when there's plausibly more to read.
  const canExpand =
    alert.headerText.length > 55 ||
    (alert.descriptionText?.length ?? 0) > 90 ||
    alert.affectedRoutes.length > 0;

  return (
    <TouchableOpacity
      style={styles.banner}
      activeOpacity={canExpand ? 0.7 : 1}
      onPress={() => canExpand && setExpanded((e) => !e)}
    >
      <Ionicons name="warning" size={16} color="#E4002B" style={styles.icon} />
      <View style={styles.text}>
        <Text style={styles.header} numberOfLines={expanded ? undefined : 2}>
          {alert.headerText}
        </Text>
        {alert.descriptionText ? (
          <Text style={styles.desc} numberOfLines={expanded ? undefined : 3}>
            {alert.descriptionText}
          </Text>
        ) : null}
        {expanded && affectedNames.length > 0 ? (
          <Text style={styles.routes}>
            Affected routes: {affectedNames.join(', ')}
          </Text>
        ) : null}
        {showTime ? (
          <Text style={styles.time}>Posted {timeAgo(alert.timestamp)}</Text>
        ) : null}
        {canExpand ? (
          <Text style={styles.more}>{expanded ? 'Show less' : 'Read more'}</Text>
        ) : null}
      </View>
      {canExpand ? (
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={c.textSecondary}
          style={styles.icon}
        />
      ) : null}
    </TouchableOpacity>
  );
}
