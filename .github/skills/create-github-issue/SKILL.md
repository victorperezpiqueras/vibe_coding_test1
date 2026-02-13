---
name: create-github-issue
description: >
  Enforces the use of the repository's official Markdown issue template
  when creating or updating GitHub issues.
  Trigger: When creating or updating GitHub issues.
license: Apache-2.0
metadata:
  version: "1.1.0"
  auto_invoke:
    - "Creating a GitHub issue"
    - "Updating issue description"
    - "Submitting a feature request"
---

## Purpose

This skill ensures that all issues strictly follow the repository’s official
Markdown template located at:

.github/ISSUE_TEMPLATE/feature_request.md

The skill does NOT redefine the issue structure.  
It enforces correct usage of the existing template.

---

## Required Behavior

When creating or updating an issue, the agent MUST:

1. Load and follow the structure defined in:
   `.github/ISSUE_TEMPLATE/feature_request.md`

2. Preserve all template sections exactly as defined.

3. Ensure all required sections are completed.

4. Maintain checklist formatting for acceptance criteria.

5. Keep section headers unchanged.

6. Ensure labels defined in the template frontmatter are respected.

---

## Validation Rules

Before creating or updating an issue, verify:

- No required section is empty.
- Acceptance Criteria contain actionable checklist items.
- Priority is explicitly specified.
- The title follows the template prefix (e.g., "[Feature]: ").

If required information is missing, request clarification instead of generating a partial issue.

---

## Label Handling

Labels must match those defined in the template frontmatter:

Example:
labels: type:feature

The agent must NOT invent new labels unless explicitly instructed.

---

## Formatting Rules

- Use Markdown.
- Preserve template frontmatter.
- Do not alter section names.
- Do not remove required sections.
- Do not introduce new structural sections.

---

## Non-Compliance Handling

If the user provides issue content that does not follow the template:

- Reformat it to match the official template.
- Do not discard user-provided information.
- Ask for missing required information if necessary.

---

## Example Reference

The agent must generate issues consistent with:

.github/ISSUE_TEMPLATE/feature_request.md

This file is the single source of truth for issue structure.
