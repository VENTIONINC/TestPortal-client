# Manual Test Run environments

The Start manual run dialog includes an optional **Environment** section. Expand it to record the conditions used for the run or reuse a saved profile. You can leave the section closed or leave every field empty and start the run as usual.

## Environment values

Each run can record browser and version, operating system, device, API environment, build, and deployment. Values are optional. Build and deployment are entered for each run because they can change between executions.

## Saved profiles

Profiles are private to the user who created them and scoped to a project. A profile stores a name plus browser, operating system, device, and API environment. Select a profile to fill those four fields; edit values for the current run as needed. Blank fields clear the corresponding value for that run. Build and deployment always come from the current run form.

Use **Save as new profile** to create a reusable profile, **Update selected profile** to save changes to the selected profile, or **Delete selected profile** to remove it. Deleting a profile does not change environment values already saved in runs.

## Run history

The run detail page shows all nonempty environment values. Run history displays a compact summary so runs can be distinguished at a glance. Runs created before environment tracking show that no environment was recorded.
