import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import '@/index.css';
import App from '@/App.tsx';
import { customKoKR } from '@/localization/customKoKR.ts';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} localization={customKoKR}>
      <App />
    </ClerkProvider>
  </StrictMode>
);
