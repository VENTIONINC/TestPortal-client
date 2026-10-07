import { generatedApi as api } from "./generatedApi";
export const addTagTypes = ["Test Scenarios"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getApiV2TestScenariosForResultLinkManagement: build.query<
        GetApiV2TestScenariosForResultLinkManagementApiResponse,
        GetApiV2TestScenariosForResultLinkManagementApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-scenarios`,
          params: {
            projectId: queryArg.projectId,
            page: queryArg.page,
            limit: queryArg.limit,
            search: queryArg.search,
            createdById: queryArg.createdById,
            sort: queryArg.sort,
            folderId: queryArg.folderId,
            includeDescendants: queryArg.includeDescendants,
            suiteId: queryArg.suiteId,
          },
        }),
        providesTags: ["Test Scenarios"],
      }),
      getApiV2TestScenarioFolders: build.query<
        GetApiV2TestScenarioFoldersApiResponse,
        GetApiV2TestScenarioFoldersApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-scenario-folders`,
          params: {
            projectId: queryArg.projectId,
          },
        }),
        providesTags: ["Test Scenarios"],
      }),
      postApiV2TestScenarioFolders: build.mutation<
        PostApiV2TestScenarioFoldersApiResponse,
        PostApiV2TestScenarioFoldersApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-scenario-folders`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Test Scenarios"],
      }),
      patchApiV2TestScenarioFoldersByFolderId: build.mutation<
        PatchApiV2TestScenarioFoldersByFolderIdApiResponse,
        PatchApiV2TestScenarioFoldersByFolderIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-scenario-folders/${queryArg.folderId}`,
          method: "PATCH",
          body: queryArg.body,
          params: {
            projectId: queryArg.projectId,
          },
        }),
        invalidatesTags: ["Test Scenarios"],
      }),
      deleteApiV2TestScenarioFoldersByFolderId: build.mutation<
        DeleteApiV2TestScenarioFoldersByFolderIdApiResponse,
        DeleteApiV2TestScenarioFoldersByFolderIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-scenario-folders/${queryArg.folderId}`,
          method: "DELETE",
          params: {
            projectId: queryArg.projectId,
            disposition: queryArg.disposition,
          },
        }),
        invalidatesTags: ["Test Scenarios"],
      }),
      getApiV2TestSuites: build.query<
        GetApiV2TestSuitesApiResponse,
        GetApiV2TestSuitesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-suites`,
          params: {
            projectId: queryArg.projectId,
          },
        }),
        providesTags: ["Test Scenarios"],
      }),
      postApiV2TestSuites: build.mutation<
        PostApiV2TestSuitesApiResponse,
        PostApiV2TestSuitesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-suites`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Test Scenarios"],
      }),
      getApiV2TestSuitesBySuiteId: build.query<
        GetApiV2TestSuitesBySuiteIdApiResponse,
        GetApiV2TestSuitesBySuiteIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-suites/${queryArg.suiteId}`,
          params: {
            projectId: queryArg.projectId,
          },
        }),
        providesTags: ["Test Scenarios"],
      }),
      patchApiV2TestSuitesBySuiteId: build.mutation<
        PatchApiV2TestSuitesBySuiteIdApiResponse,
        PatchApiV2TestSuitesBySuiteIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-suites/${queryArg.suiteId}`,
          method: "PATCH",
          body: queryArg.body,
          params: {
            projectId: queryArg.projectId,
          },
        }),
        invalidatesTags: ["Test Scenarios"],
      }),
      deleteApiV2TestSuitesBySuiteId: build.mutation<
        DeleteApiV2TestSuitesBySuiteIdApiResponse,
        DeleteApiV2TestSuitesBySuiteIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-suites/${queryArg.suiteId}`,
          method: "DELETE",
          params: {
            projectId: queryArg.projectId,
          },
        }),
        invalidatesTags: ["Test Scenarios"],
      }),
      postApiV2TestSuitesBySuiteIdMembers: build.mutation<
        PostApiV2TestSuitesBySuiteIdMembersApiResponse,
        PostApiV2TestSuitesBySuiteIdMembersApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-suites/${queryArg.suiteId}/members`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Test Scenarios"],
      }),
      deleteApiV2TestSuitesBySuiteIdMembers: build.mutation<
        DeleteApiV2TestSuitesBySuiteIdMembersApiResponse,
        DeleteApiV2TestSuitesBySuiteIdMembersApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-suites/${queryArg.suiteId}/members`,
          method: "DELETE",
          body: queryArg.body,
        }),
        invalidatesTags: ["Test Scenarios"],
      }),
      putApiV2TestSuitesBySuiteIdMembersOrder: build.mutation<
        PutApiV2TestSuitesBySuiteIdMembersOrderApiResponse,
        PutApiV2TestSuitesBySuiteIdMembersOrderApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-suites/${queryArg.suiteId}/members/order`,
          method: "PUT",
          body: queryArg.body,
        }),
        invalidatesTags: ["Test Scenarios"],
      }),
      patchApiV2TestScenariosBulkFolder: build.mutation<
        PatchApiV2TestScenariosBulkFolderApiResponse,
        PatchApiV2TestScenariosBulkFolderApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-scenarios/bulk-folder`,
          method: "PATCH",
          body: queryArg.body,
        }),
        invalidatesTags: ["Test Scenarios"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as generatedScenarioManagementApi };
