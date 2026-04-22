# Tasks: Operational Incident Assistant MVP

**Input**: Design documents from `specs/001-operational-incident-assistant-mvp/`
**Prerequisites**: plan.md, spec.md

## Format: `[ID] [P?] [Workstream] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Workstream]**: DM = Data Model, BE = Backend, FE = Frontend, VAL = Validation, OPS = Operational Readiness

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization — monorepo, tooling, configs
**Depends on**: Nothing

- [ ] T001 [DM] Initialize monorepo: `package.json` with Express, Drizzle, React, Vite, TailwindCSS, Vitest, Playwright dependencies → FR: NFR-002
- [ ] T002 [P] [DM] Create `tsconfig.json` with strict mode, path aliases for `src/backend` and `src/frontend` → FR: NFR-002
- [ ] T003 [P] [DM] Create `vite.config.ts` with React plugin and proxy `/api` to Express dev server → FR: NFR-002
- [ ] T004 [P] [DM] Create `vitest.config.ts` for unit + integration tests → FR: NFR-002
- [ ] T005 [P] [DM] Add `.gitignore` with `node_modules/`, `dist/`, `src/data/incidents.db` → FR: NFR-002

**Checkpoint**: Project scaffolding complete. `npm install` succeeds.

---

## Phase 2: Data Model

**Purpose**: Database schema, connection, seed data — blocks all backend work
**Depends on**: Phase 1

- [ ] T006 [DM] Create `src/backend/db/connection.ts` — SQLite connection via Drizzle → FR: NFR-003
- [ ] T007 [DM] Create `src/backend/db/schema.ts` — define `users`, `incidents`, `timeline_entries` tables per plan.md schema → FR: FR-002, FR-003, FR-005
- [ ] T008 [DM] Create `src/backend/db/migrate.ts` — DB init + seed 5 test users (alice, bob, carol, dave, eve) → FR: FR-010
- [ ] T009 [DM] Create `src/frontend/lib/types.ts` — shared TypeScript types: `Incident`, `TimelineEntry`, `User`, `Severity`, `Status` → FR: FR-001, FR-003

**Checkpoint**: `npm run db:seed` creates `incidents.db` with users table populated.

---

## Phase 3: Backend — Auth (US5: Log In with Username)

**Purpose**: Username-based login, session middleware — blocks all authenticated API work
**Depends on**: Phase 2

- [ ] T010 [BE] Create `src/backend/index.ts` — Express app entry point with JSON body parser, cookie session, CORS → FR: FR-010
- [ ] T011 [BE] Create `src/backend/routes/auth.ts` — `POST /api/auth/login` (lookup username, set session), `POST /api/auth/logout` (clear session) → FR: FR-010
- [ ] T012 [BE] Create `src/backend/middleware/auth.ts` — session auth middleware, reject unauthenticated requests with 401 → FR: FR-010
- [ ] T013 [VAL] Write `tests/integration/auth.api.test.ts` — test login success, login unknown user, logout, protected route without session → FR: FR-010

**Checkpoint**: Auth API works. Login with "alice" returns 200 + session. Unauthenticated requests return 401.

---

## Phase 4: Backend — Incident CRUD (US1: Report a New Incident)

**Purpose**: Create and read incidents via API
**Depends on**: Phase 3

- [ ] T014 [BE] Create `src/backend/services/incident.service.ts` — `createIncident(data, actorId)`: validate, insert incident, insert "created" timeline entry, implement `formatIncidentId(id)` helper that returns `INC-${String(id).padStart(3,'0')}`, return incident with formatted ID → FR: FR-001, FR-002, FR-005
- [ ] T015 [BE] Create `src/backend/routes/incidents.ts` — `POST /api/incidents` (create) and `GET /api/incidents/:id` (detail with timeline) → FR: FR-001, FR-011
- [ ] T016 [VAL] Add input validation to `POST /api/incidents`: title required + max 200, severity in P1–P4, affected_service required, description max 10,000 → FR: FR-009
- [ ] T017 [P] [BE] Write `tests/unit/incident.service.test.ts` — test create with valid data, create with missing title, create with invalid severity → FR: FR-001, FR-009
- [ ] T018 [BE] Write `tests/integration/incidents.api.test.ts` — test POST create, GET detail, validation errors → FR: FR-001, FR-002, FR-011

