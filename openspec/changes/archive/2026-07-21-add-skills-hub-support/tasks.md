## 1. Dependencies and API Layer

- [x] 1.1 Add `react-markdown` and `remark-gfm` runtime dependencies.
- [x] 1.2 Add Skills Hub download endpoints or endpoint overrides in the RTK Query extension layer for raw Markdown text and zip blob responses.
- [x] 1.3 Export download hooks/utilities that preserve existing authenticated API behavior and expose loading/error states for UI actions.
- [x] 1.4 Add a small browser download helper that creates object URLs, applies deterministic fallback filenames, and revokes object URLs after use.

## 2. Routing and Navigation

- [x] 2.1 Add Skills Hub paths for catalog and detail routes.
- [x] 2.2 Add protected Skills Hub routes wired through the existing route structure.
- [x] 2.3 Add a Skills navigation item near Prompts using the existing navigation menu pattern.
- [x] 2.4 Export new Skills pages from the pages index.

## 3. Skills Catalog UI

- [x] 3.1 Create a `components/skills` feature module with hooks, components, containers, and exports.
- [x] 3.2 Implement the catalog hook using the generated skills list query.
- [x] 3.3 Implement skill cards that show title, description, category, and optional version/license metadata.
- [x] 3.4 Implement catalog loading, empty, and error states consistent with existing UI patterns.
- [x] 3.5 Wire catalog card selection to the skill detail route.

## 4. Skill Detail and Markdown Preview

- [x] 4.1 Implement a detail hook using the generated skill detail query with safe handling for route-provided skill names.
- [x] 4.2 Implement the detail layout with metadata, compatibility/license/version display, and download controls.
- [x] 4.3 Implement a themed Markdown preview component using `react-markdown` and `remark-gfm`.
- [x] 4.4 Ensure Markdown links open safely and code blocks, tables, lists, and headings remain readable in light and dark modes.
- [x] 4.5 Implement detail loading, not-found, and error states.

## 5. Download Actions

- [x] 5.1 Wire the raw `SKILL.md` download action to the authenticated Markdown download endpoint.
- [x] 5.2 Wire the zip archive download action to the authenticated archive download endpoint.
- [x] 5.3 Show per-action loading and failure feedback without breaking the detail page.
- [x] 5.4 Verify unauthorized download responses use the existing auth/session handling path.

## 6. Verification

- [x] 6.1 Run `yarn lint` and resolve any TypeScript or ESLint failures.
- [x] 6.2 Manually verify the catalog populated, empty, and failed states.
- [x] 6.3 Manually verify detail success, unknown skill, Markdown preview, and failed detail states.
- [x] 6.4 Manually verify both authenticated download actions produce usable files with expected fallback filenames.
- [x] 6.5 Decide whether to add minimal test tooling for UI/API behavior or document the current repository test-script gap for this change.
