import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router'

import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import './utils.css'

import App from '@/App.tsx'
import { AxiosProvider } from '@/providers/AxiosContext'
import { configure, updateLocale } from '@/public'
import AppStore from '@/stores/app'
import LocaleStore from '@/stores/locale'
import { setupAndInstallFromConfigString } from '@/utils/matomo'

// --------------------------------------------------------------------------

// configure AppStore and fetch runtime configuration to override build configuration
// will guard against invalid/unexpected changes and notify about valid ones
configure()
// update locale languages based on browser/navigator and available languages
updateLocale()

console.debug('AppStore.getState()', AppStore.getInitialState(), AppStore.getState())
console.debug('LocaleStore.getState()', LocaleStore.getInitialState(), LocaleStore.getState())

// BrowserRouter#basename for subpath deployment
const basename = AppStore.getState().deployPath
const apiURL = AppStore.getState().apiURL

// --------------------------------------------------------------------------

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // TODO: disable for cleaner debugging and/or for production?
      // refetchOnWindowFocus: false
    },
  },
})
const axiosClient = axios.create({
  baseURL: apiURL,
  timeout: 5000,
  // throw if response is not JSON
  // - https://stackoverflow.com/a/75785157/9360161
  responseType: 'json',
  transitional: {
    silentJSONParsing: false,
  },
})

// --------------------------------------------------------------------------

if (import.meta.env.FEATURE_TRACKING_MATOMO) {
  const matomoParams = AppStore.getState().matomoTrackingParams
  const successful = setupAndInstallFromConfigString(matomoParams)
  if (!successful) console.warn('Unable to setup tracking ...')
}

// --------------------------------------------------------------------------

// App mount point
const rootId = 'root'
const domRoot = document.getElementById(rootId)
const root = createRoot(domRoot!)

root.render(
  <StrictMode>
    <AxiosProvider axios={axiosClient}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <BrowserRouter basename={basename}>
            <App />
          </BrowserRouter>
        </HelmetProvider>
      </QueryClientProvider>
    </AxiosProvider>
  </StrictMode>
)
