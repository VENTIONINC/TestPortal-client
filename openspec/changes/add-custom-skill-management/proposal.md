## Why

The Skills Hub currently supports browsing, previewing, and downloading persisted skills, but authenticated users cannot manage shared custom skill packages from the client. The backend now exposes stable-ID create, replace, and delete operations, so the client can add this workflow without coupling mutable package names to routes or identity.

## What Changes

- Add a create-skill action to the Skills Hub catalog and a form for a ZIP package, catalog title, and category.
- Allow writable custom skills to be fully replaced from their stable-ID detail route while preserving that route when package frontmatter changes.
- Allow writable custom skills to be deleted only after explicit confirmation, then return the user to the catalog.
- Keep create, replace, and delete controls absent for read-only or system skills while retaining backend authorization as the source of truth.
- Send create and replace requests as authenticated `multipart/form-data`, refresh affected catalog and detail data after success, and prevent duplicate submissions while mutations are pending.
- Present validation, conflict, forbidden, not-found, authentication, and unexpected errors without discarding the user's current form or page state.
- Preserve Markdown preview and authenticated ZIP download behavior after a replacement.
- Add focused automated coverage for multipart serialization, form validation, permission gating, cache refresh, stable-ID replacement, deletion confirmation, navigation, and representative errors.

## Capabilities

### New Capabilities

- `custom-skill-management`: Authenticated creation, stable-ID replacement, deletion, permission gating, cache synchronization, and error handling for shared custom skill packages in the Skills Hub.

### Modified Capabilities

None. The related `skills-hub` capability is still represented by active, unarchived changes; this proposal adds a separate management capability that depends on their ID-based browse/detail contract.

## Impact

- Skills Hub catalog and detail containers, hooks, and reusable skill components.
- Dialog infrastructure for create/replace forms and delete confirmation.
- Authenticated RTK Query integration, including explicit `FormData` serialization and `Skills` tag invalidation.
- Form validation schemas, API error presentation, navigation after deletion, and toaster feedback.
- Unit and integration tests under `src/__tests__/` mirroring the affected source modules.
- Depends on the ID-based routing and metadata contract from issue #47 and the backend endpoints `POST /api/v2/skills`, `PUT /api/v2/skills/{id}`, and `DELETE /api/v2/skills/{id}`.
