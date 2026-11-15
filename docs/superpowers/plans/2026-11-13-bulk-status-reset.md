# Bulk Status Reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make each bulk status button explain and perform the action it will take for the current selection.

**Architecture:** Keep the logic in `ManualTestRunWorkspace`. Derive whether every selected scenario already has the chosen result, use that to select the bulk result and tooltip text, and preserve existing bulk assignee updates.

**Tech Stack:** React, TypeScript, Chakra UI v3, the existing `@/components/ui` Tooltip wrapper.

**Spec:** `/Users/aleksandr.degterov/src/TestPortal/TestPortal-devtoolkit/openspec/changes/tp-60-manual-runs-phase-2/ux-spec/5-status-tooltip-ux-spec.md`

## Global Constraints

- If every selected scenario already has the chosen status, clicking that bulk status resets all selected scenarios to Untested.
- Otherwise, clicking a bulk status applies the chosen status to every selected scenario.
- Each bulk status button's tooltip includes the status explanation and explains the action for the current selection.
- Keep single-scenario reset behavior and bulk assignee behavior unchanged.
- Do not change the API or add dependencies.
- Do not add or run tests unless the user asks for testing or verification.

## Review Focus

- Mixed statuses: clicking Passed applies Passed to every selected scenario.
- All selected scenarios already Passed: clicking Passed resets all to Untested.
- All selected scenarios have another status: clicking Passed applies Passed to all.
- Tooltip text and click behavior use the same derived all-selected condition; mixed selections explain that all selected scenarios will receive the chosen status.
- Selection changes recalculate the tooltip before the next click.

---

### Task 1: Make bulk status actions selection-aware

**Files:**
- Modify: `src/components/manual-test-runs/components/ManualTestRunWorkspace.tsx`
- Existing UI wrapper: `src/components/ui/tooltip.tsx`

**Interfaces:**
- Consumes: `run.scenarios`, `selectedScenarioIds`, `RESULTS`, `resultLabels`, `updateBulk`, and the existing `Tooltip` component (`content`, `children`, optional `openDelay`).
- Produces: For each result button, a tooltip and `onClick` action derived from whether every selected scenario has that result.

- [ ] Derive the selected scenario records from the active run and ensure every selected ID resolves to a scenario before considering the selection eligible for reset.
- [ ] For each `result` in `RESULTS`, derive `willReset` only when the selected scenario set is non-empty, every selected ID resolves to a scenario, and every resolved scenario has `result`.
- [ ] Wrap each status button in the existing `Tooltip`, retaining that status's explanation and adding a selection-aware action sentence: “Click again to reset all selected scenarios to Untested” when `willReset`, otherwise “Click to mark all selected scenarios as {label}”. Keep the tooltip no wider than 240px.
- [ ] On click, call `updateBulk({ result: willReset ? MANUAL_RUN_RESULT.UNTESTED : result })`.
- [ ] Leave `updateBulk`'s assignee-only use and the individual `updateResult` handler unchanged.
- [ ] Review the resulting component diff and run `git diff --check`. Do not add or run tests unless asked.
