## Why

Manual Test Run records have an Executor, but the client cannot change that assignment after a run starts. Teams need to correct or transfer the assignment, including for completed runs, while preserving execution evidence.

## What Changes

- Add an Executor selector to Manual Test Run detail, backed by the authenticated active-user directory `GET /api/v2/users`.
- Save assignments through `PATCH /api/v2/manual-test-runs/{runId}/executor?projectId={projectId}`, separate from the run notes/status PATCH.
- Allow any authenticated active user to reassign a run in any status. The backend contract uses project-scoped run lookup but does not add project-membership or current-Executor authorization.
- Use the authoritative returned Executor to update client-side execution controls: the new Executor may continue an in-progress run, while the previous Executor sees it as view-only. This is a client presentation rule; backend execution-write authorization remains unchanged.
- Permit reassignment of completed runs while leaving execution data and snapshot fields unchanged.

## Capabilities

### Modified Capabilities

- `manual-test-run-execution`: Add Executor selection, reassignment, and client-side access-state reconciliation.

## Impact

- Manual Test Run detail view/container and client API integration.
- The companion TestPortal-backend working tree currently contains the corresponding endpoints and OpenAPI changes under `reassign-manual-test-run-executor`. Client generation and integration must use the final served OpenAPI contract after those changes are ready.
- Existing run-result completion, history, and snapshot behavior remain unchanged.
