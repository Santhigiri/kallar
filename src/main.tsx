import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from 'next-themes'

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import {
  RouterProvider,
  createRouter,
} from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'
import { logger } from './lib/logger'
import { APP_ENV, APP_VERSION } from './lib/version'

logger.info('app', `booting ${APP_ENV} build ${APP_VERSION}`)

window.addEventListener('error', (event) => {
  logger.error('app', 'uncaught error', event.error ?? event.message)
})
window.addEventListener('unhandledrejection', (event) => {
  logger.error('app', 'unhandled promise rejection', event.reason)
})

const queryClient = new QueryClient()

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
