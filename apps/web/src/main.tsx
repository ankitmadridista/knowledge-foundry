import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from "@/app/App";
import { GlobalErrorBoundary } from './shared/components/layout/GlobalErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>,
)
