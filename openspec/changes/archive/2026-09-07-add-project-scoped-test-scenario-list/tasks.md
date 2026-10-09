## 1. Generated API Contract

- [x] 1.1 Regenerate `src/redux/apis/generatedApi.ts` with `RTK_QUERY_OPENAPI_URL=http://127.0.0.1:3001/api/openapi.json yarn generate-api`, verify the generated Test Scenario list hook accepts `projectId`, `page`, and `limit`, and review the generated diff for unrelated backend contract drift.
- [x] 1.2 Add compile-time generated-contract coverage for the Test Scenario list arguments, scenario fields, and pagination metadata, and verify the focused contract test and `yarn tsc` pass without hand-edited generated declarations.

## 2. Test Scenario Catalog Components

- [x] 2.1 Add summary view types and an API-to-view mapping that exposes only scenario ID, title, created timestamp, and updated timestamp, and verify unit coverage demonstrates that `contentMd` is not passed to presentation.
- [x] 2.2 Add a presentational catalog table with **Title**, **Created**, and **Updated** columns plus loading, error, empty, and paginated states using existing Chakra UI and shared pagination patterns, and verify focused component tests cover the headers, rows, every state, and page selection.
- [x] 2.3 Add a query container that requests page 1 with limit 10 for the selected project, uses only current-argument response data, and verifies through focused tests that page changes send the correct `projectId`, `page`, and `limit`.
- [x] 2.4 Add the selected-project keyed boundary around the state-owning container, and verify a rerender with another project resets the first request to page 1 and never presents records from the previous project.

## 3. Route and Navigation Integration

- [x] 3.1 Add the `/test-scenarios` path constant, Test Scenarios page with `MainTemplate`, and required page/component exports, and verify the page renders the catalog under the expected heading.
- [x] 3.2 Register `/test-scenarios` with `ProtectedRoute` and `ProjectGuard`, and verify route tests cover authenticated access plus the existing unauthenticated and no-project guard behavior.
- [x] 3.3 Add **Test Scenarios** to the main navigation as a standard link and update navigation tests to verify its label, destination, and active-route behavior.

## 4. Validation

- [x] 4.1 Run all focused generated-contract, catalog, project-switch, route, and navigation tests and verify they pass together.
- [x] 4.2 Run `yarn lint`, `yarn test`, and `yarn build`, then verify `git diff --check` and `openspec validate add-project-scoped-test-scenario-list --strict` pass with unrelated worktree changes left untouched.
