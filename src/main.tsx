import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing;
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              const banner = document.createElement('div');
              banner.className =
                'fixed top-16 inset-x-4 z-[200] mx-auto max-w-md p-3 rounded-xl bg-charcoal-900 border border-neon-cyan-500/40 text-center text-sm text-gray-200 shadow-xl';
              banner.innerHTML =
                'Update available. <button type="button" class="ml-2 text-neon-cyan-400 font-semibold underline">Refresh</button>';
              banner.querySelector('button')?.addEventListener('click', () => window.location.reload());
              document.body.appendChild(banner);
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
