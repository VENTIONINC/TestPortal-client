## Why

The Dashboard currently derives passed results from `totalRuns - failures`, which causes skipped and timed-out results to be counted as passed. This makes dashboard cards and charts inconsistent with the actual result-status distribution and with the Results page statistics.

The backend has added an explicit status breakdown for dashboard data, so the frontend can now display accurate, consistent values without inferring statuses from totals.

## What Changes

- Update Dashboard status displays to consume explicit status counts from dashboard data instead of deriving passed or failed counts from totals.
- Keep `passed`, `failed`, `skipped`, and `timedOut` counts distinct wherever dashboard status metrics are shown.
- Align the dashboard statistics card, donut chart, pass-rate chart, and history/regression chart around the same status-count semantics.
- Refresh generated API types to include the backend status breakdown added for `TestPortal-backend#52`.
- Preserve existing dashboard filtering behavior for selected project, environment, and period.

## Capabilities

### New Capabilities
- `dashboard-status-metrics`: Dashboard UI presents accurate test-result status metrics using explicit backend status counts.

### Modified Capabilities

## Impact

- Affected API surface: generated RTK Query types/hooks for the dashboard endpoint.
- Affected UI: `DashboardGrid`, dashboard statistics widgets, donut chart data, pass-rate chart data, and history/regression chart data.
- Affected validation: dashboard metric calculations should be covered with focused unit/component tests or equivalent regression checks.
