# PHASE 03 — DATABASE FOUNDATION

## Goal
Design and implement core MongoDB schemas, TypeScript interfaces, indexes, relationships, data validation, and seeding utilities.

## Key Tasks
1. Define Mongoose schemas and strict TypeScript interfaces for primary entities (User, Mechanic, Vehicle, Service, Booking, EmergencyRequest, Payment, Invoice, Notification, AuditLog).
2. Configure appropriate indexes, including compound indexes and `2dsphere` indexes for geospatial queries.
3. Configure schema plugins/hooks for timestamps, versioning, soft deletion, and sensitive field omission (`toJSON` transformations).
4. Implement data validation rules, enums, and constraint checks across all models.
5. Create sample database seeding scripts for local development and integration tests.
6. Verify index creation and model relationships with validation tests.
7. Update `PROJECT_STATE.md`.

## Do NOT
- Expose sensitive fields like password hashes, OTPs, or auth tokens in default schema outputs.
- Query geospatial or high-frequency fields without proper indexes.
- Embed entire high-growth collections into parent documents (avoid unbounded array anti-patterns).
- Place API controller logic inside model files.

## Deliverables
- Fully typed Mongoose models in `backend/src/models/`.
- Schema index specifications including geospatial `2dsphere` indexes.
- Database seed scripts for development data.
- Model unit tests validating constraints and hooks.
- Updated `PROJECT_STATE.md`.
