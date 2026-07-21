## Why

The backend now exposes an authenticated Skills Hub API, but the client has no way for users to discover, preview, or download available skill artifacts. Adding this support lets authenticated users browse the predefined skills catalog and retrieve either the raw `SKILL.md` file or the full packaged archive when bundled resources are needed.

## What Changes

- Add a Skills Hub entry point to the authenticated client navigation.
- Add a skills catalog view that fetches and displays all skills returned by `GET /api/v2/skills`.
- Add a skill detail view that displays metadata and previews the returned Markdown content.
- Add authenticated download actions for raw `SKILL.md` and zip archive artifacts.
- Add clean loading, empty, unauthorized/session, not-found, and error states consistent with existing API handling.
- Add Markdown rendering support using MIT-licensed `react-markdown` and `remark-gfm`.

## Capabilities

### New Capabilities

- `skills-hub`: Authenticated users can browse, preview, and download predefined Skills Hub artifacts from the client.

### Modified Capabilities

- None.

## Impact

- Adds new Skills Hub pages, routes, navigation item, hooks, and components.
- Uses the generated authenticated Skills API endpoints already present in the RTK Query API layer.
- Adds or overrides download handling so Markdown and zip responses are parsed as text/blob while preserving auth headers and token refresh behavior.
- Adds runtime dependencies for Markdown preview rendering: `react-markdown` and `remark-gfm`.
- May require test tooling decisions because the repository currently has utility tests but no package-level test script or UI testing setup.
