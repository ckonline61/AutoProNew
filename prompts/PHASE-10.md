# PHASE 10 — REAL-TIME LIVE TRACKING

## Goal
Implement secure real-time WebSocket communication for live mechanic location streaming, dynamic ETA calculations, and active-job tracking with strict privacy boundaries.

## Key Tasks
1. Set up Socket.IO / WebSocket server integrated with Express, secured via JWT authentication handshakes.
2. Build isolated socket rooms keyed by booking ID / emergency request ID.
3. Implement throttled location publisher in `mechanic-mobile/` (e.g. 5-10s intervals with heading and speed).
4. Implement live location consumer and smooth marker interpolation in `customer-mobile/`.
5. Enforce privacy controls: terminate location streaming immediately upon job completion or cancellation.
6. Implement dynamic ETA recalculation based on updated coordinates and traffic.
7. Build connection resilience: automatic reconnects, offline queueing, and error recovery.
8. Write tests for socket auth, room authorization, and message throttling.
9. Update `PROJECT_STATE.md`.

## Do NOT
- Track or record provider location outside of an active, accepted booking or emergency request.
- Broadcast coordinates to unauthenticated sockets or across unauthorized rooms.
- Transmit unbounded high-frequency GPS pings without client-side throttling.

## Deliverables
- WebSocket server and room authorization in `backend/src/modules/realtime/`.
- Location emitter with background lifecycle management in `mechanic-mobile/`.
- Smooth animated tracking screen in `customer-mobile/`.
- Real-time tests verifying room isolation and privacy shutdown.
- Updated `PROJECT_STATE.md`.
