module.exports = {
  schemaFile: process.env.RTK_QUERY_SCENARIO_MANAGEMENT_OPENAPI_FILE,
  apiFile: './src/redux/apis/generatedApi.ts',
  apiImport: 'generatedApi',
  outputFile: './src/redux/apis/generatedScenarioManagementApi.ts',
  exportName: 'generatedScenarioManagementApi',
  filterEndpoints: ['getApiV2TestScenariosForResultLinkManagement'],
  tag: true,
  hooks: { queries: true, lazyQueries: true, mutations: false },
};
