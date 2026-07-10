/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_BTCPAY_SERVER_URL?: string;
  readonly VITE_BTCPAY_STORE_ID?: string;
  /** @deprecated Never use client-side API keys — server proxy only */
  readonly VITE_BTCMAP_API_URL?: string;
  readonly VITE_BTCMAP_APP_URL?: string;
  readonly VITE_BTCMAP_ENABLED?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_URL?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_DEMO_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}