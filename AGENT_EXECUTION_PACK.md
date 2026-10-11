# AUTO PRO — AGENT EXECUTION PACK

## Purpose
This file serves as the master reference for any AI coding agent working on Auto Pro.

## How to Use

### Before ANY code changes:
1. Read `MASTER_SPEC.md` — understand the full project specification
2. Read `AGENT_RULES.md` — understand all rules and constraints
3. Read `PROJECT_STATE.md` — understand current project status
4. Read relevant documentation in `docs/`

### Execution Protocol
1. **Read** specification and existing code
2. **Plan** implementation approach
3. **Implement** the requested phase only
4. **Test** — run all tests
5. **Debug** — fix any errors
6. **Security** — review for vulnerabilities
7. **Document** — update docs
8. **Commit** — git checkpoint
9. **Review** — verify everything passes
10. **Report** — what was completed, what remains

### Phase Completion Checklist
- [ ] Code implemented
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Tests pass
- [ ] Build succeeds
- [ ] Security checked
- [ ] Documentation updated
- [ ] PROJECT_STATE.md updated
- [ ] Git checkpoint created

### Critical Rules
- Execute ONLY the requested phase
- Do NOT implement future phases
- Do NOT rewrite stable code unnecessarily
- Do NOT expose secrets in code
- Do NOT connect frontend directly to database
- Do NOT trust client-side payment verification
- Do NOT track location permanently
- Do NOT delete tests
- Do NOT suppress errors

### Project Structure
```
AUTO-PRO/
├── AGENT_EXECUTION_PACK.md   # This file
├── MASTER_SPEC.md            # Full specification
├── AGENT_RULES.md            # Agent rules & constraints
├── PROJECT_STATE.md          # Current project state
├── docs/                     # Architecture & design docs
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   ├── DATABASE-DESIGN.md
│   └── API-PLAN.md
├── prompts/                  # Phase execution prompts
│   ├── PHASE-00.md through PHASE-20.md
├── backend/                  # Node.js + Express + TypeScript
├── customer-mobile/          # React Native + TypeScript
├── mechanic-mobile/          # React Native + TypeScript
├── admin/                    # React.js + TypeScript
└── web/                      # React.js + TypeScript
```

### Technology Stack
| Component | Technology |
|-----------|------------|
| Customer App | React Native + TypeScript |
| Mechanic App | React Native + TypeScript |
| Admin Dashboard | React.js + TypeScript |
| Public Website | React.js + TypeScript |
| Backend API | Node.js + Express + TypeScript |
| Database | MongoDB |
| Storage | Cloud Object Storage |
| Maps | Google Maps Platform |
| Payment | Razorpay |
| Notifications | Firebase Cloud Messaging |
| Auth | JWT + Refresh Token + OTP |

### Development Sequence
```
Phase 00: Discovery → Phase 01: Foundation → Phase 02: Backend → Phase 03: Database →
Phase 04: Auth → Phase 05: Profile → Phase 06: Booking → Phase 07: Mechanic →
Phase 08: Emergency → Phase 09: Maps → Phase 10: Tracking → Phase 11: Payment →
Phase 12: Invoice → Phase 13: Notifications → Phase 14: Admin → Phase 15: Flags →
Phase 16: CMS → Phase 17: Parts → Phase 18: Cars → Phase 19: Testing → Phase 20: Deploy
```

### Bug Fix Protocol
1. Reproduce → 2. Inspect logs → 3. Root cause → 4. Smallest fix → 5. Regression test → 6. Verify existing features → 7. Update state
