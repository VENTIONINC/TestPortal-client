# Admin User Management

## Purpose

Enable authenticated administrators to review users and manage their lifecycle through the Users settings tab.

## Requirements

### Requirement: Only administrators may access the Users settings tab
The client SHALL provide a Users tab within Settings only for authenticated administrators.

#### Scenario: Administrator opens Settings
- **WHEN** an authenticated administrator opens the Settings area
- **THEN** the tab list includes a `Users` tab
- **THEN** selecting that tab navigates to the user-management settings route

#### Scenario: Non-admin opens Settings
- **WHEN** an authenticated non-admin user opens the Settings area
- **THEN** the tab list does not include a `Users` tab

#### Scenario: Non-admin opens Users route directly
- **WHEN** an authenticated non-admin user navigates to `/settings/users`
- **THEN** the client redirects the user to an allowed settings route
- **THEN** the client does not show an access-denied error screen for the hidden tab

### Requirement: Administrators must be able to review the user list
The client SHALL show the backend user list with each user's lifecycle status and role within the Users tab for authenticated administrators.

#### Scenario: User list loads successfully for admin
- **WHEN** an authenticated admin user visits the Users settings route
- **THEN** the client requests the admin user list from the backend
- **THEN** the page displays each returned user's name, email, status, and role

#### Scenario: User list request fails for admin
- **WHEN** the backend rejects the admin user-list request
- **THEN** the client shows an actionable access error state
- **THEN** the client does not render misleading empty content as if the request succeeded

### Requirement: Only administrators may change user lifecycle state
The client SHALL expose the backend-supported lifecycle actions for pending, active, and suspended users only to administrators.

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
