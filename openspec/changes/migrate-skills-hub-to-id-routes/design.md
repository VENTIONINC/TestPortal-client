## Context

The Skills Hub client was implemented against a backend contract that used a finite set of skill names in detail and artifact paths. The current backend persists both system and custom skills, returns `id`, `name`, `source`, `readOnly`, and `downloadUrl` in catalog metadata, resolves detail and archive requests by ID, and exposes the complete ZIP package as the only downloadable/installable artifact. The former standalone Markdown download endpoint has been removed; Markdown returned by the detail response is preview/source content only.

The current client couples identity and presentation: it places `name` in `/skills/:name`, casts route values into a generated union of known names, builds download URLs from the name, uses the name as a React list key, and formats the route segment into page and breadcrumb labels. It also presents raw `SKILL.md` as a download even though that file can omit required scripts, templates, references, and assets from the portable package. These behaviors fail the new API contract and make a renamed custom skill appear to change identity.

The generated API configuration currently points to a remote development OpenAPI URL, while the updated contract is available from the local backend at `http://localhost:3001/api/openapi.json`. API generation must be able to select that document reproducibly.

## Goals / Non-Goals

**Goals:**

- Make the persisted backend ID the sole client identity for skill routing, request addressing, and list keys.
- Keep names and titles human-readable and independent from request identity.
- Regenerate the RTK Query API from the current backend contract.
- Preserve authenticated ZIP/blob download behavior through the catalog-provided `downloadUrl`, including readable filenames.
- Keep detail Markdown readable as preview/source content while removing every standalone Markdown download path and action.
- Support catalog navigation, browser refresh, direct ID-based URLs, renamed custom skills, and backend-driven not-found handling.
- Add focused automated coverage for the identity migration and artifact requests.

**Non-Goals:**

- Custom skill creation, replacement, deletion, upload forms, mutation permissions, or cache invalidation for mutations.
- Standalone raw Markdown downloads or representing detail Markdown as a complete installable skill.
- Supporting legacy `/skills/{name}` URLs or resolving a name to an ID on the client.
- Client-side validation that constrains IDs to UUID syntax.
- Changing prompt routes, which continue to use prompt names.
- Redesigning the broader application breadcrumb architecture beyond what the Skills detail route needs.

## Decisions

### Separate Stable Identity from Presentation Data

Use `SkillMetadata.id` for the catalog key, card selection callback, detail route, and detail request. Use the ID-based `SkillMetadata.downloadUrl` supplied by the catalog/detail response for the ZIP request. Continue using `SkillMetadata.name` and `title` for visible labels and readable ZIP filenames.

This preserves a route when a custom skill's name changes and avoids collisions if names cease to be globally unique. The alternative—looking up an ID from a route name—would require catalog state before detail loading, break direct navigation when names change, and retain the original coupling.

```text
catalog metadata
  ├─ id ───────────> React key ─> /skills/:id ─> detail request
  ├─ downloadUrl ──> authenticated complete ZIP request
  ├─ name ─────────> metadata label and fallback ZIP filename
  └─ title ────────> card and detail heading
```

### Regenerate the API and Consume Generated ID Types

Regenerate `generatedApi.ts` from the backend's current OpenAPI document and adopt the resulting ID-based detail/archive endpoint and argument types. Verify that generation removes the obsolete Markdown download endpoint and associated generated hook/types. Do not hand-edit generated endpoint declarations or retain obsolete name-union aliases.

Make the codegen schema URL selectable through an environment variable, with an explicit documented invocation for `http://localhost:3001/api/openapi.json`. Retain a safe project default so normal generation does not depend on an undocumented local patch to the configuration.

The regenerated document also contains create, replace, and delete endpoints for custom skills. Generated definitions may be committed as part of contract synchronization, but application code in this change will not import or expose those mutation hooks.

Alternative considered: manually patch only the generated Skills endpoint blocks. That would be faster but would violate the repository's code-generation contract and drift again on the next generation.

### Use a Non-Empty Opaque Route ID

Change the route template to `/skills/:id`. Trim the route parameter and skip the query only when it is absent or empty. Pass all other values to the backend and map a `404` response to the existing not-found state.

