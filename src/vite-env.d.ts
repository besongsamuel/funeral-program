/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ASSISTANT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*amplify_outputs.json' {
  const value: Record<string, unknown>;
  export default value;
}
