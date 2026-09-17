## 1. Contract and API integration

- [x] 1.1 Recheck backend status and served OpenAPI on port 3001, record branch/contract evidence and regenerate with `RTK_QUERY_OPENAPI_URL=http://localhost:3001/api/openapi.json yarn generate-api`; verify all five execution operations plus history contracts and review unrelated generated drift without manual declaration edits.
- [x] 1.2 Add non-generated retry/cache enhancements and ensure execution consumers load them; verify transport failures do not retry mutations, GET retries remain, definitive 401 token refresh remains functional, and cache keys/invalidation include project/run/source context.
- [x] 1.3 Add allowlisted note/step payload and passed-eligibility helpers; verify tests cover omission/null clearing, whitespace/newlines, no-op and empty PATCH prevention, identity/content exclusion and zero/all-skipped/mixed-step eligibility.

## 2. Start, detail and resume

- [x] 2.1 Add the visible Start manual run action to saved scenario detail with synchronous duplicate and post-await scope guards; verify success navigates to returned run, failure gives feedback, uncertain failure warns without retry and old-project responses cannot navigate or notify.
- [x] 2.2 Add `/manual-test-runs/:runId`, page exports and keyed project/run boundary using existing authentication/project guards; verify router and boundary tests cover access, missing identifiers and immediate state reset on scope changes.
- [x] 2.3 Implement scoped detail retrieval and snapshot presentation; verify reload/resume issues no start request, all structured fields/copied ordered steps render, scenario/execution notes remain distinct, null references work and loading/error/retry/404 never expose another scope.

## 3. Execution drafts and explicit saves

- [x] 3.1 Add run-note and per-step outcome/note drafts with explicit save/discard controls; verify mirrored component tests cover all step statuses, initialization, normalized null clearing, no-op saves and discard to saved values.
- [x] 3.2 Serialize writes per run and reconcile successful full-detail responses; verify duplicate/overlap guards, submitted-input pending behavior and preservation of unrelated dirty drafts across saves and cache refetches.
- [x] 3.3 Add save failure and authoritative 409 recovery; verify draft retention, active conflict feedback without replay, completed read-only transition with rejected text available to copy, and failed refresh blocking writes until recovery.

## 4. Completion and immutable results

- [x] 4.1 Add save-or-discard completion gating and accessible outcome confirmation dialog; verify dirty/pending gating, explicit outcome selection, eligibility guidance, cancellation, keyboard/focus behavior and immutable-result warning.
- [x] 4.2 Wire guarded dedicated completion with authoritative recovery and read-only presentation; verify exact payload, zero-step and every terminal outcome, duplicate confirmation prevention, no run PATCH finalization, lost-response refetch before retry and completed conflicts without false success/reopen.
- [x] 4.3 Verify writes update scoped detail and invalidate affected project/scenario history caches without adding #93 UI; verify cache tests and project-switch tests cover late save/completion/refetch responses, messages and draft clearing.

## 5. Integrated verification and delivery readiness

- [x] 5.1 Run `yarn lint`, `yarn test` and `yarn build`; verify passing exits and retained scenario catalog/authoring behavior, keeping all tests mirrored under `src/__tests__/`.
- [ ] 5.2 Perform authenticated browser QA against the migrated local backend: start zero/multiple-step runs, save all statuses/notes and clearing, reopen URL after reload, source edit/reorder/deletion snapshot persistence, project switching, completion gating and immutable outcomes; record observed results and separate live failure/concurrency checks from simulations.
- [x] 5.3 Review implementation against #92 and the execution spec, run `openspec validate add-manual-test-run-execution --type change --strict --no-interactive` and `git diff --check`; verify scope excludes #93 UI and unrelated changes/checklist updates.
- [x] 5.4 Before delivery, verify backend integration and regenerate against its final served OpenAPI; review generated diff and rerun affected checks if it changes. Record any outstanding backend merge or verification dependency rather than claiming local integration proves delivery.
