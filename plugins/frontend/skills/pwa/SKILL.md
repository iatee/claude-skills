---
name: pwa
description: Turn a web app into a Progressive Web App that installs on phones and desktops, opens full screen with an iPhone-app look, works offline and updates cleanly. Use when the user wants an installable app, "add to home screen", an app icon, offline support, a web app manifest, a service worker, an install button, a splash screen, an app that looks native on iPhone (status bar, notch, safe areas), or web push notifications, or when an existing PWA shows stale versions, won't install or breaks offline.
---

# PWA

Make the app installable, fast on repeat visits and usable offline, without the classic PWA bugs: users stuck on an old version, private data left in the cache, and an install button that never shows on iPhone.

Templates for every file below are in [references/templates.md](references/templates.md).

## 1. Look before you add

- Find the framework and build tool in `package.json`, and check for an existing `manifest.json`/`manifest.webmanifest`/`site.webmanifest`, `sw.js`, `service-worker.*`, Workbox, `vite-plugin-pwa`, `@serwist/*` or `next-pwa`. Extend what is there rather than adding a second service worker.
- Ask (or infer from the request) what the app needs offline. "Installable with an icon" needs far less than "works on a plane". Default: installable, the app shell cached, and an offline page for pages that aren't cached.
- The site must be served over HTTPS (`localhost` counts while developing).

## 2. Pick the tool the framework already supports

| Stack | Use |
|---|---|
| Vite (React, Vue, Svelte, Solid, plain) | `vite-plugin-pwa` |
| Astro | `@vite-pwa/astro` |
| Nuxt | `@vite-pwa/nuxt` |
| SvelteKit | its built-in `src/service-worker.js` (or `@vite-pwa/sveltekit`) |
| Next.js (app router) | `app/manifest.ts` for the manifest; `@serwist/next` for offline. `next-pwa` is unmaintained. |
| No build step | a hand-written `manifest.webmanifest` and `sw.js` from the templates |

Plugins generate the precache list from the build output with content hashes. Hand-written precache lists go stale, so hand-write only for sites without a build step.

## 3. Manifest and icons

Required for installing: `name`, `short_name`, `start_url`, `display: "standalone"`, and PNG icons at 192×192 and 512×512. Also set `id` (keeps the installed app the same if `start_url` changes later), `scope`, `theme_color`, `background_color` and `description`.

- Add a separate 512×512 icon with `"purpose": "maskable"`, with the logo inside the middle 80%. Don't mark one icon `"any maskable"`: Android crops it and other platforms show the padding.
- Add `screenshots` (one `"form_factor": "wide"`, one narrow) for the richer install dialog on Android and desktop Chrome.
- In `<head>`: `<link rel="manifest">`, `<meta name="theme-color">`, and `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` at 180×180 with no transparency. iOS ignores manifest icons for the home screen.
- If the user has only one logo, generate the sizes with whatever image tool the project already has, or `npx @vite-pwa/assets-generator@<version> --preset minimal-2023 public/logo.svg` (look up the current version). It writes `pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png` and `apple-touch-icon-180x180.png` next to the logo (point the manifest and `<head>` at those names), plus `pwa-64x64.png` and `favicon.ico`: delete whichever the app doesn't use, or they get precached for nothing. Don't add a dependency for it.

## 4. Service worker: what to cache

| Request | Strategy |
|---|---|
| Built JS, CSS and fonts with hashes in their names | Precache at install |
| Page navigations (HTML) | Network first, falling back to the cached page, then to `/offline.html`. Single-page apps fall back to the cached `index.html`. |
| Server-rendered pages that show user data | Network only, like the API |
| Images, avatars | Stale-while-revalidate, with a size or entry limit |
| API responses with user data, anything behind login | **Never cache.** Network only. |
| Non-GET requests | Never cache |

Caching personal API responses is the most common PWA security bug: the next person on that device, or the same person after logging out, sees the previous user's data. If the app truly needs offline user data, store it in IndexedDB and clear it on logout, together with `caches.delete` for any runtime cache.

Clear old caches in the `activate` event and name caches with a version.

## 5. Updates: no one gets stuck on an old version

