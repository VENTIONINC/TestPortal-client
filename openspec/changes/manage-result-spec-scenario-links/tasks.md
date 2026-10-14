## 1. Verify and adopt the integrated API contract

- [x] 1.1 Inspect the target served OpenAPI for project-scoped title/scenarioKey search (details excluded), scenario summary labels, ResultDetail.spec.id and related scenarios, POST link 201/409/404 and DELETE 204/404; record contract source and observed readiness separately from issue/PR status.

- Contract verification sources, inspected 2026-10-05: the configured `RTK_QUERY_OPENAPI_URL` default (`http://dev-alb-210489249.eu-central-1.elb.amazonaws.com/api/openapi.json`) is behind and lacks title/key search, summary scenarioKey and related Result detail. The target local source (`http://localhost:3001/api/openapi.json`) is now available and ready: it defines trimmed case-insensitive literal title/scenarioKey search (details excluded), nullable summary labels, ResultDetail.relatedTestScenarios, ResultDetail.spec.id, POST 201/409/404 and DELETE 204/404. Issue/PR status was not used as contract-readiness evidence.
- [x] 1.2 Regenerate affected catalog/link/Result-detail declarations from that contract without hand edits; verify the generated diff supports search and preserves existing catalog consumers, dedicated detail endpoint identity and unrelated API declarations with focused contract tests and yarn tsc.

  - Added a focused RTK Query generator for the searchable picker endpoint, generated the Result-detail API from the local source, and confirmed the existing link operation declarations match the contract. Existing catalog consumers retain their optional arguments. Focused serialization/cache tests and `yarn tsc` pass; unrelated main API declarations were kept out of the generated diff.

## 2. Add cache and write behavior

- [x] 2.1 Add non-generated endpoint enhancements for project coverage tags and affected scenario-link caches, covering both modal and other Result-detail consumers; verify RTK Query integration tests show a mutation refreshes subscribed same-project details (including another Result sharing the Spec) and leaves other projects untouched.
- [x] 2.2 Disable automatic retries for both link writes through endpoint extraOptions and expose enhanced hooks to consumers; verify request-count tests cover transport/5xx failures and writes carry projectId, scenarioId and the intended Spec UUID.

## 3. Build in-pane management and search

- [x] 3.1 Separate management orchestration from presentation while retaining the existing inspection flow and parent form ownership; verify linked-list, picker, inspection and Back navigation remain in the evidence pane with no route/modal replacement.
- [x] 3.2 Add Link Test Scenario to successful empty/populated views and Spec-wide explanatory copy; verify controls are unavailable without current detail/spec identity and accessible component tests cover both entry states.
- [x] 3.3 Implement the summary picker with key/N/A, title and nullable details, input/applied title-key Search (button/Enter), blank omission, limit 10 and server pagination; verify search finds candidates absent from the initial page, resets page 1, retains applied search across pages and does not filter only loaded rows or request per-row details.
- [x] 3.4 Add loading, retryable error, empty catalog, no matches and empty-later-page recovery; verify failed requests preserve search and never appear as successful empty responses.
- [x] 3.5 Implement single selection and Already linked disabled entries, plus accessible focus restoration on picker/confirmation cancellation; verify known links cannot be selected and keyboard users can enter and leave management views.

## 4. Link, unlink and reconcile

- [x] 4.1 Submit link with current Result detail spec.id and a synchronous pending guard; verify double submission sends one write, confirmed creation returns to refreshed coverage and the new scenario's current Markdown is inspectable.
- [x] 4.2 Add explicit unlink action and confirmation identifying the scenario, all-results impact and preserved entities; verify cancellation sends no write and confirmed removal refreshes coverage and clears an absent inspected selection.
- [x] 4.3 Handle 409 by explaining Already linked and refreshing authoritative coverage while retaining picker/search; verify concurrent-link conflict does not report creation success and the refreshed entry becomes unavailable for selection.
- [x] 4.4 Handle 404 and recoverable/uncertain write failures with retained input, clear feedback, authoritative refresh and explicit retry; verify deleted targets, transport uncertainty and server errors never produce stale success or automatic write resubmission.
- [x] 4.5 Distinguish confirmed-write/failed-refresh feedback from failed writes and provide refresh retry; verify no fabricated updated list or stale freshly-confirmed coverage is shown when reconciliation fails.

## 5. Verify scope and modal integration

- [x] 5.1 Guard reads and completion handlers by captured scope/context generation, reset management state on Result/project changes and invalidate handlers on close; verify delayed search/write responses cannot alter a new context's data, picker, selection or feedback, while old confirmed writes refresh only original-project caches.
- [x] 5.2 Verify the actual modal preserves edited issue name, description and category across picker entry/cancellation, search, link/unlink, inspection and evidence-tab changes; keep regression tests under src/__tests__/ mirroring real source modules.
- [x] 5.3 Run yarn lint, yarn test and yarn build after focused checks; record results and any unrelated warnings/skips without claiming live acceptance from mocked tests.

  - Final verification: `yarn lint` and `yarn build` pass. `yarn test` passes all 351 tests in 71 files. Vitest emits existing “Could not parse CSS stylesheet” diagnostics, and the production build reports the existing large main-chunk warning; neither caused a command failure.

## 6. Validate persisted behavior in the browser

- [ ] 6.1 Against the compatible authenticated backend, verify linking from empty/populated coverage, title/key search and pagination beyond the initial page, N/A/details display, in-modal inspection and preserved issue draft/category; record actual fixtures and observations.
- [ ] 6.2 Verify link/unlink persistence after reload, current coverage from another Result of the same Spec and preserved scenario/history/issues; record live evidence separately from mocked duplicate/failure/isolation tests and leave unavailable live checks open. Do not mark #105's outstanding QA complete by inference.
