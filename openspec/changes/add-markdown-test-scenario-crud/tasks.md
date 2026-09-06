## 1. Contract and Shared Foundations

- [ ] 1.1 Regenerate `generatedApi.ts` from the locally running OpenAPI document, review the complete generated diff, and verify focused type assertions cover create, project-scoped detail, partial PATCH, delete, and their response contracts.
- [x] 1.2 Add Test Scenario authoring schemas that trim and require the title while requiring `contentMd.length >= 1` without transforming it, and verify unit tests cover blank titles, empty Markdown, whitespace-only Markdown, Unicode, indentation, and trailing line breaks.
- [x] 1.3 Extract the existing React Markdown/GFM renderer into a neutral shared preview component, retain safe external-link behavior and escaped raw HTML, and verify both shared-preview tests and existing Skill preview behavior pass.
- [x] 1.4 Add a pure helper that compares editable values with a persisted scenario and returns a title-only, Markdown-only, both-fields, or no-op PATCH result; verify exact-payload unit tests include whitespace and line-break preservation.

## 2. Routes and Catalog Entry Points

- [x] 2.1 Add `/test-scenarios/:scenarioId/edit` alongside the existing create and details paths, compose a distinct edit page with the existing authentication, project guard, and router error boundary, and verify route tests distinguish all three guarded pages.
- [x] 2.2 Add a create-scenario action to populated and empty catalog states and navigate it to the create route; verify catalog view tests cover both states and the destination path.
- [x] 2.3 Append a narrow final actions column with no visible header title and render a scenario-labelled `ContextMenuButton` in every row without changing summary-only data ownership; verify catalog tests cover column placement, blank visible header, accessible labels, and one trigger per row.
- [x] 2.4 Add `useTestScenarioContextMenu` using the shared context-menu opener with icon-bearing **Edit Scenario** and **Delete Scenario** options; verify hook and integration tests cover option order, icons, scenario identity, propagation handling, and menu closure through the shared behavior.
- [x] 2.5 Navigate **Edit Scenario** to `/test-scenarios/:scenarioId/edit` and open the scenario delete dialog from **Delete Scenario** without navigating; verify each row's menu actions target only that row.
- [x] 2.6 Render each scenario title as an accessible link to the read-only `/test-scenarios/:scenarioId` page, distinct from the edit destination, and verify every scenario ID-to-route mapping while the context-menu button remains independently operable.

## 3. Shared Authoring Form

- [x] 3.1 Implement the shared Test Scenario form view with title input, Markdown textarea, Source and Preview modes, and save/cancel actions; verify component tests cover mode switching and action visibility in create and edit modes.
- [x] 3.2 Connect the form to React Hook Form and the authoring schema so validation stays client-side and mutation actions are disabled while pending; verify invalid forms do not call submit handlers and pending forms cannot submit repeatedly.
- [x] 3.3 Render Preview mode from the current unsaved `contentMd` value without writing rendered or normalized content back into the form; verify source-preview-source tests retain headings, Unicode, fences, indentation, spaces, and line breaks exactly.
- [x] 3.4 Display inline API feedback without clearing editable values and reset the form from each successful persisted response; verify component tests cover failed submission retention and normalized response-title reset.

## 4. Scenario Creation

- [x] 4.1 Add the project-keyed create page/container and submit `{ projectId, title, contentMd }` through the generated create mutation; verify integration tests assert the selected project and exact Markdown payload.
- [x] 4.2 After successful creation, show success feedback and replace the create URL with the returned detail URL; verify navigation tests use the returned scenario ID and cannot resubmit through browser history.
- [x] 4.3 Handle create validation and API failures while retaining user input and allowing an explicit retry; verify tests cover server validation feedback, a second manual attempt, and duplicate-submit prevention.

## 5. Read-only Details and Partial Updates

- [x] 5.1 Refactor project-scoped retrieval, loading, retryable error, unavailable, and project-switch isolation into primitives shared by separate details and edit page boundaries; verify both routes request `{ scenarioId, projectId }` and never display previous-project data.
- [x] 5.2 Implement a dedicated read-only details page at `/test-scenarios/:scenarioId` that displays the persisted title and shared Markdown preview without form fields, editable source, or save controls; verify details-page tests cover success, loading, error, unavailable, and project-switch states.
- [x] 5.3 Implement a distinct edit page at `/test-scenarios/:scenarioId/edit` that initializes the authoring form only from current-scope data and submits PATCH through the changed-field helper; verify title-only, Markdown-only, both-field, and no-op payload behavior.
- [x] 5.4 Reset the edit-page comparison baseline from the successful PATCH response, show explicit save feedback, and retain unsaved values on failure; verify repeated-save tests prove a successful second save is a no-op until another edit occurs.
- [x] 5.5 Replace standalone details-page action buttons with a scenario-labelled `ContextMenuButton` wired through the shared `useTestScenarioContextMenu`; verify the menu contains icon-bearing **Edit Scenario** and **Delete Scenario**, Edit targets `/test-scenarios/:scenarioId/edit`, Delete opens the exact-title dialog with the displayed scenario identity, and no standalone Edit/Delete buttons remain.

## 6. Scenario Deletion and Cache Behavior

- [x] 6.1 Add a Test Scenario delete alert dialog through the application dialog registry that displays the persisted title and starts with an empty confirmation input; verify it opens from the selected catalog row and resets input on each opening.
- [x] 6.2 Require a case-sensitive and whitespace-sensitive exact title match in both the destructive button state and submit handler; verify mismatch, case difference, leading or trailing space difference, empty input, and exact-match tests never permit an unintended request.
- [x] 6.3 Add pending, cancellation, duplicate-confirm prevention, and inline API-error behavior while preserving a matching input after failure; verify dialog tests cover `{ scenarioId, projectId }`, retry, cancel, and successful closure.
- [x] 6.4 Verify generated Test Scenario tag invalidation refreshes the project-scoped catalog after create, update, and delete, and add focused API/cache tests proving a deleted scenario is removed from visible catalog state after list redirection.
- [x] 6.5 Extend the shared delete-dialog launcher with successful-deletion navigation so deletes initiated from either the catalog or details page redirect to `/test-scenarios` only after success; verify failures retain the originating page and matching confirmation input.

## 7. Integrated Validation

- [x] 7.1 Run the focused Test Scenario contract, schema, preview, catalog, shared context-menu, route, create, read-only details actions, edit, update, and protected-delete navigation tests and verify all targeted suites pass.
- [x] 7.2 Run `yarn lint`, `yarn tsc`, `yarn test`, and `yarn build`, resolve any regressions within this revised change, and verify every command exits successfully.
- [x] 7.3 Run `openspec validate add-markdown-test-scenario-crud --type change --strict` and `git diff --check`, and verify the revised proposal remains valid with a clean formatting check.
