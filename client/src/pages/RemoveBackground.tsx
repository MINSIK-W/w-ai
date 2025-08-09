import { useState } from 'react';
import * as React from 'react';
import { Eraser, Sparkles, Lock, Upload, Download } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL =
  import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

// 타입 정의
interface AxiosErrorResponse {
  status: number;
  data: {
    success: boolean;
    message?: string;
    code?: string;
  };
}

interface ApiError {
  response?: AxiosErrorResponse;
  code?: string;
  message?: string;
}

// 타입 가드 함수들
const isAxiosError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'response' in error;
};

const hasErrorCode = (error: unknown): error is { code: string } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
};

const hasErrorMessage = (error: unknown): error is { message: string } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
};

// 파일 검증 함수
const validateFile = (file: File): { isValid: boolean; message?: string } => {
  // 파일 크기 제한 (10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, message: '파일 크기는 10MB 이하여야 합니다.' };
  }

  // 이미지 파일 형식 검증
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, message: 'JPG, PNG, WEBP 형식만 지원됩니다.' };
  }

  return { isValid: true };
};

// 파일 크기를 읽기 쉬운 형태로 변환
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function RemoveBackground() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [content, setContent] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const { getToken } = useAuth();

  // 버튼 비활성화 조건
  const isSubmitDisabled = loading || !file;

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      setPreviewUrl('');
      return;
    }

    const validation = validateFile(selectedFile);
    if (!validation.isValid) {
      toast.error(validation.message!);
      e.target.value = ''; // 입력 초기화
      return;
    }

    setFile(selectedFile);

    // 미리보기 URL 생성
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  // 파일 제거 핸들러
  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl('');
    setContent('');

    // 파일 입력 초기화
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // 결과 이미지 다운로드
  const handleDownload = async () => {
    if (!content) return;

    try {
      const link = document.createElement('a');
      link.href = content;
      link.download = `background-removed-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('이미지가 다운로드되었습니다!');
    } catch (error) {
      console.error('다운로드 실패:', error);
      toast.error('다운로드에 실패했습니다.');
    }
  };

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      toast.error('이미지를 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      setContent('');

      const formData = new FormData();
      formData.append('image', file);

      const token = await getToken();
      if (!token) {
        toast.error('로그인이 필요합니다.');
        return;
      }

      const { data } = await axios.post('/api/ai/background', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60초 타임아웃
      });

      if (data.success) {
        setContent(data.content);
        toast.success('배경 제거가 완료되었습니다!');
      } else {
        toast.error(data.message || '배경 제거에 실패했습니다.');
      }
    } catch (err: unknown) {
      console.error('배경 제거 에러:', err);

      if (isAxiosError(err) && err.response) {
        const statusCode = err.response.status;
        const errorData = err.response.data;

        let errorMessage = '배경 제거에 실패했습니다.';

        switch (statusCode) {
          case 401:
            errorMessage = '로그인이 필요합니다. 다시 로그인해주세요.';
            break;
          case 403:
            if (errorData?.message) {
              errorMessage = errorData.message;
            } else {
              errorMessage =
                '배경 제거는 프리미엄 플랜에서만 이용 가능합니다. 업그레이드해주세요.';
            }
            break;
          case 413:
            errorMessage =
              '파일 크기가 너무 큽니다. 더 작은 이미지를 선택해주세요.';
            break;
          case 415:
            errorMessage =
              '지원하지 않는 파일 형식입니다. JPG, PNG, WEBP 파일을 선택해주세요.';
            break;
          case 429:
            errorMessage =
              '무료 사용량을 모두 사용했습니다. 프리미엄으로 업그레이드하거나 내일 다시 시도해주세요.';
            break;
          case 500:
            errorMessage =
              '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            break;
          case 503:
            errorMessage =
              '서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
            break;
          default:
            errorMessage = errorData?.message || `서버 오류 (${statusCode})`;
        }

        toast.error(errorMessage);
      } else if (hasErrorCode(err) && err.code === 'ECONNABORTED') {
        toast.error('처리 시간이 초과되었습니다. 다시 시도해주세요.');
      } else if (hasErrorCode(err) && err.code === 'ERR_NETWORK') {
        toast.error('네트워크 연결을 확인해주세요.');
      } else if (hasErrorMessage(err) && err.message === 'Network Error') {
        toast.error('네트워크 연결을 확인해주세요.');
      } else {
        toast.error('예상치 못한 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // cleanup: 컴포넌트 언마운트 시 미리보기 URL 정리
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* 왼쪽 col */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#ff4938]" />
          <h1 className="text-xl font-semibold">이미지 배경 지우기</h1>
        </div>

        {/* 프리미엄 안내 */}
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-600" />
            <p className="text-sm text-red-700 font-medium">프리미엄 기능</p>
          </div>
          <p className="text-xs text-red-600 mt-1">
            배경 제거는 프리미엄 플랜에서만 이용 가능합니다.
          </p>
        </div>

        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700">
            이미지 업로드 <span className="text-red-500">*</span>
          </label>
          <input
            id="file-input"
            onChange={handleFileChange}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            type="file"
            className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
            required
            disabled={loading}
          />
          <div className="mt-1 text-xs text-gray-500">
            <p>지원 파일 형식: JPG, PNG, WEBP (최대 10MB)</p>
          </div>
        </div>

        {/* 파일 정보 표시 */}
        {file && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-red-500 hover:text-red-700 text-xs underline"
                disabled={loading}
              >
                제거
              </button>
            </div>
          </div>
        )}

        {/* 미리보기 */}
        {previewUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">미리보기</p>
            <div className="border rounded-lg overflow-hidden">
              <img
                src={previewUrl}
                alt="미리보기"
                className="w-full h-32 object-cover"
              />
            </div>
          </div>
        )}

        <button
          disabled={isSubmitDisabled}
          type="submit"
          className={`w-full flex justify-center items-center gap-2 px-4 py-2 mt-6 text-sm rounded-lg transition-all ${
            isSubmitDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#ff4938] to-[#f6ab41] text-white hover:from-[#e63946] hover:to-[#f77f00] cursor-pointer'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"></div>
              처리 중...
            </>
          ) : (
            <>
              <Eraser className="w-5" />
              배경 지우기
            </>
          )}
        </button>
      </form>

      {/* 오른쪽 col */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eraser className="w-5 h-5 text-[#ff4938]" />
            <h1 className="text-xl font-semibold">배경 제거 결과</h1>
          </div>
          {content && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              다운로드
            </button>
          )}
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Upload className="w-9 h-9" />
              <p className="text-center">
                이미지를 업로드하고 '배경 지우기'를 클릭해 시작하세요.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3 h-full flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <img
                src={content}
                alt="배경이 제거된 이미지"
                className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  console.error('이미지 로드 실패:', target.src);
                  toast.error('이미지를 불러올 수 없습니다.');
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
