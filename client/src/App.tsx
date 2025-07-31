import { ErrorBoundary } from 'react-error-boundary';
import { Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Router } from '@/router/Router.tsx';

export default function App() {
  useEffect(() => {
    console.log('현재 경로:', window.location.pathname);
  }, []);
  return (
    <ErrorBoundary
      FallbackComponent={() => <></>}
      onError={(error, info) => {
        console.error('오류 발생:', error, info);
      }}
    >
      <Suspense fallback={<></>}>
        <RouterProvider router={Router} />
      </Suspense>
    </ErrorBoundary>
  );
}
