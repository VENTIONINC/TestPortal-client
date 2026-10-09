module.exports = {
  schemaFile: process.env.RTK_QUERY_RESULT_DETAIL_OPENAPI_URL ?? 'http://localhost:3001/api/openapi.json',
  apiFile: './src/redux/apis/generatedApi.ts',
  apiImport: 'generatedApi',
  outputFile: './src/redux/apis/generatedResultDetailApi.ts',
  exportName: 'generatedResultDetailApi',
  filterEndpoints: ['getResultDetailWithRelatedScenarios'],
  tag: true,
  hooks: { queries: true, lazyQueries: true, mutations: false },
};
