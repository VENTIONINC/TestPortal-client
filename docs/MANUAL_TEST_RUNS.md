# Manual Test Run environments

The Start manual run dialog includes an optional **Environment** section. Expand it to record the conditions used for the run or reuse a saved profile. You can leave the section closed or leave every field empty and start the run as usual.

## Environment values

Each run can record browser and version, operating system, device, API environment, build, and deployment. Values are optional. Build and deployment are entered for each run because they can change between executions.

## Saved profiles

Profiles are private to the user who created them and scoped to a project. A profile stores a name plus browser, operating system, device, and API environment. Select a profile to fill those four fields; edit values for the current run as needed. Blank fields clear the corresponding value for that run. Build and deployment always come from the current run form.

Use **Save as new profile** to create a reusable profile, **Update selected profile** to save changes to the selected profile, or **Delete selected profile** to remove it. Deleting a profile does not change environment values already saved in runs.

## Run history

The run detail page shows all nonempty environment values. Run history displays a compact summary so runs can be distinguished at a glance. Runs created before environment tracking show that no environment was recorded.

## Saving execution

Select a step outcome with its labelled buttons. The selected button exposes its pressed state to assistive technology and supports keyboard activation. Outcomes save immediately; step notes save after 500 ms without typing or when focus leaves the notes field. Clearing saved notes saves an empty value. There is no separate step Save button.

A successful step save briefly shows Saved in the step header, then clears after three seconds. No save confirmation appears on initial load, after reload, while typing, or while a request is pending. Progress dots and counts use confirmed saved outcomes; an outline identifies unsaved changes. Rapid edits are kept in order through one run write at a time, and newer edits remain available while an earlier request completes.

If a save fails, the draft remains visible with Not saved. Use Retry to explicitly submit the latest draft; failed writes are never replayed automatically. Failed writes are never replayed automatically. Conflicts refresh the authoritative run before another write; if refresh fails, retry the refresh first. A completed or reassigned run becomes view-only and queued saves are cancelled. Leaving with unsaved changes displays a warning; reopening loads only persisted values.

Run execution notes and Run key changes retain their explicit Save actions. Executor reassignment and terminal completion also remain explicit and wait for automatic writes, timers, and failed drafts to be resolved. Completion requires saving or discarding all execution drafts. Scenario authoring is separately saved and never changed by execution autosave.

Historical run bodies retain copied Details, Preconditions, Test data, step actions and expected results, environment, and execution notes. They do not show the removed scenario Objective, scenario Expected result, or Scenario notes fields. Source edits and executor reassignment do not rewrite this snapshot.
