const { spawnSync } = require('node:child_process');
const { mkdtempSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const openApiSource = process.env.RTK_QUERY_SCENARIO_MANAGEMENT_OPENAPI_URL ?? 'http://localhost:3001/api/openapi.json';
const operationId = 'getApiV2TestScenariosForResultLinkManagement';

async function readOpenApi(source) {
  if (!/^https?:\/\//.test(source)) return JSON.parse(readFileSync(source, 'utf8'));

  const response = await fetch(source);
  if (!response.ok) throw new Error(`OpenAPI request failed with HTTP ${response.status}`);
  return response.json();
}

async function main() {
  const openApi = await readOpenApi(openApiSource);
  const scenarioList = openApi.paths?.['/api/v2/test-scenarios']?.get;
  const searchParameter = scenarioList?.parameters?.find((parameter) => parameter.name === 'search');
  const scenarioKey = openApi.components?.schemas?.TestScenarioSummary?.properties?.scenarioKey;

  if (!scenarioList || !searchParameter || !scenarioKey) {
    throw new Error('The backend OpenAPI document must define searchable scenario summaries with scenarioKey.');
  }

  scenarioList.operationId = operationId;

  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'test-portal-scenario-management-'));
  const temporarySchemaPath = join(temporaryDirectory, 'openapi.json');
  writeFileSync(temporarySchemaPath, JSON.stringify(openApi));

  try {
    const result = spawnSync(
      process.execPath,
      ['./node_modules/@rtk-query/codegen-openapi/lib/bin/cli.mjs', 'rtk-query-scenario-management-codegen.config.cjs'],
      {
        env: { ...process.env, RTK_QUERY_SCENARIO_MANAGEMENT_OPENAPI_FILE: temporarySchemaPath },
        stdio: 'inherit',
      },
    );

    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`RTK Query code generation exited with status ${result.status}`);
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
