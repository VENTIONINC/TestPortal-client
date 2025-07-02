module.exports = {
  schemaFile: 'http://localhost:4000/openapi.json',
  apiFile: './src/redux/apis/mcp-api/mcpApi.ts',
  apiImport: 'mcpApi',
  outputFile: './src/redux/apis/mcp-api/generated.ts',
  exportName: 'generatedMcpApi',
  hooks: true,
  tag: true,
};
