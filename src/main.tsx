import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function showUpdateBanner() {
  if (document.querySelector('[data-sw-update]')) return;

  const banner = document.createElement('div');
  banner.setAttribute('data-sw-update', 'true');
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  banner.className =
    'fixed top-16 inset-x-4 z-[200] mx-auto max-w-md p-3 rounded-xl bg-charcoal-900 border border-neon-cyan-500/40 text-center text-sm text-gray-200 shadow-xl';

  const text = document.createTextNode('Update available. ');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'ml-2 text-neon-cyan-400 font-semibold underline';
  button.textContent = 'Refresh';
  button.addEventListener('click', () => window.location.reload());

  banner.appendChild(text);
  banner.appendChild(button);
  document.body.appendChild(banner);
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