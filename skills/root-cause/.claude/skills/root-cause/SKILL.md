---
name: root-cause
description: Root-cause analysis for a confirmed WorshipTools bug - when it was introduced, why, and whether related or deeper problems exist. Use on its own with a Jira key or bug description, or from /reproduce after a bug is reproduced.
---

# Root cause

Answer three questions with evidence from git, GitHub and Jira: **when** was the bug introduced, **why**, and are there **related or deeper** problems?

Read-only. Never modify, check out or switch branches in the user's own checkout.

## Input

- **The bug:** a Jira key (read the ticket first) or a GIVEN/WHEN/THEN.
- **Faulty code:** file and lines, if already found. Otherwise find them and confirm the mechanism, not just the location.

Find the product repo (`github.com/worshiptools/<product>`) among this session's directories or from the environment; if you can't, ask. Use the checkout this session runs in if it was made for this bug. Otherwise read the default branch with `git -C <repo> show origin/<default>:<path>` (fetching first is fine).

If the repo has a `code-history` skill, follow it. It covers squashed history and legacy code.

## 1. When

1. `git blame -L <start>,<end>` or `git log -L <start>,<end>:<file>` on the default branch. If blame lands on a squash or import commit, follow the repo's notes on where earlier history lives, using `git log -S'<code>'` or `-G'<regex>'` there.
2. Record the commit's short SHA, date, PR (`(#123)` in the subject) and Jira key (`WT-1234`).
3. **Regression** (it worked before, in older or legacy code) or **long-standing** (it never did)? Check the older code to decide.

## 2. Why

1. Read the introducing diff, its PR (`gh pr view <n>`) and its ticket.
2. Explain in one or two sentences how the change caused the bug. Common causes: a migration gap, a component reused in a context it wasn't built for, a missed edge case (role, empty state, device size, data shape), a later change elsewhere, or a refactor regression.
3. Say whether tests cover the behavior, and why they missed it.

Stay blameless: cite commits, PRs and tickets, never people.

## 3. Related and deeper

- **Same pattern elsewhere:** search for the same mistake and list file:line for each real hit.
- **Same root cause in Jira:** open and recently closed tickets, e.g. an earlier fix this undoes.
- **Deeper issue:** a systemic gap such as a missing test type or lint rule. Only with evidence; label anything speculative.

## Output

**On its own:** summarize under **When**, **Why** and **Related**, with links. For an existing ticket, offer to post the findings as a comment and post nothing without approval.

**From /reproduce:** mark what belongs in the ticket (see the /jira bug template). Everything else stays in the evidence folder.

- the cause, in one or two sentences with a code reference
- `Suggested solution:` the fix for the root cause, plus a broader fix in one clause if it would prevent repeats
- `Introduced: <sha> (PR #<n>, WT-XXXX)`, `Regression of WT-XXXX`, or `Long-standing since <...>`, plus related tickets
- same pattern elsewhere, or a deeper issue, only if it changes the fix
