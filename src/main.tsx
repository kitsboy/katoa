import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    __KATOA_SENTRY__?: any;
  }
}

// Client-side Sentry (SPA) — wired-but-off: dynamic import keeps @sentry/react
// out of the first-paint bundle. No-op until VITE_SENTRY_DSN is set.
if (import.meta.env.VITE_SENTRY_DSN) {
  import('@sentry/react').then((Sentry) => {
    window.__KATOA_SENTRY__ = Sentry;
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
      tracesSampleRate: 0.3,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      environment: import.meta.env.MODE,
    });
  });
}

// Build stamp — referenced so the entry chunk hash always changes on emergency redeploys
// (CF has Origin-keyed cache that can poison /assets/*.js with SPA HTML)
export const KATOA_BUILD_STAMP = '2026-08-11-js-poison-bust-2';
if (typeof document !== 'undefined') {
  document.documentElement.dataset.katoaBuild = KATOA_BUILD_STAMP;
}

const SW_STRINGS: Record<string, { update: string; refresh: string }> = {
  en: { update: 'Update available.', refresh: 'Refresh' },
  es: { update: 'Actualización disponible.', refresh: 'Actualizar' },
  pt: { update: 'Atualização disponível.', refresh: 'Atualizar' },
  fr: { update: 'Mise à jour disponible.', refresh: 'Actualiser' },
  de: { update: 'Update verfügbar.', refresh: 'Aktualisieren' },
  ja: { update: '更新があります。', refresh: '更新' },
  zh: { update: '有可用更新。', refresh: '刷新' },
};

function swStrings() {
  const lang = localStorage.getItem('katoa-language') ?? 'en';
  return SW_STRINGS[lang] ?? SW_STRINGS.en;
}

/** Set when the user asked for a reload, so controllerchange does not re-banner. */
let requestedReload = false;

function showUpdateBanner() {
  if (document.querySelector('[data-sw-update]')) return;
  const { update, refresh } = swStrings();

  const banner = document.createElement('div');
  banner.setAttribute('data-sw-update', 'true');
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  banner.className =
    'fixed top-16 inset-x-4 z-[200] mx-auto max-w-md p-3 rounded-xl bg-charcoal-900 border border-neon-cyan-500/40 text-center text-sm text-gray-200 shadow-xl';

  const text = document.createTextNode(`${update} `);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'ml-2 text-neon-cyan-400 font-semibold underline min-h-[44px] px-2';
  button.textContent = refresh;
  button.addEventListener('click', () => {
    requestedReload = true;
    window.location.reload();
  });

  banner.appendChild(text);
  banner.appendChild(button);
  document.body.appendChild(banner);
  button.focus();
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // A waiting worker may already exist by the time register() resolves
        // (slow networks can finish installing before we attach listeners).
        if (reg.waiting && navigator.serviceWorker.controller) {
          showUpdateBanner();
        }
        // A new worker installing while this tab is open.
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing;
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateBanner();
            }
          });
        });
        // sw.js uses skipWaiting + clients.claim, so a new worker can take
        // control of this tab while we are still running old assets — that
        // fires controllerchange and is the most reliable update signal.
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!requestedReload) showUpdateBanner();
        });
        // Long-lived tabs: re-check hourly and when the tab regains focus.
        const poll = () => {
          reg.update().catch(() => {});
        };
        setInterval(poll, 60 * 60 * 1000);
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') poll();
        });
      })
      .catch((err) => console.warn('Service worker registration failed:', err));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);