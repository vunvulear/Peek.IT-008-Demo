# Implementation Plan: Operational Incident Assistant MVP

**Branch**: `001-operational-incident-assistant-mvp` | **Date**: 2026-04-22 | **Spec**: `specs/001-operational-incident-assistant-mvp/spec.md`

## Summary

Build a lightweight web application for engineering teams to report, triage, assign, and track operational incidents. The MVP delivers: incident CRUD with status workflow, append-only timeline, filterable dashboard, and username-based auth. Single deployable monolith with a relational database backend and a modern React frontend.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend + backend)  
**Backend**: Node.js 20+ with Express.js  
**Frontend**: React 18 with Vite, TailwindCSS, shadcn/ui  
**Storage**: SQLite (file-based; zero-config, sufficient for ≤50 users / 1K incidents)  
**ORM**: Drizzle ORM (lightweight, type-safe, SQLite-native)  
**Testing**: Vitest (unit + integration), Playwright (E2E)  
**Target Platform**: Desktop browsers (Chrome, Firefox, Edge)  
**Project Type**: Full-stack web application (monorepo)  
**Performance Goals**: Dashboard API ≤200ms for 100 incidents  
**Constraints**: Single deployable unit, no external service dependencies  
**Scale/Scope**: ≤50 concurrent users, ≤1,000 active incidents

### Technology Decisions

| Decision | Rationale |
| --- | --- |
| **SQLite over PostgreSQL** | Zero-config, single-file DB, sufficient for MVP scale. Migration to PostgreSQL is straightforward via Drizzle if needed later. |
| **Express over Fastify/Hono** | Most widely known Node.js framework; simplest onboarding. |
| **Drizzle ORM** | Lightweight, type-safe, first-class SQLite support, no heavy migration tooling. |
| **React + Vite** | Fast dev experience, widely adopted, large component ecosystem. |
| **shadcn/ui + TailwindCSS** | Pre-built accessible components, minimal CSS overhead, consistent design. |
| **Monorepo (single package.json)** | Simplest setup for MVP; no workspace tooling overhead. |

## Constitution Check

| Principle | Status | Notes |
| --- | --- | --- |
| I. Simplicity First | ✅ Pass | MVP scope is minimal; out-of-scope items are explicitly listed |
| II. Reliability Over Features | ✅ Pass | SQLite = zero external dependencies; Express is battle-tested |
| III. Test-First Development | ✅ Pass | Vitest for unit/integration, Playwright for E2E; tests before implementation |
| IV. Clear Data Model | ✅ Pass | 3 entities (Incident, TimelineEntry, User); no complex relationships |
| V. Audit Trail | ✅ Pass | Timeline is append-only; every mutation creates a TimelineEntry |
| VI. Minimal Dependencies | ✅ Pass | Core stack: Express, Drizzle, React, Tailwind — no extras |

## Project Structure

### Documentation (this feature)

```text
specs/001-operational-incident-assistant-mvp/
├── spec.md
├── plan.md              # This file
└── tasks.md             # Created by /speckit.tasks
```

### Source Code (repository root)

```text
src/
├── backend/
│   ├── index.ts                 # Express app entry point
│   ├── db/
│   │   ├── schema.ts            # Drizzle schema (Incident, TimelineEntry, User)
│   │   ├── migrate.ts           # DB initialization + seed data
│   │   └── connection.ts        # SQLite connection
│   ├── routes/
│   │   ├── auth.ts              # POST /api/auth/login, POST /api/auth/logout
│   │   ├── incidents.ts         # CRUD: GET/POST /api/incidents, GET/PATCH /api/incidents/:id
│   │   └── timeline.ts          # POST /api/incidents/:id/timeline, GET /api/incidents/:id/timeline
│   ├── middleware/
│   │   └── auth.ts              # Session-based auth middleware
│   └── services/
│       ├── incident.service.ts  # Business logic for incidents
│       └── timeline.service.ts  # Business logic for timeline entries
├── frontend/
│   ├── index.html
│   ├── main.tsx                 # React entry point
│   ├── App.tsx                  # Router setup
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── IncidentForm.tsx     # Create/edit incident form
│   │   ├── IncidentTable.tsx    # Dashboard table with filters
│   │   ├── IncidentTimeline.tsx # Timeline display
│   │   ├── StatusBadge.tsx      # Severity/status badges
│   │   └── Layout.tsx           # App shell with nav
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── IncidentDetailPage.tsx
│   └── lib/
│       ├── api.ts               # API client functions
│       └── types.ts             # Shared TypeScript types
├── data/
│   └── incidents.db             # SQLite database file (gitignored)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts

tests/
├── unit/
│   ├── incident.service.test.ts
│   └── timeline.service.test.ts
├── integration/
│   ├── incidents.api.test.ts
│   ├── timeline.api.test.ts
│   └── auth.api.test.ts
└── e2e/
    ├── create-incident.spec.ts
    ├── triage-assign.spec.ts
    └── dashboard-filters.spec.ts
```

**Structure Decision**: Single monorepo with `src/backend` and `src/frontend` directories. Express serves the API and the built React frontend from a single process. This satisfies NFR-002 (single deployable unit).

## API Design

