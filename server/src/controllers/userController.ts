import { Request, Response } from 'express';
import sql from '@/configs/db';

// 타입 정의
interface UserCreation {
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

// 데이터베이스에서 반환되는 원시 타입 (PostgreSQL에서 실제 반환되는 형태)
interface RawUserCreation {
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

interface CreationResponse {
  success: boolean;
  creations?: UserCreation[];
  message?: string;
}

interface LikeToggleBody {
  id: number;
}

interface LikeResponse {
  success: boolean;
  message?: string;
  creations?: UserCreation[];
}

// 타입 가드 함수들
const isValidUserId = (userId: unknown): userId is string => {
  return typeof userId === 'string' && userId.trim().length > 0;
};

const isValidCreationId = (id: unknown): id is number => {
  return typeof id === 'number' && Number.isInteger(id) && id > 0;
};

// 데이터 변환 함수
const transformRawCreation = (raw: RawUserCreation): UserCreation => {
  return {
    ...raw,
    likes: raw.likes || [],
    created_at: new Date(raw.created_at),
    updated_at: new Date(raw.updated_at),
  };
};

// 공통 에러 로깅 함수
const logError = (operation: string, error: unknown, userId?: string): void => {
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

// 사용자 인증 정보 안전하게 추출
const safeExtractUserId = async (req: Request): Promise<string | null> => {
  try {
    const auth = await req.auth();
    return isValidUserId(auth?.userId) ? auth.userId : null;
  } catch (error) {
    logError('Auth extraction', error);
    return null;
  }
};

export const getUserCreations = async (
  req: Request,
  res: Response<CreationResponse>
): Promise<Response<CreationResponse>> => {
  let userId: string | null = null;

  try {
    userId = await safeExtractUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '사용자 인증이 실패했습니다.',
      });
    }

    console.log('Fetching creations for user:', userId);

    // 제네릭 타입 제거하고 명시적 타입 캐스팅 사용
    const rawCreations = (await sql`
      SELECT 
        id, 
        user_id, 
        prompt, 
        content, 
        type, 
        publish, 
        likes, 
        created_at, 
        updated_at 
      FROM creations 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `) as RawUserCreation[];

    // 안전한 타입 변환
    const creations: UserCreation[] = rawCreations.map(transformRawCreation);

    return res.status(200).json({
      success: true,
      creations,
    });
  } catch (error: unknown) {
    logError('Get user creations', error, userId || 'unknown');

    return res.status(500).json({
      success: false,
      message: '사용자 게시물을 불러오는데 실패했습니다.',
    });
  }
};

export const getPublishedCreations = async (
  req: Request,
  res: Response<CreationResponse>
): Promise<Response<CreationResponse>> => {
  try {
    console.log('Fetching published creations');

    const rawCreations = (await sql`
      SELECT 
        id, 
        user_id, 
        prompt, 
        content, 
        type, 
        publish, 
        likes, 
        created_at, 
        updated_at 
      FROM creations 
      WHERE publish = true 
      ORDER BY created_at DESC
    `) as RawUserCreation[];

    const creations: UserCreation[] = rawCreations.map(transformRawCreation);

    return res.status(200).json({
      success: true,
      creations,
    });
  } catch (error: unknown) {
    logError('Get published creations', error);

    return res.status(500).json({
      success: false,
      message: '공개 게시물을 불러오는데 실패했습니다.',
    });
  }
};

export const toggleLikeCreation = async (
  req: Request<{}, LikeResponse, LikeToggleBody>,
  res: Response<LikeResponse>
): Promise<Response<LikeResponse>> => {
  let userId: string | null = null;

  try {
    userId = await safeExtractUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '사용자 인증이 실패했습니다.',
      });
    }

    const { id } = req.body;

    // 입력 검증 - 타입 가드 사용
    if (!isValidCreationId(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 게시물 ID입니다.',
      });
    }

    console.log(`Toggling like for creation ${id} by user ${userId}`);

    // 게시물 존재 및 공개 상태 확인
    const creationResult = (await sql`
      SELECT id, likes, publish 
      FROM creations 
      WHERE id = ${id}
    `) as Pick<RawUserCreation, 'id' | 'likes' | 'publish'>[];

    if (creationResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: '해당 게시글을 찾을 수 없습니다.',
      });
    }

    const creation = creationResult[0];

    // 공개되지 않은 게시물은 좋아요 불가
    if (!creation.publish) {
      return res.status(403).json({
        success: false,
        message: '공개되지 않은 게시물입니다.',
      });
    }

    const currentLikes = creation.likes || [];
    let updatedLikes: string[];
    let message: string;

    if (currentLikes.includes(userId)) {
      // 좋아요 취소
      updatedLikes = currentLikes.filter(user => user !== userId);
      message = '좋아요가 취소되었습니다.';
    } else {
      // 좋아요 추가
      updatedLikes = [...currentLikes, userId];
      message = '좋아요를 눌렀습니다.';
    }

    // 트랜잭션 내에서 안전하게 업데이트
    await sql`
      UPDATE creations 
      SET likes = ${updatedLikes}, 
          updated_at = NOW() 
      WHERE id = ${id}
    `;

    // 업데이트된 공개 게시물 목록 반환
    const rawUpdatedCreations = (await sql`
      SELECT 
        id, 
        user_id, 
        prompt, 
        content, 
        type, 
        publish, 
        likes, 
        created_at, 
        updated_at 
      FROM creations 
      WHERE publish = true 
      ORDER BY created_at DESC
    `) as RawUserCreation[];

    const updatedCreations = rawUpdatedCreations.map(transformRawCreation);

    return res.status(200).json({
      success: true,
      message,
      creations: updatedCreations,
    });
  } catch (error: unknown) {
    logError('Toggle like creation', error, userId || 'unknown');

    return res.status(500).json({
      success: false,
      message: '좋아요 처리에 실패했습니다. 다시 시도해주세요.',
    });
  }
};

export const deleteCreation = async (
  req: Request<{ id: string }>,
  res: Response<{ success: boolean; message?: string }>
): Promise<Response<{ success: boolean; message?: string }>> => {
  let userId: string | null = null;

  try {
    userId = await safeExtractUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '사용자 인증이 실패했습니다.',
      });
    }

    const creationId = parseInt(id, 10);
    if (!isValidCreationId(creationId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 게시물 ID입니다.',
      });
    }

    // 소유권 확인과 삭제를 한 번에 처리
    const deletedResult = (await sql`
      DELETE FROM creations 
      WHERE id = ${creationId} AND user_id = ${userId}
      RETURNING id
    `) as Pick<RawUserCreation, 'id'>[];

    if (deletedResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없거나 삭제 권한이 없습니다.',
      });
    }

    console.log(
      `Creation ${creationId} deleted successfully by user ${userId}`
    );

    return res.status(200).json({
      success: true,
      message: '게시물이 삭제되었습니다.',
    });
  } catch (error: unknown) {
    logError('Delete creation', error, userId || 'unknown');

    return res.status(500).json({
      success: false,
      message: '게시물 삭제에 실패했습니다.',
    });
  }
};
