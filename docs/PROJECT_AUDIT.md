# Project audit and preview — 13 October 2026

## Repairs
- Admin authentication now reads `data.tokens.accessToken`, checks ADMIN/SUPER_ADMIN roles, verifies restored sessions, and clears rejected sessions. Failed requests cannot create fabricated sessions.
- Removed prefilled administrator credentials; login displays server error messages. Logout sends the stored refresh token for revocation.
- Admin routes load on demand: initial production JavaScript decreased from about 687 KB to 276 KB.
- Customer mobile uses Expo-compatible bundler module resolution. Removed unsupported React Native 0.87 StatusBar backgroundColor props, cleaned unused arguments and replaced the fixed appointment date with tomorrow's local date.
- Removed duplicate database index declarations while retaining field-level unique indexes. Payment order indexing retains its sparse option explicitly.
- Public catalogue adapts MongoDB `_id`, populated categories, duration, spare-part categoryTag, stock, image arrays, uppercase fuel types and nested car locations to the UI.
- Out-of-stock items cannot be added to the preview cart. Unknown public routes display a useful 404 screen.
- Booking/contact/test-drive previews no longer falsely state that a server request succeeded. Unimplemented admin modules now identify their actual status.
- Added five admin authentication regression tests and three public catalogue adapter tests.

## Running preview
- Website: http://127.0.0.1:5174/
- Admin login: http://127.0.0.1:5173/login
- Backend health: http://127.0.0.1:5000/api/v1/health
- MongoDB: connected to the existing local development database.
- Restart with `powershell -ExecutionPolicy Bypass -File .\START_PREVIEW.ps1`.
- Logs are written under `%TEMP%\auto-pro-preview`.
- The existing START_ALL_PREVIEWS.bat was preserved.

## Limits and work still required
This is a verified development preview, not a completed production application.
- Several admin screens retain sample data and local-only mutations. Eight extended admin modules are still placeholders.
- The website has no complete authenticated booking, checkout, or test-drive workflow. The contact form does not deliver messages.
- Customer and mechanic apps use mock data in several flows. Their existing single tests are placeholders, not functional mobile coverage.
- Native Android/iOS builds and on-device flows have not been validated. This preview shows the React public website and admin login.
- The existing development catalogue is empty. No sample records or privileged accounts were inserted into the database.
- Published store links, real support details, payment/provider configuration and production infrastructure need validation before release.

## Validation
- Backend: strict typecheck, ESLint, production build; 147 tests across 14 suites passed.
- Web: TypeScript/production build, ESLint; three catalogue tests passed.
- Admin: TypeScript/production build, ESLint; five authentication tests passed.
- Browser: homepage rendered, services showed the database empty state, invalid administrator login returned 401 and remained on the login screen.
- Mobile verification results are recorded in PROJECT_STATE.md after the final checks.
