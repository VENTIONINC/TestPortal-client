## Context

The React client already consumes generated RTK Query hooks for `GET /api/v2/admin/users` and the approve, suspend, restore, and role-change admin mutations, but there is no page that uses them. The login flow in `useLogin` also replaces every backend failure with a generic credentials message, which hides the backend's meaningful pending-account response for local-auth sign-ins.

The change spans routing, settings navigation, auth error presentation, and a new admin-facing UI. It also needs to respect existing access patterns: authentication is driven by JWT tokens in Redux, the settings section is nested under `/settings`, and the current generated list endpoint is admin-only. Since that authorization model already matches the intended ownership of user management, the client should avoid advertising the Users experience to regular users instead of rendering a predictable access failure.

## Goals / Non-Goals

**Goals:**
- Preserve backend-provided pending-account messaging during login when the backend returns that state.
- Add a Users tab under Settings for administrators only.
- Use the existing admin-only user-list API and admin mutations for approve, suspend, and restore actions.
- Prevent non-admin users from seeing the Users tab or landing on `/settings/users`.
- Keep the admin experience aligned with the existing backend authorization model.

**Non-Goals:**
- Changing backend authentication or user lifecycle rules.
- Broadening backend user-directory access for non-admin users.
- Designing a full role-management console unless the existing role mutation is explicitly brought into scope during implementation.
- Adding invitation, self-service approval, or bulk user operations.

## Decisions

### Preserve backend error semantics for pending login

The login hook should inspect the RTK Query error payload instead of always replacing it with a generic message. This keeps the current UX for invalid credentials while allowing the pending-approval message to pass through unchanged when the backend returns it.

Alternative considered: map all 403 responses to one static pending message. Rejected because it would incorrectly label suspended users or other forbidden states as pending.

### Build user management inside Settings as an admin tab

The existing Settings shell already owns configuration-style pages and tabs, so the Users screen should become another nested settings route instead of a separate top-level navigation item. This keeps user administration discoverable for privileged users without expanding the main product navigation.

Alternative considered: create a standalone admin page outside Settings. Rejected because the requested scope is configuration-oriented and would require extra navigation design work.

### Reuse generated admin hooks without expanding read access

The generated hooks already cover the administrator list and lifecycle operations, so the client should compose them in a dedicated settings page/container rather than adding handwritten API code. Because the Users experience will stay administrator-only, there is no need to add a shared directory endpoint or broaden `GET /api/v2/admin/users` access for non-admin viewers.

Alternative considered: add a separate non-admin directory endpoint. Rejected because it introduces extra backend and generated-client work that is no longer needed for the desired UX.

### Gate both tab visibility and route access

The client should render the Users tab only when the current user is an administrator, and the `/settings/users` route should redirect non-admin viewers to the first allowed settings destination instead of rendering an access-denied screen. Lifecycle actions remain admin-only within the page, and backend authorization stays the source of truth for mutations.

Alternative considered: keep the tab visible to everyone and show a forbidden state inside the page. Rejected because it creates a dead-end experience for regular users and advertises functionality they cannot use.

### Choose settings defaults based on the first allowed tab

The settings index route currently redirects to `/settings/users`, which only works if every authenticated user can access that page. After scoping Users to administrators, the default route must become role-aware so admins still land on Users while non-admins land on another stable settings tab such as MCP.

Alternative considered: redirect non-admin users from `/settings/users` to a not-found page. Rejected because the route is valid within the application; it is simply not available for that user's role, so a first-allowed-tab redirect is clearer.

## Risks / Trade-offs

- [Current-user role may not be loaded when the settings shell renders] → Mitigation: delay role-sensitive tab rendering and default-route decisions until the current-user query resolves, or fall back to a universally available tab.
- [Login error parsing could become too backend-message-specific] → Mitigation: key off structured API error extraction first and only special-case the known pending approval text where needed.
- [User list mutations can leave stale UI state] → Mitigation: rely on RTK Query invalidation for admin-user tags and keep optimistic UI minimal for the first version.
- [Adding another settings tab can crowd the tab row on smaller screens] → Mitigation: follow the existing tab component pattern and keep the label short as `Users`.

## Migration Plan

1. Update the login flow to preserve pending-account error messaging.
2. Add the new settings route and Users tab for administrators.
3. Make the settings index redirect and `/settings/users` route role-aware so non-admins land on an allowed tab.
4. Implement the Users screen with admin-only list access and lifecycle actions.
5. Validate admin and non-admin behavior against the current backend in local auth mode.

Rollback is low risk: revert the client-only route, tab, and login error handling changes. No persisted data migration is required.

## Open Questions

- Should the Users tab also expose role changes now that the generated `PATCH /api/v2/admin/users/{userId}/role` hook exists, or should the first version stay focused on status updates only?
