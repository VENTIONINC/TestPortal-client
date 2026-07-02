## Why

Deleting a project is a destructive action, but the current confirmation dialog does not identify which project is about to be removed. This creates avoidable ambiguity and increases the risk of deleting the wrong inactive project from Settings.

## What Changes

- Update the project deletion confirmation flow in Settings so the modal clearly names the selected project.
- Preserve the existing destructive warning copy while adding object-specific context to improve user confidence.
- Align project deletion messaging with other destructive dialogs in the product that already identify the item being removed.

## Capabilities

### New Capabilities
- `project-delete-confirmation`: Covers the requirement that the delete-project confirmation dialog identify the selected project before the user confirms deletion.

### Modified Capabilities
- None.

## Impact

- Affected UI includes the project settings card/context-menu flow and the delete project confirmation dialog.
- No API contract changes are expected; the change only requires passing existing project metadata through the client dialog flow.
- Validation should focus on inactive project deletion from Settings and the final confirmation copy presented to the user.
