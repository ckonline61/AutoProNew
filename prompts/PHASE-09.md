# PHASE 09 — GOOGLE MAPS & LOCATION SERVICES

## Goal
Integrate Google Maps Platform services for forward/reverse geocoding, place autocomplete, route calculation, and serviceability geofencing.

## Key Tasks
1. Build backend Maps wrapper service interfacing with Google Maps APIs (Geocoding, Places Autocomplete, Distance Matrix, Directions).
2. Implement caching layer for geocoding and distance lookups to optimize API quota usage and latency.
3. Implement geofenced service area validation to verify whether a customer location is supported.
4. Secure Google Maps API keys with proper bundle ID/SHA-1 and HTTP referrer restrictions.
5. Embed Google Maps components into `customer-mobile/` and `mechanic-mobile/` with customized Auto Pro pins and route polylines.
6. Write tests with mocked Google Maps API responses to validate geofencing and distance calculations.
7. Update `PROJECT_STATE.md`.

## Do NOT
- Expose unconstrained Google Maps API keys in mobile or web clients.
- Query Google Maps API on every keystroke without debouncing and backend caching.
- Allow service bookings in unserviceable locations without clear feedback.

## Deliverables
- Maps integration service in `backend/src/modules/maps/`.
- Service area boundary checker and geofencing utilities.
- Interactive map components in customer and mechanic mobile apps.
- Unit and integration tests with mocked maps providers.
- Updated `PROJECT_STATE.md`.
