## Context

The React client already consumes generated RTK Query hooks for `GET /api/v2/admin/users` and the approve, suspend, restore, and role-change admin mutations, but there is no page that uses them. The login flow in `useLogin` also replaces every backend failure with a generic credentials message, which hides the backend's meaningful pending-account response for local-auth sign-ins.

The change spans routing, settings navigation, auth error presentation, and a new user-facing UI with admin-enhanced controls. It also needs to respect existing access patterns: authentication is driven by JWT tokens in Redux, the settings section is nested under `/settings`, and the current generated list endpoint is admin-only even though the new product direction is to let every authenticated user open the Users tab.

## Goals / Non-Goals

**Goals:**
- Preserve backend-provided pending-account messaging during login when the backend returns that state.
- Add a Users tab under Settings that every authenticated user can open.
- Use the available user-list API for the tab contents and the existing admin mutations for approve, suspend, and restore actions.
- Reserve lifecycle-management controls for administrators while keeping the tab useful and accessible for non-admin users.
- Coordinate client behavior with backend authorization so non-admin users do not land on a forbidden-only experience.

**Non-Goals:**
- Changing backend authentication or user lifecycle rules.
- Designing a full role-management console unless the existing role mutation is explicitly brought into scope during implementation.
- Adding invitation, self-service approval, or bulk user operations.

## Decisions

### Preserve backend error semantics for pending login

The login hook should inspect the RTK Query error payload instead of always replacing it with a generic message. This keeps the current UX for invalid credentials while allowing the pending-approval message to pass through unchanged when the backend returns it.

Alternative considered: map all 403 responses to one static pending message. Rejected because it would incorrectly label suspended users or other forbidden states as pending.

### Build user management inside Settings as a shared tab

The existing Settings shell already owns configuration-style pages and tabs, so the Users screen should become another nested settings route instead of a separate top-level navigation item. This keeps user visibility and administration discoverable without expanding the main product navigation.

Alternative considered: create a standalone admin page outside Settings. Rejected because the requested scope is configuration-oriented and would require extra navigation design work.

### Reuse generated API hooks where possible and plan for authorization alignment

The generated hooks already cover the admin lifecycle operations, so the client should compose them in a dedicated settings page/container rather than adding handwritten API code. For the tab content itself, the product requirement now depends on a user-list API that non-admin users can call. If the backend broadens `GET /api/v2/admin/users` or introduces a new authenticated user-directory endpoint, the client should consume that generated hook and keep the admin mutations layered on top for privileged viewers.

Alternative considered: keep the tab visible to all users but show only a forbidden state for non-admins. Rejected because that technically exposes the tab but does not satisfy the intent that all users should have access to it.

### Gate management actions, not tab visibility

The client should render the Users tab for every authenticated user and rely on role-aware UI to decide whether approve, suspend, and restore controls are shown. Backend authorization remains the source of truth for lifecycle changes, and the client should still handle `403` responses defensively for privileged actions.

Alternative considered: continue hiding the tab for non-admins. Rejected because it conflicts with the updated product requirement.

## Risks / Trade-offs

- [Current-user role may not be loaded when the settings shell renders] → Mitigation: show the Users tab for authenticated users by default, then progressively enable or disable admin actions once role information resolves.
- [Login error parsing could become too backend-message-specific] → Mitigation: key off structured API error extraction first and only special-case the known pending approval text where needed.
- [User list mutations can leave stale UI state] → Mitigation: rely on RTK Query invalidation for admin-user tags and keep optimistic UI minimal for the first version.
- [Non-admin users currently lack an authorized list endpoint] → Mitigation: include backend/API generation work in scope before client implementation is considered complete.
- [Adding another settings tab can crowd the tab row on smaller screens] → Mitigation: follow the existing tab component pattern and keep the label short as `Users`.

## Migration Plan

1. Align backend authorization and generated API support so authenticated non-admin users can load the Users tab content.
2. Add the new settings route and Users tab for all authenticated users.
3. Update the login flow to preserve pending-account error messaging.
4. Implement the Users screen with shared read access and admin-only status actions.
5. Validate admin and non-admin behavior against the updated backend in local auth mode.

Rollback is low risk: revert the client-only route, tab, and login error handling changes. No persisted data migration is required.

## Open Questions

- Should the Users tab also expose role changes now that the generated `PATCH /api/v2/admin/users/{userId}/role` hook exists, or should the first version stay focused on status updates only?
- Will backend support come from broadening the existing admin list endpoint or from adding a separate authenticated user-directory endpoint?
