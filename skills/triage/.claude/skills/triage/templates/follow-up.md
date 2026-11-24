# Follow-up templates

For new information from a source that was already triaged. See "Follow-up" in `../SKILL.md`.

## Comment: the ticket still describes the report

```markdown
More information from <source>:

- <What's new, redacted: the exact error text, steps, role, device or browser. Describe screenshots in words.>
- <What it changes, if anything: confirms the cause, narrows GIVEN, adds a way to trigger it.>
```

## Correction line: the report turned out to be a different issue

Replace the old ticket's `Reported in` line for this source with:

```markdown
- Found while triaging <source>. That report turned out to be a different bug: WT-XXXX.
```

Use "a different request" for Feedback tickets.

## Comment: the new investigation couldn't reproduce or was blocked

```markdown
More information from <source>: <what's new, redacted>.

This doesn't match the cause above. <What was tried, in one line.> Open question: <what's still needed to confirm, e.g. the browser console error after Save>.
```
