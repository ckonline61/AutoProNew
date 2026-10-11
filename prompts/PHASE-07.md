# PHASE 07 — MECHANIC ONBOARDING & JOB MANAGEMENT

## Goal
Implement mechanic onboarding, verification workflow, availability management, job dispatching, and mobile job execution interfaces.

## Key Tasks
1. Build mechanic onboarding APIs: personal details, skill specializations, garage details, and certification/ID document uploads.
2. Implement admin verification state workflow (`PENDING_VERIFICATION`, `APPROVED`, `REJECTED`, `SUSPENDED`).
3. Build availability toggle (`ONLINE` / `OFFLINE`) and operational working radius settings.
4. Build job dispatch and management system: job offer broadcasting, accept/reject timers, active job details, inspection checklists.
5. Implement job state execution actions for mechanics (`EN_ROUTE`, `ARRIVED`, `SERVICE_STARTED`, `SERVICE_COMPLETED`).
6. Build mechanic mobile UI screens in `mechanic-mobile/` (Dashboard, Job Feed, Active Job details).
7. Write unit and integration tests for mechanic onboarding and job assignment logic.
8. Update `PROJECT_STATE.md`.

## Do NOT
- Assign jobs to mechanics whose verification status is not `APPROVED` or who are `OFFLINE`.
- Allow a mechanic to operate on bookings assigned to another provider.
- Expose customer payment credentials or sensitive private data to the mechanic.

## Deliverables
- Mechanic management APIs and verification services in backend.
- Mechanic mobile app onboarding and job management screens in `mechanic-mobile/`.
- Job dispatch and acceptance workflows.
- Integration test suite for mechanic operations.
- Updated `PROJECT_STATE.md`.
