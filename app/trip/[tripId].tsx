import { useMemo, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Polyline, Marker, type Region } from 'react-native-maps';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useVehiclePositions } from '../../hooks/useVehiclePositions';
import { getRouteShape, getStop } from '../../services/gtfsStatic';
import { CountdownBadge } from '../../components/ui/CountdownBadge';
import { RouteChip } from '../../components/ui/RouteChip';
import { useThemeColors, type ThemeColors } from '../../hooks/useThemeColors';
import { Colors } from '../../constants/colors';

/** Bright yellow blinking beacon so the live bus is instantly findable on the map. */
function BlinkingBeacon() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setOn((o) => !o), 500);
    return () => clearInterval(id);
  }, []);
  return (
    <View style={beaconStyles.wrap}>
      <View
        style={[
          beaconStyles.halo,
          { opacity: on ? 0.8 : 0.15, transform: [{ scale: on ? 1 : 0.5 }] },
        ]}
      />
      <View style={beaconStyles.ring}>
        <View style={beaconStyles.core} />
      </View>
    </View>
  );
}

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
    closeBtn: {
      position: 'absolute',
      right: 16,
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: 'rgba(0,0,0,0.62)',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    noVehicleText: { color: '#fff', fontSize: 12 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    recenter: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.surface,
      borderRadius: 22,
      paddingVertical: 9,
      paddingHorizontal: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    recenterText: { fontSize: 13, fontWeight: '700', color: c.text },
  });

export default function TripDetailScreen() {
  const { tripId, routeId, routeShortName, headsign, arrivalTime, stopName, stopId } =
    useLocalSearchParams<{
      tripId: string;
      routeId: string;
      routeShortName: string;
      headsign: string;
      arrivalTime: string;
      stopName: string;
      stopId: string;
    }>();

  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const mapRef = useRef<MapView>(null);
  const hasCentered = useRef(false);
  const insets = useSafeAreaInsets();

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const { data: vehicles, isLoading } = useVehiclePositions();
  const vehicle = vehicles?.find((v) => v.tripId === tripId) ?? null;

  const shape = useMemo(() => getRouteShape(routeId ?? ''), [routeId]);
  const shapeCoords = shape.map(([latitude, longitude]) => ({ latitude, longitude }));

  const stop = stopId ? getStop(stopId) : undefined;

  const routeColor = `#${Colors.primary.replace('#', '')}`;

  const initialRegion: Region = vehicle
    ? {
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : shapeCoords.length > 0
      ? {
          latitude: shapeCoords[Math.floor(shapeCoords.length / 2)].latitude,
          longitude: shapeCoords[Math.floor(shapeCoords.length / 2)].longitude,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }
      : { latitude: 49.2827, longitude: -123.1207, latitudeDelta: 0.1, longitudeDelta: 0.1 };

  // Center on the bus once, the first time its position is available
  // (covers the case where live data arrives after the map mounts).
  useEffect(() => {
    if (vehicle && !hasCentered.current) {
      hasCentered.current = true;
      mapRef.current?.animateToRegion(
        {
          latitude: vehicle.latitude,
          longitude: vehicle.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        600,
      );
    }
  }, [vehicle?.latitude, vehicle?.longitude]);

  const recenter = () => {
    if (!vehicle) return;
    mapRef.current?.animateToRegion(
      {
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      },
      400,
    );
  };

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

      <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion} showsUserLocation>
        {shapeCoords.length > 0 && (
          <Polyline coordinates={shapeCoords} strokeColor={routeColor} strokeWidth={3} />
        )}

        {/* The stop you're tracking */}
        {stop && (
          <Marker
            coordinate={{ latitude: stop.stop_lat, longitude: stop.stop_lon }}
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={false}
            zIndex={998}
          >
            <View style={stopPinStyles.wrap}>
              <View style={stopPinStyles.label}>
                <Text style={stopPinStyles.labelText} numberOfLines={1}>
                  Your stop
                </Text>
              </View>
              <View style={stopPinStyles.dot} />
            </View>
          </Marker>
        )}

        {vehicle && (
          <Marker
            coordinate={{ latitude: vehicle.latitude, longitude: vehicle.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges
            zIndex={999}
          >
            <BlinkingBeacon />
          </Marker>
        )}
      </MapView>

      <TouchableOpacity
        style={[styles.closeBtn, { top: insets.top + 8 }]}
        onPress={close}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={22} color="#fff" />
      </TouchableOpacity>

      {!vehicle && (
        <View style={[styles.noVehicle, { top: insets.top + 56 }]}>
          <Text style={styles.noVehicleText}>No live vehicle data for this trip</Text>
        </View>
      )}

      {vehicle && (
        <TouchableOpacity style={styles.recenter} onPress={recenter} activeOpacity={0.8}>
          <Ionicons name="locate" size={16} color={Colors.primary} />
          <Text style={styles.recenterText}>Find bus</Text>
        </TouchableOpacity>
      )}

      <View style={styles.panel}>
        <View style={styles.row}>
          <RouteChip
            shortName={routeShortName ?? ''}
            color={Colors.primary.replace('#', '')}
            textColor="FFFFFF"
          />
          <Text style={styles.headsign} numberOfLines={2}>
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

const stopPinStyles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  label: {
    backgroundColor: '#005CA9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 3,
  },
  labelText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#005CA9',
  },
});

const beaconStyles = StyleSheet.create({
  wrap: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFD400',
  },
  ring: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFD400',
    borderWidth: 1.5,
    borderColor: '#1A1A1A',
  },
});
