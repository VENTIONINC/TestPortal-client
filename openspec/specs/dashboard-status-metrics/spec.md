# dashboard-status-metrics Specification

## Purpose
TBD - created by archiving change fix-dashboard-status-metrics. Update Purpose after archive.
## Requirements
### Requirement: Dashboard uses explicit status counts
The Dashboard SHALL use explicit backend-provided status counts for dashboard status metrics instead of deriving passed or failed counts from totals.

#### Scenario: Skipped and timed-out results are not counted as passed
- **WHEN** dashboard data contains 3055 passed results, 3040 failed results, 2 skipped results, and 3 timed-out results
- **THEN** the dashboard status metrics display 3055 passed results
- **AND** the dashboard status metrics do not display 3060 passed results

#### Scenario: Failed results are not derived from residual totals
- **WHEN** dashboard data contains passed, failed, skipped, and timed-out counts
- **THEN** failed dashboard metrics use the explicit failed count from the dashboard data
- **AND** timed-out results are not added to the failed count through residual total calculations

### Requirement: Dashboard status views are internally consistent
The Dashboard SHALL apply the same status-count semantics across statistics cards, donut chart data, pass-rate chart data, and history/regression chart data.

#### Scenario: Dashboard views display matching status totals
- **WHEN** the dashboard renders status cards and charts for the same project and period
- **THEN** each dashboard status view uses the same passed, failed, skipped, and timed-out counts for that data scope

#### Scenario: Status bucket sum matches total result count
- **WHEN** dashboard data includes a total result count and explicit status counts
- **THEN** the displayed status buckets sum to the displayed total result count

### Requirement: Dashboard preserves selected data scope
The Dashboard SHALL preserve the existing selected project and period scope when displaying explicit status metrics across all execution environments.

#### Scenario: Period filter changes dashboard status metrics
- **WHEN** the user changes the Dashboard period filter
- **THEN** dashboard status metrics update using explicit status counts for the newly selected period

#### Scenario: Project scope remains unchanged
- **WHEN** the Dashboard fetches status metrics for a selected project
- **THEN** the displayed status counts correspond to the selected project across all execution environments
