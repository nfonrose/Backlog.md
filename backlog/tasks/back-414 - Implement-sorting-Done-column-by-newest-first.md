---
id: BACK-414
title: Implement sorting "Done" column by newest first
status: Done
assignee:
  - '@gemini-cli'
created_date: '2026-04-23 08:53'
updated_date: '2026-04-23 09:30'
labels:
  - feature
  - ordering
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add an option to sort the Done column by recency (updatedDate descending) instead of ordinal. Refer to `docs/tech/review/task-ordering.md` for the analysis.
<!-- SECTION:DESCRIPTION:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 bunx tsc --noEmit passes when TypeScript touched
- [ ] #2 bun run check . passes when formatting/linting touched
- [ ] #3 bun test (or scoped test) passes
<!-- DOD:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Add sort_done_by_recency to configuration
- [ ] #2 Implement Recency First sorting in web UI (lanes.ts)
- [ ] #3 Add 'Sort Done By Recency' toggle to web Settings page
- [ ] #4 Add automated tests for recency sorting
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Configuration key: `sort_done_by_recency`. The centralized ordinal storage mentioned in the analysis will be handled in a separate task.
<!-- SECTION:NOTES:END -->
