## 1. OpenAPI Generation and API Layer

- [x] 1.1 Make the main RTK Query codegen schema URL environment-selectable and document the localhost invocation for `http://localhost:3001/api/openapi.json`.
- [x] 1.2 Regenerate `generatedApi.ts` from the updated local backend and verify Skills metadata includes `id`, `source`, and `readOnly` while detail and artifact arguments use `id`.
- [x] 1.3 Review the full generated diff, retain contract-generated custom-skill mutation definitions, and confirm no issue #48 mutation hooks are consumed by application UI in this change.
- [x] 1.4 Change the custom Markdown and archive download endpoints to address artifacts by encoded `id` while carrying the skill name only for human-readable fallback filenames.

## 2. ID-Based Routing and Catalog Navigation

- [x] 2.1 Change the skill detail path and route parameter from `/skills/:name` to `/skills/:id` without altering name-based prompt routes.
- [x] 2.2 Update skill-card selection callbacks and catalog navigation to pass `skill.id` while continuing to render the returned title, description, and display metadata.
- [x] 2.3 Use `skill.id` as the stable React key for catalog entries so duplicate or renamed skill names do not affect component identity.
- [x] 2.4 Replace route-derived skill-name formatting in the detail page header and breadcrumb with a stable human-readable `Skill details` label that never exposes the persisted ID as a title.

## 3. Detail Loading and Artifact Actions

- [x] 3.1 Update the detail hook to read a trimmed, opaque `id`, invoke the regenerated ID-based detail query, and skip requests only when the route ID is absent or empty.
- [x] 3.2 Rename obsolete name-oriented hook results and validation flags to ID-oriented equivalents and preserve backend `404` mapping to the existing not-found state.
- [x] 3.3 Update the detail container to use the route ID for both artifact requests while using loaded metadata name and title for labels and download filename fallbacks.
- [x] 3.4 Keep download actions disabled until detail metadata supplies a human-readable name, and preserve the existing per-action loading, success, and error feedback.

## 4. Automated Coverage

- [x] 4.1 Add Skills fixtures containing distinct `id`, `name`, `title`, `source`, and `readOnly` fields, including renamed or duplicate-name cases where useful.
- [x] 4.2 Add catalog and card tests proving selection navigates to `/skills/{id}` and does not use the display name as route identity.
- [x] 4.3 Add detail hook or view tests proving direct ID-based loading, refresh-independent behavior, empty-ID query skipping, and backend `404` not-found rendering.
- [x] 4.4 Add download request tests proving Markdown and archive URLs use the persisted ID and remain on the authenticated RTK Query base API path.
- [x] 4.5 Add filename tests proving content-disposition values take precedence and missing headers fall back to human-readable name-based Markdown and archive filenames rather than IDs.

## 5. Verification

- [x] 5.1 Re-run API generation against the same local OpenAPI URL and confirm it produces no unexpected generated diff.
- [x] 5.2 Run `yarn lint`, `yarn test`, and `yarn build`, resolving all TypeScript, ESLint, test, and production build failures.
- [ ] 5.3 Manually verify catalog selection, browser refresh, direct `/skills/{id}` navigation, unknown-ID handling, and both artifact downloads against the updated backend.
- [ ] 5.4 Manually verify a custom skill remains reachable at the same ID route after its human-readable name changes and that the updated name appears in the detail UI and downloaded filename.
