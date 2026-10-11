# PHASE 13 — NOTIFICATIONS (PUSH & IN-APP)

## Goal
Implement a multi-channel notification engine supporting Firebase Cloud Messaging (FCM) push notifications, persistent in-app notifications, and device token lifecycle management.

## Key Tasks
1. Integrate Firebase Admin SDK for FCM push notifications across Android and iOS devices.
2. Build device token registry endpoints (`/api/v1/notifications/tokens`) supporting multi-device per user and cleanup of invalid tokens.
3. Build in-app notification center: store notifications, fetch paginated list, mark single/all as read, badge count.
4. Implement parameterized notification template engine for booking updates, SOS alerts, payment receipts, and dispatch events.
5. Wire lifecycle events (booking state changes, emergency dispatch, invoice generation) to notification dispatchers asynchronously.
6. Integrate push notification listeners and notification inbox screens in `customer-mobile/` and `mechanic-mobile/`.
7. Write unit and integration tests with mocked FCM transport.
8. Update `PROJECT_STATE.md`.

## Do NOT
- Block HTTP response handlers with synchronous push notification calls.
- Fail silently when FCM returns dead/unregistered tokens (must prune inactive device tokens).
- Send duplicate notifications for idempotent events.

## Deliverables
- Multi-channel notification service in `backend/src/modules/notifications/`.
- Device token registration and pruning utilities.
- In-app notification feeds in customer and mechanic mobile apps.
- Mocked notification test suite.
- Updated `PROJECT_STATE.md`.
