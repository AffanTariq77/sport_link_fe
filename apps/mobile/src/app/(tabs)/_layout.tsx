import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { colors, header, type IconName } from '../../ui';

const icon = (name: IconName) =>
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} size={size} color={color} />;
  };

/** Bottom tab bar for the five things players do most. Everything else opens on top as a stack screen. */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        ...header,
        sceneStyle: { backgroundColor: colors.surface },
        tabBarStyle: { backgroundColor: colors.navy, borderTopWidth: 0 },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: '#aab4cc',
        tabBarLabelStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', headerShown: false, tabBarIcon: icon('home') }} />
      <Tabs.Screen name="venues" options={{ title: 'Book', headerTitle: 'Book a venue', tabBarIcon: icon('calendar') }} />
      <Tabs.Screen name="matches" options={{ title: 'Matches', tabBarIcon: icon('football') }} />
      <Tabs.Screen name="find-players" options={{ title: 'Find', headerTitle: 'Find Players', tabBarIcon: icon('locate') }} />
      <Tabs.Screen name="chats" options={{ title: 'Chats', tabBarIcon: icon('chatbubbles') }} />
    </Tabs>
  );
}
