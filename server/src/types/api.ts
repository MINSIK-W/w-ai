import { UserCreation } from '../types/database';

// 기본 응답 타입
export interface BaseResponse {
  success: boolean;
  message?: string;
  code?: string;
}

// 콘텐츠 생성 성공 응답
export interface ContentSuccessResponse extends BaseResponse {
  success: true;
  content: string;
  usage?: number;
}

// 콘텐츠 생성 실패 응답
export interface ContentErrorResponse extends BaseResponse {
  success: false;
  estimatedTime?: number;
}

export type ContentResponse = ContentSuccessResponse | ContentErrorResponse;

// 요청 바디 타입들
export interface ArticleRequestBody {
  prompt: string;
  length: number;
}

export interface BlogTitleRequestBody {
  prompt: string;
}

export interface ImageRequestBody {
  prompt: string;
  publish?: boolean;
}

export interface ObjectRemovalRequestBody {
  object: string;
}

// 사용자 게시물 응답 타입
export interface UserCreationsResponse extends BaseResponse {
  success: true;
  creations: UserCreation[];
}

export interface LikeToggleResponse extends BaseResponse {
  success: true;
  creations?: UserCreation[];
}

// 에러 코드 상수
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  USAGE_LIMIT_EXCEEDED: 'USAGE_LIMIT_EXCEEDED',
  PLAN_RESTRICTION: 'PLAN_RESTRICTION',
  INVALID_INPUT: 'INVALID_INPUT',
  AI_RESPONSE_FAILED: 'AI_RESPONSE_FAILED',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
