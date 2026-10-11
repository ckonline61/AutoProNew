# PHASE 04 — AUTHENTICATION & AUTHORIZATION

## Goal
Implement a secure, multi-role authentication and authorization system supporting phone OTP, email/password, JWT access/refresh token rotation, and RBAC middleware.

## Key Tasks
1. Build authentication workflows: Phone OTP verification, email/password signup, and login.
2. Implement dual-token strategy: Short-lived JWT access tokens and secure, rotating refresh tokens with revocation support.
3. Create role-based authorization middleware supporting Customer, Mechanic, Admin, and SuperAdmin roles.
4. Implement secure password hashing (bcrypt), time-limited OTP generation, and strict rate-limiting on auth endpoints.
5. Build endpoints: `/api/v1/auth/send-otp`, `/api/v1/auth/verify-otp`, `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/logout`.
6. Implement token blacklist or refresh token invalidation on logout and password reset.
7. Write comprehensive unit and integration tests for authentication and authorization.
8. Update `PROJECT_STATE.md`.

## Do NOT
- Permit client-supplied roles to grant administrative privileges upon registration.
- Store plain-text passwords or plaintext OTP codes in the database.
- Issue JWTs without strict expiration times or with hardcoded secret keys.
- Allow unlimited OTP generation or verification attempts without rate limits.

## Deliverables
- Complete authentication module in `backend/src/modules/auth/`.
- Authentication and role-authorization middleware (`authenticate`, `requireRole`).
- OTP service with time-to-live and rate-limiting safeguards.
- Integration tests for auth workflows.
- Updated `PROJECT_STATE.md`.
