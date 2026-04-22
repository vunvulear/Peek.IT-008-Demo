# Feature Specification: Operational Incident Assistant MVP

**Feature Branch**: `001-operational-incident-assistant-mvp`  
**Created**: 2026-04-22  
**Status**: Refined  
**Input**: User description: "Create a lightweight Operational Incident Assistant for engineering teams to report, triage, assign, and track operational incidents."

## Primary Users

| Role | Uses the tool to… |
|---|---|
| **On-call engineer** | Report incidents, post updates, change status |
| **Engineering lead / Incident commander** | Triage severity, assign owners, close incidents |
| **Engineering manager** | Monitor dashboard, review operational state |

No admin role in MVP. Users are pre-seeded via database script.

## Core Business Problem

When an incident occurs, teams lose time because there is no single place to report and track it, ownership is unclear, status is invisible (updates scatter across Slack/email), and there is no structured history for post-mortems. This tool provides one structured workflow: **Report → Triage → Investigate → Resolve → Close**.

## MVP Scope

### In scope (v1)

- Create incident (title, description, severity, affected service)
- Triage & assign (change severity, assign/reassign owner)
- Status workflow (Open → Investigating → Resolved → Closed; any-to-any allowed)
- Incident timeline (append-only log of all changes and notes)
- Incident detail view (all fields + full timeline)
- Dashboard (list view with filters and sort)
- Simple auth (username-based login, no passwords)

### Explicitly out of scope (v1)

- In-app notifications (deferred to v2)
- Slack/PagerDuty/email integrations
- Role-based access control (RBAC)
- Post-mortem / RCA workflows
- SLA tracking and metrics dashboards
- Mobile-responsive design
- User management UI (users seeded via DB/script)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Report a New Incident (Priority: P1)

As an on-call engineer, I discover a production issue and need to report it immediately so the team knows something is wrong and can begin response.

**Why this priority**: Without incident creation, the entire system has no purpose. This is the entry point for all workflows.

**Independent Test**: Can be fully tested by submitting the create-incident form and verifying the incident appears in the list with correct data.

**Acceptance Scenarios**:

1. **Given** the user is on the dashboard, **When** they click "New Incident" and fill in title, description, severity (P1–P4), and affected service, **Then** the incident is created with status "Open", a unique ID (INC-001) is assigned, and a creation timestamp is recorded.
2. **Given** the user submits the form with a missing title, **When** they click submit, **Then** a validation error is shown and the incident is not created.
3. **Given** the user creates an incident, **When** they return to the dashboard, **Then** the new incident appears at the top of the list.

---

### User Story 2 - Triage and Assign an Incident (Priority: P1)

As an engineering lead, I see a newly reported incident and need to review its severity, adjust it if needed, and assign an owner so someone is accountable for resolution.

**Why this priority**: Triage and assignment are critical — an unowned incident is an ignored incident. This directly reduces MTTA.

**Independent Test**: Can be tested by opening an existing incident, changing severity, assigning an owner, and verifying the changes persist.

**Acceptance Scenarios**:

1. **Given** an incident with status "Open", **When** the lead changes severity from P3 to P1 and assigns an owner, **Then** the incident record is updated and a timeline entry is added noting both changes with timestamp and actor.
2. **Given** an incident is assigned to an owner, **When** anyone views the incident, **Then** the owner name and assignment time are visible.
3. **Given** an incident already has an owner, **When** the lead reassigns it to a different person, **Then** the new owner is recorded and a timeline entry captures the reassignment.

---

### User Story 3 - Update Incident Status and Add Timeline Entries (Priority: P1)

As the assigned responder, I am investigating an incident and need to post updates and change the status so the team can follow progress without asking me directly.

**Why this priority**: Status tracking and the timeline are the core value loop — without them, the tool is just a static list.

**Independent Test**: Can be tested by opening an assigned incident, posting an update, changing status to "Investigating", and verifying both appear in the timeline.

**Acceptance Scenarios**:

1. **Given** an incident with status "Open", **When** the responder changes status to "Investigating" and adds a note "Checking database logs", **Then** the status is updated and a timeline entry records both the status change and the note with timestamp and actor.
2. **Given** an incident with status "Investigating", **When** the responder changes status to "Resolved" and adds a resolution note, **Then** the status is updated and the resolution time is recorded.
3. **Given** an incident with status "Resolved", **When** the lead changes status to "Closed", **Then** the incident is marked closed and a timeline entry records the closure.

---

### User Story 4 - View Incident Dashboard (Priority: P2)

As an engineering manager, I need to see all incidents in one place, filtered by status and severity, so I can understand the current operational state at a glance.

**Why this priority**: The dashboard is essential for visibility but depends on incidents existing first. It aggregates the value created by stories 1–3.

**Independent Test**: Can be tested by creating several incidents with different statuses and severities, then verifying filters return correct subsets.

**Acceptance Scenarios**:

