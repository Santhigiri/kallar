import { execSync } from 'node:child_process'
import { defineConfig, loadEnv } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import viteReact from "@vitejs/plugin-react"
import viteTsConfigPaths from "vite-tsconfig-paths"
import tanstackRouter from '@tanstack/router-plugin/vite'
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

// Separate app identity per environment so a device's home screen (and the
// OS task switcher) never shows a dev/staging install looking identical to
// prod. Icons are pre-generated badge overlays (see public/*-dev.png /
// *-staging.png) — prod keeps the plain icons with no suffix.
const ENV_MANIFEST = {
  local: { name: 'Pournami Calendar (Local)', short_name: 'Pournami · Local', suffix: '-dev' },
  dev: { name: 'Pournami Calendar (Dev)', short_name: 'Pournami · Dev', suffix: '-dev' },
  staging: { name: 'Pournami Calendar (Staging)', short_name: 'Pournami · Staging', suffix: '-staging' },
  prod: { name: 'Pournami Calendar', short_name: 'Pournami', suffix: '' },
} as const

const config = defineConfig(({ mode }) => {
  // process.env alone won't see a local .env file's values (Vite only
  // auto-loads those into import.meta.env for application code, not into
  // this config file) — loadEnv reads them the same way Vite itself will,
  // so VITE_APP_ENV/VITE_APP_VERSION set via .env work the same as CI's
  // --build-arg-injected process.env values.
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }

  // Build identity, exposed to the app as import.meta.env.VITE_APP_ENV /
  // VITE_APP_VERSION (see src/lib/version.ts). CI
  // (.github/workflows/docker-build-push.yml) passes both as --build-arg so
  // they're already set when `vite build` runs there; a local build falls
  // back to "local" / the current git short SHA so the values are still
  // meaningful without CI.
  const APP_ENV = env.VITE_APP_ENV || 'local'
  const APP_VERSION =
    env.VITE_APP_VERSION ||
    (() => {
      try {
        return execSync('git rev-parse --short HEAD').toString().trim()
      } catch {
        return 'dev-local'
      }
    })()

  const manifestEnv = Object.hasOwn(ENV_MANIFEST, APP_ENV)
    ? ENV_MANIFEST[APP_ENV as keyof typeof ENV_MANIFEST]
    : ENV_MANIFEST.local
  const iconFile = (base: string) => `${base}${manifestEnv.suffix}.png`

  return {
  define: {
    'import.meta.env.VITE_APP_ENV': JSON.stringify(APP_ENV),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(APP_VERSION),
  },
  plugins: [
    // index.html's own <link rel="apple-touch-icon"> and <title> are static
    // markup, outside anything vite-plugin-pwa templates — swap them for the
    // per-env variant/name here so a browser tab/bookmark also shows the
    // right build, not just the installed-PWA manifest.
    {
      name: 'env-index-html',
      transformIndexHtml(html) {
        return html
          .replace('/apple-touch-icon.png', `/${iconFile('apple-touch-icon')}`)
          .replace('<title>Panchangam</title>', `<title>${manifestEnv.short_name}</title>`)
      },
    },
    devtools(),
    // this is the plugin that enables path aliases.
    // autoCodeSplitting splits each route's component into its own lazy chunk
    // so the home route no longer ships the /calendar and /data feature code.
    tanstackRouter({ autoCodeSplitting: true }),
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    viteReact(),
    VitePWA({
      devOptions: {
        enabled: true,
        type: 'classic',
        navigateFallback: 'index.html'
      },
      strategies: 'generateSW',
      // Prompt strategy: a new SW waits until the user taps Refresh
      // (RefreshPrompt) before taking over, so updates never swap the app out
      // from under an in-progress session.
      registerType: 'prompt',
      workbox: {
        sourcemap: true,
        // Precached index.html served for any navigation the network can't
        // fulfil (offline) — this is what makes the app shell load at all
        // without connectivity. No runtimeCaching override for navigations
        // here: that would take precedence over this fallback and always
        // force a network request, defeating it.
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,ico,png,svg,html,woff,woff2}'],
        // globDirectory is intentionally left to vite-plugin-pwa, which points
        // it at Vite's resolved build outDir. Hardcoding it here risked the
        // precache manifest globbing the wrong path.
        // Without this, an activating SW never takes control of the tab
        // that's already open (only future navigations get controlled) — so
        // testing offline right after the very first visit fails even
        // though the SW installed fine, since it was never actually in the
        // fetch path yet. Safe to combine with registerType: 'prompt' below
        // — this only governs "claim already-open tabs once active", not
        // "when does a new version become active", which RefreshPrompt
        // still gates for real updates.
        clientsClaim: true,
      },
      includeAssets: [
        "favicon.ico",
        iconFile("apple-touch-icon"),
      ],

      manifest: {
        name: manifestEnv.name,
        short_name: manifestEnv.short_name,
        description: "Malayalam Panchangam Calendar",
        display: "standalone",

        // Night-sky indigo — drives the splash screen and the Android task
        // switcher / address-bar tint.
        theme_color: "#0B1026",
        background_color: "#0B1026",
        // `any` and `maskable` are split into separate assets: a single PNG
        // can't be optimal for both. The maskable icons fill the whole
        // adaptive-icon shape edge-to-edge with the night-sky background (no
        // white plate on Android); the `any` icons keep a transparent moon for
        // browsers/desktops that render non-maskable icons. Per-env builds
        // (dev/staging) point at the badge-overlay variants generated
        // alongside the prod icons in public/ so installs never look alike.
        icons: [
          {
            src: iconFile("pwa-192x192"),
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: iconFile("pwa-512x512"),
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: iconFile("maskable-icon-192x192"),
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: iconFile("maskable-icon-512x512"),
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }

    }),
    // Bundle-composition treemap, only when explicitly measuring
    // (ANALYZE=1 npm run build) — never affects normal builds.
    ...(process.env.ANALYZE
      ? [visualizer({ filename: 'dist/stats.html', gzipSize: true, brotliSize: true })]
      : []),
  ],
  }
})

export default config
