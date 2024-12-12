import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

import App from './App.tsx'

const root = document.getElementById('root')

createRoot(root!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
