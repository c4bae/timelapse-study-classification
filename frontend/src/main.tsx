import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ClerkProvider } from '@clerk/clerk-react'

// Import the Clerk Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) throw new Error("Missing Clerk Publishable Key")

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{cssLayerName: 'clerk'}}
    >
      <App />
    </ClerkProvider>
  </StrictMode>
)
