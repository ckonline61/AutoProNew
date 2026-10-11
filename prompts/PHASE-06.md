# PHASE 06 — SERVICE CATALOG & BOOKING SYSTEM

## Goal
Build the automotive service catalog, scheduling system, booking lifecycle engine with strict state transitions, and server-side pricing computation.

## Key Tasks
1. Build service catalog endpoints: categories, service packages, pricing, inclusions, exclusions, and estimated turnaround time.
2. Implement booking creation: vehicle selection, chosen services, time slot scheduling, doorstep vs. workshop option, address attachment.
3. Enforce a robust Finite State Machine (FSM) for booking statuses (`PENDING`, `CONFIRMED`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
4. Implement server-side price calculation preventing client-side price tampering.
5. Implement schedule availability checking to prevent overbooking or conflicting slots.
6. Provide customer booking APIs: active bookings, booking history, cancellation with policy enforcement.
7. Build customer mobile booking flow screens in `customer-mobile/`.
8. Write test suites covering state transitions, invalid transition prevention, and price calculation.
9. Update `PROJECT_STATE.md`.

## Do NOT
- Trust client prices, discounts, or totals; always compute on the backend.
- Permit non-compliant or illegal state machine transitions.
- Allow cancellation without checking booking status and cancellation rules.
- Overwrite existing bookings without concurrency or slot validation checks.

## Deliverables
- Service catalog and booking controllers, services, and models in backend.
- State machine validator protecting booking statuses.
- End-to-end booking flow in `customer-mobile/`.
- Test coverage for booking creation and status lifecycle.
- Updated `PROJECT_STATE.md`.
