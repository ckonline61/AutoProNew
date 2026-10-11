# PHASE 08 — EMERGENCY ROADSIDE ASSISTANCE (RSA)

## Goal
Implement the emergency roadside assistance module featuring emergency categorization, rapid SOS dispatch, proximity-based provider matching, and lifecycle management.

## Key Tasks
1. Define emergency roadside service categories (Flat Tyre, Battery Jumpstart, Towing, Fuel Delivery, Lockout, Breakdown).
2. Build rapid SOS request API capturing GPS coordinates, vehicle details, and immediate notes.
3. Implement proximity-based provider matching algorithm leveraging MongoDB geospatial queries (`2dsphere`) to identify eligible, online mechanics.
4. Create emergency lifecycle state machine (`REQUESTED`, `MATCHING`, `ACCEPTED`, `DISPATCHED`, `ON_SCENE`, `RESOLVED`, `CANCELLED`).
5. Build auto-timeout and escalation fallback when no provider responds within the SLA window (e.g. 60 seconds).
6. Implement rapid SOS UI flow in `customer-mobile/` and high-priority dispatch modal in `mechanic-mobile/`.
7. Write unit and integration tests for emergency matching, dispatch timeouts, and state transitions.
8. Update `PROJECT_STATE.md`.

## Do NOT
- Impose complex multi-step questionnaires during emergency SOS creation.
- Match offline or busy providers to emergency requests.
- Leave emergency requests without an automated fallback or admin escalation.

## Deliverables
- Emergency assistance backend service and routes in `backend/src/modules/emergency/`.
- Proximity-based matching engine with radius limits and SLA timeouts.
- One-tap emergency request mobile interface in `customer-mobile/`.
- Urgent alert screen and response actions in `mechanic-mobile/`.
- Updated `PROJECT_STATE.md`.
