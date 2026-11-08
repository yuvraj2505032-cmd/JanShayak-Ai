import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function sendLoadedResourcesToServiceWorker(sw: ServiceWorker | null) {
  if (!sw) return;
  try {
    const origin = window.location.origin;
    const resources = performance
      .getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((url) => url.startsWith(origin) && !url.includes('/api/'));
    const scriptTags = Array.from(document.querySelectorAll('script[src]'))
      .map((el) => (el as HTMLScriptElement).src)
      .filter(Boolean);
    const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map((el) => (el as HTMLLinkElement).href)
      .filter(Boolean);
    const urls = Array.from(
      new Set(['/', '/index.html', '/manifest.webmanifest', ...resources, ...scriptTags, ...styleTags])
    );
    sw.postMessage({ type: 'PRECACHE_URLS', urls });
  } catch {
    // ignore precache message errors
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        const activeWorker =
          registration.active || registration.waiting || registration.installing;
        if (activeWorker) {
          if (activeWorker.state === 'activated') {
            sendLoadedResourcesToServiceWorker(activeWorker);
          } else {
            activeWorker.addEventListener('statechange', () => {
              if (activeWorker.state === 'activated') {
                sendLoadedResourcesToServiceWorker(activeWorker);
              }
            });
          }
        }
        // Also precache any lazy-loaded or delayed modules after initial render settles
        window.setTimeout(() => {
          sendLoadedResourcesToServiceWorker(
            navigator.serviceWorker.controller || registration.active
          );
        }, 2000);
      })
      .catch((error) => {
        console.warn('Service worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
