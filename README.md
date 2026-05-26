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

### 3. Configure environment variables

Create a `.env` file in the root directory based on `.env.example`

### 4. Start the development server

```bash
yarn dev
```

The application will be available at `http://localhost:5173`

## Docker Deployment

For instructions on how to build, publish, and run the application using Docker, please refer to the [Docker Deployment Guide](docs/DOCKER.md).

## License

This project is licensed under the Apache License 2.0. See
[LICENSE](LICENSE) for the full terms.

Supported JavaScript and TypeScript source files can be created with
`yarn new:file -- <path>` so the standard repository header is added
automatically. To backfill missing headers across existing supported files in
`src`, run `yarn headers:add`.
