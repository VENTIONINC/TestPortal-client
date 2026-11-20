# Test Portal Client

An application for viewing and managing test execution results and issues.

## Contributing

Contribution workflow, validation commands, and file header guidance live in
[CONTRIBUTING.md](CONTRIBUTING.md).

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd test-portal-client
```

### 2. Install dependencies

```bash
yarn install
```

The install generates Chakra typings and activates the versioned Husky
pre-commit hook in a Git checkout. It skips CI, production installs, and source
trees without Git metadata. To reactivate it in an existing clone, run
`yarn postinstall` and check
`git config --local --get core.hooksPath` returns `.husky/_`.

The hook runs `yarn eslint`, `yarn tsc`, and `yarn test` in that order.

### 3. Configure environment variables

Create a `.env` file in the root directory based on `.env.example`. Set
`VITE_API_URL` to your backend URL, for example `http://localhost:3001`.

### 4. Start the development server

```bash
yarn dev
```

The application will be available at `http://localhost:5173`

## Docker Deployment

For instructions on how to build, publish, and run the application using Docker, please refer to the [Docker Deployment Guide](docs/DOCKER.md).

## Release Process

For instructions on how to create a release, please refer to the [Release Guide](docs/RELEASE.md).

## License

This project is licensed under the Apache License 2.0. See
[LICENSE](LICENSE) for the full terms and [NOTICE](NOTICE) for repository
copyright attribution.

Supported JavaScript and TypeScript source files can be created with
`yarn new:file -- <path>` so the standard repository header is added
automatically. To backfill missing headers across existing supported files in
`src`, run `yarn headers:add`.
