## ADDED Requirements

### Requirement: Authenticated users must be able to access a Users settings tab
The client SHALL provide a Users tab within Settings that every authenticated user can open.

#### Scenario: Authenticated user opens Settings
- **WHEN** an authenticated user opens the Settings area
- **THEN** the tab list includes a `Users` tab
- **THEN** selecting that tab navigates to the user-management settings route

#### Scenario: Non-admin opens Users route
- **WHEN** an authenticated non-admin user navigates to `/settings/users`
- **THEN** the client renders the Users experience instead of redirecting away from it

### Requirement: Authenticated users must be able to review the user list
The client SHALL show the backend user list with each user's lifecycle status and role within the Users tab for authenticated viewers.

#### Scenario: User list loads successfully for non-admin
- **WHEN** an authenticated non-admin user visits the Users settings route
- **THEN** the client requests the authorized user-list data from the backend
- **THEN** the page displays each returned user's name, email, status, and role

#### Scenario: User list loads successfully for admin
- **WHEN** an authenticated admin user visits the Users settings route
- **THEN** the client requests the admin user list from the backend
- **THEN** the page displays each returned user's name, email, status, and role

#### Scenario: User list request is unauthorized for an authenticated viewer
- **WHEN** the backend rejects the user-list request with a forbidden response
- **THEN** the client shows an actionable access error state
- **THEN** the client does not render misleading empty content as if the request succeeded

### Requirement: Only administrators may change user lifecycle state
The client SHALL expose the backend-supported lifecycle actions for pending, active, and suspended users only to administrators.

#### Scenario: Non-admin views Users tab
- **WHEN** an authenticated non-admin user views the Users tab
- **THEN** the client does not show approve, suspend, or restore controls

#### Scenario: Approve pending user
- **WHEN** an admin chooses to approve a pending user
- **THEN** the client calls the approve user endpoint for that user
- **THEN** the page refreshes to show the user as active after a successful response

#### Scenario: Suspend active user
- **WHEN** an admin chooses to suspend an active user
- **THEN** the client calls the suspend user endpoint for that user
- **THEN** the page refreshes to show the user as suspended after a successful response

#### Scenario: Restore suspended user
- **WHEN** an admin chooses to restore a suspended user
- **THEN** the client calls the restore user endpoint for that user
- **THEN** the page refreshes to show the user as active after a successful response

#### Scenario: Lifecycle update fails
- **WHEN** an admin submits a lifecycle action and the backend returns an error
- **THEN** the client shows an actionable error message
- **THEN** the page keeps the current known user state visible
