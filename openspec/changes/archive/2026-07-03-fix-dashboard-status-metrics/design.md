## Context

Dashboard issue `TestPortal-client#18` reports that dashboard cards and charts show incorrect or inconsistent values. The investigated mismatch comes from frontend calculations that collapse result statuses into binary pass/fail buckets:

- `StatsWidget` and `DonutChartWidget` compute passed as `totalRuns - failures`.
- `HistoryRegressionRunChart` computes failed as `total - passed - skipped`.
- `PassRateChart` uses `metrics.failed` directly.

Those paths disagree when results include statuses beyond `passed` and `failed`, especially `skipped` and `timedOut`. Backend issue `TestPortal-backend#52` has added an explicit dashboard status breakdown, so the frontend can replace derived status math with authoritative counts.

## Goals / Non-Goals

**Goals:**
- Refresh generated API types so the dashboard response includes the backend status breakdown.
- Use explicit status counts for dashboard statistic cards and charts.
- Keep `passed`, `failed`, `skipped`, and `timedOut` distinct in dashboard calculations.
- Ensure totals displayed in dashboard status UI equal the sum of displayed status buckets.
- Add focused regression coverage for the corrected calculations.

**Non-Goals:**
- Redesign the Dashboard layout or visual hierarchy.
- Change backend dashboard semantics, filters, or aggregation rules.
- Change Results page statistics behavior.
- Introduce new dashboard filters.

## Decisions

### Use dashboard response status breakdown as the source of truth

The dashboard endpoint already reflects the selected project, environment, and period used by the Dashboard page. After API generation, the frontend should read the new status breakdown field from the dashboard response and use it as the source of truth for status metrics.

Alternative considered: call `/api/v2/results-stats` from Dashboard. That endpoint already exposes `byStatus`, but it filters by explicit dates and does not obviously share the same environment/period semantics as the Dashboard query. Reusing it would risk another mismatch between dashboard widgets and dashboard charts.

### Centralize dashboard status normalization

Create a small helper or memoized normalization step that maps the dashboard response into a local status metrics shape:

```ts
{
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  timedOut: number;
}
```

All dashboard status widgets and chart mappers should consume this normalized shape, rather than each component deriving its own values.

Alternative considered: update each component inline. That is faster initially, but it preserves the exact fragmentation that caused the current inconsistency.

### Prefer explicit failed and timed-out counts over residual math

When mapping history data, use explicit `failed` and `timedOut` counts if present. Do not compute failed from `total - passed - skipped`; this folds unknown statuses into failed.

Fallback handling can default missing fields to zero for loading/compatibility, but the implementation should not use fallback math as normal behavior once generated types include the backend field.

## Risks / Trade-offs

- Backend field name or shape differs from the assumed status-count model -> Run `yarn generate-api` first and adapt the normalization helper to the generated type.
- Some existing charts only show passed/failed today -> Keep visual changes minimal, but ensure hidden statuses are not misclassified. If skipped/timed-out series are added, preserve readable legends and colors.
- API data may be temporarily missing during loading -> Use zero defaults only for loading/empty states and avoid showing stale derived values.
- Existing tests may rely on old binary behavior -> Update those expectations to assert explicit status semantics.
