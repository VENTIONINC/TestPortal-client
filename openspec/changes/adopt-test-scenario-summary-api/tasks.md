## 1. Generated Contract and Catalog Data

- [x] 1.1 Verify the existing generated diff against `RTK_QUERY_OPENAPI_URL=http://127.0.0.1:3001/api/openapi.json yarn generate-api`, review the complete output diff, and confirm summary/creator types, required nullable full-scenario details, and create/PATCH details semantics without manual declaration edits.
- [x] 1.2 Replace the local summary type with the generated summary contract and pass current summary records through the catalog hook; remove redundant summary mappers and obsolete mapper tests while retaining PATCH utilities, and verify catalog consumers no longer depend on `TestScenario` or read list Markdown.
- [x] 1.3 Update API contract and affected fixtures under `src/__tests__/` to distinguish summary records from full scenarios; verify type assertions cover list item type, absence of summary `contentMd`, safe creator shape, and full-scenario details, and resolve the three type errors identified during exploration.

## 2. Catalog Metadata Presentation

- [x] 2.1 Add Details and Created by columns to populated and loading tables, render `No details` for null values and creator name with secondary email, and verify component tests cover column order, plain-text markup, two distinct creators, timestamps, title links, and the final actions column.
- [x] 2.2 Extend catalog container and project-boundary tests with summary-only payloads; verify 10-row pagination, response-based showing totals, loading/error/empty states, page-one reset, and absence of previous-project details and creator metadata during a switch.

## 3. Detail, Editing, and Cache Regression Coverage

- [x] 3.1 Verify catalog loading issues no per-row detail requests and that detail/edit routes retrieve full scenarios with both identifiers after summary-only list responses; retain existing exact Markdown initialization and project-isolation behavior in focused tests.
- [x] 3.2 Review full-scenario response equality for the newly required details field and update it if needed; verify a changed full response retains current metadata while existing title/Markdown PATCH payloads omit details and preserve their exact authored-field behavior.
- [x] 3.3 Update cache regression fixtures to return summaries for lists and full scenarios for mutation responses; verify create/update/delete invalidation refreshes the catalog and preserves existing navigation and deletion behavior.

## 4. Integrated Validation

- [ ] 4.1 Run focused Test Scenario API, catalog, boundary, detail, edit, and PATCH tests including the new details authoring scenarios; verify all pass with the revised contract and fixtures.
- [x] 4.2 Run `yarn lint`, `yarn test`, and `yarn build`; verify successful exits or explicitly document unrelated blockers without silently changing their scope.
- [ ] 4.3 Perform local browser QA against the backend on port 3001; verify null and non-null details, literal markup text, distinct creator name/email display, long metadata layout, pagination, project switching, and title/edit navigation with full Markdown retrieval, creation with/without details, details-only and combined edits, clearing details, no-op saves, and record the observed results.
- [x] 4.4 Run `openspec validate adopt-test-scenario-summary-api --type change --strict --no-interactive` and `git diff --check`; verify both pass and report how this contract validation relates to the existing CRUD regeneration task without automatically completing another change's checklist.


## 5. Details Authoring Extension

Complete these implementation tasks before repeating section 4 validation. Existing checked tasks record the earlier catalog work; they do not indicate completion of this extension.

- [ ] 5.1 Extend the shared authoring schema and form with an optional labelled plain-text Details textarea between Title and Markdown; verify blank values are accepted, null details initialize as empty, internal whitespace is preserved, and Markdown Source/Preview behavior remains unchanged.
- [ ] 5.2 Include trimmed non-empty details in create requests and omit empty or whitespace-only details; verify exact create payloads, persisted-response initialization, failure retention, and duplicate-submit protection in schema/form/create tests.
- [ ] 5.3 Extend editable values and PATCH comparison to support details-only, combined changes, explicit null clearing, and unchanged omission; verify exact payload tests include null-to-blank no-ops, outer whitespace normalization, and byte-for-byte Markdown preservation.
- [ ] 5.4 Connect edit initialization, successful-response reset, and comparison baseline to details; verify a second unchanged save is a no-op, failed saves retain input, and project switching clears prior-project details.
- [ ] 5.5 Extend mutation/cache integration coverage to create details, update details, and clear them; verify refreshed catalog rows show the persisted text or `No details` and existing title/Markdown-only changes leave details untouched.
