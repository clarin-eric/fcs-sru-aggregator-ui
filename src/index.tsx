import { ClientParams } from '@clarin-eric/fcs-sru-aggregator-api-adapter-typescript'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router'

import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import './utils.css'

import App from '@/App.tsx'
import { i18n } from '@/i18n'
import { AggregatorAPIClientParamsProvider } from '@/providers/AggregatorAPIClientParamsContext'
import { configure, updateLocale } from '@/public'
import AppStore from '@/stores/app'
import LocaleStore from '@/stores/locale'
import ModalsStore from '@/stores/modals'
import SearchInputStore from '@/stores/searchinput'
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

const language = LocaleStore.getState().locale
i18n.changeLanguage(language)

// --------------------------------------------------------------------------

console.debug(
  'SearchInputStore.getState()',
  SearchInputStore.getInitialState(),
  SearchInputStore.getState()
)
console.debug('ModalsStore.getState()', ModalsStore.getInitialState(), ModalsStore.getState())

// query string evaluation to update search input
// only need to happen once (on startup)
const url = new URL(window.location.href)
const searchParams = url.searchParams
if (searchParams) {
  let newSearchParams = searchParams
  newSearchParams = SearchInputStore.getState().updateFromURLSearchParams(newSearchParams)
  newSearchParams = ModalsStore.getState().updateFromURLSearchParams(newSearchParams)

  searchParams.sort()
  newSearchParams.sort()
  const hasChanged = searchParams.toString() != newSearchParams.toString()
  if (hasChanged) {
    const newUrl = new URL(url)
    newUrl.search = newSearchParams.toString()
    console.debug(
      'Updating search params:',
      { oldSearchParams: searchParams, newSearchParams },
      { oldUrl: url.toString(), newUrl: newUrl.toString() }
    )
    // location.search = newSearchParams.toString()
    window.history.pushState({}, '', newUrl)
  }
}

// --------------------------------------------------------------------------

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // TODO: disable for cleaner debugging and/or for production?
      // refetchOnWindowFocus: false
    },
  },
})
const clientParams = {
  baseURL: apiURL,
  timeout: 5000,
} satisfies ClientParams

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
    <AggregatorAPIClientParamsProvider clientParams={clientParams}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <BrowserRouter basename={basename}>
            <App />
          </BrowserRouter>
        </HelmetProvider>
      </QueryClientProvider>
    </AggregatorAPIClientParamsProvider>
  </StrictMode>
)
