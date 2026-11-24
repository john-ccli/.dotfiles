---
name: reproduce
description: Reproduce one reported WorshipTools bug in a running app (or, without app tooling, in code), then run /root-cause if it reproduces. Use with a redacted GIVEN/WHEN/THEN, usually from /triage, in a session started in an isolated checkout of the product repo.
---

# Reproduce

## Input

- the bug as a redacted GIVEN/WHEN/THEN, with no customer information
- the product, the role to test as (default Admin) and a short slug

## Setup

Find the product repo (`github.com/worshiptools/<product>`) among this session's directories or from the environment; if you can't, ask. Never run the app in the user's main checkout; use an isolated checkout made with the repo's documented worktree tooling.

Follow the repo's `reproduce-env` skill if it has one, otherwise its AGENTS.md or CLAUDE.md, for starting the app, signing in and which browser tool to use. If either fails, show the error and stop: most failures need a human.

**No app tooling** (no instructions, or the app can't run here, e.g. a native or mobile build): trace the GIVEN/WHEN/THEN through the code instead and report `unverified`.

## Sign in

- Test users come from the user's instructions. Never write their passwords into a file, Jira or chat.
- Typing test credentials needs the user's OK for that sign-in host, in their own words. A brief quoting them counts; otherwise ask.
- Work in the test account the user's instructions name. Prefix any data you create with the Jira key, or `TRIAGE`, and delete it afterwards if easy.

## Reproduce

1. Turn GIVEN/WHEN into concrete steps and follow them. For mobile issues, use a phone-sized viewport.
2. Save evidence in `~/.local/state/triage/runs/<YYYY-MM-DD>/<slug>/`: a screenshot of the broken state, plus measured facts (computed styles, sizes, console errors).
3. Decide:
   - **reproduced:** the app does what THEN describes
   - **couldn't reproduce:** it behaves correctly
   - **blocked:** the steps can't be set up (missing data, device, print output); say what's missing
   - **unverified:** the app couldn't run, but the code shows the bug

Never put screenshots in Jira without approval.

If reproduced or unverified, run /root-cause in this checkout.

## Report

Nothing customer-identifying:

```markdown
**Result:** reproduced | couldn't reproduce | blocked | unverified
**Commit:** <short sha>
**Role:** <role>
**Evidence:** <folder>

GIVEN/WHEN/THEN as actually reproduced, corrected if the brief was wrong.

/root-cause bullets for the ticket, plus `Suggested solution:` (reproduced or unverified).
Steps tried and results (couldn't reproduce), or what's missing (blocked).
```

Stop any servers you started. Leave the checkout for whoever created it; if that was the user, offer to remove it.
