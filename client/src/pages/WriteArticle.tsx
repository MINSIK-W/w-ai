import * as React from 'react';
import { Edit, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function WriteArticle() {
  const articleLength = [
    { length: 800, text: '짧은 글자 수 (약 500 ~ 800자)' },
    { length: 1200, text: '보통 글자 수 (약 800 ~ 1200자)' },
    { length: 1600, text: '긴 글자 수 (약 1200 ~)' },
  ];
  const [selectedLength, setSelectedLength] = useState(articleLength[0]);
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
          <Sparkles className="w-6 text-[#4a7aff]" />
          <h1 className="text-xl font-semibold">글 구성 설정</h1>
        </div>
        <p className="mt-6 text-sm font-medium">글 주제</p>
        <input
          onChange={e => setInput(e.target.value)}
          value={input}
          type="text"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="인공지능의 미래와 그 영향에 대해..."
          required
        />
        <p className="mt-4 text-sm font-medium">글 길이</p>
        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/12">
          {articleLength.map((item, index) => (
            <span
              key={index}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${selectedLength.text === item.text ? 'bg-blue-50 text-blue-700' : 'text-gray-500 border-gray-300'}`}
              onClick={() => setSelectedLength(item)}
            >
              {item.text}
            </span>
          ))}
        </div>
        <button className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226bff] to-[#65adff] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer">
          <Edit className="w-5" />글 생성
        </button>
      </form>
      {/*오른쪽 col*/}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]">
        <div className="flex items-center gap-3">
          <Edit className="w-5 h-5 text-[#4a7aff]" />
          <h1 className="text-xl font-semibold">글 생성</h1>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
            <Edit className="w-9 h-9 " />
            <p>주제를 입력하고 '글 생성'을 클릭해 시작하세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
