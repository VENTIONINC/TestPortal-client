import { mcpApi as api } from "./mcpApi";
export const addTagTypes = ["Chat", "MCP", "Status"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      postApiChat: build.mutation<PostApiChatApiResponse, PostApiChatApiArg>({
        query: (queryArg) => ({
          url: `/api/chat`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Chat"],
      }),
      getApiChatStatus: build.query<
        GetApiChatStatusApiResponse,
        GetApiChatStatusApiArg
      >({
        query: () => ({ url: `/api/chat/status` }),
        providesTags: ["Chat"],
      }),
      postApiMcpConnect: build.mutation<
        PostApiMcpConnectApiResponse,
        PostApiMcpConnectApiArg
      >({
        query: () => ({ url: `/api/mcp/connect`, method: "POST" }),
        invalidatesTags: ["MCP"],
      }),
      getApiMcpStatus: build.query<
        GetApiMcpStatusApiResponse,
        GetApiMcpStatusApiArg
      >({
        query: () => ({ url: `/api/mcp/status` }),
        providesTags: ["MCP"],
      }),
      postApiMcpDisconnect: build.mutation<
        PostApiMcpDisconnectApiResponse,
        PostApiMcpDisconnectApiArg
      >({
        query: () => ({ url: `/api/mcp/disconnect`, method: "POST" }),
        invalidatesTags: ["MCP"],
      }),
      getStatus: build.query<GetStatusApiResponse, GetStatusApiArg>({
        query: () => ({ url: `/api/status` }),
        providesTags: ["Status"],
      }),
      getHealth: build.query<GetHealthApiResponse, GetHealthApiArg>({
        query: () => ({ url: `/api/status/health` }),
        providesTags: ["Status"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as generatedMcpApi };
export type PostApiChatApiResponse =
  /** status 200 Successful chat completion */ {
    /** The completion object from the AI service. */
    completion?: object;
    /** The entire conversation history. */
    conversation?: {
      role?: "user" | "system" | "assistant" | "tool";
      content?: string;
    }[];
    /** The first message from the request. */
    originalMessage?: object;
    /** Whether the service is connected to MCP. */
    mcpConnected?: boolean;
    timestamp?: string;
  };
export type PostApiChatApiArg = {
  body: {
    messages?: {
      role?: "user" | "system" | "assistant";
      content?: string;
    }[];
    options?: object;
  };
};
export type GetApiChatStatusApiResponse =
  /** status 200 OpenAI service status */ {
    ready?: boolean;
    hasApiKey?: boolean;
    baseURL?: string;
    provider?: string;
    mcpConnected?: boolean;
    timestamp?: string;
  };
export type GetApiChatStatusApiArg = void;
export type PostApiMcpConnectApiResponse = unknown;
export type PostApiMcpConnectApiArg = void;
export type GetApiMcpStatusApiResponse = unknown;
export type GetApiMcpStatusApiArg = void;
export type PostApiMcpDisconnectApiResponse = unknown;
export type PostApiMcpDisconnectApiArg = void;
export type GetStatusApiResponse =
  /** status 200 The application status */ Status;
export type GetStatusApiArg = void;
export type GetHealthApiResponse =
  /** status 200 The application health status */ {
    status?: string;
  };
export type GetHealthApiArg = void;
export type Status = {
  status?: string;
  timestamp?: string;
  service?: string;
  version?: string;
  uptime?: number;
  environment?: string;
  mcp?: {
    sdkVersion?: string;
    ready?: boolean;
    protocolVersion?: string;
    capabilities?: {
      tools?: boolean;
      resources?: boolean;
      prompts?: boolean;
    };
  };
};
export const {
  usePostApiChatMutation,
  useGetApiChatStatusQuery,
  usePostApiMcpConnectMutation,
  useGetApiMcpStatusQuery,
  usePostApiMcpDisconnectMutation,
  useGetStatusQuery,
  useGetHealthQuery,
} = injectedRtkApi;
