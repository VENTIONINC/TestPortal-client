# Docker Deployment Guide

This guide explains how to build, publish, and run the Docker image for the Test Portal Client.

## Prerequisites

- Docker installed on your machine.
- Access to the GitHub repository `Vention-Test-Portal/test-portal-client`.
- A GitHub Personal Access Token (PAT) with `read:packages` scope (for pulling images).

## 1. Building and Publishing Images

We use GitHub Actions to build and publish Docker images to the GitHub Container Registry (GHCR).

### Manual Builds

Builds are triggered manually to allow for specific configuration per environment or customer.

1. Go to the **Actions** tab in the GitHub repository.
2. Select the **Create and publish a Docker image** workflow.
3. Click **Run workflow**.
4. Select the **Branch** you want to build from.
5. Fill in the inputs:
   - **API URL**: The backend API URL for this specific build (e.g., `https://api.customer-a.com`).
     - If left empty, it uses the `VITE_API_URL` repository variable.
   - **Custom Image Tag**: A unique tag for this image (e.g., `customer-a`).
     - If left empty, standard tags (branch name, commit SHA) are used.
   - **Tag with branch name**: (Default: checked). If checked, adds the branch name as a tag (e.g., `feat-new-ui`) even if a custom tag is provided.
6. Click **Run workflow**.

### Examples

- **Internal Dev Build**:

  - Branch: `feat/login`
  - API URL: (Empty)
  - Custom Tag: (Empty)
  - Result: `ghcr.io/...:feat-login` (uses default dev API)

- **Customer Release**:
  - Branch: `main`
  - API URL: `https://api.customer-a.com`
  - Custom Tag: `customer-a`
  - Result: `ghcr.io/...:customer-a` (and `ghcr.io/...:main` if branch tag is kept)

## 2. Running the Image

Since the package is private, you must authenticate with GHCR before pulling the image.

### Step 1: Authenticate

1. Generate a GitHub PAT with `read:packages` scope.
2. Run the following command in your terminal:

```bash
echo "YOUR_GITHUB_PAT" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### Step 2: Pull and Run

Replace `TAG_NAME` with the desired tag (e.g., `main`, `customer-a`, `internal-build`).

```bash
# Pull the image
docker pull ghcr.io/vention-test-portal/test-portal-client:TAG_NAME

# Run the container
docker run -p 8080:80 ghcr.io/vention-test-portal/test-portal-client:TAG_NAME
```

The application will be available at `http://localhost:8080`.

## 3. Docker Compose Example

You can use the following `docker-compose.yml` to run the application:

```yaml
services:
  client:
    image: ghcr.io/vention-test-portal/test-portal-client:TAG_NAME
    ports:
      - '8080:80'
    restart: always
```

**Note:** The `VITE_API_URL` is baked into the image at build time and cannot be changed via `environment` variables in Docker Compose. To change the API URL, you must build a new image using the manual workflow described above.
