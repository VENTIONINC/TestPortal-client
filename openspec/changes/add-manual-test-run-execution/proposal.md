## Why

Testers can author structured scenarios but cannot execute them and persist observations in the client. Client issue #92 adds execution against the available Manual Test Run backend while preserving the exact scenario snapshot tested.

## What Changes

- Add Start manual run on saved scenario detail and a protected run detail/resume route.
- Display persisted scenario snapshots, ordered copied steps, executor and server timestamps.
- Record step outcomes and notes with local Submit / Submit changes controls; allow corrections while the run is active and use Discard changes to restore persisted values. Keep run notes separately saved.
- Show a top-of-page step progress strip with outcome dots, result counts, unsaved-change markers and navigation to each step. Progress reflects persisted outcomes only.
- Add explicit terminal completion with confirmation, saved-state eligibility checks and immutable completed presentation. Require saving or discarding all drafts before completion.
- Regenerate authenticated RTK Query contracts from the coordinated local OpenAPI; add deliberate retry and cache policies outside generated declarations.
- Preserve selected-project isolation across queries, writes and late responses.
- Keep project/scenario history and retesting in companion issue #93. No suites/plans, assignment, attachments, defect linking, analytics, unified automated Results, Markdown authoring or browser MCP integration.

## Capabilities

### New Capabilities

- `manual-test-run-execution`: Starting and resuming snapshot runs, saving execution outcomes/notes, explicit completion, conflict recovery, cache consistency and project isolation.

### Modified Capabilities

None. Existing scenario catalog and authoring requirements remain unchanged; the new start action is specified by the execution capability.

## Impact

- Scenario detail container/view, new Manual Test Run page and feature components/hooks, route paths and exports.
- Main API generation and non-generated endpoint enhancements; mirrored tests under `src/__tests__/`.
- Uses backend PR #97 (`feature/add-manual-test-runs`, inspected at `8fc2cd66d90d8ce758de58ef29e524ec21e37554`): start, detail, run-note PATCH, step PATCH and completion endpoints, all carrying selected `projectId`.
- Local preparation verified status and served OpenAPI on port 3001, generated Prisma and applied three pending migrations. Authenticated execution/browser QA remains outstanding. Backend #97 is open with conflicts; final integrated OpenAPI regeneration is a delivery prerequisite.
- Preserve client #78/#79/#85/#87 behavior and the existing active OpenSpec changes, including outstanding structured-authoring browser QA.