export type GetApiV2TestScenariosForResultLinkManagementApiResponse =
  /** status 200 Paginated test scenarios */ TestScenarioListResponse;
export type GetApiV2TestScenariosForResultLinkManagementApiArg = {
  projectId: string;
  page?: number;
  limit?: number;
  search?: string;
  createdById?: string;
  sort?: "recently_created" | "recently_updated" | "title_asc";
  folderId?: string | "unfiled";
  includeDescendants?: boolean;
  suiteId?: string;
};
export type GetApiV2TestScenarioFoldersApiResponse =
  /** status 200 Organization operation succeeded */ {
    id: string;
    projectId: string;
    parentId: string | null;
    name: string;
    position: number;
    createdAt: string;
    updatedAt: string;
    scenarioCount: number;
    _count: {
      scenarios: number;
    };
    children: TestScenarioFolder[];
  }[];
export type GetApiV2TestScenarioFoldersApiArg = {
  projectId: string;
};
export type PostApiV2TestScenarioFoldersApiResponse =
  /** status 201 Organization operation succeeded */ {
    id: string;
    projectId: string;
    parentId: string | null;
    name: string;
    position: number;
    createdAt: string;
    updatedAt: string;
  };
export type PostApiV2TestScenarioFoldersApiArg = {
  body: {
    projectId: string;
    name: string;
    parentId?: string | null;
    position?: number;
  };
};
export type PatchApiV2TestScenarioFoldersByFolderIdApiResponse =
  /** status 200 Organization operation succeeded */ {
    id: string;
    projectId: string;
    parentId: string | null;
    name: string;
    position: number;
    createdAt: string;
    updatedAt: string;
  };
export type PatchApiV2TestScenarioFoldersByFolderIdApiArg = {
  folderId: string;
  projectId: string;
  body: {
    name?: string;
    parentId?: string | null;
    position?: number;
  };
};
export type DeleteApiV2TestScenarioFoldersByFolderIdApiResponse =
  /** status 200 Organization operation succeeded */ {
    deleted: true;
  };
export type DeleteApiV2TestScenarioFoldersByFolderIdApiArg = {
  folderId: string;
  projectId: string;
  disposition: "parent" | "unfiled";
};
export type GetApiV2TestSuitesApiResponse =
  /** status 200 Organization operation succeeded */ {
    id: string;
    projectId: string;
    name: string;
    description: string | null;
    purpose: string | null;
    release: string | null;
    createdAt: string;
    updatedAt: string;
    members?: {
      suiteId: string;
      testScenarioId: string;
      position: number;
      createdAt: string;
    }[];
  }[];
export type GetApiV2TestSuitesApiArg = {
  projectId: string;
};
export type PostApiV2TestSuitesApiResponse =
  /** status 201 Organization operation succeeded */ {
    id: string;
    projectId: string;
    name: string;
    description: string | null;
    purpose: string | null;
    release: string | null;
    createdAt: string;
    updatedAt: string;
    members?: {
      suiteId: string;
      testScenarioId: string;
      position: number;
      createdAt: string;
    }[];
  };
export type PostApiV2TestSuitesApiArg = {
  body: {
    projectId: string;
    name: string;
    description?: string | null;
    purpose?: string | null;
    release?: string | null;
  };
};
export type GetApiV2TestSuitesBySuiteIdApiResponse =
  /** status 200 Organization operation succeeded */ {
    id: string;
    projectId: string;
    name: string;
    description: string | null;
    purpose: string | null;
    release: string | null;
    createdAt: string;
    updatedAt: string;
    members?: {
      suiteId: string;
      testScenarioId: string;
      position: number;
      createdAt: string;
    }[];
  };
