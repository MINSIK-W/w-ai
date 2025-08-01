import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { koKR } from '@clerk/localizations';
import '@/index.css';
import App from '@/App.tsx';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
export const customKoKR = {
  ...koKR,
  commerce: {
    ...koKR.commerce,
    subscribe: '구독하기',
  },
};
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} localization={customKoKR}>
      <App />
    </ClerkProvider>
  </StrictMode>
);
