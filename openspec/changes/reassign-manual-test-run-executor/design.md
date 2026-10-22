## Context

Manual Test Run detail currently renders `executedBy` as read-only text. Its generated client API does not yet include the newly added backend operations. The companion TestPortal-backend working tree currently adds `GET /api/v2/users` for an authenticated active-user directory and `PATCH /api/v2/manual-test-runs/{runId}/executor?projectId=...` for assignment. These backend changes are uncommitted and must be checked against the final served OpenAPI before client generation.

The client determines active-run edit controls by comparing the current user ID with `executedById`; completed runs are read-only. The backend does not enforce current-Executor-only authorization for reads or writes. Reassignment changes the Executor and the run's normal `updatedAt` timestamp only; execution fields and snapshot content remain unchanged.

## Goals / Non-Goals

**Goals:** Let any authenticated active user assign an active Executor for a run in any status; use authoritative backend detail; reconcile client execution controls after reassignment; show pending, success, empty, and failure feedback.

**Non-Goals:** Change run status, run/step notes, step outcomes, completion or step timestamps, or scenario snapshot fields through reassignment; add backend Executor-only write authorization, project membership, audit history, or a reopen action.

## Decisions

### Use the dedicated reassignment endpoint

Call `PATCH /api/v2/manual-test-runs/{runId}/executor?projectId={projectId}` with the strict body `{ executedById: string }`. The endpoint is separate from run notes/status PATCH, works for in-progress and completed runs, and returns full authoritative run detail. Do not submit executor changes through the general run PATCH.

Handle the documented response classes: 200 authoritative detail; 400 invalid request or missing/inactive target; 401 invalid or missing authentication; 403 caller is not active; 404 run does not match the supplied project; 500 unexpected server failure. Validate selection client-side for usability while relying on backend active-status validation at write time.

### Load active assignment targets

Use `GET /api/v2/users`, available to authenticated active users. It returns only `{ id, name, email }` for active accounts, ordered by name then ID. Do not use `/api/v2/admin/users`; it remains the administrator account-management list. Display name and email to disambiguate users. Keep the saved Executor visible from run detail if that account later becomes inactive; the directory will omit it and it cannot be selected as a new target.

### Keep assignment controls collapsed until requested

Show the current Executor in the run metadata row with a Change Executor action. Open the assignment editor only when requested and fetch the active-user directory on demand. Cancel closes the editor and restores the saved Executor selection. Success applies the authoritative response, closes the editor, and leaves a compact confirmation beside the Executor; failure keeps the editor and selection available for retry. Changing project/run scope closes the editor.

### Caller scope and client execution controls

Any authenticated active user may initiate reassignment. The backend uses project-scoped run lookup and does not implement project-membership checks or require the current Executor/admin role. The client must not represent these additional authorization rules as backend guarantees.

For an in-progress run, use the returned `executedById` as authoritative. The newly assigned user can continue execution in the client under the current client-side identity check; the previous Executor becomes view-only in the client. Existing backend execution read/write authorization remains unchanged.

For a completed run, allow only the Executor field to change. Keep status, notes, step outcomes and notes, completion timestamps, step timestamps, and snapshot fields unchanged. The backend updates the ordinary run `updatedAt`; no other execution data changes and no reopen control is added.

### Reconciliation, drafts, and cache behavior

Use an explicit save action. Retain the selected draft after failure, prevent duplicate assignment writes, ignore late responses after project/run scope changes, and refresh the current run detail and affected project/scenario history caches after success. Refetch authoritative detail after stale-target or scope errors when appropriate.

Do not require unsaved step or note drafts to be saved or discarded before reassignment. A successful transfer can make the current user view-only. Apply the returned run immediately, preserve rejected local execution text for review/copy in the current scope, and explain the access change; do not silently save or discard drafts.

## Risks / Open Questions

- Backend changes are currently uncommitted. Regenerate client contracts only after the final served OpenAPI includes both operations and their response/error schemas.
- The backend permits any authenticated active caller to reassign runs within a supplied project scope; this reflects the current API access model and does not establish project membership authorization.
- Completed-run reassignment changes historical Executor attribution. The current backend proposal has no audit log; auditability would be a separate requirement.

## Migration Plan

No client data migration is expected. Deploy the backend operations and compatible OpenAPI contract before enabling the client control. Rolling back the client UI does not change saved Executor assignments or run execution data.
