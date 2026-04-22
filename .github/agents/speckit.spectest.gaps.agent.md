---
description: Find spec requirements with no matching tests and suggest what to test
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

Scan the codebase for spec requirements that have no corresponding tests. For each gap, provide a specific suggestion for what to test, which test type to use, and where to add the test file. Designed for quick post-implementation audits and CI integration.

## Prerequisites

1. Confirm you are inside a git repository.
2. Verify `.specify/` directory exists with at least `spec.md`.
3. Read `spec.md` to extract all requirements, scenarios, and success criteria.
4. Locate existing test files in the project.
5. If `tasks.md` exists, read it to understand which phases are complete (only flag gaps for completed phases).

## Outline

1. **Extract Requirements**: Parse spec.md for all testable items.
2. **Scan Existing Tests**: Find all test files and extract their coverage targets.
3. **Identify Gaps**: Compare requirements against covered topics. Classify gap severity based on requirement importance.
4. **Generate Gap Report**: List every untested requirement with actionable suggestions.
5. **Prioritized Action List**: Rank gaps by severity and suggest implementation order.
6. **Quick Summary**: One-line pass/fail suitable for CI output.

## Rules

- **Read-only** — never create or modify test files, only identify gaps and suggest
- **Phase-aware** — only flag gaps for completed implementation phases; don't flag gaps for work not yet started
- **Severity-rated** — classify each gap as Critical (security, data integrity), Medium (user-facing), or Low (internal/cosmetic)
- **Actionable** — every gap must include a concrete suggestion: what to test, which framework, where to put the file
- **Honest** — if a requirement is ambiguous or hard to test, say so rather than suggesting a meaningless test
- **CI-friendly** — include a one-line summary suitable for CI pipeline output
- **No duplicates** — if a requirement is partially tested, report it as a partial gap with what's missing, not as a full gap
