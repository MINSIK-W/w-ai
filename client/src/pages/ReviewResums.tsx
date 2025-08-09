import {
  FileText,
  Sparkles,
  Lock,
  Upload,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

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
const validateResumeFile = (
  file: File
): { isValid: boolean; message?: string } => {
  // 파일 크기 제한 (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, message: '파일 크기는 5MB 이하여야 합니다.' };
  }

  // PDF 파일 형식 검증
  if (file.type !== 'application/pdf') {
    return { isValid: false, message: 'PDF 형식만 지원됩니다.' };
  }

  // 파일명 검증 (.pdf 확장자)
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return { isValid: false, message: 'PDF 파일을 선택해주세요.' };
  }

  return { isValid: true };
};

// 파일 크기 형식화 함수
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function ReviewResumes() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [content, setContent] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const { getToken } = useAuth();

  // 버튼 비활성화 조건
  const isSubmitDisabled = loading || !file;

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const validation = validateResumeFile(selectedFile);
    if (!validation.isValid) {
      toast.error(validation.message!);
      e.target.value = '';
      return;
    }

    setFile(selectedFile);
  };

  // 파일 제거 핸들러
  const handleRemoveFile = () => {
    setFile(null);
    setContent('');

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // 피드백 복사 핸들러
  const handleCopy = async () => {
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('피드백이 클립보드에 복사되었습니다!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
      toast.error('복사에 실패했습니다.');
    }
  };

  // 피드백 다운로드 핸들러
  const handleDownload = () => {
    if (!content) return;

    try {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume-feedback-${Date.now()}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('피드백이 다운로드되었습니다!');
    } catch (error) {
      console.error('다운로드 실패:', error);
      toast.error('다운로드에 실패했습니다.');
    }
  };

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      toast.error('이력서 파일을 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      setContent('');

      const formData = new FormData();
      formData.append('resume', file);

      const token = await getToken();
      if (!token) {
        toast.error('로그인이 필요합니다.');
        return;
      }

      const { data } = await axios.post('/api/ai/resumes', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      if (data.success) {
        setContent(data.content);
        toast.success('이력서 피드백이 완료되었습니다!');
      } else {
        toast.error(data.message || '이력서 피드백에 실패했습니다.');
      }
    } catch (err: unknown) {
      console.error('이력서 피드백 에러:', err);

      if (isAxiosError(err) && err.response) {
        const statusCode = err.response.status;
        const errorData = err.response.data;

        let errorMessage = '이력서 피드백에 실패했습니다.';

        switch (statusCode) {
          case 401:
            errorMessage = '로그인이 필요합니다. 다시 로그인해주세요.';
            break;
          case 403:
            if (errorData?.message) {
              errorMessage = errorData.message;
            } else {
              errorMessage =
                '이력서 피드백은 프리미엄 플랜에서만 이용 가능합니다. 업그레이드해주세요.';
            }
            break;
          case 413:
            errorMessage =
              '파일 크기가 너무 큽니다. 5MB 이하의 파일을 선택해주세요.';
            break;
          case 415:
            errorMessage = 'PDF 파일만 지원됩니다.';
            break;
          case 422:
            errorMessage =
              '이력서 파일을 읽을 수 없습니다. 다른 파일을 시도해보세요.';
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

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* 왼쪽 col */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#00Da83]" />
          <h1 className="text-xl font-semibold">이력서 피드백</h1>
        </div>

        {/* 프리미엄 안내 */}
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <p className="text-sm text-emerald-700 font-medium">
              프리미엄 기능
            </p>
          </div>
          <p className="text-xs text-emerald-600 mt-1">
            AI 이력서 피드백은 프리미엄 플랜에서만 이용 가능합니다.
          </p>
        </div>

        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700">
            이력서 업로드 <span className="text-red-500">*</span>
          </label>
          <input
            id="file-input"
            onChange={handleFileChange}
            accept="application/pdf"
            type="file"
            className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            required
            disabled={loading}
          />
          <div className="mt-1 text-xs text-gray-500">
            <p>지원 파일 형식: PDF (최대 5MB)</p>
            <p className="mt-1 text-amber-600">
              ※ 개인정보가 포함된 파일입니다. 업로드 시 주의해주세요.
            </p>
          </div>
        </div>

        {/* 파일 정보 표시 */}
        {file && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
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
                className="ml-2 text-emerald-500 hover:text-emerald-700 text-xs underline flex-shrink-0"
                disabled={loading}
              >
                제거
              </button>
            </div>
          </div>
        )}

        <button
          disabled={isSubmitDisabled}
          type="submit"
          className={`w-full flex justify-center items-center gap-2 px-4 py-2 mt-6 text-sm rounded-lg transition-all ${
            isSubmitDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#00da83] to-[#009bb3] text-white hover:from-[#00c474] hover:to-[#008a9e] cursor-pointer'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"></div>
              분석 중...
            </>
          ) : (
            <>
              <FileText className="w-5" />
              피드백 받기
            </>
          )}
        </button>
      </form>

      {/* 오른쪽 col */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[#00Da83]" />
            <h1 className="text-xl font-semibold">이력서 피드백 결과</h1>
          </div>
          {content && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              >
                {copied ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                {copied ? '복사됨' : '복사'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              >
                <Download className="w-3 h-3" />
                다운로드
              </button>
            </div>
          )}
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Upload className="w-9 h-9" />
              <p className="text-center">
                PDF 이력서를 업로드하고 '피드백 받기'를 클릭해 시작하세요.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3 h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto text-sm text-slate-600 leading-relaxed">
              <div className="reset-tw whitespace-pre-wrap">
                <Markdown>{content}</Markdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
