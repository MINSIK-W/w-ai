import OpenAI from 'openai';
import sql from '@/configs/db';
import { clerkClient } from '@clerk/express';
import { Request, Response } from 'express';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';

// 요청 바디 타입
interface ArticleRequestBody {
  prompt: string;
  length: number;
}

interface BlogTitleRequestBody {
  prompt: string;
}

interface ImageRequestBody {
  prompt: string;
  publish?: boolean;
}
interface BackgroundRequestBody {
  prompt: string;
}
interface ObjectRemovalRequestBody {
  object: string;
}
// 응답 타입
interface ContentSuccessResponse {
  success: true;
  content: string;
  usage?: number;
}

interface ContentErrorResponse {
  success: false;
  message: string;
  code?: string;
  estimatedTime?: number;
}

type ContentResponse = ContentSuccessResponse | ContentErrorResponse;

// 환경변수 검증
const validateEnvironment = (): void => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY 환경 변수 누락 확인 바람.');
  }
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error('CLOUDINARY_ 환경 변수 누락 확인 바람.');
  }
};

// AI 클라이언트 초기화
const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
});

// 공통 유효성 검사 함수
const validateAuthentication = (userId: string | undefined): boolean => {
  return Boolean(userId && userId.trim().length > 0);
};

const validateUsageLimit = (plan: string, freeUsage: number): boolean => {
  return plan === 'premium' || freeUsage < 10;
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, ''); // 기본적인 XSS 방지
};

// 공통 에러 로깅 함수
const logError = (operation: string, error: unknown, userId?: string): void => {
  console.error(`${operation} error:`, {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    userId: userId || 'unknown',
    timestamp: new Date().toISOString(),
    operation,
  });
};

// 사용량 업데이트 공통 함수
const updateUsage = async (
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

export const article = async (
  req: Request<{}, ContentResponse, ArticleRequestBody>,
  res: Response<ContentResponse>
): Promise<Response<ContentResponse>> => {
  try {
    validateEnvironment();

    const { userId } = await req.auth();

    if (!validateAuthentication(userId)) {
      return res.status(401).json({
        success: false,
        message: '사용자 인증이 실패했습니다.',
        code: '권한 없는 사용자',
      });
    }

    const { prompt, length } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '글 주제가 비어있습니다.',
        code: '글 주제 입력 에러',
      });
    }

    if (!length || length <= 0 || length > 4000) {
      return res.status(400).json({
        success: false,
        message: '글 길이는 1 ~ 4000 사이여야 합니다.',
        code: '잘못된 글 길이',
      });
    }

    const sanitizedPrompt = sanitizeInput(prompt);
    const plan = req.plan || 'free';
    const freeUsage = req.free_usage || 0;

    if (!validateUsageLimit(plan, freeUsage)) {
      return res.status(429).json({
        success: false,
        message: '무료 플랜 한계에 도달했습니다. 업그레이드해주세요.',
        code: '사용 제한 초과',
      });
    }

    // AI 응답 생성 및 타임아웃 설정
    const response = await Promise.race([
      AI.chat.completions.create({
        model: 'gemini-2.0-flash',
        messages: [{ role: 'user', content: sanitizedPrompt }],
        temperature: 0.7,
        max_completion_tokens: length,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI request timeout')), 30000)
      ),
    ]);

    const content = response.choices[0]?.message?.content;

    if (!content || content.trim().length === 0) {
      return res.status(500).json({
        success: false,
        message: 'AI 응답 생성이 실패했습니다.',
        code: 'AI 응답 실패',
      });
    }

    try {
      await sql`
        INSERT INTO creations (user_id, prompt, content, type, created_at) 
        VALUES (${userId}, ${sanitizedPrompt}, ${content}, 'article', NOW())
      `;

      if (plan !== 'premium') {
        await updateUsage(userId, freeUsage);
      }
    } catch (dbError) {
      logError('Database operation', dbError, userId);
      return res.status(500).json({
        success: false,
        message: '데이터 저장에 실패했습니다.',
        code: '데이터베이스 에러',
      });
    }

    return res.status(200).json({
      success: true,
      content,
      usage: plan !== 'premium' ? freeUsage + 1 : undefined,
    });
  } catch (error) {
    let userId = 'unknown';
    try {
      const authResult = await req.auth();
      userId = authResult.userId || 'unknown';
    } catch {}

    logError('글 생성', error, userId);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: '서비스 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        code: '내부 서버 오류',
      });
    }

    return res as Response<ContentResponse>;
  }
};

