import { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useVehiclePositions } from '../../hooks/useVehiclePositions';
import { getRouteShape } from '../../services/gtfsStatic';
import { CountdownBadge } from '../../components/ui/CountdownBadge';
import { RouteChip } from '../../components/ui/RouteChip';
import { useThemeColors, type ThemeColors } from '../../hooks/useThemeColors';
import { Colors } from '../../constants/colors';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    map: { flex: 1 },
    panel: {
      backgroundColor: c.surface,
      padding: 16,
      gap: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headsign: { fontSize: 16, fontWeight: '700', color: c.text, flex: 1 },
    meta: { fontSize: 13, color: c.textSecondary },
    noVehicle: {
      position: 'absolute',
      top: 12,
      alignSelf: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    noVehicleText: { color: '#fff', fontSize: 12 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  });

export default function TripDetailScreen() {
  const { tripId, routeId, routeShortName, headsign, arrivalTime, stopName } =
    useLocalSearchParams<{
      tripId: string;
      routeId: string;
      routeShortName: string;
      headsign: string;
      arrivalTime: string;
      stopName: string;
    }>();

  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  const { data: vehicles, isLoading } = useVehiclePositions();
  const vehicle = vehicles?.find((v) => v.tripId === tripId) ?? null;

  const shape = useMemo(() => getRouteShape(routeId ?? ''), [routeId]);
  const shapeCoords = shape.map(([latitude, longitude]) => ({ latitude, longitude }));

  const routeColor = `#${Colors.primary.replace('#', '')}`;

  const initialRegion = vehicle
    ? {
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }
    : shapeCoords.length > 0
      ? {
          latitude: shapeCoords[Math.floor(shapeCoords.length / 2)].latitude,
          longitude: shapeCoords[Math.floor(shapeCoords.length / 2)].longitude,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }
      : { latitude: 49.2827, longitude: -123.1207, latitudeDelta: 0.1, longitudeDelta: 0.1 };

  const eta = arrivalTime ? parseInt(arrivalTime, 10) : null;

  if (isLoading && !vehicles) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `Route ${routeShortName ?? ''}`,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />

      <MapView style={styles.map} initialRegion={initialRegion} showsUserLocation>
        {shapeCoords.length > 0 && (
          <Polyline
            coordinates={shapeCoords}
            strokeColor={routeColor}
            strokeWidth={3}
            lineDashPattern={undefined}
          />
        )}

        {vehicle && (
          <Marker
            coordinate={{ latitude: vehicle.latitude, longitude: vehicle.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={vehicleStyles.dot} />
          </Marker>
        )}
      </MapView>

      {!vehicle && (
        <View style={styles.noVehicle}>
          <Text style={styles.noVehicleText}>No live vehicle data for this trip</Text>
        </View>
      )}

      <View style={styles.panel}>
        <View style={styles.row}>
          <RouteChip
            shortName={routeShortName ?? ''}
            color={Colors.primary.replace('#', '')}
            textColor="FFFFFF"
          />
          <Text style={styles.headsign} numberOfLines={1}>
            {headsign || 'In service'}
          </Text>
          {eta && <CountdownBadge arrivalTime={eta} />}
        </View>
        {stopName && (
          <Text style={styles.meta}>Arriving at {decodeURIComponent(stopName)}</Text>
        )}
        {vehicle && (
          <Text style={styles.meta}>
            Vehicle last updated {Math.round((Date.now() / 1000 - vehicle.timestamp) / 60)} min ago
          </Text>
        )}
      </View>
    </View>
  );
}

const vehicleStyles = StyleSheet.create({
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
