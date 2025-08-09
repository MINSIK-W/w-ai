import { ErrorBoundary } from 'react-error-boundary';
import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Router } from '@/router/Router.tsx';
import { ErrorFallback } from '@/components/common/ErrorFallback.tsx';
import { LoadingFallback } from '@/components/common/LoadingFallback.tsx';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <ErrorBoundary
      FallbackComponent={() => <ErrorFallback />}
      onError={(error, info) => {
        console.error('오류 발생:', error, info);
      }}
    >
      <Toaster />
      <Suspense fallback={<LoadingFallback />}>
        <RouterProvider router={Router} />
      </Suspense>
    </ErrorBoundary>
  );
}
