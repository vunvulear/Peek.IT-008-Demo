# Operational Incident Assistant Constitution

## Core Principles

### I. Simplicity First

Every feature MUST solve one clear problem. No feature creep — if it isn't needed for reporting, triaging, assigning, or tracking an incident, it doesn't belong in MVP. Prefer fewer features done well over many features done partially.

### II. Reliability Over Features

The incident tool itself MUST be highly available and fast. An incident management system that is down during an incident is worse than useless. Favor simple, proven technology choices that minimize failure modes.

### III. Test-First Development (NON-NEGOTIABLE)

All business logic MUST have tests written before implementation. Red-Green-Refactor cycle is strictly enforced. Every user story must have corresponding acceptance tests. No PR merges without passing tests.

### IV. Clear Data Model

Incidents are the core entity. Every incident MUST have: a unique identifier, title, severity, status, owner, timestamps, and a timeline of updates. The data model must be simple enough to reason about without documentation.

### V. Audit Trail

Every state change on an incident MUST be recorded with a timestamp and actor. Incident data is append-only for timeline entries — history is never deleted or silently modified.

### VI. Minimal Dependencies

Use the smallest number of external libraries and services needed. Every dependency is a liability during an incident. Prefer standard library solutions where quality is comparable.

## Technology Constraints

- Web-based application (browser-accessible, no desktop/mobile native clients in v1)
- Single deployable unit — no microservices for MVP
- Persistent storage required (relational database preferred for structured incident data)
- No external service integrations in v1 (Slack, PagerDuty, email — all deferred)

## Quality Gates

- All PRs require passing unit and integration tests
- No known critical or high-severity bugs at release
- Core workflows (create, triage, assign, resolve) must be manually verified before each release
- API responses under 200ms for dashboard and incident list operations

## Governance

This constitution supersedes all other development practices. Amendments require explicit documentation, team discussion, and an updated version number below.

**Version**: 1.0.0 | **Ratified**: 2026-04-22 | **Last Amended**: 2026-04-22
