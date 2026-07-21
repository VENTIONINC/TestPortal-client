## Context

The client already provides an authenticated Skills Hub catalog and stable-ID detail route. Catalog metadata contains `id`, `source`, `readOnly`, and `downloadUrl`; the detail response adds Markdown preview content. The generated RTK Query API includes create, replace, and delete definitions with `Skills` tag invalidation, but its multipart schema is represented as a plain TypeScript object and its generated query functions pass that object directly as the request body. Consuming those upload hooks without adaptation would cause `fetchBaseQuery` to JSON-serialize the payload instead of emitting browser-managed multipart boundaries.

The backend accepts one ZIP field named `package` and two non-empty text fields named `title` and `category`. It derives name, description, and optional package metadata from `SKILL.md`, rejects unsafe or malformed packages, prevents duplicate persisted frontmatter names, preserves the selected persisted ID during replacement, and forbids replacement or deletion of read-only system skills.

The repository already has Redux-managed dialogs, React Hook Form with Zod validation, Chakra file-upload components, authenticated `baseApi` behavior, toaster feedback, and a shared API error extractor. The change should extend those patterns rather than create a parallel state or modal system.

## Goals / Non-Goals

**Goals:**

- Let authenticated users create shared custom skills from a ZIP package plus catalog title and category.
- Let users replace or delete only writable custom skills from the stable-ID detail page.
- Preserve the same detail route through replacement and refresh all catalog, metadata, Markdown preview, and download information affected by a successful mutation.
- Serialize uploads as real `multipart/form-data` without manually setting the `Content-Type` boundary.
- Keep form and page state intact when a mutation fails and present useful backend or fallback errors.
- Prevent duplicate submissions and explicitly confirm destructive deletion.
- Reuse existing component, dialog, validation, API, and testing conventions.

**Non-Goals:**

- Editing only catalog metadata without providing a replacement ZIP.
- Parsing or validating the ZIP contents in the browser beyond selecting one ZIP file; package safety remains a backend responsibility.
- Changing skill identity, adding client-side name-to-ID resolution, or supporting legacy name-based routes.
- Installing, executing, versioning, sharing with selected users, or exposing arbitrary package filesystem access.
- Adding administrator-only authorization; the backend currently permits any authenticated user to manage writable custom skills.
- Adding mutation controls to catalog cards or changing the broader Skills Hub layout.

## Decisions

### Keep create in the catalog and mutations for an existing skill in detail

Place a `Create skill` action in the catalog header. On successful creation, close the dialog, show success feedback, invalidate the Skills cache, and keep the user on the refreshed catalog so the new entry is visible.

Place `Replace skill` and `Delete skill` actions in the detail metadata panel. This avoids click conflicts in the existing fully selectable cards, keeps destructive actions near complete metadata, and gives replacement direct access to the current title and category for pre-population.

Alternative considered: card-level action menus. They make management faster for bulk workflows, but bulk management is not in scope and nested actions inside a clickable card add interaction and accessibility complexity.

### Treat replacement as a complete package operation

Use one reusable package form for create and replace. Create starts with empty title and category; replace pre-populates them from current metadata. Both require a newly selected ZIP and submit exactly `package`, trimmed `title`, and trimmed `category`. The replace dialog explains that name, description, version, license, compatibility, Markdown, and bundled resources come from the uploaded package.

Alternative considered: allow metadata-only editing. The backend exposes only full replacement, so simulating partial editing would require downloading and rebuilding the current archive in the browser or a new backend endpoint.

### Add an explicit FormData API boundary

Add semantic create and replace mutations in the authenticated extended API layer, using generated response and metadata types while constructing a `FormData` instance with the three contract field names. Leave the generated file unmodified and do not set `Content-Type`; the browser must add the multipart boundary. The generated delete mutation can be consumed directly because it has no multipart body, or re-exported under a semantic name alongside the custom mutations.

All successful mutations invalidate the general `Skills` tag already used by catalog and detail queries. A broad tag is appropriate because replacement can change catalog sorting or labels as well as detail Markdown, while deletion removes the entity entirely.

Alternative considered: cast `FormData` into the generated `SkillPackageUpload` argument at each call site. That is shorter but weakens type safety, spreads knowledge of a code-generation mismatch into UI hooks, and is easier to regress during future form work.