Although the current OpenAPI schema marks the ID as a UUID, treating it as opaque avoids duplicating server validation and remains compatible if the identifier format evolves. The alternative—client UUID validation—could reject future valid IDs and would create a second not-found policy.

Legacy name-based URLs receive no client redirect because the client cannot reliably distinguish a historical name from an ID or resolve renamed entries without additional backend support.

### Treat the Complete ZIP as the Only Downloadable Artifact

Remove the custom Markdown text-download endpoint, exported hook, download handler, loading/error state, and UI action. The Markdown string returned by the detail query continues to feed `SkillMarkdownPreview` but is never passed to the browser download helper or described as installable.

The remaining custom archive query will accept the server-provided `downloadUrl` and a human-readable fallback name. Its request uses `downloadUrl` through the authenticated `baseApi`; its response transform prefers the filename from `Content-Disposition`, then derives `<skill-name>.zip` from the name. The archive control remains disabled until detail metadata supplies both values.

Alternative considered: continue deriving `/api/v2/skills/{id}/archive` in the client. That route is currently equivalent, but consuming `downloadUrl` follows the catalog contract and avoids duplicating artifact URL construction. Retaining raw Markdown download was rejected because it can produce an incomplete, non-portable skill package and calls an endpoint the backend no longer exposes.

### Keep Route-Level Navigation Labels Independent of the ID

Use a stable human-readable detail label such as `Skill details` for the page header and breadcrumb while the returned `metadata.title` and `metadata.name` remain visible in the detail content. This prevents a UUID-like ID from being formatted as a title and works before the request completes or when it returns not found.

Alternative considered: fetch detail metadata at page-template level and pass a dynamic title into the header and breadcrumb. That adds data ownership and breadcrumb API changes outside the identity migration; it can be adopted later if product requirements explicitly require the skill title in global navigation chrome.

### Test at Navigation, Hook, and Request Boundaries

Add fixtures that include `id`, `name`, `source`, `readOnly`, and `downloadUrl`. Cover catalog selection with an ID, direct route loading with an ID, backend `404` mapping, and ZIP download triggers containing the provided URL and readable name. Add endpoint-level assertions for the archive request plus UI/API tests proving no raw Markdown download action, custom query, or `/download` request remains.

## Risks / Trade-offs

- [Legacy name URLs stop working] → Treat the route change as breaking and do not offer an unreliable client redirect without backend name-resolution support.
- [Code generation uses the wrong schema] → Add a documented environment-controlled schema URL and verify generated Skills types contain `id`, `source`, `readOnly`, and ID-based arguments.
- [Full regeneration introduces unrelated backend contract diffs] → Review generated changes separately and avoid wiring issue #48 mutation endpoints in application code.
- [Stale client code calls the removed Markdown endpoint] → Delete the query, hook state, action, UI control, and tests, then search for `/download` and Markdown-download symbols during verification.
- [Fallback ZIP downloads expose IDs as filenames] → Keep the readable name in custom archive arguments and test missing-header behavior.
- [A malformed or unexpected `downloadUrl` breaks archive retrieval] → Treat the backend metadata as the artifact contract, require a non-empty value before enabling the action, and cover the supplied relative API URL in tests.
- [Duplicate requests arise if page chrome fetches metadata] → Use a static human-readable detail label and keep data fetching in the existing detail hook.
- [Overly strict route validation rejects valid future IDs] → Validate only presence client-side and delegate identifier semantics to the backend.

## Migration Plan

1. Make the codegen schema URL selectable and regenerate the authenticated API against the updated local backend document.
2. Update Skills Hub routing and consumers to compile against generated ID-based endpoint and metadata types.
3. Remove the standalone Markdown download flow, update the ZIP request to consume `downloadUrl`, and add focused presence/absence tests.
4. Run API generation verification, lint, TypeScript checks, unit tests, and a production build.
5. Manually verify catalog-to-detail navigation, direct refresh, unknown IDs, a renamed custom skill, Markdown preview, the complete ZIP download, and the absence of a raw Markdown download action against the updated backend.

Rollback consists of reverting the client change and deploying it only with a backend that still supports name-based Skills routes. The updated backend does not provide a compatible client-only rollback path.

## Open Questions

None. Dynamic skill titles in the global header or breadcrumb are intentionally deferred; this change uses a stable human-readable detail label.
