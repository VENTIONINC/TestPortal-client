# Proposal

## Why

Manual Test Runs currently do not record the browser, operating system, device, API environment, build, or deployment used during execution. This makes results harder to reproduce and compare, while requiring users to repeat environment details for runs that use the same setup.

## What Changes

- Add optional environment details to Manual Test Runs and preserve a snapshot of those values with each run.
- Let each user manage reusable environment profiles within a project and select one when starting a run.
- Keep build and deployment as per-run values; selecting a profile fills only browser, operating system, device, and API environment.
- Ensure later profile edits or deletion do not change historical run snapshots.

## Capabilities

### New Capabilities
- `manual-run-environments`: User-owned project environment profiles and immutable per-run environment snapshots.

### Modified Capabilities
- None.

## Impact

- Manual Test Run start dialog, detail view, and history presentation in the client.
- The matching TestPortal-backend change already adds profile persistence, owner-scoped REST endpoints, nullable run snapshot columns, and OpenAPI schemas; these backend changes are currently uncommitted.
- Generated client API types/hooks from the verified backend OpenAPI contract.
- Client integration with backend authorization and project scoping for profile CRUD and run creation.
