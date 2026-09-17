module.exports = {
  schemaFile:
    process.env.RTK_QUERY_OPENAPI_URL ?? 'http://dev-alb-210489249.eu-central-1.elb.amazonaws.com/api/openapi.json',
  apiFile: './src/redux/apis/baseApi.ts',
  apiImport: 'baseApi',
  outputFiles: {
    './src/redux/apis/generatedApi.ts': {
      exportName: 'generatedApi',
      hooks: { queries: true, lazyQueries: true, mutations: true },
      tag: true, // Enable automatic tag generation
    },
  },
  tag: true, // Generate providesTags/invalidatesTags automatically
  hooks: { queries: true, lazyQueries: true, mutations: true }, // Generate useQuery, lazy query, and useMutation hooks
};
