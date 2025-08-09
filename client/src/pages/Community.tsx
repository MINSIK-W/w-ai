import { useEffect, useState, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import {
  Heart,
  RefreshCw,
  AlertCircle,
  Users,
  TrendingUp,
  ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { apiClient, handleApiError, makeApiRequest } from '@/utils/api';
import { formatRelativeTime } from '@/utils/format';
import type { CreationData, FilterType, LikeResponse } from '@/type';

export default function Community() {
  const [creations, setCreations] = useState<CreationData[]>([]);
  const [filteredCreations, setFilteredCreations] = useState<CreationData[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [likingIds, setLikingIds] = useState<Set<number>>(new Set());

  const { user } = useUser();
  const { getToken } = useAuth();

  // 공개 게시물 가져오기
  const fetchCreations = useCallback(
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
            apiClient.get('/api/user/getPublishedCreations', {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000,
            }),
          '커뮤니티 데이터 로드',
          false
        );

        if (result?.data.success) {
          setCreations(result.data.creations || []);
          if (isRefresh) {
            toast.success('커뮤니티가 새로고침되었습니다.');
          }
        } else {
          throw new Error(
            result?.data.message || '데이터를 불러오는데 실패했습니다.'
          );
        }
      } catch (err: unknown) {
        const errorMessage = handleApiError(err, '커뮤니티 데이터 로드');
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

  // 좋아요 토글
  const imageLikeToggle = async (id: number) => {
    if (!user?.id) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    // 중복 클릭 방지
    if (likingIds.has(id)) {
      return;
    }

    try {
      setLikingIds(prev => new Set(prev).add(id));

      const token = await getToken();
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      // 업데이트
      const currentUserId = user.id;
      setCreations(prev =>
        prev.map(creation => {
          if (creation.id === id) {
            const isCurrentlyLiked = creation.likes.includes(currentUserId);
            return {
              ...creation,
              likes: isCurrentlyLiked
                ? creation.likes.filter(userId => userId !== currentUserId)
                : [...creation.likes, currentUserId],
            };
          }
          return creation;
        })
      );

      const result = await makeApiRequest(
        () =>
          apiClient.post<LikeResponse>(
            '/api/user/toggleLikeCreation',
            { id },
            {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 5000,
            }
          ),
        '좋아요 처리',
        false
      );

      if (result?.data.success) {
        // 서버에서 최신 데이터를 받으면 업데이트
        if (result.data.creations) {
          setCreations(result.data.creations);
        }
        toast.success(result.data.message || '좋아요가 반영되었습니다.');
      } else {
        throw new Error(result?.data.message || '좋아요 처리에 실패했습니다.');
      }
    } catch (err: unknown) {
      const errorMessage = handleApiError(err, '좋아요 처리');
      toast.error(errorMessage);

      // 에러 시 롤백
      await fetchCreations();
    } finally {
      setLikingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // 필터링 로직
  useEffect(() => {
    let filtered = [...creations];

    switch (filter) {
      case 'popular':
        filtered.sort((a, b) => b.likes.length - a.likes.length);
        break;
      case 'recent':
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'liked':
        filtered = filtered.filter(creation =>
          creation.likes.includes(user?.id ?? '')
        );
        break;
      default:
        // 기본적으로 최신순
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    setFilteredCreations(filtered);
  }, [creations, filter, user?.id]);

  // 새로고침 핸들러
  const handleRefresh = async () => {
    await fetchCreations(true);
  };

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        await fetchCreations();
      } catch (err) {
        console.error('fetchCreations failed:', err);
      }
    })();
  }, [user, fetchCreations]);

  // 로딩 상태
  if (loading) {
    return (
      <div className="h-full flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-gray-500 text-sm">커뮤니티를 불러오는 중...</p>
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
              커뮤니티 로드 실패
            </h3>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button
              onClick={() => fetchCreations()}
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
    <div className="flex-1 h-full flex flex-col gap-4 p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">커뮤니티</h1>
            <p className="text-gray-500 text-sm">
              다른 사용자들의 이미지를 감상해보세요.
            </p>
          </div>
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

      {/* 필터 버튼들 */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: '전체', icon: ImageIcon },
          { key: 'popular', label: '인기순', icon: TrendingUp },
          { key: 'recent', label: '최신순', icon: RefreshCw },
          { key: 'liked', label: '좋아요한 글', icon: Heart },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key as FilterType)}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
              filter === key
                ? 'bg-purple-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* 콘텐츠 영역 */}
      <div className="bg-white flex-1 rounded-xl overflow-hidden border border-gray-200">
        {filteredCreations.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center p-8">
            <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {filter === 'liked'
                ? '좋아요한 이미지가 없습니다'
                : '공개된 이미지가 없습니다'}
            </h3>
            <p className="text-gray-500 text-sm">
              {filter === 'liked'
                ? '마음에 드는 이미지에 하트를 눌러보세요!'
                : '첫 번째 이미지를 공개해보세요!'}
            </p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCreations.map(creation => (
                <div
                  key={creation.id}
                  className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={creation.content}
                    alt={creation.prompt || '사용자 창작물'}
                    className="w-full h-full object-cover"
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.jpg';
                    }}
                  />

                  {/* 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      {creation.prompt && (
                        <p className="text-white text-sm mb-3 line-clamp-2">
                          {creation.prompt}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-300">
                          {formatRelativeTime(creation.created_at)}
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-white text-sm">
                            {creation.likes.length}
                          </span>
                          <button
                            onClick={() => imageLikeToggle(creation.id)}
                            disabled={likingIds.has(creation.id)}
                            className={`p-1 rounded-full transition-all ${
                              likingIds.has(creation.id)
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:scale-110'
                            }`}
                          >
                            <Heart
                              className={`w-5 h-5 ${
                                creation.likes.includes(user?.id ?? '')
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-white hover:text-red-400'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
