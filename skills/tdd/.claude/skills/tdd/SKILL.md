---
name: tdd
description: Use this skill to write code using Test-Driven Development (TDD) principles.
---

Always abide by the [restrictions](../../restrictions.md) and [testing best practices](../../test-practices.md) when using this skill.

# Instructions

1. Gather context: Ask the user for any missing information or clarification needed to write the tests and code. ASK to validate assumptions and understanding of the requirements.
2. Propose an API: Based on the requirements and best practices, propose an API design. This should include function signatures, expected inputs and outputs, and any relevant data structures. ASK for feedback and iterate on the API design until it is approved by the user.
3. Identify tests: Propose a set of meaningful tests to the user grouped by `describe` blocks and individually numbered. These tests should validate the functionality, error handling, edge cases, non-intuitive behaviors, and demonstrate the expected usage of the API. ASK for feedback and iterate on the tests until they are approved by the user.
4. Draft tests: Create a `NAME.test.ts` file alongside the implementation file and populate it with the `describe` and `it` blocks for the approved tests. The `it` blocks should contain GIVEN-WHEN-THEN comments outlining the test scenarios. ASK the user to review and iterate until the user approves.
5. Implementation: For each test...

- Write a failing test first (red phase).
- Implement the minimum code required to pass the test (green phase).
- Refactor the code while keeping the tests passing (refactor phase).
- Every time you complete tests for a `describe` block, ask the user to review before moving on to the next `describe` block.

6. Final review: Once all tests are passing, run the entire test suite to ensure there are no regressions.