- Serve the service worker file itself with `Cache-Control: no-cache` (or `max-age=0`). Check the host config: Netlify, Vercel and Cloudflare usually do this already for files without a hash; nginx and S3 often don't.
- Prefer a **"New version available, reload"** prompt (`registerType: 'prompt'` in vite-plugin-pwa) for apps with forms or editors. `autoUpdate` (`skipWaiting` + `clientsClaim`) is fine for content sites, but it can swap code under a user mid-task.
- Never cache `sw.js` in the service worker itself, and never put a hash in its file name.

## 6. Installing

- `beforeinstallprompt` exists only in Chromium browsers. Save the event, show your own install button, and call `prompt()` from a click.
- Safari on iPhone and iPad has no install event. Show a one-time hint ("Tap Share, then Add to Home Screen") only in Safari on iOS and only when the app isn't already installed (`navigator.standalone` or `matchMedia('(display-mode: standalone)')`).
- Hide every install UI when already running installed.

## 7. The iPhone look

Opened from the home screen, the app has no Safari bar, no back button and no browser chrome around it. Make it look and behave like an iPhone app (templates in references/templates.md under "iPhone look"):

- **Status bar:** `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">` with `viewport-fit=cover` lets the app draw under the status bar like a native app. Then pad the edges with `env(safe-area-inset-top|right|bottom|left)`, or the notch, Dynamic Island and home indicator cover the header, tab bar and buttons. Use `default` instead if the app has no colored header.
- **Name under the icon:** `<meta name="apple-mobile-web-app-title">` with a name of 12 characters or fewer, or iOS cuts it off.
- **Splash screen:** iOS ignores the manifest for the launch screen and shows white until the app loads. Add `apple-touch-startup-image` links for the current iPhone sizes. `@vite-pwa/assets-generator` makes them with a config file (`combinePresetAndAppleSplashScreens`). Its printed `<link>` tags name the files `apple-splash-portrait-light-…` while it writes `apple-splash-portrait-…`: match the hrefs to the files it actually wrote, or every splash is a 404.
- **Dark mode:** two `theme-color` metas with `media="(prefers-color-scheme: light|dark)"`, and `color-scheme: light dark` in CSS, so the status bar and form controls follow the system.
- **Feel:** system font (`-apple-system, system-ui`); `-webkit-tap-highlight-color: transparent`; `overscroll-behavior: none` on the page so it doesn't rubber-band; `100dvh`, not `100vh`, for full-height layouts; inputs at `font-size: 16px` or more, or Safari zooms in on focus; `-webkit-user-select: none` and `-webkit-touch-callout: none` on buttons and tab bars only, never on text people may copy.
- **Navigation:** standalone has no back button or swipe-from-edge in every case, so any screen deeper than the first needs a visible back control. Style these only under `@media (display-mode: standalone)` if the browser version should keep its normal look.
- **Don't** imitate iOS pixel for pixel (fake status bars, copied SF Symbols, iOS-only colors on Android). Follow the system's spacing and behavior, keep the app's own brand.

## 8. Optional: push notifications

Only if asked. Web push needs a server, VAPID keys (the private key stays on the server, never in the client bundle) and a permission request triggered by a user's click, never on page load. On iPhone it works only after the app is added to the home screen (iOS 16.4+).

## 9. Check it works

Lighthouse no longer has a PWA section, so check by hand in Chrome DevTools > Application. Scripted checks with Playwright work too: call `context.setOffline(true)` and remove any `page.route` stubs first (`unrouteAll()`), because a stub keeps answering offline and makes it look as if the API was cached.

1. **Manifest**: no errors or warnings, icons load, the maskable preview looks right.
2. **Service workers**: registered and activated; the scope is `/` unless the app lives in a subfolder.
3. Tick **Offline** and reload a visited page and an unvisited one: the first loads, the second shows the offline page.
4. Install it from the address bar and open it: it opens in its own window at `start_url`.
5. Change something, deploy or rebuild, and reload: the update prompt appears (or the new version loads), and old caches are gone under **Cache storage**.
6. Log in, log out, go offline: no private data is shown from the cache.
7. On a real iPhone: Add to Home Screen shows the right icon and name, the splash screen shows instead of white, the app opens without Safari's bar, and nothing sits under the notch or the home indicator. Without an iPhone, the Simulator in Xcode does all of this; a desktop browser can't show standalone mode.

Report what the app can now do offline, what it can't, and anything only a real device could confirm.
