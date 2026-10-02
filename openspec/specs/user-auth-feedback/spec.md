# User Authentication Feedback

## Purpose

Provide clear pending-account authentication feedback while preserving existing login and recovery behavior.

## Requirements

### Requirement: Pending login errors must be shown to the user
The client SHALL preserve and display the backend-authored pending-account login error when authentication fails because the account is awaiting administrator approval.

#### Scenario: Pending account login attempt
- **WHEN** a user submits valid credentials for an account whose backend status is pending
- **THEN** the login form shows the pending-approval error returned by the backend
- **THEN** the client does not replace that error with a generic invalid-credentials message

#### Scenario: Invalid credentials login attempt
- **WHEN** a user submits incorrect login credentials
- **THEN** the login form shows a generic authentication failure message
- **THEN** the client does not imply that the account is pending approval

### Requirement: Login recovery paths must remain intact
The client SHALL keep the existing successful-login behavior unchanged while adding pending-account feedback.

#### Scenario: Successful login
- **WHEN** a user submits valid credentials for an active account
- **THEN** the client stores the returned tokens
- **THEN** the client resets application state and navigates to the root route
