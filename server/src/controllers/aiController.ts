import OpenAI from 'openai';
import { Request, Response } from 'express';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';

import {
  validateEnvironment,
  validateAuthentication,
  validateUsageLimit,
  sanitizeInput,
  validatePrompt,
  validateArticleLength,
  validatePdfFile,
  validateImageFile,
} from '@/utils/validation';
import {
  safeExtractUserId,
  updateUsage,
  getUserPlan,
  getFreeUsage,
  isPremiumUser,
} from '@/utils/auth';
import { logError, logSuccess } from '@/utils/logger';
import { createUserCreation } from '@/utils/database';
import {
  ContentResponse,
  ArticleRequestBody,
  BlogTitleRequestBody,
  ImageRequestBody,
  ObjectRemovalRequestBody,
  ERROR_CODES,
} from '@/types';

// AI 클라이언트 초기화
const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
});

// 공통 에러 응답 함수
const createErrorResponse = (
  res: Response<ContentResponse>,
  statusCode: number,
  message: string,
  code?: string
): Response<ContentResponse> => {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
  });
};

// 공통 성공 응답 함수
const createSuccessResponse = (
  res: Response<ContentResponse>,
  content: string,
  usage?: number
): Response<ContentResponse> => {
  return res.status(200).json({
    success: true,
    content,
    usage,
  });
};

