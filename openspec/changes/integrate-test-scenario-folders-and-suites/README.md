# integrate-test-scenario-folders-and-suites

Integrate the Test Scenario Catalog with the project-scoped folder and manually curated suite APIs.

The client bindings were generated from the matching backend branch's OpenAPI document by calling `generateOpenAPISpec()` in `../TestPortal-backend/src/lib/openapi/index.ts` while that repository was on `feature/test-suites-and-folders`. The reproducible command is `RTK_QUERY_SCENARIO_MANAGEMENT_OPENAPI_URL=<backend-openapi-url-or-file> yarn generate-scenario-management-api`. It generates the primary and scenario-management RTK Query bindings. The script types recursive folder children for the generator because the backend OpenAPI currently declares that property as `unknown`.
