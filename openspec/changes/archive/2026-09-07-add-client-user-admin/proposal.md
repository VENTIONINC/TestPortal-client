## Why

The client currently treats all login failures the same, which hides the actionable "pending administrator approval" state returned by the backend for local-auth users. The settings experience also exposes no UI for user visibility and administration even though the backend and generated client API already support listing users and changing their status for administrators. During implementation, we also confirmed that exposing the Users tab to regular users only leads them to an avoidable access error because the user-directory endpoints remain administrator-only.

## What Changes

- Surface a specific login error state when the backend rejects authentication because the user is pending approval.
- Add a Users tab to the Settings area for administrators.
- Hide the Users tab from non-admin authenticated users and redirect them away from `/settings/users` instead of showing an access error screen.
- Show the user list in the client and expose status management actions for pending, active, and suspended users for administrators only.

## Capabilities

### New Capabilities
- `user-auth-feedback`: Display backend-authored pending-account feedback during login so users understand that approval is required before access is granted.
- `admin-user-management`: Provide an administrator-only Users settings experience for reviewing accounts and managing lifecycle state.

### Modified Capabilities

None.

## Impact

- Affected client areas: login hook/UI, shared API error handling, settings navigation, router paths, and new user-management settings components.
- Affected APIs: login endpoint error handling plus administrator user-list and lifecycle-management endpoints.
- No backend authorization expansion is required for regular users because the client will keep the Users experience admin-only.
