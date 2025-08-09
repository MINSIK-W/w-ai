// 공통 검증 함수
export const validateInput = (
  input: string,
  minLength: number = 2
): boolean => {
  return input.trim().length >= minLength;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 파일 검증 함수
export const validateFile = (
  file: File,
  allowedTypes: string[],
  maxSize: number = 10 * 1024 * 1024 // 10MB 기본값
): { isValid: boolean; message?: string } => {
  if (file.size > maxSize) {
    const sizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      isValid: false,
      message: `파일 크기는 ${sizeMB}MB 이하여야 합니다.`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, message: '지원하지 않는 파일 형식입니다.' };
  }

  return { isValid: true };
};

// 이미지 파일 검증
export const validateImageFile = (
  file: File
): { isValid: boolean; message?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validateFile(file, allowedTypes, 10 * 1024 * 1024);
};

// PDF 파일 검증
export const validatePdfFile = (
  file: File
): { isValid: boolean; message?: string } => {
  const allowedTypes = ['application/pdf'];

  if (file.type !== 'application/pdf') {
    return { isValid: false, message: 'PDF 형식만 지원됩니다.' };
  }

  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return { isValid: false, message: 'PDF 파일을 선택해주세요.' };
  }

  return validateFile(file, allowedTypes, 5 * 1024 * 1024); // 5MB for PDFs
};

// 요소 제거용 객체 이름 검증
export const validateObjectName = (
  objectName: string
): { isValid: boolean; message?: string } => {
  const trimmed = objectName.trim();

  if (trimmed.length === 0) {
    return { isValid: false, message: '제거할 요소 이름을 입력해주세요.' };
  }

  if (trimmed.length < 2) {
    return { isValid: false, message: '요소 이름은 2글자 이상 입력해주세요.' };
  }

  if (trimmed.length > 20) {
    return {
      isValid: false,
      message: '요소 이름은 20글자 이하로 입력해주세요.',
    };
  }

  const words = trimmed.split(/\s+/);
  if (words.length > 3) {
    return { isValid: false, message: '최대 3개 단어까지만 입력 가능합니다.' };
  }

  return { isValid: true };
};