### Gate controls from metadata and retain server enforcement

Render replacement and deletion controls only when `source === "custom"` and `readOnly === false`. System or read-only skills continue to expose preview and ZIP download behavior but no active mutation controls. The backend remains authoritative; a `403` response caused by stale or inconsistent metadata is displayed without closing the dialog or damaging the page.

Alternative considered: disable visible controls for system skills. Hiding them keeps browse-only skills uncluttered and satisfies the requirement that they never expose active edit or delete actions. Source/read-only metadata can still be shown as a descriptive badge if useful.

### Use dialogs with local form state and inline mutation feedback

Use the existing Redux dialog portal to open create, replace, and delete dialogs. Use React Hook Form and a Zod schema for trimmed non-empty title/category values, with Chakra's file-upload state for exactly one ZIP. Submit handlers build the semantic mutation input, await `.unwrap()`, and close only on success.

Mutation errors use the shared API error extractor, which preserves backend `{ error }` strings before status-based fallbacks. Display the message inside the dialog and optionally mirror it in a toaster. Keeping errors in the dialog ensures 400 validation, 409 conflict, 403 forbidden, 404 stale-resource, and unexpected failures do not discard entered values or the chosen file. Existing base API behavior continues to own 401 refresh/logout handling.

The submit or confirm action uses mutation `isLoading` state and remains disabled while pending. Delete confirmation identifies the selected skill and states that deletion is permanent.

### Navigate only after successful deletion

Replacement remains on `/skills/{id}`; Skills invalidation refetches the same ID and displays updated metadata, Markdown, and ZIP information. Successful deletion shows feedback and navigates to `/skills`, avoiding a refetch-driven 404 on the now-invalid detail route. Failed deletion leaves the dialog and detail page intact.

Alternative considered: stay on the deleted detail route and render not found. That is technically consistent but creates an avoidable dead end immediately after a user-initiated success.

### Keep package validation authoritative on the server

The client validates presence, non-empty trimmed metadata, a single selection, and ZIP filename/type cues. It does not unzip content or duplicate backend safety rules and size/file-count limits that are not represented in the OpenAPI contract. Detailed backend validation messages are surfaced to the user.

Alternative considered: duplicate every current backend package rule in Zod or browser ZIP parsing. That adds bundle weight, can drift from the security boundary, and still cannot replace server validation.

## Risks / Trade-offs

- [Generated multipart mutations appear usable but serialize incorrectly] → Cover the semantic extended endpoints with request-level tests that assert a `FormData` body, required fields, and absence of a manually forced content type.
- [Broad `Skills` invalidation causes multiple refetches] → Accept the small cost for a low-volume catalog because it guarantees replacement content and catalog metadata stay synchronized.
- [Stale metadata briefly exposes a mutation control] → Treat UI gating as presentation only and display backend 403/404 errors without closing the dialog.
- [Backend package restrictions are not discoverable before upload] → Explain the required ZIP/SKILL.md shape and surface exact backend validation messages; add client limits only after they are published in the API contract.
- [A replacement changes the frontmatter name] → Continue addressing the entity exclusively by persisted ID and derive updated filenames and labels from refetched metadata.
- [Overlapping unarchived Skills Hub changes complicate later archival] → Keep this as a separate `custom-skill-management` capability and archive predecessor Skills Hub changes in dependency order before or alongside final integration.

## Migration Plan

1. Confirm the ID-based Skills Hub client and generated backend contract are present.
2. Add semantic multipart mutations and request-level tests without modifying generated endpoint code.
3. Add the shared package form and create/replace dialog workflows.
4. Add writable-skill detail actions and delete confirmation/navigation.
5. Add component and hook coverage for permissions, errors, loading, cache refresh, and stable-ID continuity.
6. Run lint, TypeScript checks, unit tests, production build, and authenticated manual verification against `localhost:3001`.

Rollback consists of reverting the client management UI and semantic mutations. The existing browse, preview, and ZIP download paths remain compatible with the backend throughout.

## Open Questions

None. Creation remains on the refreshed catalog, existing-skill actions live on the detail page, and package validation beyond basic form checks remains server-owned.
