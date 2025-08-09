// 서버 측 검증 유틸리티 함수

// 환경변수 검증
export const validateEnvironment = (): void => {
  const requiredEnvVars = [
    'GEMINI_API_KEY',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`필수 환경 변수 누락: ${missingVars.join(', ')}`);
  }
};

// 사용자 인증 검증
export const validateAuthentication = (userId: string | undefined): boolean => {
  return Boolean(userId && userId.trim().length > 0);
};

// 사용량 제한 검증
export const validateUsageLimit = (
  plan: string,
  freeUsage: number
): boolean => {
  return plan === 'premium' || freeUsage < 10;
};

// 입력값 정제 (XSS 방지)
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// 프롬프트 검증
export const validatePrompt = (
  prompt: string,
  minLength: number = 1
): { isValid: boolean; message?: string } => {
  if (!prompt || prompt.trim().length === 0) {
    return { isValid: false, message: '내용이 비어있습니다.' };
  }

  if (prompt.trim().length < minLength) {
    return {
      isValid: false,
      message: `최소 ${minLength}글자 이상 입력해주세요.`,
    };
  }

  if (prompt.trim().length > 1000) {
    return { isValid: false, message: '내용이 너무 깁니다. (최대 1000자)' };
  }

  return { isValid: true };
};

// 글 길이 검증
export const validateArticleLength = (
  length: number
): { isValid: boolean; message?: string } => {
  if (!length || length <= 0 || length > 4000) {
    return { isValid: false, message: '글 길이는 1 ~ 4000 사이여야 합니다.' };
  }

  return { isValid: true };
};

// 파일 검증
export const validateFile = (
  file: Express.Multer.File | undefined,
  requiredTypes: string[]
): { isValid: boolean; message?: string } => {
  if (!file) {
    return { isValid: false, message: '파일이 업로드되지 않았습니다.' };
  }

  if (!requiredTypes.includes(file.mimetype)) {
    return { isValid: false, message: '지원하지 않는 파일 형식입니다.' };
  }

  return { isValid: true };
};

// PDF 파일 검증
export const validatePdfFile = (
  file: Express.Multer.File | undefined
): { isValid: boolean; message?: string } => {
  const validation = validateFile(file, ['application/pdf']);
  if (!validation.isValid) return validation;

  // 5MB 제한
  if (file!.size > 5 * 1024 * 1024) {
    return {
      isValid: false,
      message: '파일이 허용된 용량을 초과했습니다. (5MB 이하)',
    };
  }

  return { isValid: true };
};

// 이미지 파일 검증
export const validateImageFile = (
  file: Express.Multer.File | undefined
): { isValid: boolean; message?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const validation = validateFile(file, allowedTypes);
  if (!validation.isValid) return validation;

  // 10MB 제한
  if (file!.size > 10 * 1024 * 1024) {
    return {
      isValid: false,
      message: '파일이 허용된 용량을 초과했습니다. (10MB 이하)',
    };
  }

  return { isValid: true };
};
