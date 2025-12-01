import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import './responsive.css'

import Router from './router/Router'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    
    <Router />
  </StrictMode>,
)
