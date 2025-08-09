import { useEffect, useState, useCallback } from 'react';
import {
  Gem,
  Sparkles,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { Protect, useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

import CreationItem from '@/components/CreationItem.tsx';
import { apiClient, handleApiError, makeApiRequest } from '@/utils/api';
import { formatRelativeTime } from '@/utils/format';
import { calculateStats, type CreationData, type DashboardStats } from '@/type';

export default function Dashboard() {
  const [creations, setCreations] = useState<CreationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { getToken } = useAuth();

  // 대시보드 데이터 가져오기
  const getDashboardData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const token = await getToken();
        if (!token) {
          throw new Error('로그인이 필요합니다.');
        }

        const result = await makeApiRequest(
          () =>
            apiClient.get('/api/user/getUserCreations', {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000,
            }),
          '대시보드 데이터 로드',
          false // 에러를 직접 처리
        );

        if (result?.data.success) {
          setCreations(result.data.creations || []);
          if (isRefresh) {
            toast.success('데이터가 새로고침되었습니다.');
          }
        } else {
          throw new Error(
            result?.data.message || '데이터를 불러오는데 실패했습니다.'
          );
        }
      } catch (err: unknown) {
        const errorMessage = handleApiError(err, '대시보드 데이터 로드');
        setError(errorMessage);
        if (!isRefresh) {
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getToken]
  );

  // 새로고침 핸들러
  const handleRefresh = () => {
    getDashboardData(true);
  };

  useEffect(() => {
    getDashboardData();
  }, [getDashboardData]);

  // 통계 계산
  const stats: DashboardStats = calculateStats(creations);

  // 로딩 상태
  if (loading) {
    return (
      <div className="h-full flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-gray-500 text-sm">대시보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error && creations.length === 0) {
    return (
      <div className="h-full flex justify-center items-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              데이터 로드 실패
            </h3>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button
              onClick={() => getDashboardData()}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-scroll p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">대시보드</h1>
          <p className="text-gray-500 text-sm">
            AI 도구 사용 현황을 확인하세요
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
          />
          새로고침
        </button>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* 총 생성 개수 */}
        <div className="flex justify-between items-center p-4 px-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-slate-600">
            <p className="text-sm text-gray-500">총 생성 개수</p>
            <h2 className="text-2xl font-bold text-gray-800">
              {stats.totalCreations}
            </h2>
          </div>
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#3588f2] to-[#0bb0d7] text-white flex justify-center items-center">
            <Sparkles className="w-6 text-white" />
          </div>
        </div>

        {/* 이번 주 생성 */}
        <div className="flex justify-between items-center p-4 px-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-slate-600">
            <p className="text-sm text-gray-500">이번 주</p>
            <h2 className="text-2xl font-bold text-gray-800">
              {stats.thisWeekCreations}
            </h2>
          </div>
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#10b981] to-[#059669] text-white flex justify-center items-center">
            <TrendingUp className="w-6 text-white" />
          </div>
        </div>

        {/* 이번 달 생성 */}
        <div className="flex justify-between items-center p-4 px-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-slate-600">
            <p className="text-sm text-gray-500">이번 달</p>
            <h2 className="text-2xl font-bold text-gray-800">
              {stats.thisMonthCreations}
            </h2>
          </div>
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white flex justify-center items-center">
            <Calendar className="w-6 text-white" />
          </div>
        </div>

        {/* 사용자 요금제 정보 */}
        <div className="flex justify-between items-center p-4 px-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-slate-600">
            <p className="text-sm text-gray-500">사용 중인 요금제</p>
            <h2 className="text-xl font-bold text-gray-800">
              <Protect
                plan="premium"
                fallback={<span className="text-gray-600">무료</span>}
              >
                <span className="text-purple-600">프리미엄</span>
              </Protect>
            </h2>
          </div>
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#ff61c5] to-[#9e53ee] text-white flex justify-center items-center">
            <Gem className="w-6 text-white" />
          </div>
        </div>
      </div>

      {/* 최근 활동 정보 */}
      {stats.lastActivity && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <span className="font-medium">마지막 활동:</span>{' '}
            {formatRelativeTime(stats.lastActivity)}
          </p>
        </div>
      )}

      {/* 최근 작업물 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">최근 작업물</h3>
          <p className="text-sm text-gray-500 mt-1">
            최근에 생성한 콘텐츠들을 확인하세요
          </p>
        </div>

        <div className="p-6">
          {creations.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-700 mb-2">
                아직 생성한 콘텐츠가 없습니다
              </h4>
              <p className="text-gray-500 text-sm">
                AI 도구를 사용해서 첫 번째 콘텐츠를 만들어보세요!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {creations.slice(0, 10).map(item => (
                <CreationItem key={item.id} item={item} />
              ))}
              {creations.length > 10 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    {creations.length - 10}개의 추가 항목이 있습니다.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
