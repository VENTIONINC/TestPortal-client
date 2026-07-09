module.exports = {
  schemaFile: 'http://dev-alb-210489249.eu-central-1.elb.amazonaws.com/api/openapi.json',
  apiFile: './src/redux/apis/baseApi.ts',
  apiImport: 'baseApi',
  outputFiles: {
    './src/redux/apis/generatedApi.ts': {
      exportName: 'generatedApi',
      hooks: true,
      tag: true, // Enable automatic tag generation
    },
  },
  tag: true, // Generate providesTags/invalidatesTags automatically
  hooks: true, // Generate useQuery and useMutation hooks
};
