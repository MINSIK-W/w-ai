// 데이터베이스 관련 타입들

// 사용자 게시물 타입 (DB에서 반환되는 실제 형태)
export interface UserCreation {
  id: number;
  user_id: string;
  prompt: string;
  content: string;
  type: string;
  publish: boolean;
  likes: string[];
  created_at: Date;
  updated_at: Date;
}

// 원시 데이터베이스 응답 (PostgreSQL에서 실제 반환되는 형태)
export interface RawUserCreation {
  id: number;
  user_id: string;
  prompt: string;
  content: string;
  type: string;
  publish: boolean;
  likes: string[] | null;
  created_at: string | Date;
  updated_at: string | Date;
}

// 게시물 타입들
export type CreationType =
  | '글 작성'
  | '블로그 제목 추천'
  | '이미지 생성'
  | '배경 제거'
  | '요소 제거'
  | '이력서 피드백';

// 사용자 플랜 타입
export type UserPlan = 'free' | 'premium';

// 좋아요 토글 요청 타입
export interface LikeToggleBody {
  id: number;
}

// 타입 변환 함수
export const transformRawCreation = (raw: RawUserCreation): UserCreation => {
  return {
    ...raw,
    likes: raw.likes || [],
    created_at: new Date(raw.created_at),
    updated_at: new Date(raw.updated_at),
  };
};

// 타입 가드 함수들
export const isValidUserId = (userId: unknown): userId is string => {
  return typeof userId === 'string' && userId.trim().length > 0;
};

export const isValidCreationId = (id: unknown): id is number => {
  return typeof id === 'number' && Number.isInteger(id) && id > 0;
};

export const isValidCreationType = (type: string): type is CreationType => {
  const validTypes: CreationType[] = [
    '글 작성',
    '블로그 제목 추천',
    '이미지 생성',
    '배경 제거',
    '요소 제거',
    '이력서 피드백',
  ];
  return validTypes.includes(type as CreationType);
};
