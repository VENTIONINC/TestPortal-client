# Test Scenario organization

The Test Scenario catalog can show every scenario, Unfiled scenarios, a folder and its descendants, or the current members of a suite. Search and the 10-row page are sent together with the selected project and folder or suite scope, so totals always come from the backend.

Folders belong to one project and can be nested. Create from a selected folder to create a child folder. Moving a folder changes its parent; folder deletion asks whether direct scenarios should move to the parent or to Unfiled. Child folders are promoted to the deleted folder's parent.

Suites are current, ordered selections of existing scenarios. Their purpose, description and release are labels only; a release suite does not preserve historical run evidence. Members can be added or removed in batches of up to 100 scenarios, and the catalog can reorder suite members. Bulk folder moves use the same 100-scenario limit.

Scenario forms can assign a folder or leave the scenario Unfiled. Moving scenarios, editing folders, or changing suite membership does not change scenario identity or execution history.


Bulk **Move…** assigns scenarios to a folder or Unfiled in All scenarios, folder and Unfiled views. It is hidden in suite views, and changing scope closes an open Move dialog. Folder menu moves remain available. Suite membership actions add/remove references to scenarios independently of their folder assignment; removing a member does not move or delete the scenario.

Create and edit use one draft workspace. Keys are assigned by the server on Save (`TMS-N`) and cannot be edited. Priority starts at Medium. **Save scenario** or **Save changes** submits fields, folder, ordered steps and all suite selections together. Blank new step rows are ignored; a row containing only an expected result and a saved row with a cleared action must be corrected.

Use **Add step** to append and focus its action, or Enter in the last row's expected result. Shift+Enter inserts a line break. Drag a row by its handle; with the keyboard, press Space to pick up, Arrow Up/Down to reorder and Space to drop. Changes remain local until Save.

The Suites picker searches existing project suites and shows their scenario counts. Creating a suite in this picker adds a local selected tag: the suite is created only by the final scenario Save. Removing the tag or cancelling creates nothing. Back and Cancel return to the current draft folder (or Unfiled), after confirming any unsaved changes. Navigation, project changes and browser exit also guard dirty drafts.

If a save reports a stale scenario or membership conflict, the whole draft stays available. **Reload saved scenario** asks before discarding it; a failed reload preserves the draft. Suite-name collisions can be corrected by removing the new tag and selecting the existing suite. A transport failure during creation can leave the result uncertain: inspect the catalog before explicitly retrying. History shows the creator and most recent updater; unavailable attribution is shown as Unknown.
