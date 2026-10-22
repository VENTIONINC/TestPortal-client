## 1. Login Feedback

- [x] 1.1 Update the login hook to preserve backend pending-account errors while keeping generic messaging for ordinary authentication failures
- [x] 1.2 Add or update login UI coverage so pending-account and invalid-credentials paths are both validated

## 2. Settings Navigation

- [x] 2.1 Add a `/settings/users` route, path constant, and Settings tab entry for the new Users experience
- [x] 2.2 Show the Users tab only to administrators and keep all other settings tabs available to regular users
- [x] 2.3 Make the settings default route and direct `/settings/users` navigation role-aware so non-admins are redirected to an allowed settings tab

## 3. User Management UI

- [x] 3.1 Reuse the existing admin user-list query for the Users tab
- [x] 3.2 Create the Users settings page/container using the admin user-list query
- [x] 3.3 Render user rows with name, email, role, and status plus contextual approve, suspend, and restore actions for admins only
- [x] 3.4 Remove the non-admin access-error path and keep loading, empty, admin error states, and mutation feedback focused on administrator flows

## 4. Validation

- [x] 4.1 Verify the flow manually against the local backend with pending, active admin, and non-admin accounts
- [x] 4.2 Run the relevant client checks such as lint and TypeScript validation after implementation

Manual QA confirmed by the user on 2026-09-07.
