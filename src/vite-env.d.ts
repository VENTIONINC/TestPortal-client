/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_MCP_CLIENT_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
