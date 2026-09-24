import { useEffect, useState } from "react"
import { registerSW } from "virtual:pwa-register"
import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { logger } from "@/lib/logger"

export const RefreshPrompt = () => {
  const { t } = useTranslation()
  const [needRefresh, setNeedRefresh] = useState(false)
  const [updateServiceWorker, setUpdateServiceWorker] = useState<
    (reloadPage?: boolean) => Promise<void>
  >()

  // registerSW() synchronously registers Workbox listeners that can fire
  // (and call our callbacks) before the component has finished its first
  // render. Registering from useEffect instead guarantees this component is
  // already mounted by the time any of those callbacks run — calling it from
  // a useState initializer during render is what previously produced "Can't
  // perform a React state update on a component that hasn't mounted yet."
  useEffect(() => {
    const update = registerSW({
      onNeedRefresh() {
        logger.info('sw', 'update available, waiting on user confirmation')
        setNeedRefresh(true)
      },
      onOfflineReady() { logger.info('sw', 'offline-ready (precache installed)') },
      onRegisterError(error) { logger.error('sw', 'registration failed', error) },
      onRegisteredSW(url, registration) {
        logger.debug('sw', 'registered', { url, registration })
        // An installed/standalone PWA is usually resumed rather than freshly
        // navigated, so the browser's own update check (which fires on
        // navigation) rarely runs on its own. Relying on a timer alone means an
        // update can sit unnoticed for up to the poll interval — and the timer
        // only ticks while the app is open. So we check at the moments the user
        // actually comes back to the app, and keep a short poll as a backstop.
        if (!registration) return

        const checkForUpdate = () => {
          // Only meaningful when we're online; update() hits the network.
          if (navigator.onLine) registration.update()
        }

        // Fires the instant a resumed PWA / backgrounded tab becomes visible.
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') checkForUpdate()
        })
        // Desktop window focus, and reconnecting after being offline.
        window.addEventListener('focus', checkForUpdate)
        window.addEventListener('online', checkForUpdate)

        // Backstop for a long-lived, continuously-visible session.
        setInterval(checkForUpdate, 15 * 60 * 1000) // every 15 min
      },
    })
    setUpdateServiceWorker(() => update)
  }, [])

  const reloadPage = () => {
    setNeedRefresh(false);
    // Hand off to the waiting service worker (skipWaiting) and reload. The new
    // SW repopulates the precache on activation and Workbox drops outdated
    // precache entries itself — so we must NOT delete the workbox precache here.
    // Doing so wiped the offline app shell and left the next offline open
    // failing with ERR_FAILED.
    updateServiceWorker?.(true);
  };

  if (!needRefresh) return null;

  return (
    <Card className="fixed top-16 right-4 md:top-auto md:bottom-10 shadow-lg z-40 py-3 gap-2">
      <CardContent className="px-3 flex flex-col items-start gap-2">
        <p className="text-sm whitespace-nowrap">{t("shared.updateAvailable")}</p>
        <Button size="xs" onClick={reloadPage}>
          {t("shared.refresh")}
        </Button>
      </CardContent>
    </Card>
  );
};
