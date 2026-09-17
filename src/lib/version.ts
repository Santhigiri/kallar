// Injected at build time — see vite.config.ts's `define` block. CI sets
// VITE_APP_ENV/VITE_APP_VERSION from the tag it generates
// (dev-YYYY.MM.DD.N / staging-.../ prod-...); a local `npm run dev`/`build`
// falls back to these defaults since no CI env vars are present.
export const APP_ENV: string = import.meta.env.VITE_APP_ENV ?? "local"
export const APP_VERSION: string = import.meta.env.VITE_APP_VERSION ?? "dev-local"
