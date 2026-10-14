# Test Scenario organization

The Test Scenario catalog can show every scenario, Unfiled scenarios, a folder and its descendants, or the current members of a suite. Search and the 10-row page are sent together with the selected project and folder or suite scope, so totals always come from the backend.

Folders belong to one project and can be nested. Create from a selected folder to create a child folder. Moving a folder changes its parent; folder deletion asks whether direct scenarios should move to the parent or to Unfiled. Child folders are promoted to the deleted folder's parent.

Suites are current, ordered selections of existing scenarios. Their purpose, description and release are labels only; a release suite does not preserve historical run evidence. Members can be added or removed in batches of up to 100 scenarios, and the catalog can reorder suite members. Bulk folder moves use the same 100-scenario limit.

Scenario forms can assign a folder or leave the scenario Unfiled. Moving scenarios, editing folders, or changing suite membership does not change scenario identity or execution history.
