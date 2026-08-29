import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from "@/app/App";
import { GlobalErrorBoundary } from './shared/components/layout/GlobalErrorBoundary';
import environment from './shared/config/environment';

const PUBLISHABLE_KEY = environment.clerkPublishableKey;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    </GlobalErrorBoundary>
  </StrictMode>,
)