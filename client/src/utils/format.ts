// 포맷팅 유틸리티 함수

// 파일 크기 변환
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 상대적 시간 표시
export const formatRelativeTime = (dateString: string | null): string => {
  if (!dateString) return '활동 없음';

  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return '방금 전';
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}일 전`;

  return date.toLocaleDateString('ko-KR');
};

// 숫자를 천단위 콤마로 포맷
export const formatNumber = (num: number): string => {
  return num.toLocaleString('ko-KR');
};

// 텍스트 자르기
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
