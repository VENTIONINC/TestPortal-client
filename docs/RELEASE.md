# Release Guide

This document describes the recommended release flow for the Test Portal Client.

## Recommended Flow

1. Update the version in `package.json` on a feature or release branch.
2. Open a pull request targeting `main`.
3. Make sure the pull request passes the required checks for this repository.
4. Merge the pull request into `main`.
5. Pull the latest `main` locally and confirm you are on the exact merged commit.
6. Create a Git tag for the new version on that `main` commit.
7. Push the tag to GitHub.
8. Create a GitHub Release from that tag.

## Example

If the new version is `0.7.1`:

```bash
git checkout main
git pull origin main
git tag v0.7.1
git push origin v0.7.1
```

Then create a new GitHub Release for `v0.7.1` in the repository UI.

## Why This Flow Works

This is a normal and widely used workflow.

It follows a few good release practices:

- The version change is reviewed in a pull request before release.
- The release tag is created from the actual commit that reached `main`.
- GitHub Releases are tied to immutable Git tags instead of branch state.

## Best Practice Notes

- Prefer tagging the merge commit on `main`, not the PR branch commit before merge. This ensures the tag points to the exact code that was released.
- Use a consistent tag format. `vX.Y.Z` is the most common choice and works well with release tooling.
- Keep `package.json` version and Git tag aligned. Example: `package.json` = `0.7.1`, tag = `v0.7.1`.
- If release notes matter to your team or users, add a short summary of changes in the GitHub Release.

## Docker Workflow Relation

This repository also has a Docker deployment guide:

- [Docker Deployment Guide](./DOCKER.md)

Even if deployment is handled separately, keeping the Git tag aligned with the released version makes builds, release notes, and rollback points much easier to manage.