export const blogTitle = async (
  req: Request<{}, ContentResponse, BlogTitleRequestBody>,
  res: Response<ContentResponse>
): Promise<Response<ContentResponse>> => {
  try {
    validateEnvironment();

    const { userId } = await req.auth();

    if (!validateAuthentication(userId)) {
      return res.status(401).json({
        success: false,
        message: '사용자 인증이 실패했습니다.',
        code: '권한 없는 사용자',
      });
    }

    const { prompt } = req.body;

    // 입력 검증
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '키워드가 비어있습니다.',
        code: '키워드 에러',
      });
    }

    const sanitizedPrompt = sanitizeInput(prompt);
    const plan = req.plan || 'free';
    const freeUsage = req.free_usage || 0;

    if (!validateUsageLimit(plan, freeUsage)) {
      return res.status(429).json({
        success: false,
        message: '무료 플랜 한계에 도달했습니다. 업그레이드해주세요.',
        code: '사용 제한 초과',
      });
    }

    const response = await Promise.race([
      AI.chat.completions.create({
        model: 'gemini-2.0-flash',
        messages: [
          {
            role: 'user',
            content: `다음 키워드로 매력적인 제목을 만들어주세요: ${sanitizedPrompt}`,
          },
        ],
        temperature: 0.8,
        max_completion_tokens: 100,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI request timeout')), 20000)
      ),
    ]);

    const content = response.choices[0]?.message?.content;

    if (!content || content.trim().length === 0) {
      return res.status(500).json({
        success: false,
        message: 'AI 응답 생성이 실패했습니다.',
        code: 'AI 응답 실패',
      });
    }

    try {
      await sql`
        INSERT INTO creations (user_id, prompt, content, type, created_at) 
        VALUES (${userId}, ${sanitizedPrompt}, ${content}, 'title', NOW())
      `;

      if (plan !== 'premium') {
        await updateUsage(userId, freeUsage);
      }
    } catch (dbError) {
      logError('Database operation', dbError, userId);
      return res.status(500).json({
        success: false,
        message: '데이터 저장에 실패했습니다.',
        code: '데이터베이스 에러',
      });
    }

    return res.status(200).json({
      success: true,
      content,
      usage: plan !== 'premium' ? freeUsage + 1 : undefined,
    });
  } catch (error) {
    logError(
      '제목 생성',
      error,
      req.auth
        ? (await req.auth().catch(() => ({ userId: 'unknown' })))?.userId
        : 'unknown'
    );

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: '서비스 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        code: '내부 서버 오류',
      });
    }

    return res as Response<ContentResponse>;
  }
};

