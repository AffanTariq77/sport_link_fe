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
        <Stack.Screen name="pay/[id]" options={{ title: 'Pay the advance' }} />
        <Stack.Screen name="vendor/index" options={{ title: 'Vendor' }} />
        <Stack.Screen name="vendor/payments" options={{ title: 'Payments to check' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
