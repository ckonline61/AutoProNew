# AUTO PRO — AGENT RULES

## Rule 1: Phase Discipline
- Execute ONLY the requested phase
- Do NOT implement future phases
- Do NOT build features not specified in the current phase
- Do NOT prematurely create code for upcoming modules

## Rule 2: Architecture Integrity
- Frontend NEVER connects directly to MongoDB
- Flow: Frontend → API → Backend → Database
- ALL business logic resides in backend
- Payment verification happens on backend ONLY
- Never trust client-side payment success

## Rule 3: Security
- NEVER hard-code secrets in source code
- ALL secrets go in .env (not committed) and .env.example (committed with placeholder values)
- Use bcrypt for password hashing (NEVER store plaintext passwords)
- JWT tokens must have expiration
- Refresh token rotation where appropriate
- Rate limiting on authentication endpoints
- Secure error messages (no stack traces in production)
- Input validation on all endpoints
- No arbitrary executable code through remote configuration
- Payment webhook signature verification required

## Rule 4: Location Privacy
- NEVER permanently track mechanic/provider location
- Location sharing ONLY during active jobs
- Stop location sharing immediately after job completion/cancellation
- Minimize unnecessary location updates
- Protect location data from unauthorized access

## Rule 5: Code Quality
- TypeScript strict mode
- ESLint must pass
- All code must compile without errors
- Every major feature must have tests
- NEVER delete tests to make builds pass
- NEVER suppress errors to hide problems
- NEVER remove validation to make tests pass

## Rule 6: State Management
- Every UI feature must handle: Loading, Success, Error, Empty states where applicable
- Booking states must follow defined transitions (no arbitrary status changes from frontend)
- Emergency states must be properly managed
- Order states must follow defined workflow

## Rule 7: Existing Code
- ALWAYS inspect existing code before making changes
- Do NOT rewrite stable modules without clear reason
- Understand dependencies before modifying
- Identify all affected modules before changing shared code

## Rule 8: Documentation
- Update documentation after every phase
- Update PROJECT_STATE.md after every phase
- Document all API endpoints
- Document all database schemas
- Document all environment variables needed

## Rule 9: Testing & Build
- Run tests after every implementation
- Run TypeScript type checking
- Run ESLint
- Run build
- Fix ALL errors before claiming completion
- Do NOT claim success if tests/build are failing

## Rule 10: Git Discipline
- Commit after each phase with descriptive message
- Format: phase-XX: description
- Never commit .env files
- Never commit node_modules
- Always commit .env.example

## Rule 11: Dependencies
- Do NOT add unnecessary dependencies
- Do NOT create unnecessary microservices
- Do NOT introduce unnecessary enterprise complexity
- Choose well-maintained, widely-used packages

## Rule 12: Error Handling
- Central error handler in backend
- Proper HTTP status codes
- Consistent error response format
- Log errors appropriately
- Never expose internal details to clients in production

## Rule 13: Phase Completion Criteria
A phase is complete ONLY when ALL of these pass:
- [ ] Code implemented
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Tests pass
- [ ] Build succeeds
- [ ] Security checked
- [ ] Documentation updated
- [ ] PROJECT_STATE.md updated
- [ ] Git checkpoint created

## Rule 14: When Ambiguous
- Inspect existing documentation and code first
- Choose the safest architecture consistent with the specification
- Document all assumptions made
- Ask for clarification if critical decisions are needed

## Rule 15: Reporting
After every phase, report:
- What was completed
- Files created/changed
- Tests run and results
- Known issues
- Next recommended phase
