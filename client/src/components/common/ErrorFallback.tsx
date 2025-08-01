import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
}: ErrorFallbackProps) {
  const handleRefresh = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            오류가 발생했습니다
          </h1>
          <p className="text-gray-600">
            예상치 못한 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
            <p className="text-sm text-gray-700 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="space-y-3 flex gap-3">
          <button
            onClick={handleRefresh}
            className="w-full m-0 flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:scale-102 transition"
          >
            <RefreshCw className="w-4 h-4" />
            다시 시도
          </button>

          <button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:scale-102 transition"
          >
            <Home className="w-4 h-4" />
            홈으로 이동
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            문제가 계속 발생하면 페이지를 새로고침하거나 잠시 후 다시
            시도해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