### Endpoints

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Login with username | No |
| POST | `/api/auth/logout` | End session | Yes |
| GET | `/api/incidents` | List incidents (supports `?status=`, `?severity=`, `?sort=`) | Yes |
| POST | `/api/incidents` | Create new incident | Yes |
| GET | `/api/incidents/:id` | Get incident detail | Yes |
| PATCH | `/api/incidents/:id` | Update incident (status, severity, owner) | Yes |
| GET | `/api/incidents/:id/timeline` | Get timeline entries | Yes |
| POST | `/api/incidents/:id/timeline` | Add timeline note | Yes |
| GET | `/api/users` | List all users (for owner dropdown) | Yes |

### Data Flow for Key Operations

**Create Incident**: POST `/api/incidents` → validate fields → insert Incident row → insert TimelineEntry (type: "created") → return incident with ID.

**Update Status**: PATCH `/api/incidents/:id` with `{status}` → update Incident.status + updated_at → insert TimelineEntry (type: "status_change", content: "Open → Investigating") → return updated incident.

**Assign Owner**: PATCH `/api/incidents/:id` with `{owner}` → validate user exists → update Incident.owner + updated_at → insert TimelineEntry (type: "assignment") → return updated incident.

## Database Schema (Drizzle)

```sql
Table: users
  id          INTEGER PRIMARY KEY AUTOINCREMENT
  username    TEXT UNIQUE NOT NULL
  display_name TEXT NOT NULL

Table: incidents
  id             INTEGER PRIMARY KEY AUTOINCREMENT
  title          TEXT NOT NULL (max 200)
  description    TEXT (max 10000)
  severity       TEXT NOT NULL CHECK(severity IN ('P1','P2','P3','P4'))
  status         TEXT NOT NULL DEFAULT 'Open' CHECK(status IN ('Open','Investigating','Resolved','Closed'))
  owner_id       INTEGER REFERENCES users(id)
  affected_service TEXT NOT NULL
  created_by     INTEGER NOT NULL REFERENCES users(id)
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))

Table: timeline_entries
  id           INTEGER PRIMARY KEY AUTOINCREMENT
  incident_id  INTEGER NOT NULL REFERENCES incidents(id)
  actor_id     INTEGER NOT NULL REFERENCES users(id)
  action_type  TEXT NOT NULL CHECK(action_type IN ('created','status_change','assignment','note'))
  content      TEXT NOT NULL
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
```

## Implementation Phases

### Phase 1 — Backend Foundation (FR-010, FR-001, FR-002, FR-009)

Set up the project, database schema, auth, and incident creation API.

- Initialize monorepo (package.json, tsconfig, vite config, vitest config)
- Define Drizzle schema for users, incidents, timeline_entries
- Implement DB connection + migration/seed script (pre-seed 3–5 test users)
- Implement auth routes (login/logout with session cookie)
- Implement auth middleware
- Implement POST `/api/incidents` with validation
- Implement GET `/api/incidents/:id`
- Write unit tests for incident service
- Write integration tests for auth + incident creation APIs

### Phase 2 — Incident Lifecycle (FR-003, FR-004, FR-005, FR-011)

Status transitions, owner assignment, and timeline.

- Implement PATCH `/api/incidents/:id` (status + severity + owner updates)
- Implement timeline auto-creation on every incident mutation
- Implement POST `/api/incidents/:id/timeline` (manual notes)
- Implement GET `/api/incidents/:id/timeline`
- Implement GET `/api/users` (for owner dropdown)
- Write unit tests for timeline service
- Write integration tests for update + timeline APIs

### Phase 3 — Dashboard API (FR-006, FR-007, FR-008)

List, filter, and sort incidents.

- Implement GET `/api/incidents` with query params (status, severity, sort)
- Add pagination support (limit/offset, default 50)
- Write integration tests for filtering and sorting

### Phase 4 — Frontend: Auth + Dashboard (FR-010, FR-006, FR-007, FR-008)

Build the UI shell, login, and dashboard.

- Set up React app with Vite, TailwindCSS, shadcn/ui
- Build LoginPage (username input → POST /api/auth/login → redirect)
- Build Layout (app shell with nav bar showing current user + logout)
- Build DashboardPage with IncidentTable component
- Implement filters (status multi-select, severity multi-select)
- Implement sort by last updated
- Wire API calls via lib/api.ts

### Phase 5 — Frontend: Incident Detail + Create (FR-001, FR-003, FR-004, FR-005, FR-011)

Incident creation form and detail view with timeline.

- Build IncidentForm component (create new incident)
- Build IncidentDetailPage (all fields + timeline + update controls)
- Build IncidentTimeline component (chronological log)
- Build StatusBadge component (color-coded severity/status)
- Implement status change, severity change, and owner assignment from detail view
- Implement "Add Note" form on detail view

### Phase 6 — E2E Tests + Polish

End-to-end validation and final quality pass.

- Write Playwright E2E tests for: create incident, triage + assign, dashboard filters
- Verify SC-001 through SC-005 measurable outcomes
- Fix any UI/UX issues found during E2E testing
- Verify NFR-001 (dashboard ≤200ms) with 100 seeded incidents

## Complexity Tracking

No constitution violations. No complexity justifications needed.
