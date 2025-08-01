import { ErrorBoundary } from 'react-error-boundary';
import { Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Router } from '@/router/Router.tsx';
import { ErrorFallback } from '@/components/common/ErrorFallback.tsx';
import { LoadingFallback } from '@/components/common/LoadingFallback.tsx';

export default function App() {
  useEffect(() => {
    console.log('현재 경로:', window.location.pathname);
  }, []);
  return (
    <ErrorBoundary
      FallbackComponent={() => <ErrorFallback />}
      onError={(error, info) => {
        console.error('오류 발생:', error, info);
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <RouterProvider router={Router} />
      </Suspense>
    </ErrorBoundary>
  );
}
