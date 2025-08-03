import { Hash, Sparkles } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';

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

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
        <p className="mt-6 text-sm font-medium">키워드</p>
        <input
          onChange={e => setInput(e.target.value)}
          value={input}
          type="text"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="인공지능의 미래와 그 영향에 대해..."
          required
        />
        <p className="mt-4 text-sm font-medium">카테고리</p>
        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/12">
          {blogCategories.map(item => (
            <span
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${selectedCategory === item ? 'bg-purple-50 text-purple-700' : 'text-gray-500 border-gray-300'}`}
              onClick={() => setSelectedCategory(item)}
            >
              {item}
            </span>
          ))}
        </div>
        <button className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#8e37eb] to-[#C341f6] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer">
          <Hash className="w-5" />
          생성하기
        </button>
      </form>
      {/*오른쪽 col*/}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center gap-3">
          <Hash className="w-5 h-5 text-[#8e37eb]" />
          <h1 className="text-xl font-semibold">생성된 블로그 제목</h1>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
            <Hash className="w-9 h-9" />
            <p>키워드를 입력하고 '생성하기'을 클릭해 시작하세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
