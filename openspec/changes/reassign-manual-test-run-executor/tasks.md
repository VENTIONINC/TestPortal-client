## 1. Backend contract coordination

- [x] 1.1 Coordinate with TestPortal-backend change `reassign-manual-test-run-executor` and verify its final served OpenAPI includes `GET /api/v2/users`, `PATCH /api/v2/manual-test-runs/{runId}/executor`, schemas, deterministic ordering, and documented response codes.
- [x] 1.2 Confirm the integrated backend behavior: any authenticated active caller, project-scoped run lookup, active-target validation at write time, no project-membership requirement, and no new server-side Executor-only authorization for execution writes.

## 2. Client API and user selection

- [x] 2.1 Regenerate client API types/hooks from the coordinated final OpenAPI; add retry and cache behavior outside generated declarations.
- [x] 2.2 Add a labelled Executor selector using the active-user directory, current Executor display, name/email disambiguation, explicit save, loading/empty/error feedback, and duplicate-write protection.
- [x] 2.3 Submit only `{ executedById }` to the dedicated project-scoped executor operation; handle validation, authentication, inactive-caller, scoped-not-found, and server errors.
- [x] 2.4 Reconcile from returned authoritative detail and invalidate/update matching run detail and Manual Test Run history caches.

## 3. Access state and failure recovery

- [x] 3.1 Apply returned Executor state so the newly assigned user can continue an active run in the client and the previous Executor becomes view-only in the client.
- [x] 3.2 Preserve local execution drafts and provide review/copy feedback if reassignment removes the current user's client-side write access; do not silently save or discard drafts.
- [x] 3.3 Handle inactive targets, failed requests, and project/run scope changes without false success, stale notifications, or stale data application.
- [x] 3.4 Verify completed-run reassignment changes only Executor identity and ordinary `updatedAt`, preserving status, notes, step data, timestamps, and snapshot fields as read-only.

## 4. Verification and integration

- [x] 4.1 Add mirrored client tests for active-user results, selection/save/failure states, reassignment across run statuses, client access-state changes, draft retention, cache refresh, and scope isolation.
- [x] 4.2 Run focused tests, lint, and build; verify accessible selector behavior against the coordinated backend.
- [x] 4.3 Validate the OpenSpec change and record any outstanding backend integration or verification dependency.
