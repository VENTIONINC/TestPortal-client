## Why

The client currently treats all login failures the same, which hides the actionable "pending administrator approval" state returned by the backend for local-auth users. The settings experience also exposes no UI for user visibility and administration even though the backend and generated client API already support listing users and changing their status for administrators.

## What Changes

- Surface a specific login error state when the backend rejects authentication because the user is pending approval.
- Add a Users tab to the Settings area for all authenticated users.
- Show the user list in the client and expose status management actions for pending, active, and suspended users only when the viewer has admin permissions.
- Align the client experience with backend authorization so non-admin users can open the Users tab without hitting an immediate dead end.

## Capabilities

### New Capabilities
- `user-auth-feedback`: Display backend-authored pending-account feedback during login so users understand that approval is required before access is granted.
- `admin-user-management`: Provide a Users settings experience that all authenticated users can open, while reserving lifecycle management actions for administrators.

### Modified Capabilities

None.

## Impact

- Affected client areas: login hook/UI, shared API error handling, settings navigation, router paths, and new user-management settings components.
- Affected APIs: login endpoint error handling plus user-list authorization and lifecycle-management endpoints.
- Backend and generated API updates may be required so non-admin users can access the Users tab without relying on admin-only endpoints.
