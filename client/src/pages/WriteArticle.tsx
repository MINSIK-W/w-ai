import * as React from 'react';
import { Edit, Sparkles, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

import CopyButton from '@/components/common/CopyButton.tsx';
import { apiClient, handleApiError } from '@/utils/api';
import { validateInput } from '@/utils/validation';
import { formatNumber } from '@/utils/format';
import type { ContentResponse } from '@/type';

// 글 길이 설정 타입
interface ArticleLength {
  length: number;
  text: string;
}

export default function WriteArticle() {
  const articleLength: ArticleLength[] = [
    { length: 800, text: '짧은 글자(약 500 ~ 800자)' },
    { length: 1200, text: '보통 글자(약 800 ~ 1200자)' },
    { length: 1600, text: '긴 글자(약 1200 ~)' },
  ];

  const [selectedLength, setSelectedLength] = useState<ArticleLength>(
    articleLength[0]
  );
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [content, setContent] = useState<string>('');
  const [usage, setUsage] = useState<number | null>(null);

  const { getToken } = useAuth();

  // 버튼 비활성화 조건
  const isSubmitDisabled = loading || !validateInput(input, 5);

  // 입력값 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 200) {
      setInput(value);
    }
  };

  // 폼 제출 핸들러
  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateInput(input, 5)) {
      toast.error('글 주제를 5글자 이상 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setContent('');

      const token = await getToken();
      if (!token) {
        toast.error('로그인이 필요합니다.');
        return;
      }

      const { data }: { data: ContentResponse } = await apiClient.post(
        '/api/ai/article',
        {
          prompt: input.trim(),
          length: selectedLength.length,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 60000,
        }
      );

      if (data.success && data.content) {
        setContent(data.content);
        setUsage(data.usage || null);
        toast.success('글이 성공적으로 생성되었습니다!');
      } else {
        const errorMessage = data.message || '글 생성에 실패했습니다.';
        toast.error(errorMessage);

        // 특정 에러 코드 처리
        if (data.code === '사용 제한 초과') {
          toast.error(
            '무료 사용량을 모두 사용했습니다. 프리미엄으로 업그레이드해주세요.'
          );
        }
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error, '글 생성');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* 왼쪽 입력 폼 */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#4a7aff]" />
          <h1 className="text-xl font-semibold">글 구성 설정</h1>
        </div>

        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700">
            글 주제 <span className="text-red-500">*</span>
          </label>
          <input
            onChange={handleInputChange}
            value={input}
            type="text"
            className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            placeholder="예: 인공지능의 미래와 그 영향에 대해..."
            required
            maxLength={200}
            disabled={loading}
          />
          <div className="mt-1 text-xs text-gray-500 flex justify-between">
            <span>최소 5글자 이상 입력해주세요</span>
            <span>{input.length}/200자</span>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700">글 길이</label>
          <div className="mt-3 flex gap-1 flex-wrap">
            {articleLength.map((item, index) => (
              <button
                type="button"
                key={index}
                className={`text-xs px-4 py-2 border rounded-full cursor-pointer transition-colors ${
                  selectedLength.text === item.text
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'text-gray-500 border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setSelectedLength(item)}
                disabled={loading}
              >
                {item.text}
              </button>
            ))}
          </div>
        </div>

        {usage !== null && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                무료 사용량: {usage}/10회
              </span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className={`w-full flex justify-center items-center gap-2 px-4 py-2 mt-6 text-sm rounded-lg transition-all ${
            isSubmitDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#226bff] to-[#65adff] text-white hover:from-[#1e5ce6] hover:to-[#5ba3ff] cursor-pointer'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"></div>
              생성 중...
            </>
          ) : (
            <>
              <Edit className="w-5" />글 생성
            </>
          )}
        </button>
      </form>

      {/* 오른쪽 결과 표시 */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 shadow-sm min-h-96 max-h-[600px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Edit className="w-5 h-5 text-[#4a7aff]" />
            <h1 className="text-xl font-semibold">생성된 글</h1>
          </div>
          {content && <CopyButton content={content} />}
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Edit className="w-9 h-9" />
              <p className="text-center">
                주제를 입력하고 '글 생성'을 클릭해 시작하세요.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3 h-full flex flex-col overflow-y-scroll">
            <div className="text-xs text-gray-500 mb-2">
              생성된 글자 수: {formatNumber(content.length)}자
            </div>
            <div className="flex-1 overflow-y-scroll text-sm text-slate-600 leading-relaxed">
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