1. **Given** multiple incidents exist, **When** the user opens the dashboard, **Then** all incidents are listed showing ID, title, severity, status, owner, affected service, and last updated time.
2. **Given** the dashboard is showing all incidents, **When** the user filters by status "Open", **Then** only open incidents are displayed.
3. **Given** the dashboard is showing all incidents, **When** the user filters by severity "P1", **Then** only P1 incidents are displayed.
4. **Given** the dashboard is showing results, **When** the user sorts by "Last Updated", **Then** incidents are ordered by most recently updated first.

---

### User Story 5 - Log In with Username (Priority: P1)

As a team member, I need to identify myself so the system can record who reported, triaged, or updated each incident.

**Why this priority**: Auth is required for audit trail (every action needs an actor). Without it, timeline entries have no attribution.

**Independent Test**: Can be tested by entering a valid username and verifying the user lands on the dashboard with their name displayed.

**Acceptance Scenarios**:

1. **Given** the user is on the login page, **When** they enter a valid username, **Then** they are authenticated and redirected to the dashboard.
2. **Given** the user enters a username that does not exist, **When** they submit, **Then** an error message is shown.
3. **Given** the user is authenticated, **When** they click logout, **Then** they are returned to the login page.

---

### Edge Cases

- What happens when two users try to update the same incident simultaneously? → Last write wins; both timeline entries are preserved in order.
- What happens when a user tries to assign an incident to a person who doesn't exist in the system? → Validation error; assignment rejected.
- What happens when a user tries to transition directly from "Open" to "Closed"? → Allowed; timeline entry records the direct transition.
- What happens if the database is unavailable when creating an incident? → User sees an error message; no partial data is saved.
- What happens with very long incident descriptions (>10,000 characters)? → Rejected at the limit with a validation message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow creating incidents with: title (required, max 200 chars), description (optional, max 10,000 chars), severity (P1–P4, required), affected service (required, free text).
- **FR-002**: System MUST assign a unique auto-incrementing ID (INC-001, INC-002…) to each incident upon creation.
- **FR-003**: System MUST enforce status values: Open, Investigating, Resolved, Closed. Any-to-any transitions are allowed EXCEPT: P1 incidents MUST have an assigned owner before transitioning to Investigating. Each transition is logged.
- **FR-004**: System MUST allow assigning and reassigning a single owner (existing user) to an incident.
- **FR-005**: System MUST maintain an append-only timeline per incident, recording every status change, assignment, and user note with actor + UTC timestamp.
- **FR-006**: System MUST provide a dashboard listing incidents with columns: ID, title, severity, status, owner, affected service, last updated.
- **FR-007**: Dashboard MUST support filtering by status (multi-select) and severity (multi-select).
- **FR-008**: Dashboard MUST sort P1 incidents above all other severities within the current sort order (default: last updated, newest first).
- **FR-012**: Dashboard and detail view MUST visually distinguish P1 incidents with prominent styling (color highlight, badge).
- **FR-009**: System MUST validate all required fields and return clear error messages on invalid input.
- **FR-010**: System MUST support simple username-based authentication (login with username, no password for MVP).
- **FR-011**: System MUST provide an incident detail view showing all fields and the full timeline.

### Non-Functional Requirements

- **NFR-001**: Dashboard MUST load ≤100 incidents in under 200ms (server response time).
- **NFR-002**: System MUST be a single deployable unit (monolith, no microservices).
- **NFR-003**: System MUST use a relational database for persistent storage.
- **NFR-004**: System MUST support up to 50 concurrent users and 1,000 active incidents.
- **NFR-005**: All timestamps MUST be stored and displayed in UTC.
- **NFR-006**: System MUST be accessible via modern desktop browsers (Chrome, Firefox, Edge).
- **NFR-007**: System MUST handle concurrent updates gracefully (last-write-wins; no data loss on timeline).

### Key Entities

- **Incident**: Core entity. Attributes: id, title, description, severity (P1–P4), status (Open/Investigating/Resolved/Closed), owner, affected_service, created_by, created_at, updated_at.
- **Timeline Entry**: Immutable log entry. Attributes: id, incident_id, actor, action_type (created/status_change/severity_change/assignment/note), content, created_at.
- **User**: Team member. Attributes: id, username, display_name.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can report a new incident in under 30 seconds (form load → submission → confirmation).
- **SC-002**: An incident can be triaged and assigned within 2 clicks from the dashboard.
- **SC-003**: The dashboard loads and displays 100 incidents in under 200ms.
- **SC-004**: Every incident has a complete audit trail — no state change occurs without a timeline entry.
- **SC-005**: 90% of users can complete the full create → triage → resolve workflow on first attempt without guidance.

## Assumptions

- Users are members of the same engineering organization and have browser access.
- Authentication is username-only for MVP (no passwords, no SSO/OAuth).
- The system will be used by teams of up to 50 people with up to 1,000 active incidents.
- Mobile-responsive design is not required for v1 (desktop browser is primary).
- No external integrations (Slack, PagerDuty, email) in v1.
- All timestamps in UTC.
- Users are pre-seeded; no self-registration or user management UI.
