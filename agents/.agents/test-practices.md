# Unit Tests

- Run unit tests with `npm run test:ai` or `npm run test:ai -- path/to/file.test.ts`
- Unit test files are located alongside the file they test and are named `NAME.test.ts`
  - Example: Unit tests for `eggs.ts` would be in `eggs.test.ts`; tests for `Ham.vue` would be in `Ham.test.ts`
- Unit tests use vitest version 4. Review the [config](../vitest.config.ts) to understand how they work.
  - When testing `main` or `common` code, review [vitest.setup.node.ts](../vitest.setup.node.ts)
  - When testing `renderer` or `preload` code, review [vitest.setup.web.ts](../vitest.setup.web.ts)
  - These setup files contain a `beforeEach` statement which resets all mocks between tests
- Only functions, classes, and components are unit tested; DO NOT test constants.
- Unit test files contain a top-level `describe` for each relevant export
  - `describe` statements for classes should contain nested `describe` statements for each public function.
  - `describe` statements contain `it` tests
    - Each `it` test should be phrased descriptively, as in "_it_ behaves this way under this circumstance"
- Tests must NEVER be dependent on other tests.
- DO NOT assume the code being tested is correct; ASK the human about questionable behavior or potential bugs
- NEVER change the code being tested; ALWAYS ASK the human to make the change.
- Balance thoroughness with maintenance; avoid having too many tests and consider combining test cases that are simple and related

