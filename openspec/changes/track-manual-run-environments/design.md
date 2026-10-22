# Design

## Context

See [proposal.md](proposal.md) for motivation and scope. The matching TestPortal-backend working tree now implements profile CRUD, nullable run snapshot fields, and their OpenAPI schemas. The client still has the older generated bindings and Start manual run dialog, so it must generate against the served backend schema before integrating the UI.

## Goals / Non-Goals

**Goals:**
- Persist user-owned environment profiles scoped to a project.
- Capture a self-contained environment snapshot on each run.
- Keep all environment inputs optional and quick to enter.
- Display recorded values in run details and enough context in history.

**Non-Goals:**
- Automatically detect or verify the actual browser, operating system, device, build, or deployment.
- Share profiles between users or projects.
- Add environment analytics or history filtering in this change.
- Change the environment snapshot after a run has started.

## Decisions

### Separate reusable profile values from run-specific release values

An environment profile contains a user-provided name and optional `browser`, `operatingSystem`, `device`, and `apiEnvironment` values. `build` and `deployment` are entered for each run because they commonly change between executions. Profile selection prepopulates the four reusable values; users can adjust those values and enter build/deployment before starting. The backend never inherits build or deployment from a profile.

Alternative considered: putting build and deployment only in profiles. This risks stale release identifiers being silently reused across runs.

### Scope profiles to both owner and project

Each profile is owned by the authenticated user and associated with one project. The implemented endpoints are `/api/v2/projects/{projectId}/manual-run-environment-profiles` and its `{profileId}` item route. The backend checks project access through the current `Project.ownerId` relation and scopes profile queries by both project and profile owner. The client must not assume project membership support that the backend does not yet have.

Alternative considered: user-global profiles. API environments and device conventions vary across projects, and project scoping avoids unrelated profiles appearing in the start dialog.

### Store a copied snapshot on the run

Starting a run stores six nullable fields directly on the run: `browser`, `operatingSystem`, `device`, `apiEnvironment`, `build`, and `deployment`. The backend accepts an optional `environmentProfileId` and resolves it inside the creation transaction for the authenticated executor and selected project. Omitted reusable fields inherit from the profile; explicitly supplied values override it. Explicit `null` or blank input clears a value. The run does not store a profile name or depend on a live profile relation for display. Updating or deleting a profile has no effect on existing runs; older runs return null environment fields.

Alternative considered: storing only a profile ID and resolving values on read. That would make history change when profiles are edited or deleted and would make deletion behavior fragile.

### Keep profile management close to run start

The start dialog offers profile selection and a compact path to create, edit, or delete the current user's project profiles. Environment inputs remain optional; profile management must not block starting a run. Details and history read the saved snapshot, omitting empty fields.

Alternative considered: requiring users to navigate to a separate settings page before starting. That adds setup friction for an optional feature. A dedicated settings page can be added later if profile management grows.

### Evolve the backend contract before generating client bindings

The backend change provides project-scoped profile list/create/update/delete APIs, optional fields on the run start request, and the six nullable fields on run detail and history summaries. Profile names are required, at most 100 characters, and single-line; optional values are at most 200 characters, single-line, and trimmed. The client should generate RTK Query bindings from the verified served backend OpenAPI schema, then use those types for profile management, run start, detail, and history. Run update does not accept environment fields.

## Risks / Trade-offs

- **Personal profiles contain values that may be sensitive in some organizations** → Restrict profile APIs to the owner and project scope; do not treat arbitrary environment values as secrets or expose them in logs.
- **Users may enter inconsistent values that are difficult to filter later** → Keep MVP values as optional free text; consider controlled project vocabularies only after usage patterns are known.
- **A long profile list can slow run start** → Scope the list to the selected project and current user; show profile name and concise environment summary.
- **Backend and client contracts can drift** → Verify the served backend OpenAPI contract before regenerating client bindings; the backend working tree is currently uncommitted.

## Migration Plan

1. Complete and deploy the additive backend migration and API change; existing runs return null environment values.
2. Generate client bindings from the served OpenAPI schema and implement the client integration.
3. Deploy the client after the backend contract is available. Client rollback can remove the entry points while retaining stored profile/snapshot data.

