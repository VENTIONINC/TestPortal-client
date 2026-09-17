# GitHub through Docker MCP

Codex starts Docker MCP Toolkit through `.codex/config.toml` using the separate
`testportal-github` profile. It contains only `github-official`; the existing
`invivo` profile is independent. Direct GitHub MCP access and the GitHub and
Linear apps are disabled in this project's Codex configuration.

The generated `mcp-profile.json` stores the server image/catalog snapshot and a
14-tool allowlist for repository reads, GitHub Issues, and pull requests. Codex
also applies the same allowlist and prompts for write operations.

## Setup

Install Docker Desktop with MCP Toolkit profile support (the reference setup
uses Docker Desktop 4.62 or later), start Docker Desktop, and run from the
repository root:

```sh
docker mcp profile import .docker/mcp-profile.json
docker mcp profile server ls --filter profile=testportal-github
```

The imported profile ID is `testportal-github`. No credentials are exported.
Each developer configures authentication in Docker's local credential store.
If Docker reports an existing profile, inspect it before replacing it.

## GitHub authentication

Use a token authorized to access `VENTIONINC/TestPortal-client`. If GitHub CLI
is already authenticated, check its account and access first:

```sh
gh auth status --hostname github.com
```

For a new GitHub CLI login:

```sh
gh auth login --hostname github.com --scopes repo,read:org
```

Copy the token to Docker without printing it:

```sh
gh auth token --hostname github.com | tr -d '\n' | \
  docker mcp secret set github.personal_access_token
```

Removing the trailing newline avoids an invalid authorization header. Never put
tokens in the committed profile or Codex configuration. The exported profile
uses Docker's default credential store, so this credential can be shared with
other local GitHub Docker profiles; changing it may affect `invivo` too.

## Verify and activate

```sh
docker mcp tools --gateway-arg=--profile --gateway-arg=testportal-github ls
docker mcp tools --gateway-arg=--profile --gateway-arg=testportal-github \
  call get_file_contents owner=VENTIONINC repo=TestPortal-client path=README.md
```

Expect 14 GitHub tools. A private-repository `404` can indicate missing token or
organization access. Restart Codex after importing or changing the profile so
it reloads the configuration and tools. Project configuration requires a
trusted project: see [official OpenAI MCP documentation](https://developers.openai.com/codex/mcp/).

The verified local Docker setup has `dynamic-tools` and `tool-name-prefix`
disabled. These are global Toolkit features. If extra management tools or
prefixed names appear on another machine, inspect `docker mcp feature ls` before
changing global settings. The Codex allowlist expects unprefixed names.

## Refresh the export

After intentionally changing the Docker profile, export it and keep the Codex
allowlist aligned:

```sh
docker mcp profile export testportal-github .docker/mcp-profile.json
git diff -- .codex/config.toml .docker/mcp-profile.json
```

Do not edit the generated catalog snapshot by hand.
