# Spec Delta

## Purpose

Enables users to capture the environment used by a Manual Test Run and reuse project-specific environment settings through personal profiles. Historical runs retain the values recorded when they were started.

## ADDED Requirements

### Requirement: Users can manage personal project environment profiles
The system SHALL let an authenticated user create, list, update, and delete environment profiles owned by that user within a project they may access. Each profile SHALL have a nonblank name and optional browser, operating system, device, and API environment values.

#### Scenario: Create a project profile
- **WHEN** a user saves a profile with a name and optional browser, OS, device, and API environment values for a project
- **THEN** the profile is available to that user for future runs in that project

#### Scenario: Profiles are private to their owner
- **WHEN** another user requests a profile they do not own
- **THEN** the system does not disclose or allow modification of that profile

#### Scenario: Profile belongs to another project
- **WHEN** a user requests or changes a profile through a different project
- **THEN** the system does not disclose or modify that profile

#### Scenario: Project is inaccessible
- **WHEN** a user requests profile operations for a project they cannot access
- **THEN** the system rejects the operation without disclosing profile data

#### Scenario: Delete a profile used by previous runs
- **WHEN** a user deletes an environment profile
- **THEN** the profile is removed from future profile selection and existing run environment snapshots remain unchanged

### Requirement: Users can start a run with optional environment values
The system SHALL allow a user to start a Manual Test Run with any subset of browser, operating system, device, API environment, build, and deployment values, or with no environment values.

#### Scenario: Start with manually entered environment values
- **WHEN** a user enters any subset of environment values and starts a run
- **THEN** the run is created with those values and missing values remain empty

#### Scenario: Start without environment values
- **WHEN** a user leaves environment fields empty and starts a run
- **THEN** the run starts without requiring an environment profile or environment values

### Requirement: Users can apply a profile to a new run
The system SHALL allow a user to select one of their project profiles when starting a run. Omitted reusable fields SHALL inherit from the profile, explicitly supplied values SHALL override it, and build and deployment SHALL come only from the start request.

#### Scenario: Select a saved profile
- **WHEN** a user selects one of their profiles in the start dialog
- **THEN** the profile's environment values are populated and can be adjusted for that run before it starts

#### Scenario: Clear a profile value for one run
- **WHEN** a start request references an owned profile and explicitly sends null or a blank value for a reusable field
- **THEN** that run saves an empty value for the field without changing the profile

#### Scenario: Profile does not exist or is outside the user project scope
- **WHEN** a start request references a missing profile or a profile outside the user's ownership or requested project
- **THEN** the system rejects the reference and does not create the run

### Requirement: Runs retain an independent environment snapshot
The system SHALL store the six resolved environment values on each Manual Test Run independently of the selected profile, expose them in detail and history responses, and keep them unchanged by later run update operations.

#### Scenario: Profile changes after run start
- **WHEN** a user updates or deletes a profile after starting a run
- **THEN** the run continues to show the environment values captured when it started

#### Scenario: Build and deployment are recorded per run
- **WHEN** a user starts a run with build or deployment values
- **THEN** those values are stored on that run and are not shared mutable profile values

#### Scenario: Existing run without environment
- **WHEN** an older run without recorded environment is retrieved
- **THEN** its detail and history responses contain null environment fields

#### Scenario: Update a run after start
- **WHEN** a user updates a run after it starts
- **THEN** its saved environment values do not change

### Requirement: Run environment is visible in run details and history
The system SHALL display recorded environment values in Manual Test Run details and provide enough environment context in run history to distinguish runs with different environments.

#### Scenario: View run details
- **WHEN** a user opens a run that has environment values
- **THEN** the details view displays each recorded value and omits empty values

#### Scenario: View run with no environment values
- **WHEN** a user opens a run without environment values
- **THEN** the run remains viewable and the interface indicates that no environment was recorded
