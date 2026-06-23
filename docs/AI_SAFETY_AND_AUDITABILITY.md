# AI Safety, Oversight, and Auditability Policy

This document describes the design, architecture, and compliance boundaries of artificial intelligence (AI) and automated system-generated components within the TestPortal system.

---

## 1. AI Integration Stack

### Failed/Flaky Test Result Analysis
- **Service**: `testAnalysisService.ts`
- **Framework**: LangChain (`@langchain/openai`)
- **LLM Model**: `gpt-4.1-mini`
- **Usage**: Automatically analyzes test executions with `failed` or `flaky` status to categorize the failures into root-cause buckets (Bug, Script, Infra, Performance, Other) and provide a text explanation.
- **Triggers**: Executed programmatically when CTRF reports are uploaded or manually triggered by the user via the UI.

---

## 2. Deterministic Similarity-Based Assumption Logic

Separate from the LLM-based analysis, the system runs a deterministic pattern-matching logic to suggest linking test errors to existing database issues.

- **Component**: `error-analyzer.ts`
- **Algorithm**:
  1. **Message Similarity**: Combines Levenshtein distance (40%) and Jaro-Winkler similarity (60% via `string-similarity`) on normalized error messages.
  2. **Stack Trace Similarity**: Employs Jaccard similarity (60%) on normalized frames and sequence string similarity (40%) to compare stacks.
  3. **Threshold**: If the combined final score is $\ge 0.70$, the error is automatically matched.
- **Audit Marker**: Assumptions created by this logic are populated with `madeBy: "bot"`.

---

## 3. Scope of Autonomous Agents

- **Current Status**: Autonomous AI agents that execute actions independently without user action are **not currently implemented**.
- **MCP (Model Context Protocol) Tools**: The system registers a suite of MCP tools (e.g., `create-issue`, `assign-issue`, `create-assumption`, `update-assumption`) for external AI clients.
- **Future Integration Constraint**: If autonomous AI agents are introduced or if MCP tools are accessed by an external AI client, the allowed write/read permissions, rate limits, and required human oversight must be fully audited and documented prior to any public launch.

---

## 4. Human Oversight and Review Policy

- **Suggestion Principle**: All AI-generated analyses and system-generated assumptions are treated strictly as **suggestions or hypotheses** and are clearly marked in the UI (e.g., `[AI Suggested]`, `[Hypothesis]`).
- **Confirmation Requirement**: No automated analysis has final authority over test statuses or category weights. A user must review these suggestions in the UI:
  - Saving the feedback in the **Result Analysis Dialog** updates the classification and marks it as human-confirmed.
  - Clicking the checkmark ($\checkmark$) on a hypothesis converts it to a confirmed link.

---

## 5. Auditability and Traceability

The system maintains database-level traceability to distinguish between machine-generated content and human approvals.

### A. Result Analysis Traceability
Within the `Result` model, we track:
- AI-generated fields: `analysisStatus`, `analysisCategory`, `analysisConfidence`, and `analysisConclusion`.
- User feedback overrides: `analysisFeedbackCategory`, `analysisFeedbackConfidence`, and `analysisFeedbackConclusion`.
- Review audit fields: `analysisReviewedAt` (timestamp) and `analysisReviewedById` (UUID of the user who confirmed the action).

### B. Assumption Traceability
Within the `Assumption` model, we track:
- `madeBy`: Denotes the creator (`"bot"` for deterministic code, `"user"` for human confirmation).
- `isConfirmed`: `true` if a human has clicked verification, `false` while it remains an AI-suggested suggestion.

### C. MCP Token and Session Audits
- MCP requests require token authentication using HMAC SHA-256 signature verification matching the user ID.
- Streamable transport session IDs are tracked in-memory with automatic cleanup on idle timeout.
