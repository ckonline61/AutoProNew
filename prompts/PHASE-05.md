# PHASE 05 — CUSTOMER PROFILE & VEHICLE MANAGEMENT

## Goal
Implement customer profile management, multiple saved addresses, and vehicle garage management (CRUD) on backend and mobile client interfaces.

## Key Tasks
1. Implement profile management APIs: get profile, update personal information, upload avatar.
2. Build saved address management: create, update, delete, set default address with lat/lng coordinates and landmarks.
3. Build customer vehicle garage: add vehicle (make, model, year, fuel type, transmission, plate number), update, delete, set primary vehicle.
4. Implement strict ownership verification middleware ensuring users can only modify their own vehicles/addresses.
5. Add schema validation using Zod/Joi for profile, address, and vehicle data structures.
6. Implement corresponding UI screens and API integration in `customer-mobile/`.
7. Write unit and integration tests for profile and vehicle APIs.
8. Update `PROJECT_STATE.md`.

## Do NOT
- Allow cross-user access to profile data, vehicles, or addresses (prevent IDOR vulnerabilities).
- Store unvalidated or non-sanitized vehicle registration details.
- Allow deletion of a vehicle currently linked to an active booking without validation.

## Deliverables
- Profile, address, and vehicle endpoints in `backend/src/modules/profile/` and `vehicles/`.
- Mobile screens for Profile, Saved Addresses, and My Garage in `customer-mobile/`.
- Validation schemas and ownership guards.
- Automated tests covering profile and vehicle operations.
- Updated `PROJECT_STATE.md`.