// 공통 AI 요청 함수
const makeAIRequest = async (
  prompt: string,
  maxTokens: number = 1000,
  temperature: number = 0.7
): Promise<string> => {
  const response = await Promise.race([
    AI.chat.completions.create({
      model: 'gemini-2.0-flash',
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_completion_tokens: maxTokens,
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI request timeout')), 30000)
    ),
  ]);

  const content = response.choices[0]?.message?.content;

  if (!content || content.trim().length === 0) {
    throw new Error('AI 응답 생성이 실패했습니다.');
  }

  return content;
};

export const article = async (
  req: Request<{}, ContentResponse, ArticleRequestBody>,
  res: Response<ContentResponse>
): Promise<Response<ContentResponse>> => {
  let userId: string | null = null;

  try {
    validateEnvironment();

    userId = await safeExtractUserId(req);
    if (!userId) {
      return createErrorResponse(
        res,
        401,
        '사용자 인증이 실패했습니다.',
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const { prompt, length } = req.body;

    // 입력 검증
    const promptValidation = validatePrompt(prompt, 5);
    if (!promptValidation.isValid) {
      return createErrorResponse(
        res,
        400,
        promptValidation.message!,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const lengthValidation = validateArticleLength(length);
    if (!lengthValidation.isValid) {
      return createErrorResponse(
        res,
        400,
        lengthValidation.message!,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const plan = getUserPlan(req);
    const freeUsage = getFreeUsage(req);

    if (!validateUsageLimit(plan, freeUsage)) {
      return createErrorResponse(
        res,
        429,
        '무료 플랜 한계에 도달했습니다. 업그레이드해주세요.',
        ERROR_CODES.USAGE_LIMIT_EXCEEDED
      );
    }

    const sanitizedPrompt = sanitizeInput(prompt);

    // AI 응답 생성
    const content = await makeAIRequest(sanitizedPrompt, length);

    // 데이터베이스 저장
    await createUserCreation(userId, sanitizedPrompt, content, '글 작성');

    // 무료 사용자 사용량 업데이트
    if (plan !== 'premium') {
      await updateUsage(userId, freeUsage);
    }

    logSuccess('글 생성', userId, { length: content.length });

    return createSuccessResponse(
      res,
      content,
      plan !== 'premium' ? freeUsage + 1 : undefined
    );
  } catch (error) {
    logError('글 생성', error, 'unknown');

    if (!res.headersSent) {
      return createErrorResponse(
        res,
        500,
        '서비스 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        ERROR_CODES.INTERNAL_SERVER_ERROR
      );
    }

    return res as Response<ContentResponse>;
  }
};

export const blogTitle = async (
  req: Request<{}, ContentResponse, BlogTitleRequestBody>,
  res: Response<ContentResponse>
): Promise<Response<ContentResponse>> => {
  let userId: string | null = null;

  try {
    validateEnvironment();

    userId = await safeExtractUserId(req);
    if (!userId) {
      return createErrorResponse(
        res,
        401,
        '사용자 인증이 실패했습니다.',
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const { prompt } = req.body;

    const promptValidation = validatePrompt(prompt, 2);
    if (!promptValidation.isValid) {
      return createErrorResponse(
        res,
        400,
        promptValidation.message!,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const plan = getUserPlan(req);
    const freeUsage = getFreeUsage(req);

    if (!validateUsageLimit(plan, freeUsage)) {
      return createErrorResponse(
        res,
        429,
        '무료 플랜 한계에 도달했습니다. 업그레이드해주세요.',
        ERROR_CODES.USAGE_LIMIT_EXCEEDED
      );
    }

    const sanitizedPrompt = sanitizeInput(prompt);
    const enhancedPrompt = `다음 키워드로 매력적인 블로그 제목을 만들어주세요: ${sanitizedPrompt}`;

    const content = await makeAIRequest(enhancedPrompt, 100, 0.8);

    await createUserCreation(userId, sanitizedPrompt, content, '배경 제거');

    if (plan !== 'premium') {
      await updateUsage(userId, freeUsage);
    }

    logSuccess('제목 생성', userId);

    return createSuccessResponse(
      res,
      content,
      plan !== 'premium' ? freeUsage + 1 : undefined
    );
  } catch (error) {
    logError('제목 생성', error, 'unknown');

    if (!res.headersSent) {
      return createErrorResponse(
        res,
        500,
        '서비스 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        ERROR_CODES.INTERNAL_SERVER_ERROR
      );
    }

    return res as Response<ContentResponse>;
  }
};

export const images = async (
  req: Request<{}, ContentResponse, ImageRequestBody>,
  res: Response<ContentResponse>
): Promise<Response<ContentResponse>> => {
  let userId: string | null = null;

  try {
    validateEnvironment();

    userId = await safeExtractUserId(req);
    if (!userId) {
      return createErrorResponse(
        res,
        401,
        '사용자 인증이 실패했습니다.',
        ERROR_CODES.UNAUTHORIZED
      );
    }

    if (!isPremiumUser(req)) {
      return createErrorResponse(
        res,
        403,
        '이미지 생성은 프리미엄 사용자만 이용할 수 있습니다. 업그레이드해주세요.',
        ERROR_CODES.PLAN_RESTRICTION
      );
    }

    const { prompt, publish = false } = req.body;

    const promptValidation = validatePrompt(prompt, 3);
    if (!promptValidation.isValid) {
      return createErrorResponse(
        res,
        400,
        promptValidation.message!,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const sanitizedPrompt = sanitizeInput(prompt);
    const enhancedPrompt = `${sanitizedPrompt}, high quality, detailed, professional photography`;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=512&height=512&model=flux&enhancement=true&seed=${Date.now()}`;

    // 이미지 다운로드
    const { data: imageData } = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 60000,
    });

    if (!imageData || imageData.byteLength === 0) {
      throw new Error('이미지를 생성하지 못했습니다.');
    }

    // Cloudinary 업로드
    const base64Image = `data:image/png;base64,${Buffer.from(imageData).toString('base64')}`;
    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      resource_type: 'image',
      folder: 'ai-generated-free',
      public_id: `${userId}_${Date.now()}`,
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        { width: 1024, height: 1024, crop: 'limit' },
      ],
    });

    if (!uploadResult.secure_url) {
      throw new Error('Cloudinary upload failed');
    }

    await createUserCreation(
      userId,
      sanitizedPrompt,
      uploadResult.secure_url,
      '이미지 생성',
      publish
    );

    logSuccess('이미지 생성', userId, { imageUrl: uploadResult.secure_url });

    return createSuccessResponse(res, uploadResult.secure_url);
  } catch (error) {
    logError('이미지 생성', error, userId || 'unknown');

    if (!res.headersSent) {
      return createErrorResponse(
        res,
        500,
        '이미지 생성에 실패했습니다. 잠시 후 다시 시도해주세요.',
        ERROR_CODES.INTERNAL_SERVER_ERROR
      );
    }

    return res as Response<ContentResponse>;
  }
};

export const background = async (
  req: Request,
  res: Response<ContentResponse>
): Promise<Response<ContentResponse>> => {
  let userId: string | null = null;

  try {
    validateEnvironment();

    userId = await safeExtractUserId(req);
    if (!userId) {
      return createErrorResponse(
        res,
        401,
        '사용자 인증이 실패했습니다.',
        ERROR_CODES.UNAUTHORIZED
      );
    }

    if (!isPremiumUser(req)) {
      return createErrorResponse(
        res,
        403,
        '프리미엄 사용자만 이용할 수 있습니다. 업그레이드해주세요.',
        ERROR_CODES.PLAN_RESTRICTION
      );
    }

    const fileValidation = validateImageFile(req.file);
    if (!fileValidation.isValid) {
      return createErrorResponse(
        res,
        400,
        fileValidation.message!,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const uploadResult = await cloudinary.uploader.upload(req.file!.path, {
      transformation: [{ effect: 'background_removal' }],
      folder: 'background-removed',
      public_id: `${userId}_${Date.now()}`,
    });

    if (!uploadResult.secure_url) {
      throw new Error('Background removal failed');
    }

    await createUserCreation(
      userId,
      '이미지 배경 제거',
      uploadResult.secure_url,
      '배경 제거'
    );

    logSuccess('배경 제거', userId);

    return createSuccessResponse(res, uploadResult.secure_url);
  } catch (error) {
    logError('배경 제거', error, userId || 'unknown');

    if (!res.headersSent) {
      return createErrorResponse(
        res,
        500,
        '배경 제거에 실패했습니다. 잠시 후 다시 시도해주세요.',
        ERROR_CODES.INTERNAL_SERVER_ERROR
      );
    }

    return res as Response<ContentResponse>;
  }
};

export const object = async (
  req: Request<{}, ContentResponse, ObjectRemovalRequestBody>,
  res: Response<ContentResponse>
): Promise<Response<ContentResponse>> => {
  let userId: string | null = null;

  try {
    validateEnvironment();

    userId = await safeExtractUserId(req);
    if (!userId) {
      return createErrorResponse(
        res,
        401,
        '사용자 인증이 실패했습니다.',
        ERROR_CODES.UNAUTHORIZED
      );
    }

    if (!isPremiumUser(req)) {
      return createErrorResponse(
        res,
        403,
        '프리미엄 사용자만 이용할 수 있습니다. 업그레이드해주세요.',
        ERROR_CODES.PLAN_RESTRICTION
      );
    }

    const fileValidation = validateImageFile(req.file);
    if (!fileValidation.isValid) {
      return createErrorResponse(
        res,
        400,
        fileValidation.message!,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const { object } = req.body;
    const objectValidation = validatePrompt(object, 2);
    if (!objectValidation.isValid) {
      return createErrorResponse(
        res,
        400,
        '제거할 객체를 입력해주세요.',
        ERROR_CODES.INVALID_INPUT
      );
    }

    const uploadResult = await cloudinary.uploader.upload(req.file!.path);
    const imageUrl = cloudinary.url(uploadResult.public_id, {
      transformation: [{ effect: `gen_remove:${sanitizeInput(object)}` }],
    });

    await createUserCreation(
      userId,
      `제거된 ${object} 이미지`,
      imageUrl,
      '요소 제거'
    );

    logSuccess('객체 제거', userId, { object });

    return createSuccessResponse(res, imageUrl);
  } catch (error) {
    logError('객체 제거', error, 'unknown');

    if (!res.headersSent) {
      return createErrorResponse(
        res,
        500,
        '객체 제거에 실패했습니다. 잠시 후 다시 시도해주세요.',
        ERROR_CODES.INTERNAL_SERVER_ERROR
      );
    }

    return res as Response<ContentResponse>;
  }
};

export const resumes = async (
  req: Request,
  res: Response<ContentResponse>
): Promise<Response<ContentResponse>> => {
  let userId: string | null = null;

  try {
    validateEnvironment();

    userId = await safeExtractUserId(req);
    if (!userId) {
      return createErrorResponse(
        res,
        401,
        '사용자 인증이 실패했습니다.',
        ERROR_CODES.UNAUTHORIZED
      );
    }

    if (!isPremiumUser(req)) {
      return createErrorResponse(
        res,
        403,
        '프리미엄 사용자만 이용할 수 있습니다. 업그레이드해주세요.',
        ERROR_CODES.PLAN_RESTRICTION
      );
    }

    const fileValidation = validatePdfFile(req.file);
    if (!fileValidation.isValid) {
      return createErrorResponse(
        res,
        400,
        fileValidation.message!,
        ERROR_CODES.INVALID_INPUT
      );
    }

    // PDF 파싱
    const dataBuffer = fs.readFileSync(req.file!.path);
    const pdfData = await pdf(dataBuffer);

    const prompt = `
    이력서를 검토하고 강점, 약점 및 개선 영역에 대한 건설적인 피드백을 제공하십시오.
    
    이력서 내용:
    ${pdfData.text}`;

    const content = await makeAIRequest(prompt, 1000);

    await createUserCreation(
      userId,
      '업로드된 이력서 검토',
      content,
      '이력서 피드백'
    );

    // 임시 파일 삭제
    try {
      fs.unlinkSync(req.file!.path);
    } catch (cleanupError) {
      console.warn('Failed to delete temporary file:', cleanupError);
    }

    logSuccess('이력서 검토', userId);

    return createSuccessResponse(res, content);
  } catch (error) {
    logError('이력서 검토', error, 'unknown');

    if (!res.headersSent) {
      return createErrorResponse(
        res,
        500,
        '이력서 검토에 실패했습니다. 잠시 후 다시 시도해주세요.',
        ERROR_CODES.INTERNAL_SERVER_ERROR
      );
    }

    return res as Response<ContentResponse>;
  }
};
