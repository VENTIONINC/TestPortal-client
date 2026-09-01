## 1. Backend Contract Readiness

- [ ] 1.1 Create and link a TestPortal-backend issue covering result logs, source snippet/failing-line data, generated test-case data, and independently optional fields
- [ ] 1.2 Define and land a project-scoped similar-issue lookup contract with candidate issue, similarity score, impacted-test count, and confirm/reject association semantics
- [ ] 1.3 Extend or replace the result error-formatter contract so AI categorisation returns canonical category, issue name, and description and documents the exact model-input payload
- [ ] 1.4 Regenerate the client API and result types from the updated backend OpenAPI schema and verify the new contracts compile without handwritten changes to generated files

## 2. Modal Foundation

- [ ] 2.1 Add failing component tests for the shared modal opener, assignment/edit modes, result context title, close/focus behavior, responsive layout, and light/dark theme rendering
- [ ] 2.2 Create the result-issue modal feature shell and a `useResultIssueDialog` opener that accepts the parent result, selected result error, and optional confirmed assumption
- [ ] 2.3 Implement the single-line result title and responsive evidence/assignment pane layout with independent bounded scrolling
- [ ] 2.4 Wire error-message, add-issue, and confirmed-issue-pill entry points to the modal with the correct assignment or confirmed mode

## 3. Error Evidence Pane

- [ ] 3.1 Add failing tests for Error, Logs, Snippet, and Test Case tabs, optional Error sections, Copy actions, evidence empty states, failing-line highlighting, and form-state retention while switching tabs
- [ ] 3.2 Extract the reusable error code section and Copy behavior from the existing Results error dialog
- [ ] 3.3 Implement the evidence tab navigation and populate Error Message, Call Log, and Call Stack from current result-error data
- [ ] 3.4 Render backend-provided Logs and Snippet content when present, including spec path and failing-line marker, and render truthful empty states when absent
- [ ] 3.5 Render backend-provided generated test-case content when present and the specified `A generated test case will appear here once available.` empty state when absent

## 4. Assignment State Machine and Form

- [ ] 4.1 Add failing reducer tests for all nine visible states, valid transitions, retry/reset behavior, confirmed-mode initialization, and ignored stale async completions
- [ ] 4.2 Implement the discriminated assignment state and pure reducer for opening search, AI categorisation, unassigned, algorithmic suggestion, AI suggestion, no match, both error states, and confirmed edit
- [ ] 4.3 Add failing form tests for canonical category chips, Environment-to-`infra` mapping, validation, manual edits, selected existing issues, and state-specific footer actions
- [ ] 4.4 Implement the assignment form with category chips, Issue Name, Description, validation, status/provenance area, and reducer-driven footer configuration
- [ ] 4.5 Preserve form values, selected issue, category, and per-field undo history across evidence navigation and non-destructive workflow transitions

## 5. Manual Assignment and Confirmed Editing

- [ ] 5.1 Add failing integration tests for debounced project-scoped issue search, new issue creation/assignment, existing issue assignment, mutation failures, and cache refresh
- [ ] 5.2 Implement manual issue search and selection using generated project-scoped issue query hooks
- [ ] 5.3 Implement new/existing issue assignment as a user-confirmed association and keep the modal open with recoverable state on failure
- [ ] 5.4 Add failing integration tests proving Update changes the Issue, Unassign deletes only the selected association, and Cancel persists nothing
- [ ] 5.5 Implement confirmed mode with Unassign, Update, and Cancel, using association deletion rather than Issue deletion and bypassing automatic matching

## 6. Similar-Issue Workflow

- [ ] 6.1 Add failing integration tests for automatic lookup on assignment-mode open, match, no-match, error, retry, confirm, reject, and stale-response behavior
- [ ] 6.2 Implement the typed similarity adapter and start one lookup for the active unassigned result error when the modal opens
- [ ] 6.3 Render algorithmic candidate data, `{score}% match`, affected-test count, and Reject/Confirm actions and persist each decision through the agreed assumption contract
- [ ] 6.4 Implement no-match and lookup-error copy, manual-search fallback, and Retry transitions exactly as specified
- [ ] 6.5 Add and test the `What does {score}% mean?` popover with similarity-not-probability language, three comparison signals, and flaky/timeout warning

## 7. AI Categorisation and Field Polish

- [ ] 7.1 Add failing integration tests for AI categorisation loading, complete draft success, error, retry, review-before-assignment behavior, and stale-response protection
- [ ] 7.2 Implement result-based AI categorisation using the generated complete-draft contract and map its canonical category, name, and description into the editable form
- [ ] 7.3 Render categorising, AI-suggested, and categorise-error copy and actions exactly as specified
- [ ] 7.4 Add and test the `How this suggestion was generated` popover with the exact model inputs and Environment → Performance → Script → Bug → Other priority
- [ ] 7.5 Add failing tests for independent Name and Description polish, canonical category context, successful replacement, Undo, field-specific failure, and Retry
- [ ] 7.6 Implement independent field polish actions through `POST /api/v2/error-formatter`, with one-step per-field Undo and Retry that never overwrites the other field

## 8. Legacy Surface Removal

- [ ] 8.1 Update Results execution-card and inline-issue tests to require the unified modal entry points and prove existing result-analysis badges still open their review flow
- [ ] 8.2 Remove the old Results error dialog and `ManageIssueDrawer` implementations, hooks, exports, drawer state usage, and obsolete tests after every Results entry point uses the modal
- [ ] 8.3 Delete `analyze-category-button.tsx` and remove its render branch, `handleAnalyze`, `analyzingResultId`, and `usePostApiV2ResultErrorsAnalyzeMutation` usage only after modal AI categorisation works end to end

## 9. Verification

- [ ] 9.1 Run focused reducer, modal, entry-point, and integration tests and confirm every requirement scenario has automated coverage or a documented manual check
- [ ] 9.2 Run the full client test suite, ESLint, TypeScript check, and production build and resolve regressions without editing generated API code manually
- [ ] 9.3 Manually validate all nine states, all three entry points, create/assign/update/unassign behavior, keyboard focus, responsive layout, and light/dark modes against the local backend
- [ ] 9.4 Verify no Results-tab path calls `POST /api/v2/result-errors/analyze` for issue categorisation and no Unassign action deletes the underlying Issue
