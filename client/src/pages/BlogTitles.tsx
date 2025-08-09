import * as React from 'react';
import { Hash, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

import CopyButton from '@/components/common/CopyButton.tsx';
import { validateInput } from '@/utils/validation.ts';
import { type ContentResponse } from '@/type';
import { apiClient, handleApiError } from '@/utils/api.ts';

export default function BlogTitles() {
  const blogCategories = [
    '일반',
    '기술',
    '비즈니스',
    '건강',
    '라이프스타일',
    '교육',
    '여행',
    '음식',
  ];
  const [selectedCategory, setSelectedCategory] = useState('일반');
  const [input, setInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const { getToken } = useAuth();

  // 버튼 비활성화 조건
  const isSubmitDisabled = loading || !validateInput(input);

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateInput(input)) {
      toast.error('키워드를 2글자 이상 입력해주세요.');
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

      const prompt = `키워드에 맞는 제목을 생성해 주세요. ${input.trim()} 카테고리 ${selectedCategory}`;

      const { data }: { data: ContentResponse } = await apiClient.post(
        '/api/ai/title',
        { prompt },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000,
        }
      );

      if (data.success && data.content) {
        setContent(data.content);
        toast.success('제목이 생성되었습니다!');
      } else {
        toast.error(data.message || '제목 생성에 실패했습니다.');
      }
    } catch (err: unknown) {
      const errorMessage = handleApiError(err, '제목 생성');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/*왼쪽 col*/}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#8e37eb]" />
          <h1 className="text-xl font-semibold">블로그 제목 생성기</h1>
        </div>
        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700">
            키워드 <span className="text-red-500">*</span>
          </label>
          <input
            onChange={e => setInput(e.target.value)}
            value={input}
            type="text"
            className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
            placeholder="예: React.js"
            required
            disabled={loading}
            maxLength={100}
          />
          <div className="mt-1 text-xs text-gray-500 flex justify-end gap-1">
            <span>최소 2글자 이상 입력해주세요</span>
            <span>{input.length}/100</span>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700">카테고리</p>
          <div className="mt-2 flex gap-1 flex-wrap">
            {blogCategories.map(item => (
              <button
                key={item}
                type="button"
                className={`text-xs px-4 py-1 border rounded-full cursor-pointer transition-colors ${
                  selectedCategory === item
                    ? 'bg-purple-50 text-purple-700 border-purple-300'
                    : 'text-gray-500 border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setSelectedCategory(item)}
                disabled={loading}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <button
          disabled={isSubmitDisabled}
          type="submit"
          className={`w-full flex justify-center items-center gap-2 px-4 py-2 mt-6 text-sm rounded-lg transition-all ${
            isSubmitDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#8e37eb] to-[#C341f6] text-white hover:from-[#7d2dd4] hover:to-[#b534e8] cursor-pointer'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"></div>
              생성 중...
            </>
          ) : (
            <>
              <Hash className="w-5" />
              생성하기
            </>
          )}
        </button>
      </form>
      {/*오른쪽 col*/}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hash className="w-5 h-5 text-[#8e37eb]" />
            <h1 className="text-xl font-semibold">생성된 블로그 제목</h1>
          </div>
          {content && <CopyButton content={content} />}
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Hash className="w-9 h-9" />
              <p className="text-center">
                키워드를 입력하고 '생성하기'를 클릭해 시작하세요.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3 h-full flex flex-col overflow-y-scroll">
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
