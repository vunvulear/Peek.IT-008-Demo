# Feature Specification: Operational Incident Assistant MVP

**Feature Branch**: `001-operational-incident-assistant-mvp`  
**Created**: 2026-04-22  
**Status**: Draft  
**Input**: User description: "Create a lightweight Operational Incident Assistant for engineering teams to report, triage, assign, and track operational incidents."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Report a New Incident (Priority: P1)

As an on-call engineer, I discover a production issue and need to report it immediately so the team knows something is wrong and can begin response.

**Why this priority**: Without incident creation, the entire system has no purpose. This is the entry point for all workflows.

**Independent Test**: Can be fully tested by submitting the create-incident form and verifying the incident appears in the list with correct data.

**Acceptance Scenarios**:

1. **Given** the user is on the dashboard, **When** they click "New Incident" and fill in title, description, severity (P1–P4), and affected service, **Then** the incident is created with status "Open", a unique ID is assigned, and a creation timestamp is recorded.
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

1. **Given** multiple incidents exist, **When** the user opens the dashboard, **Then** all incidents are listed showing ID, title, severity, status, owner, and last updated time.
2. **Given** the dashboard is showing all incidents, **When** the user filters by status "Open", **Then** only open incidents are displayed.
3. **Given** the dashboard is showing all incidents, **When** the user filters by severity "P1", **Then** only P1 incidents are displayed.
4. **Given** the dashboard is showing results, **When** the user sorts by "Last Updated", **Then** incidents are ordered by most recently updated first.

---

### User Story 5 - Receive In-App Notifications (Priority: P3)

As an engineer, I want to be notified within the app when I am assigned to an incident or when an incident I own changes status, so I don't miss critical updates.

**Why this priority**: Notifications improve responsiveness but the core workflow functions without them. This is a quality-of-life enhancement.

**Independent Test**: Can be tested by assigning an incident to a user, then verifying a notification appears in that user's notification area.

**Acceptance Scenarios**:

1. **Given** an incident is assigned to me, **When** I open the app, **Then** I see a notification indicating the assignment with incident ID and severity.
2. **Given** I own an incident, **When** another user changes its status, **Then** I see a notification about the status change.
3. **Given** I have unread notifications, **When** I view them, **Then** they are marked as read.

---

### Edge Cases

- What happens when two users try to update the same incident simultaneously? → Last write wins; both timeline entries are preserved in order.
- What happens when a user tries to assign an incident to a person who doesn't exist in the system? → Validation error; assignment rejected.
- What happens when a user tries to transition directly from "Open" to "Closed"? → Allowed, but a timeline entry notes the skip with a warning.
- What happens if the database is unavailable when creating an incident? → User sees an error message; no partial data is saved.
- What happens with very long incident descriptions (>10,000 characters)? → Truncated at the limit with a validation message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create incidents with title (required), description, severity (P1–P4), and affected service.
- **FR-002**: System MUST assign a unique auto-incrementing ID to each incident upon creation.
- **FR-003**: System MUST support incident statuses: Open, Investigating, Resolved, Closed.
- **FR-004**: System MUST allow assigning and reassigning an owner to an incident.
- **FR-005**: System MUST record a timestamped, append-only timeline for every incident capturing all status changes, assignments, and user-posted notes.
- **FR-006**: System MUST provide a dashboard listing all incidents with columns: ID, title, severity, status, owner, last updated.
- **FR-007**: System MUST support filtering the dashboard by status and severity.
- **FR-008**: System MUST support sorting the dashboard by last updated time.
- **FR-009**: System MUST display in-app notifications for assignment and status change events.
- **FR-010**: System MUST validate all required fields on incident creation and reject incomplete submissions.
- **FR-011**: System MUST record the actor (username) and timestamp for every state change.

### Key Entities

- **Incident**: The core entity — represents a single operational event. Attributes: id, title, description, severity (P1–P4), status (Open/Investigating/Resolved/Closed), owner, affected service, created_at, updated_at.
- **Timeline Entry**: An immutable log entry attached to an incident. Attributes: id, incident_id, actor, action_type (status_change/assignment/note), content, created_at.
- **User**: A team member who can create, own, and update incidents. Attributes: id, username, display_name.
- **Notification**: An in-app alert for a specific user. Attributes: id, user_id, incident_id, message, read, created_at.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can report a new incident in under 30 seconds (form load → submission → confirmation).
- **SC-002**: An incident can be triaged and assigned within 2 clicks from the dashboard.
- **SC-003**: The dashboard loads and displays 100 incidents in under 200ms.
- **SC-004**: Every incident has a complete audit trail — no state change occurs without a timeline entry.
- **SC-005**: 90% of users can complete the full create → triage → resolve workflow on first attempt without guidance.

## Assumptions

- Users are members of the same engineering organization and have browser access.
- Authentication is simple (username-based for MVP; no SSO/OAuth in v1).
- The system will be used by teams of up to 50 people with up to 1,000 active incidents.
- Mobile-responsive design is not required for v1 (desktop browser is primary).
- No external integrations (Slack, PagerDuty, email) in v1.
- A single time zone is sufficient for MVP (timestamps in UTC).
