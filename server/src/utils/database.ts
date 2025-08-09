import sql from '../configs/db.js';
import {
  RawUserCreation,
  transformRawCreation,
  UserCreation,
  CreationType,
} from '../types';
import { logError } from './logger.js';
// 데이터베이스 헬퍼 함수
// 사용자 게시물 생성
export const createUserCreation = async (
  userId: string,
  prompt: string,
  content: string,
  type: CreationType,
  publish: boolean = false
): Promise<void> => {
  try {
    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish, created_at) 
      VALUES (${userId}, ${prompt}, ${content}, ${type}, ${publish}, NOW())
    `;
  } catch (error) {
    logError('Database - Create user creation', error, userId);
    throw new Error('데이터 저장에 실패했습니다.');
  }
};

// 사용자의 모든 게시물 가져오기
export const getUserCreations = async (
  userId: string
): Promise<UserCreation[]> => {
  try {
    const rawCreations = (await sql`
      SELECT 
        id, user_id, prompt, content, type, publish, likes, created_at, updated_at 
      FROM creations 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `) as RawUserCreation[];

    return rawCreations.map(transformRawCreation);
  } catch (error) {
    logError('Database - Get user creations', error, userId);
    throw new Error('사용자 게시물을 불러오는데 실패했습니다.');
  }
};

// 공개된 게시물 가져오기
export const getPublishedCreations = async (): Promise<UserCreation[]> => {
  try {
    const rawCreations = (await sql`
      SELECT 
        id, user_id, prompt, content, type, publish, likes, created_at, updated_at 
      FROM creations 
      WHERE publish = true 
      ORDER BY created_at DESC
    `) as RawUserCreation[];

    return rawCreations.map(transformRawCreation);
  } catch (error) {
    logError('Database - Get published creations', error);
    throw new Error('공개 게시물을 불러오는데 실패했습니다.');
  }
};

// 좋아요 토글
export const toggleCreationLike = async (
  creationId: number,
  userId: string
): Promise<{
  success: boolean;
  message: string;
  updatedCreations?: UserCreation[];
}> => {
  try {
    // 게시물 존재 및 공개 상태 확인
    const creationResult = (await sql`
      SELECT id, likes, publish 
      FROM creations 
      WHERE id = ${creationId}
    `) as Pick<RawUserCreation, 'id' | 'likes' | 'publish'>[];

    if (creationResult.length === 0) {
      return { success: false, message: '해당 게시글을 찾을 수 없습니다.' };
    }

    const creation = creationResult[0];

    if (!creation.publish) {
      return { success: false, message: '공개되지 않은 게시물입니다.' };
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

    // 좋아요 업데이트
    await sql`
      UPDATE creations 
      SET likes = ${updatedLikes}, updated_at = NOW() 
      WHERE id = ${creationId}
    `;

    // 업데이트된 공개 게시물 목록 반환
    const updatedCreations = await getPublishedCreations();

    return { success: true, message, updatedCreations };
  } catch (error) {
    logError('Database - Toggle creation like', error, userId);
    throw new Error('좋아요 처리에 실패했습니다.');
  }
};

// 게시물 삭제 (소유자만)
export const deleteUserCreation = async (
  creationId: number,
  userId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const deletedResult = (await sql`
      DELETE FROM creations 
      WHERE id = ${creationId} AND user_id = ${userId}
      RETURNING id
    `) as Pick<RawUserCreation, 'id'>[];

    if (deletedResult.length === 0) {
      return {
        success: false,
        message: '게시물을 찾을 수 없거나 삭제 권한이 없습니다.',
      };
    }

    return { success: true, message: '게시물이 삭제되었습니다.' };
  } catch (error) {
    logError('Database - Delete user creation', error, userId);
    throw new Error('게시물 삭제에 실패했습니다.');
  }
};
