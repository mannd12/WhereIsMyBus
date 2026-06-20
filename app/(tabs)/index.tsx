import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Polyline, type Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useLocation } from '../../hooks/useLocation';
import { useNearbyStops } from '../../hooks/useNearbyStops';
import { StopMarker } from '../../components/map/StopMarker';
import { VehicleMarker } from '../../components/map/VehicleMarker';
import { RouteFilterBar, type RouteFilter } from '../../components/map/RouteFilterBar';
import { useVehiclePositions } from '../../hooks/useVehiclePositions';
import type { NearbyStop, VehiclePosition } from '../../types/translink';
import { useThemeColors, type ThemeColors } from '../../hooks/useThemeColors';
import { Colors } from '../../constants/colors';
import { getRouteColor, ROUTE_TYPE_SUBWAY, ROUTE_TYPE_FERRY, ROUTE_TYPE_RAIL } from '../../constants/routeTypes';
import { VANCOUVER_REGION } from '../../constants/config';
import { getStopRoutes, getRoute, getRouteShape } from '../../services/gtfsStatic';

const STOP_VISIBILITY_DELTA = 0.012;

function matchesFilter(stop: NearbyStop, filter: RouteFilter): boolean {
  if (filter === 'all') return true;
  const types = stop.route_types;
  switch (filter) {
    case 'skytrain': return types.includes(ROUTE_TYPE_SUBWAY);
    case 'seabus':   return types.includes(ROUTE_TYPE_FERRY);
    case 'wce':      return types.includes(ROUTE_TYPE_RAIL);
    case 'bus':      return types.includes(3) && !isBLine(stop) && !isRapidBus(stop) && !isNightBus(stop);
    case 'bline':    return isBLine(stop);
    case 'rapidbus': return isRapidBus(stop);
    case 'night':    return isNightBus(stop);
    default:         return true;
  }
}

function isBLine(s: NearbyStop)    { return /\bB-Line\b/i.test(s.stop_name); }
function isRapidBus(s: NearbyStop) { return /\bRapidBus\b/i.test(s.stop_name); }
function isNightBus(s: NearbyStop) { return /\bNight\b/i.test(s.stop_name); }

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    mapWrap: { flex: 1 },
    map: { flex: 1 },
    myLocBtn: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    zoomHint: {
      position: 'absolute',
      alignSelf: 'center',
      backgroundColor: 'rgba(0,0,0,0.55)',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    zoomHintText: { color: '#fff', fontSize: 12, fontWeight: '500' },
    banner: { backgroundColor: '#FFF3CD', paddingHorizontal: 16, paddingVertical: 8 },
    bannerText: { fontSize: 13, color: '#7B5800' },
    routeBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: c.surface,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    routeBadge: {
      minWidth: 44,
      paddingHorizontal: 8,
      height: 30,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    routeBadgeText: { color: '#fff', fontWeight: '800', fontSize: 15 },
    routeBannerBody: { flex: 1 },
    routeBannerName: { fontSize: 14, fontWeight: '600', color: c.text },
    routeBannerSub: { fontSize: 12, color: c.textSecondary, marginTop: 1 },
    routeBannerClose: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.background,
    },
    routeBannerCloseText: { fontSize: 14, color: c.textSecondary, fontWeight: '700' },
    panel: {
      backgroundColor: c.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingTop: 12,
      paddingBottom: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 8,
    },
    panelHeader: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
      paddingHorizontal: 16,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    listPadding: { paddingHorizontal: 12, paddingBottom: 4 },
    stopCard: {
      width: 172,
      backgroundColor: c.background,
      borderRadius: 12,
      padding: 12,
      marginHorizontal: 4,
      gap: 4,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    stopCardSelected: { borderColor: Colors.primary, backgroundColor: c.surface },
    stopDot: { width: 8, height: 8, borderRadius: 4 },
    stopName: { fontSize: 13, fontWeight: '600', color: c.text, lineHeight: 17 },
    stopDist: { fontSize: 11, color: c.textSecondary },
    arrivalsBtn: { marginTop: 4 },
    arrivalsBtnText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
    emptyText: { fontSize: 13, color: c.textSecondary, padding: 16, lineHeight: 20 },
    code: { fontFamily: 'monospace', backgroundColor: c.border, color: c.text },
  });

