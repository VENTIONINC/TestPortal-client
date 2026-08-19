## Why

Assigning an issue from the Results tab is fragmented across a read-only error dialog, inline controls, and a separate management drawer, forcing users to switch contexts while diagnosing and classifying a failure. Consolidating these paths into one guided modal makes error evidence, similar-issue matching, AI-assisted drafting, and confirmation available in a single review flow.

## What Changes

- Replace the Results error dialog and `ManageIssueDrawer` assignment path with one responsive two-pane Assign Issue modal.
- Open the same modal from the error message, the add-issue control, and a confirmed-issue pill; confirmed issues open in edit mode.
- Present available error evidence in Error, Logs, Snippet, and Test Case tabs, with explicit empty states where the backend does not yet provide data.
- Add an explicit right-pane state machine for matching, AI drafting, manual entry, suggested issues, failures, and confirmed editing.
- Automatically look for a similar issue when an unassigned result error is opened and allow users to confirm or reject an algorithmic suggestion.
- Add category selection, AI categorisation, per-field polish actions, provenance explanations, and state-specific footer actions.
- Preserve create, assign, update, and unassign behavior while removing the issue-management drawer.
- Remove the inline Results-tab Categorise with AI action and its result-analysis mutation; issue drafting remains available inside the modal through the error-formatter APIs.
- Support the complete experience in light and dark modes.

## Capabilities

### New Capabilities

- `result-issue-modal`: Unified Results-tab modal, entry points, error-evidence navigation, display modes, and issue assignment/editing behavior.
- `issue-suggestion-workflow`: Similar-issue matching, AI-assisted issue drafting and polishing, suggestion provenance, and the right-pane state model.

### Modified Capabilities

None.

## Impact

- Affected client areas: Results execution cards, inline issue pills, result-error dialog infrastructure, issue-management drawer infrastructure, shared dialog components, form/state hooks, tests, and category styling.
- Affected APIs: existing issue search/create/update and assumption confirm/create/delete operations, plus `POST /api/v2/error-formatter/result` and `POST /api/v2/error-formatter`; the inline `POST /api/v2/result-errors/analyze` usage is removed from this flow.
- Backend dependency: automatic similarity matching and populated Logs, Snippet, and Test Case tabs require backend contracts/data that are not currently available. The client will expose defined loading, error, and empty states until those contracts land.
- No persisted client-data migration is required.
