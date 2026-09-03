## 1. Dialog Data Flow

- [x] 1.1 Update the project card and project context-menu flow to carry the selected project's display name alongside its ID when opening the delete dialog.
- [x] 1.2 Extend the delete project dialog props so the dialog can render the selected project's name while preserving the existing delete mutation behavior.

## 2. Confirmation UX

- [x] 2.1 Update the delete project confirmation copy to include the selected project name and keep the permanent-deletion warning intact.
- [x] 2.2 Verify the dialog remains clear and readable for inactive projects opened from Settings, including projects with longer names.

## 3. Validation

- [x] 3.1 Run the relevant validation for the touched UI files and confirm there are no lint or type errors from the dialog prop changes.
- [x] 3.2 Manually verify that deleting an inactive project from Settings shows the correct project name in the confirmation dialog before the destructive action is confirmed.
