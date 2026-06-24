## 1. Repository Licensing Artifacts

- [x] 1.1 Add a root `LICENSE` file containing the standard Apache License 2.0 text
- [x] 1.2 Update `package.json` to declare `Apache-2.0`
- [x] 1.3 Refresh `yarn.lock` only if Yarn records root package metadata changes
- [x] 1.4 Add a README license section that identifies Apache 2.0 and links to `LICENSE`

## 2. Header Tooling

- [x] 2.1 Add a shared license header utility with the standard VENSOLUTIONSGROUP LTD Apache 2.0 header and supported code extensions
- [x] 2.2 Add a package `new:file` script that creates supported files with the standard header and refuses missing, existing, or unsupported targets
- [x] 2.3 Add a package `headers:add` script that backfills missing headers across configured source directories
- [x] 2.4 Implement explicit generated-source handling for `src/redux/apis/generatedApi.ts`
- [x] 2.5 Run the bulk header command for supported non-generated source files after generated-source behavior is settled

## 3. Contribution Guidance

- [x] 3.1 Add a lightweight `CONTRIBUTING.md` with contribution flow, Apache 2.0 terms, and client validation commands
- [x] 3.2 Document `yarn new:file -- <path>` usage, supported extensions, and unsupported-extension behavior
- [x] 3.3 Document generated API header behavior so contributors know whether generated output is excluded or post-processed
- [x] 3.4 Update README to link to the contributing guide and mention the header backfill command

## 4. Validation

- [x] 4.1 Verify `yarn new:file -- <path>` creates a supported file with the standard header
- [x] 4.2 Verify `yarn new:file` fails cleanly when the path is missing
- [x] 4.3 Verify `yarn new:file -- <existing-path>` fails without overwriting the existing file
- [x] 4.4 Verify `yarn new:file -- <unsupported-path>` fails with supported extension guidance
- [x] 4.5 Verify `yarn headers:add` adds headers to missing supported files and skips already-headered, unsupported, and generated-excluded files as designed
- [x] 4.6 Run `yarn lint`
- [x] 4.7 Run `yarn build`