**Checkpoint**: Can create incidents via API, each gets INC-xxx ID, timeline entry auto-created.

---

## Phase 5: Backend — Incident Lifecycle (US2: Triage & Assign, US3: Status & Timeline)

**Purpose**: Update incident fields, manage timeline
**Depends on**: Phase 4

- [ ] T019 [BE] Add `PATCH /api/incidents/:id` to `src/backend/routes/incidents.ts` — update status, severity, owner; auto-create timeline entries for each change → FR: FR-003, FR-004, FR-005
- [ ] T020 [BE] Create `src/backend/services/timeline.service.ts` — `addNote(incidentId, actorId, content)`: insert manual note entry → FR: FR-005
- [ ] T021 [BE] Create `src/backend/routes/timeline.ts` — `POST /api/incidents/:id/timeline` (add note), `GET /api/incidents/:id/timeline` (list entries) → FR: FR-005, FR-011
- [ ] T022 [BE] Add `GET /api/users` to `src/backend/routes/auth.ts` — list all users for owner dropdown → FR: FR-004
- [ ] T023 [VAL] Add validation to PATCH: status must be valid enum, owner must exist in users table → FR: FR-009
- [ ] T024 [P] [BE] Write `tests/unit/timeline.service.test.ts` — test add note, auto-entries on status change → FR: FR-005
- [ ] T025 [BE] Write `tests/integration/timeline.api.test.ts` — test POST note, GET timeline, auto-entries on PATCH → FR: FR-005

**Checkpoint**: Full incident lifecycle works via API: create → assign → status change → add note. Every mutation creates a timeline entry.

---

## Phase 6: Backend — Dashboard API (US4: View Incident Dashboard)

**Purpose**: List, filter, sort, paginate incidents
**Depends on**: Phase 4

- [ ] T026 [BE] Add `GET /api/incidents` to `src/backend/routes/incidents.ts` — list with query params: `?status=`, `?severity=`, `?sort=`, `?limit=`, `?offset=` → FR: FR-006, FR-007, FR-008
- [ ] T027 [BE] Write `tests/integration/dashboard.api.test.ts` — test list all, filter by status, filter by severity, sort by updated_at, pagination → FR: FR-006, FR-007, FR-008, NFR-001

**Checkpoint**: Dashboard API returns filtered, sorted, paginated incident list under 200ms for 100 records.

---

## Phase 7: Frontend — Auth + Layout (US5: Log In)

**Purpose**: Login page, app shell, routing
**Depends on**: Phase 3 (auth API)

- [ ] T028 [FE] Create `src/frontend/main.tsx` and `src/frontend/App.tsx` — React entry point with React Router → FR: NFR-006
- [ ] T029 [FE] Create `src/frontend/lib/api.ts` — API client: `login()`, `logout()`, `getIncidents()`, `getIncident()`, `createIncident()`, `updateIncident()`, `addTimelineNote()`, `getUsers()` → FR: all
- [ ] T030 [FE] Create `src/frontend/pages/LoginPage.tsx` — username input, submit → call login API → redirect to dashboard → FR: FR-010
- [ ] T031 [FE] Create `src/frontend/components/Layout.tsx` — app shell: nav bar with app title, current user display, logout button → FR: FR-010
- [ ] T032 [FE] Add route protection — redirect to `/login` if no session → FR: FR-010

**Checkpoint**: User can log in with username, see app shell with their name, log out.

---

## Phase 8: Frontend — Dashboard (US4: View Incident Dashboard)

