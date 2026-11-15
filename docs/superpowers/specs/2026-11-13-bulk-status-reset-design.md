# Bulk Status Reset Design

## Intent

Let users reset selected scenarios to Untested by choosing the status they already share, while keeping bulk status application predictable for mixed selections.

## Behavior

- When every selected scenario already has the chosen status, clicking that bulk status resets all selected scenarios to Untested.
- When the selection contains any other status, clicking a bulk status applies the chosen status to every selected scenario.
- Bulk assignee updates remain unchanged.

## Tooltips

Add a tooltip to each bulk status button (Passed, Failed, Blocked, and Skipped). Its text reflects the current selection and the button's status:

- If every selected scenario already has that status, explain that clicking will reset all selected scenarios to Untested.
- Otherwise, explain that clicking will apply that status to all selected scenarios.

This makes the result of each bulk action clear before the user clicks, including when the selected scenarios have mixed statuses.

## Approaches

- **All-selected toggle (chosen):** reset only when all selected scenarios match the chosen status; otherwise apply it to all. This preserves the bulk action's all-selected semantics and matches the user's direction.
- **Per-scenario toggle:** reset only matching scenarios and set the others to the chosen status. This can leave a mixed selection after one bulk action, which conflicts with the requested behavior.

## Scope and constraints

Change the bulk result behavior and its status-button tooltips in `ManualTestRunWorkspace`. Keep the existing single-scenario reset behavior and bulk assignee behavior unchanged. No other UI or API changes are intended.

## Implementation note

Use the selected scenario records already present in the active run to determine whether all selected results match the clicked result. Send `Untested` for the all-matching case; otherwise send the clicked result through the existing bulk update.