export default function NearbyScreen() {
  const { location, loading: locLoading, error: locError } = useLocation();
  const [selectedStop, setSelectedStop] = useState<NearbyStop | null>(null);
  const [activeFilter, setActiveFilter] = useState<RouteFilter>('all');
  const [currentRegion, setCurrentRegion] = useState<Region>(VANCOUVER_REGION);
  const [tabFocused, setTabFocused] = useState(true);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [blinkOn, setBlinkOn] = useState(true);
  const mapRef = useRef<MapView>(null);
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { top: safeTop } = useSafeAreaInsets();

  useFocusEffect(useCallback(() => {
    setTabFocused(true);
    return () => setTabFocused(false);
  }, []));

  // Blink the selected route's live buses on/off while a route is selected.
  useEffect(() => {
    if (!selectedRouteId) return;
    setBlinkOn(true);
    const id = setInterval(() => setBlinkOn((b) => !b), 550);
    return () => clearInterval(id);
  }, [selectedRouteId]);

  const nearbyStops = useNearbyStops(location);
  const { data: vehicles } = useVehiclePositions();

  const initialRegion: Region = location
    ? { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : VANCOUVER_REGION;

  const stopsZoomedIn = currentRegion.latitudeDelta < STOP_VISIBILITY_DELTA;

  const filteredStops = useMemo(
    () => nearbyStops.filter((s) => matchesFilter(s, activeFilter)),
    [nearbyStops, activeFilter],
  );

  // Route shapes for selected stop
  const selectedShapes = useMemo(() => {
    if (!selectedStop) return [];
    const routeIds = getStopRoutes(selectedStop.stop_id);
    return routeIds.map((rId) => {
      const route = getRoute(rId);
      const shape = getRouteShape(rId);
      const color = route?.route_color ? `#${route.route_color}` : Colors.primary;
      return { routeId: rId, color, coords: shape.map(([lat, lon]) => ({ latitude: lat, longitude: lon })) };
    }).filter((s) => s.coords.length > 0);
  }, [selectedStop]);

  // Selected route: full shape + how many of its buses are live right now.
  const selectedRoute = selectedRouteId ? getRoute(selectedRouteId) : undefined;
  const selectedRouteShape = useMemo(() => {
    if (!selectedRouteId) return null;
    const route = getRoute(selectedRouteId);
    const color = route?.route_color ? `#${route.route_color}` : Colors.primary;
    const shape = getRouteShape(selectedRouteId);
    return { color, coords: shape.map(([lat, lon]) => ({ latitude: lat, longitude: lon })) };
  }, [selectedRouteId]);
  const routeColor = selectedRouteShape?.color ?? Colors.primary;
  const routeVehicleCount = useMemo(
    () => (selectedRouteId ? (vehicles ?? []).filter((v) => v.routeId === selectedRouteId).length : 0),
    [vehicles, selectedRouteId],
  );

  const handleStopPress = useCallback((stop: NearbyStop) => {
    setSelectedRouteId(null);
    setSelectedStop(stop);
    mapRef.current?.animateToRegion(
      { latitude: stop.stop_lat, longitude: stop.stop_lon, latitudeDelta: 0.006, longitudeDelta: 0.006 },
      300,
    );
  }, []);

  // One touch: tap any bus to instantly show its route + blink its live position.
  const handleVehiclePress = useCallback((v: VehiclePosition) => {
    setSelectedStop(null);
    setSelectedRouteId(v.routeId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedStop(null);
    setSelectedRouteId(null);
  }, []);

  const goToMyLocation = useCallback(() => {
    if (!location) return;
    mapRef.current?.animateToRegion(
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      },
      450,
    );
  }, [location]);

  const handleViewArrivals = useCallback((stop: NearbyStop) => {
    router.push(`/stop/${stop.stop_id}`);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.mapWrap}>
      {tabFocused && <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}
        zoomControlEnabled={false}
        mapPadding={{ top: safeTop + 54, right: 0, bottom: 0, left: 0 }}
        onRegionChange={setCurrentRegion}
        onPress={clearSelection}
      >
        {/* Route shapes for selected stop */}
        {selectedShapes.map((s) => (
          <Polyline
            key={s.routeId}
            coordinates={s.coords}
            strokeColor={s.color}
            strokeWidth={3}
          />
        ))}

        {/* Highlighted full path for a tapped bus's route */}
        {selectedRouteShape && selectedRouteShape.coords.length > 0 && (
          <Polyline
            coordinates={selectedRouteShape.coords}
            strokeColor={selectedRouteShape.color}
            strokeWidth={5}
            zIndex={2}
          />
        )}

        {stopsZoomedIn &&
          filteredStops.map((stop) => (
            <StopMarker
              key={stop.stop_id}
              stop={stop}
              selected={selectedStop?.stop_id === stop.stop_id}
              onPress={handleStopPress}
              onViewArrivals={handleViewArrivals}
            />
          ))}

        {(vehicles ?? []).map((v) => {
          const isOnRoute = selectedRouteId === v.routeId;
          return (
            <VehicleMarker
              key={v.vehicleId}
              vehicle={v}
              highlighted={isOnRoute}
              dimmed={selectedRouteId !== null && !isOnRoute}
              blinkOn={isOnRoute ? blinkOn : false}
              onPress={handleVehiclePress}
            />
          );
        })}
      </MapView>}

        {location && (
          <TouchableOpacity
            style={styles.myLocBtn}
            onPress={goToMyLocation}
            activeOpacity={0.85}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="locate" size={22} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <RouteFilterBar active={activeFilter} onChange={setActiveFilter} />

      {!stopsZoomedIn && (
        <View style={[styles.zoomHint, { top: safeTop + 54 }]}>
          <Text style={styles.zoomHintText}>Zoom in to see stops</Text>
        </View>
      )}

      {locError ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{locError}</Text>
        </View>
      ) : null}

      {selectedRoute && (
        <View style={styles.routeBanner}>
          <View style={[styles.routeBadge, { backgroundColor: routeColor }]}>
            <Text style={styles.routeBadgeText} numberOfLines={1}>
              {selectedRoute.route_short_name}
            </Text>
          </View>
          <View style={styles.routeBannerBody}>
            <Text style={styles.routeBannerName} numberOfLines={1}>
              {selectedRoute.route_long_name || 'Route'}
            </Text>
            <Text style={styles.routeBannerSub}>
              {routeVehicleCount > 0
                ? `${routeVehicleCount} live ${routeVehicleCount === 1 ? 'bus' : 'buses'} · blinking on map`
                : 'No live buses right now'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={clearSelection}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.routeBannerClose}
          >
            <Text style={styles.routeBannerCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.panel}>
        <Text style={styles.panelHeader}>
          {locLoading ? 'Locating…' : `${filteredStops.length} stop${filteredStops.length !== 1 ? 's' : ''} nearby`}
        </Text>

        {locLoading && nearbyStops.length === 0 ? (
          <ActivityIndicator color={Colors.primary} style={{ margin: 16 }} />
        ) : nearbyStops.length === 0 ? (
          <Text style={styles.emptyText}>
            No stops found. Run <Text style={styles.code}>node scripts/fetchGtfsStatic.js</Text> to load stops.
          </Text>
        ) : (
          <FlatList
            data={filteredStops}
            keyExtractor={(s) => s.stop_id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.stopCard, selectedStop?.stop_id === item.stop_id && styles.stopCardSelected]}
                onPress={() => handleStopPress(item)}
                onLongPress={() => handleViewArrivals(item)}
                activeOpacity={0.75}
              >
                <View style={[styles.stopDot, { backgroundColor: getRouteColor(item.route_types[0] ?? 3) }]} />
                <Text style={styles.stopName} numberOfLines={2}>{item.stop_name}</Text>
                <Text style={styles.stopDist}>
                  {Math.round(item.distance)}m · ~{Math.max(1, Math.round(item.distance / 80))} min walk
                </Text>
                <TouchableOpacity style={styles.arrivalsBtn} onPress={() => handleViewArrivals(item)}>
                  <Text style={styles.arrivalsBtnText}>Arrivals →</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}
