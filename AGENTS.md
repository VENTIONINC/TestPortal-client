# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Lint code (ESLint + TypeScript check)
yarn lint

# Individual linting commands
yarn eslint      # Run ESLint
yarn tsc      # Run TypeScript compiler check

# API code generation
yarn generate-api      # Generate main API from OpenAPI at localhost:3001
yarn generate-mcp-api  # Generate MCP API
```

## Architecture Overview

This is a React TypeScript application built with Vite for managing test execution results and issues.

### State Management

- **Redux Toolkit** with RTK Query for API calls and caching
- **Redux Persist** for auth token persistence
- Two separate API configurations:
  - `baseApi` - Main API with automatic auth token refresh
  - `mcpApi` - MCP (Model Control Protocol) API

### Key Architectural Patterns

**API Layer**: Uses RTK Query with code generation from OpenAPI specs. The `baseApi` includes automatic JWT token refresh logic that handles 401 responses by attempting to refresh tokens before retrying requests.

**Component Organization**: Components are organized by feature domains:

- `components/issues/` - Issue management UI
- `components/results/` - Test result management UI
- `components/dialogs/` - Modal dialogs
- `components/drawers/` - Side drawer panels
- `components/ui/` - Reusable UI components

**Routing**: Uses React Router v7 with a centralized router configuration. The root path (`/`) defaults to the Results page.

**Styling**: Uses Chakra UI v3 with custom theme support and dark mode.

### Authentication Flow

The app implements JWT-based authentication with automatic token refresh. The `baseApi` intercepts 401 responses and attempts to refresh tokens using the stored refresh token before logging users out.

### Code Generation

API types and hooks are automatically generated from OpenAPI specs using `@rtk-query/codegen-openapi`. Run generation commands after API schema changes.
