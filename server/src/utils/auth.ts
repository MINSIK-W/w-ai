import { clerkClient } from '@clerk/express';
import { Request } from 'express';
import { logError } from '@/utils/logger';
// 인증 관련 유틸리티 함수
// 사용자 인증 정보 안전하게 추출
export const safeExtractUserId = async (
  req: Request
): Promise<string | null> => {
  try {
    const auth = await req.auth();
    return auth?.userId && true && auth.userId.trim().length > 0
      ? auth.userId
      : null;
  } catch (error) {
    logError('Auth extraction', error);
    return null;
  }
};

// 사용량 업데이트
export const updateUsage = async (
  userId: string,
  currentUsage: number
): Promise<void> => {
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        free_usage: currentUsage + 1,
      },
    });
  } catch (error) {
    logError('Usage update', error, userId);
    // 사용량 업데이트 실패는 치명적이지 않으므로 에러를 던지지 않음
  }
};

// 사용자 플랜 확인
export const getUserPlan = (req: Request): string => {
  return req.plan || 'free';
};

// 무료 사용량 확인
export const getFreeUsage = (req: Request): number => {
  return req.free_usage || 0;
};

// 프리미엄 사용자 확인
export const isPremiumUser = (req: Request): boolean => {
  return getUserPlan(req) === 'premium';
};
