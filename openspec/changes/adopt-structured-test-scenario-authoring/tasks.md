## 1. Contract and payload foundation

- [x] 1.1 Verify the committed generated API against the coordinated backend OpenAPI on port 3001, regenerating with `RTK_QUERY_OPENAPI_URL=http://127.0.0.1:3001/api/openapi.json yarn generate-api` if needed; inspect the entire diff and confirm all four step hooks and unchanged summary contracts without manual generated edits.
- [x] 1.2 Replace Markdown authoring schema and payload helpers with structured fields, initial-step serialization and normalized partial updates; verify tests cover blank title/action, preserved interior line breaks, create omission, explicit null clearing, no-op saves and exclusion of generated/immutable fields and PATCH steps.
- [x] 1.3 Update full-detail API fixtures and contract assertions for structured fields, stable steps and hash/version; verify request-shape tests and resolve the seven recorded TypeScript errors as consumers are migrated.

## 2. Structured creation and field editing

- [x] 2.1 Replace source editing with labelled structured fields and explicit save controls, keeping Details separate; verify form tests cover initialization, field feedback, optional multiline text and absence of editable Markdown.
- [x] 2.2 Add initial step drafts with add/edit/remove and accessible ordering; verify creation with zero/multiple steps submits one atomic request without IDs/positions and retains drafts on failure.
- [x] 2.3 Wire create and scenario PATCH containers to structured payloads and persisted response baselines; verify duplicate prevention, API failures, normalized saved values and a second unchanged save issuing no request.
- [x] 2.4 Separate saved detail from dirty field/step drafts and replace Markdown-triggered global resets; verify incoming saved responses update pristine values while preserving unrelated dirty values.

## 3. Independent step operations

- [x] 3.1 Implement persisted step append/edit/delete controls using generated hooks, stable IDs and project context; verify exact payloads, null clearing, zero-step fallback, no-op edits and successful returned numbering.
- [x] 3.2 Add accessible Move up/Move down controls with disabled boundary actions and full-ID reorder payloads; verify keyboard operation, preserved step content and adoption of backend order.
- [x] 3.3 Add per-operation pending/error feedback and synchronous duplicate/overlap guards; verify failures retain drafts and never claim persisted success, and step requests never submit unsaved scenario fields.
- [x] 3.4 Implement rejected reorder refetch with explicit retry and missing-step recovery; verify HTTP 400 membership rejection, refresh failure, no obsolete automatic replay and preserved unrelated field drafts.

## 4. Saved detail and scope consistency

- [x] 4.1 Render saved structured fields and ordered steps on read-only detail; verify detail and edit pages expose neither saved Markdown previews nor raw source, and do not generate client documents/hashes.
- [x] 4.2 Integrate successful responses with project/scenario-scoped detail state and cache refresh; verify create/field/step writes refresh affected summary metadata without per-row body fetching or draft loss.
- [x] 4.3 Extend scope guards to late create/field/step completions and detail refetches; verify project changes clear all drafts and prevent old-project navigation, messages and content from appearing.
- [x] 4.4 Verify retained catalog and route behavior with regression tests for creator/details display, pagination, empty/loading/error/404 states, title navigation and exact-title scenario deletion from catalog and detail.

## 5. Integrated verification and documentation

- [x] 5.1 Run focused scenario schema, payload, API, form, step, cache and boundary tests under mirrored `src/__tests__/` paths; verify every new acceptance scenario passes, especially unrelated draft preservation across all four step operations.
- [x] 5.2 Run `yarn lint`, `yarn test`, and `yarn build`; verify successful exits and resolve adoption failures without changing unrelated feature scope.
- [ ] 5.3 Perform browser QA against port 3001 for create with zero/multiple steps, each field and step mutation, clearing, ordering, absence of Markdown preview/source, failure retention and project switching; inspect network payloads and record observed results, distinguishing simulated failure coverage from live coverage.
- [x] 5.4 Review implementation against client #87 and both delta specs, then run `openspec validate adopt-structured-test-scenario-authoring --type change --strict --no-interactive` and `git diff --check`; verify passing results and preserve the separate summary change's existing task/QA history.
- [x] 5.5 During final specification synchronization, update the canonical authoring Purpose to describe structured authoring and generated Markdown, apply these deltas and verify no editable-Markdown requirement remains; retain unrelated route, action and deletion requirements unchanged.