export type GetApiV2TestSuitesBySuiteIdApiArg = {
  suiteId: string;
  projectId: string;
};
export type PatchApiV2TestSuitesBySuiteIdApiResponse =
  /** status 200 Organization operation succeeded */ {
    id: string;
    projectId: string;
    name: string;
    description: string | null;
    purpose: string | null;
    release: string | null;
    createdAt: string;
    updatedAt: string;
    members?: {
      suiteId: string;
      testScenarioId: string;
      position: number;
      createdAt: string;
    }[];
  };
export type PatchApiV2TestSuitesBySuiteIdApiArg = {
  suiteId: string;
  projectId: string;
  body: {
    name?: string;
    description?: string | null;
    purpose?: string | null;
    release?: string | null;
  };
};
export type DeleteApiV2TestSuitesBySuiteIdApiResponse =
  /** status 200 Organization operation succeeded */ {
    deleted: true;
  };
export type DeleteApiV2TestSuitesBySuiteIdApiArg = {
  suiteId: string;
  projectId: string;
};
export type PostApiV2TestSuitesBySuiteIdMembersApiResponse =
  /** status 200 Organization operation succeeded */ {
    suiteId: string;
    testScenarioId: string;
    position: number;
    createdAt: string;
  }[];
export type PostApiV2TestSuitesBySuiteIdMembersApiArg = {
  suiteId: string;
  body: {
    projectId: string;
    scenarioIds: string[];
  };
};
export type DeleteApiV2TestSuitesBySuiteIdMembersApiResponse =
  /** status 200 Organization operation succeeded */ {
    suiteId: string;
    testScenarioId: string;
    position: number;
    createdAt: string;
  }[];
export type DeleteApiV2TestSuitesBySuiteIdMembersApiArg = {
  suiteId: string;
  body: {
    projectId: string;
    scenarioIds: string[];
  };
};
export type PutApiV2TestSuitesBySuiteIdMembersOrderApiResponse =
  /** status 200 Organization operation succeeded */ {
    scenarioIds: string[];
  };
export type PutApiV2TestSuitesBySuiteIdMembersOrderApiArg = {
  suiteId: string;
  body: {
    projectId: string;
    scenarioIds: string[];
  };
};
export type PatchApiV2TestScenariosBulkFolderApiResponse =
  /** status 200 Organization operation succeeded */ {
    moved: number;
  };
export type PatchApiV2TestScenariosBulkFolderApiArg = {
  body: {
    projectId: string;
    scenarioIds: string[];
    folderId: string | null;
  };
};
export type TestScenarioCreatorSummary = {
  id: string;
  name: string;
  email: string;
};
export type TestScenarioSummary = {
  id: string;
  projectId: string;
  createdById: string;
  title: string;
  scenarioKey: string | null;
  details: string | null;
  createdBy: TestScenarioCreatorSummary;
  createdAt: string;
  updatedAt: string;
  folderId: string | null;
  folderName: string | null;
  matchedSuiteId?: string | null;
};
export type TestScenarioListResponse = {
  scenarios: TestScenarioSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export type ErrorResponse = {
  error: string;
};
export type TestScenarioFolder = {
  id?: string;
  projectId?: string;
  parentId?: string | null;
  name?: string;
  position?: number;
  createdAt?: string;
  updatedAt?: string;
  scenarioCount?: number;
  _count?: {
    scenarios?: number;
  };
  children?: TestScenarioFolder[];
};
export const {
  useGetApiV2TestScenariosForResultLinkManagementQuery,
  useLazyGetApiV2TestScenariosForResultLinkManagementQuery,
  useGetApiV2TestScenarioFoldersQuery,
  useLazyGetApiV2TestScenarioFoldersQuery,
  usePostApiV2TestScenarioFoldersMutation,
  usePatchApiV2TestScenarioFoldersByFolderIdMutation,
  useDeleteApiV2TestScenarioFoldersByFolderIdMutation,
  useGetApiV2TestSuitesQuery,
  useLazyGetApiV2TestSuitesQuery,
  usePostApiV2TestSuitesMutation,
  useGetApiV2TestSuitesBySuiteIdQuery,
  useLazyGetApiV2TestSuitesBySuiteIdQuery,
  usePatchApiV2TestSuitesBySuiteIdMutation,
  useDeleteApiV2TestSuitesBySuiteIdMutation,
  usePostApiV2TestSuitesBySuiteIdMembersMutation,
  useDeleteApiV2TestSuitesBySuiteIdMembersMutation,
  usePutApiV2TestSuitesBySuiteIdMembersOrderMutation,
  usePatchApiV2TestScenariosBulkFolderMutation,
} = injectedRtkApi;
