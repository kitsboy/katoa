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
  /** Satohash API base (stamp + health). Default https://api.satohash.io */
  readonly VITE_SATOHASH_API_URL?: string;
  /** Satohash frontend (verify + stamp guide links). Default https://satohash.io */
  readonly VITE_SATOHASH_URL?: string;
  /** Optional family free-tier key for X-Satohash-Key — avoid shipping secrets in public builds */
  readonly VITE_SATOHASH_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}