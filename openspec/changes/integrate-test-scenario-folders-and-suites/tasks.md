# Tasks

## 1. API contract and generated bindings

- [x] 1.1 Verify the target backend OpenAPI document contains folder, suite, membership, bulk-folder, and extended scenario-list contracts matching the `feature/test-suites-and-folders` implementation; record the schema source used for generation.
- [x] 1.2 Regenerate RTK Query client bindings and verify generated request/response types include organization operations and scenario folder/list fields without manual edits to generated files.
- [x] 1.3 Define feature-local request/view types and cache tags where needed; verify TypeScript compilation resolves generated types without `any` casts.

## 2. Project folder and suite navigation

- [x] 2.1 Add project-scoped folder-tree and suite-list queries to the catalog boundary; verify changing projects clears selection and never renders the prior project's organization data.
- [x] 2.2 Add navigation for all scenarios, Unfiled, folder tree, and suites with localized labels and accessible selection state; verify navigation updates the active server query scope.
- [x] 2.3 Add breadcrumbs, descendant inclusion control, folder/suite counts, and loading, empty, and error states; verify counts and rows come from backend responses.
- [x] 2.4 Add folder create, rename, move/reorder, and delete dialogs; verify delete requires the parent-or-Unfiled disposition and presents child-folder promotion behavior.
- [x] 2.5 Add suite create/edit/delete and membership-management views with description, purpose, release, ordered rows, search, and bounded bulk selection; verify suite deletion leaves scenarios intact.

## 3. Scenario catalog queries and bulk actions

- [x] 3.1 Extend catalog query state with scope, search, sort, descendant mode, and page; verify folder UUID, `unfiled`, and suite UUID requests combine with project ID and 10-row pagination.
- [x] 3.2 Add server-backed search and pagination controls; verify changing scope or search resets to page 1 and uses response pagination metadata rather than filtering loaded rows.
- [x] 3.3 Add bulk folder move and suite membership actions with a 100-item cap and explicit confirmation; verify rejected writes retain the user's current selection and view.
- [x] 3.4 Add success-path cache invalidation for folder, suite, and scenario mutations; verify all, Unfiled, folder, and suite views reflect successful changes and failed writes do not produce stale optimistic state.

## 4. Scenario authoring integration

- [x] 4.1 Add optional folder selection to scenario create and edit flows, defaulting create-from-folder to the active folder; verify requests send UUID or null and preserve unchanged structured fields.
- [x] 4.2 Refresh catalog organization data after scenario placement changes and preserve form drafts on API errors; verify cross-project folder rejection is shown without losing user input.

## 5. Integration verification

- [x] 5.1 Add or update mirrored catalog, form, and organization component/hook tests for project isolation, folder/suite filtering, batch limits, safe deletion, membership, and cache refresh; verify the focused tests pass.
- [ ] 5.2 Update Test Scenario organization usage documentation and translations; verify names and operation limits match the generated backend contract.
- [ ] 5.3 Run the repository lint, TypeScript, build, and relevant test commands after implementation; verify the full client integration passes against a backend exposing the organization API.

## Implementation notes

- The client repository has no translation resource system; new organization labels follow the existing English-only UI convention. Usage documentation was added in `docs/TEST_SCENARIO_ORGANIZATION.md`.
- Client lint, TypeScript, build, and tests pass. Live backend verification remains pending because no service is listening at `localhost:3001`; the matching backend OpenAPI schema source was verified and used for code generation.
