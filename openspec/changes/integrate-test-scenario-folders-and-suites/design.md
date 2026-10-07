# Design

## Context

See proposal.md for motivation and the spec deltas for observable behavior. The client currently has a project-scoped catalog backed by one generated scenario-list query (10 rows per page), create/edit forms, and summary/detail separation. It does not yet expose folder or suite operations. The backend branch `feature/test-suites-and-folders` contains the matching organization implementation and OpenAPI additions in `TestPortal-backend/src/lib/openapi/testScenarios.ts`; its worktree currently has uncommitted changes, so the API schema must be generated from the actual backend branch before client implementation.

The contract uses project UUIDs and entity UUIDs. Folder endpoints are `/api/v2/test-scenario-folders`; suite endpoints are `/api/v2/test-suites`; bulk placement is `PATCH /api/v2/test-scenarios/bulk-folder`. Folder deletion requires `disposition=parent|unfiled`. Scenario listing accepts `folderId` (UUID or `unfiled`), `includeDescendants`, and `suiteId` alongside existing project/search/sort/pagination parameters. Backend list summaries remain lightweight and include current folder ID/name. Batch membership and folder moves accept at most 100 unique scenario IDs.

## Goals / Non-Goals

**Goals:**

- Integrate the existing REST contract through generated client API bindings and project-aware RTK Query keys.
- Preserve server-side filtering, search, ordering, and pagination; maintain the current catalog page size of 10.
- Give the catalog, scenario forms, and organization dialogs clear ownership boundaries and predictable cache refresh behavior.
- Preserve current scenario authoring and history behavior while allowing optional folder placement.

**Non-Goals:**

- Implement or change backend persistence, authorization, OpenAPI, or migration behavior.
- Add dynamic suites, saved filters, multiple folder placement, test plans, or immutable release snapshots.
- Change route structure for scenario details or change the existing project-selection guard.

## Decisions

### Generate API bindings from the backend OpenAPI contract

Use the existing `yarn generate-api` workflow against the backend branch's served OpenAPI document, then consume the generated query and mutation types. Do not hand-edit `generatedApi.ts`. If the served schema differs from `src/lib/openapi/testScenarios.ts`, treat the served schema and verified route behavior as deployment blockers and reconcile the contract before client implementation.

Alternative considered: manually add RTK Query endpoints. Rejected because it duplicates request/response definitions and undermines the repository's code-generation boundary.

### Keep catalog query state explicit and project-keyed

Represent the selected scope (all, unfiled, folder UUID, or suite UUID), descendant mode, search, sort, and page as query arguments. Derive list rows and pagination solely from the matching server response. Reset scope, search, and page immediately on project change. Keep the existing limit of 10 unless the product requirement changes.

Alternative considered: filter the current page in the browser. Rejected because it produces incorrect totals and omits matches on other pages.

### Keep folder and suite controls in the catalog container boundary

Extend the catalog container and feature hooks to coordinate organization queries and mutations; keep the view focused on navigation, breadcrumbs, result controls, selection, and feedback. Use dedicated dialogs/forms for folder and suite lifecycle and confirm folder deletion disposition before issuing the request.

Alternative considered: place request state and mutation logic directly in the table view. Rejected because it couples presentation to API behavior and makes project-switch isolation harder to maintain.

### Invalidate organization and list data after successful mutations

Use generated endpoint tags or narrowly scoped invalidation for folder tree, suite metadata/members, and scenario summaries. Invalidate only after a successful mutation and include `projectId` plus filter/page arguments in cache identity. Re-fetch selected list data after folder assignment, membership changes, deletes, or reordering.

Alternative considered: update every cached list optimistically. Rejected for the first integration because a scenario may appear in multiple overlapping folder, suite, and search results; invalidation is simpler and leaves server counts authoritative.

### Treat suites as current ordered collections

Render suite membership from the suite API and use complete member UUID lists for reorder. Add/remove in batches of at most 100; do not copy scenario objects into suite-local records or imply a historical snapshot. Release text is descriptive metadata only.

Alternative considered: snapshot release membership in the client. Rejected because it conflicts with the backend contract and would conflate current grouping with execution evidence.

## Risks / Trade-offs

- **Backend OpenAPI may not be available from the documented local generation URL** → generate from the matching backend branch or its emitted OpenAPI artifact and verify all organization routes and schemas before client changes.
- **Backend implementation is currently uncommitted in its worktree** → coordinate deployment/merge order; the client feature must remain gated until the contract is available in the target environment.
- **Large suites or folder trees increase client state and navigation complexity** → load the folder tree and suite summaries once per project, keep scenario rows paginated, and let server responses own counts.
- **Multiple mutations can invalidate overlapping catalog scopes** → use project-scoped tags and verify that all, unfiled, folder, and suite views refresh correctly after writes.
- **One hundred item cap can limit large selections** → show the limit before submission and keep each request bounded to the backend contract.

## Migration Plan

1. Confirm that the target backend deployment exposes the organization routes and matching OpenAPI schemas.
2. Generate client bindings from that schema and integrate the organization UI behind normal catalog loading/error states.
3. Deploy the client only after the backend contract is available; existing scenarios remain Unfiled and remain usable if no organization is configured.
4. Roll back by disabling/removing catalog organization controls and regenerating bindings from the prior schema; no client-side data migration is required.
