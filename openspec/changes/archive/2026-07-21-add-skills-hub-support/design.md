## Context

The client is a React + TypeScript + Vite application using Chakra UI and RTK Query. The generated authenticated API layer already includes Skills Hub endpoints for listing skills, fetching skill details, downloading raw Markdown, and downloading zip archives. Existing prompt UI provides a nearby pattern for a catalog page and a detail/build page, but Skills Hub differs because it previews Markdown content and performs authenticated file downloads instead of generating prompt text.

The backend catalog is predefined. The client does not need skill creation, editing, upload, install management, or arbitrary filesystem access.

## Goals / Non-Goals

**Goals:**

- Provide a first-class authenticated Skills Hub navigation entry and routes.
- Reuse existing RTK Query/auth refresh behavior for list, detail, and download requests.
- Render skill cards with title, description, category, and optional version/license metadata.
- Render a detail view with metadata, Markdown preview, and raw Markdown/zip download actions.
- Handle loading, empty, not-found, unauthorized/session, and generic error states consistently with current UI patterns.
- Add Markdown rendering dependencies with permissive licensing: `react-markdown` and `remark-gfm`.

**Non-Goals:**

- Skill creation, editing, uploading, deletion, installation, or execution.
- Arbitrary local filesystem browsing.
- Server-side Markdown transformation.
- Rich syntax highlighting beyond basic Markdown/code-block styling.

## Decisions

### Add a Dedicated Skills Hub Area

Add `PATHS.SKILLS` and `PATHS.SKILL_DETAILS` routes, backed by `SkillsPage` and `SkillDetailsPage`, and expose a `Skills` navigation item near `Prompts`. This keeps skills discoverable as a first-class tool while preserving the existing prompts workflow.

Alternative considered: merge skills into the existing Prompts page. That would reduce route count, but it mixes two distinct user intents: prompt generation and skill artifact discovery/download.

### Mirror Prompt Component Organization

Create a `components/skills` feature area with catalog, card, detail, Markdown preview, metadata, and download controls. This follows the existing feature-domain layout used by prompts, results, and issues, and keeps UI-specific logic away from generated API files.

Alternative considered: place everything directly under `pages/Skills`. That is faster initially, but makes reuse and focused testing harder as detail/download behavior grows.

### Override Download Endpoints for Text and Blob Responses

Use generated list/detail endpoints as-is. Add custom lazy download endpoints or endpoint overrides in the existing RTK Query extension layer so:

- raw `SKILL.md` uses `responseHandler: 'text'`
- archive download uses `responseHandler: (response) => response.blob()`

The download hooks should still use `baseApi` so authorization headers and token refresh behavior are preserved. Download handlers then create object URLs and trigger browser downloads using backend filenames when available, or deterministic fallbacks such as `<skill-name>-SKILL.md` and `<skill-name>.zip`.

Alternative considered: use direct `fetch()` from components. That would require duplicating auth header and token refresh behavior already implemented in `baseApi`, increasing the risk of unauthorized download failures.

### Render Markdown Safely in React

Use `react-markdown` for Markdown rendering and `remark-gfm` for GitHub-flavored Markdown features such as tables, task lists, and autolinks. `react-markdown` renders React elements rather than using `dangerouslySetInnerHTML`, which fits the client safety posture. Configure Chakra-styled component mappings for headings, paragraphs, lists, code, links, blockquotes, and tables so previews match the app theme.

Alternative considered: render Markdown as raw preformatted text. That avoids a dependency, but gives a poor preview for real `SKILL.md` files with headings, tables, lists, and links.

### Keep Frontmatter Visible or Neutral

Initial implementation can render the full `SKILL.md` content returned by the API. If YAML frontmatter renders awkwardly, add a small display choice: show frontmatter in a raw/code block at the top or strip it from the rendered preview while keeping it available in a raw text view/download. Do not parse frontmatter as authoritative metadata because the API already returns structured metadata.

Alternative considered: add frontmatter parsing as part of the first pass. That adds another dependency and duplicates server-provided metadata without creating user value for browse/download scope.

## Risks / Trade-offs

- Generated skill detail arg types currently enumerate known skill names, while list metadata uses `name: string` -> use a local type guard/cast or regenerated API types that keep runtime catalog navigation ergonomic.
- Binary downloads may fail if implemented with the generated query defaults -> override response handlers before wiring UI actions.
- Markdown links could navigate users away from the app -> render links with `target="_blank"` and `rel="noreferrer"` for external URLs.
- Large Markdown files could create dense detail pages -> constrain preview layout with scrollable/code-safe styling and preserve a raw download path.
- The repo currently lacks a package-level test script and UI testing dependencies -> either add a minimal Vitest/test-library setup or document manual validation if automated UI tests are out of scope for this change.
