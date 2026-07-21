## Why

The backend now assigns every persisted skill a stable `id` and requires that ID for detail and artifact routes, while the client still treats the mutable skill `name` as its identity. The mismatch breaks catalog navigation, direct detail loading, and downloads against the current Skills API, and prevents renamed custom skills from retaining a stable client route.

## What Changes

- **BREAKING** Change the skill detail route from `/skills/:name` to `/skills/:id`; existing name-based detail URLs are no longer part of the supported client contract.
- Regenerate the authenticated API client from the current backend OpenAPI document so skill metadata and ID-based detail/archive endpoints match the backend contract.
- Use `skill.id` for catalog selection, React list identity, detail requests, and ZIP archive downloads.
- Use the catalog-provided `downloadUrl` for the complete portable ZIP package and remove all calls to the deleted `/api/v2/skills/{id}/download` endpoint.
- Keep detail Markdown available as readable preview/source content without presenting it as a standalone downloadable or installable artifact.
- Keep `skill.name` and `skill.title` as human-readable presentation data, including ZIP download filenames and detail labels.
- Preserve browser refresh, direct ID-based navigation, and the existing not-found state for unknown or malformed IDs.
- Update page headers and breadcrumbs so persisted IDs are not presented as human-readable skill names.
- Add tests covering ID-based catalog navigation, direct detail loading, not-found behavior, ZIP download through `downloadUrl`, and the absence of the raw Markdown download action.
- Keep custom skill creation, replacement, and deletion UI out of scope; those operations remain tracked by GitHub issue #48.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `skills-hub`: Change persisted skill identity and detail/archive navigation from mutable names to stable backend IDs, make the complete ZIP package the only downloadable artifact, and retain Markdown exclusively as preview/source content.

## Impact

- Affects the generated RTK Query API, the extended ZIP/blob download endpoint, Skills Hub hooks and components, client paths, detail page labeling, breadcrumbs, fixtures, and tests.
- Depends on the backend OpenAPI document, `GET /api/v2/skills/{id}` for detail/Markdown preview, and the catalog-provided `downloadUrl` resolving to `GET /api/v2/skills/{id}/archive` for the complete ZIP package.
- Regenerating against the current backend will also expose custom-skill mutation endpoints needed by issue #48, but this change will not add or wire mutation UI.
- Requires a reproducible way to select the current local OpenAPI document during API generation because the checked-in codegen configuration currently targets a remote development schema.
