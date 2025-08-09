// API 관련 공통 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

// AI 생성 응답 타입
export interface ContentResponse {
  success: boolean;
  content?: string;
  message?: string;
  code?: string;
  usage?: number;
}

// 에러 응답 타입
export interface AxiosErrorResponse {
  status: number;
  data: {
    success: boolean;
    message?: string;
    code?: string;
  };
}

export interface ApiError {
  response?: AxiosErrorResponse;
  code?: string;
  message?: string;
}

// 타입 가드 함수
export const isAxiosError = (err: unknown): err is ApiError => {
  return typeof err === 'object' && err !== null && 'response' in err;
};

export const hasErrorCode = (err: unknown): err is { code: string } => {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof (err as Record<string, unknown>).code === 'string'
  );
};

export const hasErrorMessage = (err: unknown): err is { message: string } => {
  return (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as Record<string, unknown>).message === 'string'
  );
};
