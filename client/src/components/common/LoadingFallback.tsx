import { Loader2 } from 'lucide-react';

export function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-primary opacity-50 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-700 mb-1">
            페이지를 불러오는 중...
          </h2>
          <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
        </div>
      </div>
    </div>
  );
}
