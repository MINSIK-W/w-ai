import { useState } from 'react';
import * as React from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { Sparkles, Image, Lock } from 'lucide-react';

axios.defaults.baseURL =
  import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

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

const validateInput = (input: string): boolean => {
  return input.trim().length >= 3;
};

export default function GenerateImages() {
  const imageStyle = [
    '현대적',
    '지브리',
    '애니메이션',
    '작화',
    '판타지',
    '미래적',
    '3D',
    '초상화',
  ] as const;

  const [selectedStyle, setSelectedStyle] = useState<string>('현대적');
  const [input, setInput] = useState<string>('');
  const [publish, setPublish] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [content, setContent] = useState<string>('');

  const { getToken } = useAuth();

  // 버튼 비활성화 조건
  const isSubmitDisabled = loading || !validateInput(input);

  // 입력값 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setInput(value);
    }
  };

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateInput(input)) {
      toast.error('이미지 설명을 3글자 이상 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setContent('');

      // 올바른 프롬프트 구성
      const prompt = `이미지를 생성하세요. ${input.trim()} 해당 스타일로 ${selectedStyle}`;

      const token = await getToken();
      if (!token) {
        toast.error('로그인이 필요합니다.');
        return;
      }

      const { data } = await axios.post(
        '/api/ai/images',
        { prompt, publish },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 60000, // 60초 타임아웃
        }
      );

      if (data.success) {
        setContent(data.content);
        toast.success('이미지가 생성되었습니다!');
      } else {
        toast.error(data.message || '이미지 생성에 실패했습니다.');
      }
    } catch (err: unknown) {
      console.error('이미지 생성 에러:', err);

      if (isAxiosError(err) && err.response) {
        const statusCode = err.response.status;
        const errorData = err.response.data;

        let errorMessage = '이미지 생성에 실패했습니다.';

        switch (statusCode) {
          case 401:
            errorMessage = '로그인이 필요합니다. 다시 로그인해주세요.';
            break;
          case 403:
            // 무료 플랜 제한 또는 권한 없음
            if (errorData?.message) {
              errorMessage = errorData.message;
            } else {
              errorMessage =
                '이미지 생성은 프리미엄 플랜에서만 이용 가능합니다. 업그레이드해주세요.';
            }
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
        toast.error('이미지 생성 시간이 초과되었습니다. 다시 시도해주세요.');
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
          <Sparkles className="w-6 text-[#00ad25]" />
          <h1 className="text-xl font-semibold">이미지 만들기</h1>
        </div>

        {/* 프리미엄 안내 */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            <p className="text-sm text-amber-700 font-medium">프리미엄 기능</p>
          </div>
          <p className="text-xs text-amber-600 mt-1">
            이미지 생성은 프리미엄 플랜에서만 이용 가능합니다.
          </p>
        </div>

        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700">
            이미지 설명 <span className="text-red-500">*</span>
          </label>
          <p className="mt-1 text-xs text-gray-500">
            상상하는 모든 것을 작성하여 이미지를 만들어 보세요.
          </p>
          <textarea
            onChange={handleInputChange}
            rows={4}
            value={input}
            className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors resize-none"
            placeholder="예: 설산에서 떠오르는 일출, 아름다운 구름과 함께..."
            required
            disabled={loading}
            maxLength={500}
          />
          <div className="mt-1 text-xs text-gray-500 flex justify-between">
            <span>최소 3글자 이상 입력해주세요</span>
            <span>{input.length}/500</span>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700">이미지 스타일</p>
          <div className="mt-3 flex gap-3 flex-wrap">
            {imageStyle.map(item => (
              <button
                key={item}
                type="button"
                className={`text-xs px-4 py-1 border rounded-full cursor-pointer transition-colors ${
                  selectedStyle === item
                    ? 'bg-green-50 text-green-700 border-green-300'
                    : 'text-gray-500 border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setSelectedStyle(item)}
                disabled={loading}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="my-6 flex items-center gap-3">
          <label className="relative cursor-pointer">
            <input
              type="checkbox"
              onChange={e => setPublish(e.target.checked)}
              checked={publish}
              disabled={loading}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-500 transition peer-disabled:opacity-50"></div>
            <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4"></span>
          </label>
          <div>
            <p className="text-sm font-medium text-gray-700">
              이미지 공개 여부
            </p>
            <p className="text-xs text-gray-500">
              다른 사용자들이 볼 수 있게 됩니다
            </p>
          </div>
        </div>

        <button
          disabled={isSubmitDisabled}
          type="submit"
          className={`w-full flex justify-center items-center gap-2 px-4 py-2 mt-6 text-sm rounded-lg transition-all ${
            isSubmitDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#00ad25] to-[#04ff50] text-white hover:from-[#009922] hover:to-[#03e047] cursor-pointer'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"></div>
              생성 중...
            </>
          ) : (
            <>
              <Image className="w-5" />
              이미지 만들기
            </>
          )}
        </button>
      </form>

      {/* 오른쪽 col */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center gap-3">
          <Image className="w-5 h-5 text-[#00ad25]" />
          <h1 className="text-xl font-semibold">생성된 이미지</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Image className="w-9 h-9" />
              <p className="text-center">
                주제를 입력하고 '이미지 만들기'를 클릭해 시작하세요.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3 h-full flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <img
                src={content}
                alt="생성된 이미지"
                className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                onError={e => {
                  console.error('이미지 로드 실패:', e);
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
