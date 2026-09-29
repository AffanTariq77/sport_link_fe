import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { router, type Href } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { api, authHeaders } from './session';

/** Notification links are web paths; these are the matching app screens. */
export function appLink(link: string | null | undefined): Href {
  if (!link) return '/notifications';
  const pay = link.match(/^\/bookings\/([^/]+)\/pay$/);
  if (pay) return `/pay/${pay[1]}`;
  if (/^\/(bookings|matches(\/[^/]+)?|chats(\/[^/]+)?|vendor\/(payments|calendar|refunds))$/.test(link)) return link as Href;
  if (link.startsWith('/vendor')) return '/vendor';
  return '/';
}

// A random id per install, so the API can keep one push token per device.
async function deviceId() {
  const saved = await SecureStore.getItemAsync('sl_device');
  if (saved) return saved;
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  await SecureStore.setItemAsync('sl_device', id);
  return id;
}

let listening = false;

/**
 * Records this device and, when push is possible, its Expo push token. Push needs a real device and an EAS
 * project id (`extra.eas.projectId`, set by `eas init`); Expo Go on Android has no push. Without them the device is
 * still recorded and notifications show in the app's list.
 */
export async function registerDevice() {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  let pushToken: string | undefined;
  if (Device.isDevice && projectId) {
    try {
      const Notifications = await import('expo-notifications');
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'SportsLink',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') pushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      if (!listening) {
        listening = true;
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
          }),
        });
        Notifications.addNotificationResponseReceivedListener((r) =>
          router.push(appLink(r.notification.request.content.data?.link as string | undefined)),
        );
      }
    } catch {
      // Push is optional: the in-app list still works.
    }
  }
  await api.POST('/me/devices', {
    headers: await authHeaders(),
    body: { fingerprint: await deviceId(), platform: Platform.OS === 'ios' ? 'ios' : 'android', pushToken },
  });
}
