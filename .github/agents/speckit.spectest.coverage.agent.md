---
description: Map spec requirements to test files and calculate requirement-level coverage
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

Analyze the relationship between spec requirements and existing test files. Unlike code coverage tools that measure line/branch coverage, this command measures **requirement coverage** — what percentage of spec requirements have at least one corresponding test.

## Prerequisites

1. Confirm you are inside a git repository.
2. Verify `.specify/` directory exists with at least `spec.md`.
3. Read `spec.md` to extract all requirements, scenarios, and success criteria.
4. Locate test files in the project by searching common test directories and patterns (`**/*.test.*`, `**/*.spec.*`, `**/test_*`, `tests/`, `__tests__/`).
5. If no test files are found, report 0% coverage and suggest running `/speckit.spectest.generate`.

## Outline

1. **Extract All Testable Requirements**: Build the complete requirement list from spec artifacts.
2. **Discover Test Files**: Find all test files in the project.
3. **Map Requirements to Tests**: For each requirement, determine if matching tests exist. Classify each mapping as Strong (explicit reference), Medium (keyword match), or Weak (file name match).
4. **Calculate Coverage Metrics**: Produce quantitative coverage scores.
5. **Generate Detailed Mapping**: Show each requirement and its test status.
6. **Coverage by Test Type**: Break down by unit, integration, and E2E.
7. **Output Report**: Deliver the complete coverage analysis.

## Rules

- **Read-only** — never modify any files, only analyze and report
- **Requirement-centric** — measure coverage by spec requirement, not by code line or branch
- **Confidence-rated** — classify each test mapping as Strong, Medium, or Weak with explanation
- **Threshold-aware** — compare against configured threshold and report pass/fail
- **Actionable** — for each uncovered requirement, suggest which test type and file would cover it
- **No false positives** — a test must demonstrably relate to a requirement to count as coverage; don't inflate scores with weak matches
- **Framework-agnostic** — work with any test framework by analyzing file contents and naming patterns
