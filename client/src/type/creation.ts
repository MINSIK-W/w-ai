// 게시물 관련 타입
export interface CreationData {
  id: number;
  user_id: string;
  prompt: string;
  content: string;
  type: string;
  publish: boolean;
  likes: string[];
  created_at: string;
  updated_at: string;
}

// 기존 타입들을 통일된 타입으로 변경
export type UserCreation = CreationData;
export type PublishedCreationData = CreationData;
export type CreationItemData = CreationData;

// API 응답 타입들
export interface CreationResponse {
  success: boolean;
  creations?: UserCreation[];
  message?: string;
}

export interface LikeToggleBody {
  id: number;
}

export interface LikeResponse {
  success: boolean;
  message?: string;
  creations?: UserCreation[];
}

// 대시보드 통계 타입
export interface DashboardStats {
  totalCreations: number;
  thisWeekCreations: number;
  thisMonthCreations: number;
  lastActivity: string | null;
}

// 통계 계산 함수
export const calculateStats = (creations: CreationData[]): DashboardStats => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const thisWeekCreations = creations.filter(
    item => new Date(item.created_at) >= oneWeekAgo
  ).length;

  const thisMonthCreations = creations.filter(
    item => new Date(item.created_at) >= oneMonthAgo
  ).length;

  const lastActivity = creations.length > 0 ? creations[0].created_at : null;

  return {
    totalCreations: creations.length,
    thisWeekCreations,
    thisMonthCreations,
    lastActivity,
  };
};

// 필터 타입
export type FilterType = 'all' | 'popular' | 'recent' | 'liked';
