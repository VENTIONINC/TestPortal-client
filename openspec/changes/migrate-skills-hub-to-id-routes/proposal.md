## Why

The backend now assigns every persisted skill a stable `id` and requires that ID for detail and artifact routes, while the client still treats the mutable skill `name` as its identity. The mismatch breaks catalog navigation, direct detail loading, and downloads against the current Skills API, and prevents renamed custom skills from retaining a stable client route.

## What Changes

- **BREAKING** Change the skill detail route from `/skills/:name` to `/skills/:id`; existing name-based detail URLs are no longer part of the supported client contract.
- Regenerate the authenticated API client from the current backend OpenAPI document so skill metadata and ID-based endpoints match the backend contract.
- Use `skill.id` for catalog selection, React list identity, detail requests, Markdown downloads, and archive downloads.
- Keep `skill.name` and `skill.title` as human-readable presentation data, including download filenames and detail labels.
- Preserve browser refresh, direct ID-based navigation, and the existing not-found state for unknown or malformed IDs.
- Update page headers and breadcrumbs so persisted IDs are not presented as human-readable skill names.
- Add tests covering ID-based catalog navigation, direct detail loading, not-found behavior, and both artifact download requests.
- Keep custom skill creation, replacement, and deletion UI out of scope; those operations remain tracked by GitHub issue #48.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `skills-hub`: Change persisted skill identity and all detail/artifact navigation from mutable names to stable backend IDs while retaining human-readable display and download naming.

## Impact

- Affects the generated RTK Query API, the extended text/blob download endpoints, Skills Hub hooks and components, client paths, detail page labeling, breadcrumbs, fixtures, and tests.
- Depends on the backend OpenAPI document and ID-based routes exposed at `/api/v2/skills/{id}` and its `/download` and `/archive` subroutes.
- Regenerating against the current backend will also expose custom-skill mutation endpoints needed by issue #48, but this change will not add or wire mutation UI.
- Requires a reproducible way to select the current local OpenAPI document during API generation because the checked-in codegen configuration currently targets a remote development schema.
