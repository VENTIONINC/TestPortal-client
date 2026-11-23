# TestPortal Frontend

[![Build and lint](https://github.com/VENTIONINC/TestPortal-client/actions/workflows/deploy.yml/badge.svg)](https://github.com/VENTIONINC/TestPortal-client/actions/workflows/deploy.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

TestPortal helps teams centralize test results, investigate failures, and track issues across projects. This repository contains its React and TypeScript web interface.

## What you can do

- Browse test execution results and inspect failures.
- Track issues associated with test results.
- Explore test metrics through configurable dashboards.
- Manage reusable prompts and skill packages for AI-assisted workflows.
- Configure projects, report uploads, and MCP connections.

The frontend uses React, TypeScript, Vite, Chakra UI, and Redux Toolkit with RTK Query. It connects to the TestPortal backend for authentication and data.

## TestPortal ecosystem

| Repository                                                       | Role                                                                                  |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [Frontend](https://github.com/VENTIONINC/TestPortal-client)      | Web interface for results, issues, and dashboards; this repository.                   |
| [Backend](https://github.com/VENTIONINC/TestPortal-backend)      | REST API, MCP server, authentication, and data storage.                               |
| [CLI](https://github.com/VENTIONINC/TestPortal-cli)              | Converts test reports and uploads them to TestPortal from local runs or CI pipelines. |
| [Infrastructure](https://github.com/VENTIONINC/TestPortal-infra) | Infrastructure configuration for TestPortal deployments.                              |

A typical workflow is to upload a test report with the CLI, store and process it through the backend, and review the results in this frontend.

## Getting started

### Prerequisites

- Node.js 22.15 or later in the Node.js 22 release line.
- Yarn 3.6.4, pinned in this repository.
- A running [TestPortal backend](https://github.com/VENTIONINC/TestPortal-backend#setup-instructions) and a user account for that backend.

### 1. Clone and install

```bash
git clone https://github.com/VENTIONINC/TestPortal-client.git
cd TestPortal-client
corepack enable
yarn install
```

### 2. Configure the backend connection

```bash
cp .env.example .env
```

For a backend running locally on port 3001, set:

```dotenv
VITE_API_URL=http://localhost:3001
```

Use the backend origin without an `/api/v2` suffix; the API client already includes endpoint paths. Restart the development server after changing this value.

### 3. Start the frontend

```bash
yarn dev
```

Open the local URL printed by Vite, normally [http://localhost:5173](http://localhost:5173), and sign in with your backend account. Select a project to review its results. If no projects exist, the application opens project settings.

To populate results, follow the [CLI usage guide](https://github.com/VENTIONINC/TestPortal-cli#-usage) to upload a report to the same backend.

## Development

| Command                 | Purpose                                                           |
| ----------------------- | ----------------------------------------------------------------- |
| `yarn dev`              | Start the development server.                                     |
| `yarn lint`             | Run ESLint and the TypeScript check.                              |
| `yarn test`             | Run unit and component tests.                                     |
| `yarn build`            | Generate Chakra UI types, check TypeScript, and build to `dist/`. |
| `yarn preview`          | Preview the production build locally.                             |
| `yarn generate-api`     | Regenerate the main API client from OpenAPI.                      |
| `yarn generate-mcp-api` | Regenerate the MCP API client.                                    |

See [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution workflow, API generation configuration, and source-file header guidance.

## Deployment and releases

- [Docker deployment](docs/DOCKER.md)
- [ECS deployment](docs/DEPLOY_ECS.md)
- [Release process](docs/RELEASE.md)
- [Published releases](https://github.com/VENTIONINC/TestPortal-client/releases)

## Feedback and contributions

Report bugs and propose improvements through [GitHub Issues](https://github.com/VENTIONINC/TestPortal-client/issues). For bugs, include reproduction steps, expected and actual behavior, and relevant browser or application version details.

Read the [contributing guide](CONTRIBUTING.md) before opening a pull request.

## License

Licensed under the Apache License 2.0. See [LICENSE](LICENSE) for the full terms and [NOTICE](NOTICE) for copyright attribution.
