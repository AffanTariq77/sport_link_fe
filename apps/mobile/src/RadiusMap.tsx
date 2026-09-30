import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { api, authHeaders } from './session';
import { card, colors, failed, run } from './ui';

type Point = { latitude: number; longitude: number };
const LAHORE: Point = { latitude: 31.5204, longitude: 74.3587 }; // launch city, shown until the player shares a location
const region = (p: Point, km: number) => ({ ...p, latitudeDelta: (km * 2.6) / 111, longitudeDelta: (km * 2.6) / 111 });

/**
 * The player's own search area: their position (kept on the phone, the API stores only a rounded area) and the
 * radius they are asking within. Other players are never pinned; they appear as distance bands only.
 */
export function RadiusMap({ radiusKm, searching = false, hasLocation, onShared }: { radiusKm: number; searching?: boolean; hasLocation: boolean; onShared?: () => void }) {
  const [here, setHere] = useState<Point | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const km = radiusKm > 0 ? radiusKm : 1;

  // Show the player's position without a prompt when they have already allowed it.
  useEffect(() => {
    Location.getForegroundPermissionsAsync()
      .then(async ({ granted }) => granted && setHere((await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })).coords))
      .catch(() => undefined);
  }, []);

  const share = () =>
    run(setBusy, setMessage, async () => {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) return setMessage('Location permission was not given.');
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setHere(coords);
      const { error } = await api.PUT('/me/location', { headers: await authHeaders(), body: { latitude: coords.latitude, longitude: coords.longitude } });
      if (error) return setMessage(error.message ?? failed);
      setMessage('Location shared. Only a rounded area is kept, and others see distance bands only.');
      onShared?.();
    });

  const centre = here ? { latitude: here.latitude, longitude: here.longitude } : LAHORE;
  return (
    <View style={styles.box}>
      <MapView style={styles.map} region={region(centre, here ? km : 12)} rotateEnabled={false} pitchEnabled={false} accessibilityLabel={`Map of your search area, ${km} km around you`}>
        {here && (
          <>
            <Circle center={centre} radius={km * 1000} strokeColor={colors.accent} strokeWidth={2} fillColor={searching ? 'rgba(255,107,26,0.25)' : 'rgba(255,107,26,0.12)'} />
            <Marker coordinate={centre} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
              <View style={styles.you} />
            </Marker>
          </>
        )}
      </MapView>
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.pill}>
          {searching && <ActivityIndicator size="small" color="#fff" />}
          <Text style={styles.pillText}>{searching ? `Searching within ${km} km` : `Within ${km} km`}</Text>
        </View>
        <Pressable style={[styles.pill, styles.locate]} onPress={share} disabled={busy} accessibilityRole="button">
          <Ionicons name="locate" size={14} color={colors.navy} />
          <Text style={[styles.pillText, { color: colors.navy }]}>{busy ? 'Finding you…' : here || hasLocation ? 'Update location' : 'Share location'}</Text>
        </Pressable>
      </View>
      {!!message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { ...card, overflow: 'hidden' },
  map: { width: '100%', height: 280 },
  overlay: { position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.navy, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  locate: { backgroundColor: colors.accent },
  pillText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  you: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.navy, borderWidth: 4, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 3, elevation: 3 },
  message: { padding: 12, fontSize: 14, color: colors.text, borderTopWidth: 1, borderColor: colors.line },
});
