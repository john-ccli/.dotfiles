# Bug template

Issue type: `Bug`. Modeled on WT-3731.

## Summary

- Describe the symptom in plain language from the user's point of view.
- No "Bug:" prefix.
- Example: `Crash on login`

## Links

- Link to the ticket that introduced the issue using `caused by`

## Description

```markdown
**GIVEN** <starting state: user role, data that must exist; name a test fixture if one was kept>
**WHEN** <action>
**AND** <further action, only if needed>

**THEN** <what actually happens>
**AND** <further action, only if needed>

**INSTEAD** <what should happen>
**AND** <further action, only if needed>

---

- Cause: <one or two sentences, citing code: `functionName` in `web/src/path/file.ts`>
- Suggested solution: <the fix that addresses the cause; a broader fix in one clause if one would prevent repeats>
- <Introduced: <sha> (PR #<n>, WT-XXXX) | Regression of WT-XXXX | Long-standing since <...>>. Related: <WT-XXXX>
- <Other context, only if it changes how someone verifies or fixes the bug>
- Reported in: <source link(s)>
```

Leave out of the ticket and keep in the run's evidence folder instead:

- lists of every failing variant: give one example, or a fixture that shows the bug
- the steps the investigation took, and cases that behaved correctly
- open questions that don't change the fix, such as where bad data came from or exact version history
- the reproduction role and commit, unless the bug depends on them

Notes:

- GIVEN/WHEN/THEN must be precise enough for someone else to reproduce the bug without reading the source conversation.
- Code paths are relative to the product repo root and hyperlinked to master branch in GitHub.
- Put no customer information anywhere, including in reproduction details.
