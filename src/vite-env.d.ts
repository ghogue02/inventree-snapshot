
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  // add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
