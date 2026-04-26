/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_DEMO_MODE?: string;
  readonly VITE_OPENROUTER_API_KEY?: string;
  /** Direct link to Android APK (S3, GitHub Releases, etc.). Empty = show “soon” on landing. */
  readonly VITE_APP_DOWNLOAD_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