**Purpose**: Incident list with filters and sort
**Depends on**: Phase 7, Phase 6 (dashboard API)

- [ ] T033 [FE] Create `src/frontend/components/StatusBadge.tsx` — color-coded badges for severity (P1=red, P2=orange, P3=yellow, P4=blue) and status → FR: FR-006
- [ ] T034 [FE] Create `src/frontend/components/IncidentTable.tsx` — table with columns: ID, title, severity, status, owner, affected service, last updated. Row click → navigate to detail → FR: FR-006
- [ ] T035 [FE] Create `src/frontend/pages/DashboardPage.tsx` — compose IncidentTable + filter controls (status multi-select, severity multi-select) + sort toggle + "New Incident" button → FR: FR-006, FR-007, FR-008
- [ ] T036 [FE] Wire dashboard filters and sort to API query params → FR: FR-007, FR-008

**Checkpoint**: Dashboard shows incidents in a table. Filters and sort work. SC-002 achievable (triage within 2 clicks).

---

## Phase 9: Frontend — Create Incident + Detail View (US1, US2, US3)

**Purpose**: Incident creation form, detail page with timeline and update controls
**Depends on**: Phase 8, Phase 5 (lifecycle API)

- [ ] T037 [FE] Create `src/frontend/components/IncidentForm.tsx` — form with title, description, severity dropdown, affected service. Client-side validation matches FR-009 → FR: FR-001, FR-009
- [ ] T038 [FE] Create `src/frontend/components/IncidentTimeline.tsx` — chronological list of timeline entries showing actor, action type icon, content, timestamp → FR: FR-005, FR-011
- [ ] T039 [FE] Create `src/frontend/pages/IncidentDetailPage.tsx` — show all incident fields + IncidentTimeline + update controls (status dropdown, severity dropdown, owner dropdown, "Add Note" form) → FR: FR-003, FR-004, FR-005, FR-011
- [ ] T040 [FE] Wire "New Incident" button on dashboard → IncidentForm modal/page → POST API → refresh dashboard → FR: FR-001
- [ ] T041 [FE] Wire detail page update controls → PATCH API + POST timeline note → refresh timeline → FR: FR-003, FR-004, FR-005

**Checkpoint**: Full UI workflow: login → dashboard → create incident → view detail → triage/assign → update status → add note. SC-001 achievable (report in <30s).

---

## Phase 10: Validation & Polish

**Purpose**: Cross-cutting validation, error handling, UX polish
**Depends on**: Phase 9

- [ ] T042 [P] [VAL] Add global error boundary in React app — show user-friendly error page on unhandled exceptions → FR: FR-009
- [ ] T043 [P] [VAL] Add API error handling middleware in Express — catch unhandled errors, return structured JSON errors → FR: FR-009
- [ ] T044 [P] [FE] Add loading states to dashboard and detail page (skeleton/spinner) → FR: NFR-006
- [ ] T045 [P] [FE] Add empty states — "No incidents found" on dashboard, "No timeline entries" on detail → FR: FR-006

**Checkpoint**: App handles errors gracefully. No blank screens or unhandled crashes.

---

## Phase 11: Operational Readiness

**Purpose**: E2E tests, performance check, demo data
**Depends on**: Phase 10

- [ ] T046 [OPS] Write `tests/e2e/create-incident.spec.ts` — Playwright: login → create incident → verify on dashboard → FR: SC-001
- [ ] T047 [OPS] Write `tests/e2e/triage-assign.spec.ts` — Playwright: login → open incident → change severity → assign owner → verify timeline → FR: SC-002, SC-004
- [ ] T048 [OPS] Write `tests/e2e/dashboard-filters.spec.ts` — Playwright: login → create multiple incidents → filter by status → filter by severity → sort → FR: SC-003
- [ ] T049 [OPS] Create seed script `src/backend/db/demo-seed.ts` — populate 100 incidents with varied statuses/severities for demo and NFR-001 verification → FR: NFR-001, NFR-004
- [ ] T050 [OPS] Verify NFR-001: run dashboard API with 100 seeded incidents, assert response time ≤200ms → FR: NFR-001
- [ ] T051 [OPS] Add `npm run dev` script — start Express backend + Vite frontend dev server concurrently → FR: NFR-002
- [ ] T052 [OPS] Add `npm run build` script — build React frontend, configure Express to serve from `dist/` → FR: NFR-002

