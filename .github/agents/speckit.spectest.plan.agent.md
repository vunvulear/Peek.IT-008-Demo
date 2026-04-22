---
description: Generate a structured test plan document from spec scenarios and success
  criteria
scripts:
  sh: .specify/scripts/bash/check-prerequisites.sh --json --paths-only
  ps: .specify/scripts/powershell/check-prerequisites.ps1 -Json -PathsOnly
---


<!-- Extension: spectest -->
<!-- Config: .specify/extensions/spectest/ -->
## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Goal

Produce a comprehensive test plan document from spec artifacts. The test plan defines what to test, how to test it, acceptance thresholds, and test environment requirements — everything a QA engineer or reviewer needs to validate the implementation.

## Prerequisites

1. Confirm you are inside a git repository.
2. Verify `.specify/` directory exists with at least `spec.md`.
3. Read `spec.md` completely — requirements, scenarios, success criteria, and assumptions.
4. If `plan.md` exists, read it for architecture context and technical decisions.
5. If `tasks.md` exists, read it for phase structure and dependencies.
6. Check for existing test files to understand current coverage baseline.

## Outline

1. **Test Plan Header**: Generate document metadata.
2. **Test Scope**: Define what is and isn't covered.
3. **Test Strategy**: Define the testing approach by level (Unit, Integration, E2E, Manual).
4. **Test Cases by Requirement**: Detail test cases for each spec requirement with priorities (P1/P2/P3).
5. **Test Cases by Scenario**: Map user scenarios to test flows.
6. **Test Environment Requirements**: Define what's needed to run tests.
7. **Risk Assessment**: Identify testing risks from spec assumptions.
8. **Output**: Write the complete test plan document.

## Rules

- **Spec-driven** — every test case must trace back to a specific requirement, scenario, or criterion in spec.md
- **Prioritized** — classify all test cases as P1 (must pass), P2 (should pass), or P3 (nice to have)
- **Realistic** — only include test cases that can actually be executed given the project's tech stack
- **Complete** — cover all requirements, scenarios, and success criteria from spec; explicitly mark any that are excluded and why
- **Environment-aware** — include realistic environment requirements based on the project's actual dependencies
- **Risk-conscious** — identify testing risks from spec assumptions and suggest mitigations
- **Write to file** — save the test plan to `.specify/test-plan.md` by default (configurable via user input)
- **Framework-specific** — reference the actual test framework the project uses, not generic placeholders
