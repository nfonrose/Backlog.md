---
id: BACK-415
title: Implement centralized task ordinal storage
status: Done
assignee:
  - '@gemini-cli'
created_date: '2026-04-23 09:16'
updated_date: '2026-04-23 09:52'
labels:
  - feature
  - ordering
  - git-noise
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Move task ordinal values from individual .md files to a centralized 'backlog/task-ordinals.yml' file to reduce Git noise during reordering. Refer to Analyse II in docs/tech/review/task-ordering.md.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Add 'centralized_tasks_ordinals' to configuration (default: false)
- [x] #2 Implement 'backlog/task-ordinals.yml' reading and writing in FileSystem
- [x] #3 Maintain backward compatibility (fallback to .md frontmatter if ID not in YAML)
- [x] #4 Ensure YAML file is sorted by task ID for better Git merge experience
- [x] #5 Prevent writing 'ordinal' to .md files when centralized storage is enabled
- [x] #6 Add migration logic to extract existing ordinals into the central file
- [x] #7 Skip updated_date updates in .md files when only task position (ordinal) changes
- [x] #8 Avoid redundant file writes in FileSystem if Markdown content remains identical
- [x] #9 Verify that .md files remain untouched during reordering via automated tests
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented centralized storage for task ordinals in 'backlog/task-ordinals.yml'.
- Added 'centralized_tasks_ordinals' configuration option.
- Implemented automatic migration logic during initialization and config loading.
- Updated FileSystem to decouple ordinals from Markdown frontmatter when enabled.
- Optimized reordering logic to skip 'updated_date' updates and file writes when only the ordinal changes.
- Added a toggle in the web UI Settings page.
- Verified that .md files are not modified during reordering via 'src/test/centralized-ordinals.test.ts'.
<!-- SECTION:FINAL_SUMMARY:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 bunx tsc --noEmit passes when TypeScript touched
- [x] #2 bun run check . passes when formatting/linting touched
- [x] #3 bun test (or scoped test) passes
<!-- DOD:END -->
