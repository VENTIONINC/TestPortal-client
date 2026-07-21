## 1. API Contract and Multipart Integration

- [x] 1.1 Verify the generated Skills mutation types and metadata against `http://localhost:3001/api/openapi.json`, regenerating through the configured codegen command only if the committed contract is stale.
- [x] 1.2 Add typed semantic create and replace mutations to the authenticated extended API that build `FormData` with `package`, trimmed `title`, and trimmed `category`, leave multipart content-type boundaries browser-managed, and invalidate the `Skills` tag.
- [x] 1.3 Re-export or wrap the generated stable-ID delete mutation under the feature-facing API surface while preserving `Skills` invalidation and existing authenticated 401 handling.
- [x] 1.4 Add request-level API tests proving create and replace send the required multipart fields, use the persisted ID for replacement, do not JSON-serialize the file, and trigger Skills cache invalidation.

## 2. Shared Package Form and Validation

- [x] 2.1 Add a reusable Zod-backed package form model that trims and requires title and category and requires exactly one ZIP selection without attempting to parse package contents in the browser.
- [x] 2.2 Build a reusable create/replace package form using the existing Chakra file-upload and dialog components, including selected-file feedback, clear/reselect behavior, inline field errors, and explanatory package metadata copy.
- [x] 2.3 Connect pending state to the form actions so create and replace show loading feedback and cannot be submitted more than once concurrently.
- [x] 2.4 Preserve title, category, selected file, and inline API feedback after failed submissions, and close or reset the form only after success or explicit cancellation.

## 3. Create Custom Skill Workflow

- [x] 3.1 Add a `Create skill` action to the Skills Hub catalog header and open the create dialog with empty title, category, and package inputs.
- [x] 3.2 Implement create submission through the semantic multipart mutation with shared backend-error extraction and success/error toaster feedback.
- [x] 3.3 On successful creation, close the dialog and keep the user on the refreshed catalog so the newly created skill is visible.
- [x] 3.4 Add catalog and create-dialog tests for opening, required-field and ZIP validation, multipart submission, loading protection, success refresh, 400 validation feedback, 409 duplicate-name feedback, and unexpected failure without form loss.

## 4. Stable-ID Replace Workflow

- [x] 4.1 Add replacement controls to the skill detail metadata panel only when `source === 'custom'` and `readOnly === false`.
- [x] 4.2 Open the shared package form in replace mode with current title and category values pre-populated, a required new ZIP, and copy explaining that package-derived metadata and resources are fully replaced.
- [x] 4.3 Submit replacement through the selected persisted ID, close only on success, remain on the same `/skills/{id}` route, and rely on Skills invalidation to refresh metadata, Markdown preview, and ZIP download information.
- [x] 4.4 Add replacement tests for pre-population, required package validation, stable-ID request addressing, duplicate-submit prevention, same-route continuity after a renamed package, refreshed preview/download metadata, and representative 400, 403, 404, 409, and unexpected errors without dialog loss.

## 5. Confirmed Delete Workflow and Read-Only Protection

- [x] 5.1 Add an alert-style delete confirmation for writable custom skills that identifies the selected skill, explains permanence, and supports explicit cancel and confirm actions.
- [x] 5.2 Implement stable-ID deletion with pending-state duplicate protection, inline/shared error feedback, and success feedback.
- [x] 5.3 After successful deletion, close the dialog and navigate to `/skills`; after failure, preserve the confirmation and current detail page.
- [x] 5.4 Ensure system-sourced or read-only skills omit active replace and delete controls while retaining Markdown preview and ZIP download behavior.
- [x] 5.5 Add detail and deletion tests for permission gating, cancellation without a request, confirmation by persisted ID, loading protection, successful navigation/cache refresh, and forbidden, not-found, and unexpected failures that retain page state.

## 6. Verification

- [x] 6.1 Run `yarn eslint`, `yarn tsc`, the focused Skills tests, the complete `yarn test` suite, and `yarn build`, resolving all failures.
- [ ] 6.2 Manually create a valid custom skill against `localhost:3001` and verify it appears in the refreshed catalog with working detail, Markdown preview, and authenticated ZIP download.
- [ ] 6.3 Manually replace a custom skill with changed frontmatter and content, verifying the persisted detail route remains unchanged and all metadata, preview, and downloaded archive content refresh.
- [ ] 6.4 Manually verify invalid ZIP feedback, duplicate-name conflict feedback, deletion cancellation and confirmation, post-delete catalog navigation, and the absence of mutation controls for system/read-only skills.
