## 1. Login Feedback

- [x] 1.1 Update the login hook to preserve backend pending-account errors while keeping generic messaging for ordinary authentication failures
- [ ] 1.2 Add or update login UI coverage so pending-account and invalid-credentials paths are both validated

## 2. Settings Navigation

- [x] 2.1 Add a `/settings/users` route, path constant, and Settings tab entry for the new Users experience
- [x] 2.2 Make the Users tab and route available to all authenticated users while scoping admin-only controls separately

## 3. User Management UI

- [x] 3.1 Add or generate the user-list query needed for authenticated non-admin access to the Users tab
- [x] 3.2 Create the Users settings page/container using the shared user-list query
- [x] 3.3 Render user rows with name, email, role, and status plus contextual approve, suspend, and restore actions for admins only
- [x] 3.4 Wire loading states, empty states, shared error states, and admin mutation feedback for user lifecycle updates

## 4. Validation

- [ ] 4.1 Verify the flow manually against the local backend with pending, active admin, and non-admin accounts
- [ ] 4.2 Run the relevant client checks such as lint and TypeScript validation after implementation
