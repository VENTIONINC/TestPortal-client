## 1. API Types and Data Shape

- [x] 1.1 Run `yarn generate-api` against the backend that includes `TestPortal-backend#52`.
- [x] 1.2 Inspect the generated dashboard response type and identify the explicit status-count field.
- [x] 1.3 Define or update a dashboard status metrics normalization helper that returns total, passed, failed, skipped, and timedOut counts.

## 2. Dashboard Status Widgets

- [x] 2.1 Update the dashboard statistics card to use normalized explicit status counts instead of `totalRuns - failures`.
- [x] 2.2 Update the dashboard donut chart data to use normalized explicit status counts.
- [x] 2.3 Ensure skipped and timed-out counts are either displayed distinctly or excluded without being folded into passed or failed values.

## 3. Dashboard Charts

- [x] 3.1 Update pass-rate chart mapping to use explicit status counts from dashboard history data.
- [x] 3.2 Update history/regression chart mapping to avoid deriving failed counts from residual totals.
- [x] 3.3 Align chart series, legends, colors, and max-value calculations with the corrected status buckets.

## 4. Regression Coverage

- [x] 4.1 Add focused tests for normalization using 3055 passed, 3040 failed, 2 skipped, and 3 timedOut results.
- [x] 4.2 Add or update dashboard widget/chart tests to verify passed remains 3055 and failed remains 3040 for mixed-status data.
- [x] 4.3 Verify dashboard period/project scoped data still flows through the existing dashboard query path.

## 5. Validation

- [x] 5.1 Run `yarn tsc`.
- [x] 5.2 Run `yarn eslint`.
- [x] 5.3 Run any targeted dashboard tests added or updated for this change.
