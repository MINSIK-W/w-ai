// 공통 에러 로깅 함수
export const logError = (
  operation: string,
  error: unknown,
  userId?: string
): void => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error(`${operation} error:`, {
    message: errorMessage,
    stack: errorStack,
    userId: userId || 'unknown',
    timestamp: new Date().toISOString(),
    operation,
  });
};

// 성공 로그
export const logSuccess = (
  operation: string,
  userId?: string,
  additionalData?: Record<string, any>
): void => {
  console.log(`${operation} success:`, {
    userId: userId || 'unknown',
    timestamp: new Date().toISOString(),
    operation,
    ...additionalData,
  });
};

// API 요청 로그
export const logApiRequest = (
  method: string,
  path: string,
  userId?: string
): void => {
  console.log(`API Request:`, {
    method,
    path,
    userId: userId || 'unknown',
    timestamp: new Date().toISOString(),
  });
};
