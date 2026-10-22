# Tasks

## 1. Backend contract and persistence (completed in TestPortal-backend working tree)

- [x] 1.1 Add project-scoped environment profile persistence and owner-authorized CRUD endpoints in TestPortal-backend; backend change tasks report migration, profile CRUD, and isolation checks complete.
- [x] 1.2 Add six nullable environment snapshot fields to Manual Test Run start, detail, and history contracts; backend change tasks report profile resolution, override, explicit clearing, and snapshot checks complete.
- [x] 1.3 Update backend OpenAPI and API documentation for profile and run environment operations; backend change tasks report schema and documentation checks complete.

## 2. Client API integration

- [x] 2.1 Compare the served backend OpenAPI schema with the implemented backend contract, then regenerate RTK Query bindings; verify profile endpoints, optional `environmentProfileId`, and six run environment fields are present in generated types.
- [x] 2.2 Add project-scoped profile query/mutation integration and cache tags; verify profile CRUD refreshes the selected project's profile list without rewriting immutable run snapshots.

## 3. Profile management and run start

- [x] 3.1 Add profile selection and optional browser, operating system, device, API environment, build, and deployment fields to the Start manual run dialog; verify starting with no profile and with partially completed values.
- [x] 3.2 Add profile create, edit, and delete flows scoped to the current user and project from the start experience; verify validation, loading/error feedback, and owner-only profile visibility.
- [x] 3.3 Populate the four reusable fields from a selected profile while allowing per-run overrides and explicit clearing; verify build/deployment come only from the start request and the created run retains resolved values.

## 4. Run presentation and integration

- [x] 4.1 Display saved environment values in Manual Test Run details and compact environment context in history; verify empty values are omitted and older runs remain readable.
- [x] 4.2 Add or update client tests and user documentation for profile ownership, optional fields, and immutable run snapshots; verify the documented flow matches the UI.
- [x] 4.3 Run the focused Manual Test Run API and component checks plus the project's lint and type checks; verify the full client flow remains compatible with runs created before environment tracking.
