import { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Polyline, type Region } from 'react-native-maps';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useVehiclePositions } from '../../hooks/useVehiclePositions';
import { getRouteShape, getRoute } from '../../services/gtfsStatic';
import { VehicleMarker } from '../../components/map/VehicleMarker';
import { useThemeColors, type ThemeColors } from '../../hooks/useThemeColors';
import { Colors } from '../../constants/colors';
import { VANCOUVER_REGION } from '../../constants/config';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    map: { flex: 1 },
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
    banner: {
      position: 'absolute',
      left: 16,
      backgroundColor: c.surface,
      borderRadius: 18,
      paddingVertical: 8,
      paddingHorizontal: 14,
      maxWidth: '70%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    bannerText: { fontSize: 14, fontWeight: '700', color: c.text },
    bannerSub: { fontSize: 12, color: c.textSecondary, marginTop: 1 },
  });

export default function RouteMapScreen() {
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const fitted = useRef(false);

  const route = getRoute(routeId ?? '');
  const { data: vehicles } = useVehiclePositions();
  const routeVehicles = useMemo(
    () => (vehicles ?? []).filter((v) => v.routeId === routeId),
    [vehicles, routeId],
  );

  const shape = useMemo(() => getRouteShape(routeId ?? ''), [routeId]);
  const coords = useMemo(
    () => shape.map(([latitude, longitude]) => ({ latitude, longitude })),
    [shape],
  );
  const color = route?.route_color ? `#${route.route_color}` : Colors.primary;

  const initialRegion: Region =
    coords.length > 0
      ? {
          latitude: coords[Math.floor(coords.length / 2)].latitude,
          longitude: coords[Math.floor(coords.length / 2)].longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }
      : VANCOUVER_REGION;

  // Fit the whole route into view once.
  useEffect(() => {
    if (!fitted.current && coords.length > 1) {
      fitted.current = true;
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 90, right: 60, bottom: 120, left: 60 },
        animated: false,
      });
    }
  }, [coords]);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion} showsUserLocation>
        {coords.length > 0 && <Polyline coordinates={coords} strokeColor={color} strokeWidth={4} />}
        {routeVehicles.map((v) => (
          <VehicleMarker key={v.vehicleId} vehicle={v} />
        ))}
      </MapView>

      <View style={[styles.banner, { top: insets.top + 8 }]}>
        <Text style={styles.bannerText} numberOfLines={1}>
          {route?.route_short_name ?? 'Route'} {route?.route_long_name ? `· ${route.route_long_name}` : ''}
        </Text>
        <Text style={styles.bannerSub}>
          {routeVehicles.length} live bus{routeVehicles.length !== 1 ? 'es' : ''} on this route
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.closeBtn, { top: insets.top + 8 }]}
        onPress={close}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Close route map"
      >
        <Ionicons name="close" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