**Checkpoint**: All E2E tests pass. App is demo-ready with 100 seeded incidents. Single `npm start` launches the full app.

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1  (Setup)           → no deps
Phase 2  (Data Model)      → Phase 1
Phase 3  (Auth API)        → Phase 2
Phase 4  (Incident CRUD)   → Phase 3
Phase 5  (Lifecycle API)   → Phase 4
Phase 6  (Dashboard API)   → Phase 4  ← can run parallel with Phase 5
Phase 7  (FE Auth)         → Phase 3  ← can run parallel with Phase 4–6
Phase 8  (FE Dashboard)    → Phase 6 + Phase 7
Phase 9  (FE Detail)       → Phase 5 + Phase 8
Phase 10 (Polish)          → Phase 9
Phase 11 (Ops Readiness)   → Phase 10
```

### Parallel Opportunities

- **Phase 5 + Phase 6**: Lifecycle API and Dashboard API are independent (both depend on Phase 4)
- **Phase 7**: Frontend auth can start as soon as auth API (Phase 3) is done — doesn't need to wait for incident APIs
- **T002–T005**: All setup config files are independent
- **T017, T024**: Unit tests can be written in parallel with integration tests
- **T042–T045**: All polish tasks are independent

### Requirement Traceability

| Requirement | Tasks |
| --- | --- |
| FR-001 (Create incident) | T014, T015, T016, T017, T018, T037, T040 |
| FR-002 (Auto-increment ID) | T007, T014, T018 |
| FR-003 (Status workflow) | T007, T019, T023, T039, T041 |
| FR-004 (Assign owner) | T019, T022, T023, T039, T041 |
| FR-005 (Timeline) | T007, T014, T019, T020, T021, T024, T025, T038, T041 |
| FR-006 (Dashboard) | T026, T027, T033, T034, T035 |
| FR-007 (Filter) | T026, T027, T035, T036 |
| FR-008 (Sort) | T026, T027, T035, T036 |
| FR-009 (Validation) | T016, T023, T037, T042, T043 |
| FR-010 (Auth) | T008, T010, T011, T012, T013, T029, T030, T031, T032 |
| FR-011 (Detail view) | T015, T021, T038, T039 |
| NFR-001 (≤200ms) | T027, T049, T050 |
| NFR-002 (Single unit) | T001–T005, T051, T052 |
| SC-001 (Report <30s) | T046 |
| SC-002 (Triage 2 clicks) | T047 |
| SC-003 (Dashboard ≤200ms) | T049, T050 |
| SC-004 (Audit trail) | T047 |
| SC-005 (First-attempt success) | T046, T047, T048 (E2E tests serve as proxy) |

---

## Implementation Strategy

### Demo-First Path (fastest to demo)

1. Phase 1–4 → Can demo incident creation via API (Postman/curl)
2. Phase 7–8 → Can demo login + dashboard in browser
3. Phase 5 + 9 → Full workflow demo: create → triage → resolve
4. Phase 10–11 → Production-quality with E2E proof

### Total: 52 tasks across 11 phases

---

## Notes

- [P] tasks = different files, no dependencies between them
- Every incident mutation (create, update status, assign, note) creates a timeline entry — this is enforced at the service layer, not the route layer
- INC-xxx ID format is display-only; the DB uses integer autoincrement internally
- Auth is session-cookie based (no JWT) — simplest for MVP, works without frontend token management
- Commit after each completed phase checkpoint
