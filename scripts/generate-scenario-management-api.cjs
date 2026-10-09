const { spawnSync } = require('node:child_process');
const { mkdtempSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const openApiSource = process.env.RTK_QUERY_SCENARIO_MANAGEMENT_OPENAPI_URL ?? 'http://localhost:3001/api/openapi.json';
const operationIds = new Map([
  ['GET /api/v2/test-scenario-folders', 'getApiV2TestScenarioFolders'],
  ['POST /api/v2/test-scenario-folders', 'postApiV2TestScenarioFolders'],
  ['PATCH /api/v2/test-scenario-folders/{folderId}', 'patchApiV2TestScenarioFoldersByFolderId'],
  ['DELETE /api/v2/test-scenario-folders/{folderId}', 'deleteApiV2TestScenarioFoldersByFolderId'],
  ['GET /api/v2/test-suites', 'getApiV2TestSuites'],
  ['POST /api/v2/test-suites', 'postApiV2TestSuites'],
  ['GET /api/v2/test-suites/{suiteId}', 'getApiV2TestSuitesBySuiteId'],
  ['PATCH /api/v2/test-suites/{suiteId}', 'patchApiV2TestSuitesBySuiteId'],
  ['DELETE /api/v2/test-suites/{suiteId}', 'deleteApiV2TestSuitesBySuiteId'],
  ['POST /api/v2/test-suites/{suiteId}/members', 'postApiV2TestSuitesBySuiteIdMembers'],
  ['DELETE /api/v2/test-suites/{suiteId}/members', 'deleteApiV2TestSuitesBySuiteIdMembers'],
  ['PUT /api/v2/test-suites/{suiteId}/members/order', 'putApiV2TestSuitesBySuiteIdMembersOrder'],
  ['PATCH /api/v2/test-scenarios/bulk-folder', 'patchApiV2TestScenariosBulkFolder'],
]);

async function readOpenApi(source) {
  if (!/^https?:\/\//.test(source)) return JSON.parse(readFileSync(source, 'utf8'));

  const response = await fetch(source);
  if (!response.ok) throw new Error(`OpenAPI request failed with HTTP ${response.status}`);
  return response.json();
}

function typeFolderChildren(openApi) {
  openApi.components ??= {};
  openApi.components.schemas ??= {};
  openApi.components.schemas.TestScenarioFolder = {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      projectId: { type: 'string', format: 'uuid' },
      parentId: { type: ['string', 'null'], format: 'uuid' },
      name: { type: 'string' },
      position: { type: 'integer' },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' },
      scenarioCount: { type: 'integer', minimum: 0 },
      _count: { type: 'object', properties: { scenarios: { type: 'integer', minimum: 0 } } },
      children: { type: 'array', items: { $ref: '#/components/schemas/TestScenarioFolder' } },
    },
  };

  const folderList = openApi.paths?.['/api/v2/test-scenario-folders']?.get?.responses?.['200']?.content?.['application/json']?.schema;
  if (folderList?.type === 'array' && folderList.items?.properties?.children) {
    folderList.items.properties.children = {
      type: 'array',
      items: { $ref: '#/components/schemas/TestScenarioFolder' },
    };
  }
}

async function main() {
  const openApi = await readOpenApi(openApiSource);
  typeFolderChildren(openApi);
  const scenarioList = openApi.paths?.['/api/v2/test-scenarios']?.get;
  const searchParameter = scenarioList?.parameters?.find((parameter) => parameter.name === 'search');
  const scenarioKey = openApi.components?.schemas?.TestScenarioSummary?.properties?.scenarioKey;

  if (!scenarioList || !searchParameter || !scenarioKey) {
    throw new Error('The backend OpenAPI document must define searchable scenario summaries with scenarioKey.');
  }

  for (const [key, operationId] of operationIds) {
    const separatorIndex = key.indexOf(' ');
    const method = key.slice(0, separatorIndex).toLowerCase();
    const path = key.slice(separatorIndex + 1);
    const operation = openApi.paths?.[path]?.[method];
    if (!operation) throw new Error(`The backend OpenAPI document is missing ${key}.`);
    operation.operationId = operationId;
  }

  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'test-portal-scenario-management-'));
  const mainSchemaPath = join(temporaryDirectory, 'openapi.json');
  const scenarioManagementSchemaPath = join(temporaryDirectory, 'scenario-management-openapi.json');
  const scenarioManagementOpenApi = structuredClone(openApi);
  scenarioManagementOpenApi.paths['/api/v2/test-scenarios'].get.operationId = 'getApiV2TestScenariosForResultLinkManagement';
  writeFileSync(mainSchemaPath, JSON.stringify(openApi));
  writeFileSync(scenarioManagementSchemaPath, JSON.stringify(scenarioManagementOpenApi));

  try {
    const codegen = './node_modules/@rtk-query/codegen-openapi/lib/bin/cli.mjs';
    for (const [config, env] of [
      ['rtk-query-codegen.config.cjs', { RTK_QUERY_OPENAPI_URL: mainSchemaPath }],
      ['rtk-query-scenario-management-codegen.config.cjs', { RTK_QUERY_SCENARIO_MANAGEMENT_OPENAPI_FILE: scenarioManagementSchemaPath }],
    ]) {
      const result = spawnSync(process.execPath, [codegen, config], {
        env: { ...process.env, ...env },
        stdio: 'inherit',
      });
      if (result.error) throw result.error;
      if (result.status !== 0) throw new Error(`${config} exited with status ${result.status}`);
    }
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
