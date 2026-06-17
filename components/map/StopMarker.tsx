import { Marker, Callout } from 'react-native-maps';
import { View, Text, StyleSheet } from 'react-native';
import type { NearbyStop } from '../../types/translink';
import { getRouteColor } from '../../constants/routeTypes';

interface Props {
  stop: NearbyStop;
  selected: boolean;
  onPress: (stop: NearbyStop) => void;
}

export function StopMarker({ stop, selected, onPress }: Props) {
  const primaryType = stop.route_types[0] ?? 3;
  const color = getRouteColor(primaryType);

  return (
    <Marker
      coordinate={{ latitude: stop.stop_lat, longitude: stop.stop_lon }}
      onPress={() => onPress(stop)}
      tracksViewChanges={false}
    >
      <View style={[styles.pin, { backgroundColor: color }, selected && styles.pinSelected]}>
        <View style={styles.dot} />
      </View>
      <Callout>
        <Text style={styles.calloutText}>{stop.stop_name}</Text>
        <Text style={styles.calloutSub}>Stop #{stop.stop_id}</Text>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  pinSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  calloutText: { fontWeight: '600', fontSize: 13, maxWidth: 180 },
  calloutSub: { color: '#666', fontSize: 11 },
});
