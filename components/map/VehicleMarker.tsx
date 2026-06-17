import { Marker } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';
import type { VehiclePosition } from '../../types/translink';
import { getRoute } from '../../services/gtfsStatic';

interface Props {
  vehicle: VehiclePosition;
}

const STALE_THRESHOLD_S = 90;

export function VehicleMarker({ vehicle }: Props) {
  const route = getRoute(vehicle.routeId);
  const color = route?.route_color ? `#${route.route_color}` : '#005CA9';
  const ageSeconds = Math.floor(Date.now() / 1000) - vehicle.timestamp;
  const isStale = ageSeconds > STALE_THRESHOLD_S;
  const hasBearing = vehicle.bearing !== undefined;

  return (
    <Marker
      coordinate={{ latitude: vehicle.latitude, longitude: vehicle.longitude }}
      tracksViewChanges={false}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View
        style={[
          styles.wrapper,
          hasBearing && { transform: [{ rotate: `${vehicle.bearing}deg` }] },
          { opacity: isStale ? 0.35 : 1 },
        ]}
      >
        {/* Arrowhead tip pointing in direction of travel */}
        <View style={[styles.arrow, { borderBottomColor: color }]} />
        {/* Body dot */}
        <View style={[styles.dot, { backgroundColor: color }]} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#005CA9',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
});
