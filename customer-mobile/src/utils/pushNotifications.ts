import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';

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
  // Push notifications only work on real devices
  if (!Device.isDevice) {
    console.log('[Push] Skipped — not a real device (simulator/emulator)');
    return null;
  }

  // Check existing permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Push] Permission denied by user');
    return null;
  }

  // Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Auto Pro Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#DC2626',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('bookings', {
      name: 'Booking Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#DC2626',
      sound: 'default',
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
      projectId: 'a5c96d22-285d-4e9b-8932-9f74a5c4ba89', // customer EAS project ID
    });
    console.log('[Push] Token registered:', tokenData.data);
    return tokenData.data;
  } catch (error) {
    console.error('[Push] Token registration failed:', error);
    return null;
  }
}

/**
 * Set up notification listeners.
 * Returns cleanup function — call on component unmount.
 */
export function setupNotificationListeners(
  onNotification?: (notification: Notifications.Notification) => void,
  onResponse?: (response: Notifications.NotificationResponse) => void
) {
  const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
    console.log('[Push] Notification received:', notification.request.content.title);
    onNotification?.(notification);
  });

  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('[Push] Notification tapped:', response.notification.request.content.data);
    onResponse?.(response);
  });

  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}

/**
 * Clear all badge counts
 */
export async function clearBadgeCount() {
  await Notifications.setBadgeCountAsync(0);
}
