import { View, Text, StyleSheet } from 'react-native';

interface Props {
  shortName: string;
  color: string;
  textColor: string;
}

export function RouteChip({ shortName, color, textColor }: Props) {
  const bg = color.startsWith('#') ? color : `#${color}`;
  const fg = textColor.startsWith('#') ? textColor : `#${textColor}`;
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: fg }]} numberOfLines={1}>
        {shortName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 32,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
