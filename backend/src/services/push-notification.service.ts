import Expo, { ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { logger } from '../utils/logger';

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
}

export class PushNotificationService {
  /**
   * Send push notification to one or multiple Expo push tokens
   */
  async sendToTokens(
    tokens: string[],
    payload: PushNotificationPayload
  ): Promise<{ sent: number; failed: number }> {
    const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token));

    if (validTokens.length === 0) {
      logger.warn('No valid Expo push tokens provided');
      return { sent: 0, failed: tokens.length };
    }

    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      sound: payload.sound ?? 'default',
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
      badge: payload.badge,
    }));

    let sent = 0;
    let failed = 0;

    try {
      const chunks = expo.chunkPushNotifications(messages);

      for (const chunk of chunks) {
        try {
          const tickets: ExpoPushTicket[] = await expo.sendPushNotificationsAsync(chunk);

          for (const ticket of tickets) {
            if (ticket.status === 'ok') {
              sent++;
            } else {
              failed++;
              logger.warn('Push notification failed', { ticket });
            }
          }
        } catch (chunkError) {
          failed += chunk.length;
          logger.error('Push notification chunk failed', { error: chunkError });
        }
      }
    } catch (error) {
      logger.error('Push notification send error', { error });
      return { sent: 0, failed: tokens.length };
    }

    logger.info('Push notifications sent', { sent, failed, total: tokens.length });
    return { sent, failed };
  }

  /**
   * Send to single token
   */
  async sendToToken(token: string, payload: PushNotificationPayload) {
    return this.sendToTokens([token], payload);
  }

  // ─── Predefined notification templates ────────────────────────────

  async notifyBookingConfirmed(token: string, bookingNumber: string, serviceName: string) {
    return this.sendToToken(token, {
      title: '✅ Booking Confirmed!',
      body: `Your ${serviceName} (${bookingNumber}) is confirmed. We'll notify when mechanic is assigned.`,
      data: { type: 'BOOKING_CONFIRMED', bookingNumber },
    });
  }

  async notifyMechanicAssigned(token: string, mechanicName: string, bookingNumber: string) {
    return this.sendToToken(token, {
      title: '🔧 Mechanic Assigned!',
      body: `${mechanicName} has been assigned to your booking ${bookingNumber}.`,
      data: { type: 'MECHANIC_ASSIGNED', bookingNumber },
    });
  }

  async notifyMechanicOnWay(token: string, mechanicName: string, eta?: string) {
    return this.sendToToken(token, {
      title: '🚗 Mechanic On The Way!',
      body: eta
        ? `${mechanicName} is heading to you. ETA: ${eta}`
        : `${mechanicName} is on the way to your location.`,
      data: { type: 'MECHANIC_ON_WAY' },
    });
  }

  async notifyServiceCompleted(token: string, serviceName: string, amount: number) {
    return this.sendToToken(token, {
      title: '✅ Service Completed!',
      body: `Your ${serviceName} is done! Total: ₹${amount}. Tap to view invoice.`,
      data: { type: 'SERVICE_COMPLETED', amount },
    });
  }

  async notifyPaymentReceived(token: string, amount: number, bookingNumber: string) {
    return this.sendToToken(token, {
      title: '💰 Payment Received!',
      body: `₹${amount} received for booking ${bookingNumber}. Thank you!`,
      data: { type: 'PAYMENT_RECEIVED', amount, bookingNumber },
    });
  }

  async notifyNewBookingToMechanic(
    tokens: string[],
    bookingNumber: string,
    serviceName: string,
    address: string
  ) {
    return this.sendToTokens(tokens, {
      title: '🔔 New Booking Request!',
      body: `${serviceName} at ${address}. Booking: ${bookingNumber}`,
      data: { type: 'NEW_BOOKING', bookingNumber },
    });
  }

  async notifyOfferToCustomers(tokens: string[], offerTitle: string, offerBody: string) {
    return this.sendToTokens(tokens, {
      title: `🎁 ${offerTitle}`,
      body: offerBody,
      data: { type: 'OFFER' },
    });
  }

  async notifyReviewRequest(token: string, mechanicName: string, bookingNumber: string) {
    return this.sendToToken(token, {
      title: '⭐ How was your experience?',
      body: `Rate your service with ${mechanicName}. Your feedback matters!`,
      data: { type: 'REVIEW_REQUEST', bookingNumber },
    });
  }

  async notifySosReceived(tokens: string[], customerName: string, location: string) {
    return this.sendToTokens(tokens, {
      title: '🆘 SOS Emergency Request!',
      body: `${customerName} needs emergency help at ${location}`,
      data: { type: 'SOS_EMERGENCY' },
      sound: 'default',
    });
  }
}

export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
