## Context

Issue `#19` reports that the project delete confirmation modal in Settings uses generic wording and does not identify the project being deleted. In the current client flow, the delete action passes only `projectId` into the dialog, which is enough for the mutation but not enough to render object-specific confirmation copy. Other destructive dialogs in the application already include item-identifying context, so the project deletion flow is inconsistent with the surrounding UX.

## Goals / Non-Goals

**Goals:**
- Ensure the delete confirmation dialog displays the selected project name before deletion is confirmed.
- Keep the existing delete behavior, button structure, and API mutation intact.
- Align the project deletion experience with existing destructive dialogs that identify the object being removed.

**Non-Goals:**
- Changing project archive or unarchive behavior.
- Introducing a second-step verification flow, typed confirmation, or project ID confirmation.
- Modifying backend APIs or project data contracts.

## Decisions

Pass project display metadata through the existing dialog-opening flow.
Rationale: The project list already has access to `project.id` and `project.name`, so the most direct approach is to propagate the name alongside the ID from the project card/context-menu path into the dialog props. This keeps the dialog self-sufficient at render time and avoids adding an extra lookup or API call.

Preserve the existing destructive warning while adding object-specific context.
Rationale: The problem is ambiguity, not lack of warning severity. The copy should continue to communicate permanence and data loss, while naming the selected project to reduce accidental deletion risk.

Keep the scope limited to the delete-project dialog.
Rationale: Archive and unarchive dialogs have similar generic wording, but issue `#19` is specifically about deletion. Constraining the change keeps the proposal small and implementation focused.

## Risks / Trade-offs

- [Project names may be duplicated] → Showing the name still improves clarity substantially; if duplicate-name ambiguity becomes a real product issue later, the dialog can be extended to also show the project ID.
- [Long project names may wrap awkwardly in the modal] → Reuse existing text styling patterns already used by other confirmation dialogs that emphasize object names inline.
- [Context-menu plumbing changes may ripple through shared types] → Keep the shape change minimal by extending only the project metadata passed into this flow.
