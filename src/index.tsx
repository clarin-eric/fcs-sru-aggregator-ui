import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import axios from 'axios'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

import App from './App.tsx'

const queryClient = new QueryClient()
const axiosClient = axios.create({
  baseURL: import.meta.env.API_URL, // TODO: this should be configurable from outside the built bundle
  timeout: 5000,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App axios={axiosClient} />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
