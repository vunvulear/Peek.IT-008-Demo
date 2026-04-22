---
description: Generate test scaffolds from spec acceptance criteria and user scenarios
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

Read spec artifacts (spec.md, plan.md, tasks.md) and generate ready-to-fill test scaffolds that cover every acceptance criterion, user scenario, and success criterion. Tests are organized by requirement and include descriptive names, setup hints, and assertion placeholders.

## Prerequisites

1. Confirm you are inside a git repository.
2. Verify `.specify/` directory exists with at least `spec.md`. If missing, stop with error: "Cannot generate tests without spec.md — run `/speckit.specify` first."
3. Read `spec.md` completely to extract acceptance criteria, user scenarios, requirements, and success criteria.
4. If `plan.md` exists, read it to understand architecture, file structure, and technical decisions.
5. If `tasks.md` exists, read it to understand implementation phases and completed work.
6. Detect the project's language and test framework by examining `package.json`, `pyproject.toml`, `go.mod`, `pom.xml`, `Cargo.toml`, or existing test files.

## Outline

1. **Extract Testable Requirements**: Parse spec artifacts to build a complete list of things to test.

   - From `spec.md` → `## Requirements`: Each requirement becomes a test suite
   - From `spec.md` → `## User Scenarios & Testing`: Each scenario becomes a describe/context block
   - From `spec.md` → `## Success Criteria`: Each criterion becomes one or more test cases
   - From `plan.md` → Technical decisions: Each decision becomes a verification test
   - Assign each testable item a stable ID (TEST-001, TEST-002, etc.)

2. **Detect Test Environment**: Identify the project's testing setup.

   - Detect language: TypeScript, JavaScript, Python, Go, Java, Rust, etc.
   - Detect framework: Jest, Vitest, Mocha, pytest, unittest, go test, JUnit, etc.
   - Detect existing test directory structure and naming conventions
   - If no test setup exists, recommend one based on the project's language

3. **Generate Test File Structure**: Create test files organized by requirement.

4. **Generate Test Scaffolds**: For each requirement, produce a test file with descriptive names, TODO placeholders, and traceability headers linking back to the spec.

5. **Output Summary**: Report what was generated.

## Rules

- **Scaffold, don't implement** — generate test structure with descriptive names and TODO placeholders, never write actual assertion logic that could be wrong
- **Spec-traceable** — every test must reference its source requirement, scenario, or criterion from spec.md
- **Framework-native** — use the project's detected test framework conventions, not a generic format
- **Organize by requirement** — group tests by the spec requirement they verify, not by implementation file
- **Include all three levels** — generate unit, integration, and E2E scaffolds where the spec provides enough context
- **Follow existing conventions** — match the project's existing test directory structure, naming patterns, and style
- **Never overwrite** — if a test file already exists, report it and skip rather than overwriting existing tests
- **Arrange-Act-Assert** — every test case uses the AAA pattern with comment hints
