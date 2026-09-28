import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {
  return (
    <>
      <Stack screenOptions={{ contentStyle: { backgroundColor: '#fff' } }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="venues/index" options={{ title: 'Book a venue' }} />
        <Stack.Screen name="venues/[id]" options={{ title: '' }} />
        <Stack.Screen name="bookings" options={{ title: 'My bookings' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
