import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

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
  button.addEventListener('click', () => window.location.reload());

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
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing;
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateBanner();
            }
          });
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