# Deploy FE to ECS

This guide explains how to deploy the Test Portal Client to AWS ECS using the
`Deploy FE to ECS (manual)` GitHub Actions workflow
(`.github/workflows/deploy-fe-ecs.yml`).

## Overview

The workflow is triggered manually. On each run it:

1. Logs into AWS via OIDC (no long-lived keys).
2. Builds the Docker image from the repository's `Dockerfile`, passing
   `API_URL` as a build argument (it becomes `VITE_API_URL` inside the bundle).
3. Pushes the image to ECR as both `:<short-sha>` and `:latest`.
4. Forces a new deployment of the target ECS service.
5. Waits until the service reaches a stable state and prints a summary.

Naming convention per environment (`<env>` is one of `dev`, `stg`, `prod`):

| Resource     | Name                       |
| ------------ | -------------------------- |
| ECR repo     | `<env>-testportal-fe`      |
| ECS cluster  | `<env>-cluster`            |
| ECS service  | `<env>-fe-service`         |
| AWS region   | `eu-central-1`             |

## Prerequisites

These should already be configured by the ops/devops side. If a deploy fails
because something is missing, ping the infra owner.

- **GitHub secret** `AWS_GITHUB_ACTIONS_ROLE_ARN` — IAM role assumed via OIDC.
- **GitHub variable** `VITE_API_URL` — default backend URL used when the
  `api_url` input is not provided. Can be set per environment
  (`dev` / `stg` / `prod`) or as a repository variable.
- AWS resources for the target environment must exist: ECR repository,
  ECS cluster, ECS service, task definition, ALB / target group, etc.

## How to run a deploy

1. Open the repository on GitHub → **Actions** tab.
2. In the left sidebar choose **Deploy FE to ECS (manual)**.
3. Click **Run workflow** (top-right).
4. Select the **Branch** to deploy from (usually `main` for `prod`,
   feature branch for `dev`).
5. Fill in the inputs (see below).
6. Click **Run workflow** and watch the run.

A typical deploy takes ~5–10 minutes (image build + ECS rollout).

### Inputs

| Input         | Required | Default          | Description                                                                                       |
| ------------- | -------- | ---------------- | ------------------------------------------------------------------------------------------------- |
| `environment` | yes      | `dev`            | Target environment: `dev`, `stg`, or `prod`. Drives ECR / ECS resource names.                     |
| `image_tag`   | no       | short commit SHA | Custom Docker tag for the built image. Leave empty unless you need to pin a specific tag.         |
| `api_url`     | no       | `vars.VITE_API_URL` | Overrides the backend URL baked into the bundle for this build.                                |

> `api_url` is **baked into the JS bundle at build time** via `VITE_API_URL`.
> It cannot be changed at runtime — to switch the backend URL, run the
> workflow again.

### Examples

- **Standard dev deploy from `main`:**
  - `environment`: `dev`
  - `image_tag`: _(empty)_
  - `api_url`: _(empty — uses `VITE_API_URL` from `dev` environment)_
  - Result: image pushed as `…/dev-testportal-fe:<sha>` and `:latest`,
    `dev-fe-service` redeployed.

- **Deploy a feature branch to dev against a custom backend:**
  - Branch: `feat/new-login`
  - `environment`: `dev`
  - `api_url`: `https://api-pr-123.dev.testportal.example.com`

- **Production release:**
  - Branch: `main`
  - `environment`: `prod`
  - `image_tag`: `v1.4.0`
  - `api_url`: _(empty — uses prod `VITE_API_URL`)_

## What you'll see in the run

Key steps in the job log:

- **Configure AWS credentials (OIDC)** — assumes the IAM role.
- **Resolve variables** — computes the image URI, cluster / service names,
  and the effective API URL. The resolved values are printed in the summary.
- **Build & push image** — Docker build with `--build-arg API_URL=...`,
  pushed to ECR.
- **Trigger ECS deployment** — `aws ecs update-service --force-new-deployment`.
- **Wait for service to stabilize** — waits up to ~10 minutes for the new
  tasks to become healthy. If they never do, the step fails.
- **Deployment summary** — a table at the bottom of the run page with the
  environment, image, API URL, cluster, service, and commit SHA.

## Rolling back

The workflow does not have a dedicated rollback button. To roll back:

1. Find the previous good commit SHA (e.g. from the run summary or
   `git log`).
2. Run the workflow again with:
   - the same `environment`,
   - `image_tag` set to that SHA (short, 7 characters),
   - the branch that contains that commit.

Because images are kept in ECR by SHA, this will redeploy the older image
as long as it hasn't been garbage-collected.

## Troubleshooting

### `Credentials could not be loaded, please check your action inputs`

The OIDC step couldn't get AWS credentials. Common causes:

- The secret `AWS_GITHUB_ACTIONS_ROLE_ARN` is empty or missing.
- The job overrides `permissions:` and drops `id-token: write`.
- The OIDC provider `token.actions.githubusercontent.com` doesn't exist in
  the AWS account, or the role's trust policy doesn't match this repo.

### `Neither workflow input 'api_url' nor repo variable VITE_API_URL is set`

The build needs a backend URL and didn't find one. Either:

- Pass `api_url` as an input when running the workflow, or
- Make sure the variable `VITE_API_URL` is set — as a **repository
  variable** (Settings → Secrets and variables → Actions → **Variables**),
  or as an **environment variable** for the chosen environment (in which
  case the job must be tied to that environment).

### `AccessDenied` on `ecr:*` or `ecs:UpdateService`

The IAM role is missing permissions for the chosen environment. The role
must list the corresponding ECR repository and ECS service in its policy
(`<env>-testportal-fe`, `<env>-fe-service`).

### `services-stable` step times out

ECS started the new tasks but they never became healthy. Check:

- ECS service events in the AWS console for the failure reason
  (image pull, health check, port, IAM, etc.).
- CloudWatch logs of the new task (nginx access / error logs).
- That `nginx.conf` exposes port `80` and the target group health check
  hits a path nginx actually serves.

### Build fails inside `yarn build`

This is unrelated to AWS — same as a local build failure. Reproduce
locally with the same `API_URL`:

```bash
docker build --build-arg API_URL=https://api.dev.testportal.example.com -t fe:test .
```

## Useful links

- Workflow file: `.github/workflows/deploy-fe-ecs.yml`
- Dockerfile: `Dockerfile`
- Nginx config used in the image: `nginx.conf`
- General Docker / GHCR usage: `docs/DOCKER.md`