export const images = async (
  req: Request<{}, ContentResponse, ImageRequestBody>,
  res: Response<ContentResponse>
): Promise<Response<ContentResponse>> => {
  try {
    validateEnvironment();

    const { userId } = await req.auth();

    if (!validateAuthentication(userId)) {
      return res.status(401).json({
        success: false,
        message: '사용자 인증이 실패했습니다.',
        code: '권한 없는 사용자',
      });
    }

    const { prompt, publish = false } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '이미지 설명이 비어있습니다.',
        code: '이미지 생성 에러',
      });
    }

    const sanitizedPrompt = sanitizeInput(prompt);
    const plan = req.plan || 'free';

    // 프리미엄 전용 기능
    if (plan !== 'premium') {
      return res.status(403).json({
        success: false,
        message:
          '이미지 생성은 프리미엄 사용자만 이용할 수 있습니다. 업그레이드해주세요.',
        code: '플랜 제한',
      });
    }

    console.log(
      'Starting Pollinations AI image generation for prompt:',
      sanitizedPrompt
    );

    const enhancedPrompt = `${sanitizedPrompt}, high quality, detailed, professional photography`;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=512&height=512&model=flux&enhancement=true&seed=${Date.now()}`;

    console.log('이미지 생성:', imageUrl);

    // 이미지 다운로드
    const { data: imageData } = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 60000,
    });

    if (!imageData || imageData.byteLength === 0) {
      throw new Error('이미지를 생성하지 못했습니다.');
    }

    console.log('이미지 다운로드:', imageData.byteLength);

    // 이미지를 Base64로 변환
    const base64Image = `data:image/png;base64,${Buffer.from(imageData).toString('base64')}`;

    // Cloudinary 업로드
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

    console.log('Cloudinary에 업로드 된 이미지:', uploadResult.secure_url);

    try {
      await sql`
        INSERT INTO creations (user_id, prompt, content, type, publish, created_at)
        VALUES (${userId}, ${sanitizedPrompt}, ${uploadResult.secure_url}, 'image', ${publish}, NOW())
      `;
      console.log('데이터베이스 레코드 생성 완료');
    } catch (dbError) {
      logError('Database operation', dbError, userId);
      return res.status(500).json({
        success: false,
        message: '데이터 저장에 실패했습니다.',
        code: '데이터베이스 에러',
      });
    }

    return res.status(200).json({
      success: true,
      content: uploadResult.secure_url,
    });
  } catch (error: unknown) {
    let userId = 'unknown';
    try {
      const authResult = await req.auth();
      userId = authResult.userId || 'unknown';
    } catch {}

    logError('Pollinations AI 이미지 생성', error, userId);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: '이미지 생성에 실패했습니다. 잠시 후 다시 시도해주세요.',
        code: '내부 서버 오류',
      });
    }

    return res as Response<ContentResponse>;
  }
};

export const background = async (
  req: Request<{}, ContentResponse, BackgroundRequestBody>,
  res: Response<ContentResponse>
): Promise<Response<ContentResponse>> => {
  try {
    validateEnvironment();

    const { userId } = await req.auth();

    if (!validateAuthentication(userId)) {
      return res.status(401).json({
        success: false,
        message: '사용자 인증이 실패했습니다.',
        code: '권한 없는 사용자',
      });
    }

    // 파일 검증
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '이미지 파일이 업로드되지 않았습니다.',
        code: '파일 업로드 에러',
      });
    }

    const plan = req.plan || 'free';

    if (plan !== 'premium') {
      return res.status(403).json({
        success: false,
        message: '프리미엄 사용자만 이용할 수 있습니다. 업그레이드해주세요.',
        code: '플랜 제한',
      });
    }

    console.log('Starting background removal');

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      transformation: [
        {
          effect: 'background_removal',
        },
      ],
      folder: 'background-removed',
      public_id: `${userId}_${Date.now()}`,
    });

    if (!uploadResult.secure_url) {
      throw new Error('Background removal failed');
    }

    try {
      await sql`
        INSERT INTO creations (user_id, prompt, content, type, created_at)
        VALUES (${userId}, '이미지 배경 제거', ${uploadResult.secure_url}, 'background', NOW())
      `;
      console.log('데이터베이스 레코드 생성 완료');
    } catch (dbError) {
      logError('Database operation', dbError, userId);
      return res.status(500).json({
        success: false,
        message: '데이터 저장에 실패했습니다.',
        code: '데이터베이스 에러',
      });
    }

    return res.status(200).json({
      success: true,
      content: uploadResult.secure_url,
    });
  } catch (error: unknown) {
    let userId = 'unknown';
    try {
      const authResult = await req.auth();
      userId = authResult.userId || 'unknown';
    } catch {}

    logError('배경 제거', error, userId);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: '배경 제거에 실패했습니다. 잠시 후 다시 시도해주세요.',
        code: '내부 서버 오류',
      });
    }

    return res as Response<ContentResponse>;
  }
};

export const object = async (
  req: Request<{}, ContentResponse, ObjectRemovalRequestBody>,
  res: Response<ContentResponse>
): Promise<Response<ContentResponse>> => {
  try {
    validateEnvironment();

    const { userId } = await req.auth();

    if (!validateAuthentication(userId)) {
      return res.status(401).json({
        success: false,
        message: '사용자 인증이 실패했습니다.',
        code: '권한 없는 사용자',
      });
    }

    // 파일과 바디 검증
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '이미지 파일이 업로드되지 않았습니다.',
        code: '파일 업로드 에러',
      });
    }

    const { object } = req.body; // await 제거

    if (!object || object.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '제거할 객체를 입력해주세요.',
        code: '객체 입력 에러',
      });
    }

    const plan = req.plan || 'free';

    if (plan !== 'premium') {
      return res.status(403).json({
        success: false,
        message: '프리미엄 사용자만 이용할 수 있습니다. 업그레이드해주세요.',
        code: '플랜 제한',
      });
    }

    console.log(`Starting object removal: ${object}`);

    const uploadResult = await cloudinary.uploader.upload(req.file.path);

    const imageUrl = cloudinary.url(uploadResult.public_id, {
      transformation: [
        {
          effect: `gen_remove:${object}`,
        },
      ],
    });

    try {
      await sql`
        INSERT INTO creations (user_id, prompt, content, type, created_at)
        VALUES (${userId}, ${`제거된 ${object} 이미지`}, ${imageUrl}, 'object-removal', NOW())
      `;
      console.log('데이터베이스 레코드 생성 완료');
    } catch (dbError) {
      logError('Database operation', dbError, userId);
      return res.status(500).json({
        success: false,
        message: '데이터 저장에 실패했습니다.',
        code: '데이터베이스 에러',
      });
    }

    return res.status(200).json({
      success: true,
      content: imageUrl,
    });
  } catch (error: unknown) {
    let userId = 'unknown';
    try {
      const authResult = await req.auth();
      userId = authResult.userId || 'unknown';
    } catch {}

    logError('객체 제거', error, userId);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: '객체 제거에 실패했습니다. 잠시 후 다시 시도해주세요.',
        code: '내부 서버 오류',
      });
    }

    return res as Response<ContentResponse>;
  }
};

export const resumes = async (
  // 함수명 수정
  req: Request<{}, ContentResponse, BackgroundRequestBody>,
  res: Response<ContentResponse>
): Promise<Response<ContentResponse>> => {
  try {
    validateEnvironment();

    const { userId } = await req.auth();

    if (!validateAuthentication(userId)) {
      return res.status(401).json({
        success: false,
        message: '사용자 인증이 실패했습니다.',
        code: '권한 없는 사용자',
      });
    }

    const resume = req.file;

    if (!resume) {
      return res.status(400).json({
        success: false,
        message: 'PDF 파일을 업로드해주세요.',
        code: '파일 업로드 에러',
      });
    }

    const plan = req.plan || 'free';

    if (plan !== 'premium') {
      return res.status(403).json({
        success: false,
        message: '프리미엄 사용자만 이용할 수 있습니다. 업그레이드해주세요.',
        code: '플랜 제한',
      });
    }

    // 파일 크기 검증
    if (resume.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: '파일이 허용된 용량을 초과했습니다. (5MB 이하)',
        code: '파일 크기 초과',
      });
    }

    console.log('Starting resume review');

    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);

    const prompt = `
    이력서를 검토하고 강점, 약점 및 개선 영역에 대한 건설적인 피드백을 제공하십시오.
    
    이력서 내용:
    ${pdfData.text}`;

    const response = await Promise.race([
      AI.chat.completions.create({
        model: 'gemini-2.0-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_completion_tokens: 1000,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI request timeout')), 30000)
      ),
    ]);

    const content = response.choices[0]?.message?.content;

    if (!content || content.trim().length === 0) {
      return res.status(500).json({
        success: false,
        message: 'AI 응답 생성이 실패했습니다.',
        code: 'AI 응답 실패',
      });
    }

    try {
      await sql`
        INSERT INTO creations (user_id, prompt, content, type, created_at)
        VALUES (${userId}, '업로드된 이력서 검토', ${content}, 'resume-review', NOW())
      `;
      console.log('데이터베이스 레코드 생성 완료');
    } catch (dbError) {
      logError('Database operation', dbError, userId);
      return res.status(500).json({
        success: false,
        message: '데이터 저장에 실패했습니다.',
        code: '데이터베이스 에러',
      });
    }

    // 임시 파일 삭제
    try {
      fs.unlinkSync(resume.path);
    } catch (cleanupError) {
      console.warn('Failed to delete temporary file:', cleanupError);
    }

    return res.status(200).json({
      success: true,
      content,
    });
  } catch (error: unknown) {
    let userId = 'unknown';
    try {
      const authResult = await req.auth();
      userId = authResult.userId || 'unknown';
    } catch {}

    logError('이력서 검토', error, userId);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: '이력서 검토에 실패했습니다. 잠시 후 다시 시도해주세요.',
        code: '내부 서버 오류',
      });
    }

    return res as Response<ContentResponse>;
  }
};
