/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA?: 'api' | 'mock';
  readonly VITE_API_BASE?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
