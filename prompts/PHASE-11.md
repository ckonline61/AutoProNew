# PHASE 11 — PAYMENT GATEWAY INTEGRATION

## Goal
Implement end-to-end payment processing with Razorpay, strictly verified on the backend, with webhook listeners, refund automation, and payment state idempotency.

## Key Tasks
1. Integrate Razorpay backend SDK for creating payment orders (`/api/v1/payments/create-order`).
2. Build server-side cryptographic signature verification (`crypto.createHmac`) for payment captures.
3. Build secure, idempotent Razorpay webhook endpoint (`/api/v1/payments/webhook`) validating HMAC signatures.
4. Handle multiple payment options: Online Payment (UPI, Cards, NetBanking), Cash on Delivery, and Pay-after-Service.
5. Implement automated and manual refund workflows linked to cancellation policies.
6. Integrate Razorpay checkout SDK in `customer-mobile/` with payment status feedback.
7. Write unit and integration tests simulating successful payments, signature failures, and webhook retries.
8. Update `PROJECT_STATE.md`.

## Do NOT
- Trust client-side verification to update booking payment status (require server signature verification or webhook).
- Store raw credit/debit card numbers or CVV on Auto Pro databases.
- Allow duplicate order creation or race conditions during payment verification.
- Process webhooks without verifying `x-razorpay-signature`.

## Deliverables
- Payment engine in `backend/src/modules/payments/`.
- Secure webhook listener with replay-attack protection and idempotency checks.
- Mobile payment flow in `customer-mobile/`.
- Comprehensive payment tests with mocked Razorpay responses.
- Updated `PROJECT_STATE.md`.
