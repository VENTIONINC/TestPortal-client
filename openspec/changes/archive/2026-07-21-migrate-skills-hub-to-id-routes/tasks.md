## 1. OpenAPI Generation and API Layer

- [x] 1.1 Make the main RTK Query codegen schema URL environment-selectable and document the localhost invocation for `http://localhost:3001/api/openapi.json`.
- [x] 1.2 Regenerate `generatedApi.ts` from the latest local backend and verify Skills metadata includes `id`, `source`, `readOnly`, and `downloadUrl`, detail/archive arguments use `id`, and no Markdown download endpoint is generated.
- [x] 1.3 Review the full generated diff, retain contract-generated custom-skill mutation definitions, and confirm no issue #48 mutation hooks are consumed by application UI in this change.
- [x] 1.4 Remove the custom Markdown download endpoint and exports, then update the custom ZIP archive endpoint to request the metadata-provided `downloadUrl` while carrying the skill name only for its human-readable fallback filename.

## 2. ID-Based Routing and Catalog Navigation

- [x] 2.1 Change the skill detail path and route parameter from `/skills/:name` to `/skills/:id` without altering name-based prompt routes.
- [x] 2.2 Update skill-card selection callbacks and catalog navigation to pass `skill.id` while continuing to render the returned title, description, and display metadata.
- [x] 2.3 Use `skill.id` as the stable React key for catalog entries so duplicate or renamed skill names do not affect component identity.
- [x] 2.4 Replace route-derived skill-name formatting in the detail page header and breadcrumb with a stable human-readable `Skill details` label that never exposes the persisted ID as a title.

## 3. Detail Loading and Artifact Actions

- [x] 3.1 Update the detail hook to read a trimmed, opaque `id`, invoke the regenerated ID-based detail query, and skip requests only when the route ID is absent or empty.
- [x] 3.2 Rename obsolete name-oriented hook results and validation flags to ID-oriented equivalents and preserve backend `404` mapping to the existing not-found state.
- [x] 3.3 Update the detail container and download hook to pass `metadata.downloadUrl` and the human-readable skill name to the ZIP action while keeping Markdown content in the preview only.
- [x] 3.4 Remove the raw Markdown download button, handler, loading/error state, toaster messages, and browser-download behavior; preserve ZIP loading, success, and error feedback.

## 4. Automated Coverage

- [x] 4.1 Update Skills fixtures to include distinct `id`, `name`, `title`, `source`, `readOnly`, and ID-based `downloadUrl` fields, including renamed or duplicate-name cases where useful.
- [x] 4.2 Add catalog and card tests proving selection navigates to `/skills/{id}` and does not use the display name as route identity.
- [x] 4.3 Add detail hook or view tests proving direct ID-based loading, refresh-independent behavior, empty-ID query skipping, and backend `404` not-found rendering.
- [x] 4.4 Add ZIP request tests proving the action uses the metadata-provided `downloadUrl` through the authenticated RTK Query base API and retrieves a blob.
- [x] 4.5 Add tests proving the raw Markdown download action/query is absent and detail Markdown remains available only to the preview.
- [x] 4.6 Add ZIP filename tests proving content-disposition values take precedence and missing headers fall back to a human-readable name-based archive filename rather than an ID.

## 5. Verification

- [x] 5.1 Re-run API generation against the latest local OpenAPI URL and confirm it produces no unexpected generated diff or `/api/v2/skills/{id}/download` definitions.
- [x] 5.2 Search client and test code for obsolete Markdown-download symbols and `/download` skill paths, then run `yarn lint`, `yarn test`, and `yarn build`, resolving all failures.
- [x] 5.3 Manually verify catalog selection, browser refresh, direct `/skills/{id}` navigation, unknown-ID handling, Markdown preview, ZIP download through `downloadUrl`, and the absence of a raw Markdown download action.
- [x] 5.4 Manually verify a custom skill remains reachable at the same ID route after its human-readable name changes and that the updated name appears in the detail UI and ZIP filename.
