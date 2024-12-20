import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'

import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

import App from '@/App.tsx'
import AppStore from '@/stores/app'
import { configure } from '@/public'

// --------------------------------------------------------------------------

// configure AppStore and fetch runtime configuration to override build configuration
// will guard against invalid/unexpected changes and notify about valid ones
configure()

console.debug('AppStore.getState()', AppStore.getInitialState(), AppStore.getState())

// BrowserRouter#basename for subpath deployment
const basename = AppStore.getState().deployPath
const apiURL = AppStore.getState().apiURL

// --------------------------------------------------------------------------

const queryClient = new QueryClient()
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

// App mount point
const rootId = 'root'
const domRoot = document.getElementById(rootId)
const root = createRoot(domRoot!)

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={basename}>
        <App axios={axiosClient} />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
