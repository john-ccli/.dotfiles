# Unit Tests

## JavaScript

- Unit test files are located alongside the file they test and are named `NAME.test.ts`
  - Example: Unit tests for `eggs.ts` would be in `eggs.test.ts`; tests for `Ham.vue` would be in `Ham.test.ts`
- Only functions, classes, and components are unit tested; DO NOT test constants.
- Unit test files contain a top-level `describe` for each relevant export
  - `describe` statements for classes should contain nested `describe` statements for each public function.
  - `describe` statements contain `it` tests
    - Each `it` test should be phrased descriptively, as in "_it_ behaves this way under this circumstance"
- Tests must NEVER be dependent on other tests.
- DO NOT assume the code being tested is correct; ASK the human about questionable behavior or potential bugs
- NEVER change the code being tested; ALWAYS ASK the human to make the change.
- Balance thoroughness with maintenance; avoid having too many tests and consider combining test cases that are simple and related

## Presenter (TODO: Move to Presenter's Claude.md)

- Unit tests use vitest version 4. Review the vitest.config.ts to understand how they work.
  - When testing `main` or `common` code, review vitest.setup.node.ts
  - When testing `renderer` or `preload` code, review vitest.setup.web.ts
  - These setup files contain a `beforeEach` statement which resets all mocks between tests
