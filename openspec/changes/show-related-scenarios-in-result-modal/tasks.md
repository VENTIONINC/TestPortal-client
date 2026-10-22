## 1. Adopt the Result detail contract

- [x] 1.1 Regenerate the authenticated RTK Query API from a backend OpenAPI document containing `ResultDetail` and `RelatedTestScenarioSummary`; verify the generated GET Result detail type has `relatedTestScenarios` while list and other Result response types remain unchanged.
- [x] 1.2 Review the generated diff against the backend branch and resolve unrelated contract drift without hand-editing generator-owned declarations; verify the diff contains only intended, source-backed changes.

## 2. Add the in-modal scenario view

- [x] 2.1 Add an accessible Test Scenarios tab immediately below Logs in the existing vertical rail, including when optional error evidence is absent; verify a component test can open the tab and switch back without losing issue form edits.
- [x] 2.2 Load Result detail for the active scenario tab using both `context.result.id` and `projectId`, refetch on tab entry, and render only current-scope data; verify tests cover a Result change, a project change, and a late previous-scope response.
- [x] 2.3 Show linked scenario titles in backend order, a successful no-links state, and an in-pane read-only Markdown view with nullable-details handling and a return action; verify component tests cover one, multiple, and empty links without route navigation.
- [x] 2.4 Add distinct loading, unavailable-Result, and failed-request states with retry; verify tests show that failure is never presented as an empty link set and retry requests current scope.

## 3. Verify integration

- [x] 3.1 Run `yarn lint`, `yarn test`, and `yarn build`; verify each command succeeds and record any unrelated warnings or skipped coverage separately.
- [ ] 3.2 With a backend serving VENTIONINC/TestPortal-backend#116, verify in the browser that the tab appears below Logs, shows current linked Markdown and empty/error states, preserves issue edits, and never shows a previous project's scenarios after switching projects; record live observations separately from mocked tests.

  - Live browser observation (2026-09-25, client at `localhost:5173`, backend at `localhost:3001`): the Default Project exposes two failed seeded Results across both the failed-only and all-status views. Their Test Scenarios tab renders the successful empty state. An unsaved Issue name remained intact after switching to Test Scenarios and back, then was cleared. These Result contexts expose Error but no Logs tab; the project selector offers only Default Project. No linked Markdown, request-error case, or second project was available for live verification, so those checks remain covered by component tests only and task 3.2 stays open.
