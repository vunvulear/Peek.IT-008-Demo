# Operational Incident Assistant MVP — Step-by-Step Script

A reproducible walkthrough of the full workflow used to spec, plan, build, verify, and evolve the Operational Incident Assistant MVP.

---

## Step 1 — Goal Set

**Prompt:**

> We want to create a lightweight Operational Incident Assistant for engineering teams.
>
> The goal is to help teams report, triage, assign, and track operational incidents in a simple and reliable way.
>
> Please do the following:
> 1. Translate this into a clear product goal.
> 2. Identify the primary users.
> 3. Define the core business problem this solution addresses.
> 4. List the top business outcomes we want to achieve.
> 5. Propose a concise MVP scope for the first version.
>
> Keep the output short, structured, and practical.

---

## Step 2 — Refine Requirements

**Prompt:**

> Not yet. Before proceeding to /speckit.plan, I want to refine the requirements.
>
> Please help me clarify the MVP specification first:
> 1. Confirm the primary users
> 2. Confirm the core business problem
> 3. Refine the MVP scope
> 4. Define the functional requirements
> 5. Define the non-functional requirements
> 6. Add clear acceptance criteria
>
> Keep the output concise and implementation-oriented.
> After that, we will proceed with /speckit.plan.

**Commit:** [165b5c4](https://github.com/vunvulear/Peek.IT-008-Demo/commit/165b5c4701474a88a3594aa68c4b951c7e42daea)

---

## Step 3 — Task Breakdown

**Prompt:**

> Yes, proceed with /speckit.tasks.
>
> Please generate an MVP task breakdown for the Operational Incident Assistant.
> Requirements:
> 1. Keep tasks small and executable
> 2. Group them by logical workstreams:
>    - frontend
>    - backend
>    - data model
>    - validation
>    - operational readiness
> 3. Make dependencies explicit
> 4. Ensure every task maps back to the MVP requirements
> 5. Keep the scope tight and demo-friendly

---

## Step 4 — DocGuard Review

**Prompt:**

> Before implementation, review the current specification, plan, and task breakdown using DocGuard.
>
> Please:
> 1. Identify ambiguities, inconsistencies, or weak task definitions
> 2. Highlight anything that is not traceable back to the MVP requirements
> 3. Suggest the smallest improvements needed before implementation
> 4. Keep the output short and actionable
>
> Do not expand the scope.

---

## Step 5 — Fleet Orchestrator

**Prompt:**

> Now review the current project state and recommend the next best execution step.
>
> Please:
> 1. Assess the current readiness across spec, plan, and tasks
> 2. Confirm whether we are ready to implement
> 3. Recommend the next phase in the workflow
> 4. Keep human review explicit before major changes

**Commit:** [3bb4be4](https://github.com/vunvulear/Peek.IT-008-Demo/commit/3bb4be4cd93f7a6a40e736ff8d5b595a13cc182e)

---

## Step 6 — Start the Build

**Prompt:**

> Now begin implementation of the Operational Incident Assistant MVP.
>
> Please implement the MVP in a practical order based on the approved tasks.
> Focus on:
> 1. Incident creation
> 2. Incident listing
> 3. Severity and status handling
> 4. Owner assignment
> 5. Incident details
> 6. Resolution notes
> 7. Required field validation
>
> Keep the implementation aligned with the specification and explain briefly what you are building at each step.

**Commit:** [8018be4](https://github.com/vunvulear/Peek.IT-008-Demo/commit/8018be431753565cf97665fcc6f7704e4e36b5dd)

---

## Step 7 — Verification

**Prompt:**

> Run an implementation verification against the current specification.
>
> Please:
> 1. Compare the implemented features with the MVP requirements
> 2. Identify any missing or partially implemented requirements
> 3. Highlight any mismatches between intent and implementation
> 4. Summarize what is complete and what still needs work
>
> Be strict and evidence-based.

**Result:**

| Category | Status |
|---|---|
| Tasks covered | 38/52 |
| Functional requirements | All 11 implemented |
| User story scenarios | All 5 pass |
| Edge cases | All 5 handled |

**Bugs found:**
- **B-1:** Severity change timeline entry uses wrong `action_type`
- **B-2:** `/api/users` endpoint is at `/api/users/users` (double nesting)
- **B-3:** Timestamps displayed in local time, not UTC per NFR-005

**Not started:** Tests (unit, integration, E2E), demo seed, performance verification, React error boundary, dev/build script verification.

**Commit:** [98a8462](https://github.com/vunvulear/Peek.IT-008-Demo/commit/98a846237dc31d11f9d4c308d3d472f61a68384f)

---

## Step 8 — Check for Incomplete Work

**Prompt:**

> Review the current task completion state.
>
> Please:
> 1. Identify tasks that appear complete
> 2. Flag tasks that are only partially complete
> 3. Identify any tasks marked done without enough implementation evidence
> 4. Keep the assessment strict and concise

**Commit:** [8e96d3c](https://github.com/vunvulear/Peek.IT-008-Demo/commit/8e96d3cf8f3f82f8e9773e18a0133f4627c259af)

---

## Step 9 — Spec Sync

**Prompt:**

> Compare the current specification and implementation for the Operational Incident Assistant.
>
> Please:
> 1. Detect drift between spec and implementation
> 2. Identify what is implemented but not specified
> 3. Identify what is specified but not yet implemented
> 4. Propose the minimum changes needed to restore alignment
>
> Keep the result short and review-friendly.

**Commit:** [74302bd](https://github.com/vunvulear/Peek.IT-008-Demo/commit/74302bd39a5a80a1fead804c2a82c5ff88d7bd23)

---

## Step 10 — Security Review

**Prompt:**

> Perform a lightweight security and reliability review of the current MVP.
>
> Please assess:
> 1. Input validation
> 2. Ownership and update risks
> 3. Error handling exposure
> 4. Logging gaps
> 5. Quick improvements appropriate for an MVP

**Commit:** [62ee91b](https://github.com/vunvulear/Peek.IT-008-Demo/commit/62ee91b355e74536b5835dc5190c43443971ac7a)

---

## Step 11 — New Feature (Change Request)

**Prompt:**

> We have a change request for the Operational Incident Assistant.
>
> New requirement:
> Critical incidents must be highlighted visually, appear first in the list, and require an owner before they can move to In Progress.
>
> Please:
> 1. Define the change clearly
> 2. Identify impacted requirements, design elements, and implementation areas
> 3. Propose the smallest safe update path
> 4. Keep the change easy to review before implementation

**Commit:** [8e22d92](https://github.com/vunvulear/Peek.IT-008-Demo/commit/8e22d92265d435d17827bb51729be7623ecbd55c)
