import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register for push notifications and return Expo Push Token.
 * Returns null if permission denied or not a real device.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('[Push] Skipped — not a real device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Push] Permission denied');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Auto Pro Mechanic',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1A73E8',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('jobs', {
      name: 'New Job Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#1A73E8',
      sound: 'default',
      bypassDnd: false,
    });

    await Notifications.setNotificationChannelAsync('sos', {
      name: 'Emergency SOS',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#FF0000',
      sound: 'default',
      bypassDnd: true,
    });
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '98838020-cf59-4a00-95a2-862f6553da21', // mechanic EAS project ID
    });
    console.log('[Push] Mechanic token:', tokenData.data);
    return tokenData.data;
  } catch (error) {
    console.error('[Push] Token failed:', error);
    return null;
  }
}

/**
 * Set up notification listeners — returns cleanup fn
 */
export function setupNotificationListeners(
  onNotification?: (notification: Notifications.Notification) => void,
  onResponse?: (response: Notifications.NotificationResponse) => void
) {
  const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
    console.log('[Push] Received:', notification.request.content.title);
    onNotification?.(notification);
  });

  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('[Push] Tapped:', response.notification.request.content.data);
    onResponse?.(response);
  });

  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}

export async function clearBadgeCount() {
  await Notifications.setBadgeCountAsync(0);
}
