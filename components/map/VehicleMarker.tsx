import { memo } from 'react';
import { Marker } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';
import type { VehiclePosition } from '../../types/translink';
import { getRoute } from '../../services/gtfsStatic';

interface Props {
  vehicle: VehiclePosition;
  highlighted?: boolean;
  dimmed?: boolean;
  blinkOn?: boolean;
  onPress?: (vehicle: VehiclePosition) => void;
}

const STALE_THRESHOLD_S = 90;

function VehicleMarkerComponent({
  vehicle,
  highlighted = false,
  dimmed = false,
  blinkOn = false,
  onPress,
}: Props) {
  const route = getRoute(vehicle.routeId);
  const color = route?.route_color ? `#${route.route_color}` : '#005CA9';
  const ageSeconds = Math.floor(Date.now() / 1000) - vehicle.timestamp;
  const isStale = ageSeconds > STALE_THRESHOLD_S;
  const hasBearing = vehicle.bearing !== undefined;

  const opacity = dimmed ? 0.22 : isStale ? 0.35 : 1;

  return (
    <Marker
      coordinate={{ latitude: vehicle.latitude, longitude: vehicle.longitude }}
      tracksViewChanges={highlighted}
      anchor={{ x: 0.5, y: 0.5 }}
      onPress={onPress ? () => onPress(vehicle) : undefined}
      zIndex={highlighted ? 999 : 1}
    >
      <View style={styles.container}>
        {/* Pulsing halo when this bus's route is selected */}
        {highlighted && (
          <View
            style={[
              styles.halo,
              {
                borderColor: color,
                opacity: blinkOn ? 0.9 : 0.15,
                transform: [{ scale: blinkOn ? 1 : 0.55 }],
              },
            ]}
          />
        )}
        <View
          style={[
            styles.wrapper,
            hasBearing && { transform: [{ rotate: `${vehicle.bearing}deg` }] },
            { opacity },
          ]}
        >
          {/* Arrowhead tip pointing in direction of travel */}
          <View style={[styles.arrow, { borderBottomColor: color }]} />
          {/* Body dot */}
          <View
            style={[
              styles.dot,
              { backgroundColor: color },
              highlighted && styles.dotHighlighted,
            ]}
          />
        </View>
      </View>
    </Marker>
  );
}

export const VehicleMarker = memo(VehicleMarkerComponent);

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
  },
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
  dotHighlighted: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
});
