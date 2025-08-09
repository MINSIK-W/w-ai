import axios, { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { hasErrorCode, hasErrorMessage } from '@/type';

// API 클라이언트 설정
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:3000',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 공통 에러 처리 함수
export const handleApiError = (
  err: unknown,
  context: string = '작업'
): string => {
  console.error(`${context} 에러:`, err);

  let errorMessage = `${context}에 실패했습니다.`;

  if (isAxiosError(err) && err.response) {
    const statusCode = err.response.status;
    const errorData = err.response.data;

    switch (statusCode) {
      case 401:
        errorMessage = '로그인이 필요합니다. 다시 로그인해주세요.';
        break;
      case 403:
        if (errorData?.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage =
            '이 기능은 프리미엄 플랜에서만 이용 가능합니다. 업그레이드해주세요.';
        }
        break;
      case 413:
        errorMessage = '파일 크기가 너무 큽니다. 더 작은 파일을 선택해주세요.';
        break;
      case 415:
        errorMessage = '지원하지 않는 파일 형식입니다.';
        break;
      case 422:
        errorMessage = '입력값을 확인해주세요.';
        break;
      case 429:
        errorMessage =
          '무료 사용량을 모두 사용했습니다. 프리미엄으로 업그레이드하거나 내일 다시 시도해주세요.';
        break;
      case 500:
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        break;
      case 503:
        errorMessage =
          '서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
        break;
      default:
        errorMessage = errorData?.message || `서버 오류 (${statusCode})`;
    }
  } else if (hasErrorCode(err) && err.code === 'ECONNABORTED') {
    errorMessage = '요청 시간이 초과되었습니다. 다시 시도해주세요.';
  } else if (hasErrorCode(err) && err.code === 'ERR_NETWORK') {
    errorMessage = '네트워크 연결을 확인해주세요.';
  } else if (hasErrorMessage(err) && err.message === 'Network Error') {
    errorMessage = '네트워크 연결을 확인해주세요.';
  } else if (hasErrorMessage(err)) {
    errorMessage = err.message;
  }

  return errorMessage;
};

// API 요청 래퍼 함수
export const makeApiRequest = async <T>(
  requestFn: () => Promise<T>,
  context: string = '작업',
  showError: boolean = true
): Promise<T | null> => {
  try {
    return await requestFn();
  } catch (err) {
    const errorMessage = handleApiError(err, context);
    if (showError) {
      toast.error(errorMessage);
    }
    return null;
  }
};
