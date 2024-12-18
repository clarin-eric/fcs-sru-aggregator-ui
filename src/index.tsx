import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'

import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

import App from './App.tsx'

const queryClient = new QueryClient()
const axiosClient = axios.create({
  baseURL: import.meta.env.API_URL, // TODO: this should be configurable from outside the built bundle
  timeout: 5000,
})

// BrowserRouter#basename for subpath deployment
const basename = import.meta.env.DEPLOY_PATH

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
