# Manual Test Run Execution QA Notes

Date: 2026-09-17

## Local contract evidence

- The backend checkout used for local QA was `feature/add-manual-test-runs` at `8fc2cd6`.
- `GET http://localhost:3001/api/v2/status` returned `{"status":"ok","version":"0.11.2"}`.
- The served OpenAPI contained the start, scenario-history, project-history, detail, run-note PATCH, step PATCH, and dedicated completion operations, plus the corresponding Manual Test Run schemas.
- Regeneration from `http://localhost:3001/api/openapi.json` completed successfully both before implementation and in the final review. The final regeneration added no further generated diff.

## Authenticated browser observations

- The local Vite client was tested in the authenticated in-app browser against the local backend using the existing `Default Project` account.
- Starting a saved three-step scenario navigated to the returned `/manual-test-runs/:runId` URL.
- Multiline execution-note save preserved the interior line break; clearing with whitespace/newline content persisted an empty note.
- Step outcomes and notes were saved independently for passed, failed, and skipped outcomes; initial not-started state was visible.
- Completion was blocked by an unsaved execution-note draft. Passed completion showed eligibility guidance while a failed step existed; explicit failed completion succeeded.
- Reloading the completed run restored the persisted status, outcomes, notes, and immutable read-only controls without issuing a new start request.
- Editing the source scenario Details and reordering its steps, then restoring both source values, did not change the run's copied snapshot Details or original ordered copied steps.

## Remaining live-QA limits

- The authenticated account exposed only one project, so live project-switch isolation could not be exercised.
- Source-scenario deletion was not performed because it is destructive; deletion-safe behavior remains covered by the backend contract/design boundary rather than a live client mutation.
- Live transport-failure and multi-session concurrency scenarios were not forced; focused component/API tests cover the retry, pending, conflict, and authoritative-refresh simulations.
- The backend branch serving local QA is the open/manual-run feature branch, not a confirmed final merge with the backend's other pending work. Delivery still depends on final backend integration and a final contract/check review after that merge.
