---
name: jira
description: Jira best practices for reading and writing tickets. Use when handling bugs and tasks.
---

# Jira

- Our Jira site is ccli.atlassian.net
- Our space is WorshipTools (WT); ignore issues outside it.
- Keep descriptions concise. Less is more. Long tickets are discouraged.
- Use the defaults below; templates provide additional guidance.
- When creating tickets, check for duplicates first.

## Type

- [Feedback](./templates/feedback.md) for feature suggestions
- [Bug](./templates/bug.md) for issues caused by defects
- [Task](./templates/task.md) for everything else

## Summary

- Keep titles short
- If applicable, prefix with the app module or screen, e.g., `Service Matrix: ...`

## Description

- Keep it concise and clear.
- Hyperlink to files, functions, commits, PRs, or other relevant resources.

## Metadata Defaults

Use these defaults unless the human tells you otherwise:

- `Parent` is defaulted based on app:
  - Planning: `WT-4`
  - Charts: `WT-3`
  - Presenter: `WT-1377`
  - Other: Ask human.
- `Assignee` is defaulted to the human unless specified otherwise.
- `Priority` leave as Jira default.
- `Sprint` is defaulted to the current sprint.

## Labels

When creating or updating issues, use the correct labels.

- Tag the impacted app
  - Planning: `planning`
  - Charts: `charts`
  - Presenter: `presenter`
  - Community: `community`
  - Strapi: `strapi`
  - API: `api`
  - Auth: `auth`
- If the issue is platform-specific, tag the platform:
  - Mobile: `mobile`
  - iOS: `ios`
  - Android: `android`
- If the issue is a bug and the root cause is known:
  - Regression: `regression`
  - User confusion: `ux`
  - Performance: `performance`
  - Security: `security`
  - Platform stability: `platform`
- If the issue is related to a particular component or entity, tag it accordingly:
  - Service Matrix: `matrix`
  - Services: `services`
  - Songs: `songs`
  - People: `people`
  - Messaging: `messaging`
  - Media: `media`
  - Service Types: `service-types`
  - Auth: `auth`
  - API: `api`

If unsure, ask the human which labels to use. NEVER add new labels without approval.

## Links

- Dependent issues should be linked to the issue they depend on using `depends on`
- Blocked by issues can be linked with `blocks`
- Other related issues can be linked with `relates to`
