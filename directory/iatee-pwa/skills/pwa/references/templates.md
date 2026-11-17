# PWA templates

Adapt names, colors and paths to the project. Check each package's current version and options in its docs before installing it.

## Manifest (`public/manifest.webmanifest`)

```json
{
  "id": "/",
  "name": "Example App",
  "short_name": "Example",
  "description": "One sentence on what the app does.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#0f172a",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    { "src": "/screenshots/wide.png", "sizes": "1280x720", "type": "image/png", "form_factor": "wide" },
    { "src": "/screenshots/narrow.png", "sizes": "720x1280", "type": "image/png", "form_factor": "narrow" }
  ]
}
```

## `<head>`

```html
<link rel="manifest" href="/manifest.webmanifest" />
<meta name="theme-color" content="#0f172a" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

## Vite: `vite-plugin-pwa`

```ts
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'prompt', // 'autoUpdate' for content sites without forms
      // The manifest fields from the template above; the plugin writes the file and adds the <link>.
      // Or `manifest: false` to keep an existing public/manifest.webmanifest.
      manifest: { name: 'Example App', short_name: 'Example' /* ...the rest */ },
      workbox: {
        // Covers public/ too, so don't also list files in includeAssets: they'd be precached twice.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        globIgnores: ['**/apple-splash-*'], // iOS fetches splash screens itself when the app is added; no need to download them for everyone
        navigateFallback: '/index.html', // single-page apps; multi-page sites use an offline page instead
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'images', expiration: { maxEntries: 100 } },
          },
        ],
      },
    }),
  ],
});
```

Update prompt (React example; the plugin has the same hook for Vue, Svelte and Solid under `virtual:pwa-register/*`). In TypeScript, add a `src/pwa-env.d.ts` with `/// <reference types="vite-plugin-pwa/react" />` (or `/client` for the plain `registerSW`), or the build fails with "Cannot find module 'virtual:pwa-register/react'".

```tsx
import { useRegisterSW } from 'virtual:pwa-register/react';

export function UpdatePrompt() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW();
  if (!needRefresh) return null;
  return (
    <div role="status">
      A new version is available.
      <button onClick={() => updateServiceWorker(true)}>Reload</button>
    </div>
  );
}
```

## Next.js app router: manifest

```ts
// app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Example App',
    short_name: 'Example',
    start_url: '/',
    display: 'standalone',
    theme_color: '#0f172a',
    background_color: '#ffffff',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
```

For offline, follow the current `@serwist/next` setup guide and apply the caching table from SKILL.md.

## No build step: `sw.js`

```js
const VERSION = 'v1'; // change on every deploy that changes SHELL
// Offline, only these pages open; others show offline.html. List the pages people need offline,
// but never a page the server fills with user data.
const SHELL = ['/', '/offline.html', '/styles.css', '/app.js', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(`shell-${VERSION}`).then((cache) => cache.addAll(SHELL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => !key.endsWith(VERSION)).map((key) => caches.delete(key))),
    ),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  // Only same-origin GETs; never API calls or anything with user data.
  if (request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => (await caches.match(request)) ?? caches.match('/offline.html')));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached ?? fetch(request)));
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
```

Register it and offer the update:

```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then((reg) => {
    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateBanner(() => worker.postMessage('SKIP_WAITING'));
        }
      });
    });
  });
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!reloaded) { reloaded = true; location.reload(); }
  });
}
```

## Install button and iOS hint

In TypeScript, type the event (`interface BeforeInstallPromptEvent extends Event { prompt(): Promise<void> }`) and read `(navigator as { standalone?: boolean }).standalone`.

```js
const installed = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
let deferred;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferred = event;
  if (!installed) installButton.hidden = false;
});

installButton.addEventListener('click', async () => {
  installButton.hidden = true;
  await deferred?.prompt();
  deferred = null;
});

// iPhone and iPad Safari have no install event; Chrome and Firefox on iOS say "CriOS"/"FxiOS".
const iosSafari = /iPhone|iPad|iPod/.test(navigator.userAgent) && !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);
// localStorage throws in some private modes; then just show the hint.
let hintShown = false;
try { hintShown = !!localStorage.getItem('ios-hint-shown'); } catch {}
if (iosSafari && !installed && !hintShown) {
  showHint('Tap Share, then "Add to Home Screen".');
  try { localStorage.setItem('ios-hint-shown', '1'); } catch {}
}
```

## iPhone look

`<head>`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Example" />
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)" />
<!-- one per size from the generator, hrefs matched to the files it wrote -->
<link rel="apple-touch-startup-image" media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/apple-splash-portrait-1179x2556.png" />
```

Splash screens (`pwa-assets.config.mjs`, run with `npx pwa-assets-generator`; device names are listed in `AllAppleDeviceNames`):

```js
import { combinePresetAndAppleSplashScreens, defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: combinePresetAndAppleSplashScreens(
    minimal2023Preset,
    { padding: 0.3, resizeOptions: { background: '#ffffff' } },
    ['iPhone 15 Pro', 'iPhone 15 Pro Max', 'iPhone 13', 'iPhone SE 4"'],
  ),
  images: ['public/logo.svg'],
});
```

CSS:

```css
:root {
  color-scheme: light dark;
  font-family: -apple-system, system-ui, sans-serif;
  -webkit-tap-highlight-color: transparent;
  -webkit-text-size-adjust: 100%;
}
html, body { overscroll-behavior: none; }
.app { min-height: 100dvh; }

/* Keep content clear of the notch, Dynamic Island and home indicator. */
.app-header { padding-top: max(12px, env(safe-area-inset-top)); }
.app-tabbar { padding-bottom: max(8px, env(safe-area-inset-bottom)); }
.app { padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right); }

/* Smaller than 16px makes Safari zoom in when the field gets focus. */
input, select, textarea { font-size: max(16px, 1rem); }

button, .app-tabbar { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }

/* Only when opened from the home screen: no browser back button there. */
@media (display-mode: standalone) {
  .back-button { display: inline-flex; }
}
```

## Host headers for `sw.js`

```
# Netlify (_headers)
/sw.js
  Cache-Control: no-cache

# nginx
location = /sw.js { add_header Cache-Control "no-cache"; }
```
